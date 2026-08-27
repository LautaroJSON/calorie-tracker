# Contract: Pure Calculation Functions

Per the user's explicit requirement, all TMB/net-calorie/validation business rules live in
pure functions, isolated from UI, so they are independently unit-testable. This is the
functional contract those modules must satisfy.

## `lib/calculations/bmr.ts`

```ts
function calculateBmr(profile: Pick<UserProfile, "weightKg" | "heightCm" | "age" | "sex">): number
```

- **Given** `sex: "male"` → returns `10 * weightKg + 6.25 * heightCm - 5 * age + 5` (FR-005).
- **Given** `sex: "female"` → returns `10 * weightKg + 6.25 * heightCm - 5 * age - 161` (FR-005).
- **Pure**: no I/O, no `AsyncStorage` access, no randomness — same input always yields the
  same output, so it can be unit tested with plain fixture objects.

## `lib/calculations/netCalories.ts`

```ts
function sumCalories(entries: { calories: number }[]): number

function computeNetCalories(dayLog: Pick<DayLog, "foodEntries" | "exerciseEntries">): {
  totalFoodCalories: number
  totalExerciseCalories: number
  netCalories: number          // max(0, totalFoodCalories - totalExerciseCalories) — FR-016
  uncompensatedExcess: number  // max(0, totalExerciseCalories - totalFoodCalories) — FR-016
}

function computeGoalStatus(rawNet: number, dailyGoal: number): {
  isOverGoal: boolean   // strictly greater than dailyGoal — FR-017 / spec Edge Cases
  overageAmount: number // max(0, rawNet - dailyGoal)
}
```

- `computeNetCalories` MUST never return a negative `netCalories` (FR-016) — this is the
  one non-negotiable invariant from the spec's "critical business rule" and MUST have a
  dedicated unit test asserting it for the case `totalExerciseCalories > totalFoodCalories`.
- `computeGoalStatus` MUST treat `rawNet === dailyGoal` as **not** over goal (spec Edge
  Cases: "exactly equal to the daily calorie goal… MUST show the goal as met, not
  exceeded"), and MUST use the pre-floor raw net value (food − exercise, without the
  zero-floor) as the value compared against the goal, matching User Story 2 Acceptance
  Scenario 4.
- All three functions are pure: no `AsyncStorage`, no `Date.now()`/`new Date()` calls
  inside them — the caller supplies whatever "now" or day data is relevant, keeping them
  trivially testable with fixed fixtures.

## Required unit test coverage (`lib/calculations/__tests__/`)

- `bmr.test.ts`: one case per sex branch, using values that can be hand-verified against
  the formulas in FR-005.
- `netCalories.test.ts`: at minimum — (a) food only, (b) food and exercise where food wins,
  (c) exercise exceeds food (assert `netCalories === 0` and `uncompensatedExcess` equals
  the exact overshoot, matching the spec's `"0 (-150)"` example), (d) net exactly equal to
  goal (assert `isOverGoal === false`), (e) net exceeding goal (assert `isOverGoal === true`
  and `overageAmount` is correct).
