# Phase 0 Research: Activity Level and Weight Goal-Based Calorie Target

There are no open technical unknowns for this feature — it reuses the existing stack entirely
(no new dependencies, no new storage key, no new screen). The items below record the decisions
already reached with the stakeholder during `/speckit-specify`, so they're captured in one place
rather than only inline in `spec.md`.

## 1. Where the new formula lives relative to `bmr.ts`

- **Decision**: New module `lib/calculations/calorieGoal.ts`, exporting `ACTIVITY_MULTIPLIERS`,
  `GOAL_ADJUSTMENTS`, and `calculateDailyCalorieGoal(profile)`. `lib/calculations/bmr.ts` is
  left completely unmodified.
- **Rationale**: `calculateBmr()` already has its own tests and two consumers assuming it
  returns raw BMR (feature 001's Today/Calendar screens, before this feature). Keeping it
  untouched and layering the activity/goal math in a separate pure function avoids any risk of
  regressing feature 001's tested behavior, and matches Constitution Principle IV — a small,
  single-purpose module is easier for a reviewer to verify against FR-005/006/007 than a bigger
  `bmr.ts` doing two things.
- **Alternatives considered**: Extending `calculateBmr()` itself to take activity/goal
  parameters — rejected, it would change that function's existing contract and force updating
  its already-passing tests for no benefit, since the two concerns (raw metabolic rate vs.
  activity-and-goal-adjusted target) are conceptually distinct and each independently testable.

## 2. Activity multiplier values

- **Decision**: Sedentary ×1.2, Routine ×1.375, Moderate ×1.55, High ×1.725.
- **Rationale**: These are exactly the values the stakeholder specified, and they match the
  standard Harris-Benedict/Mifflin activity-factor table used by virtually every TDEE
  calculator, so the app's numbers will match what users expect from other tools.
- **Alternatives considered**: None — given directly, not a choice to make.

## 3. Weight-goal adjustment

- **Decision**: Maintain +0, Lose −500 kcal/day, Gain +500 kcal/day, applied additively after
  the activity multiplier.
- **Rationale**: Confirmed directly with the stakeholder (see `/speckit-specify` conversation)
  as a fixed daily amount rather than a percentage — ±500 kcal/day is also the standard rule of
  thumb for ~0.5 kg/week of weight change, so it doubles as a reasonable, recognizable default.
- **Alternatives considered**: Percentage-of-TDEE adjustment — explicitly rejected by the
  stakeholder in favor of the simpler, fixed-amount rule.

## 4. Legacy-profile default and the numeric-continuity contradiction

- **Decision**: Profiles with no stored `activityLevel`/`goal` are treated as Sedentary +
  Maintain. This is a **real value**, not a distinct "legacy" state — it recalculates such a
  profile's goal once, from raw BMR to `BMR × 1.2`, the first time this feature computes it.
- **Rationale**: The original request asked for two things that turned out to be mutually
  exclusive: (a) using the standard multiplier table where Sedentary = ×1.2, and (b) existing
  users' numbers staying byte-for-byte identical until they edit their profile. Since Sedentary
  is not ×1.0, satisfying both would require inventing an invisible "legacy sedentary" state
  that doesn't correspond to anything a user could ever actually select — which would be more
  complex to build and reason about than just accepting the one-time, more-accurate
  recalculation. This was raised explicitly and confirmed with the stakeholder rather than
  assumed (see spec.md's Edge Cases and Assumptions sections).
- **Alternatives considered**: A hidden internal ×1.0 "legacy" multiplier used only for
  never-edited pre-feature profiles — rejected by the stakeholder as unnecessary complexity for
  a one-time, expected, and arguably desirable change (a more accurate number).

## 5. UI pattern for the two new option groups

- **Decision**: Reuse `ProfileForm.tsx`'s existing Sex-selector pattern (a row of `Pressable`
  "pill" options, `StyleSheet`-styled, selected state via `colors.primary` background) for both
  the 4-option Activity Level group and the 3-option Weight Goal group.
- **Rationale**: Constitution Principle IV — don't introduce a new UI pattern or component when
  an existing one in the same file already solves the identical interaction (single-select from
  a small fixed list). Four options may need to wrap to two rows depending on screen width;
  `flexWrap: "wrap"` on the existing row container handles this without new components.
- **Alternatives considered**: A picker/dropdown (e.g. a modal or native `Picker`) — rejected,
  more complex for only 3-4 options and inconsistent with the existing Sex toggle already on the
  same form.

## Outstanding NEEDS CLARIFICATION

None. All decisions above were confirmed with the stakeholder before this plan was written.
