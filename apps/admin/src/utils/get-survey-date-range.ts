import {
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  isSameMonth,
} from "date-fns";

type DateFilter =
  | "this_year"
  | "last_year"
  | "this_month"
  | "last_30_days"
  | { start: Date; end: Date };

export function getDateRange(filter: DateFilter): { start: Date; end: Date } {
  const now = new Date();
  switch (filter) {
    case "this_year":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "last_year":
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_30_days":
      return { start: subDays(now, 30), end: now };
    default:
      return filter;
  }
}
