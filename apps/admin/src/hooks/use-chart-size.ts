import { widthSize } from "@/constants/layout-breakpoints";
import { useState, useEffect, useCallback } from "react";

type BreakpointKey = keyof typeof widthSize;

const useChartSize = (layouts: Record<BreakpointKey, unknown>) => {
  const [currentLayout, setCurrentLayout] = useState<unknown>(null);

  const calculateCurrentLayout = useCallback(() => {
    const screenWidth = window.innerWidth;
    let selectedKey: BreakpointKey = "xxs";

    const orderedBreakpoints = Object.keys(widthSize).sort(
      (a, b) => widthSize[a as BreakpointKey] - widthSize[b as BreakpointKey]
    );

    orderedBreakpoints.forEach((key) => {
      if (screenWidth >= widthSize[key as BreakpointKey]) {
        selectedKey = key as BreakpointKey;
      }
    });

    if (!layouts?.[selectedKey]) {
      return;
    }

    setCurrentLayout(layouts[selectedKey]);
  }, [layouts]);

  useEffect(() => {
    calculateCurrentLayout();
    // Update layout on window resize
    window.addEventListener("resize", calculateCurrentLayout);
    return () => {
      window.removeEventListener("resize", calculateCurrentLayout);
    };
  }, [calculateCurrentLayout]);

  return currentLayout;
};

export default useChartSize;
