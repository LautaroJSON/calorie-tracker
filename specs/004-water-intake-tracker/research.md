# Phase 0 Research: Optional Daily Water Intake Tracker

The spec carried **no `[NEEDS CLARIFICATION]` markers** into planning — the six open points were
resolved in the 2026-08-29 `/speckit-clarify` session (see spec.md § Clarifications). The items
below record the technical decisions made while writing this plan.

## 1. The on/off control — React Native `Switch`

- **Decision**: Use the built-in `Switch` from `react-native` for the "Water counter" toggle in
  `components/ProfileForm.tsx`, colored via its `trackColor` / `thumbColor` props with the
  existing theme tokens (`colors.primary`, `colors.background`, `colors.surface`).
- **Rationale**: `Switch` ships with React Native core — it works in Expo Go with no native
  linking (Constitution II) and adds no dependency. The spec explicitly asks for a "switch".
  It has no styling-library involvement (Constitution III); its two color props are component
  API, matching how the app already configures core components.
- **Alternatives considered**:
  - A custom two-pill toggle like the app's `OptionRow` — rejected: the stakeholder asked for a
    switch specifically, and an on/off boolean is the canonical `Switch` use case.
  - `expo-checkbox` — rejected: unnecessary dependency for a boolean the core `Switch` covers.

## 2. Icons — reuse `lucide-react-native`

- **Decision**: `CircleArrowUp` and `CircleArrowDown` for the increment/decrement controls;
  `GlassWater` for the icon beneath the label. All three imported from `lucide-react-native`.
- **Rationale**: The sketch shows **circled** up/down arrows and a water-glass icon. All three
  glyphs exist in the installed `lucide-react-native` version (`circle-arrow-up.mjs`,
  `circle-arrow-down.mjs`, `glass-water.mjs` confirmed in `node_modules`). The project already
  uses this library (`Plus` in the tab screens, `ChevronDown` in `Select`), so no dependency
  or bundle change.
- **Alternatives considered**:
  - `ChevronUp` / `ChevronDown` inside a hand-rolled circular `Pressable` — rejected: the
    circled-arrow glyph already matches the sketch; wrapping is redundant.
  - A single `+ / −` stepper — rejected: the sketch and FR-008 specify up/down arrows.

## 3. Where the water total is stored — `waterMl` on `DayLog`

- **Decision**: Add `waterMl: number` to the `DayLog` interface (required in the type). A new
  `emptyDayLog(date)` returns `waterMl: 0`; `loadDayLog` normalizes legacy JSON by spreading a
  `{ waterMl: 0 }` default before the parsed object, exactly as `loadProfile` already does for
  `activityLevel` / `goal`.
- **Rationale**: Water consumed is a per-calendar-day quantity that must be editable for any
  day (FR-007, FR-019), so it belongs on the same `day:YYYY-MM-DD` record as food/exercise
  entries — no new key (Constitution I), and the Calendar screen's existing
  `loadDayLog(selectedDate)` picks it up for free. A single integer, not a list of timestamped
  "water entries", per the clarified scope (one running total per day, adjusted by ±50 ml).
- **Alternatives considered**:
  - A separate `water:YYYY-MM-DD` key — rejected: a second key per day for one integer, and
    `loadAllDayLogs` / history would need a parallel read. The day record already exists.
  - Timestamped water entries mirroring `FoodEntry` — rejected: the stakeholder confirmed a
    single total per day; entries would add a list, an id generator, and a delete flow for no
    stated benefit (Constitution IV).

## 4. Increment / fill math — a pure module `lib/calculations/water.ts`

- **Decision**: Two pure functions plus two constants:
  - `WATER_STEP_ML = 50`, `DEFAULT_WATER_GOAL_ML = 2000`.
  - `nextWaterMl(currentMl: number, deltaMl: number): number` → `Math.max(0, currentMl + deltaMl)`
    — the floor-at-zero rule (FR-011), step-agnostic so the up and down arrows both call it
    (`+WATER_STEP_ML` / `-WATER_STEP_ML`).
  - `waterFillRatio(currentMl: number, goalMl: number): number` →
    `goalMl > 0 ? Math.min(1, currentMl / goalMl) : 0` — the 0–1 bar fill, capped at full when
    at/over goal (FR-012), divide-by-zero safe.
- **Rationale**: Matches the project's established "logic in tested pure functions, isolated
  from UI" convention (`lib/calculations/bmr.ts`, `netCalories.ts`, `calorieGoal.ts`). Keeps
  `WaterCounter` a thin presentational component. Both functions are trivially unit-tested for
  the spec's edge cases (down-arrow at 0, exactly-full, over-goal cap).
- **Alternatives considered**: Inlining `Math.max(0, …)` and the ratio in the component —
  rejected: the edge cases (FR-011/FR-012) deserve a named, tested home, and there are two call
  sites once Calendar is included.

## 5. The parent layout — a shared `components/DayOverview.tsx`

- **Decision**: A new component that renders a horizontal row containing the existing
  `<CalorieRing>` and, when a `water` prop is supplied, a `<WaterCounter>` to its right. When
  `water` is `null` / omitted it renders `<CalorieRing>` alone with no extra wrapper, so a
  water-tracking-off screen is identical to today (FR-016). `CalorieRing` itself is not
  modified.
- **Rationale**: FR-009 asks for "a parent component in `(tabs)/index.tsx` wrapping CalorieRing
  and the water counter". Making it a real component (not inline JSX) is what lets
  `app/(tabs)/calendar.tsx` render the identical grouping for a past day (FR-019) without
  duplication (Constitution IV). Both screens already compute the `CalorieRing` props; they
  gain only the `water` object.
- **Layout note**: `CalorieRing` is a `radius=90` ring inside a `Card` (~180 px + padding).
  `WaterCounter` is deliberately narrow (a ~16–20 px bar + a column of two ~28 px arrow
  buttons, ~72–90 px total). Side by side within the screen's `padding: spacing.lg` (24 px)
  container this fits a ~360 px phone; exact spacing/sizing is tuned during implementation and
  checked in the quickstart. No horizontal scroll is introduced.
- **Alternatives considered**:
  - Inline `<View style={{flexDirection:'row'}}>` in `index.tsx` only — rejected: Calendar
    needs the same thing, per the clarified scope.
  - Merging ring + bar into one `Card` (making `CalorieRing` not a `Card`) — rejected:
    ripples into feature 001/002 layout for no functional gain; two adjacent cards read fine
    with the claymorphism theme.

## 6. Profile fields and backward compatibility

- **Decision**: `UserProfile` gains `waterTrackingEnabled: boolean` and `waterGoalMl: number`
  (both required in the type). `loadProfile`'s existing defaults spread becomes
  `{ activityLevel: "sedentary", goal: "maintain", waterTrackingEnabled: false, waterGoalMl: 2000, ...JSON.parse(raw) }`.
  `ProfileFormValues` gains the same two fields; `handleSubmit` requires
  `Number.isInteger(waterGoalMl) && waterGoalMl > 0` **only when** the switch is on.
- **Rationale**: Identical mechanism to feature 002's `activityLevel` / `goal` defaults — a
  pre-feature profile loads as "water tracking off", no migration step, no `updatedAt` bump
  until the user next saves (FR-018). `waterGoalMl: 2000` in the default is harmless while
  disabled and gives the switch a sensible first value (FR-003).
- **Alternatives considered**: Making the fields optional (`?`) on `UserProfile` — rejected:
  the load-time default makes them always present in practice, and required typing avoids
  `?? 2000` scattered through the UI (matches how `activityLevel` is typed today).

## 7. Writing a day's water total — `setDayWaterMl`

- **Decision**: Add `setDayWaterMl(date: string, waterMl: number): Promise<DayLog>` to
  `lib/storage/dayStorage.ts`: load the day, write
  `{ ...log, waterMl: Math.max(0, Math.round(waterMl)) }`, save, return the updated log. The
  Today / Calendar `onChange` handlers compute the next value with `nextWaterMl(...)` and pass
  it in; `setDayWaterMl` clamps defensively.
- **Rationale**: Mirrors the existing `addEntry` / `updateEntry` / `deleteEntry` shape
  (load → transform → save → return updated `DayLog`), so the screens update state the same way
  (`setDayWaterMl(date, next).then(setDayLog)`). One function serves both the current day and
  any past day (FR-019/FR-020) because it is keyed only by `date`.
- **Alternatives considered**: An `adjustDayWater(date, delta)` that does the arithmetic in the
  storage layer — rejected: the floor-at-zero rule is display/domain logic that belongs in
  `lib/calculations/water.ts` where it is tested; storage should just persist a value.

## Outstanding NEEDS CLARIFICATION

None.
