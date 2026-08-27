# Phase 0 Research: Day Context Header and Optional Time on Entry Form

The spec carried no `[NEEDS CLARIFICATION]` markers into planning (the two from `/speckit-specify`
were resolved: scope = all entry-form uses, month name = English). The items below record the
technical decisions made while writing this plan.

## 1. Time input control (12-hour clock, no native date/time picker)

> This decision was revised twice during implementation at the stakeholder's request:
> 24-hour `HH:MM` text field → 12-hour digit-filtered text field + AM/PM toggle →
> **hour dropdown + minute dropdown + AM/PM toggle** (current).

- **Decision**: A row after "Note (optional)" containing three controls: an **hour dropdown**
  (options `1`–`12`), a **minute dropdown** (options `00`–`59`), and an **AM / PM toggle**.
  All three pre-selected to the current local time when the form opens. The dropdowns are a new
  reusable `components/Select.tsx` — a `Pressable` trigger that opens a scrollable option list
  in React Native's built-in `Modal`, the same pattern as the existing `components/InfoDialog.tsx`.
  The AM/PM toggle stays as the app's two-pill selector.
- **Rationale**: The stakeholder asked for hour and minute to be selects with fixed option
  lists (1–12, 00–59). Dropdowns make an out-of-range or malformed time impossible, removing
  all the parsing/validation/fallback logic the text-field versions needed. Constitution II
  forbids native modules, and Expo Go has no native `<select>` — so `Select` is built from
  `Modal` + `ScrollView`, adding **no dependency** (the one new import, `ChevronDown`, comes
  from `lucide-react-native`, already a project dependency). Reusing the `InfoDialog` Modal
  pattern keeps it consistent with existing code (Constitution IV).
- **Alternatives considered**:
  - 24-hour `HH:MM` text field (original plan) and 12-hour digit-filtered text field
    (first revision) — both superseded by the stakeholder's "hour and minute must be selects"
    request.
  - `@react-native-picker/picker` / native wheel picker — rejected, native module, not
    guaranteed in Expo Go and against Constitution II.
  - AM/PM as a third dropdown — rejected; a two-value choice is better as the existing one-tap
    pill toggle, and the stakeholder scoped the "select" request to hour and minute only.

## 2. Time helpers in `lib/datetime.ts`

- **Decision**: With dropdowns there is nothing to parse or sanitize. The module keeps only:
  - `HOUR_OPTIONS` (`["1"…"12"]`) and `MINUTE_OPTIONS` (`["00"…"59"]`) — the dropdown option
    lists, as pure data so they're covered by a trivial test.
  - `to24Hour(hour12, minute, meridiem)` — maps the selected 12-hour value + AM/PM to 24-hour
    `{ hours, minutes }` for `combineDateAndTime` (12 AM → 0, 12 PM → 12).
  - `clockFieldsFromDate(date)` / `clockFieldsFromIso(iso)` → `{ hour12, minute, meridiem }` —
    the reverse, for the default ("now") and for pre-filling all three controls on edit.
  - `combineDateAndTime` and `formatLongDate` — unchanged.
  On submit the form does `to24Hour(Number(hour), Number(minute), meridiem)` →
  `combineDateAndTime(targetDate, …)`. No fallback branch — the controls always hold a valid
  value.
- **Rationale**: All helpers stay pure and unit-tested in `lib/__tests__/datetime.test.ts`.
  Removing `sanitizeClockInput` / `parseClockInput` shrinks the surface area and deletes the
  only code path that could ever have produced a wrong time.
- **Alternatives considered**: Keeping a defensive `parse`/fallback anyway — rejected as dead
  code; the dropdown options are the validation.

## 3. English month name without relying on `Intl`

- **Decision**: `formatLongDate(dateStr: "YYYY-MM-DD"): string` in `lib/datetime.ts` builds the
  string from a hardcoded 12-element English month-name array — `` `${dd} - ${MONTHS[m]} - ${yyyy}` ``
  with `dd` zero-padded to 2 digits and `yyyy` the 4-digit year.
- **Rationale**: Hermes ships a partial `Intl` and `toLocaleDateString` option support has
  historically varied by platform/version; a hardcoded array is fully deterministic, matches
  FR-002's exact `DD - MMMM - AAAA` pattern, needs no locale argument, and is testable without
  mocking the environment. English-only is the confirmed requirement (FR-012), so there is no
  localization need that would justify `Intl`.
- **Alternatives considered**:
  - `new Date(dateStr).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })`
    — rejected: produces `March 05, 2026`, not the required ` - `-separated order, and depends
    on `Intl` data being present; would still need reformatting.
  - Adding `date-fns` / `dayjs` — rejected, a new dependency for one format string
    (Constitution IV).
- **Parsing note**: the date string is split on `-` rather than passed to `new Date(...)` to
  avoid any UTC-vs-local off-by-one-day interpretation of `"YYYY-MM-DD"`.

## 4. Composing the entry timestamp (timezone)

- **Decision**: `combineDateAndTime(dateStr: "YYYY-MM-DD", hours: number, minutes: number): string`
  constructs a **local** `Date` via `new Date(y, mIndex, d, hours, minutes, 0, 0)` and returns
  `.toISOString()`. The reverse, `clockFieldsFromIso(iso: string)`, reads
  `date.getHours()` / `getMinutes()` (local) and returns the 12-hour `{ clock, meridiem }`.
- **Rationale**: Entries are conceptually "at a wall-clock time on a calendar day". Building the
  `Date` from local components and storing the resulting UTC ISO keeps storage consistent with
  feature 001 (which already stored `new Date().toISOString()`), and `EntryRow`'s existing
  `toLocaleTimeString` display already renders stored ISO back in local time — so the round-trip
  matches what the user sees in the list.
- **Alternatives considered**: Storing a naive local `"YYYY-MM-DDTHH:MM"` string — rejected,
  would diverge from feature 001's stored format and break the existing `createdAt.localeCompare`
  ordering assumptions for pre-feature entries.

## 5. Entry ordering (FR-010) — already satisfied

- **Decision**: No code change. `components/EntryList.tsx` already builds its combined
  food+exercise list with `.sort((a, b) => a.createdAt.localeCompare(b.createdAt))`. Because
  `createdAt` is an ISO-8601 UTC string, lexicographic order equals chronological order.
- **Rationale**: Once `createdAt` reflects the user's chosen (or defaulted) time, the existing
  sort places entries correctly with no further work. A regression test in
  `datetime.test.ts` / a manual quickstart step guards this.
- **Alternatives considered**: Adding an explicit ordering step in `dayStorage.ts` on write —
  rejected as redundant; ordering is a display concern already handled at render time.

## 6. Where the day-context header lives

- **Decision**: In `app/entry-form.tsx`, not `components/EntryForm.tsx`. The screen already
  owns the `<Text style={typography.title}>` and already has the `date` route param. It wraps
  the title + a new `<Text>` (formatted via `formatLongDate`) in a `View` with
  `flexDirection: "row"`, `justifyContent: "space-between"`, `alignItems: "baseline"`.
  `EntryForm.tsx` only receives the raw `targetDate` string (for timestamp composition), not
  formatting responsibility.
- **Rationale**: Keeps `EntryForm` focused on inputs; the header is screen chrome. Matches the
  current separation where the screen renders the title and `EntryForm` renders the card.
- **Alternatives considered**: Moving the title into `EntryForm` — rejected, unnecessary
  refactor of working code.

## Outstanding NEEDS CLARIFICATION

None.
