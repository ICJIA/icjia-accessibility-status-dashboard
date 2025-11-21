/**
 * Timeout Manager - Handles timeout logic for long-running scans
 */

export interface TimeoutManager {
  checkTimeout(): boolean;
  getRemainingTime(): number;
  getElapsedTime(): string;
  getElapsedSeconds(): number;
}

/**
 * Create a timeout manager for a scan with specified duration
 * @param durationHours - Duration in hours
 * @returns TimeoutManager instance
 */
export function createTimeoutManager(durationHours: number): TimeoutManager {
  const startTime = Date.now();
  const durationMs = durationHours * 60 * 60 * 1000;

  return {
    /**
     * Check if timeout has been exceeded
     */
    checkTimeout(): boolean {
      const elapsed = Date.now() - startTime;
      return elapsed >= durationMs;
    },

    /**
     * Get remaining time in milliseconds
     */
    getRemainingTime(): number {
      const elapsed = Date.now() - startTime;
      return Math.max(0, durationMs - elapsed);
    },

    /**
     * Get elapsed time as formatted string (HH:MM:SS)
     */
    getElapsedTime(): string {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      const h = hours.toString().padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");

      return `${h}:${m}:${s}`;
    },

    /**
     * Get elapsed time in seconds
     */
    getElapsedSeconds(): number {
      return Math.floor((Date.now() - startTime) / 1000);
    },
  };
}

