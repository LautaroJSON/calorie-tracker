# Contract: Pure Calculation Functions (new module)

Extends [../001-daily-calorie-tracker/contracts/calculation-functions.md](../../001-daily-calorie-tracker/contracts/calculation-functions.md).
`calculateBmr()` is unchanged and still governed by that document. This describes the new
module only.

## `lib/calculations/calorieGoal.ts`

```ts
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

function calculateDailyCalorieGoal(
  profile: Pick<UserProfile, "weightKg" | "heightCm" | "age" | "sex" | "activityLevel" | "goal">
): number
```

- **MUST** compute `calculateBmr(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel] + GOAL_ADJUSTMENTS[profile.goal]`
  exactly, per FR-005/FR-006/FR-007. The activity multiplier is applied first, the goal
  adjustment added after — order matters and must not be reversed (multiplying after adding
  would change the result).
- **MUST NOT** modify or duplicate `calculateBmr()`'s own logic — it calls the existing exported
  function from `bmr.ts` rather than reimplementing the Harris-Benedict formula.
- **Pure**: no I/O, no `AsyncStorage` access — same input always yields the same output.

## Required unit test coverage (`lib/calculations/__tests__/calorieGoal.test.ts`)

- One case per activity multiplier (4 cases), holding goal at `"maintain"`, asserting the exact
  `BMR × multiplier` result for a fixed, hand-verifiable profile.
- One case per goal adjustment (3 cases, including `"maintain"` itself for completeness), holding
  activity at a fixed level, asserting the exact `± 500` (or `+0`) offset relative to the
  no-adjustment value.
- At least one combined case exercising both a non-default activity level and a non-maintain
  goal together (e.g. Moderate + Lose), asserting the full `(BMR × 1.55) − 500` result, to catch
  an accidental swap of operation order.
