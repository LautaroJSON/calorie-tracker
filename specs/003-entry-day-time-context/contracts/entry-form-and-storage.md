# Contract: Entry form ↔ storage interface changes

This app has no network API; the interface here is the prop contract of the shared entry form
and the input contract of the storage functions it drives.

## `components/EntryForm.tsx`

### Props (changed)

```ts
interface EntryFormProps {
  targetDate: string;                 // NEW, required — "YYYY-MM-DD" the entry belongs to
  initialValues?: {
    calories: number;
    note?: string;
    createdAt?: string;               // NEW — optional; present only when editing
  };
  submitLabel: string;
  onSubmit: (values: EntryFormValues) => void;
}

interface EntryFormValues {
  calories: number;
  note?: string;
  createdAt: string;                  // NEW — always set by the form on submit (ISO-8601)
}
```

### Behavior

- **Time control** (label `Time (optional)`): a `flexWrap` row after the "Note (optional)"
  field holding
  - an **hour** `<Select value={hour} options={HOUR_OPTIONS} onChange={setHour} accessibilityLabel="Hour" />`;
  - a `:` separator `<Text>`;
  - a **minute** `<Select value={minute} options={MINUTE_OPTIONS} onChange={setMinute} accessibilityLabel="Minutes" />`;
  - an **AM / PM** toggle — two `Pressable` pills reusing the app's selector-pill styling
    (`colors.primary` background when selected), `accessibilityState={{ selected }}`.
  - Initial state (all three): from `clockFieldsFromIso(initialValues.createdAt)` when editing,
    else `clockFieldsFromDate(new Date())`. `hour` state is `String(hour12)`, `minute` state is
    `String(minute).padStart(2, "0")`.
- **On submit** (after the existing `calories > 0` check passes):
  1. `const { hours, minutes } = to24Hour(Number(hour), Number(minute), meridiem)`.
  2. `const createdAt = combineDateAndTime(targetDate, hours, minutes)`.
  3. `onSubmit({ calories, note: note.trim() || undefined, createdAt })`.
- The time control has no invalid state and never blocks submit (FR-006, FR-008).

## `components/Select.tsx` (NEW)

A reusable single-select dropdown for Expo Go — no native picker.

```ts
interface SelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  accessibilityLabel: string;
}
```

- Renders a `Pressable` trigger (`value` text + `ChevronDown` from `lucide-react-native`,
  `accessibilityRole="button"`, `accessibilityState={{ expanded }}`).
- On press, opens React Native's built-in `Modal` (`transparent`, `animationType="fade"`,
  `onRequestClose`) with a centered, bounded-height (`maxHeight: "60%"`) sheet containing a
  `ScrollView` of option `Pressable`s; the selected option is highlighted (`colors.primary`).
- Tapping an option calls `onChange(option)` and closes; tapping the backdrop closes without
  changing. Same Modal/backdrop pattern as `components/InfoDialog.tsx`.
- Styling: `StyleSheet` only, existing theme tokens; the trigger looks like an input
  (`colors.background`, `radius.md`).
- `targetDate` is used **only** for timestamp composition — `EntryForm` does not format or
  display it (the screen owns the header).

## `app/entry-form.tsx`

### Header (changed)

The single `<Text style={typography.title}>` becomes a row:

```tsx
<View style={styles.header}>            {/* row, justifyContent: "space-between", alignItems: "baseline" */}
  <Text style={typography.title}>{isEdit ? `Edit ${typeLabel}` : `Add ${typeLabel}`}</Text>
  <Text style={styles.headerDate}>{formatLongDate(date)}</Text>
</View>
```

- `styles.headerDate`: derived from `typography.caption` / `typography.label` tokens; must
  `flexShrink: 1` / wrap so a long month name never pushes the title off-screen (spec edge
  case), consistent with `DD - MMMM - AAAA`.
- `date` is the existing route param (from `todayIsoDate()` on Today, or the selected day on
  Calendar). No new param needed for the header.

### Wiring (changed)

- Pass `targetDate={date}` to `<EntryForm>`.
- On edit, extend `initialValues` with `createdAt: raw.createdAt` (new route param, see below).
- `handleSubmit(values)` already forwards `values` to `addEntry(date, type, values)` /
  `updateEntry(date, type, entryId, values)` — since `values` now carries `createdAt`, it flows
  through unchanged.

## `app/(tabs)/index.tsx` and `app/(tabs)/calendar.tsx`

`openEntryForm(type, item?)` — when `item` is present (edit), add `createdAt` to the pushed
params:

```ts
...(item
  ? { entryId: item.id, calories: String(item.calories), note: item.note ?? "",
      createdAt: item.createdAt }               // NEW
  : {}),
```

`EntryListItem` already exposes `createdAt`. No other change to these screens.

## `lib/storage/dayStorage.ts`

### `EntryInput` (changed)

```ts
export interface EntryInput {
  calories: number;
  note?: string;
  createdAt?: string;      // NEW, optional
}
```

### `addEntry(date, type, input)` (changed)

```ts
createdAt: input.createdAt ?? new Date().toISOString(),
```

Everything else (id generation, array append, `saveDayLog`) unchanged.

### `updateEntry(date, type, id, input)` (changed)

The per-entry mapper now also updates `createdAt` **when provided**:

```ts
entry.id === id
  ? { ...entry, calories: input.calories, note: input.note,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}) }
  : entry
```

When `input.createdAt` is absent, the existing entry keeps its stored `createdAt` (backward
compatible with any caller that doesn't supply it).

### `deleteEntry` — unchanged.

## Non-changes (explicit)

- `lib/types.ts` — `FoodEntry` / `ExerciseEntry` already declare `createdAt: string`; no edit.
- `components/EntryList.tsx` — existing `createdAt.localeCompare` sort already satisfies FR-010.
- `components/EntryRow.tsx` — already renders `createdAt` via `toLocaleTimeString`; the chosen
  time now shows there automatically.
- `"day:YYYY-MM-DD"` `AsyncStorage` schema — no shape change (see
  [../../001-daily-calorie-tracker/contracts/storage-schema.md](../../001-daily-calorie-tracker/contracts/storage-schema.md)).
