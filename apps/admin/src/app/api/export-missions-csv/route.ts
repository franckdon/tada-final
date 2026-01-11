// app/api/export-missions-csv/route.ts
import { NextResponse } from "next/server";
import { parse } from "json2csv";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import { format } from "date-fns";

export async function GET(req: Request) {
  try {
    const t = await getI18n();

    const missions = await prisma.mission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true } },
        survey: {
          select: {
            name: true,
            response: {
              select: {
                id: true,
                age: true,
                gender: true,
                ipAddress: true,
                userAgent: true,
                submittedAt: true,
                status: true,
                responses: true,
              },
            },
          },
        },
      },
    });

    const allRows: Record<string, any>[] = [];

    for (const mission of missions) {
      // Mission header row
      const missionHeaderRow = {
        [t("export.columns.mission")]: mission.name || "",
        [t("export.columns.problemSummary")]: mission.problemSummary || "",
        [t("export.columns.objectives")]: mission.objectives || "",
        [t("export.columns.assumptions")]: mission.assumptions || "",
        [t("export.columns.organization")]: mission.organization?.name || "",
        [t("export.columns.questionnaire")]: "",
        [t("export.columns.responseId")]: "",
        [t("export.columns.age")]: "",
        [t("export.columns.gender")]: "",
        [t("export.columns.ipAddress")]: "",
        [t("export.columns.userAgent")]: "",
        [t("export.columns.submittedAt")]: "",
        [t("export.columns.status")]: "",
      };
      allRows.push(missionHeaderRow);

      // Process surveys and responses
      if (mission.survey && Array.isArray(mission.survey)) {
        for (const survey of mission.survey) {
          if (survey.response && Array.isArray(survey.response)) {
            for (const res of survey.response) {
              const baseRow = {
                [t("export.columns.mission")]: "",
                [t("export.columns.problemSummary")]: "",
                [t("export.columns.objectives")]: "",
                [t("export.columns.assumptions")]: "",
                [t("export.columns.organization")]: "",
                [t("export.columns.questionnaire")]: survey.name || "",
                [t("export.columns.responseId")]: res.id || "",
                [t("export.columns.age")]: res.age || "",
                [t("export.columns.gender")]: res.gender || "",
                [t("export.columns.ipAddress")]: res.ipAddress || "",
                [t("export.columns.userAgent")]: res.userAgent || "",
                [t("export.columns.submittedAt")]: res.submittedAt
                  ? format(res.submittedAt, "yyyy-MM-dd HH:mm:ss")
                  : "",
                [t("export.columns.status")]: res.status || "",
              };

              // Process response fields
              const responseFields: Record<string, any> = {};
              if (res.responses && typeof res.responses === "object") {
                for (const [question, responseObj] of Object.entries(
                  res.responses
                )) {
                  let value = responseObj;

                  // Handle nested response objects
                  if (
                    responseObj &&
                    typeof responseObj === "object" &&
                    "answer" in responseObj
                  ) {
                    value = (responseObj as any).answer;
                  }

                  // Format different value types
                  if (Array.isArray(value)) {
                    value = value.join(", ");
                  } else if (typeof value === "object" && value !== null) {
                    value = JSON.stringify(value);
                  } else if (value === null || value === undefined) {
                    value = "";
                  }

                  responseFields[question] = value;
                }
              }

              allRows.push({ ...baseRow, ...responseFields });
            }
          }
        }
      }

      // Add empty row as separator
      allRows.push({});
    }

    // Generate CSV
    const csv = parse(allRows, {
      defaultValue: "",
      header: true,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="missions_export.csv"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to export missions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
