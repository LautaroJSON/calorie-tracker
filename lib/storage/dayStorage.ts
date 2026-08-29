import AsyncStorage from "@react-native-async-storage/async-storage";

import { DAY_KEY_PREFIX, dateFromDayKey, dayKey } from "./keys";
import type { DayLog, EntryType, ExerciseEntry, FoodEntry } from "../types";

function emptyDayLog(date: string): DayLog {
  return { date, foodEntries: [], exerciseEntries: [], waterMl: 0 };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function loadDayLog(date: string): Promise<DayLog> {
  const raw = await AsyncStorage.getItem(dayKey(date));
  if (!raw) {
    return emptyDayLog(date);
  }
  // `waterMl` defaults to 0 for days stored before the water tracker existed.
  return { waterMl: 0, ...JSON.parse(raw) } as DayLog;
}

export async function saveDayLog(date: string, log: DayLog): Promise<void> {
  await AsyncStorage.setItem(dayKey(date), JSON.stringify(log));
}

export interface EntryInput {
  calories: number;
  title?: string;
  note?: string;
  createdAt?: string;
}

function entriesFor(log: DayLog, type: EntryType): (FoodEntry | ExerciseEntry)[] {
  return type === "food" ? log.foodEntries : log.exerciseEntries;
}

export async function addEntry(
  date: string,
  type: EntryType,
  input: EntryInput
): Promise<DayLog> {
  const log = await loadDayLog(date);
  const entry: FoodEntry | ExerciseEntry = {
    id: generateId(),
    calories: input.calories,
    title: input.title,
    note: input.note,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  const updated: DayLog =
    type === "food"
      ? { ...log, foodEntries: [...log.foodEntries, entry] }
      : { ...log, exerciseEntries: [...log.exerciseEntries, entry] };

  await saveDayLog(date, updated);
  return updated;
}

export async function updateEntry(
  date: string,
  type: EntryType,
  id: string,
  input: EntryInput
): Promise<DayLog> {
  const log = await loadDayLog(date);
  const apply = (entries: (FoodEntry | ExerciseEntry)[]) =>
    entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            calories: input.calories,
            title: input.title,
            note: input.note,
            ...(input.createdAt ? { createdAt: input.createdAt } : {}),
          }
        : entry
    );

  const updated: DayLog =
    type === "food"
      ? { ...log, foodEntries: apply(log.foodEntries) }
      : { ...log, exerciseEntries: apply(log.exerciseEntries) };

  await saveDayLog(date, updated);
  return updated;
}

export async function deleteEntry(
  date: string,
  type: EntryType,
  id: string
): Promise<DayLog> {
  const log = await loadDayLog(date);
  const updated: DayLog =
    type === "food"
      ? { ...log, foodEntries: log.foodEntries.filter((entry) => entry.id !== id) }
      : { ...log, exerciseEntries: log.exerciseEntries.filter((entry) => entry.id !== id) };

  await saveDayLog(date, updated);
  return updated;
}

export async function setDayWaterMl(date: string, waterMl: number): Promise<DayLog> {
  const log = await loadDayLog(date);
  const updated: DayLog = { ...log, waterMl: Math.max(0, Math.round(waterMl)) };
  await saveDayLog(date, updated);
  return updated;
}

export async function loadAllDayLogs(): Promise<DayLog[]> {
  const allKeys = await AsyncStorage.getAllKeys();
  const dayKeys = allKeys.filter((key) => key.startsWith(DAY_KEY_PREFIX));
  const pairs = await AsyncStorage.multiGet(dayKeys);

  return pairs
    .filter((pair): pair is [string, string] => pair[1] !== null)
    .map(([key, raw]) => JSON.parse(raw) as DayLog)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export { entriesFor, emptyDayLog, dateFromDayKey };
