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
}

export type EntryType = "food" | "exercise";
