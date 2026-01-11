"use client";

import { JsonValue } from "@prisma/client/runtime/library";
import { createContext, useContext, useState } from "react";

export interface Chart {
  id: string;
  projectId: string;
  name: string | null;
  type: string | null;
  subType: string | null;
  public: boolean;
  shareable: boolean;
  chartData: JsonValue;
  chartDataUpdated: Date | null;
  chartSize: number;
  dashboardOrder: number | null;
  displayLegend: boolean;
  pointRadius: number | null;
  dataLabels: boolean;
  startDate: Date | null;
  endDate: Date | null;
  dateVarsFormat: string | null;
  includeZeros: boolean;
  currentEndDate: boolean;
  fixedStartDate: boolean;
  timeInterval: string;
  autoUpdate: number | null;
  lastAutoUpdate: Date;
  draft: boolean;
  mode: string;
  maxValue: number | null;
  minValue: number | null;
  disabledExport: boolean | null;
  onReport: boolean;
  xLabelTicks: string;
  stacked: boolean;
  horizontal: boolean;
  showGrowth: boolean;
  invertGrowth: boolean;
  layout: JsonValue;
  snapshotToken: string;
  isLogarithmic: boolean;
  content: string | null;
  ranges: JsonValue;
  dashedLastPoint: boolean;
  staged?: boolean;
  ChartDatasetConfigs?: any;
  chartSpec?: JsonValue | null;
}

export interface Board {
  id: string;
  organizationId: string;
  missionId: string | null;
  name: string | null;
  tadaName: string | null;
  dashboardTitle: string | null;
  description: string | null;
  backgroundColor: string;
  titleColor: string;
  headerCode: string | null;
  footerCode: string | null;
  logo: string | null;
  logoLink: string | null;
  public: boolean;
  passwordProtected: boolean;
  password: string | null;
  timezone: string | null;
  ghost: boolean;
  updateSchedule: JsonValue;
  snapshotSchedule: JsonValue;
  updatedAt: Date | null;
  createdAt: Date;
  lastSnapshotSentAt: Date | null;
  currentSnapshot: string | null;
  charts: Chart[];
}

interface BoardBuilderContextType {
  board: Board;
  setBoard: (board: Board) => void;
  removeLocalChart: (id: string) => void;
  clearStagedCharts: () => void;
  stageChart: (chart: Chart) => void;
  editingBoard: boolean;
  setEditingBoard: (editingBoard: boolean) => void;
}

const BoardBuilderContext = createContext<BoardBuilderContextType | undefined>(
  undefined
);

export function BoardBuilderProvider({
  children,
  board: initialBoard,
}: {
  children: React.ReactNode;
  board: Board;
}) {
  const [board, setBoard] = useState<Board>({
    ...initialBoard,
    charts:
      initialBoard?.charts?.map((chart) => ({
        ...chart,
        staged: false,
      })) || [],
  });
  const [editingBoard, setEditingBoard] = useState<boolean>(false);

  const removeLocalChart = (id: string) => {
    setBoard({
      ...board,
      charts: board.charts.filter((chart) => chart.id !== id),
    });
  };

  const clearStagedCharts = () => {
    setBoard({
      ...board,
      charts: board.charts.filter((chart) => !chart.staged),
    });
  };

  const stageChart = (chart: Chart) => {
    setBoard({
      ...board,
      charts: [...board.charts, chart],
    });
  };

  const value = {
    board,
    setBoard,
    removeLocalChart,
    clearStagedCharts,
    stageChart,
    editingBoard,
    setEditingBoard,
  };

  return (
    <BoardBuilderContext.Provider value={value}>
      {children}
    </BoardBuilderContext.Provider>
  );
}

export function useBoardBuilder() {
  const context = useContext(BoardBuilderContext);
  if (!context) {
    throw new Error(
      "useBoardBuilder must be used within a BoardBuilderProvider"
    );
  }
  return context;
}
