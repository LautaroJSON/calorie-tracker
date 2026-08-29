import {
  DEFAULT_WATER_GOAL_ML,
  WATER_STEP_ML,
  nextWaterMl,
  waterFillRatio,
} from "../water";

describe("constants", () => {
  it("uses a 50 ml step and a 2000 ml default goal", () => {
    expect(WATER_STEP_ML).toBe(50);
    expect(DEFAULT_WATER_GOAL_ML).toBe(2000);
  });
});

describe("nextWaterMl", () => {
  it("adds the delta for a normal increment", () => {
    expect(nextWaterMl(0, 50)).toBe(50);
    expect(nextWaterMl(150, 50)).toBe(200);
  });

  it("subtracts the delta for a normal decrement", () => {
    expect(nextWaterMl(200, -50)).toBe(150);
  });

  it("never goes below zero", () => {
    expect(nextWaterMl(0, -50)).toBe(0);
    expect(nextWaterMl(30, -50)).toBe(0);
  });

  it("allows the total to reach and exceed the goal", () => {
    expect(nextWaterMl(1950, 50)).toBe(2000);
    expect(nextWaterMl(2000, 50)).toBe(2050);
  });
});

describe("waterFillRatio", () => {
  it("is 0 when nothing is consumed", () => {
    expect(waterFillRatio(0, 2000)).toBe(0);
  });

  it("is the consumed fraction below the goal", () => {
    expect(waterFillRatio(50, 2000)).toBeCloseTo(0.025);
    expect(waterFillRatio(1000, 2000)).toBe(0.5);
  });

  it("is exactly 1 at the goal", () => {
    expect(waterFillRatio(2000, 2000)).toBe(1);
  });

  it("caps at 1 above the goal", () => {
    expect(waterFillRatio(2500, 2000)).toBe(1);
  });

  it("returns 0 when the goal is 0", () => {
    expect(waterFillRatio(100, 0)).toBe(0);
  });
});
