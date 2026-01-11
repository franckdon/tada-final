"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { createChartsSchema } from "./schema";

export const createChartsAction = authActionClient
  .schema(createChartsSchema)
  .metadata({
    name: "create-charts-action",
  })
  .action(async ({ parsedInput: { charts }, ctx: { user, auth } }) => {
    try {
      const chartsCreated = await Promise.all(
        charts.map(async (chart) => {
          const createdChart = await prisma.chart.create({
            data: {
              name: chart.name,
              projectId: chart.projectId,
              layout: chart.layout,
              content: chart.content,
              onReport: chart.onReport,
              draft: chart.draft,
              type: chart.type,
            },
          });
          return createdChart;
        })
      );

      return { success: true, data: chartsCreated };
    } catch (error) {
      console.error("[CREATE_CHARTS_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
