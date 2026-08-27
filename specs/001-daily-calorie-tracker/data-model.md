# Phase 1 Data Model: Daily Calorie Tracker

Derived from the spec's Key Entities section and Functional Requirements. All types are
plain, serializable TypeScript interfaces stored as JSON in `AsyncStorage` — see
[contracts/storage-schema.md](./contracts/storage-schema.md) for exactly how they map to keys.

## UserProfile

The single per-device profile. Exactly one instance exists once onboarding (User Story 1)
completes; it is edited in place (User Story 5), never deleted.

| Field | Type | Validation | Notes |
|---|---|---|---|
| `weightKg` | `number` | `> 0` (FR-004) | Entered on onboarding/settings |
| `heightCm` | `number` | `> 0` (FR-004) | |
| `age` | `number` | `> 0`, integer (FR-004) | |
| `sex` | `"male" \| "female"` | one of the two values | Selects which Harris-Benedict branch applies (FR-005); see Assumptions in spec.md |
| `updatedAt` | `string` (ISO 8601) | — | Set on every save; not user-facing, aids debugging |

**Derived value (not stored)**: `dailyGoal = calculateBmr(profile)` — always computed live
from the current profile, per the spec's Assumption that goals are not historically
snapshotted per day.

## DayLog

One per calendar date (`YYYY-MM-DD`, device-local time). Represents FR-021's "each calendar
day starts at zero" rule: a date with no corresponding stored key *is* an empty `DayLog`
with no entries — nothing is pre-created.

| Field | Type | Validation | Notes |
|---|---|---|---|
| `date` | `string` (`YYYY-MM-DD`) | matches the storage key's date suffix | Redundant with the key, kept for convenience when the object is passed around detached from its key |
| `foodEntries` | `FoodEntry[]` | — | Empty array if none logged |
| `exerciseEntries` | `ExerciseEntry[]` | — | Empty array if none logged |

**Derived values (not stored, computed by `lib/calculations/netCalories.ts`)**:
- `totalFoodCalories` = sum of `foodEntries[].calories`
- `totalExerciseCalories` = sum of `exerciseEntries[].calories`
- `netCalories` = `max(0, totalFoodCalories - totalExerciseCalories)` (FR-015, FR-016)
- `uncompensatedExcess` = `max(0, totalExerciseCalories - totalFoodCalories)` — the value
  shown in parentheses, e.g. `0 (-150)`, only rendered when `> 0` (FR-016)
- `isOverGoal` / `overageAmount` = whether/by how much `netCalories` (pre-floor, i.e. the
  raw food-minus-exercise value) exceeds the profile's `dailyGoal` (FR-017); exactly equal
  to the goal is **not** an overage (spec Edge Cases)

## FoodEntry

A single logged instance of calories consumed. Belongs to exactly one `DayLog` via that
day's `foodEntries` array.

| Field | Type | Validation | Notes |
|---|---|---|---|
| `id` | `string` (UUID) | unique within the day | Generated on creation, used for edit/delete targeting |
| `calories` | `number` | `> 0`, integer (FR-008) | Required |
| `note` | `string \| undefined` | optional, free text | FR-008 |
| `createdAt` | `string` (ISO 8601 timestamp) | set once, at creation | Not user-editable (spec Assumption); displayed as the entry's "time" (FR-011) |

## ExerciseEntry

A single logged instance of calories burned. Belongs to exactly one `DayLog` via that
day's `exerciseEntries` array. Identical shape to `FoodEntry`.

| Field | Type | Validation | Notes |
|---|---|---|---|
| `id` | `string` (UUID) | unique within the day | |
| `calories` | `number` | `> 0`, integer (FR-009) | Required — the amount burned |
| `note` | `string \| undefined` | optional, free text | FR-009 |
| `createdAt` | `string` (ISO 8601 timestamp) | set once, at creation | Not user-editable |

## Relationships

```text
UserProfile (1)            — standalone, not related to DayLog/entries

DayLog (1) ── date key ──> foodEntries: FoodEntry[]      (0..n)
                       └──> exerciseEntries: ExerciseEntry[]  (0..n)
```

There is no cross-day relationship: each `DayLog` is fully independent, matching FR-021 and
User Story 4's requirement that editing a past day never affects another day's totals.

## State Transitions

- **UserProfile**: `absent` → `set` (onboarding, User Story 1) → `set` (edited any number of
  times via settings, User Story 5). Never returns to `absent`.
- **DayLog**: `absent` (implicit empty) → `has entries` once the first `FoodEntry` or
  `ExerciseEntry` is added. Entries within it are added / edited / deleted independently
  (User Story 3); the `DayLog` itself is never explicitly deleted, only emptied.
