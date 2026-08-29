# Quickstart: Entry Row — Title, Expand, Swipe

Validation guide. See [data-model.md](./data-model.md) and [contracts/](./contracts/) for exact
shapes.

## Prerequisites

```bash
npx expo install react-native-gesture-handler   # pins ~2.32.0 (Expo Go bundled version)
npm install
npx expo start
```

Open in Expo Go. No dev client, no `expo prebuild`.

## Automated checks

```bash
npm test
npx tsc --noEmit
npx expo lint
```

Expected:

- `lib/__tests__/datetime.test.ts` — new `formatClockTime` / `localDateOf` cases pass (see
  [contracts/datetime-helper.md](./contracts/datetime-helper.md)); feature-003 cases unchanged.
- `components/__tests__/EntryRow.test.tsx` — title-vs-fallback, expand/collapse, note tone,
  no icon buttons.
- Feature 001–004 tests still green.
- `npx expo install --check` no longer reports `react-native-gesture-handler` as outdated.

## Manual validation scenarios

### 1. Title field in the form (US1)

1. Today → **+** → **Add Food**. **Expect**: inputs in order **Calories, Title (optional),
   Note (optional), Time (optional)**.
2. Enter `450` calories, title `Breakfast`, no note, submit.
3. **Expect**: the day's list shows a row labelled **Breakfast**.
4. Add another food entry with `200` calories, **no title, no note**. **Expect**: its row shows
   **Food**.
5. Left-swipe the `Breakfast` row to edit (see scenario 3). **Expect**: the Title field is
   pre-filled `Breakfast`. Change it to `Desayuno`, save. **Expect**: the row now reads
   `Desayuno`.

### 2. Expand on tap (US2)

1. Add a food entry: `600` cal, title `Lunch`, note `grilled chicken salad, large`, time
   `1:30 PM`.
2. Tap anywhere on the `Lunch` row. **Expect**: it expands in place showing the note
   (`grilled chicken salad, large`) in a lighter grey, and a line like
   `05 - <Month> - 2026 · 1:30 PM`.
3. Tap again. **Expect**: collapses to the summary; the collapsed row height did not change
   from before the feature.
4. Expand the no-note `Food` row. **Expect**: no empty note line; the date/time line still
   shows.
5. Expand a row, switch tabs, come back. **Expect**: the row is collapsed again.

### 3. Swipe to edit / delete (US3)

1. Confirm there are **no pencil/trash icons** on any row.
2. **Swipe a row to the right**. **Expect**: a red background with a trash-can icon grows from
   the left edge as you drag.
3. Drag right past ~1/3 of the row width and release. **Expect**: the **"Are you sure?"**
   confirmation dialog appears. Confirm → the entry is gone. Repeat and Cancel → the entry
   stays, the row springs back.
4. Drag right only slightly and release. **Expect**: the row springs back, no dialog.
5. **Swipe a row to the left** past the threshold and release. **Expect**: the edit form opens
   for that entry, pre-filled (Title included).
6. On the **Calendar** tab, select a past day with entries and repeat left-swipe. **Expect**:
   the edit form opens for that entry on the selected day.

### 4. Scroll vs swipe (SC-004 / FR-018)

1. Create ~8 entries so the list scrolls.
2. Flick the list up and down repeatedly. **Expect**: no row is deleted, no edit form opens,
   no row visibly translates sideways.
3. Now deliberately swipe one row horizontally. **Expect**: it responds normally.

### 5. Legacy entries (SC-005 / FR-006)

1. (If you have a build from before this feature, or seed an entry then remove its `title` in
   storage.) **Expect**: the row shows the type fallback, expands normally, and opens to edit
   with an empty Title field — calories/note/time intact.

## Success criteria checklist

Covers spec SC-001 (scenario 1), SC-002 (scenario 2), SC-003 (scenario 3), SC-004
(scenario 4), SC-005 (scenario 5), SC-006 (scenario 2 step 3).
