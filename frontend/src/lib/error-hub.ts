import { SystemError } from "./errors/system-error";

type ErrorListener = (error: SystemError) => void;

/**
 * A central hub to manage global system errors.
 * This allows plain TypeScript/JS functions to trigger a React UI change.
 */
class ErrorHub {
  private listeners: Set<ErrorListener> = new Set();

  /**
   * Subscribe to global system errors.
   */
  subscribe(listener: ErrorListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit a system error to all listeners.
   */
  emit(error: SystemError) {
    this.listeners.forEach((listener) => listener(error));
  }
}

export const errorHub = new ErrorHub();
