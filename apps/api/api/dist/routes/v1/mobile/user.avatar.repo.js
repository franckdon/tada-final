"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserImage = updateUserImage;
exports.getUserImage = getUserImage;
const db_1 = require("../../../lib/db");
async function updateUserImage(userId, imageUrl) {
    const r = await db_1.db.query(`update "user"
     set image = $1, "updatedAt" = now()
     where id = $2
     returning id, email, name, image`, [imageUrl, userId]);
    return r.rows[0];
}
async function getUserImage(userId) {
    const r = await db_1.db.query(`select image from "user" where id = $1 limit 1`, [userId]);
    return r.rows[0]?.image ?? null;
}
