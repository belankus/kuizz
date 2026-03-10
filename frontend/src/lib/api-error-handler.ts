import { UserError } from "./errors/user-error";
import { SystemError } from "./errors/system-error";
import { NotFoundError } from "./errors/not-found-error";

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
 * Not Found (404) -> NotFoundError
 * Server errors (500, etc.) -> SystemError
 */
export const convertApiError = (
  response: ApiErrorResponse,
  status: number,
): UserError | SystemError | NotFoundError => {
  let message = response.message;

  // Provide better default messages if none returned from API
  if (!message) {
    if (status === 404) message = "The requested resource was not found.";
    else if (status === 401)
      message = "You are not authorized to perform this action.";
    else if (status === 403)
      message = "You do not have permission to access this resource.";
    else if (status >= 400 && status < 500)
      message = "Invalid request parameters.";
    else message = "An unexpected server error occurred.";
  }

  const metadata = {
    code: response.code,
    traceId: response.traceId,
    timestamp: response.timestamp,
    service: response.service,
    requestPath: response.requestPath,
  };

  if (status === 404) {
    return new NotFoundError(message, metadata);
  }

  if (status >= 400 && status < 500) {
    return new UserError(message, metadata);
  }

  return new SystemError(message, metadata);
};

/**
 * Helper to handle Fetch API responses.
 * Automatically parses JSON errors and throws either UserError or SystemError.
 */
export const handleApiError = async (response: Response) => {
  if (response.ok) return;

  let errorData: ApiErrorResponse = {};

  try {
    // Attempt to parse JSON error message from server
    errorData = await response.json();
  } catch {
    // If JSON parsing fails (e.g., HTML 404/500 page or empty response),
    // we use the status code to generate a reasonable default error.
  }

  throw convertApiError(errorData, response.status);
};
