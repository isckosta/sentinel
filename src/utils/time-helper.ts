/**
 * Retrieves the current hour of the day (0-23).
 * @returns The current hour as a number.
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Checks if the current time falls within late night hours (between 10 PM and 6 AM).
 * @returns True if it's late night, false otherwise.
 */
export function isLateNight(): boolean {
  const hour = getCurrentHour();
  return hour >= 22 || hour < 6;
}

/**
 * Checks if the current day is a weekend (Saturday or Sunday).
 * @returns True if it's a weekend, false otherwise.
 */
export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/**
 * Calculates the number of full days that have passed since a given date.
 * @param date The starting date. If null, returns 0.
 * @returns The number of full days since the given date.
 */
export function getDaysSince(date: Date | null): number {
  if (!date) return 0;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
