export const cols = {
  xxxl: 16,
  xxl: 16,
  xl: 14,
  lg: 12,
  md: 10,
  sm: 8,
  xs: 6,
  xxs: 4,
};

export const margin: Record<keyof typeof cols, [number, number]> = {
  xxxl: [12, 12],
  xxl: [12, 12],
  xl: [12, 12],
  lg: [12, 12],
  md: [12, 12],
  sm: [12, 12],
  xs: [12, 12],
  xxs: [12, 12],
};
export const widthSize = {
  xxxl: 3840,
  xxl: 2560,
  xl: 1600,
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 240,
};

const rowHeight = 150;
export const heightSize = {
  xxxl: 5 * rowHeight,
  xxl: 5 * rowHeight,
  xl: 5 * rowHeight,
  lg: 5 * rowHeight,
  md: 4 * rowHeight,
  sm: 3 * rowHeight,
  xs: 2 * rowHeight,
  xxs: rowHeight,
};

type BreakpointKey = keyof typeof widthSize;

export const getWidthBreakpoint = (
  containerRef: React.RefObject<HTMLDivElement>
): BreakpointKey => {
  if (!containerRef?.current?.offsetWidth) return "md";
  const containerWidth = containerRef.current.offsetWidth;
  let chartBreakpoint: BreakpointKey = "md";

  (Object.keys(widthSize) as BreakpointKey[]).forEach((breakpoint) => {
    if (containerWidth < widthSize[breakpoint]) {
      chartBreakpoint = breakpoint;
    }
  });

  return chartBreakpoint;
};

export const getHeightBreakpoint = (
  containerRef: React.RefObject<HTMLDivElement>
): BreakpointKey => {
  if (!containerRef?.current?.offsetHeight) return "md";
  const containerHeight = containerRef.current.offsetHeight;
  let chartBreakpoint: BreakpointKey = "md";

  (Object.keys(heightSize) as BreakpointKey[]).forEach((breakpoint) => {
    if (containerHeight < heightSize[breakpoint]) {
      chartBreakpoint = breakpoint;
    }
  });

  return chartBreakpoint;
};

export default function getDashboardLayout(
  charts: Record<string, any>[]
): Record<string, any> {
  const layouts = Object.keys(widthSize).reduce<Record<string, any[]>>(
    (acc, key) => {
      acc[key] = [];
      return acc;
    },
    {}
  );

  charts.forEach((chart) => {
    if (chart.layout) {
      Object.keys(chart.layout).forEach((key) => {
        if (layouts[key]) {
          layouts[key].push({
            i: chart.id.toString(),
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

  return layouts;
}
