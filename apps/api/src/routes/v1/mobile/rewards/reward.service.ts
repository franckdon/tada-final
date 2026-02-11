// apps/api/src/routes/v1/mobile/rewards/profile-modules/rewards.service.ts
import * as modulesRepo from "../contributor/modules/modules.repo";
import * as modulesService from "../contributor/modules/modules.service";
import { MODULES } from "../contributor/modules/modules.config";
import * as rewardsRepo from "./reward.repo";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

function isUuidLike(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export async function claimModuleReward(params: {
  userId: string;
  moduleKey: keyof typeof MODULES;
  providerId?: string;
  idempotencyKey?: string;
}): Promise<ServiceResult<any>> {
  const { userId, moduleKey, providerId } = params;

  const cfg = MODULES[moduleKey];
  if (!cfg) return { ok: false, status: 404, message: "Module inconnu" };

  // personal_info => pas récompensé
  if (cfg.rewardXof <= 0) {
    return { ok: false, status: 400, message: "Ce module n'est pas récompensable" };
  }

  // recalcul + lock/unlock à jour
  await modulesService.getAllProgress(userId);

  const progress = await modulesRepo.getModuleProgress(userId, moduleKey);
  if (!progress) return { ok: false, status: 404, message: "Progression introuvable" };

  if (progress.status !== "completed" || progress.completionPercent < 100) {
    return { ok: false, status: 409, message: "Module non complété à 100%" };
  }

  if (progress.pointsAwarded && progress.pointsAwarded > 0) {
    return { ok: true, data: { ok: true, alreadyRewarded: true, pointsAwarded: progress.pointsAwarded } };
  }

  // wallet
  const wallet = await modulesRepo.findWalletAccount({ userId, providerId });
  if (!wallet) return { ok: false, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };

  // idempotency: par défaut = stable
  const idem =
    params.idempotencyKey ??
    `reward:${moduleKey}:${userId}:${progress.id}`;

  // referenceId = progress.id (uuid text)
  if (!isUuidLike(progress.id)) {
    // si ton id est text uuid ok, sinon ajuste la table
    return { ok: false, status: 500, message: "referenceId invalide (progress id n'est pas un uuid)" };
  }

  const amount = String(cfg.rewardXof);

  const ledger = await rewardsRepo.insertLedgerCredit({
    accountPkId: wallet.id,
    amount,
    currency: wallet.currency ?? "XOF",
    reason: "profile_module_reward",
    description: `Reward module ${moduleKey}`,
    referenceType: "profile_module",
    referenceId: progress.id,
    idempotencyKey: idem,
  });

  // marquer récompensé (anti double reward côté module aussi)
  await modulesRepo.markModuleRewarded({
    userId,
    moduleKey,
    pointsAwarded: cfg.rewardXof,
  });

  return {
    ok: true,
    data: {
      ok: true,
      moduleKey,
      rewardXof: cfg.rewardXof,
      txId: ledger.txId,
      balanceAfter: ledger.balanceAfter,
      idempotencyKey: idem,
    },
  };
}
