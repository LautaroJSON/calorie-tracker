# Phase 1 Data Model: Entry Row — Title, Expand, Swipe

One optional field is added to an existing persisted entity; everything else is in-memory
component shape. Base entities are from feature 001, extended by feature 003 (`createdAt`) and
feature 004 (`DayLog.waterMl`).

## Persisted entities

### FoodEntry / ExerciseEntry — inside `day:YYYY-MM-DD` → `DayLog.foodEntries[]` / `exerciseEntries[]`

| Field | Type | Validation | Change in this feature |
|---|---|---|---|
| `id` | `string` | non-empty, unique within the day | none |
| `calories` | `number` | `> 0` | none |
| `title` | `string \| undefined` | trimmed; omitted/absent when empty | **NEW.** Short label for the entry, shown on the row. Optional. Absent on entries stored before this feature. |
| `note` | `string \| undefined` | trimmed; omitted when empty | none |
| `createdAt` | `string` (ISO-8601 UTC) | valid ISO timestamp | none |

`DayLog` (`{ date, foodEntries[], exerciseEntries[], waterMl }`) is otherwise unchanged.

**Backward compatibility**: `loadDayLog` parses stored JSON as-is; entries written before this
feature simply have no `title` key. Every read site uses `entry.title ?? ""` (row display) or
passes `undefined` through (edit form). No migration, no `updatedAt`-style touch.

## In-memory shapes (not persisted)

### `EntryInput` (`lib/storage/dayStorage.ts`)

| Field | Type | Notes |
|---|---|---|
| `calories` | `number` | unchanged |
| `title` | `string \| undefined` | **NEW.** `addEntry` sets `title: input.title` on the new entry; `updateEntry` sets `title: input.title` on the matched entry (always written, so clearing a title works — mirrors `note`). |
| `note` | `string \| undefined` | unchanged |
| `createdAt` | `string \| undefined` | unchanged |

### `EntryFormValues` (`components/EntryForm.tsx`)

| Field | Type | Notes |
|---|---|---|
| `calories` | `number` | unchanged |
| `title` | `string \| undefined` | **NEW.** `title.trim() || undefined` on submit — same treatment as `note`. |
| `note` | `string \| undefined` | unchanged |
| `createdAt` | `string` | unchanged |

`EntryForm` props `initialValues` gains `title?: string` (pre-fills the input on edit).

### `EntryListItem` (`components/EntryList.tsx`)

Gains `title?: string`. The list already builds items via `{ type, ...entry }`, so `title`
flows in automatically once the type includes it.

### `EntryRow` props (`components/EntryRow.tsx`)

| Prop | Type | Change |
|---|---|---|
| `type` | `EntryType` | unchanged |
| `calories` | `number` | unchanged |
| `title` | `string \| undefined` | **NEW** — shown in the summary line; falls back to `"Food"` / `"Exercise"` when empty |
| `note` | `string \| undefined` | unchanged — now shown **only in the expanded block**, in `colors.textSecondary` |
| `createdAt` | `string` | unchanged — formatted via `formatClockTime` (summary + expanded) and `formatLongDate` (expanded date) |
| `onEdit` | `() => void \| undefined` | unchanged signature — **now invoked by a left swipe**, not an icon |
| `onDelete` | `() => void \| undefined` | unchanged signature — **now invoked by a right swipe**, still runs `confirmDestructive` in the parent |

Removed: the `actions` view and the `Pencil` / `Trash2` icon `Pressable`s.
Added: `const [expanded, setExpanded] = useState(false)` — local, not persisted (FR-013).

### `SwipeableRow` props (`components/SwipeableRow.tsx`, NEW)

| Prop | Type | Notes |
|---|---|---|
| `children` | `ReactNode` | the `<EntryRow>` to wrap |
| `onSwipeLeft` | `() => void` | called once when a left drag passes the threshold and is released (→ edit) |
| `onSwipeRight` | `() => void` | called once when a right drag passes the threshold and is released (→ delete; parent shows the confirm dialog) |

Internal (reanimated): `translateX = useSharedValue(0)`; `Gesture.Pan()` updates it, clamped;
on end, if `|translateX| > THRESHOLD` fire the matching callback via `runOnJS`, then
`translateX.value = withSpring(0)`. Right-drag background opacity/scale =
`interpolate(translateX, [0, THRESHOLD], [0, 1], CLAMP)`.

## Pure helpers (`lib/datetime.ts`)

| Name | Signature | Rule |
|---|---|---|
| `formatClockTime` | `(iso: string) => string` | `clockFieldsFromIso(iso)` → `` `${hour12}:${pad2(minute)} ${meridiem}` `` — e.g. `"7:05 AM"`, `"12:30 PM"`. |
| `localDateOf` *(new, small)* | `(iso: string) => string` | ISO timestamp → `"YYYY-MM-DD"` from **local** `Date` parts, so the expanded date matches the local wall-clock day the time is shown in. Feeds `formatLongDate`. |

Both reuse existing module internals (`clockFieldsFromIso`, `pad2`) and stay pure /
unit-tested in `lib/__tests__/datetime.test.ts`.

## Validation rules

| Rule | Where | Behavior |
|---|---|---|
| `calories > 0` | `EntryForm.handleSubmit` | unchanged — blocks submit |
| Title optional | `EntryForm` | no validation; empty → stored as absent (FR-002/FR-003) |
| Swipe activation threshold | `SwipeableRow` | drag distance must exceed a fixed threshold (≈ 33% of row width or a fixed px) for the action to fire; otherwise spring back (FR-017) |
| Gesture axis | `SwipeableRow` `Gesture.Pan().activeOffsetX([-20,20]).failOffsetY([-12,12])` | only clearly-horizontal drags move the row; vertical drags fall through to the list scroll (FR-018) |

## State transitions

- **`title`**: set on add; overwritten on edit (including cleared → absent); gone when the
  entry is deleted. No lifecycle of its own.
- **`EntryRow.expanded`**: `false` on mount → toggles on row tap → resets to `false` whenever
  the list re-mounts / screen is re-focused (FR-013). Independent per row (multiple may be
  expanded — Assumptions).
- **`SwipeableRow.translateX`**: `0` at rest → tracks the finger during a pan → on release
  either fires a callback and returns to `0`, or springs back to `0`. Never rests non-zero
  (FR-019 falls out of this).
