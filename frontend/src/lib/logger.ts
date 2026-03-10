import pino from "pino";

/**
 * Pino logger instance configured for structured JSON logging to stdout.
 * This integrates with Docker -> Promtail -> Loki -> Grafana pipeline.
 */
const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
  base: {
    env: process.env.NODE_ENV,
    service: "kuizz-frontend",
  },
  // Ensure we only output to stdout (pino default)
  browser: {
    asObject: true,
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => new Date().toISOString(),
});

export const logInfo = (
  message: string,
  metadata?: Record<string, unknown>,
) => {
  logger.info(metadata, message);
};

export const logWarn = (
  message: string,
  metadata?: Record<string, unknown>,
) => {
  logger.warn(metadata, message);
};

export const logError = (
  message: string,
  metadata?: Record<string, unknown>,
) => {
  logger.error(metadata, message);
};

export default logger;
