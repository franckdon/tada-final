export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { parse } from "json2csv";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import { format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const missionId = searchParams.get("id");
    const t = await getI18n();

    if (!missionId) {
      return new NextResponse(t("export.errors.missingId"), { status: 400 });
    }

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        organization: { select: { name: true } },
        survey: {
          select: {
            name: true,
            response: true,
          },
        },
      },
    });

    if (!mission) {
      return new NextResponse(t("export.errors.notFound"), { status: 404 });
    }

    const allRows: Record<string, any>[] = [];

    const missionHeaderRow = {
      [t("export.columns.mission")]: mission.name,
      [t("export.columns.problemSummary")]: mission.problemSummary,
      [t("export.columns.objectives")]: mission.objectives,
      [t("export.columns.assumptions")]: mission.assumptions,
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

    mission.survey.forEach((survey) => {
      survey.response.forEach((res) => {
        const baseRow = {
          [t("export.columns.mission")]: "",
          [t("export.columns.organization")]: "",
          [t("export.columns.questionnaire")]: survey.name,
          [t("export.columns.responseId")]: res.id,
          [t("export.columns.ipAddress")]: res.ipAddress || "",
          [t("export.columns.age")]: res.age,
          [t("export.columns.gender")]: res.gender,
          [t("export.columns.userAgent")]: res.userAgent || "",
          [t("export.columns.submittedAt")]: format(
            res.submittedAt,
            "yyyy-MM-dd HH:mm:ss"
          ),
          [t("export.columns.status")]: res.status,
        };

        const responseFields: Record<string, any> = {};
        if (
          res.responses &&
          typeof res.responses === "object" &&
          !Array.isArray(res.responses)
        ) {
          for (const [question, responseObj] of Object.entries(res.responses)) {
            let value =
              responseObj &&
              typeof responseObj === "object" &&
              "answer" in responseObj
                ? responseObj.answer
                : responseObj;

            if (Array.isArray(value)) value = value.join(", ");
            else if (typeof value === "object") value = JSON.stringify(value);

            responseFields[question] = value;
          }
        }

        allRows.push({ ...baseRow, ...responseFields });
      });
    });

    const csv = parse(allRows, { defaultValue: "" });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="mission_${missionId}.csv"`,
      },
    });
  } catch (error) {
    console.error("EXPORT_MISSION_CSV_ERROR", error);
    return new NextResponse("Erreur lors de l’export de la mission", {
      status: 500,
    });
  }
}
