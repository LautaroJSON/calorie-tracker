---
description: "Task list for Optional Daily Water Intake Tracker"
---

# Tasks: Optional Daily Water Intake Tracker

**Input**: Design documents from `/specs/004-water-intake-tracker/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Only one unit-test task is included — for the new pure module
`lib/calculations/water.ts` — matching the project's existing `lib/calculations/__tests__/*`
convention. No component/integration test scaffolding exists in this project, so none is added.

**Organization**: Tasks are grouped by user story. The shared data layer + the two display
components + the profile toggle are Foundational because the feature cannot be enabled or shown
without them; each user story phase is then screen wiring + that story's acceptance validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 / US4 (Foundational & Polish tasks have no story label)

## Path Conventions

Single Expo Router mobile app; paths are repo-root-relative (`lib/`, `components/`, `app/`).

---

## Phase 1: Setup

**Purpose**: Confirm the ground is ready — no project init needed (existing app).

- [X] T001 Confirm no new dependency is required: `Switch` is in `react-native`, and
  `circle-arrow-up`, `circle-arrow-down`, `glass-water` exist in
  `node_modules/lucide-react-native/dist/esm/icons/` (as `CircleArrowUp`, `CircleArrowDown`,
  `GlassWater`). No `package.json` change.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model, pure logic, storage, and the shared UI pieces every user story needs.

**⚠️ CRITICAL**: No user story phase can be completed until this phase is done.

- [X] T002 [P] Extend `lib/types.ts`: add `waterTrackingEnabled: boolean` and
  `waterGoalMl: number` to `UserProfile`; add `waterMl: number` to `DayLog`. (All required in
  the type — defaults are injected at load time, like `activityLevel`/`goal`.)
- [X] T003 [P] Create `lib/calculations/water.ts` exporting `WATER_STEP_ML = 50`,
  `DEFAULT_WATER_GOAL_ML = 2000`, `nextWaterMl(currentMl, deltaMl)` =
  `Math.max(0, currentMl + deltaMl)`, and `waterFillRatio(currentMl, goalMl)` =
  `goalMl > 0 ? Math.min(1, currentMl / goalMl) : 0`. See
  [contracts/water-helpers.md](./contracts/water-helpers.md).
- [X] T004 Create `lib/calculations/__tests__/water.test.ts` covering every row of
  the tables in [contracts/water-helpers.md](./contracts/water-helpers.md) (increment,
  decrement, floor at 0, crossing/exceeding goal; fill 0 / partial / exactly full / capped /
  divide-by-zero). Depends on T003.
- [X] T005 [P] Modify `lib/storage/profileStorage.ts`: add `waterTrackingEnabled: false` and
  `waterGoalMl: 2000` to the defaults object that `loadProfile` spreads before
  `JSON.parse(raw)`. Depends on T002.
- [X] T006 Modify `lib/storage/dayStorage.ts`: `emptyDayLog` returns `waterMl: 0`; `loadDayLog`
  parses as `{ waterMl: 0, ...JSON.parse(raw) }`; add
  `export async function setDayWaterMl(date: string, waterMl: number): Promise<DayLog>` that
  loads the day, saves `{ ...log, waterMl: Math.max(0, Math.round(waterMl)) }`, and returns the
  updated log. Depends on T002.
- [X] T007 [P] Create `components/WaterCounter.tsx` (`{ waterMl, goalMl, onChange }` props): a
  `Card` containing the vertical fill bar (`waterFillRatio` → height %), a column of
  `CircleArrowUp` / `CircleArrowDown` `Pressable`s calling
  `onChange(nextWaterMl(waterMl, ±WATER_STEP_ML))` with `claySquish` + `accessibilityLabel`,
  the `` `${waterMl} / ${goalMl}` `` label, and a `GlassWater` icon below it. `StyleSheet` +
  `lib/theme` only. See [contracts/components-and-storage.md](./contracts/components-and-storage.md).
  Depends on T002, T003.
- [X] T008 Create `components/DayOverview.tsx`: forwards the five `CalorieRing` props; when
  `water` prop is `null`/omitted renders `<CalorieRing/>` alone (no wrapper — FR-016); when
  provided renders a `row` `View` with `<CalorieRing/>` then `<WaterCounter {...water}/>` to
  its right (`alignItems: "center"`, `gap: spacing.md`). Depends on T007.
- [X] T009 [P] Modify `components/ProfileForm.tsx`: `ProfileFormValues` gains
  `waterTrackingEnabled: boolean` + `waterGoalMl: number`; add `waterTrackingEnabled` state
  (`initialValues?.waterTrackingEnabled ?? false`) and `waterGoalMlText` state
  (`String(initialValues?.waterGoalMl ?? 2000)`); render a "Water counter" `labelRow` + core
  `Switch` after "Weight Goal", and a "Daily goal (ml)" `FormTextInput` only when on;
  `handleSubmit` blocks with `setError("Enter a water goal greater than 0.")` when on and the
  value is not a whole number `> 0`; always pass `waterTrackingEnabled` and
  `waterGoalMl: Number(waterGoalMlText)` into `onSubmit`. Depends on T002.

**Checkpoint**: Data + logic + shared UI ready. `npm test` and `npx tsc --noEmit` green.

---

## Phase 3: User Story 1 - Track Water Consumed Today (Priority: P1) 🎯 MVP

**Goal**: With water tracking enabled, the Today screen shows the water component next to the
calorie ring and the ±50 ml arrows adjust today's total, which persists and resets per day.

**Independent Test**: Enable water tracking (goal 2000), open Today, tap up several times and
down a few, confirm ±50 ml per tap, floor at 0, over-goal shows true value with a full bar, the
value survives navigation, and a new calendar day starts at 0.

- [X] T010 [US1] Modify `app/(tabs)/index.tsx`: replace `<CalorieRing … />` with
  `<DayOverview … />`, passing
  `water={profile.waterTrackingEnabled ? { waterMl: dayLog.waterMl, goalMl: profile.waterGoalMl, onChange: handleWaterChange } : null}`;
  add `handleWaterChange(nextMl: number)` → `setDayWaterMl(today, nextMl).then(setDayLog)`.
  Depends on T006, T008, T009.
- [ ] T011 [US1] Validate quickstart scenarios 3 and 6 (today tracking, floor at 0, over-goal
  cap, persistence across tab switches, new-day rollover to 0). See [quickstart.md](./quickstart.md).

**Checkpoint**: User Story 1 fully functional — MVP deliverable.

---

## Phase 4: User Story 2 - Enable Water Tracking During Onboarding (Priority: P2)

**Goal**: A new user can turn on the "Water counter" switch during onboarding, set a goal
(pre-filled 2000), and see the water component on Today afterward; leaving it off changes
nothing.

**Independent Test**: Fresh install → onboarding → switch on → goal pre-filled 2000 → set 2500
→ finish → Today shows the water component with a 2500 goal; a separate run with the switch left
off shows no water UI anywhere.

- [X] T012 [US2] Confirm `app/onboarding.tsx` needs no change — `handleSubmit` already does
  `saveProfile({ ...values, updatedAt })` and `values` (a `ProfileFormValues`) now carries the
  two water fields, satisfying `UserProfile`. Run `npx tsc --noEmit` to verify; only adjust if
  the type check fails.
- [ ] T013 [US2] Validate quickstart scenarios 1, 2, and 7 (off by default, enable + goal
  pre-fill + custom goal reaches Today, goal validation blocks save). See [quickstart.md](./quickstart.md).

**Checkpoint**: Onboarding opt-in path works; feature still invisible when off.

---

## Phase 5: User Story 3 - Turn Water Tracking On or Off Later from Settings (Priority: P2)

**Goal**: From Settings, a user can toggle the "Water counter" switch and adjust the goal; the
Today/Calendar screens reflect it on return, and turning it off keeps stored data (no
confirmation).

**Independent Test**: Settings → switch on → set goal → save → Today shows the component; log
water; Settings → switch off → save → component gone from Today and Calendar, data retained;
switch back on → last goal and previously logged amounts reappear.

- [X] T014 [US3] Confirm `app/settings.tsx` needs no change (same reasoning as T012 — it spreads
  `values` into `saveProfile`). Verify with `npx tsc --noEmit`; adjust only if it fails.
- [ ] T015 [US3] Validate quickstart scenario 4 (enable in settings, disable is silent +
  non-destructive, re-enable restores goal and per-day amounts). See [quickstart.md](./quickstart.md).

**Checkpoint**: On/off lifecycle from settings works; disable never loses data (FR-017).

---

## Phase 6: User Story 4 - Review and Adjust Water on Past Days (Priority: P3)

**Goal**: With water tracking enabled, the Calendar screen shows the selected day's water
component next to its calorie ring, and the ±50 ml arrows edit that specific day.

**Independent Test**: Enable tracking, open Calendar, select a past day, tap up twice → that
day's amount +100 ml and persists on re-select; switch to Today → today's amount unaffected;
disable tracking → no water component on any Calendar day.

- [X] T016 [US4] [P] Modify `app/(tabs)/calendar.tsx`: replace `<CalorieRing … />` with
  `<DayOverview … />` using `totals.*` for the calorie props and
  `water={profile.waterTrackingEnabled ? { waterMl: dayLog.waterMl, goalMl: profile.waterGoalMl, onChange: handleWaterChange } : null}`;
  add `handleWaterChange(nextMl: number)` → `setDayWaterMl(selectedDate, nextMl).then(() => reload())`.
  Depends on T006, T008, T009.
- [ ] T017 [US4] Validate quickstart scenario 5 (past-day component visible + interactive,
  ±100 ml persists against that day only, today unaffected, hidden when tracking off). See
  [quickstart.md](./quickstart.md).

**Checkpoint**: All four user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T018 [P] Run `npm test`, `npx tsc --noEmit`, `npx expo lint` — all green; confirm
  feature 001/002/003 tests unchanged and passing.
- [X] T019 [P] Layout pass: on a ~360 px-wide screen the `CalorieRing` + `WaterCounter` row
  fits with no horizontal page scroll, on both Today and Calendar; tune `WaterCounter` bar
  width / arrow sizing and the `DayOverview` `gap` as needed (`StyleSheet` only).
- [ ] T020 Run the full [quickstart.md](./quickstart.md) manual pass end to end (all 7
  scenarios) on Android.
- [X] T021 [P] Update `README.md` "Features" list to note the optional daily water tracker
  (ml, on/off in the profile, shown on Today + Calendar).
- [X] T022 Add React Native Testing Library (`@testing-library/react-native`, `jest.setup.js`
  with an in-memory AsyncStorage mock + lucide/ring/reanimated stubs; `setupFiles` in
  `package.json`).
- [X] T023 [P] Component tests: `components/__tests__/WaterCounter.test.tsx` (label, ±50 ml
  taps, floor at 0, over-goal, `onChange`), `components/__tests__/CalorieRing.test.tsx`
  (net value, goal / overage text, excess badge), `components/__tests__/DayOverview.test.tsx`
  (water shown/hidden by the `water` prop). Automates US1/US4 display checks.
- [X] T024 [P] Integration tests: `__tests__/integration/calorieFlow.test.tsx` (add → edit →
  delete a food entry, and exercise subtraction, reflected in `CalorieRing` via the real
  storage + `computeNetCalories` path) and `__tests__/integration/waterFlow.test.tsx` (arrow
  taps → `setDayWaterMl` → reload → display, persistence, per-day isolation, floor at 0).

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)**: none.
- **Foundational (P2)**: after Setup. Blocks every user story.
- **US1 (P3)**: after Foundational. MVP.
- **US2 (P4)** and **US3 (P5)**: after Foundational; independent of US1's screen wiring but
  most easily *validated* once T010 lets you see the result on Today.
- **US4 (P6)**: after Foundational; independent of US1–US3 (different file, `calendar.tsx`).
- **Polish (P7)**: after all targeted stories.

### Key task-level dependencies

- T004 → T003
- T005 → T002 ; T006 → T002 ; T009 → T002
- T007 → T002, T003
- T008 → T007
- T010 → T006, T008, T009
- T016 → T006, T008, T009

### Parallel opportunities

- **Foundational**: T002 ‖ T003 first; then T005 ‖ T006 ‖ T007 ‖ T009 (four different files),
  with T004 after T003 and T008 after T007.
- **User stories**: once Foundational is done, T010 (Today) and T016 (Calendar) touch
  different files and can proceed in parallel; US2/US3 verification (T012–T015) can run
  alongside.
- **Polish**: T018 ‖ T019 ‖ T021.

---

## Parallel Example: Foundational

```bash
# Wave 1 (independent):
Task: "T002 extend lib/types.ts with water fields"
Task: "T003 create lib/calculations/water.ts"

# Wave 2 (after T002/T003):
Task: "T005 add water defaults to loadProfile in lib/storage/profileStorage.ts"
Task: "T006 add waterMl normalization + setDayWaterMl to lib/storage/dayStorage.ts"
Task: "T007 create components/WaterCounter.tsx"
Task: "T009 add Water counter Switch to components/ProfileForm.tsx"
# then T004 (water.test.ts), then T008 (DayOverview)
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Phase 1 Setup → Phase 2 Foundational (T001–T009).
2. Phase 3 US1 (T010–T011).
3. **STOP & VALIDATE**: enable water tracking, exercise the Today counter, confirm persistence
   and rollover.
4. Ship / demo.

### Incremental delivery

Foundational → US1 (MVP) → US2 → US3 → US4, validating each story independently before moving
on. Each phase leaves the app shippable; with `waterTrackingEnabled` off the app is unchanged
from feature 003 at every step.

---

## Notes

- `[P]` = different files, no incomplete dependencies.
- The only new automated test is T004 (`water.test.ts`); all other validation is the manual
  quickstart pass, consistent with this project.
- Commit after each task or logical group.
- Constitution: `AsyncStorage` only, Expo Go-safe (no new native deps), `StyleSheet` only,
  everything typed — re-checked in T018.
