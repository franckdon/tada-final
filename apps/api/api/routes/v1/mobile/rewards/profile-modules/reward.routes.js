"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileModulesRewardsRoutes = void 0;
const hono_1 = require("hono");
const zod_1 = require("zod");
const mobile_errors_1 = require("../../mobile.errors");
const requireMobileAuth_1 = require("../../../../../middleware/requireMobileAuth");
const reward_schemas_1 = require("./reward.schemas");
const rewards_service_1 = require("./rewards.service");
const modules_config_1 = require("../../contributor/modules/modules.config");
exports.profileModulesRewardsRoutes = new hono_1.Hono();
exports.profileModulesRewardsRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE PROFILE MODULE REWARDS ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
function parseModuleKey(raw) {
    const key = raw;
    return modules_config_1.DEFAULT_MODULES[key] ? key : null;
}
/**
 * GET /v1/mobile/rewards/profile-modules/:moduleKey/reward-status
 * Body optionnel: { providerId }
 * (si tu veux absolument un GET avec body comme avant, on le supporte en essayant safeJson)
 */
exports.profileModulesRewardsRoutes.get("/:moduleKey/reward-status", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const moduleKeyRaw = c.req.param("moduleKey");
    const moduleKey = parseModuleKey(moduleKeyRaw);
    if (!moduleKey)
        return c.json({ error: "Module inconnu" }, 404);
    // GET body: pas standard, mais tu as dit que tu le faisais avant
    const providerIdRaw = c.req.query("providerId");
    const providerId = typeof providerIdRaw === "string" && providerIdRaw.length > 0 ? providerIdRaw : undefined;
    const r = await (0, rewards_service_1.getModuleRewardStatus)({ userId, moduleKey, providerId });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
/**
 * POST /v1/mobile/rewards/profile-modules/:moduleKey/claim
 * Body: { providerId?, idempotencyKey? }
 */
exports.profileModulesRewardsRoutes.post("/:moduleKey/claim", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const moduleKeyRaw = c.req.param("moduleKey");
    const moduleKey = parseModuleKey(moduleKeyRaw);
    if (!moduleKey)
        return c.json({ error: "Module inconnu" }, 404);
    const body = await (0, mobile_errors_1.safeJson)(c);
    const input = reward_schemas_1.claimRewardSchema.parse(body);
    const r = await (0, rewards_service_1.claimModuleReward)({
        userId,
        moduleKey,
        providerId: input.providerId,
        idempotencyKey: input.idempotencyKey,
    });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
