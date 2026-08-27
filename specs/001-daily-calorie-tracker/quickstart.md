# Quickstart: Daily Calorie Tracker

Validation guide for proving the feature works end-to-end in Expo Go. Implementation
details live in [data-model.md](./data-model.md), [contracts/](./contracts/), and (once
generated) `tasks.md` — this file only documents how to run and check the result.

## Prerequisites

- Node.js and npm installed.
- The Expo Go app installed on a physical iOS/Android device, or an iOS Simulator /
  Android Emulator, per standard Expo setup.
- No accounts, API keys, or environment variables are required — the app has no backend
  (Constitution Principle I).

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (or press `i`/`a` in the terminal for simulator/emulator).
The app must launch with no dev-client prompt — if Expo Go offers to install a
"development build" instead of opening directly, an incompatible native dependency has
been introduced and Constitution Principle II has been violated.

## Unit tests (pure calculation layer)

```bash
npm test
```

Expected: all tests under `lib/calculations/__tests__/` pass, covering the BMR formula
branches and the net-calorie zero-floor/excess/overage rules described in
[contracts/calculation-functions.md](./contracts/calculation-functions.md).

## Manual validation scenarios

Each scenario maps to one user story in [spec.md](./spec.md) and should be run in order on
a fresh install (clear the app's storage / reinstall Expo Go's app data first).

### 1. First-time profile setup (User Story 1)

1. Launch the app for the first time. **Expect**: the onboarding form appears immediately;
   no other screen is reachable.
2. Try submitting with an empty or negative weight. **Expect**: a validation error, form
   does not submit.
3. Enter weight `70`, height `175`, age `30`, sex `male`, submit. **Expect**: app navigates
   to the Today screen and the goal ring shows a daily goal of `1748` kcal
   (`10×70 + 6.25×175 − 5×30 + 5`).

### 2. Track today's food and exercise (User Story 2)

1. On the Today screen, tap "+" and add a food entry of `500` kcal with note "Lunch".
   **Expect**: entry appears in the list with its time, note, and calories; ring shows
   `500` net.
2. Add an exercise entry of `200` kcal. **Expect**: ring shows `300` net (`500 − 200`).
3. Add another exercise entry of `400` kcal (total exercise now `600` vs `500` food).
   **Expect**: ring shows `0` with uncompensated excess displayed as `0 (-100)`.
4. Delete both exercise entries and add food entries until total food exceeds the daily
   goal computed in scenario 1. **Expect**: ring visually signals overage (distinct color)
   and shows the exceeded amount.

### 3. Edit and delete entries (User Story 3)

1. Edit the food entry's calories from `500` to `600`. **Expect**: list and ring update to
   the new total immediately.
2. Delete an exercise entry that was causing an uncompensated excess. **Expect**: the
   `(-N)` excess display disappears once exercise no longer exceeds food.

### 4. Calendar navigation to past days (User Story 4)

1. Open the Calendar tab. **Expect**: today's date has a distinct "today" style and, since
   it is also selected by default, also a distinct "selected" style — both visible at once.
2. Select a date from earlier in the month with no prior entries. **Expect**: that day's
   entry list is empty and net calories show `0`.
3. Add a food entry on that past day, then navigate back to the Today tab. **Expect**:
   today's entries and totals are unaffected by the past day's new entry.
4. Reopen the Calendar and try tapping a date after today. **Expect**: it is not selectable.

### 5. Update profile settings (User Story 5)

1. Open Settings via the profile icon. **Expect**: current weight/height/age/sex are
   pre-filled.
2. Change weight and save. **Expect**: returning to the Today screen shows a recalculated
   daily goal reflecting the new weight.

### 6. View calorie trends (User Story 6)

1. After logging entries on at least three different days (via the calendar), open the
   History tab. **Expect**: a line chart with one point per logged day, correct net-calorie
   values, and no crash or missing native-module error (confirms the
   `react-native-linear-gradient`-avoidance decision in [research.md](./research.md) holds).

## Success criteria checklist

Map back to [spec.md](./spec.md)'s Success Criteria (SC-001…SC-007) — each manual scenario
above should leave you able to confirm all seven without inspecting code.
