import { db } from "../../../../../lib/db";

import * as modulesRepo from "../../contributor/modules/modules.repo";
import * as modulesService from "../../contributor/modules/modules.service";
import {
  DEFAULT_MODULES,
  type ModuleKey,
  mergeRuntimeConfig,
} from "../../contributor/modules/modules.config";

import * as rewardsRepo from "./rewards.repo";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

function isUuidLike(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

type DbModuleRewardConfigRow = {
  moduleKey: string;
  moduleLabel: string | null;
  order: number | null;
  rewardXof: number | null;
  isActive: boolean | null;
  dependsOn: string | null;
};

async function getRuntimeModuleConfig(moduleKey: ModuleKey) {
  // 1) base fonctionnelle : le module doit exister dans DEFAULT_MODULES
  if (!DEFAULT_MODULES[moduleKey]) return null;

  // 2) runtime DB-first (montant + activation)
  const r = await db.query<DbModuleRewardConfigRow>(
    `
    select
      module_key as "moduleKey",
      module_label as "moduleLabel",
      "order" as "order",
      reward_xof as "rewardXof",
      is_active as "isActive",
      depends_on as "dependsOn"
    from contributor_module_reward_config
    where module_key = $1::text
    limit 1
    `,
    [moduleKey],
  );

  const row = r.rows[0];
  return mergeRuntimeConfig(moduleKey, row ?? undefined);
}

export async function getModuleRewardStatus(params: {
  userId: string;
  moduleKey: ModuleKey;
  providerId?: string;
}): Promise<ServiceResult<any>> {
  const { userId, moduleKey, providerId } = params;

  // module known ?
  if (!DEFAULT_MODULES[moduleKey]) {
    return { ok: false, status: 404, message: "Module inconnu" };
  }

  // runtime config (DB-first)
  const cfg = await getRuntimeModuleConfig(moduleKey);
  if (!cfg) return { ok: false, status: 404, message: "Module inconnu" };

  // refresh progress (verrouillage + %)
  await modulesService.getAllProgress(userId);

  const progress = await modulesRepo.getModuleProgress(userId, moduleKey);

  // wallet (optionnel ici, mais utile pour dire “claimable”)
  const wallet = await modulesRepo.findWalletAccount({ userId, providerId });

  const completed = Boolean(progress && progress.status === "completed" && progress.completionPercent >= 100);
  const alreadyRewarded = Boolean(progress && progress.pointsAwarded && progress.pointsAwarded > 0);

  const rewardable = cfg.isActive && cfg.rewardXof > 0;
  const claimable = rewardable && completed && !alreadyRewarded && Boolean(wallet);

  return {
    ok: true,
    data: {
      ok: true,
      moduleKey,
      // info runtime (montant)
      rewardXof: cfg.rewardXof,
      isActive: cfg.isActive,
      // état user/module
      completed,
      completionPercent: progress?.completionPercent ?? 0,
      alreadyRewarded,
      pointsAwarded: progress?.pointsAwarded ?? 0,
      // wallet
      hasWallet: Boolean(wallet),
      walletCurrency: wallet?.currency ?? null,
      // décision
      claimable,
      reason: !rewardable
        ? "not_rewardable"
        : !completed
        ? "not_completed"
        : alreadyRewarded
        ? "already_rewarded"
        : !wallet
        ? "no_wallet"
        : "ok",
    },
  };
}

export async function claimModuleReward(params: {
  userId: string;
  moduleKey: ModuleKey;
  providerId?: string;
  idempotencyKey?: string;
}): Promise<ServiceResult<any>> {
  const { userId, moduleKey, providerId } = params;

  // module known ?
  if (!DEFAULT_MODULES[moduleKey]) {
    return { ok: false, status: 404, message: "Module inconnu" };
  }

  const cfg = await getRuntimeModuleConfig(moduleKey);
  if (!cfg) return { ok: false, status: 404, message: "Module inconnu" };

  if (!cfg.isActive) {
    return { ok: false, status: 400, message: "Ce module est désactivé et n'est pas récompensable" };
  }

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
    return {
      ok: true,
      data: {
        ok: true,
        alreadyRewarded: true,
        moduleKey,
        rewardXof: progress.pointsAwarded,
      },
    };
  }

  // wallet
  const wallet = await modulesRepo.findWalletAccount({ userId, providerId });
  if (!wallet) return { ok: false, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };

  // idempotency stable par défaut
  const idem = params.idempotencyKey ?? `reward:${moduleKey}:${userId}:${progress.id}`;

  // referenceId = progress.id (uuid)
  if (!isUuidLike(progress.id)) {
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
      kind: ledger.kind,
    },
  };
}
