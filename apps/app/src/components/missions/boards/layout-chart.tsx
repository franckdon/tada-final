"use client";

import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Switch } from "@tada/ui/components/switch";
import { findIndex, isEqual } from "lodash";
import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import { Check, Loader2, PencilLine } from "lucide-react";
import { Chart } from "@/context/board-builder-context";
import getDashboardLayout from "@/constants/layout-breakpoints";
import { ChartPreview } from "./chart-preview";
import ChartSettings from "./chart-settings";
import { AssistantModal } from "@tada/ui/components/assistant-ui/assistant-modal";
import { useAssistantInstructions } from "@assistant-ui/react";
import ChartBuilder from "./chart-builder";

export const LayoutChart = ({
  params,
  chart,
}: {
  params: {
    orgId: string;
    missionId: string;
    boardId: string;
    chartId: string;
  };
  chart: Chart;
}) => {
  const [titleScreen, setTitleScreen] = useState(true);
  const [newChart, setNewChart] = useState<Chart>(chart);
  const [editingTitle, setEditingTitle] = useState(false);
  const [chartName, setChartName] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [saveRequired, setSaveRequired] = useState(true);
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState<Record<string, string>[]>([]);
  const [useCache, setUseCache] = useState(true);
  const charts: Chart[] = [];

  useAssistantInstructions(
    `
    ### TASK ###

    You are Dina, a data analyst great at visualizing data using vega-lite! Given the user's question, SQL, sample data and sample column values, you need to generate vega-lite schema in JSON and provide suitable chart type.
    Besides, you need to give a concise and easy-to-understand reasoning to describe why you provide such vega-lite schema based on the question, SQL, sample data and sample column values.
    `
  );
  const { height } = useWindowSize();

  useEffect(() => {
    // dispatch(clearAlerts());

    if (params.chartId) {
      charts.map((chart) => {
        if (chart.id === params.chartId) {
          setNewChart(chart);
        }
        return chart;
      });
      setTitleScreen(false);

      // also fetch the chart's datasets and alerts
      /* dispatch(
        getChartAlerts({
          project_id: params.projectId,
          chart_id: params.chartId,
        })
      ); */
    }

    //  dispatch(getTemplates(params.teamId));
  }, []);

  useEffect(() => {
    charts.map((chart) => {
      if (chart.id === params.chartId) {
        if (!isEqual(chart, newChart)) {
          setNewChart(chart);
          setChartName(chart.name as string);
        }
      }
      return chart;
    });
  }, [charts]);

  useEffect(() => {
    let found = false;
    charts.map((chart) => {
      if (chart.id === params.chartId) {
        if (!isEqual(chart, newChart)) {
          setSaveRequired(true);
          found = true;
        }
      }
      return chart;
    });
    if (!found) setSaveRequired(false);
  }, [newChart]);

  const _onNameChange = (value: string) => {
    setChartName(value);
  };

  const _onSubmitNewName = () => {
    setEditingTitle(false);
    _onChangeChart({ name: chartName });
  };

  const _onCreateClicked = () => {
    const tempChart = { ...newChart, name: chartName };

    // add chart at the end of the dashboard
    const layouts = getDashboardLayout(charts);
    let bottomY = 0;
    const chartLayout = {};
    Object.keys(layouts).map((bp) => {
      layouts[bp].forEach((item: any) => {
        const bottom = item.y + item.h;
        if (bottom > bottomY) {
          bottomY = bottom;
        }
      });

      const chartLayout: Record<string, number[]> = {};
      chartLayout[bp] = [
        0,
        bottomY,
        bp === "lg"
          ? 4
          : bp === "md"
          ? 5
          : bp === "sm"
          ? 3
          : bp === "xs"
          ? 2
          : 2,
        2,
      ];
    });

    tempChart.layout = chartLayout;

    /*  return dispatch(
      createChart({ project_id: params.projectId, data: tempChart })
    )
      .then((res) => {
        setNewChart(res.payload);
        setTitleScreen(false);
        navigate(`${res.payload.id}/edit`);
        return true;
      })
      .catch(() => {
        return false;
      }); */
  };

  const _onChangeGlobalSettings = ({
    pointRadius,
    displayLegend,
    dateRange,
    includeZeros,
    timeInterval,
    currentEndDate,
    fixedStartDate,
    maxValue,
    minValue,
    xLabelTicks,
    stacked,
    horizontal,
    dataLabels,
    dateVarsFormat,
    isLogarithmic,
    dashedLastPoint,
  }: Partial<Chart> & {
    dateRange?: { startDate: string; endDate: string };
  }) => {
    if (!newChart) return;

    const tempChart = {
      pointRadius:
        typeof pointRadius !== "undefined" ? pointRadius : newChart.pointRadius,
      displayLegend:
        typeof displayLegend !== "undefined"
          ? displayLegend
          : newChart.displayLegend,
      startDate:
        dateRange?.startDate || dateRange?.startDate === null
          ? dateRange.startDate
          : newChart.startDate,
      endDate:
        dateRange?.endDate || dateRange?.endDate === null
          ? dateRange.endDate
          : newChart.endDate,
      timeInterval: timeInterval || newChart.timeInterval,
      includeZeros:
        typeof includeZeros !== "undefined"
          ? includeZeros
          : newChart.includeZeros,
      currentEndDate:
        typeof currentEndDate !== "undefined"
          ? currentEndDate
          : newChart.currentEndDate,
      fixedStartDate:
        typeof fixedStartDate !== "undefined"
          ? fixedStartDate
          : newChart.fixedStartDate,
      minValue: typeof minValue !== "undefined" ? minValue : newChart.minValue,
      maxValue: typeof maxValue !== "undefined" ? maxValue : newChart.maxValue,
      xLabelTicks:
        typeof xLabelTicks !== "undefined" ? xLabelTicks : newChart.xLabelTicks,
      stacked: typeof stacked !== "undefined" ? stacked : newChart.stacked,
      horizontal:
        typeof horizontal !== "undefined" ? horizontal : newChart.horizontal,
      dataLabels:
        typeof dataLabels !== "undefined" ? dataLabels : newChart.dataLabels,
      dateVarsFormat:
        dateVarsFormat !== "undefined"
          ? dateVarsFormat
          : newChart.dateVarsFormat,
      isLogarithmic:
        typeof isLogarithmic !== "undefined"
          ? isLogarithmic
          : newChart.isLogarithmic,
      dashedLastPoint:
        typeof dashedLastPoint !== "undefined"
          ? dashedLastPoint
          : newChart.dashedLastPoint,
    };

    let skipParsing = false;
    if (
      pointRadius ||
      displayLegend ||
      minValue ||
      maxValue ||
      xLabelTicks ||
      stacked ||
      horizontal ||
      dashedLastPoint
    ) {
      skipParsing = true;
    }

    _onChangeChart(tempChart as Chart, skipParsing);
  };

  const _onChangeChart = (
    data: Partial<
      Chart & { dateRange?: { startDate: string; endDate: string } }
    >,
    skipParsing?: boolean
  ) => {
    let shouldSkipParsing = skipParsing;
    setNewChart({ ...newChart, ...data } as Chart);
    setLoading(true);
    /* return dispatch(
      updateChart({
        project_id: params.projectId,
        chart_id: params.chartId,
        data,
      })
    )
      .then((newData) => {
        if (!toastOpen) {
          toast.success("Updated the chart 📈", {
            onClose: () => setToastOpen(false),
            onOpen: () => setToastOpen(true),
          });
        }

        if (skipParsing || data.datasetColor || data.fillColor || data.type) {
          shouldSkipParsing = true;
        }

        // run the preview refresh only when it's needed
        if (!data.name) {
          if (data.subType || data.type) {
            _onRefreshData();
          } else {
            _onRefreshPreview(shouldSkipParsing);
          }
        }

        setLoading(false);
        return Promise.resolve(newData);
      })
      .catch((e) => {
        toast.error("Oups! Can't save the chart. Please try again.");
        setLoading(false);
        return Promise.reject(e);
      }); */
  };

  const _onRefreshData = (filters = []) => {
    if (!params.chartId) return;

    const getCache = useCache;

    /*     dispatch(
      runQuery({
        project_id: params.projectId,
        chart_id: params.chartId,
        noSource: false,
        skipParsing: false,
        filters,
        getCache,
      })
    )
      .then(() => {
        if (conditions.length > 0) {
          return dispatch(
            runQueryWithFilters({
              project_id: params.projectId,
              chart_id: newChart.id,
              filters: conditions,
            })
          );
        }

        return true;
      })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        toast.error(
          "We couldn't fetch the data. Please check your dataset settings and try again",
          {
            autoClose: 2500,
          }
        );
        setLoading(false);
      }); */
  };

  const _onRefreshPreview = (skipParsing = true, filters = []) => {
    if (!params.chartId) return;
    /*  dispatch(
      runQuery({
        project_id: params.projectId,
        chart_id: params.chartId,
        noSource: true,
        skipParsing,
        filters,
        getCache: true,
      })
    )
      .then(() => {
        if (conditions.length > 0) {
          return dispatch(
            runQueryWithFilters({
              project_id: params.projectId,
              chart_id: newChart.id,
              filters: conditions,
            })
          );
        }

        return true;
      })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      }); */
  };

  const _onAddFilter = (condition: Record<string, string>) => {
    let found = false;
    const newConditions = conditions.map((c) => {
      let newCondition = c;
      if (c.id === condition.id) {
        newCondition = condition;
        found = true;
      }
      return newCondition;
    });
    if (!found) newConditions.push(condition);
    setConditions(newConditions);

    /*    dispatch(
      runQueryWithFilters({
        project_id: params.projectId,
        chart_id: newChart.id,
        filters: [condition],
      })
    ); */
  };

  const _onClearFilter = (condition: Record<string, string>) => {
    const newConditions = [...conditions];
    const clearIndex = findIndex(conditions, { id: condition.id });
    if (clearIndex > -1) newConditions.splice(clearIndex, 1);

    setConditions(newConditions);
    /*  dispatch(
      runQueryWithFilters({
        project_id: params.projectId,
        chart_id: newChart.id,
        filters: [condition],
      })
    ); */
  };

  return (
    <div style={styles.container(height)} className="md:pl-4 md:pr-4 ">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex chart-name-tut">
              {!editingTitle && (
                <Button
                  onClick={() => setEditingTitle(true)}
                  color="primary"
                  variant="outline"
                >
                  <PencilLine />
                  <div className="mx-2" />
                  <span className="font-bold">{newChart?.name}</span>
                </Button>
              )}

              {editingTitle && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    _onSubmitNewName();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Input
                      placeholder="Enter a title"
                      value={chartName}
                      onChange={(e) => _onNameChange(e.target.value)}
                    />
                    <div className="mx-2" />
                    <Button
                      color="success"
                      type="submit"
                      onClick={_onSubmitNewName}
                      size="sm"
                    >
                      <Check />
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div className="flex flex-end items-center chart-actions-tut">
              <div style={{ display: "flex" }}>
                <Switch
                  checked={newChart?.draft}
                  onCheckedChange={() =>
                    _onChangeChart({ draft: !newChart?.draft })
                  }
                />
                <div className="mx-2" />
                <span>Draft</span>
              </div>
              <div className="mx-4" />
              <Button
                color={saveRequired ? "primary" : "success"}
                onClick={() => _onChangeChart({})}
                size="sm"
                variant={saveRequired ? "outline" : "secondary"}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : saveRequired ? (
                  "Save chart"
                ) : (
                  "Chart saved"
                )}
              </Button>
            </div>
          </div>

          <div className="my-8" />
          <div className="flex chart-type-tut bg-content1 rounded-lg">
            {/* <ChartPreview
              chart={newChart as Chart}
              onChange={_onChangeChart}
              onRefreshData={_onRefreshData as any}
              onRefreshPreview={_onRefreshPreview}
              onAddFilter={_onAddFilter as any}
              onClearFilter={_onClearFilter}
             conditions={conditions} 
              useCache={useCache}
              changeCache={() => setUseCache(!useCache)}
              chartLoading={false}
            /> */}
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 add-dataset-tut mt-12">
          <div className={"bg-content1 rounded-lg mx-auto p-4 w-full"}>
            <div className="flex">
              <ChartBuilder />
              {/*  {params.chartId &&
                newChart?.type &&
                newChart?.ChartDatasetConfigs?.length > 0 && (
                  <ChartSettings
                    chart={newChart}
                    onChange={_onChangeGlobalSettings}
                    onComplete={(skipParsing = false) =>
                      _onRefreshPreview(skipParsing)
                    }
                  />
                )} */}
            </div>
          </div>
        </div>
      </div>
      <AssistantModal />
    </div>
  );
};

const styles = {
  container: (height: number) => ({
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: height,
  }),
  mainContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  mainSegment: {
    minHeight: 600,
  },
  topBuffer: {
    marginTop: 20,
  },
  addDataset: {
    marginTop: 10,
  },
  datasetButtons: {
    marginBottom: 10,
    marginRight: 3,
  },
  editTitle: {
    cursor: "pointer",
  },
  tutorialBtn: {
    boxShadow: "none",
    marginTop: -10,
  },
};
