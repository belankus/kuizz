"use client";

import React from "react";
import { handleError } from "@/lib/handle-error";
import { UserError } from "@/lib/errors/user-error";
import { SystemError } from "@/lib/errors/system-error";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Toaster } from "sonner";

export default function ErrorTestPage() {
  const triggerUserError = () => {
    try {
      throw new UserError("Failed to save changes. Please try again.", {
        code: "USER-401",
        service: "auth-service",
      });
    } catch (error) {
      handleError(error);
    }
  };

  const triggerSystemError = () => {
    try {
      throw new SystemError("Critical Database connection failure.", {
        code: "SYS-001",
        service: "postgres-db",
        traceId: "test-trace-id-123",
      });
    } catch (error) {
      handleError(error);
    }
  };

  const triggerUnexpectedError = () => {
    try {
      // Simulate an unexpected error (like a null pointer or undefined property)
      // @ts-expect-error - deliberate runtime error for testing
      console.log(undefined.y);
    } catch (error) {
      handleError(error);
    }
  };

  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new SystemError("This is a manual render-cycle error.", {
      code: "RENDER-500",
      service: "test-ui",
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <Toaster position="top-right" richColors />

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Error Handling Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Use the buttons below to trigger different types of errors and
            verify the system behavior. Check the browser console for structured
            Pino logs (JSON).
          </p>

          <Button
            onClick={triggerUserError}
            variant="outline"
            className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            Trigger UserError (Toast)
          </Button>

          <Button
            onClick={triggerSystemError}
            variant="outline"
            className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          >
            Trigger SystemError (Global Page)
          </Button>

          <Button
            onClick={triggerUnexpectedError}
            variant="outline"
            className="w-full border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            Trigger Unexpected Error
          </Button>

          <Button
            onClick={() => setShouldThrow(true)}
            variant="ghost"
            className="mt-2 w-full text-xs text-gray-400 hover:text-red-500"
          >
            Force Render Error (Test Boundary)
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-xs text-gray-400">
        <p>Logging to stdout is handled by Pino.</p>
        <p>SystemErrors throw to the root Error Boundary.</p>
      </div>
    </div>
  );
}
