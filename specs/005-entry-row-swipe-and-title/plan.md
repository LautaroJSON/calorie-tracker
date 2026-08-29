# Implementation Plan: Entry Row — Title Field, Expand on Tap, Swipe to Edit/Delete

**Branch**: `005-entry-row-swipe-and-title` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-entry-row-swipe-and-title/spec.md`

## Summary

Three coupled changes to the shared entry UI (food + exercise):

1. **Title field** — `FoodEntry` / `ExerciseEntry` gain an optional `title: string`. The entry
   form (`components/EntryForm.tsx`) gets a "Title (optional)" `FormTextInput` between Calories
   and Note. `EntryInput` / `EntryFormValues` / `EntryListItem` and the `entry-form` route
   params carry it, exactly as `note` already flows today. Legacy entries default to `""`.

2. **Expand on tap** — `components/EntryRow.tsx` becomes a `Pressable` holding local
   `expanded` state (not persisted). Collapsed: today's summary but showing `title` (with the
   type fallback when empty) instead of `note`. Expanded: an indented details block with the
   `note` in a lighter tone (omitted when empty) and a `date · time` meta line, where time is
   12-hour AM/PM via a new `formatClockTime()` in `lib/datetime.ts`. The pencil/trash icon
   buttons and the `actions` view are deleted.

3. **Swipe to edit / delete** — a new `components/SwipeableRow.tsx` wraps each `EntryRow` in
   `EntryList`. It uses `react-native-gesture-handler`'s `Gesture.Pan()` + `GestureDetector`
   and `react-native-reanimated` shared values to translate the row horizontally. Swipe right
   past a threshold → `onDelete` (which still runs the existing `confirmDestructive` dialog);
   swipe left past a threshold → `onEdit` (opens the edit form). During a right drag a red
   background with a `Trash2` icon is revealed from the left edge, its opacity/scale
   interpolated from the drag distance; a partial drag springs back. `.activeOffsetX` /
   `.failOffsetY` keep the gesture from fighting the list's vertical scroll.

Storage stays a single `day:YYYY-MM-DD` AsyncStorage value with one new optional field on each
entry. `react-native-gesture-handler` is added as an explicit dependency at the Expo-pinned
version (it is already a transitive dep and is bundled in Expo Go — see Constitution Check).
`react-native-reanimated` is already a direct dependency. The app root gains a
`GestureHandlerRootView`.

## Technical Context

**Language/Version**: TypeScript on the existing Expo SDK 57 / React Native 0.86 project —
unchanged.

**Primary Dependencies**:
- **New (explicit):** `react-native-gesture-handler` at `~2.32.0` — the version
  `npx expo install` pins for SDK 57 and the version bundled in Expo Go
  (`expo/bundledNativeModules.json`). It is *already present* transitively (via `expo-router`
  → `react-native-drawer-layout`, whose peer is `>= 2.0.0`), currently resolved to an
  incompatible `3.2.1`; `npx expo install react-native-gesture-handler` replaces it with
  `~2.32.0`.
- **Already direct:** `react-native-reanimated` 4.5.1 (drag translation + expand animation).
  The `react-native-worklets/plugin` Babel transform is already active via `babel-preset-expo`
  (no `babel.config.js` in the project; the ring component already uses reanimated).
- **Already present:** `lucide-react-native` (`Trash2`, `Pencil` for the swipe backgrounds).

**Storage**: Existing `day:YYYY-MM-DD` AsyncStorage key and `DayLog` JSON shape. Each
`FoodEntry` / `ExerciseEntry` object gains an optional `title` string. `loadDayLog` already
tolerates missing fields; reads use `entry.title ?? ""`.

**Testing**: `jest` / `jest-expo` + React Native Testing Library (set up in feature 004).
`jest.setup.js` gains `require("react-native-gesture-handler/jestSetup")`. New unit test for
`formatClockTime` in `lib/__tests__/datetime.test.ts`; component tests for the redesigned
`EntryRow`; `SwipeableRow`'s gesture is validated in `quickstart.md` (RNTL cannot faithfully
drive a pan gesture).

**Target Platform**: Android (and iOS) in Expo Go / the release APK — unchanged.

**Project Type**: Extension within the existing single Expo Router mobile app. No new screen.

**Performance Goals**: Unchanged. Drag animation runs on the UI thread via reanimated; expand
toggles a small subtree.

**Constraints**: Must not regress features 001–004. Vertical list scrolling must not trigger
swipes and vice-versa (FR-018). Collapsed row height must not grow (SC-006). Delete keeps the
confirmation dialog (FR-020).

**Scale/Scope**: ~9 existing files modified, 1 new component, 1 new pure helper, plus test
files. One new explicit dependency (already installed transitively).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Local-Only Storage | One optional `title` string added to the existing per-entry objects in the existing `day:*` value. No new key, no backend. | PASS |
| II. Expo Go Compatibility | `react-native-gesture-handler` is listed in `expo/bundledNativeModules.json` (`~2.32.0`) — its native code ships **inside Expo Go**; adding it needs **no `expo prebuild`, no dev client**. It is added at the Expo-pinned version via `npx expo install`, the same way any Expo-managed native module is. `react-native-reanimated` is already a direct dependency with its Babel plugin active. `npx expo install --check` currently flags the *transitive* `3.2.1` as wrong and expects `~2.32.0` — this feature fixes that. | PASS |
| III. Native StyleSheet Only | `EntryRow`, `SwipeableRow`, and the swipe backgrounds use `StyleSheet.create` + `lib/theme` tokens. Reanimated `useAnimatedStyle` returns plain RN style objects — it is an animation runtime, not a styling library (NativeWind/styled-components are what the principle rules out). | PASS |
| IV. Simplicity for Portfolio Clarity | `SwipeableRow` is one focused component rendered for every entry (single call site in `EntryList`); the gesture logic lives there, not spread through the list. `formatClockTime` is a one-line pure helper next to the existing `lib/datetime` clock helpers it reuses. `EntryRow` gains one `useState`. No generic "swipeable list" abstraction. | PASS |
| V. TypeScript-Typed Components | `title` on the entry types, `EntryInput`, `EntryFormValues`, `EntryListItem`, and `SwipeableRow` / `EntryRow` props are all explicitly typed; no `any`. | PASS |

No violations — Complexity Tracking is intentionally empty. The new dependency is an
Expo-bundled native module added at the Expo-pinned version, which Principle II explicitly
permits ("Only Expo SDK APIs … MAY be added").

**Post-Phase-1 re-check**: design adds one Expo-managed dependency (`react-native-gesture-handler`
at `~2.32.0`, replacing a wrong transitive version), one `GestureHandlerRootView` at the app
root, one new component (`SwipeableRow`), one pure helper (`formatClockTime` + test), an
optional `title` field threaded through the existing entry data path, and an `expanded`
`useState` in `EntryRow`. No storage key or shape change beyond the optional field, no new
screen, no styling library. All five principles still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/005-entry-row-swipe-and-title/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── datetime-helper.md
│   └── components-and-data.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (existing repository, files modified/added by this feature)

```text
lib/
├── types.ts                        # MODIFIED — FoodEntry/ExerciseEntry gain `title?: string`
├── datetime.ts                     # MODIFIED — new formatClockTime(iso) -> "7:15 AM"
├── __tests__/
│   └── datetime.test.ts            # MODIFIED — formatClockTime cases
└── storage/
    └── dayStorage.ts               # MODIFIED — EntryInput.title; addEntry/updateEntry persist it

components/
├── EntryForm.tsx                   # MODIFIED — "Title (optional)" input; EntryFormValues.title;
│                                   #            initialValues.title
├── EntryRow.tsx                    # MODIFIED — `title` prop; Pressable + expanded state;
│                                   #            expanded details block (note lighter + date +
│                                   #            AM/PM time); remove pencil/trash buttons
├── SwipeableRow.tsx                # NEW — Gesture.Pan + reanimated wrapper; red/Trash2 cue on
│                                   #       right drag, edit cue on left; threshold -> onDelete
│                                   #       / onEdit; springs back on partial drag
├── EntryList.tsx                   # MODIFIED — EntryListItem.title; wrap each EntryRow in
│                                   #            <SwipeableRow>; pass title through
└── __tests__/
    └── EntryRow.test.tsx           # NEW — title vs fallback, expand/collapse, no icons

app/
├── _layout.tsx                     # MODIFIED — wrap tree in <GestureHandlerRootView>
├── entry-form.tsx                  # MODIFIED — pass title into EntryForm initialValues on edit
└── (tabs)/
    ├── index.tsx                   # MODIFIED — openEntryForm passes item.title on edit
    └── calendar.tsx                # MODIFIED — same

jest.setup.js                       # MODIFIED — require("react-native-gesture-handler/jestSetup")
package.json                        # MODIFIED — react-native-gesture-handler dependency (expo install)
README.md                           # MODIFIED — note the row interaction change
```

**Structure Decision**: No new screens or directories. The swipe logic is isolated in one new
component (`SwipeableRow`) so `EntryRow` stays a plain presentational component (still directly
testable); `EntryList` composes the two. The time-formatting helper joins the existing
`lib/datetime` pure module and reuses its `clockFieldsFromIso`.

## Complexity Tracking

*No Constitution Check violations were identified — this section is intentionally empty.*
