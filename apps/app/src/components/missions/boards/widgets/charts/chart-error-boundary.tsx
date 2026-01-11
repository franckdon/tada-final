import React, { useState, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function ChartErrorBoundary({ children }: Props): ReactNode {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Chart Error:", error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        <div className="text-center">
          <p className="mb-2">Something went wrong with the chart.</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ChartErrorBoundary;
