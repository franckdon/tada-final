"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { updateChartSchema } from "./schema";

export const updateChartAction = authActionClient
  .schema(updateChartSchema)
  .metadata({
    name: "update-chart-action",
  })
  .action(
    async ({
      parsedInput: { id, name, projectId, layout, content, onReport, draft },
      ctx: { user, auth },
    }) => {
      try {
        const chart = await prisma.chart.update({
          where: {
            id,
            projectId,
          },
          data: {
            name,
            layout,
            content,
            onReport,
            draft,
          },
        });
        return { success: true, data: chart };
      } catch (error) {
        console.error("[UPDATE_CHART_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
