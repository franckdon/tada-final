"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// apps/api/src/app.ts
const openapi_1 = require("./openapi");
const swagger_ui_1 = require("@hono/swagger-ui");
const auth_routes_1 = require("./routes/v1/mobile/auth.routes");
const user_routes_1 = require("./routes/v1/mobile/user.routes");
const missions_routes_1 = require("./routes/v1/mobile/missions.routes");
const missions_details_routes_1 = require("./routes/v1/mobile/missions.details.routes");
const surveys_routes_1 = require("./routes/v1/mobile/surveys/surveys.routes");
const missions_surveys_routes_1 = require("./routes/v1/mobile/missions.surveys.routes");
const responses_routes_1 = require("./routes/v1/mobile/surveys/responses.routes");
const support_routes_1 = require("./routes/v1/mobile/support/support.routes");
const account_routes_1 = require("./routes/v1/mobile/account/account.routes");
const payout_accounts_routes_1 = require("./routes/v1/mobile/payout-accounts/payout-accounts.routes");
const reward_routes_1 = require("./routes/v1/mobile/rewards/profile-modules/reward.routes");
const modules_routes_1 = require("./routes/v1/mobile/contributor/modules/modules.routes");
const withdrawals_routes_1 = require("./routes/v1/mobile/withdrawals/withdrawals.routes");
exports.app = openapi_1.openapi;
// Health
exports.app.get("/health", (c) => c.json({ ok: true }));
exports.app.notFound((c) => {
    console.log("[HONO 404]", c.req.method, c.req.path);
    return c.json({ error: "Not Found", path: c.req.path }, 404);
});
exports.app.get("/__routes", (c) => c.json({
    ok: true,
    hint: "If you see this, you are running the expected build"
}));
// Routes API
exports.app.route("/v1/mobile/auth", auth_routes_1.mobileAuthRoutes);
exports.app.route("/v1/mobile/user", user_routes_1.mobileUserRoutes);
exports.app.route("/v1/mobile/missions", missions_routes_1.mobileMissionsRoutes);
exports.app.route("/v1/mobile/missions", missions_details_routes_1.mobileMissionDetailsRoutes);
exports.app.route("/v1/mobile/surveys", surveys_routes_1.mobileSurveysRoutes);
exports.app.route("/v1/mobile/missions", missions_surveys_routes_1.mobileMissionSurveysRoutes);
exports.app.route("/v1/mobile/surveys", responses_routes_1.mobileSurveyResponsesRoutes);
// new routes
exports.app.route("/v1/mobile/support", support_routes_1.mobileSupportRoutes);
exports.app.route("/v1/mobile/account", account_routes_1.mobileAccountRoutes);
exports.app.route("/v1/mobile/payout-accounts", payout_accounts_routes_1.mobilePayoutAccountsRoutes);
// rewards
exports.app.route("/v1/mobile/contributor/modules", modules_routes_1.contributorModulesRoutes);
exports.app.route("/v1/mobile/rewards/profile-modules", reward_routes_1.profileModulesRewardsRoutes);
// withdrawals
exports.app.route("/v1/mobile/withdrawals", withdrawals_routes_1.mobileWithdrawalsRoutes);
// Swagger UI
exports.app.get("/docs", (0, swagger_ui_1.swaggerUI)({
    url: "/openapi.json",
}));
// JSON OpenAPI
exports.app.doc("/openapi.json", {
    openapi: "3.0.3",
    info: {
        title: "Tada Mobile API",
        version: "1.0.0",
    },
});
exports.default = exports.app;
