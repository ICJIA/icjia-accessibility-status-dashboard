/**
 * @fileoverview Countdown Utilities
 * Shared utilities for calculating countdown timers to the April 24, 2026 compliance deadline.
 * Ensures all countdown timers across the application show identical numbers.
 *
 * @module utils/countdownUtils
 */

/**
 * Represents countdown data
 * @typedef {Object} CountdownData
 * @property {number} days - Days remaining
 * @property {number} hours - Hours remaining (0-23)
 * @property {number} minutes - Minutes remaining (0-59)
 * @property {number} seconds - Seconds remaining (0-59)
 * @property {boolean} isDeadlinePassed - Whether the deadline has passed
 */
export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isDeadlinePassed: boolean;
}

/**
 * The Illinois web accessibility compliance deadline
 * April 24, 2026 at 8:30:00 AM
 */
const COMPLIANCE_DEADLINE = new Date("2026-04-24T08:30:00").getTime();

/**
 * Calculates the countdown to the April 24, 2026 compliance deadline
 * This function is used across all countdown timers to ensure they display identical numbers
 *
 * @function calculateCountdown
 * @returns {CountdownData} Object containing days, hours, minutes, seconds, and deadline status
 *
 * @example
 * const countdown = calculateCountdown();
 * console.log(`${countdown.days} days, ${countdown.hours} hours remaining`);
 */
export function calculateCountdown(): CountdownData {
  const now = new Date().getTime();

  if (now >= COMPLIANCE_DEADLINE) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isDeadlinePassed: true,
    };
  }

  const difference = COMPLIANCE_DEADLINE - now;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isDeadlinePassed: false,
  };
}

/**
 * Gets the total days remaining until the compliance deadline
 * Used for simple day-only displays
 *
 * @function getDaysRemaining
 * @returns {number} Number of days remaining until April 24, 2026
 *
 * @example
 * const daysLeft = getDaysRemaining();
 * console.log(`${daysLeft} days until compliance deadline`);
 */
export function getDaysRemaining(): number {
  const now = new Date().getTime();

  if (now >= COMPLIANCE_DEADLINE) {
    return 0;
  }

  const difference = COMPLIANCE_DEADLINE - now;
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}
