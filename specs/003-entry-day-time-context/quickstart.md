# Quickstart: Day Context Header and Optional Time on Entry Form

Validation guide. See [data-model.md](./data-model.md) and [contracts/](./contracts/) for exact
shapes; this only documents how to run and check the result.

## Prerequisites

Same as feature 001 — `npm install`, `npx expo start`, open in Expo Go. No new setup, no new
dependency.

## Unit tests

```bash
npm test
```

Expected:

- `lib/__tests__/datetime.test.ts` passes — `formatLongDate`, `HOUR_OPTIONS` / `MINUTE_OPTIONS`,
  `to24Hour`, `clockFieldsFromDate` / `clockFieldsFromIso` round-trip, and the ascending-order
  guard (see [contracts/datetime-helpers.md](./contracts/datetime-helpers.md)).
- Feature 001 / 002 tests (`bmr`, `netCalories`, `calorieGoal`) still pass unmodified.

## Manual validation scenarios

### 1. Day-context header shows the selected day (User Story 1)

1. Open the **Calendar** tab, select a past day (e.g. the 5th of the current month).
2. Tap the **+** FAB → **Add Food**.
3. **Expect**: the form header shows `Add Food` on the left and the selected day formatted as
   `05 - <Month> - 2026` (English month name) on the right of the same row, at the title's
   height.
4. Enter `500` calories, submit.
5. **Expect**: the entry appears under that selected day, **not** under today. Switch to the
   **Today** tab and confirm it is not there (unless the selected day *was* today).

### 2. Header on Today and on edit (FR-003, FR-011)

1. **Today** tab → **+** → **Add Food**. **Expect**: header date = today, same format/position.
2. Add an entry, then tap its ✏️ edit button. **Expect**: header reads `Edit Food` with the
   same day's date shown; the same applies to **Add Exercise** / **Edit Exercise**.

### 3. Optional time defaults to now (User Story 2, SC-002/SC-003)

1. Open **Add Food**. **Expect**: a `Time (optional)` row with an hour dropdown, a `:`, a
   minute dropdown, and an AM/PM toggle — all pre-set to the current local time (e.g. `3` `:`
   `10` `PM` at 15:10).
2. Open the hour dropdown. **Expect**: options `1`–`12`. Open the minute dropdown. **Expect**:
   options `00`–`59`, scrollable.
3. Without touching the time controls, enter `400` calories and submit (no extra taps).
4. **Expect**: the new row in the day list shows a time within a minute of now.

### 4. Setting a specific time and ordering (User Story 2, FR-007, FR-010, SC-004)

1. Open **Add Food** for today. Set hour `7`, minute `15`, `AM`, calories `300` ("Breakfast"),
   submit.
2. Open **Add Food** again. Set hour `12`, minute `30`, `PM`, calories `600` ("Lunch"), submit.
3. Open **Add Food** again. Leave the default time (now, afternoon), calories `200`, submit.
4. **Expect**: the day's entry list is ordered `Breakfast (7:15 AM)`, `Lunch (12:30 PM)`, then
   the `200` entry — ascending by time, regardless of entry order.

### 5. Editing pre-selects the stored time (User Story 2, FR-009)

1. Tap ✏️ on the `Lunch` entry.
2. **Expect**: hour shows `12`, minute shows `30`, toggle shows `PM`.
3. Change hour to `1`, minute to `45`, keep `PM`, save. **Expect**: the entry moves to its new
   chronological position (1:45 PM) and the row shows `1:45 PM`.

### 6. Time is always valid (FR-004, FR-006, FR-008)

1. Open **Add Food**. **Expect**: there is no way to enter a letter, an empty value, or an
   out-of-range hour/minute — the hour and minute controls are dropdowns limited to their
   option lists.
2. Without opening the dropdowns, enter `250` calories and submit. **Expect**: submission
   succeeds; entry time is the current time.

### 7. Past day + default time (edge case)

1. Calendar tab → select a day last week → **Add Food** → leave default time → submit.
2. **Expect**: entry stored under last week's day, with today's wall-clock time (e.g.
   `15:10`). Confirm it shows on that day only.

## Success criteria checklist

Covers spec.md SC-001 (correct day identified before submit — scenario 1), SC-002 (no added
mandatory taps — scenario 3), SC-003 (default correct for "log now" — scenario 3), SC-004
(correct chronological position — scenarios 4 & 5), SC-005 (`DD - MMMM - AAAA` incl. leading
zero — scenario 1 + unit tests).
