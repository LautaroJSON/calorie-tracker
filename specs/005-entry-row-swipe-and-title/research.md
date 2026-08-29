# Phase 0 Research: Entry Row — Title, Expand, Swipe

The two `[NEEDS CLARIFICATION]` markers were resolved in `/speckit-clarify` (spec.md
§ Clarifications): swipe-to-delete keeps the confirmation dialog; the change applies to both
food and exercise entries. The items below record the technical decisions for this plan — in
particular the stakeholder's explicit question: *is an extra library needed for the swipe /
expand animations, or can it be done natively?*

## 1. Library for the swipe gesture — `react-native-gesture-handler` (already present)

- **Decision**: Use `react-native-gesture-handler` (RNGH) `Gesture.Pan()` + `<GestureDetector>`
  for the horizontal swipe, driving a `react-native-reanimated` shared value for the row's
  `translateX`. Add RNGH as an **explicit** `dependency` via `npx expo install
  react-native-gesture-handler`, which pins `~2.32.0` — the version in
  `expo/bundledNativeModules.json` and the one whose native code ships **inside Expo Go**.
- **Rationale**:
  - RNGH is **already installed** as a transitive dependency of `expo-router` (via
    `react-native-drawer-layout`, peer `react-native-gesture-handler >= 2.0.0`) — currently
    resolved to `3.2.1`, which `npx expo install --check` reports as incompatible with SDK 57
    (expected `~2.32.0`). Adding the explicit, Expo-pinned version *fixes* an existing latent
    mismatch.
  - It needs **no `expo prebuild` and no dev client** — its native module is part of the Expo
    Go runtime. Constitution II permits "Expo SDK APIs"; an Expo-bundled native module added
    at the Expo-pinned version is exactly that.
  - RNGH is *the* standard tool for swipe-to-action rows: `Gesture.Pan()` with
    `.activeOffsetX([-20, 20])` and `.failOffsetY([-12, 12])` makes the gesture claim only
    clearly-horizontal movement, so the enclosing `ScrollView` keeps vertical scrolling
    (FR-018) — the hard part to get right by hand.
  - `react-native-reanimated` (drag translation + interpolated background opacity/scale) is
    **already a direct dependency** (4.5.1) with its worklets Babel plugin active through
    `babel-preset-expo` (the project has no `babel.config.js`; `CalorieRing` already renders a
    reanimated-backed component).
- **Alternatives considered**:
  - **Pure React Native — `PanResponder` + `Animated` (zero new deps)**: technically possible
    and the project already uses core `Animated` (`LoadingPlaceholder.tsx`). Rejected: the
    horizontal-swipe-vs-vertical-scroll arbitration with `PanResponder` inside a `ScrollView`
    is historically fragile (`onMoveShouldSetPanResponder` heuristics, no native failure
    relationship with the scroll view), the drag runs on the JS thread, and it is markedly
    more code for a worse feel. RNGH exists to solve precisely this.
  - **RNGH `Swipeable` / `ReanimatedSwipeable` component**: a higher-level "reveal action
    buttons" widget. Rejected: it models *reveal-and-tap*, whereas the spec is
    *swipe-past-threshold-and-release-acts* with a drag-proportional red/trash cue — cleaner to
    express directly with `Gesture.Pan()` + reanimated `interpolate`. Also its right/left
    action rendering is more opinionated than the spec's simple background.
  - **`react-native-swipe-list-view` or similar**: a third-party list wrapper. Rejected: an
    extra dependency that itself sits on RNGH, less maintained, and pulls list-rendering
    concerns into a component we already control.

**Bottom line for the stakeholder**: one library is involved, it is *already in the project*
and *already in Expo Go* — this feature just promotes it to an explicit, correctly-versioned
dependency. No dev client, no native build, no `expo prebuild`. The expand/collapse and the
drag animation themselves add nothing new (reanimated is already here).

## 2. `GestureHandlerRootView` at the app root

- **Decision**: Wrap the tree in `app/_layout.tsx` with
  `<GestureHandlerRootView style={{ flex: 1 }}>` outside `ProfileGateProvider`.
- **Rationale**: RNGH requires a `GestureHandlerRootView` ancestor for gestures to work on
  Android. `expo-router` does **not** mount one automatically (verified — no
  `GestureHandlerRootView` in `expo-router`'s root components). `app/_layout.tsx` is the single
  root layout, so one wrapper covers every screen.
- **Alternatives considered**: wrapping only the tab screens — rejected, more wrappers, and
  the root layout is the natural place.

## 3. Expand / collapse animation — native, no new library

- **Decision**: `EntryRow` holds `const [expanded, setExpanded] = useState(false)`. The
  expanded details block is conditionally rendered. Animate the transition with
  `react-native-reanimated` layout animations (`entering={FadeIn}` / `exiting={FadeOut}` on the
  details `Animated.View`, or a short `LinearTransition` on the row) — reanimated is already a
  dependency, so no addition.
- **Rationale**: A conditional subtree with a fade/height transition is the lightest thing that
  reads well. `LayoutAnimation` from RN core is unreliable under the New Architecture; a
  measured-height `Animated.timing` is more code. Reanimated's declarative `entering`/`exiting`
  is one prop each.
- **Alternatives considered**: no animation at all (instant show/hide) — acceptable but abrupt;
  the fade is cheap. `Animated` (core) height interpolation — needs an `onLayout` measure pass,
  more code for the same result.

## 4. 12-hour AM/PM time — `formatClockTime()` in `lib/datetime.ts`

- **Decision**: Add `formatClockTime(iso: string): string` → `"7:15 AM"`, built from the
  existing `clockFieldsFromIso(iso)` → `{ hour12, minute, meridiem }` as
  `` `${hour12}:${pad2(minute)} ${meridiem}` ``. Use it in `EntryRow` for **both** the
  collapsed summary time and the expanded meta line, replacing the row's local `formatTime`
  (which calls `toLocaleTimeString` — locale-dependent, not guaranteed AM/PM).
- **Rationale**: FR-011 requires AM/PM in the expanded view; using the same helper collapsed
  keeps the row consistent and removes a locale dependency. It reuses `lib/datetime`'s existing
  clock logic and is trivially unit-tested there, matching the module's convention.
- **Alternatives considered**: keeping `toLocaleTimeString` collapsed and only formatting AM/PM
  expanded — rejected, two time formats in one row is worse and the locale output already
  varies by device. `Intl.DateTimeFormat` — the module deliberately avoids `Intl` (see feature
  003 research); the hand-rolled path is deterministic.

## 5. What the expanded row shows (FR-010 interpretation)

- **Decision**: The always-visible summary line keeps `title` + `formatClockTime` + signed
  calories (unchanged height, SC-006). When expanded, an indented block appears below it with:
  the **note** in `colors.textSecondary` (a lighter tone than the title's `typography.body`),
  omitted entirely when empty (FR-012); then a meta line
  `` `${formatLongDate(dayOf(createdAt))} · ${formatClockTime(createdAt)}` ``.
- **Rationale**: `title` and `calories` are already on the summary line; repeating them in the
  block is visual noise. The block's job (per US2's rationale) is "read a long note and confirm
  the exact date/time without opening the edit form" — note + date + time does exactly that.
  `formatLongDate` already exists (`DD - Month - YYYY`).
- **Note on `dayOf(createdAt)`**: `createdAt` is an ISO timestamp; `formatLongDate` takes
  `"YYYY-MM-DD"`. Derive the local date string from the timestamp (`new Date(iso)` →
  `getFullYear/getMonth/getDate`, zero-padded) rather than slicing the UTC ISO, to match the
  local wall-clock day the time is shown in. A tiny `localDateOf(iso)` helper in `lib/datetime`
  or inline.
- **Alternatives considered**: literally repeating every field per FR-010's wording — rejected
  as redundant; the spec's intent (full info reachable) is met.

## 6. Threading `title` through the existing data path

- **Decision**: Mirror `note` everywhere it flows:
  `FoodEntry`/`ExerciseEntry.title?` → `EntryInput.title?` → `addEntry`/`updateEntry` set
  `title: input.title` (like `note`) → `EntryListItem.title?` (spread already carries it, add
  to the type) → `entry-form` route param `title` → `openEntryForm` passes `item.title ?? ""`
  on edit → `EntryForm` `initialValues.title` → `EntryFormValues.title` (trimmed to `undefined`
  when empty, like `note`).
- **Rationale**: `note` proves the exact pattern works end to end (feature 003). Fewer
  decisions, no new mechanism. `updateEntry` currently always writes `note: input.note` (so
  clearing a note works) — `title` follows suit.
- **Alternatives considered**: a combined `label`/`description` rename of `note` — rejected,
  needless churn and a migration; `title` and `note` coexist.

## 7. FR-019 "one row open at a time"

- **Decision**: No shared coordinator. Because the swipe **completes on release** (the row
  always springs back to `translateX: 0` — it never rests "open"), there is no persistent open
  state to reconcile. Two simultaneous pans are already prevented by the touch system.
- **Rationale**: Adding a context to track an "active row id" would be speculative complexity
  (Constitution IV) for a state that does not linger.
- **Alternatives considered**: a `SwipeableRowGroup` context — rejected until a real need
  (rows that stay open) exists.

## 8. Testing the gesture

- **Decision**: Unit-test `formatClockTime`. Component-test the redesigned `EntryRow`
  (title/fallback, expand/collapse, note tone, no icon buttons) with RNTL. For `SwipeableRow`,
  assert it renders its child and the action backgrounds; the actual pan-past-threshold
  behavior is covered by `quickstart.md` manual steps — RNTL's `fireEvent` cannot faithfully
  simulate an RNGH pan with velocity/offset.
- **Rationale**: Matches the project's "test the logic, manually verify the interaction" stance
  (feature 003/004). `react-native-gesture-handler/jestSetup` is added to `jest.setup.js` so
  RNGH-importing components don't crash under Jest.
- **Alternatives considered**: `@testing-library/react-native` fireEvent gesture simulation —
  too lossy for a threshold/spring interaction to be a meaningful test.

## Outstanding NEEDS CLARIFICATION

None.
