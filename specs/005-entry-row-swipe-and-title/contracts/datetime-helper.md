# Contract: `lib/datetime.ts` additions

Pure module. No React, no storage. Unit-tested in `lib/__tests__/datetime.test.ts`.

## New exports

```ts
export function formatClockTime(iso: string): string;
export function localDateOf(iso: string): string;
```

### `formatClockTime(iso)`

12-hour clock with an AM/PM suffix, from an ISO timestamp, in **local** time.

- Implementation: `const { hour12, minute, meridiem } = clockFieldsFromIso(iso);`
  → `` `${hour12}:${String(minute).padStart(2, "0")} ${meridiem}` ``.

| `iso` (local time it represents) | result |
|---|---|
| 07:05 | `"7:05 AM"` |
| 00:00 (midnight) | `"12:00 AM"` |
| 12:30 (noon-thirty) | `"12:30 PM"` |
| 13:09 | `"1:09 PM"` |
| 23:59 | `"11:59 PM"` |

Reuses the existing `clockFieldsFromIso` (already handles the 0→12 and 13→1 mapping and the
AM/PM boundary), so the cases above are really re-asserting that mapping plus the
`H:MM AP` shape (single-digit hour, zero-padded minute).

### `localDateOf(iso)`

ISO timestamp → `"YYYY-MM-DD"` built from **local** `Date` parts (not a slice of the UTC
string), so it names the same calendar day the local wall-clock time falls on.

- Implementation: `const d = new Date(iso);`
  → `` `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` `` with `p` = 2-digit pad.
- Feeds `formatLongDate(localDateOf(iso))` in the expanded row.

| scenario | result |
|---|---|
| a timestamp at 23:30 local on 2026-03-05 | `"2026-03-05"` (even if its UTC date is the 6th) |
| a timestamp at 00:30 local on 2026-03-05 | `"2026-03-05"` |

## Guarantees

- Both are total for any valid ISO string and referentially transparent.
- No `Intl` usage (module convention — see feature 003 research).
- `formatClockTime` output is stable regardless of device locale (unlike
  `Date.prototype.toLocaleTimeString`, which `EntryRow` used before and which this replaces).
