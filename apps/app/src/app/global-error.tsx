"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ padding: 24 }}>
        <h2>Une erreur est survenue</h2>
        <p>Veuillez réessayer.</p>
        <button onClick={() => reset()}>Réessayer</button>
      </body>
    </html>
  );
}
