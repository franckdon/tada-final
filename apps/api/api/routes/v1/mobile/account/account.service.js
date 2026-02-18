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
exports.getBalance = getBalance;
exports.creditUserWallet = creditUserWallet;
const repo = __importStar(require("./account.repo"));
const db_1 = require("../../../../lib/db");
async function getBalance(userId, q) {
    const row = await repo.findWalletAccountBalance({ userId, providerId: q.providerId });
    if (!row) {
        return {
            ok: true,
            data: {
                userId,
                accountPkId: "",
                providerId: q.providerId ?? "none",
                balance: 0,
                balanceRaw: "0",
                currency: "XOF",
            },
        };
    }
    const balanceRaw = row.balance ?? "0";
    const asNumber = Number(balanceRaw);
    const safeNumber = Number.isSafeInteger(asNumber) ? asNumber : 0;
    return {
        ok: true,
        data: {
            userId,
            accountPkId: row.id,
            providerId: row.providerId,
            balance: safeNumber,
            balanceRaw,
            currency: row.currency ?? "XOF",
        },
    };
}
async function creditUserWallet(userId, body) {
    // amount en bigint string
    const amountRaw = String(body.amount);
    await db_1.db.query("BEGIN");
    try {
        const acc = await repo.findAccountForUpdate({
            userId,
            providerId: body.providerId,
        });
        if (!acc) {
            await db_1.db.query("ROLLBACK");
            return { ok: false, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };
        }
        const r = await repo.creditAccountInTx({
            accountPkId: acc.id,
            amount: amountRaw,
            currency: body.currency ?? acc.currency ?? "XOF",
            reason: body.reason,
            description: body.description,
            referenceType: body.referenceType,
            referenceId: body.referenceId,
            idempotencyKey: body.idempotencyKey,
        });
        await db_1.db.query("COMMIT");
        return {
            ok: true,
            data: {
                userId,
                accountPkId: acc.id,
                providerId: acc.providerId,
                currency: body.currency ?? acc.currency ?? "XOF",
                amountRaw,
                balanceAfterRaw: r.balanceAfter,
                txId: r.txId,
                idempotencyKey: body.idempotencyKey,
                kind: r.kind,
            },
        };
    }
    catch (e) {
        await db_1.db.query("ROLLBACK");
        throw e;
    }
}
