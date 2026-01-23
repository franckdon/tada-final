"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// apps/api/src/lib/db.ts
const pg_1 = require("pg");
const env_1 = require("../env");
exports.db = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
