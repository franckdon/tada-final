// apps/api/api/openapi.js
const { OpenAPIHono } = require("@hono/zod-openapi");

const openapi = new OpenAPIHono();

// JSON OpenAPI
openapi.doc("/openapi.json", {
    openapi: "3.0.3",
    info: {
        title: "Tada Mobile API",
        version: "1.0.0",
    },
});

module.exports = { openapi };
