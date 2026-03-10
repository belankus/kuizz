"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { errorHub } from "@/lib/error-hub";
import { SystemError } from "@/lib/errors/system-error";
import GlobalErrorPage from "@/components/common/GlobalErrorPage";

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * Provider that listens for global system errors and renders the
 * Global Error Page if one occurs.
 */
export default function ErrorProvider({ children }: ErrorProviderProps) {
  const [activeError, setActiveError] = useState<SystemError | null>(null);

  useEffect(() => {
    // Listen for broadcasted errors from handleError()
    const unsubscribe = errorHub.subscribe((error) => {
      setActiveError(error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (activeError) {
    const metadata = activeError.toJSON();

    return (
      <GlobalErrorPage
        errorCode={metadata.code}
        message={activeError.message}
        traceId={metadata.traceId}
        timestamp={metadata.timestamp}
        service={metadata.service}
        requestPath={metadata.requestPath}
        onRetry={() => {
          setActiveError(null);
          window.location.reload();
        }}
      />
    );
  }

  return <>{children}</>;
}
