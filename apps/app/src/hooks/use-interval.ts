import { useEffect, useRef } from "react";

interface UseIntervalOptions {
  callback: () => void;
  delay: number | null;
}

export function useInterval({ callback, delay }: UseIntervalOptions): void {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
