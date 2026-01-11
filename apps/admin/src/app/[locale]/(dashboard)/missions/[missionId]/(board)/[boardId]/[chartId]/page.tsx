import { LayoutChart } from "@/components/missions/boards/layout-chart";
import { BoardBuilderProvider, Chart } from "@/context/board-builder-context";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MyRuntimeProvider } from "./my-runtime-provider";
import ChartBuilder from "@/components/missions/boards/chart-builder";
import { ChartBuilderProvider } from "@/context/chart-builder-context";
import { ChartGraph } from "@/components/missions/boards/chart-graph";
import { AssistantModal } from "@tada/ui/components/assistant-ui/assistant-modal";
import { ChartFilters } from "@/components/missions/boards/chart-filters";
import { QueryResults } from "@/components/missions/boards/query-results";

export default async function Page({
  params,
}: {
  params: {
    orgId: string;
    missionId: string;
    boardId: string;
    chartId: string;
  };
}) {
  const board = await prisma.project.findUnique({
    where: {
      id: params.boardId,
      organizationId: params.orgId,
    },
    include: {
      charts: {
        include: {
          chartDatasetConfig: true,
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <MyRuntimeProvider>
        <ChartBuilderProvider>
          <div className="">
            <div className="flex flex-row gap-2">
              <div className="w-1.5/3">
                <ChartGraph />
              </div>
              <div className="w-2/3">
                <ChartFilters />
                <QueryResults />
              </div>
              <div className="w-1/3">
                <ChartBuilder />
              </div>
            </div>
          </div>
          <AssistantModal />
        </ChartBuilderProvider>
        {/*  <BoardBuilderProvider board={board}>
          <LayoutChart
            params={params}
            chart={
              {
                ...board.charts[0],
                ChartDatasetConfigs: board.charts[0]?.chartDatasetConfig,
              } as Chart
            }
          />
        </BoardBuilderProvider> */}
      </MyRuntimeProvider>
    </div>
  );
}
