import { UserError } from "./errors/user-error";
import { SystemError } from "./errors/system-error";

interface ApiErrorResponse {
  code?: string;
  message?: string;
  traceId?: string;
  timestamp?: string;
  service?: string;
  requestPath?: string;
}

/**
 * Utility to convert API error responses into application-specific error classes.
 * Validation errors (400, 422, etc.) -> UserError
 * Server errors (500, etc.) -> SystemError
 */
export const convertApiError = (
  response: ApiErrorResponse,
  status: number,
): UserError | SystemError => {
  const message = response.message || "An unexpected error occurred";
  const metadata = {
    code: response.code,
    traceId: response.traceId,
    timestamp: response.timestamp,
    service: response.service,
    requestPath: response.requestPath,
  };

  if (status >= 400 && status < 500) {
    return new UserError(message, metadata);
  }

  return new SystemError(message, metadata);
};
