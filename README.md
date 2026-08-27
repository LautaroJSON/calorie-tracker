# Calorie Tracker

A small, self-contained daily calorie tracker built with React Native and Expo. It runs
entirely on-device — no backend, no account, no network — and is designed to be reviewable by
opening it in Expo Go with a single command.

## Features

- **Profile-based daily target** — enter weight, height, age, sex, activity level and weight
  goal; the app computes a daily calorie goal (BMR × activity multiplier ± goal adjustment).
- **Log food and exercise** — quick entry form with calories, an optional note, and an optional
  12-hour time (hour / minute / AM–PM), defaulting to now.
- **Today view** — a calorie ring showing net calories against the daily goal.
- **Calendar** — pick any past day and review or edit its entries.
- **History** — a net-calories chart across logged days.
- All data persists locally via `AsyncStorage`.

## Tech

- Expo (managed workflow) + Expo Router
- TypeScript throughout
- React Native `StyleSheet` only (a claymorphism-inspired theme in `lib/theme.ts`) — no styling
  libraries
- Pure, unit-tested logic in `lib/calculations` and `lib/datetime` (Jest / `jest-expo`)

## Running locally

```bash
npm install
npx expo start
```

Then open the project in **Expo Go** (scan the QR code) or press `w` for the web preview.

## Tests / checks

```bash
npm test            # jest
npx tsc --noEmit    # type-check
npx expo lint       # lint
```

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
