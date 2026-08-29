import { calculateDailyCalorieGoal } from "../calorieGoal";
import type { UserProfile } from "../../types";

function profileWith(overrides: Partial<UserProfile>): UserProfile {
  return {
    weightKg: 70,
    heightCm: 175,
    age: 30,
    sex: "male",
    activityLevel: "sedentary",
    goal: "maintain",
    waterTrackingEnabled: false,
    waterGoalMl: 2000,
    updatedAt: "",
    ...overrides,
  };
}

// BMR for the base profile above: 10*70 + 6.25*175 - 5*30 + 5 = 1648.75

describe("calculateDailyCalorieGoal — activity multipliers (goal held at maintain)", () => {
  it("applies the sedentary multiplier (x1.2)", () => {
    const result = calculateDailyCalorieGoal(profileWith({ activityLevel: "sedentary" }));
    expect(result).toBeCloseTo(1648.75 * 1.2);
  });

  it("applies the light/routine multiplier (x1.375)", () => {
    const result = calculateDailyCalorieGoal(profileWith({ activityLevel: "light" }));
    expect(result).toBeCloseTo(1648.75 * 1.375);
  });

  it("applies the moderate multiplier (x1.55)", () => {
    const result = calculateDailyCalorieGoal(profileWith({ activityLevel: "moderate" }));
    expect(result).toBeCloseTo(1648.75 * 1.55);
  });

  it("applies the active/high multiplier (x1.725)", () => {
    const result = calculateDailyCalorieGoal(profileWith({ activityLevel: "active" }));
    expect(result).toBeCloseTo(1648.75 * 1.725);
  });
});

describe("calculateDailyCalorieGoal — goal adjustments (activity held at sedentary)", () => {
  it("applies no adjustment for maintain", () => {
    const result = calculateDailyCalorieGoal(profileWith({ goal: "maintain" }));
    expect(result).toBeCloseTo(1648.75 * 1.2);
  });

  it("subtracts 500 kcal/day for lose", () => {
    const result = calculateDailyCalorieGoal(profileWith({ goal: "lose" }));
    expect(result).toBeCloseTo(1648.75 * 1.2 - 500);
  });

  it("adds 500 kcal/day for gain", () => {
    const result = calculateDailyCalorieGoal(profileWith({ goal: "gain" }));
    expect(result).toBeCloseTo(1648.75 * 1.2 + 500);
  });
});

describe("calculateDailyCalorieGoal — combined non-default case", () => {
  it("applies the activity multiplier before the goal adjustment (moderate + lose)", () => {
    const result = calculateDailyCalorieGoal(
      profileWith({ activityLevel: "moderate", goal: "lose" })
    );
    expect(result).toBeCloseTo(1648.75 * 1.55 - 500);
  });
});
