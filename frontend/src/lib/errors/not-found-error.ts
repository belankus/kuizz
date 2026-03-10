import { SystemError } from "./system-error";

/**
 * Represents a 404 Not Found error.
 * Used when a resource is missing or a route is invalid.
 */
export class NotFoundError extends SystemError {
  constructor(
    message: string = "The resource you are looking for could not be found.",
    metadata: {
      code?: string;
      traceId?: string;
      timestamp?: string;
      service?: string;
      requestPath?: string;
    } = {},
  ) {
    super(message, {
      ...metadata,
      code: metadata.code || "NOT_FOUND",
    });
    this.name = "NotFoundError";
  }
}
