# Phase 1 Data Model: Day Context Header and Optional Time on Entry Form

This feature introduces **no new persisted entity and no stored-shape change**. The entities
below are from feature 001
([../001-daily-calorie-tracker/data-model.md](../001-daily-calorie-tracker/data-model.md)); only
the *provenance* of one existing field changes, plus two in-memory (non-persisted) shapes.

## Persisted entities (unchanged on disk)

### FoodEntry / ExerciseEntry

| Field | Type | Validation | Change in this feature |
|---|---|---|---|
| `id` | `string` | non-empty, unique within the day | none |
| `calories` | `number` | `> 0` | none |
| `note` | `string \| undefined` | trimmed; omitted when empty | none |
| `createdAt` | `string` (ISO-8601 UTC) | valid ISO timestamp | **Value source changes.** Was always `new Date().toISOString()` at add time and never touched on edit. Now: composed by the form from the **target day's date** + the **time field** (entered or defaulted to "now"), and **may be updated on edit** when the user changes the time. Still a plain ISO-8601 UTC string — byte-compatible with existing stored entries. |

`DayLog` (`{ date, foodEntries[], exerciseEntries[] }`) is entirely unchanged.

### Ordering rule (FR-010)

Within a day, the combined food + exercise list is displayed in **ascending `createdAt`**
order. This is already implemented in `components/EntryList.tsx` via
`.sort((a, b) => a.createdAt.localeCompare(b.createdAt))` and requires no change — ISO-8601 UTC
strings sort chronologically under lexicographic comparison.

## In-memory shapes (not persisted)

### `EntryInput` (`lib/storage/dayStorage.ts`)

| Field | Type | Notes |
|---|---|---|
| `calories` | `number` | unchanged |
| `note` | `string \| undefined` | unchanged |
| `createdAt` | `string \| undefined` | **New optional field.** When present, `addEntry` uses it verbatim as the new entry's `createdAt`, and `updateEntry` overwrites the existing entry's `createdAt` with it. When absent, `addEntry` falls back to `new Date().toISOString()` (feature-001 behavior) and `updateEntry` leaves `createdAt` unchanged. |

### `EntryFormValues` (`components/EntryForm.tsx`)

| Field | Type | Notes |
|---|---|---|
| `calories` | `number` | unchanged |
| `note` | `string \| undefined` | unchanged |
| `createdAt` | `string` | **New.** Always populated by the form on submit: `combineDateAndTime(targetDate, hours, minutes)` where `{hours, minutes}` = `to24Hour(Number(hour), Number(minute), meridiem)` — `hour` / `minute` / `meridiem` come from the three time controls (dropdowns + AM/PM toggle), always valid. Flows straight into `EntryInput.createdAt`. |

### `EntryForm` props

| Prop | Type | Notes |
|---|---|---|
| `targetDate` | `string` (`"YYYY-MM-DD"`) | **New required prop.** The day the entry belongs to, used to compose `createdAt`. Supplied by `app/entry-form.tsx` from its existing `date` route param. |
| `initialValues.createdAt` | `string \| undefined` | **New.** On edit, the entry's stored `createdAt`; used to pre-select the hour / minute / AM-PM controls via `clockFieldsFromIso`. On add, undefined → controls pre-select from `clockFieldsFromDate(new Date())`. |

## Validation rules

| Rule | Where enforced | Behavior |
|---|---|---|
| `calories > 0` | `EntryForm.handleSubmit` | unchanged — blocks submit with existing error message |
| Time control is optional | `EntryForm` | The three time controls are pre-set to "now"; the user may ignore them. They have no invalid state and never block submit (FR-006, FR-008) |
| Time range | `HOUR_OPTIONS` / `MINUTE_OPTIONS` (dropdown options) | Hour limited to `1–12`, minute to `00–59` by the option lists themselves. Meridiem comes from the AM/PM toggle; `to24Hour` maps to 24-hour for storage |
| Target date format | caller contract | `app/entry-form.tsx` always passes a valid `"YYYY-MM-DD"` (route param originating from `todayIsoDate()` or the calendar); `formatLongDate` / `combineDateAndTime` assume this shape |

## State transitions

`createdAt` has no lifecycle of its own beyond the entry it belongs to: set when the entry is
added, optionally revised when the entry is edited, gone when the entry is deleted. No new
states.
