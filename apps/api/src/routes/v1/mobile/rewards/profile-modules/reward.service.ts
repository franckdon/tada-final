import * as modulesRepo from "../../contributor/modules/modules.repo";
import * as modulesService from "../../contributor/modules/modules.service";
import { MODULES } from "../../contributor/modules/modules.config";
import * as rewardsRepo from "./reward.repo";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

function isUuidLike(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

/**
 * Statut de paiement de la reward (module complété à 100%).
 * - isPaid = points_awarded > 0 OR tx ledger existe
 */
export async function getModuleRewardStatus(params: {
  userId: string;
  moduleKey: keyof typeof MODULES;
}): Promise<ServiceResult<any>> {
  const { userId, moduleKey } = params;

  const cfg = MODULES[moduleKey];
  if (!cfg) return { ok: false, status: 404, message: "Module inconnu" };

  // refresh progress + lock/unlock
  await modulesService.getAllProgress(userId);

  const progress = await modulesRepo.getModuleProgress(userId, moduleKey as any);
  if (!progress) return { ok: false, status: 404, message: "Progression introuvable" };

  const isRewardable = cfg.rewardXof > 0;
  const isCompleted = progress.status === "completed" && progress.completionPercent >= 100;

  // signal “métier”
  const paidByProgress = !!(progress.pointsAwarded && progress.pointsAwarded > 0);

  // signal “ledger”
  let paidByLedger = false;
  let txId: string | null = null;

  if (isRewardable && isCompleted && isUuidLike(progress.id)) {
    const tx = await rewardsRepo.findLedgerCreditByReference({
      referenceType: "profile_module",
      referenceId: progress.id,
    });
    if (tx) {
      paidByLedger = true;
      txId = tx.txId;
    }
  }

  const isPaid = isRewardable && isCompleted && (paidByProgress || paidByLedger);

  return {
    ok: true,
    data: {
      ok: true,
      moduleKey,
      isRewardable,
      rewardXof: cfg.rewardXof,
      isCompleted,
      completionPercent: progress.completionPercent,

      // paiement
      isPaid,
      paidSignals: {
        byProgress: paidByProgress,
        byLedger: paidByLedger,
      },
      pointsAwarded: progress.pointsAwarded ?? 0,
      txId,

      // debug utile côté mobile
      progressId: progress.id,
      status: progress.status,
    },
  };
}
