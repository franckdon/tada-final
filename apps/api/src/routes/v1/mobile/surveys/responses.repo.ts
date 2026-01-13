import { db } from "../../../../lib/db";

export type InsertSurveyResponseArgs = {
  id: string;
  surveyId: string;
  userId: string | null;

  responses: any; // json
  age: number;
  gender: string;
  location: any; // json

  ipAddress: string | null;
  userAgent: string | null;

  status: string; // e.g. "submitted"
};

export type SurveyResponseRow = {
  id: string;
  surveyId: string;
  submittedAt: string;
  status: string;
};

export async function insertSurveyResponse(args: InsertSurveyResponseArgs): Promise<SurveyResponseRow> {
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

  const r = await db.query<SurveyResponseRow>(sql, params);
  return r.rows[0]!;
}
