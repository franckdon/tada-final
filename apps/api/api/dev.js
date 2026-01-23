"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/dev.ts
const node_server_1 = require("@hono/node-server");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./env");
const port = Number(env_1.env.API_PORT ?? 4000);
console.log(`[API] Listening on http://localhost:${port}`);
(0, node_server_1.serve)({
    fetch: app_1.default.fetch,
    port,
});
