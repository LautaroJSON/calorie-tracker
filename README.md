# Calorie Tracker

A small, self-contained daily calorie tracker built with React Native and Expo. It runs
entirely on-device — no backend, no account, no network — and is designed to be reviewable by
opening it in Expo Go with a single command.

## Features

- **Profile-based daily target** — enter weight, height, age, sex, activity level and weight
  goal; the app computes a daily calorie goal (BMR × activity multiplier ± goal adjustment).
- **Log food and exercise** — quick entry form with calories, an optional title, an optional
  note, and an optional 12-hour time (hour / minute / AM–PM), defaulting to now.
- **Entry list** — tap a row to expand it (note, date, AM/PM time); swipe a row right to
  delete, left to edit.
- **Today view** — a calorie ring showing net calories against the daily goal.
- **Optional water tracker** — turn on a "water counter" in the profile, set a daily goal in
  millilitres (default 2000), and log intake in 50 ml taps from a vertical gauge beside the
  calorie ring on the Today and Calendar screens.
- **Calendar** — pick any past day and review or edit its entries.
- **History** — a net-calories chart across logged days.
- All data persists locally via `AsyncStorage`.

## Tech

- Expo (managed workflow) + Expo Router
- TypeScript throughout
- React Native `StyleSheet` only (a claymorphism-inspired theme in `lib/theme.ts`) — no styling
  libraries
- Pure, unit-tested logic in `lib/calculations` and `lib/datetime`, plus component and
  storage-integration tests with React Native Testing Library (Jest / `jest-expo`)

## Running locally

```bash
npm install
npx expo start
```

Then open the project in **Expo Go** (scan the QR code) or press `w` for the web preview.

## Tests / checks

```bash
npm test            # jest — pure logic, component render, and storage-integration tests
npx tsc --noEmit    # type-check
npx expo lint       # lint
```

Component/integration tests live in `components/__tests__/` and `__tests__/integration/`; they
render components with [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
against an in-memory `AsyncStorage` mock (`jest.setup.js`). The v14 API is async — use
`await render(...)` / `await fireEvent.press(...)`.

## Building an Android APK

APKs are built with [EAS Build](https://docs.expo.dev/build/introduction/) (`eas.json`,
`preview` profile) and published to this repo's **Releases**.

One-time setup:

1. Create a free Expo account and an access token (Expo dashboard → Account settings → Access
   tokens).
2. Add it as a repo secret named `EXPO_TOKEN` (Settings → Secrets and variables → Actions).
3. Link the project once and commit the generated `projectId`:
   ```bash
   npx eas-cli login
   npx eas-cli init
   ```

Then cut a release by pushing a tag (CI builds the APK and attaches it to the GitHub Release):

```bash
git tag v1.0.0
git push origin v1.0.0
```

To build locally instead: `npx eas-cli build -p android --profile preview`.

## Project layout

```
app/                 Expo Router screens (tabs: Today / Calendar / History, plus entry form, settings, onboarding)
components/           Reusable UI (CalorieRing, EntryForm, Select, DayCalendar, …)
lib/
  calculations/      BMR, daily-goal and net-calorie math (pure, tested)
  datetime.ts        Date/time formatting and 12-hour clock helpers (pure, tested)
  storage/           AsyncStorage read/write for profile and day logs
  theme.ts           Design tokens
specs/               Feature specifications, plans and tasks (Spec Kit)
```

## Design constraints

This is a portfolio project. It deliberately avoids a backend, custom native code, and
CSS-in-JS / utility-class styling — see [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
for the full rationale.
