# Contract: AsyncStorage Schema (delta from feature 001)

This extends [../001-daily-calorie-tracker/contracts/storage-schema.md](../../001-daily-calorie-tracker/contracts/storage-schema.md)'s
`"profile"` key. No other key changes.

## Key: `"profile"` (updated shape)

```json
{
  "weightKg": 70,
  "heightCm": 175,
  "age": 30,
  "sex": "male",
  "activityLevel": "moderate",
  "goal": "lose",
  "updatedAt": "2026-08-26T12:00:00.000Z"
}
```

- **Written by**: `lib/storage/profileStorage.ts` → `saveProfile(profile: UserProfile)` —
  unchanged function signature/behavior; `UserProfile` itself now includes `activityLevel` and
  `goal`, so any save from the (now-extended) profile form persists them. Still a full
  overwrite of the single key, exactly as in feature 001.
- **Read by**: `profileStorage.ts` → `loadProfile(): Promise<UserProfile | null>` — **behavior
  change**: when the parsed JSON is missing `activityLevel` and/or `goal` (data written before
  this feature existed), those fields are defaulted to `"sedentary"` and `"maintain"`
  respectively before the value is returned. This is a read-time default only; the stored JSON
  itself is not rewritten until the next explicit `saveProfile()` call.
- **Absent-key behavior**: unchanged from feature 001 — `loadProfile()` still returns `null`
  when the `"profile"` key itself doesn't exist (no profile at all yet), which still routes to
  onboarding.

## Consumers (delta)

| Screen / Component | Change |
|---|---|
| `components/ProfileForm.tsx` | Now collects and returns `activityLevel`/`goal` in its submitted values (both `app/onboarding.tsx` and `app/settings.tsx` already spread the form's return value into `saveProfile()` unchanged) |
| `app/(tabs)/index.tsx`, `app/(tabs)/calendar.tsx` | Now call `calculateDailyCalorieGoal(profile)` instead of `calculateBmr(profile)` for the value shown as the goal |
