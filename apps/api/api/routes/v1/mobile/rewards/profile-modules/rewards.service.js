"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleRewardStatus = getModuleRewardStatus;
exports.claimModuleReward = claimModuleReward;
const db_1 = require("../../../../../lib/db");
const modulesRepo = __importStar(require("../../contributor/modules/modules.repo"));
const modulesService = __importStar(require("../../contributor/modules/modules.service"));
const modules_config_1 = require("../../contributor/modules/modules.config");
const rewardsRepo = __importStar(require("./rewards.repo"));
function isUuidLike(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}
async function getRuntimeModuleConfig(moduleKey) {
    // 1) base fonctionnelle : le module doit exister dans DEFAULT_MODULES
    if (!modules_config_1.DEFAULT_MODULES[moduleKey])
        return null;
    // 2) runtime DB-first (montant + activation)
    const r = await db_1.db.query(`
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
    `, [moduleKey]);
    const row = r.rows[0];
    return (0, modules_config_1.mergeRuntimeConfig)(moduleKey, row ?? undefined);
}
async function getModuleRewardStatus(params) {
    const { userId, moduleKey, providerId } = params;
    // module known ?
    if (!modules_config_1.DEFAULT_MODULES[moduleKey]) {
        return { ok: false, status: 404, message: "Module inconnu" };
    }
    // runtime config (DB-first)
    const cfg = await getRuntimeModuleConfig(moduleKey);
    if (!cfg)
        return { ok: false, status: 404, message: "Module inconnu" };
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
async function claimModuleReward(params) {
    const { userId, moduleKey, providerId } = params;
    // module known ?
    if (!modules_config_1.DEFAULT_MODULES[moduleKey]) {
        return { ok: false, status: 404, message: "Module inconnu" };
    }
    const cfg = await getRuntimeModuleConfig(moduleKey);
    if (!cfg)
        return { ok: false, status: 404, message: "Module inconnu" };
    if (!cfg.isActive) {
        return { ok: false, status: 400, message: "Ce module est désactivé et n'est pas récompensable" };
    }
    if (cfg.rewardXof <= 0) {
        return { ok: false, status: 400, message: "Ce module n'est pas récompensable" };
    }
    // recalcul + lock/unlock à jour
    await modulesService.getAllProgress(userId);
    const progress = await modulesRepo.getModuleProgress(userId, moduleKey);
    if (!progress)
        return { ok: false, status: 404, message: "Progression introuvable" };
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
    if (!wallet)
        return { ok: false, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };
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
