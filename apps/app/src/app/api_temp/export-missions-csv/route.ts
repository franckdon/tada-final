import { NextResponse } from "next/server";
import { parse } from "json2csv";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import { format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const t = await getI18n();

    // Validate orgId if required
    if (!orgId) {
      return new NextResponse(
        JSON.stringify({ error: "Organization ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const missions = await prisma.mission.findMany({
      where: { organizationId: orgId },
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

    missions.forEach((mission) => {
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
        mission.survey.forEach((survey) => {
          if (survey.response && Array.isArray(survey.response)) {
            survey.response.forEach((res) => {
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

              const responseFields: Record<string, any> = {};

              if (
                res.responses &&
                typeof res.responses === "object" &&
                !Array.isArray(res.responses) &&
                res.responses !== null
              ) {
                for (const [question, responseObj] of Object.entries(
                  res.responses
                )) {
                  let value: any = responseObj;

                  // Handle nested response objects
                  if (
                    responseObj &&
                    typeof responseObj === "object" &&
                    !Array.isArray(responseObj) &&
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
                  } else {
                    value = String(value);
                  }

                  responseFields[question] = value;
                }
              }

              allRows.push({ ...baseRow, ...responseFields });
            });
          }
        });
      }

      // Add empty row as separator
      allRows.push({});
    });

    // Generate CSV with proper options
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
    console.error("Export missions CSV error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to export missions",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
