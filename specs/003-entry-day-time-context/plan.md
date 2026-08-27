# Implementation Plan: Day Context Header and Optional Time on Entry Form

**Branch**: `003-entry-day-time-context` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-entry-day-time-context/spec.md`

## Summary

Two changes to the shared entry form (`app/entry-form.tsx` + `components/EntryForm.tsx`), for
both add/edit and both entry types:

1. **Day-context header** — the in-screen title (`Add Food`, `Edit Exercise`, …) moves into a
   `space-between` row that also shows the target day, formatted `DD - MMMM - AAAA` with an
   English month name (e.g. `05 - March - 2026`). The target day is the `date` param the form
   already receives from the Today / Calendar screens.
2. **Optional time control** — a 12-hour control next to the "Note" field: an hour dropdown
   (1–12), a minute dropdown (00–59), and an AM/PM toggle, all pre-selected to the current
   local time. On submit the form composes the target day's date with the chosen (or defaulted)
   time into the entry's `createdAt` ISO timestamp. Editing pre-selects all three from the
   entry's stored `createdAt`. The dropdowns are a new `components/Select.tsx` (Modal-based,
   no native picker). *(This started as a 24-hour text field and went through two
   stakeholder-requested revisions — see research.md §1 and tasks T012/T013.)*

No new dependencies, no new storage key, no schema change: `FoodEntry`/`ExerciseEntry` already
carry `createdAt`, and `EntryList` already orders entries by it — so time-ordering (FR-010)
falls out for free once `createdAt` reflects the chosen time. The only storage-layer change is
that `addEntry`/`updateEntry` now accept a caller-supplied `createdAt` instead of always
stamping `new Date()`.

## Technical Context

**Language/Version**: TypeScript on the existing Expo SDK 57 / React Native 0.86 project —
unchanged.

**Primary Dependencies**: None new. Deliberately **not** adding
`@react-native-community/datetimepicker` or `@react-native-picker/picker` (require native code,
violate Constitution II) — the hour/minute pickers are a custom `components/Select.tsx` built
from React Native's built-in `Modal` + `ScrollView` (same pattern as the existing
`InfoDialog.tsx`); its only new import, `ChevronDown`, comes from `lucide-react-native`, already
a project dependency.

**Storage**: Existing `"day:YYYY-MM-DD"` `AsyncStorage` key, existing `DayLog` JSON shape. The
`createdAt` field on each entry already exists (feature 001); this feature changes *who
supplies its value* (the form, via `EntryInput.createdAt`), not the shape on disk.

**Testing**: `jest` / `jest-expo` (already configured). New pure helpers in `lib/datetime.ts`
get a dedicated `lib/__tests__/datetime.test.ts`, mirroring the
`lib/calculations/__tests__/*.test.ts` pattern.

**Target Platform**: iOS and Android inside Expo Go — unchanged.

**Project Type**: Extension within the existing single Expo Router mobile app. No new screen,
no new module boundary.

**Performance Goals**: Unchanged — string formatting / parsing on a single date value.

**Constraints**: Must not regress feature 001/002 behavior. `EntryList`'s existing
`createdAt.localeCompare` sort must keep working (ISO-UTC strings sort chronologically, so no
change needed there). The default-time path must add **zero** mandatory taps (SC-002).

**Scale/Scope**: 6 existing files modified, 1 new helper module + 1 new test file. No new
screens, per spec.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Local-Only Storage | Still `AsyncStorage` only; same `"day:*"` key and same `DayLog` shape. `createdAt` already existed — no new field, no backend. | PASS |
| II. Expo Go Compatibility | No new dependency. Native date/time pickers are explicitly rejected in favor of a plain `TextInput`. | PASS |
| III. Native StyleSheet Only | New header row, time controls, and `Select` use `StyleSheet.create` and the existing theme tokens; no styling library. | PASS |
| IV. Simplicity for Portfolio Clarity | Date/time conversion lives in one small pure module (`lib/datetime.ts`) with focused tests, matching `lib/calculations`. `EntryForm` gains one prop (`targetDate`). One new component, `Select.tsx`, reuses the established `InfoDialog` Modal pattern and has two call sites (hour + minute), so it earns the abstraction. | PASS |
| V. TypeScript-Typed Components | New helper signatures and the extended `EntryFormValues` / `EntryInput` are explicitly typed; no `any`. | PASS |

No violations — Complexity Tracking is intentionally empty.

**Post-Phase-1 re-check** (incl. the T012/T013 refinements): one new pure module
(`lib/datetime.ts` + test), one new component (`components/Select.tsx`, Modal-based dropdown
reusing the `InfoDialog` pattern), one new `EntryForm` prop, one new optional `EntryInput`
field, and `StyleSheet` header/time-control styling. No dependency added, no storage key or
shape changed, no new screen. All five principles still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-entry-day-time-context/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── datetime-helpers.md
│   └── entry-form-and-storage.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (existing repository, files modified/added by this feature)

```text
lib/
├── datetime.ts                     # NEW — pure date/time formatting + parsing helpers
├── __tests__/
│   └── datetime.test.ts            # NEW — unit tests for lib/datetime.ts
├── types.ts                        # UNCHANGED — FoodEntry/ExerciseEntry already have createdAt
└── storage/
    └── dayStorage.ts               # MODIFIED — EntryInput gains optional createdAt;
                                    #            addEntry/updateEntry honor it

components/
├── EntryForm.tsx                   # MODIFIED — new `targetDate` prop; optional 12-hour time
│                                   #            control (hour/minute Selects + AM/PM toggle);
│                                   #            EntryFormValues gains createdAt
├── Select.tsx                      # NEW — reusable Modal-based dropdown (hour / minute picker)
├── FormTextInput.tsx               # NEW — shared TextInput: muted placeholder + blue focus ring
│                                   #        (adopted by EntryForm + ProfileForm)
└── EntryList.tsx                   # UNCHANGED — existing createdAt sort already covers FR-010

app/
├── entry-form.tsx                  # MODIFIED — title moves into a space-between header row
│                                   #            with the formatted target date; passes
│                                   #            targetDate + edit createdAt into EntryForm
└── (tabs)/
    ├── index.tsx                   # MODIFIED — openEntryForm passes item.createdAt on edit
    └── calendar.tsx                # MODIFIED — openEntryForm passes item.createdAt on edit
```

**Structure Decision**: No new directories or screens. The one new file is a pure helper
module placed alongside the existing `lib/calculations` helpers, following the project's
established "business/formatting logic in tested pure functions, isolated from UI" convention.

## Complexity Tracking

*No Constitution Check violations were identified — this section is intentionally empty.*
