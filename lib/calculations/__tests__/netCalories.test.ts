import { computeGoalStatus, computeNetCalories, sumCalories } from "../netCalories";

describe("sumCalories", () => {
  it("sums calories across entries", () => {
    expect(sumCalories([{ calories: 100 }, { calories: 250 }])).toBe(350);
  });

  it("returns 0 for an empty list", () => {
    expect(sumCalories([])).toBe(0);
  });
});

describe("computeNetCalories", () => {
  it("returns the food total when there is no exercise", () => {
    const result = computeNetCalories({
      foodEntries: [{ id: "1", calories: 500, createdAt: "" }],
      exerciseEntries: [],
    });
    expect(result.totalFoodCalories).toBe(500);
    expect(result.totalExerciseCalories).toBe(0);
    expect(result.netCalories).toBe(500);
    expect(result.uncompensatedExcess).toBe(0);
  });

  it("subtracts exercise from food when food wins", () => {
    const result = computeNetCalories({
      foodEntries: [{ id: "1", calories: 500, createdAt: "" }],
      exerciseEntries: [{ id: "2", calories: 200, createdAt: "" }],
    });
    expect(result.netCalories).toBe(300);
    expect(result.uncompensatedExcess).toBe(0);
  });

  it("floors net calories at 0 and reports the uncompensated excess when exercise exceeds food", () => {
    const result = computeNetCalories({
      foodEntries: [{ id: "1", calories: 200, createdAt: "" }],
      exerciseEntries: [{ id: "2", calories: 350, createdAt: "" }],
    });
    expect(result.netCalories).toBe(0);
    expect(result.uncompensatedExcess).toBe(150);
  });
});

describe("computeGoalStatus", () => {
  it("is not over goal when net calories exactly equal the goal", () => {
    const result = computeGoalStatus(1800, 1800);
    expect(result.isOverGoal).toBe(false);
    expect(result.overageAmount).toBe(0);
  });

  it("is not over goal when net calories are below the goal", () => {
    const result = computeGoalStatus(1500, 1800);
    expect(result.isOverGoal).toBe(false);
    expect(result.overageAmount).toBe(0);
  });

  it("reports the overage amount when net calories exceed the goal", () => {
    const result = computeGoalStatus(2000, 1800);
    expect(result.isOverGoal).toBe(true);
    expect(result.overageAmount).toBe(200);
  });
});
