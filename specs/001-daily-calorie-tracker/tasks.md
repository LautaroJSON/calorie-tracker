# Tasks: Daily Calorie Tracker

**Input**: Design documents from `/specs/001-daily-calorie-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: The feature spec and `contracts/calculation-functions.md` explicitly require the
TMB/net-calorie logic to live in pure, independently testable functions. Unit test tasks for
that calculation layer are therefore included (test-first). No UI/E2E test tasks are
included — those are validated manually via `quickstart.md`.

**Organization**: Tasks are grouped by user story (from spec.md, in priority order) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US6)
- All paths are relative to the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization

- [X] T001 Bootstrap the Expo Router + TypeScript project at the repository root (`npx create-expo-app@latest . --template` with the TypeScript/expo-router template), producing `app.json`, `tsconfig.json`, `babel.config.js`, and an initial `app/` directory
- [X] T002 Install feature dependencies: `@react-native-async-storage/async-storage`, `expo-router` (if not already pinned by T001), `lucide-react-native`, `react-native-svg`, `react-native-circular-progress-indicator`, `react-native-calendars`, `react-native-gifted-charts`, `expo-linear-gradient` (do **not** install `react-native-linear-gradient` — see `research.md` §7; `expo-linear-gradient` was added after `npx expo start` surfaced that `gifted-charts` requires a gradient package unconditionally, not just for gradient-style charts)
- [X] T003 [P] Configure `jest` with the `jest-expo` preset and a `test` script in `package.json` for unit-testing the pure calculation modules
- [X] T004 [P] Enable TypeScript `strict` mode in `tsconfig.json` and add an ESLint config consistent with Constitution Principle V (typed components, no unexplained `any`)

**Checkpoint**: `npx expo start` launches a blank Expo Router app in Expo Go with no dev-client prompt.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, storage, calculation, and navigation shell that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create `lib/theme.ts` with central color, spacing, and typography tokens (plan.md Project Structure; Constitution Principle III)
- [X] T006 [P] Create `lib/types.ts` with `UserProfile`, `DayLog`, `FoodEntry`, `ExerciseEntry` interfaces per `data-model.md`
- [X] T007 [P] Create `lib/storage/keys.ts` exporting the `"profile"` key constant and a `dayKey(date: string): string` builder returning `` `day:${date}` `` per `contracts/storage-schema.md`
- [X] T008 [P] Create `lib/storage/profileStorage.ts` with `loadProfile(): Promise<UserProfile | null>` and `saveProfile(profile: UserProfile): Promise<void>` per `contracts/storage-schema.md` (depends on T006, T007)
- [X] T009 [P] Create `lib/storage/dayStorage.ts` with `loadDayLog(date): Promise<DayLog>` (returns an empty `DayLog` when the key is absent, FR-021), `saveDayLog(date, log): Promise<void>`, and entry helpers `addEntry`, `updateEntry`, `deleteEntry` per `contracts/storage-schema.md` (depends on T006, T007)
- [X] T010 [P] Write unit tests for the BMR formula in `lib/calculations/__tests__/bmr.test.ts` per `contracts/calculation-functions.md` (male and female branches with hand-verifiable fixtures); tests should fail until T011 is done
- [X] T011 Implement `lib/calculations/bmr.ts` exporting `calculateBmr(profile)` per FR-005, satisfying T010
- [X] T012 [P] Write unit tests for net-calorie logic in `lib/calculations/__tests__/netCalories.test.ts` per `contracts/calculation-functions.md`'s required coverage list (food-only, food-and-exercise, exercise-exceeds-food excess, net-equals-goal, net-exceeds-goal); tests should fail until T013 is done
- [X] T013 Implement `lib/calculations/netCalories.ts` exporting `sumCalories`, `computeNetCalories` (zero-floored `netCalories` + `uncompensatedExcess`, FR-016), and `computeGoalStatus` (`isOverGoal`/`overageAmount`, strictly-greater-than semantics, FR-017), satisfying T012
- [X] T014 [P] Create `components/ProfileIcon.tsx`: circular profile icon shown top-corner, navigates to `/settings` on tap (FR-023)
- [X] T015 [P] Create `components/LoadingPlaceholder.tsx` using `ActivityIndicator` for short waits and the `Animated` API for an opacity-pulsing skeleton row (research.md §8)
- [X] T016 Create `app/_layout.tsx` root layout: on boot, show `LoadingPlaceholder` while calling `profileStorage.loadProfile()`, then redirect to `/onboarding` if the result is `null`, otherwise render the `(tabs)` group (FR-003) (depends on T008, T015)
- [X] T017 Create `app/(tabs)/_layout.tsx` tab navigator shell with Today / Calendar / History tabs (lucide-react-native tab icons) and `ProfileIcon` in the header of each (FR-023) (depends on T014, T016)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - First-Time Profile Setup (Priority: P1) 🎯 MVP

**Goal**: A new user completes a weight/height/age/sex form and the app computes and stores their daily calorie goal.

**Independent Test**: Launch with no stored profile, complete the onboarding form, and verify the computed goal appears and the app proceeds to the main screen.

- [X] T018 [P] [US1] Create `components/ProfileForm.tsx`: weight (kg) / height (cm) / age / sex inputs with validation blocking submission on zero, negative, or non-numeric values (FR-004)
- [X] T019 [US1] Create `app/onboarding.tsx` using `ProfileForm`; on submit, call `profileStorage.saveProfile` (the daily goal is a derived value computed via `calculateBmr` wherever it is displayed, not stored), then navigate into the `(tabs)` group (FR-003, FR-005) (depends on T018, T008, T016)

**Checkpoint**: A fresh install can complete setup and reach the main screen with a computed goal.

---

## Phase 4: User Story 2 - Track Today's Food and Exercise (Priority: P1) 🎯 MVP

**Goal**: The Today screen shows a circular goal indicator and lets the user log food/exercise entries, with correct zero-floor and overage behavior.

**Independent Test**: Add food and exercise entries on the Today screen and verify the indicator and net-calorie total update correctly, including clamping at zero with the uncompensated-excess display and the over-goal visual state.

- [X] T020 [P] [US2] Create `components/CalorieRing.tsx` wrapping `react-native-circular-progress-indicator`; accepts `netCalories`, `dailyGoal`, `isOverGoal`, `overageAmount`, `uncompensatedExcess` and renders the over-goal color/message and the `"0 (-N)"` excess text (FR-007, FR-016, FR-017; research.md §5)
- [X] T021 [P] [US2] Create `components/EntryRow.tsx`: a rounded-corner row displaying an entry's time, note, and calories (FR-024)
- [X] T022 [US2] Create `components/EntryList.tsx` rendering a `DayLog`'s food and exercise entries, time-sorted, using `EntryRow` (FR-011) (depends on T021)
- [X] T023 [P] [US2] Create `components/EntryForm.tsx`: shared calorie-amount (required, positive) + optional note form used for both food and exercise entries (FR-008, FR-009)
- [X] T024 [US2] Create `app/entry-form.tsx` modal route: creates a new food or exercise entry for a given date using `EntryForm` and `dayStorage.addEntry`, auto-timestamping it (FR-008, FR-009, FR-010) (depends on T023, T009) — built with edit-mode and arbitrary-date support from the start (see T026, T030) since it is one small screen
- [X] T025 [US2] Create `app/(tabs)/index.tsx` Today screen: load the profile's daily goal and today's `DayLog` on mount and on focus, compute net calories/goal status via `lib/calculations/netCalories.ts`, render `CalorieRing` + `EntryList`, and a floating "+" button linking to `/entry-form` for today's date (FR-007, FR-011, FR-014, FR-015) (depends on T020, T022, T013, T009, T008, T017)

**Checkpoint**: User Stories 1 AND 2 both work independently — the core daily tracking loop is usable end-to-end.

---

## Phase 5: User Story 3 - Edit and Delete Entries (Priority: P2)

**Goal**: The user can correct or remove any existing entry for the day they're viewing.

**Independent Test**: Edit an existing entry's calories/note and confirm the list and totals update; delete an entry and confirm it disappears and totals recalculate, including excess/overage states clearing correctly.

- [X] T026 [US3] Extend `app/entry-form.tsx` to support edit mode: read `entryId`/`date`/`type` route params, prefill `EntryForm` with the existing entry, and call `dayStorage.updateEntry` on save instead of `addEntry` (FR-012) (depends on T024) — implemented directly in T024's `entry-form.tsx`
- [X] T027 [P] [US3] Add edit and delete actions to `components/EntryRow.tsx` (edit navigates to `/entry-form` with the entry's params; delete calls `dayStorage.deleteEntry` after a confirmation prompt) and have `components/EntryList.tsx` pass through the date/type context needed for those actions (FR-013) (depends on T021, T022, T009) — implemented directly in `EntryRow`/`EntryList` plus `app/(tabs)/index.tsx`'s `handleEdit`/`handleDelete`

**Checkpoint**: All three P1/P2-so-far stories work independently; entries are fully correctable.

---

## Phase 6: User Story 4 - Review and Edit Past Days via Calendar (Priority: P2)

**Goal**: A monthly calendar lets the user jump to any past day and view/edit that day's entries in isolation, with "today" and "selected" visually distinguishable even on the same date.

**Independent Test**: Log entries today, navigate to a different past day via the calendar, add/edit/delete entries there, and confirm today's data is unaffected; confirm future dates are not selectable and that today/selected markers are both visible when they coincide.

- [X] T028 [P] [US4] Create `components/DayCalendar.tsx` wrapping `react-native-calendars`, building a `markedDates` map that applies a "today" style and a "selected" style as independent, simultaneously-visible layers on the same date, and disables dates after today (FR-019, FR-020; research.md §6) — uses the library's dot-marking (`marked`/`dotColor`) for "today" plus `selected`/`selectedColor` for "selected", which render as independent layers per BasicDay's implementation, so both remain visible even on the same date
- [X] T029 [US4] Create `app/(tabs)/calendar.tsx`: render `DayCalendar`, load the selected date's `DayLog` on selection and on focus, render `EntryList` + `CalorieRing` for that date, and a floating "+" button linking to `/entry-form` for the selected date (FR-018, FR-021) (depends on T028, T022, T020, T013, T009, T017)
- [X] T030 [US4] Update `app/entry-form.tsx` to accept and use an arbitrary target date (not only today), so entries can be added from the Calendar screen against the selected past date (FR-018) (depends on T024, T029) — already generalized in T024's implementation (reads `date` from route params rather than hardcoding today)

**Checkpoint**: All four P1/P2 stories work independently — full day-by-day tracking with history correction is complete.

---

## Phase 7: User Story 5 - Update Profile Settings (Priority: P3)

**Goal**: The user can view and edit their profile from a settings screen, with the daily goal recalculating immediately.

**Independent Test**: Open settings, change a profile value, save, and confirm the Today screen's goal reflects the new value.

- [X] T031 [US5] Create `app/settings.tsx` using `components/ProfileForm.tsx`, pre-filled via `profileStorage.loadProfile`; on submit, recompute `calculateBmr` and call `profileStorage.saveProfile` (FR-006) (depends on T018, T011, T008) — the goal itself is recomputed wherever it is displayed (see T019 note); this screen only re-saves the profile
- [X] T032 [US5] Add profile-reload-on-focus to `app/(tabs)/index.tsx` and `app/(tabs)/calendar.tsx` so the daily goal updates immediately after returning from Settings (FR-006) (depends on T025, T029, T031) — already satisfied: both screens' `reload()` calls `loadProfile()` and are wrapped in `useFocusEffect`, so they refresh on every return from Settings

**Checkpoint**: Profile edits propagate correctly to every screen showing a daily goal.

---

## Phase 8: User Story 6 - View Calorie Trends Over Time (Priority: P3)

**Goal**: A history screen charts net calories per day so the user can see trends.

**Independent Test**: Log entries across several different days, open the History tab, and confirm one correctly-valued point per day, with gap days shown as zero.

- [X] T033 [P] [US6] Create `components/NetCaloriesChart.tsx` wrapping `react-native-gifted-charts`'s `LineChart` in plain-line mode only — no gradient/area-fill props (FR-022; research.md §7 — `expo-linear-gradient` is installed to satisfy the library's internal gradient fallback, but never imported directly by our code)
- [X] T034 [US6] Add `loadAllDayLogs(): Promise<DayLog[]>` to `lib/storage/dayStorage.ts` using `AsyncStorage.getAllKeys()` + `multiGet`, filtered to the `"day:"` prefix, per `contracts/storage-schema.md` (depends on T009) — implemented alongside the rest of the CRUD helpers in T009's file
- [X] T035 [US6] Create `app/(tabs)/history.tsx`: load all day logs via `loadAllDayLogs`, compute each day's net calories via `lib/calculations/netCalories.ts`, fill any day with no entries in the earliest-to-today range as zero, and render `NetCaloriesChart` (FR-022) (depends on T033, T034, T013, T017)

**Checkpoint**: All six user stories are independently functional — the full feature set from spec.md is implemented.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and consistency pass across the whole feature

- [X] T036 [P] Confirm `lib/calculations/__tests__/netCalories.test.ts` (T012) covers every case listed in `contracts/calculation-functions.md`'s required coverage list, adding any missing case — all 5 required cases plus a below-goal case are present; 10/10 tests pass
- [X] T037 [P] Audit every screen and component for consistent use of `lib/theme.ts` tokens (colors, spacing, typography) and rounded-corner entry rows (FR-024; Constitution Principle III) — no stray hardcoded colors found outside `shadowColor: "#000"` on the two FABs (standard RN shadow convention, not a themed surface color); `npx expo lint` passes clean
- [ ] T038 Run all six manual validation scenarios in `quickstart.md` end-to-end in Expo Go on iOS and/or Android — **not run**: no physical device, simulator, or Expo Go client is available in this environment; requires the user to run it
- [X] T039 Verify Expo Go compatibility end-to-end (FR/Constitution Principle II) — an initial `npx expo export --platform android` bundled cleanly but the user's own `npx expo start` caught a real runtime error (`Gradient package was not found`) that static review had missed; fixed by installing `expo-linear-gradient` (see research.md §7), after which `npx expo export --platform android` bundled all 3885 modules with zero unresolved-module errors, and `tsc --noEmit`/`expo lint` both still pass clean. The user's own `npx expo start` run is what surfaced this, confirming manual verification in this environment alone would not have caught it

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Foundational completion
  - US1 and US2 (both P1) form the MVP and have no dependency on each other's *files*, but US2's screens are only reachable after US1's onboarding flow exists on a fresh install — build US1 first
  - US3 depends on US2's `entry-form.tsx`/`EntryRow`/`EntryList` files existing (extends them)
  - US4 depends on US2's `entry-form.tsx`/`EntryList`/`CalorieRing` (reuses them for the selected day)
  - US5 depends on US1's `ProfileForm` and reads/updates state shown on US2/US4's screens
  - US6 is fully additive — depends only on Foundational's `dayStorage`/`netCalories`
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### Within Each User Story

- Components before the screen that composes them
- Storage/calculation helpers (Foundational) before any screen that calls them
- A story's "extend existing file" tasks (US3, US4's date-param change, US5's focus-reload) run after the file they extend was created

### Parallel Opportunities

- Setup: T003 and T004 in parallel
- Foundational: T005–T007 in parallel; then T008 and T009 in parallel; T010 and T012 in parallel (both are test-writing tasks); T014 and T015 in parallel
- US2: T020, T021, T023 in parallel (independent component files)
- US4: T028 can start in parallel with US2/US3 work once Foundational is done
- US6: T033 can start in parallel with any other story once Foundational is done
- Polish: T036 and T037 in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T001–T004 (Setup) are done, launch these together:
Task: "Create lib/theme.ts with central color, spacing, and typography tokens"
Task: "Create lib/types.ts with UserProfile, DayLog, FoodEntry, ExerciseEntry interfaces"
Task: "Create lib/storage/keys.ts exporting the profile key constant and dayKey() builder"

# Then, once types.ts and keys.ts exist, launch these together:
Task: "Create lib/storage/profileStorage.ts with loadProfile/saveProfile"
Task: "Create lib/storage/dayStorage.ts with loadDayLog/saveDayLog/addEntry/updateEntry/deleteEntry"

# And these together (test-first pairs, independent of storage):
Task: "Write unit tests for BMR formula in lib/calculations/__tests__/bmr.test.ts"
Task: "Write unit tests for net-calorie logic in lib/calculations/__tests__/netCalories.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Create components/CalorieRing.tsx wrapping react-native-circular-progress-indicator"
Task: "Create components/EntryRow.tsx rounded-corner entry row"
Task: "Create components/EntryForm.tsx shared food/exercise entry form"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: User Story 1 (onboarding → daily goal)
4. Complete Phase 4: User Story 2 (log entries, see progress)
5. **STOP and VALIDATE**: run quickstart.md scenarios 1–2 — this alone is a demoable calorie tracker

### Incremental Delivery

1. Setup + Foundational → nothing runnable yet, but the app boots in Expo Go
2. + US1 → first-run setup works (still nothing to track)
3. + US2 → **MVP**: daily tracking loop fully works
4. + US3 → entries become correctable
5. + US4 → past-day history becomes viewable/editable via calendar
6. + US5 → profile becomes editable after the fact
7. + US6 → trend chart adds a reflective/motivational layer
8. + Polish → consistency and compatibility verification pass

Each increment leaves the app in a fully working, demoable state — no story's implementation breaks a previously completed one.
