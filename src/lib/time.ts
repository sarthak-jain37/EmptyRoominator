/**
 * Time utility functions for EmptyRoominator
 */

export const OPERATING_START = 8 * 60; // 8:00 AM (480 mins)
export const OPERATING_END = 20 * 60;   // 8:00 PM (1200 mins)

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DAY_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday"
};

/**
 * Converts "HH:MM" (24h) to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to "HH:MM" (24h format for <input type="time">)
 */
export function minutesToTimeString(minutes: number): string {
  const bounded = Math.max(0, Math.min(24 * 60 - 1, minutes));
  const h = Math.floor(bounded / 60);
  const m = bounded % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Formats minutes from midnight to 12-hour format e.g. "11:00 AM", "01:45 PM"
 */
export function formatMinutesTo12Hour(minutes: number): string {
  const bounded = Math.max(0, Math.min(24 * 60 - 1, minutes));
  let h = Math.floor(bounded / 60);
  const m = bounded % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Rounds up minutes to the next 5-minute interval
 * e.g. 10:32 (632) -> 10:35 (635)
 *      10:36 (636) -> 10:40 (640)
 *      10:40 (640) -> 10:40 (640)
 */
export function roundUpTo5Minutes(minutes: number): number {
  const remainder = minutes % 5;
  if (remainder === 0) return minutes;
  return minutes + (5 - remainder);
}

/**
 * Computes default start and end times based on the current local time.
 * If current time is outside 8 AM - 8 PM, defaults to 08:00 or current clamped safely.
 */
export function getDefaultTimes(): { startMinutes: number; endMinutes: number; day: string } {
  const now = new Date();
  const dayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
  const dayMap: Record<number, string> = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    0: "Mon" // If Sunday, default to Mon
  };
  const currentDay = dayMap[dayIndex] || "Mon";

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let startMinutes = roundUpTo5Minutes(currentMinutes);

  // If before 8 AM or after 7 PM, give a sensible default like 9:00 AM or clamp
  if (startMinutes < OPERATING_START || startMinutes >= OPERATING_END - 15) {
    startMinutes = 9 * 60; // 09:00 AM
  }

  const endMinutes = Math.min(OPERATING_END, startMinutes + 60);

  return {
    startMinutes,
    endMinutes,
    day: currentDay
  };
}

/**
 * Formats duration in minutes to human friendly string e.g. "45 minutes", "1 hour", "1 hr 30 mins"
 */
export function formatDuration(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${durationMinutes} minutes`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (mins === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${hours} hr ${mins} mins`;
}

/**
 * Determines current semester phase:
 * "first_half" is before October 11th.
 * "second_half" is on or after October 11th.
 */
export function getCurrentSemesterPhase(date: Date = new Date()): "first_half" | "second_half" {
  // Month is 0-indexed (9 = October).
  // October 11th is month = 9, date = 11.
  const month = date.getMonth();
  const dayOfMonth = date.getDate();

  // If month is after October (Nov, Dec) or Oct 11 onwards -> second_half
  if (month > 9 || (month === 9 && dayOfMonth >= 11)) {
    return "second_half";
  }
  return "first_half";
}


