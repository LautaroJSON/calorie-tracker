# Quickstart: Activity Level and Weight Goal-Based Calorie Target

Validation guide. See [data-model.md](./data-model.md) and [contracts/](./contracts/) for exact
shapes and formulas; this only documents how to run and check the result.

## Prerequisites

Same as feature 001 — `npm install`, `npx expo start`, open in Expo Go. No new setup.

## Unit tests

```bash
npm test
```

Expected: `lib/calculations/__tests__/calorieGoal.test.ts` passes (all 4 activity multipliers,
all 3 goal adjustments, plus the combined case), and feature 001's existing `bmr.test.ts` /
`netCalories.test.ts` still pass unmodified — proving `calculateBmr()` itself was not touched.

## Manual validation scenarios

### 1. New onboarding includes the two new questions (User Story 1)

1. Fresh install (clear app storage), launch the app. **Expect**: onboarding form now also asks
   Activity Level (4 options) and Weight Goal (3 options), in addition to the existing fields.
2. Try submitting without selecting an activity level or goal. **Expect**: blocked, per FR-004.
3. Enter weight `70`, height `175`, age `30`, sex `male`, activity `Moderate`, goal `Lose`,
   submit. **Expect**: daily goal shown is `(BMR × 1.55) − 500` for those inputs
   (`BMR = 1648.75` per feature 001's own quickstart fixture → goal ≈ `2055.6 − 500 = 1555.6`,
   displayed rounded).

### 2. Existing profile recalculates once, then stays put until edited (User Story 2, Edge Case)

1. Using a profile created **before** this feature (no stored `activityLevel`/`goal`), open the
   Today screen. **Expect**: the daily goal is now `BMR × 1.2` (Sedentary/Maintain default) —
   higher than the old raw-BMR value, and this is the expected, confirmed one-time change (not
   a bug).
2. Open Settings. **Expect**: Activity Level shows "Sedentary" and Weight Goal shows "Maintain"
   pre-selected, reflecting the default just applied.
3. Without changing anything, navigate away and back. **Expect**: the goal number is stable
   (still `BMR × 1.2`) — no further drift on repeated reads.

### 3. Changing activity level and goal updates the target (User Story 2)

1. In Settings, change Activity Level to "High" and Weight Goal to "Gain", save.
2. Return to the Today screen. **Expect**: daily goal is now `(BMR × 1.725) + 500`, updated
   immediately (reuses feature 001's existing focus-triggered profile reload — no new wiring
   needed).
3. Repeat for a couple of the other 12 activity×goal combinations and hand-verify the math
   against [contracts/calculation-functions.md](./contracts/calculation-functions.md)'s formula.

## Success criteria checklist

Confirms spec.md's SC-001 through SC-004 without inspecting code: form completion time, correct
goal across combinations, one-time-only migration change, and immediate recalculation on save.
