# Quickstart: Optional Daily Water Intake Tracker

Validation guide. See [data-model.md](./data-model.md) and [contracts/](./contracts/) for exact
shapes; this documents how to run and check the result.

## Prerequisites

Same as feature 001 — `npm install`, `npx expo start`, open in Expo Go (or install the release
APK). No new dependency, no new setup.

## Unit tests

```bash
npm test
npx tsc --noEmit
npx expo lint
```

Expected:

- `lib/calculations/__tests__/water.test.ts` passes — `nextWaterMl` (increment, decrement,
  floor at 0, may exceed goal) and `waterFillRatio` (0, partial, exactly full, capped over
  goal, divide-by-zero) per [contracts/water-helpers.md](./contracts/water-helpers.md).
- Feature 001 / 002 / 003 tests (`bmr`, `netCalories`, `calorieGoal`, `datetime`) still pass
  unmodified.

## Manual validation scenarios

### 1. Water tracking is off by default (US2, US3, SC-005)

1. Fresh install → onboarding form. **Expect**: a "Water counter" switch, off. No goal input.
2. Complete onboarding without touching it. **Expect**: Today and Calendar look exactly as
   before — calorie ring only, no bar/arrows.

### 2. Enable during onboarding (US2)

1. Fresh install → onboarding → turn the "Water counter" switch on.
2. **Expect**: a "Daily goal (ml)" input appears, pre-filled `2000`.
3. Change it to `2500`, finish onboarding.
4. **Expect**: Today shows the calorie ring with a vertical water bar to its right, up/down
   circled arrows, a `0 / 2500` label, and a glass icon under the label.

### 3. Track water today (US1)

1. On Today, tap the **up** arrow once. **Expect**: label `50 / 2500`, bar ~2% full.
2. Tap up several more times, then **down** once. **Expect**: each tap changes the amount by
   exactly 50 ml.
3. Tap down repeatedly past 0. **Expect**: amount stops at `0`, never negative.
4. Tap up until the amount exceeds the goal. **Expect**: label shows the true value (e.g.
   `2550 / 2500`); the bar stays full, no overflow.
5. Switch to another tab and back. **Expect**: the amount is unchanged (persisted).

### 4. Enable/disable later from Settings (US3, FR-017)

1. With a profile that had water off, open Settings → turn the switch on → set goal `3000` →
   Save. **Expect**: Today now shows the water counter with a `… / 3000` label.
2. Log some water. Open Settings → turn the switch off → Save. **Expect**: the water counter
   disappears from Today and Calendar; no confirmation dialog.
3. Open Settings → turn it back on → Save. **Expect**: goal is `3000` again and the previously
   logged amount is shown again on its day.

### 5. Adjust a past day on the Calendar (US4, FR-019, FR-020)

1. With water tracking on, open the **Calendar** tab, select a past day.
2. **Expect**: that day's water counter appears next to its calorie ring, fully interactive.
3. Tap up twice. **Expect**: that day's amount increases by 100 ml and persists when you leave
   and re-select the day.
4. Switch to **Today**. **Expect**: today's water amount is unaffected.

### 6. New day rollover (FR-015)

1. Log water today. Change the device date to tomorrow, reopen the app.
2. **Expect**: Today shows `0` consumed; the Calendar for the previous day still shows the
   amount you logged.

### 7. Goal validation (FR-004)

1. Settings → switch on → clear the goal input (or enter `0` / `abc`) → Save.
2. **Expect**: an inline error, save blocked, until a whole number `> 0` is entered.

## Success criteria checklist

Covers spec.md SC-001 (scenario 2), SC-002/SC-003 (scenario 3), SC-004 (scenarios 3 & 6),
SC-005 (scenario 1), SC-006 (scenario 3 step 4 + unit tests), SC-007 (scenario 5).
