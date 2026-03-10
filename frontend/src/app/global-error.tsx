"use client";

import { useEffect } from "react";
import GlobalErrorPage from "@/components/common/GlobalErrorPage";
import { SystemError } from "@/lib/errors/system-error";
import { logError } from "@/lib/logger";

/**
 * Global Error Boundary for the Next.js App Router (Root Layout errors).
 * Must wrap <html> and <body> tags because it replaces the entire layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to stdout via Pino
    if (error instanceof SystemError) {
      logError(error.message, error.toJSON());
    } else {
      logError(error.message || "Global uncaught application error", {
        name: error.name,
        stack: error.stack,
        digest: error.digest,
      });
    }
  }, [error]);

  // Extract metadata if it's a SystemError, otherwise use defaults
  const metadata =
    error instanceof SystemError
      ? error.toJSON()
      : {
          code: "GLOBAL-ERR",
          traceId: (error as { digest?: string }).digest || "unknown",
          timestamp: new Date().toISOString(),
          service: "kuizz-frontend",
          requestPath: "root-layout",
        };

  return (
    <html lang="en">
      <body>
        <GlobalErrorPage
          errorCode={metadata.code}
          message={error.message || "A critical system error occurred"}
          traceId={metadata.traceId}
          timestamp={metadata.timestamp}
          service={metadata.service}
          requestPath={metadata.requestPath}
          onRetry={() => reset()}
        />
      </body>
    </html>
  );
}
