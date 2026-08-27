import { calculateBmr } from "./bmr";
import type { ActivityLevel, Goal, UserProfile } from "../types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  maintain: 0,
  lose: -500,
  gain: 500,
};

export function calculateDailyCalorieGoal(
  profile: Pick<
    UserProfile,
    "weightKg" | "heightCm" | "age" | "sex" | "activityLevel" | "goal"
  >
): number {
  const tdee = calculateBmr(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  return tdee + GOAL_ADJUSTMENTS[profile.goal];
}
