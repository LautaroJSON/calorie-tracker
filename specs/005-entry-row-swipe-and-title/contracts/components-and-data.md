# Contract: Components, data threading, and app wiring

## Dependency

```bash
npx expo install react-native-gesture-handler
```

Pins `~2.32.0` (Expo SDK 57 bundled version), promoting the existing transitive `3.2.1` to an
explicit, compatible `dependency` in `package.json`. No `expo prebuild`, no dev client.

## `app/_layout.tsx`

Wrap the whole tree in a `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileGateProvider>
        <RootNavigator />
      </ProfileGateProvider>
    </GestureHandlerRootView>
  );
}
```

## Data threading — `title` mirrors `note`

### `lib/types.ts`

`FoodEntry` and `ExerciseEntry` each gain `title?: string;` (next to `note?: string`).

### `lib/storage/dayStorage.ts`

- `EntryInput` gains `title?: string;`.
- `addEntry`: the new entry object gets `title: input.title` (alongside `note: input.note`).
- `updateEntry`: the mapped entry gets `title: input.title` (always written, like `note`).

### `components/EntryForm.tsx`

- `EntryFormValues` gains `title?: string`.
- `EntryFormProps.initialValues` gains `title?: string`.
- New state: `const [title, setTitle] = useState(initialValues?.title ?? "")`.
- New field, rendered **between Calories and Note**:

  ```tsx
  <View style={styles.field}>
    <Text style={typography.label}>Title (optional)</Text>
    <FormTextInput value={title} onChangeText={setTitle} placeholder="e.g. Breakfast" />
  </View>
  ```

- `handleSubmit` passes `title: title.trim() || undefined` in the `onSubmit` payload.
- The Calories input keeps `autoFocus`.

### `app/entry-form.tsx`

On edit, add `title: raw.title` to the `initialValues` object passed to `<EntryForm>`.

### `app/(tabs)/index.tsx` and `app/(tabs)/calendar.tsx`

In `openEntryForm(type, item)`, add `title: item.title ?? ""` to the `params` object (next to
`note: item.note ?? ""`).

### `components/EntryList.tsx`

- `EntryListItem` gains `title?: string`.
- Wrap each row:

  ```tsx
  {items.map((item) => (
    <SwipeableRow
      key={item.id}
      onSwipeLeft={onEdit ? () => onEdit(item) : () => {}}
      onSwipeRight={onDelete ? () => onDelete(item) : () => {}}
    >
      <EntryRow
        type={item.type}
        calories={item.calories}
        title={item.title}
        note={item.note}
        createdAt={item.createdAt}
      />
    </SwipeableRow>
  ))}
  ```

  (`onEdit` / `onDelete` are still passed from the Today / Calendar screens; `EntryRow` no
  longer receives them.)

## `components/EntryRow.tsx`

Presentational, no gesture code. Props per [data-model.md](../data-model.md).

- Root is a `Pressable` toggling `expanded`.
- **Collapsed** (unchanged layout, unchanged height — SC-006):
  - line 1: `{title || (type === "food" ? "Food" : "Exercise")}` in `typography.body`
  - line 2: `formatClockTime(createdAt)` in `typography.caption`
  - right: `{sign}{calories} kcal` (`+` food / `-` exercise, exercise in `colors.success`)
- **Expanded** — below the summary, an indented `Animated.View`
  (`entering={FadeIn.duration(120)}`, `exiting={FadeOut.duration(90)}` from
  `react-native-reanimated`):
  - the **note**, if non-empty, in `colors.textSecondary` (lighter than the title)
  - a meta line: `` `${formatLongDate(localDateOf(createdAt))} · ${formatClockTime(createdAt)}` ``
    in `typography.caption`
- No `Pencil` / `Trash2` buttons, no `actions` view (deleted).
- The row keeps `...shadow.raisedSm`, `colors.surface`, `radius.lg`, `marginBottom`.

## `components/SwipeableRow.tsx` (NEW)

```ts
interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;   // edit
  onSwipeRight: () => void;  // delete (parent runs confirmDestructive)
}
```

- `translateX = useSharedValue(0)`.
- `Gesture.Pan()`
  - `.activeOffsetX([-20, 20])` — claim only clearly-horizontal drags
  - `.failOffsetY([-12, 12])` — yield to vertical list scroll (FR-018)
  - `.onUpdate` → `translateX.value = clamp(e.translationX, -MAX, MAX)`
  - `.onEnd` → if `translateX.value > THRESHOLD` `runOnJS(onSwipeRight)()`; else if
    `translateX.value < -THRESHOLD` `runOnJS(onSwipeLeft)()`; then
    `translateX.value = withSpring(0)`
  - `THRESHOLD` ≈ 96 px (or `0.33 * rowWidth` via `onLayout`); `MAX` a bit larger.
- Behind the row, two absolutely-positioned background layers:
  - **right-drag (delete)**: full-height, `colors.danger`, a `Trash2` (`colors.surface`) pinned
    left; `opacity` / icon `transform: [{ scale }]` =
    `interpolate(translateX, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP)`
  - **left-drag (edit)**: `colors.primary`, a `Pencil` (`colors.surface`) pinned right; same
    idea mirrored for negative `translateX`
- Foreground: `<Animated.View style={[{ transform: [{ translateX }] }, ...]}>{children}</Animated.View>`
  wrapped in `<GestureDetector gesture={pan}>`.
- `StyleSheet` + `lib/theme` only.

## `jest.setup.js`

Add at the top:

```js
import "react-native-gesture-handler/jestSetup";
```

(so `EntryList` / `SwipeableRow` imports don't throw under Jest). RNTL's existing async API is
unchanged.

## Regression guarantees

- `EntryList` ordering (`createdAt.localeCompare`, ascending) — unchanged (FR-022).
- The `entry-form` screen, day-context header, and time picker (feature 003) — only gain the
  Title field; the Calories/Note/Time flow is untouched.
- Today / Calendar screens — only `openEntryForm` gains a `title` param; the water tracker
  (feature 004) and calorie ring are untouched.
- History chart — not touched.
- `confirmDestructive` still guards deletion (FR-020).
