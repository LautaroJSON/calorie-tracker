import type { DayLog } from "../types";

export function sumCalories(entries: { calories: number }[]): number {
  return entries.reduce((total, entry) => total + entry.calories, 0);
}

export interface NetCaloriesResult {
  totalFoodCalories: number;
  totalExerciseCalories: number;
  netCalories: number;
  uncompensatedExcess: number;
}

export function computeNetCalories(
  dayLog: Pick<DayLog, "foodEntries" | "exerciseEntries">
): NetCaloriesResult {
  const totalFoodCalories = sumCalories(dayLog.foodEntries);
  const totalExerciseCalories = sumCalories(dayLog.exerciseEntries);
  const rawNet = totalFoodCalories - totalExerciseCalories;

  return {
    totalFoodCalories,
    totalExerciseCalories,
    netCalories: Math.max(0, rawNet),
    uncompensatedExcess: Math.max(0, -rawNet),
  };
}

export interface GoalStatus {
  isOverGoal: boolean;
  overageAmount: number;
}

export function computeGoalStatus(rawNet: number, dailyGoal: number): GoalStatus {
  const overage = rawNet - dailyGoal;
  return {
    isOverGoal: overage > 0,
    overageAmount: Math.max(0, overage),
  };
}
