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
exports.createWithdrawalRequest = createWithdrawalRequest;
exports.cancelWithdrawalRequest = cancelWithdrawalRequest;
exports.listUserWithdrawals = listUserWithdrawals;
const db_1 = require("../../../../lib/db");
const accountRepo = __importStar(require("../account/account.repo"));
const repo = __importStar(require("./withdrawals.repo"));
const MIN_WITHDRAWAL_XOF = 3000;
async function createWithdrawalRequest(userId, body) {
    if (body.amount < MIN_WITHDRAWAL_XOF) {
        return {
            ok: false,
            status: 400,
            message: `Le montant minimum de retrait est ${MIN_WITHDRAWAL_XOF} XOF`,
        };
    }
    // idempotency: si fourni, renvoyer la demande existante
    if (body.idempotencyKey) {
        const existing = await repo.findWithdrawalByIdempotencyKey({
            userId,
            idempotencyKey: body.idempotencyKey,
        });
        if (existing) {
            return {
                ok: true,
                data: {
                    id: existing.id,
                    userId: existing.userId,
                    accountPkId: existing.accountPkId,
                    payoutAccountId: existing.payoutAccountId,
                    amountRaw: existing.amount,
                    currency: existing.currency,
                    status: existing.status,
                    createdAt: existing.createdAt,
                },
            };
        }
    }
    await db_1.db.query("BEGIN");
    try {
        // 1) lock wallet account (anti-race)
        const acc = await accountRepo.findAccountForUpdate({
            userId,
            providerId: body.providerId,
        });
        if (!acc) {
            await db_1.db.query("ROLLBACK");
            return { ok: false, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };
        }
        const currency = body.currency ?? acc.currency ?? "XOF";
        if (currency !== "XOF") {
            await db_1.db.query("ROLLBACK");
            return { ok: false, status: 400, message: "Seuls les retraits en XOF sont supportés pour le moment" };
        }
        // 2) payout account belongs to user
        const payout = await repo.findPayoutAccountForUser({
            userId,
            payoutAccountId: body.payoutAccountId,
        });
        if (!payout) {
            await db_1.db.query("ROLLBACK");
            return { ok: false, status: 404, message: "Compte de paiement introuvable" };
        }
        // 3) available = balance - reserved(pending+approved)
        const balanceRaw = acc.balance ?? "0";
        const reservedRaw = await repo.sumReservedWithdrawalsInTx({
            userId,
            accountPkId: acc.id,
        });
        const balance = BigInt(balanceRaw);
        const reserved = BigInt(reservedRaw ?? "0");
        const amount = BigInt(String(body.amount));
        const available = balance - reserved;
        if (amount > available) {
            await db_1.db.query("ROLLBACK");
            return {
                ok: false,
                status: 409,
                message: "Solde insuffisant",
            };
        }
        // 4) create request pending + snapshot payout
        const payoutSnapshot = {
            type: payout.type,
            label: payout.label,
            provider: payout.provider,
            country: payout.country,
            dialCode: payout.dialCode,
            phone: payout.phone,
            bankName: payout.bankName,
            rib: payout.rib,
            iban: payout.iban,
            bic: payout.bic,
            isDefault: payout.isDefault,
        };
        const w = await repo.insertWithdrawalRequestInTx({
            userId,
            accountPkId: acc.id,
            payoutAccountId: payout.id,
            amount: amount.toString(),
            currency: "XOF",
            idempotencyKey: body.idempotencyKey,
            payoutSnapshot,
        });
        await db_1.db.query("COMMIT");
        return {
            ok: true,
            data: {
                id: w.id,
                userId: w.userId,
                accountPkId: w.accountPkId,
                payoutAccountId: w.payoutAccountId,
                amountRaw: w.amount,
                currency: w.currency,
                status: w.status,
                createdAt: w.createdAt,
            },
        };
    }
    catch (e) {
        await db_1.db.query("ROLLBACK");
        throw e;
    }
}
async function cancelWithdrawalRequest(userId, withdrawalId) {
    await db_1.db.query("BEGIN");
    try {
        const w = await repo.findWithdrawalByIdForUpdate({ id: withdrawalId, userId });
        if (!w) {
            await db_1.db.query("ROLLBACK");
            return { ok: false, status: 404, message: "Demande de retrait introuvable" };
        }
        if (w.status !== "pending") {
            await db_1.db.query("ROLLBACK");
            return {
                ok: false,
                status: 409,
                message: "Annulation impossible: seule une demande en statut pending peut être annulée",
            };
        }
        const canceled = await repo.cancelWithdrawalInTx({ id: withdrawalId, userId });
        await db_1.db.query("COMMIT");
        return {
            ok: true,
            data: {
                id: canceled.id,
                status: canceled.status,
                updatedAt: canceled.updatedAt,
            },
        };
    }
    catch (e) {
        await db_1.db.query("ROLLBACK");
        throw e;
    }
}
async function listUserWithdrawals(userId, q) {
    const rows = await repo.listWithdrawals({
        userId,
        status: q.status,
        limit: q.limit,
        offset: q.offset,
    });
    return {
        ok: true,
        data: {
            items: rows.map((r) => ({
                id: r.id,
                amountRaw: r.amount,
                currency: r.currency,
                status: r.status,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                payoutAccountId: r.payoutAccountId,
            })),
            limit: q.limit,
            offset: q.offset,
        },
    };
}
