export const PROFILE_KEY = "profile";

export const DAY_KEY_PREFIX = "day:";

export function dayKey(date: string): string {
  return `${DAY_KEY_PREFIX}${date}`;
}

export function dateFromDayKey(key: string): string {
  return key.slice(DAY_KEY_PREFIX.length);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
