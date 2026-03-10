"use client";

import GlobalErrorPage from "@/components/common/GlobalErrorPage";
import React from "react";

export default function ErrorPageTest() {
  const handleRetry = () => {
    console.log("Retry clicked!");
    alert("Retrying...");
  };

  return (
    <GlobalErrorPage
      errorCode="API-500"
      message="Internal Server Error"
      traceId="9f4a2c1b6d7e8f91"
      onRetry={handleRetry}
    />
  );
}
