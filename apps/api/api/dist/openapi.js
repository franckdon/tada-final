"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapi = void 0;
// apps/api/src/openapi.ts
const zod_openapi_1 = require("@hono/zod-openapi");
exports.openapi = new zod_openapi_1.OpenAPIHono();
// JSON OpenAPI
exports.openapi.doc("/openapi.json", {
    openapi: "3.0.3",
    info: {
        title: "Tada Mobile API",
        version: "1.0.0",
    },
});
