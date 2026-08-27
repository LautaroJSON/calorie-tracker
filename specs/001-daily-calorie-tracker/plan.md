# Implementation Plan: Daily Calorie Tracker

**Branch**: `001-daily-calorie-tracker` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-daily-calorie-tracker/spec.md`

## Summary

A mobile-only, backend-free calorie tracker built with Expo + React Native + TypeScript.
On first launch the user enters weight/height/age/sex; the app computes a daily calorie
goal (BMR, revised Harris-Benedict formula) and persists the profile to `AsyncStorage`.
The main screen shows a circular progress indicator of net calories (food minus exercise,
floored at zero with an uncompensated-excess display) against that goal, with a list of
the day's entries and a floating "+" to add food/exercise entries. A monthly calendar lets
the user jump to any past day (each day's entries stored independently under its own
`AsyncStorage` key), and a history screen charts net calories per day over time. All
calculation logic (BMR, net calories, zero-floor/excess) lives in pure, independently
testable functions separate from UI components, per the project constitution.

## Technical Context

**Language/Version**: TypeScript 5.x on React Native, via the latest stable Expo SDK
(managed workflow; exact SDK patch version pinned at `npx create-expo-app` bootstrap time)

**Primary Dependencies**: `expo`, `expo-router` (file-based navigation, tabs + stack),
`@react-native-async-storage/async-storage` (persistence), `lucide-react-native` +
`react-native-svg` (icons), `react-native-circular-progress-indicator` (goal ring),
`react-native-calendars` (monthly calendar), `react-native-gifted-charts` (history line
chart, used in its plain-line mode) with `expo-linear-gradient` installed alongside it to
satisfy the chart library's internal gradient fallback — see [research.md](./research.md) §7

**Storage**: Device-local `AsyncStorage` only. Two key shapes: `"profile"` (single JSON
object) and `"day:YYYY-MM-DD"` (one JSON object per calendar day holding that day's food
and exercise entries). No SQLite, no remote database, no backend — see
[data-model.md](./data-model.md) and [contracts/storage-schema.md](./contracts/storage-schema.md).

**Testing**: `jest` with the `jest-expo` preset for unit tests of the pure calculation
modules (`bmr.ts`, `netCalories.ts`) and storage-mapping helpers. No end-to-end test
runner is introduced; UI flows are validated manually per [quickstart.md](./quickstart.md),
consistent with the constitution's simplicity principle for a portfolio-scoped app.

**Target Platform**: iOS and Android inside standard Expo Go (no custom dev client, no
native code). Web is not a target for this feature.

**Project Type**: Single Expo Router mobile app (no separate backend/API project).

**Performance Goals**: All UI updates after adding/editing/deleting an entry must feel
instant (no spinner, no perceptible delay — SC-003), since all reads/writes are local
JSON operations against `AsyncStorage`.

**Constraints**: Must run fully inside Expo Go (Constitution Principle II); must not
introduce any backend or remote data dependency (Principle I); styling must use React
Native `StyleSheet.create` only (Principle III); offline-capable by construction (there
is no network call anywhere in this feature).

**Scale/Scope**: Single user/profile per device install. Realistic data volume is small
(a handful of entries per day, one JSON blob per calendar day, plausibly a few hundred
day-keys over a year of use) — well within comfortable `AsyncStorage` limits, so no
pagination, indexing, or migration strategy is required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Local-Only Storage | Persistence is `AsyncStorage` only; no backend, no remote DB, no network calls anywhere in the design. | PASS |
| II. Expo Go Compatibility | All chosen libraries (`expo-router`, `async-storage`, `lucide-react-native`+`react-native-svg`, `react-native-circular-progress-indicator`, `react-native-calendars`, `react-native-gifted-charts`) are pure-JS or rely only on native modules bundled inside the Expo Go client (notably `react-native-svg`). `react-native-gifted-charts` unconditionally requires a linear-gradient package at import time (regardless of which chart type is used); this is satisfied with `expo-linear-gradient`, the official Expo package that *is* bundled in Expo Go — never the third-party `react-native-linear-gradient`, which is not. Verified with `npx expo export`. See [research.md](./research.md) §7. | PASS |
| III. Native StyleSheet Only | All screens/components styled via `StyleSheet.create` against a central `lib/theme.ts`; no CSS-in-JS or utility-class library is introduced. | PASS |
| IV. Simplicity for Portfolio Clarity | BMR/net-calorie/validation logic is isolated into small pure functions (`lib/calculations/*`) separate from UI; screens are plain, un-abstracted components matching the six user stories directly — no speculative framework or generic entry-type system beyond food/exercise. | PASS |
| V. TypeScript-Typed Components | Project is TypeScript end-to-end; all entities (`UserProfile`, `DayLog`, `FoodEntry`, `ExerciseEntry`) are explicit types shared between storage and UI layers. | PASS |

No violations identified — the Complexity Tracking table below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-daily-calorie-tracker/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── storage-schema.md
│   └── calculation-functions.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/                              # expo-router file-based routes
├── _layout.tsx                    # Root layout: loads profile on boot, redirects to
│                                   # /onboarding when no profile exists yet
├── onboarding.tsx                 # User Story 1 — first-run profile setup form
├── settings.tsx                   # User Story 5 — edit profile screen
├── entry-form.tsx                 # User Story 2/3 — add/edit food or exercise entry (modal)
└── (tabs)/
    ├── _layout.tsx                 # Tab bar: Today | Calendar | History
    ├── index.tsx                   # User Story 2/3 — Today screen (ring + entry list + FAB)
    ├── calendar.tsx                # User Story 4 — monthly calendar + selected day's entries
    └── history.tsx                 # User Story 6 — net-calories line chart

components/
├── ProfileIcon.tsx                 # Circular profile icon shown top-corner on every screen
├── CalorieRing.tsx                 # Wraps react-native-circular-progress-indicator
├── EntryRow.tsx                    # Rounded-corner row: time, note, calories
├── EntryList.tsx                   # Renders a day's EntryRow list with edit/delete actions
├── EntryForm.tsx                   # Shared calorie+note form used by entry-form.tsx
├── DayCalendar.tsx                 # Wraps react-native-calendars, sets markedDates for
│                                   # "today" vs "selected" per research.md
├── NetCaloriesChart.tsx            # Wraps react-native-gifted-charts (plain line mode)
└── LoadingPlaceholder.tsx          # ActivityIndicator + Animated-opacity skeleton row

lib/
├── theme.ts                        # Central colors, spacing, typography tokens
├── types.ts                        # UserProfile, DayLog, FoodEntry, ExerciseEntry types
├── calculations/
│   ├── bmr.ts                       # Pure Harris-Benedict TMB calculation
│   ├── netCalories.ts               # Pure net-calorie + zero-floor/excess + overage logic
│   └── __tests__/
│       ├── bmr.test.ts
│       └── netCalories.test.ts
└── storage/
    ├── keys.ts                      # "profile" / "day:YYYY-MM-DD" key builders
    ├── profileStorage.ts            # AsyncStorage read/write for the profile
    └── dayStorage.ts                 # AsyncStorage read/write for a day's entries
```

**Structure Decision**: Single Expo Router mobile app at the repository root — there is no
backend, API, or second deployable, so the "web application" and "mobile + API" template
options do not apply. `app/` holds only routes (per Expo Router convention); all
presentational pieces live in `components/`; all non-UI logic (pure calculations and
`AsyncStorage` access) lives in `lib/`, keeping calculation code independently testable
and out of UI components per Constitution Principle IV.

## Complexity Tracking

*No Constitution Check violations were identified — this section is intentionally empty.*
