import { toast } from "sonner";
import { UserError } from "./errors/user-error";
import { SystemError } from "./errors/system-error";
import { logWarn, logError } from "./logger";
import { errorHub } from "./error-hub";
import { NotFoundError } from "./errors/not-found-error";

/**
 * Global error handler for the application.
 * Distinguishes between UserError (recoverable) and SystemError (critical).
 */
export const handleError = (error: unknown) => {
  if (error instanceof UserError) {
    logWarn(error.message, error.toJSON());
    toast.error(error.message);
    return;
  }

  const systemError =
    error instanceof NotFoundError
      ? error
      : error instanceof SystemError
        ? error
        : error instanceof Error
          ? new SystemError(error.message, { code: "UNEXPECTED_ERROR" })
          : new SystemError("An unexpected runtime error occurred", {
              code: "UNKNOWN_ERROR",
            });

  // Log 404 as warning, other system errors as errors
  if (systemError instanceof NotFoundError) {
    logWarn(systemError.message, systemError.toJSON());
  } else {
    logError(systemError.message, systemError.toJSON());
  }

  // Broadcast to the Error Hub so the UI can respond
  errorHub.emit(systemError);
};
