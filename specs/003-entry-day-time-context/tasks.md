# Tasks: Day Context Header and Optional Time on Entry Form

**Input**: Design documents from `/specs/003-entry-day-time-context/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: `contracts/datetime-helpers.md` explicitly requires unit test coverage for the new
`lib/datetime.ts` module (test-first, mirroring feature 001/002's `lib/calculations/__tests__`
pattern). No new UI/E2E test tasks — UI is validated manually via `quickstart.md`, same as
features 001 and 002.

**Organization**: Tasks are grouped by user story (from spec.md, priority order). There is no
Setup phase — this feature reuses feature 001's project scaffold, dependencies, and Jest config
exactly as-is; nothing new to initialize (no new dependency, per plan.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2)
- All paths are relative to the repository root

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: The pure date/time helper module that both user stories consume (US1 uses
`formatLongDate`; US2 uses the clock helpers — see T012 for the shipped 12-hour API:
`sanitizeClockInput` / `parseClockInput` / `to24Hour` / `clockFieldsFromDate` /
`clockFieldsFromIso` / `combineDateAndTime`).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Write unit tests in `lib/__tests__/datetime.test.ts` per `contracts/datetime-helpers.md`'s "Required unit test coverage": `formatLongDate` (all table rows + leading-zero day + one extra month), `parseTimeInput` (every valid + every rejection row), `combineDateAndTime` ⇄ `timeInputValueFromIso` round-trip property + valid-ISO assertion, and the FR-010 ordering guard (three `combineDateAndTime` outputs for the same date at `07:00`/`12:30`/`19:45`, scrambled, sorted by `localeCompare`, assert ascending). Tests should fail until T002.
- [X] T002 Implement `lib/datetime.ts` exporting `formatLongDate(dateStr)`, `parseTimeInput(raw)`, `combineDateAndTime(dateStr, hours, minutes)`, `timeInputValueFromIso(iso)`, and `currentTimeInputValue()` exactly per `contracts/datetime-helpers.md` (hardcoded English `MONTHS` array; split date strings on `-`, never `new Date("YYYY-MM-DD")`; build timestamps from local `Date` components; pure except `currentTimeInputValue`). Satisfies T001. (depends on T001)

**Checkpoint**: `npm test` green — helper module ready; both user stories can now proceed.

---

## Phase 2: User Story 1 - See Which Day an Entry Is Being Added To (Priority: P1) 🎯 MVP

**Goal**: The entry form's in-screen title and the target day's date sit on one `space-between`
row, with the date formatted `DD - MMMM - AAAA` (English month), for every use of the form
(add/edit, food/exercise).

**Independent Test**: Select a non-today day on the Calendar tab, open the entry form, and
confirm the displayed date matches the selected day in `DD - MMMM - AAAA` format, on the title's
row with title and date pushed to opposite ends; submit and confirm the entry lands on that day,
not today.

- [X] T003 [US1] Modify `app/entry-form.tsx`: replace the standalone `<Text style={typography.title}>` with a `<View style={styles.header}>` (`flexDirection: "row"`, `justifyContent: "space-between"`, `alignItems: "baseline"`) containing the existing title `<Text>` plus a new `<Text style={styles.headerDate}>{formatLongDate(date)}</Text>` (import from `lib/datetime.ts`); add `styles.header` and `styles.headerDate` (derived from `typography.caption`/`label` tokens, `flexShrink: 1`, allow wrap so a long month name never pushes the title off-screen — spec edge case). Uses the existing `date` route param; covers FR-001, FR-002, FR-003, FR-011. (depends on T002) — also added `date = raw.date ?? todayIsoDate()` so the header always has a valid date (FR-003 "default to today"); `headerDate` uses `flexShrink: 1` + `textAlign: "right"` and the title `flexShrink: 1`, so a long month name shrinks/wraps rather than pushing the title off-screen.

**Checkpoint**: Opening Add/Edit Food or Exercise from Today or Calendar shows the correct day
in the required format at the title's height. This alone is a complete, demoable increment.

---

## Phase 3: User Story 2 - Record the Time of an Entry (Priority: P2)

**Goal**: An optional `HH:MM` time field on the entry form, pre-filled with the current local
time (or the entry's stored time when editing); the chosen/defaulted time is composed with the
target day's date into the entry's `createdAt`, so entries sort chronologically in the day list.

**Independent Test**: Open the entry form, leave the time untouched and confirm the saved entry
carries the current time; add another with an explicit earlier time and confirm it is saved and
appears before the first in the day's list; reopen it to edit and confirm the time field is
pre-filled with its stored value.

- [X] T004 [P] [US2] Extend `lib/storage/dayStorage.ts`: add optional `createdAt?: string` to the `EntryInput` interface; in `addEntry` use `input.createdAt ?? new Date().toISOString()`; in `updateEntry`'s per-entry mapper spread `...(input.createdAt ? { createdAt: input.createdAt } : {})` so a provided timestamp overwrites and an absent one leaves the stored value untouched (data-model.md, `contracts/entry-form-and-storage.md`).
- [X] T005 [P] [US2] Modify `components/EntryForm.tsx` per `contracts/entry-form-and-storage.md`: add required `targetDate: string` prop; add `createdAt: string` to `EntryFormValues`; add `createdAt?: string` to the `initialValues` shape; render a `Time (optional)` `TextInput` (`keyboardType="numeric"`, existing `styles.input`) after the Note field, initialised to `initialValues?.createdAt ? timeInputValueFromIso(initialValues.createdAt) : currentTimeInputValue()`; in `handleSubmit`, after the existing `calories > 0` check, compute `const t = parseTimeInput(timeField) ?? <current local hours/minutes>` then `createdAt: combineDateAndTime(targetDate, t.hours, t.minutes)` in the `onSubmit` payload; never surface an error or block submit for the time field (FR-004, FR-005, FR-006, FR-007, FR-008, FR-009). (depends on T002)
- [X] T006 [US2] Update `app/entry-form.tsx`: pass `targetDate={date}` to `<EntryForm>`; when `isEdit`, add `createdAt: raw.createdAt` to the `initialValues` object it builds (new route param read; `raw.calories`/`raw.note` are already read there). (depends on T005; same file as T003 — run after it)
- [X] T007 [P] [US2] Update `app/(tabs)/index.tsx`: in `openEntryForm`, add `createdAt: item.createdAt` to the edit-params object (the `item ? { entryId, calories, note } : {}` spread). `EntryListItem` already exposes `createdAt`. (depends on T006 defining the param contract)
- [X] T008 [P] [US2] Update `app/(tabs)/calendar.tsx`: same one-line `createdAt: item.createdAt` addition to `openEntryForm`'s edit-params object. (depends on T006 defining the param contract)

> `components/EntryList.tsx` needs **no change**: it already builds the combined list with
> `.sort((a, b) => a.createdAt.localeCompare(b.createdAt))`, and ISO-8601 UTC strings sort
> chronologically — so FR-010 is satisfied automatically once `createdAt` reflects the chosen
> time. `components/EntryRow.tsx` also needs no change: it already renders `createdAt` via
> `toLocaleTimeString`, so the chosen time shows in the row for free.

**Checkpoint**: Both user stories independently functional — the full feature is complete.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T009 [P] Run `npx jest` — confirm the new `lib/__tests__/datetime.test.ts` passes and feature 001/002 tests (`bmr`, `netCalories`, `calorieGoal`) are unmodified and still green (regression check per plan.md Constraints).
- [X] T010 [P] Run `npx tsc --noEmit` and `npx expo lint` — confirm no type or lint regressions (same gate used in features 001/002); verify no `any` was introduced by the extended `EntryFormValues` / `EntryInput` / route params.
- [ ] T011 Run the 7 manual scenarios in `quickstart.md` end-to-end in Expo Go (day header on Today/Calendar/edit, default time, explicit time + ordering, edit pre-fill, non-digit/out-of-range/cleared time fallback, past day + default time). **Not run** — no device/simulator/Expo Go client available in this environment; requires the user (same limitation as features 001/002). Build sanity was verified instead: `npx expo export --platform web` completes cleanly with `/entry-form` among the 11 exported routes.
- [X] T012 [US2] Stakeholder refinement #1 (after initial implementation): change the time control from a 24-hour `HH:MM` field to a **12-hour digit-filtered field + AM/PM toggle** — superseded by T013.
- [X] T014 Stakeholder polish (cross-cutting): form inputs showed a near-black placeholder and a platform/browser focus outline (reported as yellow on web). Added `colors.placeholder` (`#A9B2CC`) to `lib/theme.ts`; new `components/FormTextInput.tsx` — shared `TextInput` wrapper with the muted placeholder colour and a 2px `colors.primary` focus border (plus a web `outlineColor` override), adopted by `EntryForm` (calories, note) and `ProfileForm` (weight, height, age), removing the duplicated `styles.input`. `components/Select.tsx` trigger got the matching 2px border (transparent → `colors.primary` while open) so selects and text fields align. `jest` 29/29, `tsc`, `expo lint`, `expo export` clean.
- [X] T013 [US2] Stakeholder refinement #2: make hour and minute **dropdown selects** (options 1–12 and 00–59). New `components/Select.tsx` — a `Pressable` trigger opening a scrollable option list in RN's built-in `Modal` (same pattern as `InfoDialog`), no native picker, no new dependency (`ChevronDown` from the already-present `lucide-react-native`). `lib/datetime.ts` — removed `sanitizeClockInput`/`parseClockInput`; added `HOUR_OPTIONS`/`MINUTE_OPTIONS` constants and `ClockFields` type; `clockFieldsFromDate`/`clockFieldsFromIso` now return `{ hour12, minute, meridiem }`. `components/EntryForm.tsx` — time row = hour `Select` + `:` + minute `Select` + AM/PM pills; submit path is just `to24Hour(Number(hour), Number(minute), meridiem) → combineDateAndTime` with no fallback (dropdowns can't be invalid). `lib/__tests__/datetime.test.ts` rewritten (29 tests). spec.md (FR-004/005/006/007/008/009, US2 scenarios, edge cases, assumptions), research.md (decisions 1–2), data-model.md, both contracts, and quickstart.md updated. `jest` 29/29, `tsc`, `expo lint`, `expo export` all clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. BLOCKS both user stories.
- **User Story 1 (Phase 2)**: Depends on T002 (`formatLongDate`). No dependency on User Story 2.
- **User Story 2 (Phase 3)**: Depends on T002 (time helpers). Independent of User Story 1's
  header work, but T006 edits the same file (`app/entry-form.tsx`) as T003, so if both stories
  are done, run T003 before T006.
- **Polish (Phase 4)**: Depends on all desired user stories being complete.

### Within the phases

- T001 (tests) before T002 (implementation).
- T004 and T005 are independent (different files) and both only need T002.
- T006 needs T005 (the `targetDate` prop / `initialValues.createdAt` must exist).
- T007 and T008 need T006 to have fixed the `createdAt` edit-param name; they are independent of
  each other (different files).

### Parallel Opportunities

- Foundational: T001 is `[P]` only in the sense that it is the sole task until T002; effectively
  sequential (T001 → T002).
- User Story 2: T004 ∥ T005 (different files). After T006: T007 ∥ T008 (different files).
- Polish: T009 ∥ T010.
- With two developers after Phase 1: Dev A takes US1 (T003), Dev B takes US2 (T004–T008); only
  contact point is the `app/entry-form.tsx` merge (T003 vs T006).

---

## Parallel Example: User Story 2

```bash
# After T002, launch together (different files):
Task: "Extend EntryInput + addEntry/updateEntry in lib/storage/dayStorage.ts (T004)"
Task: "Add targetDate prop + optional time field to components/EntryForm.tsx (T005)"

# After T006, launch together (different files):
Task: "Add createdAt to openEntryForm edit params in app/(tabs)/index.tsx (T007)"
Task: "Add createdAt to openEntryForm edit params in app/(tabs)/calendar.tsx (T008)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Foundational (T001–T002).
2. Complete Phase 2: User Story 1 (T003).
3. **STOP and VALIDATE**: opening the entry form for any selected day shows that day in
   `DD - MMMM - AAAA` at the title's height — this alone eliminates the "logged to the wrong
   day" error, the feature's core value.

### Incremental Delivery

1. Foundational → helper module + tests, nothing user-visible.
2. + User Story 1 → **MVP**: day-context header on the entry form.
3. + User Story 2 → optional time field, defaulted to now, with chronological ordering.
4. + Polish → regression (`jest` / `tsc` / `lint`) and manual `quickstart.md` pass.
