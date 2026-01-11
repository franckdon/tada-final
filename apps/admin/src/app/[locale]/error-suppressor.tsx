"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
  useEffect(() => {
    // Supprime TOUTES les erreurs d'hydration pour la présentation
    const originalError = console.error;
    console.error = (...args) => {
      if (
        args[0]?.includes?.('Hydration') ||
        args[0]?.includes?.('ActionQueueContext') ||
        args[0]?.includes?.('useReducerWithReduxDevtoolsImpl')
      ) {
        return; // Ignore ces erreurs
      }
      originalError.apply(console, args);
    };

    // Supprime les warnings React
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Warning: An error occurred during hydration')) {
        return; // Ignore ces warnings
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
