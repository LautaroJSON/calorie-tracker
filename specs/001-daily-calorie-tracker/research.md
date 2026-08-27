# Phase 0 Research: Daily Calorie Tracker

## 1. Expo SDK / TypeScript baseline

- **Decision**: Bootstrap with the latest stable Expo SDK via `npx create-expo-app@latest --template` (TypeScript template), using `expo-router` as the default navigator. Pin the exact SDK/RN/TypeScript versions in `package.json` at bootstrap time rather than hardcoding a version number in project docs.
- **Rationale**: Expo SDK releases roughly every few months and each SDK version pins a compatible React Native + Expo Go version; hardcoding a specific number in planning docs would go stale. "Latest stable at bootstrap" is the reasonable, low-risk default and keeps the app on a version Expo Go can actually run (Constitution Principle II).
- **Alternatives considered**: Bare React Native CLI workflow — rejected outright, it does not run in Expo Go and requires native builds, violating Principle II.

## 2. Navigation: expo-router

- **Decision**: Use `expo-router`'s file-based routing with a root stack (`app/_layout.tsx`) that gates on profile existence (redirect to `app/onboarding.tsx` when no profile is stored), a `(tabs)` group for Today / Calendar / History, and modal-style stack routes for `settings.tsx` and `entry-form.tsx`.
- **Rationale**: `expo-router` is Expo's first-party navigation solution, ships already integrated with Expo Go (built on `react-native-screens` and `react-native-safe-area-context`, both bundled in the Expo Go client), and file-based routes keep the project structure simple and readable — matching Constitution Principle IV.
- **Alternatives considered**: `@react-navigation/native` configured manually — functionally equivalent but more boilerplate for the same result; `expo-router` is built on top of it anyway, so there is no capability lost by preferring the file-based API.

## 3. Persistence: AsyncStorage key/value shape

- **Decision**: Two key patterns in a single `AsyncStorage` namespace:
  - `"profile"` → JSON-serialized `UserProfile` (single record, overwritten on edit).
  - `"day:YYYY-MM-DD"` → JSON-serialized `DayLog` for that calendar date, containing both its food and exercise entries in one object.
  A day that has never been written simply has no key; reading it returns an empty `DayLog` shape (see [data-model.md](./data-model.md)).
- **Rationale**: This matches the plain key/value model `AsyncStorage` actually provides (no query language, no indexes), keeps each read/write scoped to exactly the data a screen needs (one profile read, one day read), and needs no migration framework given the small, flat schema. It also directly satisfies FR-021 ("group entries by calendar day … each day starts at zero") for free: an unwritten day-key *is* zero.
- **Alternatives considered**: A single `"entries"` key holding an array of all entries ever created — rejected because every write would require reading, filtering, and rewriting the entire history, growing unboundedly slower as history accumulates; per-day keys keep every operation O(one day's entries).

## 4. Icons: lucide-react-native + react-native-svg

- **Decision**: Use `lucide-react-native` for all iconography (profile icon, floating "+" button icon, edit/delete affordances), which requires `react-native-svg` as its rendering backend.
- **Rationale**: Both packages are pure-JS/TS on top of a native SVG renderer that is one of the modules precompiled into the standard Expo Go client, so no dev client or `expo prebuild` step is needed — satisfies Constitution Principle II. `lucide-react-native` also ships fully typed icon components, satisfying Principle V.
- **Alternatives considered**: `@expo/vector-icons` (bundled with Expo, zero extra install) — a reasonable alternative, but the user's stack explicitly specifies `lucide-react-native`; both are Expo Go-safe, so the user's choice is followed as given.

## 5. Circular progress indicator

- **Decision**: `react-native-circular-progress-indicator` for the Today screen's goal ring, driven purely by props (`value`, `maxValue`, and a color derived from the pure `netCalories` calculation's over/under-goal result) — the component holds no business logic itself.
- **Rationale**: It is a thin SVG-based component (again backed by `react-native-svg`), so it is Expo Go-compatible, and keeping it prop-driven keeps the over-goal color/message logic inside the pure calculation layer rather than duplicated in the component, per Principle IV.
- **Alternatives considered**: Hand-rolled SVG ring — more code for identical behavior with no portfolio-visibility benefit; rejected in favor of the specified library.

## 6. Calendar: react-native-calendars

- **Decision**: Use `react-native-calendars`' `Calendar` component with a `markedDates` map built each render from two independent sources: today's ISO date always gets a "today" marker style (e.g. an outlined dot/border), and the currently-selected ISO date always gets a "selected" marker style (e.g. filled background) — applied as two composable style layers on the same date object so that when today and the selection are the same date, **both** styles are visibly present at once (FR-019, Edge Case in spec: "must be distinguishable even if they are the same day").
- **Rationale**: `markedDates` supports multiple simultaneous marking "dot"/period entries per date out of the box, which is exactly the mechanism needed to show two independent facts (is-today, is-selected) about one date without custom calendar rendering. The library is pure JS/React Native views — no native module — so it is unconditionally Expo Go-compatible.
- **Alternatives considered**: Custom-built calendar grid — far more code for a well-solved, already-specified problem; rejected per Principle IV (avoid reinventing what a library already does cleanly).

## 7. Line chart: react-native-gifted-charts (Expo Go compatibility risk)

- **Decision**: Use `react-native-gifted-charts`'s `LineChart` in its plain-line mode (no `areaChart`/gradient-fill props), and install `expo-linear-gradient` (not `react-native-linear-gradient`) as a plain dependency alongside it.
- **Rationale**: The original plan here was to avoid installing any gradient package at all, on the assumption that `react-native-linear-gradient` was only needed by `LineChart`'s optional gradient/area-fill props. That assumption was **wrong** and was caught at runtime (`npx expo start` threw `Gradient package was not found...`): `react-native-gifted-charts`'s package entry point eagerly loads its `BarChart` internals too — regardless of which chart component is actually imported — and one of those internal modules (`Components/common/LinearGradient.js`) unconditionally does `require('react-native-linear-gradient')`, falling back to `require('expo-linear-gradient')`, and throwing if neither resolves. So some gradient package is unavoidable simply by importing anything from this library, even `LineChart` alone. The fix is to satisfy that fallback with **`expo-linear-gradient`** — the official Expo SDK package, which (unlike the third-party `react-native-linear-gradient`) *is* bundled into the standard Expo Go client, so this still fully satisfies Constitution Principle II. We never call `expo-linear-gradient` directly ourselves; it exists solely so `react-native-gifted-charts`'s internal fallback `require` succeeds.
- **Alternatives considered**: `victory-native` — also viable and Expo Go-safe, but not what the user specified. `react-native-linear-gradient` — rejected, it is a third-party native module not bundled in Expo Go and would force a custom dev client.
- **Lesson**: static code review of a library's conditional/try-catch requires is not a substitute for actually bundling/running the app — this was verified after the fact via `npx expo export`, which now succeeds, and should have been the verification method from the start rather than reading source alone.

## 8. Loading/placeholder states

- **Decision**: A small `LoadingPlaceholder` component using React Native's built-in `ActivityIndicator` for short waits (initial `AsyncStorage` read on app boot) and the built-in `Animated` API (looping `opacity` interpolation) for skeleton-row placeholders while a day's entries are being read.
- **Rationale**: Both are core React Native APIs with zero extra dependencies, directly matching the user's explicit instruction to avoid additional loading-state libraries and Constitution Principle II/III (no new native modules, no styling libraries).
- **Alternatives considered**: A skeleton-loading library (e.g. `react-native-skeleton-placeholder` style packages) — rejected as unnecessary given `Animated` alone covers the need.

## 9. Pure calculation layer

- **Decision**: `lib/calculations/bmr.ts` exports a single pure function `calculateBmr(profile: UserProfile): number` implementing the two Harris-Benedict branches; `lib/calculations/netCalories.ts` exports pure functions for summing a `DayLog`'s food/exercise totals, computing the zero-floored net value plus any uncompensated exercise excess, and determining goal-overage state/amount. Neither module imports any React Native or UI code, and both are covered by `jest` unit tests under `__tests__/`.
- **Rationale**: Directly satisfies the user's explicit requirement that all TMB/net-calorie/non-negative-validation logic "live in pure functions separate from UI components, so they're testable in isolation," and gives the portfolio a clean, reviewable demonstration of separating business logic from presentation (Constitution Principle IV).
- **Alternatives considered**: Computing these values inline inside screen components — rejected, it would make the core business rules untestable without rendering UI and would violate the user's explicit instruction.

## Outstanding NEEDS CLARIFICATION

None. All Technical Context unknowns above were resolved with a decision, rationale, and considered alternative.
