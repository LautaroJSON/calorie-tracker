---
description: "Task list for Entry Row — Title Field, Expand on Tap, Swipe to Edit/Delete"
---

# Tasks: Entry Row — Title Field, Expand on Tap, Swipe to Edit/Delete

**Input**: Design documents from `/specs/005-entry-row-swipe-and-title/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Unit test for the new `lib/datetime` helpers and a component test for the redesigned
`EntryRow` — matching the project's existing test conventions (`lib/__tests__`,
`components/__tests__`, RNTL set up in feature 004). The pan gesture itself is validated
manually via [quickstart.md](./quickstart.md) (RNTL cannot faithfully drive an RNGH pan).

**Organization**: The three user stories (all P1) are a coupled redesign of the shared entry
UI. They are still sliced so each leaves the app shippable: US1 adds the Title field end to
end, US2 makes the row expand, US3 replaces the icon buttons with swipe.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different files, no dependency on an incomplete task
- **[Story]**: US1 / US2 / US3 (Setup/Foundational/Polish carry no story label)

## Path Conventions

Single Expo Router mobile app; paths are repo-root-relative.

---

## Phase 1: Setup

- [X] T001 Run `npx expo install react-native-gesture-handler` (pins `~2.32.0`, the Expo Go
  bundled version), promoting the existing transitive dep to an explicit `dependency` in
  `package.json`. Confirm `npx expo install --check` no longer flags it.
- [X] T002 Add `import "react-native-gesture-handler/jestSetup";` as the first line of
  `jest.setup.js` so RNGH-importing components don't throw under Jest.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `title` data field and the time helpers that more than one story needs.

- [X] T003 [P] Add `title?: string;` to `FoodEntry` and `ExerciseEntry` in `lib/types.ts`
  (next to `note?: string`).
- [X] T004 [P] Add `formatClockTime(iso: string): string` (→ `"7:15 AM"`, via
  `clockFieldsFromIso`) and `localDateOf(iso: string): string` (→ local `"YYYY-MM-DD"`) to
  `lib/datetime.ts`. See [contracts/datetime-helper.md](./contracts/datetime-helper.md).
- [X] T005 Add cases for `formatClockTime` and `localDateOf` to `lib/__tests__/datetime.test.ts`
  covering every row of the tables in the contract (midnight → `12:00 AM`, noon-thirty →
  `12:30 PM`, single-digit hour, zero-padded minute; local-day boundary). Depends on T004.
- [X] T006 In `lib/storage/dayStorage.ts`: add `title?: string` to `EntryInput`; in `addEntry`
  set `title: input.title` on the new entry; in `updateEntry` set `title: input.title` on the
  matched entry (always written, like `note`). Depends on T003.

**Checkpoint**: `npm test` + `npx tsc --noEmit` green; `title` persists but is not shown yet.

---

## Phase 3: User Story 1 - Give an Entry a Title (Priority: P1) 🎯 MVP

**Goal**: The entry form has an optional Title field between Calories and Note; it is saved,
pre-filled on edit, and shown on the entry's row (falling back to the type when empty).

**Independent Test**: Add a food entry with calories + title, save, confirm the row shows the
title; add one with no title, confirm the row shows "Food"; edit the first, confirm the Title
field is pre-filled and a change is reflected.

- [X] T007 [US1] In `components/EntryForm.tsx`: add `title?: string` to `EntryFormValues` and
  to `EntryFormProps.initialValues`; add `const [title, setTitle] = useState(initialValues?.title ?? "")`;
  render a "Title (optional)" `FormTextInput` (`placeholder="e.g. Breakfast"`) **between** the
  Calories and Note fields; in `handleSubmit` include `title: title.trim() || undefined` in the
  `onSubmit` payload. Keep `autoFocus` on Calories. Depends on T006.
- [X] T008 [US1] In `app/entry-form.tsx`: add `title: raw.title` to the `initialValues` object
  passed to `<EntryForm>` on the edit path. Depends on T007.
- [X] T009 [US1] [P] In `app/(tabs)/index.tsx` and `app/(tabs)/calendar.tsx`: in
  `openEntryForm(type, item)` add `title: item.title ?? ""` to the `params` object (next to the
  existing `note: item.note ?? ""`).
- [X] T010 [US1] In `components/EntryList.tsx`: add `title?: string` to `EntryListItem`; pass
  `title={item.title}` to `<EntryRow>`.
- [X] T011 [US1] In `components/EntryRow.tsx`: add `title?: string` to `EntryRowProps`; in the
  summary line render `{title || (type === "food" ? "Food" : "Exercise")}` where it currently
  renders `note || …`. (Icon buttons unchanged for now.) Depends on T010.
- [X] T012 [US1] Validate [quickstart.md](./quickstart.md) scenario 1 (Title field order,
  stored, shown on row, fallback label, pre-filled on edit).

**Checkpoint**: Titles work end to end; edit/delete icons still present, rows not yet
expandable.

---

## Phase 4: User Story 2 - Expand a Row to See Full Details (Priority: P1)

**Goal**: Tapping anywhere on a row expands it in place to show the note (lighter tone, omitted
when empty) plus the date and a 12-hour AM/PM time; tapping again collapses it.

**Independent Test**: With an entry that has a note, tap the row → it expands showing the note
in grey and a `date · time` line with AM/PM; tap again → collapses; the collapsed height is
unchanged; a no-note entry expands without an empty note line.

- [X] T013 [US2] In `components/EntryRow.tsx`: make the root a `Pressable` toggling
  `const [expanded, setExpanded] = useState(false)`; replace the local `formatTime` with
  `formatClockTime` from `lib/datetime` for the summary time; when `expanded`, render an
  indented `Animated.View` (from `react-native-reanimated`, `entering={FadeIn.duration(120)}`
  / `exiting={FadeOut.duration(90)}`) containing the note in `colors.textSecondary` (only when
  non-empty) and a meta line
  `` `${formatLongDate(localDateOf(createdAt))} · ${formatClockTime(createdAt)}` `` in
  `typography.caption`. Collapsed layout/height unchanged. Depends on T004, T011.
- [X] T014 [US2] [P] Create `components/__tests__/EntryRow.test.tsx` (RNTL, async API): shows
  `title` and falls back to the type label; tapping the row reveals the note text and a meta
  line, tapping again hides them; a no-note entry shows no note text when expanded; the
  expanded time reads in `H:MM AM/PM` form. Depends on T013.
- [X] T015 [US2] Validate [quickstart.md](./quickstart.md) scenario 2 (expand/collapse, note
  tone, no empty note line, AM/PM time/date, collapsed height unchanged, not persisted).

**Checkpoint**: Rows expand on tap; icon buttons still present.

---

## Phase 5: User Story 3 - Swipe to Edit or Delete (Priority: P1)

**Goal**: Remove the pencil/trash buttons. Swipe a row right → delete (still via the confirm
dialog), swipe left → edit. A right drag reveals a growing red background with a trash icon.

**Independent Test**: No icon buttons on any row; right-swipe past the threshold → confirm
dialog → entry deleted (cancel → row springs back, entry stays); left-swipe past the threshold
→ edit form opens pre-filled; a small swipe springs back; list still scrolls vertically
without triggering swipes.

- [X] T016 [US3] In `app/_layout.tsx`: wrap the returned tree in
  `<GestureHandlerRootView style={{ flex: 1 }}>` (outside `ProfileGateProvider`), importing it
  from `react-native-gesture-handler`. Depends on T001.
- [X] T017 [US3] Create `components/SwipeableRow.tsx` (`{ children, onSwipeLeft, onSwipeRight }`
  props): a `Gesture.Pan().activeOffsetX([-20, 20]).failOffsetY([-12, 12])` driving a
  reanimated `translateX` shared value (clamped); on end, if `translateX > THRESHOLD` call
  `runOnJS(onSwipeRight)()`, if `< -THRESHOLD` call `runOnJS(onSwipeLeft)()`, then
  `withSpring(0)`; behind the row, an absolutely-positioned red (`colors.danger`) layer with a
  left-pinned `Trash2` and a `colors.primary` layer with a right-pinned `Pencil`, each with
  `opacity`/`scale` = `interpolate(translateX, [0, THRESHOLD], [0, 1], CLAMP)` (mirrored for
  the left). `StyleSheet` + `lib/theme` only. See
  [contracts/components-and-data.md](./contracts/components-and-data.md). Depends on T001, T016.
- [X] T018 [US3] In `components/EntryRow.tsx`: remove the `Pencil` / `Trash2` imports, the
  `actions` view and its `Pressable`s, and the `onEdit` / `onDelete` props from
  `EntryRowProps`.
- [X] T019 [US3] In `components/EntryList.tsx`: wrap each `<EntryRow>` in
  `<SwipeableRow onSwipeLeft={onEdit ? () => onEdit(item) : () => {}} onSwipeRight={onDelete ? () => onDelete(item) : () => {}}>`;
  stop passing `onEdit` / `onDelete` to `EntryRow`. (Screen `handleDelete` already wraps
  `confirmDestructive`, so FR-020 needs no screen change.) Depends on T017, T018.
- [X] T020 [US3] In `components/__tests__/EntryRow.test.tsx`: add an assertion that no
  `"Edit entry"` / `"Delete entry"` accessible elements render. Depends on T018.
- [X] T021 [US3] Validate [quickstart.md](./quickstart.md) scenarios 3 and 4 (no icons,
  right-swipe→confirm→delete, cancel springs back, left-swipe→edit, partial swipe springs back,
  scroll vs swipe do not interfere).

**Checkpoint**: All three user stories functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T022 [P] Run `npm test`, `npx tsc --noEmit`, `npx expo lint`, and
  `npx expo install --check` — all green; confirm feature 001–004 tests unchanged.
- [X] T023 [P] Update `README.md`: note that entries have an optional Title, rows expand on
  tap, and edit/delete are now swipe gestures (left = edit, right = delete).
- [X] T024 Run the full [quickstart.md](./quickstart.md) manual pass on Android, including
  scenario 5 (legacy entry with no title) and the scroll-vs-swipe stress in scenario 4.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)** → **Foundational (P2)** → **US1 (P3)** → **US2 (P4)** → **US3 (P5)** →
  **Polish (P6)**.
- The stories are sequential here because US2 and US3 both edit `components/EntryRow.tsx` and
  `components/EntryList.tsx` on top of US1's changes — parallelizing them would collide.

### Key task-level dependencies

- T005 → T004 ; T006 → T003
- T007 → T006 ; T008 → T007
- T011 → T010 ; T013 → T004, T011 ; T014 → T013
- T016 → T001 ; T017 → T001, T016 ; T019 → T017, T018 ; T020 → T018

### Parallel opportunities

- **Foundational**: T003 ‖ T004 (then T005 after T004, T006 after T003).
- **US1**: T009 ‖ the T007→T008 chain (different files).
- **Polish**: T022 ‖ T023.
- Within US2/US3 most tasks touch `EntryRow.tsx` / `EntryList.tsx` and are sequential.

---

## Parallel Example: Foundational

```bash
# Wave 1:
Task: "T003 add title? to FoodEntry/ExerciseEntry in lib/types.ts"
Task: "T004 add formatClockTime + localDateOf to lib/datetime.ts"
# Wave 2:
Task: "T005 datetime.test.ts cases"     # after T004
Task: "T006 EntryInput.title + persist" # after T003
```

---

## Implementation Strategy

### MVP (User Story 1)

Setup → Foundational → US1 (T001–T012). The form gains a Title, it is stored and shown. The row
still has its edit/delete icons and does not expand — the app is fully usable. Ship / demo.

### Incremental delivery

US1 → US2 (rows expand, icons still there) → US3 (icons out, swipe in). Each phase leaves a
shippable app; feature 001–004 behavior is untouched throughout.

### Notes

- `[P]` = different files, no incomplete dependency.
- Only two automated test tasks (T005, T014/T020); the pan gesture is manual (T021, T024).
- Constitution: `AsyncStorage` only; `react-native-gesture-handler` is an Expo Go-bundled
  native module added at the Expo-pinned version (no dev client / prebuild); `StyleSheet` only;
  everything typed — re-checked in T022.
- Commit after each task or logical group.
