"use client";

import { useEffect } from "react";
import GlobalErrorPage from "@/components/common/GlobalErrorPage";
import { SystemError } from "@/lib/errors/system-error";
import { logError } from "@/lib/logger";

/**
 * Root Error Boundary for the Next.js App Router.
 * This catches all uncaught errors in the application and renders the
 * centralized Global Error Page.
 */
export default function ErrorBoundary({
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
      logError(error.message || "Uncaught application error", {
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
          code: "APP-ERR",
          traceId: (error as { digest?: string }).digest || "unknown",
          timestamp: new Date().toISOString(),
          service: "kuizz-frontend",
          requestPath:
            typeof window !== "undefined"
              ? window.location.pathname
              : "unknown",
        };

  return (
    <GlobalErrorPage
      errorCode={metadata.code}
      message={error.message || "An unexpected error occurred"}
      traceId={metadata.traceId}
      timestamp={metadata.timestamp}
      service={metadata.service}
      requestPath={metadata.requestPath}
      onRetry={() => reset()}
    />
  );
}
