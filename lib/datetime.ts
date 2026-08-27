// Pure date/time helpers for the entry form. No AsyncStorage, no component imports —
// isolated for unit testing, following the lib/calculations convention.

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type Meridiem = "AM" | "PM";

export interface ClockFields {
  hour12: number; // 1-12
  minute: number; // 0-59
  meridiem: Meridiem;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Formats a "YYYY-MM-DD" calendar date as `DD - MMMM - AAAA` with an English month name
 * (e.g. "05 - March - 2026"). Splits the string rather than using `new Date(...)` to avoid
 * any UTC-vs-local day shift.
 */
export function formatLongDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${pad2(day)} - ${MONTHS[month - 1]} - ${year}`;
}

/** The hour options for the time picker, as strings: "1" … "12". */
export const HOUR_OPTIONS: string[] = Array.from({ length: 12 }, (_, i) => String(i + 1));

/** The minute options for the time picker, as zero-padded strings: "00" … "59". */
export const MINUTE_OPTIONS: string[] = Array.from({ length: 60 }, (_, i) => pad2(i));

/** Converts a 12-hour clock + meridiem to 24-hour `{ hours, minutes }`. */
export function to24Hour(
  hour12: number,
  minute: number,
  meridiem: Meridiem
): { hours: number; minutes: number } {
  const base = hour12 % 12; // 12 -> 0
  return { hours: meridiem === "PM" ? base + 12 : base, minutes: minute };
}

/** Splits a Date into `{ hour12, minute, meridiem }` (local time). */
export function clockFieldsFromDate(date: Date): ClockFields {
  const hours24 = date.getHours();
  return {
    hour12: ((hours24 + 11) % 12) + 1, // 0 -> 12, 13 -> 1
    minute: date.getMinutes(),
    meridiem: hours24 < 12 ? "AM" : "PM",
  };
}

/** Same as `clockFieldsFromDate`, for pre-filling the picker when editing an entry. */
export function clockFieldsFromIso(iso: string): ClockFields {
  return clockFieldsFromDate(new Date(iso));
}

/**
 * Composes a stored `createdAt` timestamp from a "YYYY-MM-DD" day and a 24-hour time,
 * built from local `Date` components so it round-trips with `clockFieldsFromIso`.
 */
export function combineDateAndTime(dateStr: string, hours: number, minutes: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}
