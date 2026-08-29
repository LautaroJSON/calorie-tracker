# Phase 1 Data Model: Optional Daily Water Intake Tracker

Two existing persisted shapes gain fields; no new AsyncStorage key, no new entity. Base
entities are from feature 001
([../001-daily-calorie-tracker/data-model.md](../001-daily-calorie-tracker/data-model.md)),
extended by feature 002 (`activityLevel`, `goal`).

## Persisted entities

### UserProfile — AsyncStorage key `profile` (one object)

| Field | Type | Validation | Change in this feature |
|---|---|---|---|
| `weightKg`, `heightCm`, `age` | `number` | `> 0` | none |
| `sex` | `"male" \| "female"` | — | none |
| `activityLevel` | `ActivityLevel` | — | none |
| `goal` | `Goal` | — | none |
| `updatedAt` | `string` (ISO) | — | none (bumped on any profile save, as today) |
| `waterTrackingEnabled` | `boolean` | — | **NEW.** Whether the water counter is shown on the Today and Calendar screens. Default **`false`**. |
| `waterGoalMl` | `number` | integer `> 0` when `waterTrackingEnabled` | **NEW.** Daily water goal in milliliters. Default **`2000`**. Only meaningful when tracking is enabled; retained (not cleared) when it is disabled. |

**Backward compatibility**: `loadProfile` spreads a defaults object before the parsed JSON:
`{ activityLevel: "sedentary", goal: "maintain", waterTrackingEnabled: false, waterGoalMl: 2000, ...JSON.parse(raw) }`.
A profile saved before this feature therefore loads with tracking off and a 2000 ml goal, with
**no `updatedAt` change** until the user next saves the form (FR-018).

### DayLog — AsyncStorage key `day:YYYY-MM-DD` (one object per day)

| Field | Type | Validation | Change in this feature |
|---|---|---|---|
| `date` | `string` (`YYYY-MM-DD`) | — | none |
| `foodEntries` | `FoodEntry[]` | — | none |
| `exerciseEntries` | `ExerciseEntry[]` | — | none |
| `waterMl` | `number` | integer `>= 0` | **NEW.** Total water consumed that calendar day, in milliliters. Default **`0`**. Adjusted in `WATER_STEP_ML` (50) increments from the Today screen (current day) or the Calendar screen (selected day). No upper bound — may exceed `waterGoalMl` (FR-013). |

**Backward compatibility**: `emptyDayLog(date)` returns `waterMl: 0`; `loadDayLog` normalizes
stored JSON with `{ waterMl: 0, ...JSON.parse(raw) }`. A day written before this feature loads
as `waterMl: 0` (spec Edge Cases). `computeNetCalories` accepts
`Pick<DayLog, "foodEntries" | "exerciseEntries">` and is unaffected.

## In-memory shapes (not persisted)

### `ProfileFormValues` (`components/ProfileForm.tsx`)

| Field | Type | Notes |
|---|---|---|
| `weightKg`, `heightCm`, `age`, `sex`, `activityLevel`, `goal` | as today | unchanged |
| `waterTrackingEnabled` | `boolean` | **NEW.** Bound to the "Water counter" `Switch`. |
| `waterGoalMl` | `number` | **NEW.** Parsed from the goal `FormTextInput` on submit. Included in `onSubmit` regardless of the toggle (so the last value is retained per FR-017); only *validated* when `waterTrackingEnabled` is true. |

The form keeps the goal input as a `string` state (like `weightKg` etc.), initialized to
`String(initialValues?.waterGoalMl ?? 2000)`, and converts on submit.

### `WaterCounter` props (`components/WaterCounter.tsx`)

| Prop | Type | Notes |
|---|---|---|
| `waterMl` | `number` | Current day's total (the caller passes `dayLog.waterMl`). |
| `goalMl` | `number` | `profile.waterGoalMl`. |
| `onChange` | `(nextMl: number) => void` | Called with `nextWaterMl(waterMl, ±WATER_STEP_ML)` when an arrow is tapped. |

### `DayOverview` props (`components/DayOverview.tsx`)

| Prop | Type | Notes |
|---|---|---|
| `netCalories`, `dailyGoal`, `isOverGoal`, `overageAmount`, `uncompensatedExcess` | as `CalorieRing` today | forwarded verbatim to `<CalorieRing>` |
| `water` | `{ waterMl: number; goalMl: number; onChange: (nextMl: number) => void } \| null` | **NEW.** When non-null, a `<WaterCounter>` is rendered to the right of the ring. When `null`/omitted, only `<CalorieRing>` renders, with no wrapping row (FR-016). |

## Domain rules (pure, in `lib/calculations/water.ts`)

| Name | Signature | Rule |
|---|---|---|
| `WATER_STEP_ML` | `50` | Amount added/removed per arrow tap (FR-010, FR-011). |
| `DEFAULT_WATER_GOAL_ML` | `2000` | Default goal (FR-003); also the `loadProfile` default. |
| `nextWaterMl` | `(currentMl: number, deltaMl: number) => number` | `Math.max(0, currentMl + deltaMl)` — never negative (FR-011). |
| `waterFillRatio` | `(currentMl: number, goalMl: number) => number` | `goalMl > 0 ? Math.min(1, currentMl / goalMl) : 0` — 0–1, capped at full at/over goal (FR-012), safe when `goalMl` is 0. |

## Validation rules

| Rule | Where enforced | Behavior |
|---|---|---|
| Water goal is a whole number `> 0` | `ProfileForm.handleSubmit` | Only checked when `waterTrackingEnabled`. On failure: inline error (existing `styles.error` pattern), submit blocked (FR-004). |
| Goal input hidden when toggle off | `ProfileForm` render | No goal `FormTextInput` shown; no other water fields (FR-005). |
| Consumed never negative | `nextWaterMl` + `setDayWaterMl` clamp | Down arrow at 0 leaves 0 (FR-011). |
| Consumed may exceed goal | no clamp on the upper side | Label shows true value; bar caps via `waterFillRatio` (FR-012, FR-013). |
| Per-day isolation | `setDayWaterMl(date, ml)` keyed by `date` | Adjusting a past day on Calendar writes only `day:<selectedDate>` (FR-020). |

## State transitions

- **`waterTrackingEnabled`**: `false` → `true` (switch on, in onboarding or settings) reveals
  the goal input and, after save, the Today/Calendar water counter. `true` → `false` (switch
  off, save) stops rendering the counter; `waterGoalMl` and every day's `waterMl` remain in
  storage (FR-017). No confirmation prompt.
- **`waterMl`**: `0` at day creation; `+50` / `−50` (floored at 0) per arrow tap on Today or
  Calendar; persists across navigation and app restarts; independent per calendar day (a new
  day starts at `0`, FR-015). Removed only if the whole `day:*` record is removed (not a flow
  this feature adds).
