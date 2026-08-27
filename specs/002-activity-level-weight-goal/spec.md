# Feature Specification: Activity Level and Weight Goal-Based Calorie Target

**Feature Branch**: `002-activity-level-weight-goal`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "Agregar nivel de actividad física y objetivo de peso al perfil del usuario, para calcular un objetivo calórico diario más preciso (TDEE ajustado) en lugar de usar solo el BMR (que asume sedentarismo y mantenimiento). Durante el formulario de perfil (onboarding y configuración), además de peso/altura/edad/sexo, preguntar nivel de actividad física (Sedentario, Rutinaria, Moderada, Alta) y objetivo de peso (Mantener, Bajar, Subir). El objetivo calórico diario pasa a ser BMR × multiplicador de actividad (1.2 / 1.375 / 1.55 / 1.725) ajustado por objetivo (+0 / −500 / +500 kcal). Los perfiles ya existentes sin estos campos deben interpretarse como Sedentario + Mantener por defecto. Es una extensión del feature 001-daily-calorie-tracker: no agrega pantallas nuevas, extiende el formulario de perfil y el cálculo del objetivo diario ya mostrado en Today y Calendar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Activity Level and Weight Goal During Onboarding (Priority: P1)

A new user completing the initial profile setup also selects their physical activity level and
their weight goal, so the daily calorie target they see from day one reflects their real energy
needs and intent, not just their resting metabolic rate.

**Why this priority**: This is the first and most common path to getting a correct calorie
target — every new user goes through onboarding, and an inaccurate target (sedentary/maintenance
only) undermines the app's core value from the very first use.

**Independent Test**: Can be fully tested by completing onboarding on a fresh install, selecting
an activity level and a weight goal, and verifying the daily calorie goal shown afterward equals
BMR × the selected activity multiplier, adjusted by the selected goal's fixed amount.

**Acceptance Scenarios**:

1. **Given** a new user on the onboarding form, **When** they reach the activity and goal
   questions, **Then** they see exactly four activity-level options (Sedentary, Routine,
   Moderate, High) and exactly three weight-goal options (Maintain, Lose, Gain).
2. **Given** a user has entered weight/height/age/sex and selected "Moderate" activity and
   "Lose" goal, **When** they submit the form, **Then** the daily calorie goal shown is
   `(BMR × 1.55) − 500`.
3. **Given** a user selects "Sedentary" activity and "Maintain" goal, **When** they submit,
   **Then** the daily calorie goal shown is `(BMR × 1.2) + 0` — note this is higher than raw
   BMR alone, since even "Sedentary" activity is not zero activity.
4. **Given** a user has not selected an activity level or a weight goal, **When** they try to
   submit the form, **Then** submission is blocked until both are selected.

---

### User Story 2 - Update Activity Level and Weight Goal Later (Priority: P2)

A user whose activity habits or weight goal change — or who completed onboarding before this
capability existed — updates their activity level and/or weight goal from the settings screen,
and their daily calorie goal recalculates immediately.

**Why this priority**: Valuable for keeping the target accurate over time, but the app already
delivers the core corrected-target value via User Story 1 without it.

**Independent Test**: Can be fully tested by opening settings for an existing profile, changing
the activity level and/or weight goal, saving, and confirming the daily calorie goal shown on
the Today and Calendar screens updates to match the new selection.

**Acceptance Scenarios**:

1. **Given** a profile that was created before this capability existed (no stored activity
   level or weight goal), **When** the user opens settings, **Then** the activity level shows
   as "Sedentary" and the weight goal shows as "Maintain" — reflecting that their daily goal
   already recalculated, one time, to `BMR × 1.2` the moment this feature started computing it
   (see Edge Cases).
2. **Given** the user changes their activity level from "Sedentary" to "High" and keeps
   "Maintain" as their goal, **When** they save, **Then** the daily calorie goal shown
   afterward equals `BMR × 1.725`.
3. **Given** the user changes their weight goal to "Gain", **When** they save, **Then** the
   daily calorie goal increases by exactly 500 kcal relative to the same activity level with
   "Maintain".

---

### Edge Cases

- What happens when a profile saved before this feature existed is loaded (no activity level or
  weight goal stored)? It MUST be treated as "Sedentary" activity and "Maintain" goal. This
  causes a **one-time** recalculation from raw BMR to `BMR × 1.2` the first time the goal is
  computed under this feature — an intentional, expected change reflecting the more accurate
  formula (this was explicitly confirmed with the stakeholder: numeric continuity with the old
  raw-BMR value was *not* required, only that the profile's fields default sensibly). No further
  change occurs after that unless the user edits their profile.
- What happens if the user changes activity level and/or weight goal multiple times before ever
  logging a food or exercise entry? Only the most recently saved selection is used; no history of
  past selections is kept, consistent with how the rest of the profile already behaves.
- Does this change how net calories consumed (food minus exercise) are calculated? No — this
  feature only changes how the daily *target* is derived from the profile; the net-calories
  calculation from feature 001 is unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profile form MUST ask the user to select their physical activity level from
  exactly four options: Sedentary, Routine, Moderate, High.
- **FR-002**: The profile form MUST ask the user to select their weight goal from exactly three
  options: Maintain, Lose, Gain.
- **FR-003**: Both the activity level and weight goal questions MUST appear in both the initial
  onboarding profile form and the settings/edit-profile form.
- **FR-004**: The profile form MUST require both an activity level and a weight goal to be
  selected before it can be submitted.
- **FR-005**: System MUST calculate the daily calorie goal as the user's BMR multiplied by an
  activity multiplier determined by their selected activity level, then adjusted by a fixed
  amount determined by their selected weight goal.
- **FR-006**: The activity multipliers MUST be: Sedentary ×1.2, Routine ×1.375, Moderate ×1.55,
  High ×1.725.
- **FR-007**: The weight-goal adjustment MUST be applied after the activity multiplier: Maintain
  +0 kcal/day, Lose −500 kcal/day, Gain +500 kcal/day.
- **FR-008**: For any profile that does not have a stored activity level or weight goal (i.e.,
  saved before this capability existed), the system MUST treat it as Sedentary activity and
  Maintain goal when computing the daily calorie goal. This intentionally recalculates such a
  profile's daily goal, once, from raw BMR to `BMR × 1.2` — the goal continues to use this
  default combination until the user explicitly updates their profile.
- **FR-009**: Users MUST be able to change their activity level and weight goal at any time from
  the settings screen, with the daily calorie goal recalculating immediately upon saving.

### Key Entities

- **User Profile (extended)**: The existing per-device profile (feature 001) gains two new
  attributes — **Activity Level** (one of: Sedentary, Routine, Moderate, High) and **Weight
  Goal** (one of: Maintain, Lose, Gain) — alongside its existing weight/height/age/sex. Both are
  required for any profile created from this point forward; a profile created before this
  feature existed is treated as if it had Activity Level = Sedentary and Weight Goal = Maintain.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete the extended profile form, including the activity and goal
  questions, in under 90 seconds.
- **SC-002**: The displayed daily calorie goal is correct for all 12 combinations of activity
  level (4) and weight goal (3).
- **SC-003**: A user whose profile was created before this feature existed sees their daily
  calorie goal recalculate exactly once (from raw BMR to `BMR × 1.2`, the Sedentary/Maintain
  default) when this feature starts computing it, and no further change occurs until they
  explicitly edit their profile.
- **SC-004**: After changing activity level and/or weight goal in settings, the updated daily
  calorie goal is visible with no perceptible delay upon returning to the Today or Calendar
  screen.

## Assumptions

- "Moderate" (activity 3 times per week) and "High" (activity 5+ times per week) describe weekly
  exercise frequency, confirmed directly with the stakeholder, not multiple times within a
  single day.
- The four activity multipliers and the fixed ±500 kcal/day weight-goal adjustment were
  explicitly specified by the stakeholder rather than left to a default.
- Only one activity level and one weight goal can be selected at a time; there is no support for
  partial/blended activity levels or percentage-based goal adjustments.
- This feature does not introduce any new screens; it extends the existing onboarding form,
  settings form, and the daily-goal calculation already surfaced on the Today and Calendar
  screens from feature 001.
- Numeric continuity with the pre-feature raw-BMR value was explicitly **not** required for
  existing profiles — the stakeholder confirmed a one-time recalculation to the accurate
  Sedentary/Maintain formula (`BMR × 1.2`) is the desired behavior, in favor of avoiding a
  hidden "legacy" state that doesn't correspond to any real, selectable combination.
