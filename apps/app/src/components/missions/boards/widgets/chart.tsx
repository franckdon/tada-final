"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LinkIcon,
  EllipsisVerticalIcon,
  MonitorXIcon,
  MonitorIcon,
  TrashIcon,
  LayoutDashboardIcon,
  LucideBookMarked,
  Loader2Icon,
  ShareIcon,
  LockIcon,
  LockOpenIcon,
  ListFilterIcon,
  FileDownIcon,
  CircleCheckIcon,
  SettingsIcon,
} from "lucide-react";
import moment from "moment";
import _ from "lodash";
import { motion } from "framer-motion";

/* import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import RadarChart from "./components/RadarChart";
import PolarChart from "./components/PolarChart";
import DoughnutChart from "./components/DoughnutChart";
import PieChart from "./components/PieChart";
import TableContainer from "./components/TableView/TableContainer";
import ChartFilters from "./components/ChartFilters";
import KpiMode from "./components/KpiMode";
import GaugeChart from "./components/GaugeChart"; */
import { Card, CardContent, CardHeader } from "@tada/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tada/ui/components/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@tada/ui/components/popover";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { cn } from "@tada/ui/lib/utils";
import { useBoardBuilder } from "@/context/board-builder-context";
import { useInterval } from "@/hooks/use-interval";
import useChartSize from "@/hooks/use-chart-size";
import { useRouter } from "next/navigation";
import PieChart from "./charts/pie-chart";
import { LineChart } from "./charts/line-chart";
import BarChart from "./charts/bar-chart";
import { DoughnutChart } from "./charts/doughnut-chart";
import { RadarChart } from "./charts/radar-chart";
import { PolarChart } from "./charts/polar-chart";
import { KpiMode } from "./charts/kpi-mode-chart";
import { GaugeChart } from "./charts/gauge-chart";

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  exposed?: boolean;
  variable?: string;
}

interface RouteParams {
  teamId?: string;
  projectId?: string;
  chartId?: string;
  [key: string]: string | undefined;
}

interface ChartProps {
  chart: any;
  isPublic?: boolean;
  print?: string;
  height?: () => number;
  showExport?: boolean;
  password?: string;
  editingLayout?: boolean;
  onEditLayout?: () => void;
  variables?: Record<string, any>;
}

const getFiltersFromStorage = (
  projectId?: string
): FilterCondition[] | null => {
  try {
    const filters = JSON.parse(
      window.localStorage.getItem("_cb_filters") || "{}"
    );
    return projectId ? filters[projectId] || null : null;
  } catch (e) {
    return null;
  }
};

const Chart: React.FC<ChartProps> = ({
  chart,
  isPublic = false,
  print = "",
  height = () => 300,
  showExport = false,
  password = "",
  editingLayout = false,
  onEditLayout = () => {},
  variables = {},
}) => {
  const { board, setBoard } = useBoardBuilder();

  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [publicModal, setPublicModal] = useState<boolean>(false);
  const [embedModal, setEmbedModal] = useState<boolean>(false);
  const [updateModal, setUpdateModal] = useState<boolean>(false);
  const [updateFrequency, setUpdateFrequency] = useState<number>(
    chart.autoUpdate
  );
  const [autoUpdateLoading, setAutoUpdateLoading] = useState<boolean>(false);
  const [publicLoading, setPublicLoading] = useState<boolean>(false);
  const [iframeCopied, setIframeCopied] = useState<boolean>(false);
  const [urlCopied, setUrlCopied] = useState<boolean>(false);
  const [dashboardFilters, setDashboardFilters] = useState<
    FilterCondition[] | null
  >(getFiltersFromStorage(board.id));

  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [redraw, setRedraw] = useState<boolean>(false);
  const [updateFreqType, setUpdateFreqType] = useState<string>("hours");
  const [customUpdateFreq, setCustomUpdateFreq] = useState<number>(1);
  const [autoUpdateError, setAutoUpdateError] = useState<string>("");
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [embedTheme, setEmbedTheme] = useState<string>("");
  const chartSize = useChartSize(chart.layout);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useInterval({
    callback: () => {
      /*  dispatch(
        getChart({
          project_id: chart.project_id,
          chart_id: chart.id,
          password: isPublic
            ? window.localStorage.getItem("reportPassword")
            : null,
          fromInterval: true,
        })
      ); */

      if (board.id) {
        _runFiltering(getFiltersFromStorage(board.id));
      } else {
        _runFiltering();
      }
    },
    delay:
      chart.autoUpdate > 0 && chart.autoUpdate < 600
        ? chart.autoUpdate * 1000
        : 600000,
  });

  useEffect(() => {
    setIframeCopied(false);
    setUrlCopied(false);
  }, [embedModal]);

  useEffect(() => {
    if (customUpdateFreq && updateFreqType) {
      if (updateFreqType === "days") {
        setUpdateFrequency(customUpdateFreq * 3600 * 24);
      } else if (updateFreqType === "hours") {
        setUpdateFrequency(customUpdateFreq * 3600);
      } else if (updateFreqType === "minutes") {
        setUpdateFrequency(customUpdateFreq * 60);
      } else if (updateFreqType === "seconds") {
        setUpdateFrequency(customUpdateFreq);
      }
    }
  }, [customUpdateFreq, updateFreqType]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setIsCompact(containerRef.current.offsetHeight < 200);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const _canAccess = (role: string): boolean => {
    //  return canAccess(role, user.id, team.TeamRoles);
    return true;
  };

  const _getEmbedUrl = (): string => {
    const shareString = chart.Chartshares?.[0]?.shareString;
    return shareString
      ? `${window.location.origin}/chart/${shareString}/embedded${
          embedTheme ? `?theme=${embedTheme}` : ""
        }`
      : "";
  };

  const _getEmbedString = (): string => {
    const shareString = chart.Chartshares?.[0]?.shareString;
    return shareString
      ? `<iframe src="${window.location.origin}/chart/${shareString}/embedded${
          embedTheme ? `?theme=${embedTheme}` : ""
        }" allowTransparency="true" width="700" height="300" scrolling="no" frameborder="0" style="background-color: #ffffff"></iframe>`
      : "";
  };

  const _getUpdatedTime = (chart: any) => {
    const updatedAt = chart.chartDataUpdated || chart.lastAutoUpdate;
    if (moment().diff(moment(updatedAt), "days") > 1) {
      return moment(updatedAt).calendar();
    }

    return moment(updatedAt).fromNow();
  };

  const _getUpdateFreqText = (value: number) => {
    let text = "Update schedule";

    if (value === 60) text = "minute";
    else if (value === 300) text = "5 minutes";
    else if (value === 900) text = "15 minutes";
    else if (value === 1800) text = "30 minutes";
    else if (value === 3600) text = "1 hour";
    else if (value === 10800) text = "3 hours";
    else if (value === 21600) text = "6 hours";
    else if (value === 43200) text = "12 hours";
    else if (value === 86400) text = "day";
    else if (value === 604800) text = "week";
    else if (value === 2592000) text = "month";
    else if (value < 120 && value > 0) text = `${value} seconds`;
    else if (value > 119 && value < 3600) {
      text = `${Math.floor(value / 60)} minutes`;
    } else if (value > 3600 && value < 86400) {
      text = `${Math.floor(value / 3600)} hours`;
    } else if (value > 86400 && value < 604800) {
      text = `${Math.floor(value / 86400)} days`;
    }

    return text;
  };
  const _checkIfFilters = () => {
    let filterCount = 0;
    if (!chart.ChartDatasetConfigs) return false;

    chart.ChartDatasetConfigs.forEach((d: any) => {
      if (Array.isArray(d.Dataset?.conditions)) {
        filterCount += d.Dataset.conditions.filter(
          (c: any) => c.exposed
        ).length;
      }
    });

    return filterCount > 0;
  };

  const _shouldCompact = () => {
    if (
      isCompact &&
      (chart.type === "kpi" || chart.type === "gauge" || chart.type === "bar")
    ) {
      return true;
    }
    return false;
  };

  const _onGetChartData = () => {
    const skipStateUpdate = getFiltersFromStorage(board.id)?.length || 0 > 0;

    setChartLoading(true);
    /*  dispatch(
      runQuery({ project_id: projectId, chart_id: chart.id, skipStateUpdate })
    )
      .then(() => {
        setChartLoading(false);

        setDashboardFilters(getFiltersFromStorage(projectId));
        if (getFiltersFromStorage(projectId) && _chartHasFilter()) {
          _runFiltering(getFiltersFromStorage(projectId));
        } else {
          _runFiltering();
        }
      })
      .catch((error) => {
        if (error === 413) {
          setChartLoading(false);
        } else {
          setChartLoading(false);
          setError(true);
        }
      }); */
  };

  const _runFiltering = async (filters?: any) => {
    if (!chart.ChartDatasetConfigs) return;

    // Get all conditions from the chart's datasets
    let identifiedConditions: any = [];
    chart.ChartDatasetConfigs.forEach((cdc: any) => {
      if (Array.isArray(cdc.Dataset?.conditions)) {
        identifiedConditions = [
          ...identifiedConditions,
          ...cdc.Dataset.conditions,
        ];
      }
    });

    // Combine regular filters and variable filters into a single array
    const allFilters = [];

    // Add regular filters if they exist
    if (filters) {
      allFilters.push(...filters);
    }

    // Add variable filters if they exist and match chart conditions
    if (variables?.[board.id]) {
      variables[board.id].forEach((variable: any) => {
        const found = identifiedConditions.find(
          (c: any) => c.variable === variable.variable && variable.value
        );
        if (found) {
          allFilters.push({
            ...found,
            value: variable.value,
          });
        }
      });
    }

    // Only make an API call if there are filters to apply
    if (allFilters.length > 0) {
      /*  await dispatch(
        runQueryWithFilters({
          project_id: chart.project_id,
          chart_id: chart.id,
          filters: allFilters,
        })
      ); */
    }
  };

  const _onGetChart = () => {
    // dispatch(getChart({ project_id: params.projectId, chart_id: chart.id }));
  };

  const _onDeleteChartConfirmation = () => {
    setDeleteModal(true);
  };

  const _onAddFilter = (condition: any) => {
    let found = false;
    const newConditions = conditions.map((c: any) => {
      let newCondition = c;
      if (c.id === condition.id) {
        newCondition = condition;
        found = true;
      }
      return newCondition;
    });
    if (!found) newConditions.push(condition);
    setConditions(newConditions);

    _runFiltering(newConditions);
  };

  const _onClearFilter = (condition: any) => {
    const newConditions = [...conditions];
    const clearIndex = _.findIndex(conditions, { id: condition.id });
    if (clearIndex > -1) newConditions.splice(clearIndex, 1);

    setConditions(newConditions);
    _runFiltering(newConditions);
  };

  const _onCreateSharingString = async () => {
    setShareLoading(true);
    /*   await dispatch(
      createShareString({ project_id: params.projectId, chart_id: chart.id })
    ); */
    setShareLoading(false);
  };

  const _onPublishChart = async () => {
    /*  const res = await dispatch(
      updateChart({
        project_id: params.projectId,
        chart_id: chart.id,
        data: { draft: false },
      })
    );

    if (res.error) {
       toast.error("There was a problem publishing your chart");
    } else {
        toast.success("Chart published successfully");
    } */
  };

  const _onCopyIframe = () => {
    const iframeText = document.getElementById(
      "iframe-text"
    ) as HTMLTextAreaElement;
    if (iframeText) {
      iframeText.select();
      document.execCommand("copy");
      setIframeCopied(true);
    }
  };

  const _onCopyUrl = () => {
    const urlText = document.getElementById("url-text") as HTMLTextAreaElement;
    urlText?.select();
    document.execCommand("copy");
    setUrlCopied(true);
  };

  const _onExport = () => {
    setExportLoading(true);
    /*   return dispatch(
      exportChart({
        project_id: params.projectId,
        chartIds: [chart.id],
        filters: dashboardFilters,
      })
    )
      .then(() => {
        setExportLoading(false);
      })
      .catch(() => {
        setExportLoading(false);
      }); */
  };

  const _onPublicExport = (chart: any) => {
    setExportLoading(true);
    /*   return dispatch(exportChartPublic({ chart, password }))
      .then(() => {
        setExportLoading(false);
      })
      .catch(() => {
        setExportLoading(false);
      }); */
  };

  const _onPublicConfirmation = () => {
    if (chart.public) {
      setTimeout(() => {
        _onPublic();
      }, 100);
    } else {
      setPublicModal(true);
    }
  };

  const _onPublic = () => {
    setPublicModal(false);
    setPublicLoading(true);

    /*   dispatch(
      updateChart({
        project_id: params.projectId,
        chart_id: chart.id,
        data: { public: !chart.public },
        justUpdates: true,
      })
    )
      .then(() => {
        setChartLoading(false);
        setPublicLoading(false);
      })
      .catch(() => {
        setChartLoading(false);
        setError(true);
        setPublicLoading(false);
      }); */
  };

  const _onEmbed = () => {
    setEmbedModal(true);
  };

  const _onOpenEmbed = () => {
    if (chart.Chartshares && chart.Chartshares.length > 0) {
      // open the chart in a new tab
      window.open(
        `/chart/${chart.Chartshares[0].shareString}/embedded`,
        "_blank"
      );
    }
  };

  const _onChangeReport = () => {
    setChartLoading(true);

    /*     dispatch(
      updateChart({
        project_id: params.projectId,
        chart_id: chart.id,
        data: { onReport: !chart.onReport },
      })
    )
      .then(() => {
        setChartLoading(false);
      })
      .catch(() => {
        setChartLoading(false);
        setError(true);
      }); */
  };

  const _onToggleShareable = async () => {
    // first, check if the chart has a share string
    if (!chart.Chartshares || chart.Chartshares.length === 0) {
      setShareLoading(true);
      /*   await dispatch(
        createShareString({ project_id: params.projectId, chart_id: chart.id })
      ); */
    }

    /*   await dispatch(
      updateChart({
        project_id: params.projectId,
        chart_id: chart.id,
        data: { shareable: !chart.shareable },
        justUpdates: true,
      })
    ); */
    setShareLoading(false);
  };

  const _onDeleteChart = () => {
    setChartLoading(true);
    /*    dispatch(removeChart({ project_id: board.id, chart_id: chart.id }))
      .then(() => {
        setChartLoading(false);
        setDeleteModal(false);
      })
      .catch(() => {
        setChartLoading(false);
        setError(true);
        setDeleteModal(false);
      }); */
  };

  return (
    <motion.div
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.7 }}
      style={styles.container}
      ref={containerRef}
    >
      {error && (
        <span
          className="text-danger cursor-pointer"
          onClick={() => setError(false)}
        >
          There was a problem with your request. Please refresh the page and try
          again.
        </span>
      )}

      {chart && (
        <Card
          className={`h-full bg-white dark:bg-slate-700 border-solid border-1 border-divider ${
            print &&
            "min-h-[350px] shadow-none border-solid border-1 border-content4"
          }`}
        >
          <CardHeader
            className={`pb-0 grid grid-cols-12 items-start ${
              isCompact ? "h-0 p-0 overflow-hidden" : ""
            }`}
          >
            <div
              className={`col-span-6 sm:col-span-8 flex items-start justify-start ${
                isCompact ? "hidden" : ""
              }`}
            >
              <div>
                <div className="flex flex-row  flex-wrap gap-1 items-center justify-center ">
                  {chart.draft && (
                    <LucideBookMarked color="secondary" size="sm" radius="sm">
                      Draft
                    </LucideBookMarked>
                  )}
                  <>
                    {_canAccess("projectEditor") && !editingLayout && (
                      <Link
                        href={`/${board.organizationId}/${board.missionId}/${board.id}/chart/${chart.id}/edit`}
                      >
                        <div className={"text-foreground font-bold"}>
                          {chart.name}
                        </div>
                      </Link>
                    )}
                    {(!_canAccess("projectEditor") || editingLayout) && (
                      <span className="text-foreground font-bold">
                        {chart.name}
                      </span>
                    )}
                  </>
                </div>

                {chart.chartData && (
                  <div className="flex flex-row flex-start gap-1 items-center justify-start ">
                    {!chartLoading && !chart.loading && (
                      <>
                        <span
                          className="text-[10px] text-default-500"
                          title="Last updated"
                        >{`${_getUpdatedTime(chart)}`}</span>
                      </>
                    )}
                    {(chartLoading || chart.loading) && (
                      <>
                        <Loader2Icon className="w-4 h-4" />
                        <div className="mx-0.5" />
                        <span className="text-[10px] text-default-500">
                          {"Updating..."}
                        </span>
                      </>
                    )}

                    {chart.public && !isPublic && !print && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <LockOpenIcon size={12} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>This chart is public</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {chart.onReport && !isPublic && !print && !chart.draft && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <MonitorIcon size={12} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Visible on your report and snapshots
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {(!chart.onReport || chart.draft) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <MonitorXIcon size={12} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {chart.draft
                              ? "Drafts are not visible on report and snapshots"
                              : "Hidden on reports and snapshots"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`col-span-6 sm:col-span-4 flex items-start justify-end ${
                isCompact ? "absolute right-2 top-2" : ""
              }`}
            >
              {/*    {_checkIfFilters() && (
                <div className="flex items-start gap-1">
                  {chartSize?.[2] > 3 && (
                    <ChartFilters
                      chart={chart}
                      onAddFilter={_onAddFilter}
                      onClearFilter={_onClearFilter}
                      conditions={conditions}
                      inline
                      size="sm"
                      amount={1}
                    />
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Badge
                          variant="default"
                          className={cn(
                            "h-5 w-5 items-center justify-center p-0 text-xs",
                            (!conditions || conditions.length === 0) && "hidden"
                          )}
                        >
                          {conditions.length}
                        </Badge>
                        <ListFilterIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <ChartFilters
                        chart={chart}
                        onAddFilter={_onAddFilter}
                        onClearFilter={_onClearFilter}
                        conditions={conditions}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )} */}
              {board.id && !print && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={_onGetChartData}>
                      <Loader2Icon className="" />
                      <span>Refresh chart</span>

                      <span>Refresh chart</span>
                    </DropdownMenuItem>
                    {_canAccess("projectEditor") && (
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(
                            `/${board.organizationId}/${board.missionId}/${board.id}/chart/${chart.id}/edit`
                          );
                        }}
                      >
                        <SettingsIcon />
                        <span>Edit chart</span>
                      </DropdownMenuItem>
                    )}

                    {_canAccess("projectEditor") && chart.draft && (
                      <DropdownMenuItem onClick={_onPublishChart}>
                        <CircleCheckIcon className="mr-2 h-4 w-4" />
                        <span>Publish chart</span>
                      </DropdownMenuItem>
                    )}

                    {_canAccess("projectEditor") && (
                      <DropdownMenuItem onClick={onEditLayout}>
                        <LayoutDashboardIcon
                          className={`mr-2 h-4 w-4 ${
                            editingLayout ? "text-primary" : ""
                          }`}
                        />
                        <span className={editingLayout ? "text-primary" : ""}>
                          {editingLayout ? "Complete layout" : "Edit layout"}
                        </span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={_onExport}>
                      {exportLoading ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <FileDownIcon className="mr-2 h-4 w-4" />
                      )}
                      <span>Export to Excel</span>
                    </DropdownMenuItem>

                    {!chart.draft && _canAccess("projectEditor") && (
                      <DropdownMenuItem onClick={_onChangeReport}>
                        {chart.onReport ? (
                          <MonitorXIcon className="mr-2 h-4 w-4" />
                        ) : (
                          <MonitorIcon className="mr-2 h-4 w-4" />
                        )}
                        <span>
                          {chart.onReport
                            ? "Remove from report"
                            : "Add to report"}
                        </span>
                      </DropdownMenuItem>
                    )}

                    {!chart.draft &&
                      chart.public &&
                      _canAccess("projectEditor") && (
                        <DropdownMenuItem onClick={_onPublicConfirmation}>
                          {chart.public ? (
                            <LockOpenIcon className="mr-2 h-4 w-4" />
                          ) : (
                            <LockIcon className="mr-2 h-4 w-4" />
                          )}
                          <span>Make private</span>
                        </DropdownMenuItem>
                      )}

                    {!chart.draft && _canAccess("projectEditor") && (
                      <DropdownMenuItem onClick={_onEmbed}>
                        <ShareIcon className="mr-2 h-4 w-4" />
                        <span>Embed & Share</span>
                      </DropdownMenuItem>
                    )}

                    {!chart.draft && chart.shareable && (
                      <DropdownMenuItem onClick={_onOpenEmbed}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <span>Open in a new tab</span>
                      </DropdownMenuItem>
                    )}

                    {_canAccess("projectEditor") && (
                      <DropdownMenuItem
                        onClick={_onDeleteChartConfirmation}
                        className="text-destructive focus:text-destructive"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        <span>Delete chart</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="opacity-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            Last updated: {_getUpdatedTime(chart)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {chart.public && !isPublic && !print && (
                            <div className="flex items-center gap-1">
                              <LockOpenIcon size={12} />
                              <span className="text-[10px] text-muted-foreground">
                                Public chart
                              </span>
                            </div>
                          )}
                          {(!chart.onReport || chart.draft) && (
                            <div className="flex items-center gap-1">
                              <MonitorXIcon size={12} />
                              <span className="text-[10px] text-muted-foreground">
                                {chart.draft ? "Draft" : "Hidden on report"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent
            className={`${
              _shouldCompact() ? "pt-0 pb-0" : "pt-2 pb-4"
            } overflow-y-hidden`}
          >
            {chart.chartData && (
              <div className="h-full">
                {chart.type === "line" && (
                  <LineChart
                    chart={chart}
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )}
                {/*    {chart.type === "bar" && (
                  <BarChart
                    chart={chart}
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )} */}
                {chart.type === "pie" && (
                  <PieChart
                    chart={chart}
                    /*          height={height} */
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )}
                {chart.type === "doughnut" && (
                  <DoughnutChart
                    chart={chart}
                    /*      height={height} */
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )}
                {chart.type === "radar" && (
                  <RadarChart
                    chart={chart}
                    /* height={height} */
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )}
                {chart.type === "polar" && (
                  <PolarChart
                    chart={chart}
                    /* height={height} */
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )}
                {/* {chart.type === "table" && (
                  <div className="h-full">
                    <TableContainer
                      tabularData={chart.chartData}
                      datasets={chart.ChartDatasetConfigs}
                    />
                  </div>
                )} */}
                {(chart.type === "kpi" || chart.type === "avg") && (
                  <KpiMode
                    chart={chart}
                    /* height={height} */
                    /* redraw={redraw} */
                    /*    redrawComplete={() => setRedraw(false)} */
                  />
                )}
                {chart.type === "gauge" && (
                  <GaugeChart
                    chart={chart}
                    /*       height={height} */
                    redraw={redraw}
                    redrawComplete={() => setRedraw(false)}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {/*       <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            <span className="text-xl font-bold">
              Are you sure you want to remove this chart?
            </span>
          </ModalHeader>
          <ModalBody>
            <span className="text-sm text-muted-foreground">
              {
                "All the chart data will be removed and you won't be able to see it on your dashboard anymore if you proceed with the removal."
              }
            </span>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              color="warning"
              onClick={() => setDeleteModal(false)}
            >
              Go back
            </Button>
            <Button color="danger" onClick={_onDeleteChart}>
              {chartLoading ? (
                <CircularProgress size="sm" aria-label="Deleting chart" />
              ) : (
                <>
                  <TrashIcon />
                  Remove completely
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}

      {/* MAKE CHART PUBLIC MODAL */}
      {/*     <Modal onClose={() => setPublicModal(false)} isOpen={publicModal}>
        <ModalContent>
          <ModalHeader>
            <span className="text-xl font-bold">
              Are you sure you want to make your chart public?
            </span>
          </ModalHeader>
          <ModalBody>
            <span className="text-xl font-bold">
              Public charts will show in your Public Dashboard page and it can
              be viewed by everyone with access to the unique sharing link.
              Nobody other than you and your team will be able to edit or update
              the chart data.
            </span>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              color="warning"
              onClick={() => setPublicModal(false)}
            >
              Go back
            </Button>
            <Button color="primary" onClick={_onPublic}>
              {publicLoading ? (
                <CircularProgress size="sm" aria-label="Making chart public" />
              ) : (
                <>
                  <LockOpenIcon />
                  Make the chart public
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}

      {/* EMBED CHART MODAL */}
      {/*   {chart && (
        <Modal
          isOpen={embedModal}
          onClose={() => setEmbedModal(false)}
          size="xl"
        >
          <ModalContent>
            <ModalHeader>
              <span className="text-xl font-bold">
                Embed your chart on other websites
              </span>
            </ModalHeader>
            <ModalBody>
              <div className="flex items-center justify-center">
                <Switch
                  label={chart.shareable ? "Disable sharing" : "Enable sharing"}
                  onChange={_onToggleShareable}
                  isSelected={chart.shareable}
                  disabled={!_canAccess("projectEditor")}
                  size="sm"
                />
                <div className="mx-0.5" />

                <span className="">
                  {chart.shareable ? "Disable sharing" : "Enable sharing"}
                </span>
                <div className="mx-0.5" />
                {shareLoading && (
                  <CircularProgress size="sm" aria-label="Sharing chart" />
                )}
              </div>

              <div className="h-8 w-px bg-border" />
              {chart.public && !chart.shareable && (
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {
                      "The chart is public. A public chart can be shared even if the sharing toggle is disabled. This gives you more flexibility if you want to hide the chart from the public dashboard but you still want to individually share it."
                    }
                  </span>
                </div>
              )}
              {!chart.public && !chart.shareable && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {
                        "The chart is private. A private chart can only be seen by members of the team. If you enable sharing, others outside of your team can see the chart and you can also embed it on other websites."
                      }
                    </span>
                  </div>
                </>
              )}
              {!_canAccess("projectEditor") &&
                !chart.public &&
                !chart.shareable && (
                  <>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">
                        {
                          "You do not have the permission to enable sharing on this chart. Only editors and admins can enable this."
                        }
                      </span>
                    </div>
                  </>
                )}
              {(chart.public || chart.shareable) &&
                (!chart.Chartshares || chart.Chartshares.length === 0) && (
                  <>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center">
                      <Button onClick={_onCreateSharingString} color="primary">
                        <LuPlus />
                        Create a sharing code
                      </Button>
                    </div>
                  </>
                )}
              {shareLoading && (
                <div className="flex items-center">
                  <CircularProgress aria-label="Creating sharing code" />
                </div>
              )}

              {(chart.shareable || chart.public) &&
                !chartLoading &&
                chart.Chartshares &&
                chart.Chartshares.length > 0 && (
                  <>
                    <div className="flex items-center">
                      <RadioGroup
                        label="Select a theme"
                        orientation="horizontal"
                        size="sm"
                      >
                        <Radio
                          value="os"
                          onClick={() => setEmbedTheme("")}
                          checked={embedTheme === ""}
                        >
                          System default
                        </Radio>
                        <Radio
                          value="dark"
                          onClick={() => setEmbedTheme("dark")}
                          checked={embedTheme === "dark"}
                        >
                          Dark
                        </Radio>
                        <Radio
                          value="light"
                          onClick={() => setEmbedTheme("light")}
                          checked={embedTheme === "light"}
                        >
                          Light
                        </Radio>
                      </RadioGroup>
                    </div>
                    <div className="mx-0.5" />
                    <div className="flex flex-col items-center">
                      <Label>
                        Copy the following code on the website you wish to add
                        your chart in.
                      </Label>
                      <textarea
                        id="iframe-text"
                        value={_getEmbedString()}
                        className="w-full"
                        readOnly
                      />
                    </div>
                    <div className="flex items-center">
                      <Button
                        color={iframeCopied ? "success" : "primary"}
                        onClick={_onCopyIframe}
                        variant="secondary"
                        size="sm"
                      >
                        {!iframeCopied && "Copy the code"}
                        {iframeCopied && "Copied to your clipboard"}
                        {iframeCopied ? <LuClipboardCheck /> : <LuClipboard />}
                      </Button>
                    </div>

                    <div className="mx-0.5" />
                    <div className="flex items-center">
                      <Label>Or copy the following URL</Label>
                      <Input
                        value={_getEmbedUrl()}
                        id="url-text"
                        readOnly
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center">
                      <Button
                        color={urlCopied ? "success" : "primary"}
                        variant="secondary"
                        onClick={_onCopyUrl}
                      >
                        {urlCopied ? "Copied to your clipboard" : "Copy URL"}
                      </Button>
                    </div>
                  </>
                )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="secondary"
                color="warning"
                onClick={() => setEmbedModal(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )} */}
    </motion.div>
  );
};

const styles = {
  container: {
    width: "100%",
    height: "100%",
  },
  draft: {
    marginRight: 10,
  },
  filterBtn: (addPadding: boolean) => ({
    position: "absolute",
    right: addPadding ? 40 : 10,
    top: 10,
    backgroundColor: "transparent",
    boxShadow: "none",
  }),
  titleArea: (isKpi: boolean) => ({
    paddingLeft: isKpi ? 15 : 0,
  }),
};

export default Chart;
