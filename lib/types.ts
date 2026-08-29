export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export type Goal = "maintain" | "lose" | "gain";

export interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  // Optional daily water tracker. Both fields are always present in practice — loadProfile
  // injects defaults (false / 2000) for profiles saved before this feature existed.
  waterTrackingEnabled: boolean;
  waterGoalMl: number;
  updatedAt: string;
}

export interface FoodEntry {
  id: string;
  calories: number;
  note?: string;
  createdAt: string;
}

export interface ExerciseEntry {
  id: string;
  calories: number;
  note?: string;
  createdAt: string;
}

export interface DayLog {
  date: string;
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  // Total water consumed that day, in millilitres. loadDayLog defaults it to 0 for days
  // stored before this feature existed.
  waterMl: number;
}

export type EntryType = "food" | "exercise";
