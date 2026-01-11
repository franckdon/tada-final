"use server";

import { prisma } from "@/lib/prisma";

function convertToCsv(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return "";
  }

  const allKeys = new Set<string>();
  data.forEach((item) => {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        allKeys.add(key);
      }
    }
  });

  const finalHeaders = headers || Array.from(allKeys);

  const csvHeaders = finalHeaders.filter((key) => {
    const isComplexObject = data.some((item) => {
      const value = item[key];
      return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      );
    });
    return !isComplexObject;
  });

  const headerRow = csvHeaders.map((header) => `"${header}"`).join(",");
  const rows = data.map((row) => {
    return csvHeaders
      .map((key) => {
        let value = row[key];
        if (value === null || value === undefined) {
          value = "";
        } else if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        } else {
          value = String(value).replace(/"/g, '""');
        }
        return `"${value}"`;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
}

export async function exportData(modelName: string, format: "csv" | "json") {
  let data: any[] = [];
  let filename = "";

  try {
    switch (modelName) {
      case "SurveyResponse":
        data = await prisma.surveyResponse.findMany({
          include: {
            survey: true,
          },
        });
        filename = "survey_responses_with_relations";
        break;
      case "User":
        data = await prisma.user.findMany({
          include: {
            projectRoles: true,
            SubDashboard: true,
            missionPermissions: true,
            grantedPermissions: true,
          },
        });
        filename = "users_with_relations";
        break;
      case "Organization":
        data = await prisma.organization.findMany({
          include: {
            missions: true,
            templates: true,
            projects: true,
            datasets: true,
            subscription: true,
            consultedSuperAdminMissions: true,
            ConsultedMission: true,
            billingInfo: true,
          },
        });
        filename = "organizations_with_relations";
        break;
      case "Mission":
        data = await prisma.mission.findMany({
          include: {
            organization: true,
            survey: true,
            Project: true,
            subDashboard: true,
            missionPermissions: true,
            tempMission: true,
            consultingOrganizations: true,
            ConsultedMission: true,
          },
        });
        filename = "missions_with_relations";
        break;
      default:
        throw new Error("Modèle non supporté pour l'exportation.");
    }

    let fileContent: string;
    let contentType: string;

    if (format === "csv") {
      fileContent = convertToCsv(data);
      contentType = "text/csv";
      filename += ".csv";
    } else {
      // json
      fileContent = JSON.stringify(data, null, 2);
      contentType = "application/json";
      filename += ".json";
    }

    return {
      fileContent: Buffer.from(fileContent).toString("base64"),
      contentType,
      filename,
    };
  } catch (error) {
    console.error("Erreur lors de l'exportation des données:", error);
    return { error: "Échec de l'exportation des données." };
  }
}
