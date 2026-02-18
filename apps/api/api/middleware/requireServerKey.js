"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireServerKey = void 0;
const env_1 = require("../env"); // adapte ton import
const requireServerKey = async (c, next) => {
    const key = c.req.header("x-server-key");
    if (!key || key !== env_1.env.SERVER_KEY) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
};
exports.requireServerKey = requireServerKey;
