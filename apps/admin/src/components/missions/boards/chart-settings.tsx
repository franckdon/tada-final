import React, { useState, useEffect } from "react";
import moment from "moment";
import { DateRangePicker } from "react-date-range";
import { enGB } from "date-fns/locale";
import { CalendarDays, Check, Info, Settings, X } from "lucide-react";
import { Checkbox } from "@tada/ui/components/checkbox";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Button } from "@tada/ui/components/button";
import { defaultInputRanges, defaultStaticRanges } from "@/constants/chart";
import { Chart } from "@/context/board-builder-context";

interface ChartSettingsProps {
  chart: Chart;
  onChange: (changes: Partial<Chart>) => void;
  onComplete: () => void;
}

interface SelectionRange {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface XLabelOption {
  key: string;
  value: string;
  text: string;
}

interface TimeIntervalOption {
  text: string;
  value: string;
}
const xLabelOptions: XLabelOption[] = [
  {
    key: "default",
    value: "default",
    text: "Default",
  },
  {
    key: "showAll",
    value: "showAll",
    text: "Show all",
  },
  {
    key: "half",
    value: "half",
    text: "Half of the values",
  },
  {
    key: "third",
    value: "third",
    text: "A third of the values",
  },
  {
    key: "fourth",
    value: "fourth",
    text: "A fourth of the values",
  },
  {
    key: "custom",
    value: "custom",
    text: "Custom",
  },
];
const timeIntervalOptions: TimeIntervalOption[] = [
  {
    text: "Seconds interval",
    value: "second",
  },
  {
    text: "Minutes interval",
    value: "minute",
  },
  {
    text: "Hourly interval",
    value: "hour",
  },
  {
    text: "Daily interval",
    value: "day",
  },
  {
    text: "Weekly interval",
    value: "week",
  },
  {
    text: "Monthly interval",
    value: "month",
  },
  {
    text: "Yearly interval",
    value: "year",
  },
];

const ChartSettings: React.FC<ChartSettingsProps> = ({
  chart,
  onChange,
  onComplete,
}) => {
  const [initSelectionRange] = useState<SelectionRange>({
    startDate: moment().startOf("month").toDate(),
    endDate: moment().endOf("month").toDate(),
    key: "selection",
  });

  const [dateRangeModal, setDateRangeModal] = useState<boolean>(false);
  const [dateRange, setDateRange] =
    useState<SelectionRange>(initSelectionRange);
  const [labelStartDate, setLabelStartDate] = useState<string>("");
  const [labelEndDate, setLabelEndDate] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [min, setMin] = useState<string>("");
  const [ticksNumber, setTicksNumber] = useState<string>("");
  const [ticksSelection, setTicksSelection] = useState<string>("default");
  const [dateFormattingModal, setDateFormattingModal] =
    useState<boolean>(false);
  const [datesFormat, setDatesFormat] = useState<string | null>(null);

  useEffect(() => {
    if (chart.startDate) {
      _onViewRange(true, true);
    }
  }, []);

  useEffect(() => {
    if (chart.maxValue || chart.maxValue === 0) {
      setMax(chart.maxValue.toString());
    }
    if (chart.maxValue === null) {
      setMax("");
    }
    if (chart.minValue || chart.minValue === 0) {
      setMin(chart.minValue.toString());
    }
    if (chart.minValue === null) {
      setMin("");
    }
  }, [chart.maxValue, chart.minValue]);

  useEffect(() => {
    if (chart.startDate && chart.endDate) {
      setDateRange({
        startDate: new Date(chart.startDate),
        endDate: new Date(chart.endDate),
        key: "selection",
      });
    }
    if (chart.dateVarsFormat) {
      setDatesFormat(chart.dateVarsFormat);
    }
  }, [chart.startDate, chart.endDate]);

  useEffect(() => {
    if (!chart.xLabelTicks || chart.xLabelTicks === "default") {
      setTicksSelection("default");
    } else if (
      chart.xLabelTicks !== "showAll" &&
      chart.xLabelTicks !== "half" &&
      chart.xLabelTicks !== "third" &&
      chart.xLabelTicks !== "fourth"
    ) {
      setTicksSelection("custom");
      setTicksNumber(chart.xLabelTicks);
    } else {
      setTicksSelection(chart.xLabelTicks);
    }
  }, [chart.xLabelTicks]);

  useEffect(() => {
    if (chart.startDate && chart.endDate) {
      let newStartDate = moment(chart.startDate);
      let newEndDate = moment(chart.endDate);

      if (chart.currentEndDate && chart.timeInterval) {
        const timeDiff = newEndDate.diff(
          newStartDate,
          chart.timeInterval as moment.unitOfTime.Diff
        );
        newEndDate = moment()
          .utcOffset(0, true)
          .endOf(chart.timeInterval as moment.unitOfTime.StartOf);

        if (!chart.fixedStartDate) {
          newStartDate = newEndDate
            .clone()
            .subtract(
              timeDiff,
              chart.timeInterval as moment.unitOfTime.DurationConstructor
            )
            .startOf(chart.timeInterval as moment.unitOfTime.StartOf);
        }
      }

      setLabelStartDate(newStartDate.format("ll"));
      setLabelEndDate(newEndDate.format("ll"));
    }
  }, [chart.currentEndDate, dateRange, chart.fixedStartDate]);

  const _onViewRange = (value: boolean, init?: boolean): void => {
    if (!value) {
      onChange({ startDate: undefined, endDate: undefined });
    }

    let isModalOpen = value;
    if (init) {
      isModalOpen = false;
    }

    setDateRangeModal(isModalOpen);
  };

  const _onRemoveDateFiltering = (): void => {
    onChange({ startDate: undefined, endDate: undefined });
  };

  const _onAddPoints = (value: number): void => {
    onChange({ pointRadius: value });
  };

  const _onChangeStacked = (): void => {
    onChange({ stacked: !chart.stacked });
  };

  const _onChangeHorizontal = (): void => {
    onChange({ horizontal: !chart.horizontal });
  };

  const _onChangeDateRange = (range: any): void => {
    const { startDate, endDate } = range.selection;
    setDateRange({ startDate, endDate, key: "selection" });
  };

  const _onComplete = (): void => {
    const { startDate, endDate } = dateRange;

    onChange({
      startDate: moment(startDate).utcOffset(0, true).toDate(),
      endDate: moment(endDate).utcOffset(0, true).toDate(),
    });

    setDateRangeModal(false);
    onComplete();
  };

  const _onChangeTicks = (value: string): void => {
    onChange({ xLabelTicks: value });
  };

  const _onChangeTickCustomValue = (value: string): void => {
    setTicksNumber(value);
  };

  const _onConfirmTicksNumber = (): void => {
    onChange({ xLabelTicks: ticksNumber });
  };

  const _onChangeDateFormat = (): void => {
    onChange({ dateVarsFormat: datesFormat || undefined });
    setDateFormattingModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-600 rounded-lg mx-auto p-4 w-full border">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold">Chart Settings</h3>
      </div>

      <hr className="my-4" />

      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Date settings</h4>
      </div>

      <div className="grid grid-cols-12 gap-2 justify-between mb-4">
        <div className="col-span-12 lg:col-span-6">
          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={() => _onViewRange(true)}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              <CalendarDays size={16} />
              Date filter
            </Button>
            {(chart.startDate || chart.endDate) && (
              <Button
                variant="secondary"
                onClick={_onRemoveDateFiltering}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                title="Remove date filtering"
              >
                <X size={16} />
              </Button>
            )}
            {chart.startDate && chart.endDate && (
              <Button
                onClick={() => setDateFormattingModal(true)}
                className="p-2 hover:bg-gray-50 rounded-md"
                title="Date formatting"
              >
                <Settings size={16} />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {chart.startDate && (
              <span
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm cursor-pointer"
                onClick={() => setDateRangeModal(true)}
              >
                {labelStartDate}
              </span>
            )}
            {chart.startDate && <span>-</span>}
            {chart.endDate && (
              <span
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm cursor-pointer"
                onClick={() => setDateRangeModal(true)}
              >
                {labelEndDate}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="flex flex-row items-center gap-2 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={chart.currentEndDate}
                disabled={!dateRange.endDate}
                onChange={() => {
                  onChange({ currentEndDate: !chart.currentEndDate });
                }}
                className="rounded"
              />
              <span className="text-sm">Auto-update the date range</span>
            </label>

            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md">
                When this is enabled, the date range will be preserved but
                shifted to the present date. This option takes into account the
                date interval as well.
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={!chart.currentEndDate}
              onChange={(e: any) =>
                onChange({ fixedStartDate: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm">Fix the start date</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mb-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-6">
          <label className="block text-sm font-medium mb-2">
            Time interval
          </label>
          <select
            value={chart.timeInterval || ""}
            onChange={(e) => onChange({ timeInterval: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a time interval</option>
            {timeIntervalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-6 sm:col-span-12 md:col-span-6 lg:col-span-6 flex items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chart.includeZeros || false}
              onChange={() => onChange({ includeZeros: !chart.includeZeros })}
              className="rounded"
            />
            <span className="text-sm">Allow zero values</span>
          </label>
        </div>
      </div>

      <hr className="my-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {chart.type === "line" && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(chart.pointRadius || 0) > 0}
              onChange={() => {
                if ((chart.pointRadius || 0) > 0) {
                  _onAddPoints(0);
                } else {
                  _onAddPoints(3);
                }
              }}
              className="rounded"
            />
            <span className="text-sm">Data points</span>
          </label>
        )}

        {chart.type === "bar" && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chart.stacked || false}
              onChange={_onChangeStacked}
              className="rounded"
            />
            <span className="text-sm">Stack datasets</span>
          </label>
        )}

        {chart.type === "bar" && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chart.horizontal || false}
              onChange={_onChangeHorizontal}
              className="rounded"
            />
            <span className="text-sm">Horizontal bars</span>
          </label>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={chart.displayLegend || false}
            onChange={() => onChange({ displayLegend: !chart.displayLegend })}
            className="rounded"
          />
          <span className="text-sm">Legend</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={chart.dataLabels || false}
            onChange={() => onChange({ dataLabels: !chart.dataLabels })}
            className="rounded"
          />
          <span className="text-sm">Data labels</span>
        </label>

        {(chart.type === "line" || chart.type === "bar") && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chart.isLogarithmic || false}
              onChange={(e) => onChange({ isLogarithmic: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Logarithmic scale</span>
          </label>
        )}

        {chart.type === "line" && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chart.dashedLastPoint || false}
              onChange={(e) => onChange({ dashedLastPoint: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Dashed last point</span>
          </label>
        )}
      </div>

      <hr className="my-4" />

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-row items-center gap-2">
          <input
            type="number"
            placeholder="Max Y Axis value"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="flex-1 p-2 border rounded-md"
          />
          <div className="flex gap-1">
            {max && (
              <>
                <button
                  disabled={!max || parseFloat(max) === chart.maxValue}
                  onClick={() => onChange({ maxValue: parseFloat(max) })}
                  className="px-3 py-1 bg-green-500 text-white rounded-md disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    onChange({ maxValue: null });
                    setMax("");
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <input
            type="number"
            placeholder="Min Y Axis value"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="flex-1 p-2 border rounded-md"
          />
          <div className="flex gap-1">
            {min && (
              <>
                <button
                  disabled={!min || parseFloat(min) === chart.minValue}
                  onClick={() => onChange({ minValue: parseFloat(min) })}
                  className="px-3 py-1 bg-green-500 text-white rounded-md disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    onChange({ minValue: null });
                    setMin("");
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12">
          <label className="block text-sm font-medium mb-2">
            Number of labels on the X Axis
          </label>
          <select
            value={ticksSelection}
            onChange={(e) => _onChangeTicks(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {xLabelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>

        {ticksSelection === "custom" && (
          <div className="col-span-12 mt-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter the number of labels"
                value={ticksNumber}
                onChange={(e) => _onChangeTickCustomValue(e.target.value)}
                className="flex-1 p-2 border rounded-md"
              />
              <button
                onClick={_onConfirmTicksNumber}
                className="px-3 py-2 bg-green-500 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Date Range Modal */}
      {dateRangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Set a custom date range for your chart
            </h3>

            <div className="mb-4">
              {chart.currentEndDate && (
                <p className="text-sm text-gray-600 mb-4">
                  The date range is set to auto-update to the current date. If
                  you want to set an exact custom date range, disable the
                  auto-update option.
                </p>
              )}

              <DateRangePicker
                locale={enGB}
                direction="horizontal"
                ranges={[
                  dateRange.startDate && dateRange.endDate
                    ? {
                        startDate: new Date(dateRange.startDate),
                        endDate: new Date(dateRange.endDate),
                        key: "selection",
                      }
                    : initSelectionRange,
                ]}
                onChange={_onChangeDateRange}
                staticRanges={defaultStaticRanges}
                inputRanges={defaultInputRanges as any}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDateRangeModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={_onComplete}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Check size={16} />
                Apply date filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Formatting Modal */}
      {dateFormattingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Set a custom format for your dates
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Chartbrew will use this format when injecting the dates as
                variables in your queries. The variables are{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {"{{start_date}}"}
                </code>{" "}
                and{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {"{{end_date}}"}
                </code>
                .
              </p>

              <input
                type="text"
                placeholder="Enter a date format"
                value={datesFormat || ""}
                onChange={(e) => setDatesFormat(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
              />

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setDatesFormat("YYYY-MM-DD")}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                >
                  YYYY-MM-DD
                </button>
                <button
                  onClick={() => setDatesFormat("YYYY-MM-DD HH:mm:ss")}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                >
                  YYYY-MM-DD HH:mm:ss
                </button>
                <button
                  onClick={() => setDatesFormat("X")}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                >
                  Timestamp (in seconds)
                </button>
                <button
                  onClick={() => setDatesFormat("x")}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                >
                  Timestamp (in ms)
                </button>
              </div>

              <p className="text-xs text-gray-500">
                See{" "}
                <a
                  href="https://momentjs.com/docs/#/displaying/format/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  moment.js documentation
                </a>{" "}
                for how to format dates.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDateFormattingModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={_onChangeDateFormat}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Check size={16} />
                Apply date format
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartSettings;
