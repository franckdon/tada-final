"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { createChartSchema } from "./schema";

export const createChartAction = authActionClient
  .schema(createChartSchema)
  .metadata({
    name: "create-chart-action",
  })
  .action(
    async ({
      parsedInput: { name, projectId, layout, content, onReport, draft, type },
      ctx: { user, auth },
    }) => {
      try {
        const chart = await prisma.chart.create({
          data: {
            name,
            projectId,
            layout,
            content,
            onReport,
            draft,
            type,
          },
        });
        return { success: true, data: chart };
      } catch (error) {
        console.error("[CREATE_CHART_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
