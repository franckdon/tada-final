"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSurveyResponse = insertSurveyResponse;
const db_1 = require("../../../../lib/db");
async function insertSurveyResponse(args) {
    const sql = `
    INSERT INTO "survey_response" (
      "id",
      "surveyId",
      "responses",
      "age",
      "gender",
      "location",
      "ipAddress",
      "userAgent",
      "status",
      "userId"
    )
    VALUES (
      $1,
      $2,
      $3::jsonb,
      $4,
      $5,
      $6::jsonb,
      $7,
      $8,
      $9,
      $10
    )
    RETURNING
      "id",
      "surveyId",
      "submittedAt",
      "status"
  `;
    const params = [
        args.id,
        args.surveyId,
        JSON.stringify(args.responses ?? {}),
        args.age,
        args.gender,
        JSON.stringify(args.location ?? {}),
        args.ipAddress,
        args.userAgent,
        args.status,
        args.userId,
    ];
    const r = await db_1.db.query(sql, params);
    return r.rows[0];
}
