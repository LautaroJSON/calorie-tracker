// Pure helpers for the optional daily water tracker. No React, no storage.

// Amount added or removed per up/down arrow tap.
export const WATER_STEP_ML = 50;

// Default daily goal when the user first enables water tracking (2 litres).
export const DEFAULT_WATER_GOAL_ML = 2000;

// New consumed total after an arrow tap. Never goes below 0; may exceed the goal.
export function nextWaterMl(currentMl: number, deltaMl: number): number {
  return Math.max(0, currentMl + deltaMl);
}

// Vertical bar fill as a fraction in [0, 1]. Caps at full once the goal is met or
// exceeded, and is safe when goalMl is 0.
export function waterFillRatio(currentMl: number, goalMl: number): number {
  return goalMl > 0 ? Math.min(1, currentMl / goalMl) : 0;
}
