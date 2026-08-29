# Contract: Components, storage, and screen wiring

## Storage — `lib/storage/dayStorage.ts`

### `setDayWaterMl(date, waterMl)`

```ts
export async function setDayWaterMl(date: string, waterMl: number): Promise<DayLog>;
```

- Loads the day via `loadDayLog(date)` (which now normalizes `waterMl` to `0` for legacy JSON).
- Writes `{ ...log, waterMl: Math.max(0, Math.round(waterMl)) }` via `saveDayLog`.
- Returns the updated `DayLog` (callers do `setDayWaterMl(d, n).then(setDayLog)`).
- Keyed only by `date` → works identically for today and any past day (FR-019, FR-020).

### `emptyDayLog` / `loadDayLog` changes

- `emptyDayLog(date)` returns `{ date, foodEntries: [], exerciseEntries: [], waterMl: 0 }`.
- `loadDayLog` parses as `{ waterMl: 0, ...JSON.parse(raw) } as DayLog`.

## Storage — `lib/storage/profileStorage.ts`

`loadProfile` default merge becomes:

```ts
return {
  activityLevel: "sedentary",
  goal: "maintain",
  waterTrackingEnabled: false,
  waterGoalMl: 2000,
  ...JSON.parse(raw),
} as UserProfile;
```

`saveProfile` is unchanged (it already persists the whole object).

## `components/WaterCounter.tsx`

```ts
interface WaterCounterProps {
  waterMl: number;
  goalMl: number;
  onChange: (nextMl: number) => void;
}
export function WaterCounter(props: WaterCounterProps): JSX.Element;
```

Renders (matching the sketch), inside a `Card`:

- A **vertical bar**: a fixed-height track (`colors.background`) with a bottom-anchored fill
  `View` (`colors.primary`) whose height is `` `${waterFillRatio(waterMl, goalMl) * 100}%` ``.
- To the bar's lower-right, a column with an **up** `Pressable` (`CircleArrowUp`) above a
  **down** `Pressable` (`CircleArrowDown`), each applying `claySquish` on press.
  - up → `onChange(nextWaterMl(waterMl, WATER_STEP_ML))`
  - down → `onChange(nextWaterMl(waterMl, -WATER_STEP_ML))`
  - `accessibilityLabel`: `"Add 50 ml water"` / `"Remove 50 ml water"`.
- Beneath the bar: a **label** `` `${waterMl} / ${goalMl}` `` (`typography.caption`).
- Beneath the label: a **`GlassWater`** icon (`colors.textSecondary`).

Styling: `StyleSheet.create` + `lib/theme` tokens only. No animation.

## `components/DayOverview.tsx`

```ts
interface DayOverviewProps {
  netCalories: number;
  dailyGoal: number;
  isOverGoal: boolean;
  overageAmount: number;
  uncompensatedExcess: number;
  water?: {
    waterMl: number;
    goalMl: number;
    onChange: (nextMl: number) => void;
  } | null;
}
export function DayOverview(props: DayOverviewProps): JSX.Element;
```

- Forwards the five calorie props to `<CalorieRing>` unchanged.
- `water == null` → returns `<CalorieRing {...} />` **only** (no extra `View`), so a
  tracking-off screen is byte-identical to pre-feature (FR-016).
- `water != null` → returns
  `<View style={styles.row}><CalorieRing {...}/><WaterCounter {...water}/></View>`
  with the water counter to the **right** of the ring (FR-009), `alignItems: "center"`,
  `gap: spacing.md`. The row must not cause horizontal page scroll on a ~360 px screen.

## Screen wiring

### `app/(tabs)/index.tsx`

- Replace `<CalorieRing … />` with `<DayOverview … water={…} />`:

  ```tsx
  water={
    profile.waterTrackingEnabled
      ? { waterMl: dayLog.waterMl, goalMl: profile.waterGoalMl, onChange: handleWaterChange }
      : null
  }
  ```

- Add `handleWaterChange(nextMl: number)` → `setDayWaterMl(today, nextMl).then(setDayLog)`.

### `app/(tabs)/calendar.tsx`

- Same `<DayOverview>` swap, using `totals.*` for the calorie props and the same `water`
  expression with `dayLog.waterMl` / `profile.waterGoalMl`.
- `handleWaterChange(nextMl)` → `setDayWaterMl(selectedDate, nextMl).then(() => reload())`, so
  the shown bar updates immediately for the selected day.

### `components/ProfileForm.tsx`

- `ProfileFormValues` gains `waterTrackingEnabled: boolean` and `waterGoalMl: number`.
- New state: `waterTrackingEnabled` (from `initialValues?.waterTrackingEnabled ?? false`),
  `waterGoalMlText` (`string`, from `String(initialValues?.waterGoalMl ?? 2000)`).
- New field block after "Weight Goal":
  - a `labelRow` with `Text` "Water counter" and a core `Switch`
    (`value={waterTrackingEnabled}`, `onValueChange={setWaterTrackingEnabled}`,
    `trackColor={{ true: colors.primary, false: colors.border }}`).
  - when `waterTrackingEnabled`: a "Daily goal (ml)" label + `FormTextInput`
    (`keyboardType="numeric"`, `value={waterGoalMlText}`, `placeholder="2000"`).
- `handleSubmit`: if `waterTrackingEnabled` and
  `!(Number.isInteger(Number(waterGoalMlText)) && Number(waterGoalMlText) > 0)` →
  `setError("Enter a water goal greater than 0.")` and return.
- Always include `waterTrackingEnabled` and `waterGoalMl: Number(waterGoalMlText)` in the
  `onSubmit` payload (retains the last goal when toggled off — FR-017).

### `app/onboarding.tsx` / `app/settings.tsx`

No change — both already spread `values` into `saveProfile`, and `values` now carries the two
new fields.

## Regression guarantees

- `computeNetCalories`, `computeGoalStatus`, `calculateDailyCalorieGoal`, `calculateBmr` — not
  touched; their tests pass unmodified.
- History screen (`app/(tabs)/history.tsx`, `loadAllDayLogs`, `NetCaloriesChart`) — not
  touched.
- With `waterTrackingEnabled === false`: `DayOverview` renders exactly `<CalorieRing>`, so
  Today and Calendar are visually unchanged (FR-016, SC-005).
