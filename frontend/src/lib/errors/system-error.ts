/**
 * Represents application or infrastructure failures.
 * Triggers the Global Error Page and logs as an error.
 */
export class SystemError extends Error {
  public readonly code: string;
  public readonly traceId: string;
  public readonly timestamp: string;
  public readonly service: string;
  public readonly requestPath: string;

  constructor(
    message: string,
    metadata: {
      code?: string;
      traceId?: string;
      timestamp?: string;
      service?: string;
      requestPath?: string;
    } = {},
  ) {
    super(message);
    this.name = "SystemError";
    this.code = metadata.code || "SYS-500";
    this.traceId = metadata.traceId || crypto.randomUUID();
    this.timestamp = metadata.timestamp || new Date().toISOString();
    this.service = metadata.service || "kuizz-frontend";
    this.requestPath =
      metadata.requestPath ||
      (typeof window !== "undefined" ? window.location.pathname : "unknown");

    // Standard Error behavior
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SystemError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      traceId: this.traceId,
      timestamp: this.timestamp,
      service: this.service,
      requestPath: this.requestPath,
    };
  }
}
