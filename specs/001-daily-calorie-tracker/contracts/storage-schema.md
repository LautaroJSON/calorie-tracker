# Contract: AsyncStorage Schema

This app has no network API; the persistence layer (`lib/storage/*`) is the interface
between the UI and the data it depends on, so its `AsyncStorage` key/value contract is
documented here in place of a REST/RPC contract.

## Key: `"profile"`

- **Written by**: `lib/storage/profileStorage.ts` → `saveProfile(profile: UserProfile)`
- **Read by**: `profileStorage.ts` → `loadProfile(): Promise<UserProfile | null>`
- **Value shape** (JSON-serialized `UserProfile`, see [data-model.md](../data-model.md)):

```json
{
  "weightKg": 70,
  "heightCm": 175,
  "age": 30,
  "sex": "male",
  "updatedAt": "2026-08-26T12:00:00.000Z"
}
```

- **Absent-key behavior**: `loadProfile()` returns `null`. The root layout (`app/_layout.tsx`)
  treats `null` as "profile not yet set" and redirects to `app/onboarding.tsx` (FR-003).
- **Write behavior**: Always a full overwrite of the single key — no partial updates, no
  history of previous profiles is kept (matches the spec's Assumption that goals are always
  derived from the *current* profile).

## Key: `"day:YYYY-MM-DD"`

- **Key builder**: `lib/storage/keys.ts` → `dayKey(date: string): string` returns
  `` `day:${date}` `` where `date` is the device-local calendar date in `YYYY-MM-DD` form.
- **Written by**: `lib/storage/dayStorage.ts` → `saveDayLog(date: string, log: DayLog)`
- **Read by**: `dayStorage.ts` → `loadDayLog(date: string): Promise<DayLog>`
- **Value shape** (JSON-serialized `DayLog`, see [data-model.md](../data-model.md)):

```json
{
  "date": "2026-08-26",
  "foodEntries": [
    { "id": "3f6a...", "calories": 500, "note": "Lunch", "createdAt": "2026-08-26T13:05:00.000Z" }
  ],
  "exerciseEntries": [
    { "id": "9c1b...", "calories": 200, "note": "Run", "createdAt": "2026-08-26T18:30:00.000Z" }
  ]
}
```

- **Absent-key behavior**: `loadDayLog(date)` returns an empty `DayLog` —
  `{ date, foodEntries: [], exerciseEntries: [] }` — rather than `null`. This directly
  implements FR-021 ("each calendar day not previously logged starts with zero entries and
  zero net calories") without any explicit "create day" step.
- **Write behavior**: Always a full overwrite of that single day's key with the entire
  updated `DayLog` (read-modify-write for add/edit/delete of one entry). No other day's key
  is ever touched by an operation on a given day, guaranteeing the isolation required by
  User Story 4.

## Consumers

| Screen / Component | Reads | Writes |
|---|---|---|
| `app/_layout.tsx` | `"profile"` | — |
| `app/onboarding.tsx` | — | `"profile"` |
| `app/settings.tsx` | `"profile"` | `"profile"` |
| `app/(tabs)/index.tsx` (Today) | `"day:<today>"` | via `entry-form.tsx` |
| `app/(tabs)/calendar.tsx` | `"day:<selected date>"` | via `entry-form.tsx` |
| `app/(tabs)/history.tsx` | every `"day:*"` key in range (Assumption: earliest logged day → today) | — |
| `app/entry-form.tsx` | `"day:<target date>"` | `"day:<target date>"` |

`history.tsx` is the one consumer that needs to enumerate day-keys rather than read a
single known key; it does so via `AsyncStorage.getAllKeys()` filtered to the `"day:"`
prefix, then `AsyncStorage.multiGet` for the matched keys — both standard `AsyncStorage`
APIs, no additional dependency required.
