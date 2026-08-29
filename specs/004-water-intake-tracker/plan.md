# Implementation Plan: Optional Daily Water Intake Tracker

**Branch**: `004-water-intake-tracker` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-water-intake-tracker/spec.md`

## Summary

Add an optional per-day water tracker, in milliliters, alongside the existing calorie ring.

1. **Profile** gains two fields — `waterTrackingEnabled` (default off) and `waterGoalMl`
   (default 2000). The shared `components/ProfileForm.tsx` (used by both onboarding and
   settings) gets a **"Water counter"** row: a built-in `Switch`, and — only when it is on — a
   numeric goal `FormTextInput` pre-filled with the saved goal or `2000`, required to be a
   whole number `> 0`.
2. **DayLog** gains `waterMl` (default 0). A new `setDayWaterMl(date, ml)` in
   `lib/storage/dayStorage.ts` persists it against any day.
3. **UI** — a new `components/WaterCounter.tsx` (vertical fill bar + circled up/down arrows +
   `"current / goal"` label + glass-water icon) and a new `components/DayOverview.tsx` that
   lays the existing `<CalorieRing>` and the `<WaterCounter>` side by side in one row.
   `app/(tabs)/index.tsx` and `app/(tabs)/calendar.tsx` render `<DayOverview>` instead of
   `<CalorieRing>` directly; each passes a `water` prop (with an `onChange` that calls
   `setDayWaterMl` for that screen's day) only when `waterTrackingEnabled` is true, so the
   arrows work on both today and any past day.
4. **Pure logic** — `lib/calculations/water.ts` holds `nextWaterMl(current, delta)` (step,
   floor at 0) and `waterFillRatio(current, goal)` (0–1, capped, divide-by-zero safe), with a
   unit test mirroring `lib/calculations/__tests__/*`.

No new dependencies (`Switch` is core React Native; `CircleArrowUp` / `CircleArrowDown` /
`GlassWater` are in the already-installed `lucide-react-native`). No new AsyncStorage key — the
existing `profile` and `day:YYYY-MM-DD` values gain one/two fields each, defaulted on load the
same way `activityLevel` / `goal` already are. No new screen. History chart and the
net-calorie / daily-goal math are untouched.

## Technical Context

**Language/Version**: TypeScript on the existing Expo SDK 57 / React Native 0.86 project —
unchanged.

**Primary Dependencies**: None new. `Switch` from `react-native` (core, Expo Go-safe).
`CircleArrowUp`, `CircleArrowDown`, `GlassWater` from `lucide-react-native` (already a project
dependency — verified present in `node_modules`). Deliberately **not** adding any slider,
gauge, or animated-progress library.

**Storage**: Existing `AsyncStorage` keys. `profile` JSON gains `waterTrackingEnabled: boolean`
and `waterGoalMl: number`; each `day:YYYY-MM-DD` JSON gains `waterMl: number`. Values absent
from previously stored JSON are filled in on load (`loadProfile` / `loadDayLog` spread a
defaults object first), exactly like the feature-002 `activityLevel` / `goal` defaults.

**Testing**: `jest` / `jest-expo` (already configured). New pure module gets
`lib/calculations/__tests__/water.test.ts`, mirroring the `bmr` / `netCalories` / `calorieGoal`
test pattern. `computeNetCalories` takes a `Pick<DayLog, "foodEntries" | "exerciseEntries">`,
so adding `waterMl` to `DayLog` does not touch it or its tests.

**Target Platform**: Android (and iOS) inside Expo Go / the release APK — unchanged.

**Project Type**: Extension within the existing single Expo Router mobile app. No new screen,
no new module boundary.

**Performance Goals**: Unchanged. A tap does one integer add + one `AsyncStorage.setItem` of a
single day's JSON; the bar fill is one division. No animation loop.

**Constraints**: Must not regress features 001–003. When `waterTrackingEnabled` is false, the
Today and Calendar screens must render the calorie ring byte-for-byte as before (FR-016). Fully
offline, no notifications.

**Scale/Scope**: 3 existing files modified (`ProfileForm.tsx`, `(tabs)/index.tsx`,
`(tabs)/calendar.tsx`), 2 storage/type files extended (`lib/types.ts`,
`lib/storage/dayStorage.ts`, `lib/storage/profileStorage.ts`), 3 new files (2 components + 1
pure helper) plus 1 new test file. `app/onboarding.tsx` and `app/settings.tsx` need no change
(the new `ProfileForm` values flow through their existing `saveProfile({ ...values, ... })`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Local-Only Storage | Still `AsyncStorage` only. Same `profile` and `day:*` keys; two/one new JSON fields, no new key, no backend, no sync. | PASS |
| II. Expo Go Compatibility | No new dependency. `Switch` is a core RN component; the three icons are from `lucide-react-native`, already installed. No `expo prebuild`, no native module. | PASS |
| III. Native StyleSheet Only | `WaterCounter`, `DayOverview`, and the `ProfileForm` water row use `StyleSheet.create` + existing `lib/theme` tokens. The `Switch` is styled only via its `trackColor` / `thumbColor` props (component props, not a styling library). | PASS |
| IV. Simplicity for Portfolio Clarity | `WaterCounter` and `DayOverview` each have exactly two call sites (Today + Calendar), so both abstractions are earned. Increment/fill math is two small pure functions in `lib/calculations/water.ts` with focused tests, matching the existing `lib/calculations` convention. `CalorieRing` is reused unchanged. | PASS |
| V. TypeScript-Typed Components | New component props, the extended `UserProfile` / `DayLog` / `ProfileFormValues`, and the new helper signatures are all explicitly typed; no `any`. | PASS |

No violations — Complexity Tracking is intentionally empty.

**Post-Phase-1 re-check**: design adds one pure module (`lib/calculations/water.ts` + test),
two `StyleSheet`-only components (`WaterCounter`, `DayOverview`), one `Switch` + conditional
input in `ProfileForm`, one storage function (`setDayWaterMl`), and two defaulted-on-load JSON
fields. No dependency, no storage key, no screen, no change to calorie math. All five
principles still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-water-intake-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── water-helpers.md
│   └── components-and-storage.md
├── checklists/
│   └── requirements.md  # from /speckit-specify + /speckit-clarify
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (existing repository, files modified/added by this feature)

```text
lib/
├── types.ts                          # MODIFIED — UserProfile gains waterTrackingEnabled +
│                                     #            waterGoalMl; DayLog gains waterMl
├── calculations/
│   ├── water.ts                      # NEW — nextWaterMl(), waterFillRatio(), constants
│   │                                 #       (WATER_STEP_ML=50, DEFAULT_WATER_GOAL_ML=2000)
│   └── __tests__/
│       └── water.test.ts             # NEW — unit tests for lib/calculations/water.ts
└── storage/
    ├── profileStorage.ts             # MODIFIED — loadProfile default merge adds
    │                                 #            waterTrackingEnabled:false, waterGoalMl:2000
    └── dayStorage.ts                 # MODIFIED — emptyDayLog + loadDayLog normalize waterMl;
                                      #            new setDayWaterMl(date, ml)

components/
├── WaterCounter.tsx                  # NEW — vertical fill bar + circled up/down arrows +
│                                     #       "current / goal" label + GlassWater icon
├── DayOverview.tsx                   # NEW — row wrapping <CalorieRing> and (optional)
│                                     #       <WaterCounter>; renders CalorieRing alone when
│                                     #       water is not provided (FR-016)
├── CalorieRing.tsx                   # UNCHANGED — reused as-is
└── ProfileForm.tsx                   # MODIFIED — "Water counter" Switch row + conditional
                                      #            water-goal FormTextInput + validation;
                                      #            ProfileFormValues gains the two fields

app/
├── onboarding.tsx                    # UNCHANGED — saveProfile({ ...values, updatedAt })
│                                     #             already forwards the new values
├── settings.tsx                      # UNCHANGED — same reason
└── (tabs)/
    ├── index.tsx                     # MODIFIED — render <DayOverview> instead of
    │                                 #            <CalorieRing>; pass water={…} +
    │                                 #            handleWaterChange when tracking is on
    └── calendar.tsx                  # MODIFIED — same swap for the selected day
```

**Structure Decision**: No new directories or screens. The new pure helper sits with the
existing `lib/calculations` modules (project convention: tested pure functions isolated from
UI). `DayOverview` is the "parent component wrapping `CalorieRing` and the water counter" the
spec calls for (FR-009); making it a real shared component rather than inline JSX in
`(tabs)/index.tsx` is what lets Calendar reuse the exact same layout (FR-019).

## Complexity Tracking

*No Constitution Check violations were identified — this section is intentionally empty.*
