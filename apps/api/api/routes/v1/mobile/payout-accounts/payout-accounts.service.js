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
exports.listPayoutAccounts = listPayoutAccounts;
exports.createPayoutAccount = createPayoutAccount;
exports.setDefaultPayoutAccount = setDefaultPayoutAccount;
exports.deletePayoutAccount = deletePayoutAccount;
const repo = __importStar(require("./payout-accounts.repo"));
async function listPayoutAccounts(userId, q) {
    const rows = await repo.listByUser({ userId, includeDeleted: q.includeDeleted });
    return {
        ok: true,
        data: { items: rows },
    };
}
async function createPayoutAccount(userId, body) {
    const row = await repo.createForUser({ userId, body });
    return {
        ok: true,
        data: { item: row },
    };
}
async function setDefaultPayoutAccount(userId, id) {
    try {
        await repo.setDefault({ userId, id });
        return { ok: true, data: { ok: true } };
    }
    catch (e) {
        if (e?.code === "NOT_FOUND" || e?.message === "NOT_FOUND") {
            return { ok: false, status: 404, message: "Compte introuvable" };
        }
        throw e;
    }
}
async function deletePayoutAccount(userId, id) {
    try {
        await repo.softDelete({ userId, id });
        return { ok: true, data: { ok: true } };
    }
    catch (e) {
        if (e?.code === "NOT_FOUND" || e?.message === "NOT_FOUND") {
            return { ok: false, status: 404, message: "Compte introuvable" };
        }
        throw e;
    }
}
