# Phase 1 Data Model: Activity Level and Weight Goal-Based Calorie Target

This feature extends the `UserProfile` entity already defined in
[../001-daily-calorie-tracker/data-model.md](../001-daily-calorie-tracker/data-model.md). All
other entities (`DayLog`, `FoodEntry`, `ExerciseEntry`) are unaffected and not repeated here.

## New types

```ts
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Goal = "maintain" | "lose" | "gain";
```

`ActivityLevel` values map to the spec's user-facing labels as: `sedentary` = Sedentary,
`light` = Routine, `moderate` = Moderate, `active` = High.

## UserProfile (extended)

| Field | Type | Validation | Notes |
|---|---|---|---|
| `weightKg` | `number` | `> 0` | Unchanged from feature 001 |
| `heightCm` | `number` | `> 0` | Unchanged from feature 001 |
| `age` | `number` | `> 0`, integer | Unchanged from feature 001 |
| `sex` | `"male" \| "female"` | one of the two values | Unchanged from feature 001 |
| `activityLevel` | `ActivityLevel` | one of the four values (FR-001) | **New**. Required on every new save; see migration default below for reads of pre-existing data |
| `goal` | `Goal` | one of the three values (FR-002) | **New**. Required on every new save; see migration default below |
| `updatedAt` | `string` (ISO 8601) | — | Unchanged from feature 001 |

**Derived value (not stored, replaces feature 001's plain `calculateBmr(profile)` usage for the
displayed goal)**:
```
dailyGoal = calculateDailyCalorieGoal(profile)
          = calculateBmr(profile) × ACTIVITY_MULTIPLIERS[profile.activityLevel]
            + GOAL_ADJUSTMENTS[profile.goal]
```
`calculateBmr()` itself is unchanged and still returns the raw Harris-Benedict value.

## Migration default (read-path only, no data rewrite)

A `UserProfile` JSON blob saved before this feature existed has no `activityLevel` or `goal`
key. Per spec FR-008, `loadProfile()` (feature 001's
[`lib/storage/profileStorage.ts`](../../lib/storage/profileStorage.ts)) fills these in at read
time:

```ts
{ activityLevel: "sedentary", goal: "maintain", ...storedJson }
```

This is a **read-time default, not a write-time migration** — nothing is rewritten to storage
until the user actually saves the profile form again (at which point both fields are present
for real, since the form requires them per FR-004). As documented in spec.md's Edge Cases, this
causes such a profile's `dailyGoal` to recalculate once, from raw BMR to `BMR × 1.2`, the first
time it's computed under this feature — a confirmed, intentional behavior change, not a bug.

## State Transitions

- `activityLevel` / `goal`: same lifecycle as the rest of `UserProfile` (set at onboarding,
  editable any number of times via settings — feature 001's existing state model, just with two
  more fields). No independent transitions of their own.
