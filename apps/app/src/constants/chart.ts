import moment from "moment";
import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays,
  subDays,
} from "date-fns";

export const primary = "#1a7fa0";
export const secondary = "#f69977";
export const teal = "#88BFc4";
export const blue = "#103751";
export const orange = "#cf6b4e";
export const lightGray = "#ECEFF1";
export const darkBlue = "#0c293c";
export const dark = "#09151C";
export const positive = "#0FC457";
export const negative = "#EF4444";
export const neutral = "#767676";

const defineds = {
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
};

const staticRangeHandler: any = {
  range: {},
  isSelected(range: any) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  },
};

export function createStaticRanges(ranges: any) {
  return ranges.map((range: any) => ({ ...staticRangeHandler, ...range }));
}

export const defaultStaticRanges = createStaticRanges([
  {
    label: "Last 7 days",
    range: () => ({
      startDate: subDays(defineds.startOfToday, 7),
      endDate: defineds.endOfToday,
    }),
  },
  {
    label: "Last 30 days",
    range: () => ({
      startDate: subDays(defineds.startOfToday, 30),
      endDate: defineds.endOfToday,
    }),
  },
  {
    label: "Last 60 days",
    range: () => ({
      startDate: subDays(defineds.startOfToday, 60),
      endDate: defineds.endOfToday,
    }),
  },
  {
    label: "Last 90 days",
    range: () => ({
      startDate: subDays(defineds.startOfToday, 90),
      endDate: defineds.endOfToday,
    }),
  },
]);

export const defaultInputRanges = [
  {
    label: "days up to today",
    range(value: string) {
      return {
        startDate: addDays(
          defineds.startOfToday,
          Math.max(Number(value), 1) * -1
        ),
        endDate: defineds.endOfToday,
      };
    },
    getCurrentValue(range: { startDate: Date; endDate: Date }) {
      if (!isSameDay(range.endDate, defineds.endOfToday)) return "-";
      if (!range.startDate) return "∞";
      return differenceInCalendarDays(defineds.endOfToday, range.startDate);
    },
  },
  {
    label: "days starting today",
    range(value: string) {
      const today = new Date();
      return {
        startDate: today,
        endDate: addDays(today, Math.max(Number(value), 1) - 1),
      };
    },
    getCurrentValue(range: { startDate: Date; endDate: Date }) {
      if (!isSameDay(range.startDate, defineds.startOfToday)) return "-";
      if (!range.endDate) return "∞";
      return differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1;
    },
  },
];

export function primaryTransparent(opacity = 1.0) {
  return `rgba(26, 127, 160, ${opacity})`;
}

export function secondaryTransparent(opacity = 1.0) {
  return `rgba(246, 153, 119, ${opacity})`;
}

export function whiteTransparent(opacity = 1.0) {
  return `rgba(255, 255, 255, ${opacity})`;
}

export function blackTransparent(opacity = 1.0) {
  return `rgba(0, 0, 0, ${opacity})`;
}

export function darkTransparent(opacity = 1.0) {
  return `rgba(9, 21, 28, ${opacity})`;
}

interface ChartColor {
  hex: string;
  rgb: string;
}

export const chartColors: Record<string, ChartColor> = {
  blue: {
    hex: "#4285F4",
    rgb: "rgba(66, 133, 244, 1)",
  },
  amber: {
    hex: "#FF9800",
    rgb: "rgba(255, 152, 0, 1)",
  },
  teal: {
    hex: "#26A69A",
    rgb: "rgba(38, 166, 154, 1)",
  },
  fuchsia: {
    hex: "#D602EE",
    rgb: "rgba(214, 2, 238, 1)",
  },
  lime: {
    hex: "#C0CA33",
    rgb: "rgba(192, 202, 51, 1)",
  },
  deep_fuchsia: {
    hex: "#9C27B0",
    rgb: "rgba(156, 39, 176, 1)",
  },
  orange: {
    hex: "#EE6002",
    rgb: "rgba(238, 96, 2, 1)",
  },
  light_purple: {
    hex: "#C8A1FF",
    rgb: "rgba(200, 161, 255, 1)",
  },
  green: {
    hex: "#43A047",
    rgb: "rgba(67, 160, 71, 1)",
  },
  rose: {
    hex: "#D81B60",
    rgb: "rgba(216, 27, 96, 1)",
  },
  purple: {
    hex: "#6200EE",
    rgb: "rgba(98, 0, 238, 1)",
  },
  yellow: {
    hex: "#FFC107",
    rgb: "rgba(255, 193, 7, 1)",
  },
  deep_purple: {
    hex: "#3B00ED",
    rgb: "rgba(59, 0, 237, 1)",
  },
  error: {
    hex: "#B00020",
    rgb: "rgba(176, 0, 32, 1)",
  },
  pink: {
    hex: "#EB3693",
    rgb: "rgba(235, 54, 147, 1)",
  },
};

export const fillChartColors = [""];

export const Colors = {
  primary,
  secondary,
  teal,
  blue,
  orange,
  lightGray,
  darkBlue,
  dark,
  positive,
  negative,
  neutral,
};

// regex to check if the string is made only of numbers
const checkNumbersOnly = /^\d+(\.\d+)?$/;
// regex to check if numbers only and if length is 10 or 13
const checkNumbersOnlyAndLength = /^\d{10,13}$/;

const dateFormats = [
  "YYYY-MM-DD",
  "MM-DD-YYYY",
  "DD-MM-YYYY",
  "YYYY/MM/DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD HH:mm",
  "MM-DD-YYYY HH:mm",
  "DD-MM-YYYY HH:mm",
  "YYYY/MM/DD HH:mm",
  "MM/DD/YYYY HH:mm",
  "DD/MM/YYYY HH:mm",
  "YYYY-MM-DD HH:mm:ss",
  "MM-DD-YYYY HH:mm:ss",
  "DD-MM-YYYY HH:mm:ss",
  "YYYY/MM/DD HH:mm:ss",
  "MM/DD/YYYY HH:mm:ss",
  "DD/MM/YYYY HH:mm:ss",
  "YYYY-MM-DDTHH:mm:ssZ",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  moment.ISO_8601, // ISO 8601
  "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
  "YYYY-MM-DDTHH:mm:ss.SSSZ", // ISO 8601 with milliseconds
  "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (zz)",
  "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ [(]zz[)]",
  "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ",
];

function isLikelyDate(value: any, type: any) {
  const rawData = type === "object" ? value.toISOString() : String(value);
  const data = rawData.replace(/\(.*\)/, "").trim();

  if (
    data &&
    ((!Number.isNaN(new Date(data).getTime()) &&
      data.length > 9 &&
      data.replace(/\D/g, "").length > 3 &&
      data.replace(/\D/g, "").length < 14 &&
      (data[0] === "1" || data[0] === "2")) ||
      ((moment(data, dateFormats, true).isValid() ||
        moment(data, moment.ISO_8601).isValid()) &&
        !checkNumbersOnlyAndLength.test(data) &&
        ((typeof data === "number" && data.toString().length === 10) ||
          (typeof data !== "number" && !checkNumbersOnly.test(data)))) ||
      (moment(data, "X").isValid() &&
        typeof data === "string" &&
        data.length === 10 &&
        checkNumbersOnlyAndLength.test(data)) ||
      (data &&
        data.length === 10 &&
        data[0] === "1" &&
        moment(data, "X").isValid() &&
        typeof data === "number") ||
      (checkNumbersOnlyAndLength.test(data) && moment(data, "x").isValid()))
  ) {
    return true;
  }

  return false;
}

export default function determineType(data: any) {
  let dataType;
  if (data !== null && typeof data === "object" && data instanceof Array) {
    dataType = "array";
  }
  if (data !== null && typeof data === "object" && !(data instanceof Array)) {
    dataType = "object";
  }
  if (
    typeof data !== "object" &&
    !(data instanceof Array) &&
    typeof data === "boolean"
  ) {
    dataType = "boolean";
  }
  if (
    typeof data !== "object" &&
    !(data instanceof Array) &&
    (typeof data === "number" || `${data}`.match(checkNumbersOnly))
  ) {
    dataType = "number";
  }
  if (
    typeof data !== "object" &&
    !(data instanceof Array) &&
    typeof data === "string" &&
    !`${data}`.match(checkNumbersOnly)
  ) {
    dataType = "string";
  }

  try {
    if (isLikelyDate(data, dataType)) {
      dataType = "date";
    }
  } catch (e) {
    //
  }

  return dataType;
}
