"use client";
import { cols, margin, widthSize } from "@/constants/layout-breakpoints";
import { cn } from "@tada/ui/lib/utils";
import {
  ArrowDownRight,
  MonitorSmartphone,
  Plus,
  Grid2X2Plus,
  ChartPie,
  LetterText,
  Share,
  MonitorUp,
  FileDown,
  RefreshCw,
  EllipsisVertical,
  ListFilter,
  PencilIcon,
  Link2Icon,
  MaximizeIcon,
  MinimizeIcon,
  CheckIcon,
} from "lucide-react";
import { useWindowSize } from "react-use";
import { useEffect, useRef, useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@tada/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tada/ui/components/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@tada/ui/components/tabs";
import { useI18n } from "@/locales/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import { Chart, useBoardBuilder } from "@/context/board-builder-context";
import { useAction } from "next-safe-action/hooks";
import { createChartsAction } from "@/actions/boards/create-charts-action";
import { updateChartAction } from "@/actions/boards/update-chart-action";
import { useParams, useRouter } from "next/navigation";
import { VegaChart } from "./widgets/vega-chart";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useCopyToClipboard } from "@/hooks/use-cpoy-to-clipboard";
import AddTextChart from "./modals/add-text-chart";
import { MarkdownChart } from "./widgets/markdown-chart";

const ResponsiveGridLayout = WidthProvider(Responsive);

const breakpoints = {
  mobile: 0,
  tablet: 640,
  computer: 1024,
};

interface StagedContent {
  [key: string]: string | null;
}

interface Layout {
  [key: string]: [number, number, number, number];
}

export function LayoutBoard() {
  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts | null>(null);
  const [editingLayout, setEditingLayout] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isOpenAddTextChart, setIsOpenAddTextChart] = useState(false);
  const [stagedContent, setStagedContent] = useState<StagedContent>({});
  const [previewSize, setPreviewSize] = useState<{
    breakpoint: string;
    size: number;
  }>({
    breakpoint: "xl",
    size: 0,
  });
  const t = useI18n();
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const dashboardParentRef = useRef<HTMLDivElement>(null);
  const initLayoutRef = useRef<boolean>(false);
  const { width } = useWindowSize();
  const { orgId, missionId, boardId } = useParams<{
    orgId: string;
    missionId: string;
    boardId: string;
  }>();
  const { isFullscreen, enterFullscreen, exitFullscreen } =
    useFullscreen<HTMLDivElement>();
  const { isCopied, copy } = useCopyToClipboard();

  const {
    board,
    removeLocalChart,
    clearStagedCharts,
    stageChart,
    setBoard,
    setEditingBoard,
    editingBoard,
  } = useBoardBuilder();
  const mobile = false;

  const createCharts = useAction(createChartsAction, {
    onSuccess: ({ data }) => {
      if (data?.data) {
        const createdCharts = data?.data;
        const tempCharts = createdCharts.map((chart) => chart);
        prepareLayout([...board.charts, ...tempCharts]);
        setBoard({ ...board, charts: [...board.charts, ...tempCharts] });
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updateChart = useAction(updateChartAction, {
    onSuccess: ({ data }) => {
      if (data?.data) {
        const updatedChart = data?.data;
        const tempCharts = board.charts.map((chart) =>
          chart.id === updatedChart.id ? updatedChart : chart
        );
        setBoard({ ...board, charts: tempCharts });
      }
    },
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if no input/textarea is focused
      const target = event.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "input" ||
        target.tagName.toLowerCase() === "textarea"
      )
        return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        if (editingLayout) {
          onCancelChanges();
        } else {
          onEditLayout();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [editingLayout]);

  useEffect(() => {
    if (
      board.charts &&
      board.charts.filter((c) => c.projectId === board.id).length > 0 &&
      !initLayoutRef.current
    ) {
      initLayoutRef.current = true;
      // set the grid layout
      prepareLayout();
    }

    board.charts.forEach((chart) => {
      if (chart.staged) {
        onEditLayout();
      }
    });
  }, [board.charts]);

  useEffect(() => {
    const dashboardWidth = dashboardRef.current?.offsetWidth ?? 0;
    setPreviewSize({
      size: dashboardWidth,
      breakpoint: getBreakpoint(dashboardWidth),
    });
  }, [dashboardRef]);

  const onChangeLayout = (
    layout: ReactGridLayout.Layout[] | null,
    allLayouts: ReactGridLayout.Layouts,
    toComplete = false
  ) => {
    console.log("enter");
    const updatedCharts = board.charts.map((chart) => {
      const updatedLayout: Record<string, [number, number, number, number]> =
        {};

      Object.keys(allLayouts).forEach((breakpoint) => {
        const layoutItems = allLayouts[breakpoint as keyof typeof allLayouts];
        if (!layoutItems) return;

        const layoutItem = layoutItems.find((item) => item.i === `${chart.id}`);
        if (layoutItem || layoutItem === 0) {
          updatedLayout[breakpoint] = [
            layoutItem.x,
            layoutItem.y,
            layoutItem.w,
            layoutItem.h,
          ];
        }
      });

      return { ...chart, layout: updatedLayout };
    });

    if (toComplete) {
      console.log("update chart", updatedCharts);
      updatedCharts.forEach((chart: any, index: number) => {
        // only allow chart updates if the layout has all the breakpoints
        const chartBreakpoints = Object.keys(chart.layout);
        const allBreakpoints = Object.keys(widthSize);

        console.log(chartBreakpoints, allBreakpoints, allLayouts);

        if (chartBreakpoints.length === allBreakpoints.length - 1) {
          // only update the layout if it has changed
          //if (!isEqual(chart.layout, board.charts[index]?.layout)) {
          console.log("change layout");
          updateChart.execute({
            id: chart.id,
            projectId: board.id,
            layout: chart.layout,
          });
          // }
        }
      });
    }

    setLayouts(allLayouts);
  };

  const getBreakpoint = (width: number): string => {
    if (width > widthSize.lg) return "xl";
    if (width > widthSize.md) return "lg";
    if (width > widthSize.sm) return "md";
    if (width > widthSize.xs) return "sm";
    return "xs";
  };

  const onEditLayout = () => {
    if (editingLayout) return;

    setEditingLayout(true);
    const dashboardWidth = dashboardRef.current?.offsetWidth ?? 0;

    setPreviewSize({
      size: dashboardWidth,
      breakpoint: getBreakpoint(dashboardWidth),
    });
  };

  const _getUserBreakpoint = () => {
    const dashboardWidth = dashboardParentRef.current?.offsetWidth || 0;
    if (dashboardWidth > widthSize.xxxl) return "xxxl";
    if (dashboardWidth > widthSize.xxl) return "xxl";
    if (dashboardWidth > widthSize.xl) return "xl";
    if (dashboardWidth > widthSize.lg) return "lg";
    if (dashboardWidth > widthSize.md) return "md";
    if (dashboardWidth > widthSize.sm) return "sm";
    return "xs";
  };

  const onChangePreviewSize = (key: string) => {
    const dashboardWidth = dashboardParentRef.current?.offsetWidth || 0;
    const breakpointWidth =
      key === "xxxl"
        ? 3840
        : key === "xxl"
        ? 2560
        : key === "xl"
        ? 1600
        : widthSize[key as keyof typeof widthSize];
    let newSize;

    // Case 1: Switching to a smaller breakpoint - use breakpoint width
    if (breakpointWidth < dashboardWidth) {
      newSize = breakpointWidth;
    }
    // Case 2: Switching to current screen's breakpoint - use Math.min
    else if (_getUserBreakpoint() === key) {
      newSize = Math.min(dashboardWidth, breakpointWidth);
    }
    // Case 3: Switching to a larger breakpoint - use breakpoint width (will enable scroll)
    else {
      newSize = breakpointWidth;
    }

    setPreviewSize({
      size: newSize,
      breakpoint: key,
    });
  };

  const onCancelChanges = async () => {
    clearStagedCharts();

    // should set the layouts to the original chart layouts
    const newLayouts = Object.keys(widthSize).reduce<Record<string, any[]>>(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      {}
    );

    board.charts.forEach((chart: any) => {
      if (chart.layout) {
        Object.keys(chart.layout).forEach((key) => {
          if (newLayouts[key]) {
            newLayouts[key].push({
              i: `${chart.id}`,
              x: chart.layout[key][0] || 0,
              y: chart.layout[key][1] || 0,
              w: chart.layout[key][2],
              h: chart.layout[key][3],
              minW: 2,
            });
          }
        });
      }
    });

    setLayouts(newLayouts);
    setEditingLayout(false);
  };
  const onSaveChanges = async () => {
    // create all the staged charts
    const createPromises = board.charts
      .map((chart) => {
        if (chart.staged) {
          const newChart = {
            name: chart.name as string,
            type: chart.type || "markdown",
            layout: chart.layout,
            content: stagedContent?.[chart.id] || chart.content || "",
            staged: false,
            onReport: true,
            draft: false,
            projectId: board.id,
          };

          removeLocalChart(chart.id);
          return newChart;
        }
        return null;
      })
      .filter(Boolean);

    if (createPromises.length > 0) {
      await createCharts.executeAsync({
        charts: createPromises.filter((chart) => chart !== null),
      });
    } else {
      console.log("change layout", layouts);
      onChangeLayout(null, layouts as ReactGridLayout.Layouts, true);
    }

    setStagedContent({});
    setEditingLayout(false);
  };

  const prepareLayout = (chartsToProcess = board.charts) => {
    const newLayouts = Object.keys(widthSize).reduce<Record<string, any[]>>(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      {}
    );

    chartsToProcess.forEach((chart) => {
      if (chart?.layout && typeof chart.layout === "object") {
        const layout = chart.layout as Layout;
        Object.keys(layout).forEach((key) => {
          if (newLayouts[key]) {
            newLayouts[key].push({
              i: `${chart.id}`,
              x: layout[key]?.[0] ?? 0,
              y: layout[key]?.[1] ?? 0,
              w: layout[key]?.[2] ?? 2,
              h: layout[key]?.[3] ?? 2,
              minW: 2,
            });
          }
        });
      }
    });

    setLayouts(newLayouts);
  };

  const onAddMarkdown = async (title: string, value: string) => {
    const newChart: Chart = {
      id: crypto.randomUUID(),
      projectId: board.id,
      name: title || "Markdown",
      type: "markdown",
      subType: null,
      public: false,
      shareable: false,
      chartData: null,
      chartDataUpdated: null,
      chartSize: 2,
      dashboardOrder: null,
      displayLegend: false,
      pointRadius: null,
      dataLabels: false,
      startDate: null,
      endDate: null,
      dateVarsFormat: null,
      includeZeros: true,
      currentEndDate: false,
      fixedStartDate: false,
      timeInterval: "day",
      autoUpdate: null,
      lastAutoUpdate: new Date(),
      draft: true,
      mode: "chart",
      maxValue: null,
      minValue: null,
      disabledExport: null,
      onReport: true,
      xLabelTicks: "default",
      stacked: false,
      horizontal: false,
      showGrowth: false,
      invertGrowth: false,
      layout: {
        xxs: [0, 0, 4, 2],
        xs: [0, 0, 4, 2],
        sm: [0, 0, 2, 2],
        md: [0, 0, 3, 2],
        lg: [0, 0, 3, 2],
        xl: [0, 0, 3, 2],
        xxl: [0, 0, 3, 2],
      },
      snapshotToken: crypto.randomUUID(),
      isLogarithmic: false,
      content: value || "",
      ranges: null,
      dashedLastPoint: false,
      staged: true,
    };

    stageChart(newChart);

    setStagedContent({
      ...stagedContent,
      [newChart.id]: newChart.content,
    });

    prepareLayout([...board.charts, newChart]);
  };

  const openExport = () => {
    console.log("open export");
  };

  const onShowFilters = () => {
    console.log("show filters");
  };

  return (
    <div
      className={cn(
        "w-full",
        editingLayout && "bg-background dark:bg-content3 overflow-x-auto"
      )}
    >
      <div ref={dashboardParentRef}>
        <div
          className="bg-white dark:bg-slate-800 w-full border-b-1 border-solid border-secondary"
          style={mobile ? styles.actionBarMobile : styles.actionBar}
        >
          <div className="flex flex-row justify-between gap-1 w-full">
            <div className="flex flex-row justify-between gap-1 w-full">
              <div className="flex flex-row items-center gap-1">
                <Button variant="secondary" onClick={onShowFilters} size="sm">
                  {filterLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  ) : (
                    <ListFilter className="mr-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {!editingLayout && (
              <div className="flex flex-row items-center gap-1">
                {editingBoard && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Grid2X2Plus className="mr-2 h-4 w-4" />
                        Add widget
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(
                            `/missions/${orgId}/${missionId}/${boardId}/create`
                          );
                        }}
                      >
                        <ChartPie className="mr-2 h-4 w-4" />
                        Add chart
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsOpenAddTextChart(true)}
                      >
                        <LetterText className="mr-2 h-4 w-4" />
                        Add text
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <div className="flex flex-row items-center gap-2">
                  {!editingBoard && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          isFullscreen
                            ? exitFullscreen()
                            : enterFullscreen(dashboardRef.current)
                        }
                        aria-label={
                          isFullscreen
                            ? "Quitter le plein écran"
                            : "Plein écran"
                        }
                      >
                        {isFullscreen ? (
                          <MinimizeIcon className="h-5 w-5" />
                        ) : (
                          <MaximizeIcon className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingBoard(true)}
                      >
                        <PencilIcon className=" h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copy("TON_TEXTE_A_COPIER")}
                        aria-label={isCopied ? "Copié !" : "Copier le lien"}
                      >
                        {isCopied ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <Link2Icon className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <EllipsisVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEditLayout()}>
                            <MonitorUp className="mr-2 h-4 w-4" />
                            Edit layout
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowShare(true)}>
                            <Share className="mr-2 h-4 w-4" />
                            Share dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openExport()}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export to Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            )}
            {(editingLayout || editingBoard) && (
              <div className="flex flex-row items-center gap-1">
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => onSaveChanges()}
                >
                  Save changes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (editingLayout) {
                      onCancelChanges();
                    } else {
                      setEditingBoard(false);
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "bg-gray-100 dark:bg-gray-900 w-full relative",
          editingLayout && "border-2 border-divider rounded-2xl"
        )}
        style={{
          ...styles.container(width < breakpoints.tablet),
          ...(editingLayout &&
            previewSize?.breakpoint && {
              width: previewSize.size,
              margin: "0 auto",
              boxSizing: "border-box",
              marginTop: 5,
              overflowX:
                previewSize.size > (dashboardRef.current?.offsetWidth ?? 0)
                  ? "auto"
                  : "hidden",
            }),
          ...(editingLayout && {
            paddingBottom: 100,
          }),
        }}
        ref={dashboardRef}
      >
        {board.charts.length === 0 && (
          <div className="flex flex-col justify-center pt-10">
            <div className="flex items-center justify-center">
              <span className="text-4xl font-bold font-tw">
                {t("missions.boards.layout.welcome")}
              </span>
            </div>

            <div className="h-4" />
            <>
              <div className="flex items-center justify-center">
                <span>{t("missions.boards.layout.empty")}</span>
              </div>
              <div className="h-16" />
              <div className="flex flex-row justify-center gap-2">
                <Button
                  size="lg"
                  color="primary"
                  onClick={() =>
                    router.push(
                      `/missions/${orgId}/${missionId}/${boardId}/create`
                    )
                  }
                >
                  <Plus size={24} />
                  {t("missions.boards.layout.add_chart")}
                </Button>
              </div>
            </>
          </div>
        )}
        {layouts &&
          board.charts.filter((c) => c.projectId === board.id).length > 0 && (
            <ResponsiveGridLayout
              className="layout dashboard-tutorial"
              layouts={layouts}
              margin={margin}
              breakpoints={widthSize}
              cols={cols}
              rowHeight={150}
              onLayoutChange={onChangeLayout}
              resizeHandle={
                <div className="react-resizable-handle react-resizable-handle-se">
                  <ArrowDownRight className="text-primary" size={20} />
                </div>
              }
              isDraggable={editingLayout}
              isResizable={editingLayout}
            >
              {board.charts.map((chart) => (
                <div
                  key={chart.id}
                  className={cn(
                    editingLayout && "bg-background dark:bg-content3"
                  )}
                >
                  {chart.type === "markdown" ? (
                    <MarkdownChart chart={chart} />
                  ) : chart.chartSpec ? (
                    <VegaChart chart={chart} />
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
      </div>

      {editingLayout && (
        <div className="dark fixed bottom-0 left-0 right-0 z-50 border-t-1 border-solid border-content3">
          <div className="bg-background p-4 flex justify-center items-center animate-appearance-in">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex gap-2 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-foreground cursor-help">
                        <MonitorSmartphone />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-sm">
                      {t("missions.boards.layout.preview_text")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Tabs
                  defaultValue={previewSize?.breakpoint}
                  value={previewSize?.breakpoint}
                  onValueChange={onChangePreviewSize}
                  className="w-full"
                >
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="xxxl">
                      {t("missions.boards.layout.screen_size.xxxl")}
                    </TabsTrigger>
                    <TabsTrigger value="xxl">
                      {t("missions.boards.layout.screen_size.xxl")}
                    </TabsTrigger>
                    <TabsTrigger value="xl">
                      {t("missions.boards.layout.screen_size.xl")}
                    </TabsTrigger>
                    <TabsTrigger value="lg">
                      {t("missions.boards.layout.screen_size.lg")}
                    </TabsTrigger>
                    <TabsTrigger value="md">
                      {t("missions.boards.layout.screen_size.md")}
                    </TabsTrigger>
                    <TabsTrigger value="sm">
                      {t("missions.boards.layout.screen_size.sm")}
                    </TabsTrigger>
                    <TabsTrigger value="xs">
                      {t("missions.boards.layout.screen_size.xs")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="flex gap-2">
                <Button
                  color="primary"
                  onClick={() => onSaveChanges()}
                  size="sm"
                >
                  {t("missions.boards.layout.save")}
                </Button>
                <Button variant="secondary" onClick={onCancelChanges} size="sm">
                  {t("missions.boards.layout.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddTextChart
        isOpen={isOpenAddTextChart}
        onClose={() => setIsOpenAddTextChart(false)}
        onAdd={async (title, value) => {
          await onAddMarkdown(title, value);
          setIsOpenAddTextChart(false);
        }}
      />
    </div>
  );
}

const styles = {
  container: (mobile: boolean) => ({
    flex: 1,
    padding: mobile ? 0 : 6,
    paddingTop: 6,
    paddingLeft: mobile ? 0 : 6,
  }),
  actionBar: {
    padding: 10,
    borderRadius: 0,
    boxShadow: "none",
    width: "100%",
  },
  actionBarMobile: {
    boxShadow: "none",
    padding: 5,
  },
  addChartBtn: {
    boxShadow: "0 1px 10px 0 #d4d4d5, 0 0 0 1px #d4d4d5",
  },
  refreshBtn: {
    position: "fixed",
    bottom: 25,
    right: 25,
  },
  chartGrid: (mobile: boolean) => ({
    padding: mobile ? 0 : 10,
    paddingTop: 10,
    paddingBottom: 10,
  }),
  mainGrid: (mobile: boolean) => ({
    padding: mobile ? 0 : 10,
    paddingTop: 10,
    paddingBottom: 10,
  }),
  addCard: {
    paddingTop: 50,
  },
};
