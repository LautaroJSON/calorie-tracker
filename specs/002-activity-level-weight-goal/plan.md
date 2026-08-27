# Implementation Plan: Activity Level and Weight Goal-Based Calorie Target

**Branch**: `002-activity-level-weight-goal` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-activity-level-weight-goal/spec.md`

## Summary

Extend the existing profile (feature 001) with two new required selections — Activity Level
(Sedentary/Routine/Moderate/High) and Weight Goal (Maintain/Lose/Gain) — captured in both the
onboarding and settings forms. The daily calorie goal shown on the Today and Calendar screens
changes from raw BMR to `BMR × activity multiplier ± goal adjustment`. Profiles saved before
this feature existed are treated as Sedentary + Maintain, which recalculates their goal once
(from raw BMR to `BMR × 1.2`) — an intentional, stakeholder-confirmed one-time change, not a
frozen legacy state. No new screens, dependencies, or storage keys are introduced; this is a
pure extension of feature 001's profile form and calculation layer.

## Technical Context

**Language/Version**: TypeScript on the existing Expo SDK 57 project (unchanged from feature
001 — no version changes required).

**Primary Dependencies**: None new. Reuses the existing `react-native` primitives already used
by `components/ProfileForm.tsx` (the same `Pressable`-row toggle pattern already built for
Sex is reused for the two new option groups).

**Storage**: Extends the existing `"profile"` `AsyncStorage` key's JSON shape (feature 001,
[../001-daily-calorie-tracker/contracts/storage-schema.md](../001-daily-calorie-tracker/contracts/storage-schema.md))
with two new fields, `activityLevel` and `goal`. No new keys, no schema/migration framework —
missing-field defaulting happens in the existing `loadProfile()` read path.

**Testing**: `jest` (already configured). Add unit tests for the new pure calculation module
following the exact pattern of `lib/calculations/__tests__/bmr.test.ts` and
`netCalories.test.ts` from feature 001.

**Target Platform**: iOS and Android inside Expo Go — unchanged from feature 001.

**Project Type**: Extension within the existing single Expo Router mobile app; no new project
or module boundary.

**Performance Goals**: Unchanged — the added calculation is a constant-time multiply/add on
values already held in memory.

**Constraints**: Must not change any behavior from feature 001 other than what the goal number
itself represents (net-calorie calculation, calendar, history, entry CRUD are all untouched).
Must not regress `bmr.ts`'s existing tests — `calculateBmr()` keeps computing raw BMR exactly as
before; the new formula is layered on top in a separate module.

**Scale/Scope**: Six existing files touched (see Project Structure), one new module + one new
test file. No new screens, per spec.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Local-Only Storage | Still `AsyncStorage` only; the two new fields live in the same `"profile"` JSON blob, no new key, no backend. | PASS |
| II. Expo Go Compatibility | No new dependencies at all. | PASS |
| III. Native StyleSheet Only | New form options reuse the existing `StyleSheet`-based toggle-row pattern already in `ProfileForm.tsx`; no styling library introduced. | PASS |
| IV. Simplicity for Portfolio Clarity | The new formula lives in its own small pure module (`calorieGoal.ts`) rather than being bolted onto `bmr.ts` or duplicated inline in two screens — two real call sites (Today, Calendar) justify the shared module. | PASS |
| V. TypeScript-Typed Components | New `ActivityLevel`/`Goal` fields are explicit string-literal union types, not `any`/loose strings. | PASS |

No violations — Complexity Tracking is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-activity-level-weight-goal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/            # Phase 1 output
│   ├── storage-schema.md
│   └── calculation-functions.md
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (existing repository, files modified/added by this feature)

```text
lib/
├── types.ts                        # MODIFIED: add ActivityLevel, Goal types; extend UserProfile
├── calculations/
│   ├── bmr.ts                       # UNCHANGED — still raw Harris-Benedict BMR
│   ├── calorieGoal.ts                # NEW — activity multiplier + goal adjustment on top of BMR
│   └── __tests__/
│       └── calorieGoal.test.ts       # NEW — test-first, mirrors bmr.test.ts's pattern
└── storage/
    └── profileStorage.ts             # MODIFIED: loadProfile() defaults missing fields

components/
└── ProfileForm.tsx                  # MODIFIED: 2 new option-selector groups + extended type

app/
├── onboarding.tsx                   # UNCHANGED (already spreads ProfileFormValues)
├── settings.tsx                     # UNCHANGED (already spreads ProfileFormValues)
└── (tabs)/
    ├── index.tsx                     # MODIFIED: calculateBmr → calculateDailyCalorieGoal
    └── calendar.tsx                  # MODIFIED: calculateBmr → calculateDailyCalorieGoal
```

**Structure Decision**: No new top-level directories or screens — this feature is a pure
extension of feature 001's existing profile-form and calculation-layer structure, exactly as
scoped in the spec ("no agrega pantallas nuevas").

## Complexity Tracking

*No Constitution Check violations were identified — this section is intentionally empty.*
