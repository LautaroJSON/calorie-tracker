# Contract: `lib/datetime.ts` pure helpers

Following the project convention (feature 001/002), all formatting and conversion logic for this
feature lives in pure functions isolated from UI, unit-tested in
`lib/__tests__/datetime.test.ts`. No `AsyncStorage`, no component imports.

> **Revision history (during implementation)**: 24-hour `HH:MM` field → 12-hour digit-filtered
> field + AM/PM toggle → **hour dropdown + minute dropdown + AM/PM toggle** (current). The
> current API has no parse/sanitize functions — the dropdown option lists are the validation.

## `formatLongDate(dateStr: string): string`

Formats a `"YYYY-MM-DD"` calendar date as `DD - MMMM - AAAA` with an English month name
(e.g. "05 - March - 2026").

- Split `dateStr` on `-` into `[yyyy, mm, dd]` (do **not** use `new Date(dateStr)` — avoids
  UTC/local day shifts).
- Month name from a hardcoded English array; day zero-padded to 2 digits; 4-digit year.

| Input | Output |
|---|---|
| `"2026-03-05"` | `"05 - March - 2026"` |
| `"2026-08-27"` | `"27 - August - 2026"` |
| `"2026-01-09"` | `"09 - January - 2026"` |

## `HOUR_OPTIONS: string[]` / `MINUTE_OPTIONS: string[]`

The option lists for the two time dropdowns.

- `HOUR_OPTIONS` — `["1", "2", …, "12"]` (length 12, not zero-padded).
- `MINUTE_OPTIONS` — `["00", "01", …, "59"]` (length 60, zero-padded to 2 digits).

## `to24Hour(hour12: number, minute: number, meridiem: "AM" | "PM"): { hours: number; minutes: number }`

Maps a selected 12-hour value + meridiem to a 24-hour time for `combineDateAndTime`.

- `base = hour12 % 12` (so `12` → `0`); `hours = meridiem === "PM" ? base + 12 : base`.

| Input | Output |
|---|---|
| `12, 0, "AM"` | `{ hours: 0, minutes: 0 }` (midnight) |
| `7, 15, "AM"` | `{ hours: 7, minutes: 15 }` |
| `11, 59, "AM"` | `{ hours: 11, minutes: 59 }` |
| `12, 30, "PM"` | `{ hours: 12, minutes: 30 }` (noon) |
| `1, 0, "PM"` | `{ hours: 13, minutes: 0 }` |
| `11, 45, "PM"` | `{ hours: 23, minutes: 45 }` |

## `clockFieldsFromDate(date: Date): ClockFields` / `clockFieldsFromIso(iso: string): ClockFields`

```ts
interface ClockFields { hour12: number; minute: number; meridiem: "AM" | "PM" }
```

Splits a **local** `Date` (or an ISO string via `new Date(iso)`) into the three control values —
used for the default ("now", `clockFieldsFromDate(new Date())`) and for pre-filling on edit
(`clockFieldsFromIso(entry.createdAt)`).

- `hour12 = ((date.getHours() + 11) % 12) + 1` (0 → 12, 13 → 1).
- `minute = date.getMinutes()`.
- `meridiem = date.getHours() < 12 ? "AM" : "PM"`.

| Input (local) | Output |
|---|---|
| `2026-08-27 00:05` | `{ hour12: 12, minute: 5, meridiem: "AM" }` |
| `2026-08-27 13:00` | `{ hour12: 1, minute: 0, meridiem: "PM" }` |
| `2026-08-27 12:30` | `{ hour12: 12, minute: 30, meridiem: "PM" }` |

## `combineDateAndTime(dateStr: string, hours: number, minutes: number): string`

Composes a stored `createdAt` from a "YYYY-MM-DD" day and a **24-hour** time.

- Parse `dateStr` → `[y, m, d]`; `new Date(y, m - 1, d, hours, minutes, 0, 0)`; return
  `.toISOString()`.
- Round-trip property: for any `(hour12, minute, meridiem)`,
  `clockFieldsFromIso(combineDateAndTime(dateStr, ...to24Hour(hour12, minute, meridiem)))`
  deep-equals `{ hour12, minute, meridiem }`.

## Submit-time composition (in `EntryForm.handleSubmit`)

```
{ hours, minutes } = to24Hour(Number(hourState), Number(minuteState), meridiemState)
createdAt = combineDateAndTime(targetDate, hours, minutes)
```

No fallback / validation branch — `hourState` / `minuteState` come from the dropdowns and are
always in range.

## Required unit test coverage (`lib/__tests__/datetime.test.ts`)

- `formatLongDate`: table rows above + leading-zero day + all 12 month names.
- `HOUR_OPTIONS` / `MINUTE_OPTIONS`: lengths (12 / 60), first/last values, zero-padding of
  minutes.
- `to24Hour`: both AM edge cases (12 AM → 0, 11 AM → 11) and PM (12 PM → 12, 1 PM → 13,
  11 PM → 23).
- `clockFieldsFromDate` / `clockFieldsFromIso`: the fixture rows + the round-trip property
  through `to24Hour` + `combineDateAndTime`.
- `combineDateAndTime`: output parses as a valid ISO string.
- Ordering guard (FR-010): three `combineDateAndTime` outputs for the same day at `07:00`,
  `12:30`, `19:45`, scrambled, sorted by `localeCompare`, assert ascending.
