/**
 * @fileoverview ComplianceCountdown Component
 * Displays a countdown timer to the April 24, 2026 Illinois web accessibility compliance deadline.
 * Shows days, hours, minutes, and seconds remaining with a visual progress bar.
 * Uses shared countdown utility to ensure all timers display identical numbers.
 *
 * @module components/ComplianceCountdown
 */

import { useEffect, useState } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { calculateCountdown, CountdownData } from "../utils/countdownUtils";

/**
 * ComplianceCountdown Component
 *
 * Displays a countdown timer to the Illinois web accessibility compliance deadline (April 24, 2026).
 * Features:
 * - Real-time countdown updating every second
 * - Visual display of days, hours, minutes, and seconds
 * - Progress bar showing time elapsed
 * - Automatically hides when deadline passes
 * - Responsive design with dark mode support
 *
 * @component
 * @returns {React.ReactElement|null} The countdown component or null if deadline has passed
 *
 * @example
 * <ComplianceCountdown />
 */
export function ComplianceCountdown() {
  const [countdown, setCountdown] = useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isDeadlinePassed: false,
  });

  useEffect(() => {
    // Calculate immediately
    setCountdown(calculateCountdown());

    // Update every second
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render if deadline has passed
  if (countdown.isDeadlinePassed) {
    return null;
  }

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-md">
      <div className="flex items-start gap-4">
        <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Illinois Web Accessibility Compliance Deadline
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All state websites must be accessible by{" "}
            <strong>April 24, 2026</strong>
          </p>

          {/* Countdown Display */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {/* Days */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {String(countdown.days).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                {countdown.days === 1 ? "Day" : "Days"}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {String(countdown.hours).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                Hours
              </div>
            </div>

            {/* Minutes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {String(countdown.minutes).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                Minutes
              </div>
            </div>

            {/* Seconds */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                Seconds
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    ((365 * 24 * 60 * 60 -
                      (countdown.days * 24 * 60 * 60 +
                        countdown.hours * 60 * 60 +
                        countdown.minutes * 60 +
                        countdown.seconds)) /
                      (365 * 24 * 60 * 60)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Use this dashboard to track your website's accessibility progress
            and ensure compliance before the deadline.
          </p>
        </div>
      </div>
    </div>
  );
}
