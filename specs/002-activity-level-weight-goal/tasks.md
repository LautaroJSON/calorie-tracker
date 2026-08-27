# Tasks: Activity Level and Weight Goal-Based Calorie Target

**Input**: Design documents from `/specs/002-activity-level-weight-goal/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: `contracts/calculation-functions.md` explicitly requires unit test coverage for the new
`calorieGoal.ts` module (test-first, mirroring feature 001's `bmr.test.ts` pattern). No new
UI/E2E test tasks — those are validated manually via `quickstart.md`, same as feature 001.

**Organization**: Tasks are grouped by user story (from spec.md, priority order). There is no
separate Setup phase — this feature reuses feature 001's project scaffold, dependencies, and
test configuration exactly as-is; nothing new to initialize.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2)
- All paths are relative to the repository root

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and calculation/storage logic that both user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Extend `lib/types.ts`: add `ActivityLevel` (`"sedentary" | "light" | "moderate" | "active"`) and `Goal` (`"maintain" | "lose" | "gain"`) union types, and add `activityLevel`/`goal` fields to `UserProfile` (data-model.md)
- [X] T002 [P] Write unit tests for the new formula in `lib/calculations/__tests__/calorieGoal.test.ts` per `contracts/calculation-functions.md`'s required coverage (one case per activity multiplier, one per goal adjustment, one combined non-default case); tests should fail until T003 is done
- [X] T003 Implement `lib/calculations/calorieGoal.ts` exporting `ACTIVITY_MULTIPLIERS`, `GOAL_ADJUSTMENTS`, and `calculateDailyCalorieGoal(profile)` — calls the existing, unmodified `calculateBmr()` from `bmr.ts` and applies the multiplier then the additive adjustment, per FR-005/FR-006/FR-007 (depends on T001; satisfies T002)
- [X] T004 Update `lib/storage/profileStorage.ts`'s `loadProfile()` to default a missing `activityLevel` to `"sedentary"` and a missing `goal` to `"maintain"` for profiles saved before this feature existed (FR-008) — a read-time default only, no rewrite to storage (depends on T001)

**Checkpoint**: Foundation ready — both user stories can now be implemented/verified.

---

## Phase 2: User Story 1 - Set Activity Level and Weight Goal During Onboarding (Priority: P1) 🎯 MVP

**Goal**: New users select an activity level and a weight goal during onboarding, and the daily
calorie goal shown from that point on reflects `BMR × activity multiplier ± goal adjustment`
instead of raw BMR.

**Independent Test**: Complete onboarding on a fresh install, select an activity level and a
weight goal, and verify the daily calorie goal shown afterward equals BMR × the selected
multiplier, adjusted by the selected goal's fixed amount.

- [X] T005 [US1] Extend `components/ProfileForm.tsx`: add `activityLevel`/`goal` to `ProfileFormValues`; add two new option-selector groups (4-option Activity Level, 3-option Weight Goal) reusing the existing `Pressable`-pill pattern already built for Sex; block submission unless both are selected (FR-001, FR-002, FR-003, FR-004) (depends on T001) — extracted a small internal `OptionRow<T>` helper since there are now 3 identical selector groups (Sex/Activity/Goal), replacing the old sex-only styles with generic reusable ones; both fields always have a pre-selected default (mirrors the Sex field's existing pattern and the legacy-profile default), so there is no blank/unselected state to block
- [X] T006 [P] [US1] Update `app/(tabs)/index.tsx` to call `calculateDailyCalorieGoal(profile)` instead of `calculateBmr(profile)` for the displayed daily goal (FR-005) (depends on T003)
- [X] T007 [P] [US1] Update `app/(tabs)/calendar.tsx` to call `calculateDailyCalorieGoal(profile)` instead of `calculateBmr(profile)` for the displayed daily goal (FR-005) (depends on T003)

> `app/onboarding.tsx` and `app/settings.tsx` need **no code changes**: both already do
> `saveProfile({ ...values, updatedAt })` without touching individual fields, so they inherit the
> two new questions automatically once T005 lands.

**Checkpoint**: A fresh onboarding flow asks the new questions, and the Today/Calendar goal
reflects the new formula. This alone is a complete, demoable increment.

---

## Phase 3: User Story 2 - Update Activity Level and Weight Goal Later (Priority: P2)

**Goal**: Users can change activity level/weight goal from settings at any time, and a profile
that predates this feature defaults sensibly (Sedentary/Maintain) instead of crashing or showing
a blank selection.

**Independent Test**: Open settings for an existing profile, change activity level and/or weight
goal, save, and confirm the daily calorie goal on Today/Calendar updates to match.

- [X] T008 [US2] Verify end-to-end per `quickstart.md` scenarios 2 and 3: a profile lacking `activityLevel`/`goal` surfaces as Sedentary/Maintain pre-selected in Settings and shows `BMR × 1.2` on Today with no crash; changing activity/goal in Settings and saving updates the Today/Calendar goal immediately (FR-008, FR-009) — confirmed by reading `app/settings.tsx` and `app/onboarding.tsx` (both already spread `ProfileFormValues` untouched into `saveProfile()`, and `tsc --noEmit` passes with no `any`/cast needed, proving the extended types line up end-to-end) plus a clean `npx expo export --platform android` (3887 modules, 0 unresolved) after all Foundational + US1 changes; no additional files needed changing

**Checkpoint**: Both user stories are independently functional — the full feature is complete.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T012 Add an info affordance next to the "Activity Level" and "Weight Goal" labels in `components/ProfileForm.tsx` that opens a dialog explaining what each option means (requested after initial manual testing confirmed the feature works) — new `components/InfoDialog.tsx` using React Native's built-in `Modal` (not `Alert.alert`, which is a no-op on web per feature 001's earlier bug) and the existing `lucide-react-native` `Info` icon; `ACTIVITY_OPTIONS`/`GOAL_OPTIONS` in `ProfileForm.tsx` gained a `description` field as the single source of truth for both the selector pills and the dialog content
- [X] T013 Fix bug (user-reported): on first launch, pressing "Get started" after onboarding did nothing until the app was reloaded — root cause was `app/_layout.tsx` computing `hasProfile` once in a `useEffect` on mount, so saving the profile never updated the `Stack.Protected` guard, and the explicit `router.replace("/(tabs)")` raced that stale `false` guard and silently failed; fixed by extracting a `ProfileGateProvider`/`useProfileGate` context (new `lib/profileGate.tsx`) so `onboarding.tsx` calls `refreshProfile()` after saving, letting `Stack.Protected` swap to `(tabs)` on its own per expo-router's standard protected-routes pattern (manual `router.replace` removed as unnecessary and race-prone)
- [X] T014 Visual-only rework (user-requested, no new functional requirements/acceptance criteria — purely a skin change, so handled as a cross-cutting polish task rather than a new spec): installed the `claymorphism` design-system skill project-locally at `.claude/skills/claymorphism/` (from github.com/bergside/awesome-design-skills) and re-themed the whole app to it using native `StyleSheet` only, per Constitution Principle III — `lib/theme.ts` rewritten with clay-style tokens (tinted `background` canvas vs. white `surface` cards, bigger `radius` scale, a `shadow.raised`/`raisedSm` pair standing in for claymorphism's dual-shadow puffiness since RN has no built-in inset/multi-shadow support, a `claySquish(pressed)` helper for press feedback, bolder `typography` weights, and a new uppercase `typography.label` token); new `components/Card.tsx` reusable raised-surface wrapper adopted by `CalorieRing`, `EntryList`'s empty state, `ProfileForm`, `EntryForm`, `DayCalendar`, and `NetCaloriesChart` to cut duplication; every `Pressable` button/pill/chip now uses `claySquish` for a press-in feel; audited every prior use of `colors.background` (which changed meaning from "white" to "tinted canvas fill") to replace foreground-color usages (button/icon text, chart axis colors) with `colors.surface` where the white was actually meant, verified by `tsc`/`lint`/`jest` all clean plus a clean `expo export --platform android`

- [X] T009 [P] Run `npx jest` and confirm feature 001's `bmr.test.ts`/`netCalories.test.ts` are unmodified and still passing, alongside the new `calorieGoal.test.ts` (regression check per plan.md's Technical Context constraint) — 18/18 passing; `bmr.test.ts`/`netCalories.test.ts` file timestamps confirmed unchanged since feature 001
- [X] T010 [P] Run `npx tsc --noEmit` and `npx expo lint` to confirm no regressions (same gate used throughout feature 001) — both clean
- [ ] T011 Run all three manual scenarios in `quickstart.md` end-to-end in Expo Go — **not run**: no physical device, simulator, or Expo Go client is available in this environment; requires the user to run it (same limitation as feature 001's T038)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. BLOCKS both user stories.
- **User Story 1 (Phase 2)**: Depends on Foundational. No dependency on User Story 2.
- **User Story 2 (Phase 3)**: Depends on Foundational **and** on User Story 1's T005/T006/T007,
  since it verifies behavior through the exact same `ProfileForm`/screen code US1 builds — this
  feature's two stories share nearly all of their implementation, by design (see plan.md).
- **Polish (Phase 4)**: Depends on both user stories being complete.

### Parallel Opportunities

- Foundational: T001 and T002 in parallel; T003 and T004 both depend on T001 but not on each
  other, so they can run in parallel once T001 is done.
- User Story 1: T006 and T007 in parallel (different files), both after T003; T005 is
  independent of T006/T007 (different files) and can run in parallel with them.
- Polish: T009 and T010 in parallel.

---

## Parallel Example: Foundational Phase

```bash
Task: "Extend lib/types.ts with ActivityLevel, Goal, and extended UserProfile"
Task: "Write unit tests for the new formula in lib/calculations/__tests__/calorieGoal.test.ts"
```

## Parallel Example: User Story 1

```bash
Task: "Extend components/ProfileForm.tsx with the two new selector groups"
Task: "Update app/(tabs)/index.tsx to use calculateDailyCalorieGoal"
Task: "Update app/(tabs)/calendar.tsx to use calculateDailyCalorieGoal"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Foundational
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: fresh onboarding asks the new questions and computes the new formula
   correctly — this alone delivers the feature's core value for every *new* user.

### Incremental Delivery

1. Foundational → nothing user-visible yet
2. + User Story 1 → **MVP**: new onboarding + corrected formula for new profiles
3. + User Story 2 → existing profiles get the same corrected formula (one-time recalculation)
   and become editable from Settings
4. + Polish → regression and manual verification pass

Because this feature is a small, tightly-scoped extension of an already-shipped feature, User
Story 2 adds no new files of its own — it is a verification pass confirming the shared
Foundational + User Story 1 work already satisfies its acceptance scenarios.
