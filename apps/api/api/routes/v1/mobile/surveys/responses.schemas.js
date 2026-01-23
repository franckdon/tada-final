"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSurveyResponseSchema = void 0;
const zod_1 = require("zod");
/**
 * responses: JSON libre mais doit être un objet
 * location: le modèle Prisma le définit comme Json (non-null en pratique) => on met un default {}
 */
exports.createSurveyResponseSchema = zod_1.z.object({
    responses: zod_1.z.record(zod_1.z.any()),
    age: zod_1.z.coerce.number().int().min(13).max(120).optional(), // ajuste si besoin
    gender: zod_1.z.string().trim().min(1).max(50).optional(),
    location: zod_1.z.any().optional().default({}), // JSON
});
