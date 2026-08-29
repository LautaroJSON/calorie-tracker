# Feature Specification: Optional Daily Water Intake Tracker

**Feature Branch**: `004-water-intake-tracker`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "vamos a agregar un medidor de agua para que el usuario pueda contabilizar y llevar un control de cuanta agua tomo en el dia. el agua se mide en mililitros. este sera un campo opcional que se puede agregar en 1) en el boardin 2) dentro de settings. se activa con un switch (contador de agua on/off) si esta \"on\" se despliega un input preguntando los mililitos de meta. (por defecto deja 2 litros de agua). se puede agregar o disminuir la cantidad de agua consumido con un icono de flecha arriba y abajo el cual agrega 50ml de agua. esta se representara visualmente con una barra vertical al lado del contador de calorias (crear un componente/div padre en (tabs)/index.tsx que envuelva CalorieRing y el nuevo componente de contador de agua. se adjunta voceto de como deberia verse el componente."

## Clarifications

### Session 2026-08-29

- Q: Water data — is it Today-only or also stored/shown elsewhere? → A: It is stored per day and, when tracking is enabled, the water component is shown on both the Today screen and the Calendar (day record) screen. When tracking is off it is not shown anywhere; the stored data remains.
- Q: The Settings "water counter" control — what is it? → A: A new labeled on/off switch ("Water counter") in the profile form. Default off. On → water component appears on Today and Calendar; off → hidden.
- Q: If tracking was on, water was logged, then it is turned off — what happens to the data? → A: The component is simply not rendered; the stored per-day water amounts and the saved goal are kept (no deletion, no confirmation prompt).
- Q: Below the "current / goal" label, what else is shown? → A: A water-glass icon, displayed beneath the label.
- Q: On the Calendar screen (past days), is the water counter editable with the ↑↓ arrows or read-only? → A: Editable — the ±50 ml arrows adjust the selected day, consistent with how food/exercise entries are edited on the Calendar screen.
- Q: Does the "water counter" switch appear in onboarding, or only in Settings? → A: Both — it is in the shared profile form used by onboarding and by Settings.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Track Water Consumed Today (Priority: P1)

A user who has enabled water tracking opens the Today screen and sees a vertical bar next to the
calorie ring showing how much water they have drunk so far today against their daily goal. Each
time they drink, they tap the up arrow to add 50 ml; if they tapped too many times, the down
arrow removes 50 ml. The bar fills as they get closer to their goal, and beneath the bar a label
shows the current amount and the goal with a water-glass icon under it.

**Why this priority**: This is the core value of the feature — without the ability to record and
see today's water intake, nothing else matters. It is the daily, repeated interaction.

**Independent Test**: Enable water tracking with a goal (default 2000 ml), open the Today
screen, tap the up arrow several times and the down arrow once or twice, and confirm the
displayed amount changes by exactly 50 ml per tap, the bar fill reflects amount ÷ goal, and the
value persists after leaving and returning to the screen.

**Acceptance Scenarios**:

1. **Given** water tracking is enabled with a 2000 ml goal and 0 ml consumed today, **When** the
   user taps the up arrow once, **Then** the displayed amount becomes 50 ml and the vertical bar
   fills to 2.5% of its height.
2. **Given** 200 ml consumed today, **When** the user taps the down arrow once, **Then** the
   displayed amount becomes 150 ml.
3. **Given** 0 ml consumed today, **When** the user taps the down arrow, **Then** the amount
   stays at 0 ml (it never goes negative).
4. **Given** 1950 ml consumed against a 2000 ml goal, **When** the user taps the up arrow once,
   **Then** the amount becomes 2000 ml and the bar shows completely full.
5. **Given** 2000 ml consumed against a 2000 ml goal, **When** the user taps the up arrow again,
   **Then** the amount becomes 2050 ml, the label reflects 2050 ml, and the bar remains
   completely full (it does not overflow).
6. **Given** the user has added water today, **When** they navigate away from the Today screen
   and return, **Then** the same amount is still shown.
7. **Given** the user added water yesterday, **When** they open the app on a new day, **Then**
   today's water amount starts at 0 ml (yesterday's total is not carried over).
8. **Given** water tracking is enabled, **When** the user views the Today screen, **Then** the
   calorie ring and the water component appear side by side within a single grouping, with the
   water bar to the right of the ring, the up/down arrows to the right of the bar, the
   "current / goal" label beneath the bar, and a water-glass icon beneath the label.

---

### User Story 2 - Enable Water Tracking During Onboarding (Priority: P2)

A new user setting up their profile for the first time sees an optional "Water counter" switch.
If they turn it on, an input appears asking for their daily water goal in milliliters,
pre-filled with 2000 ml (2 liters), which they can change. If they leave it off, the app behaves
exactly as before with no water UI anywhere.

**Why this priority**: Onboarding is the primary place users opt in, but the feature can also be
enabled later from settings (User Story 3), so this is not the only path in.

**Independent Test**: On a fresh install, reach the onboarding profile form, turn the Water
counter switch on, confirm the goal input appears pre-filled with 2000, change it to a custom
value, finish onboarding, and confirm the Today screen shows the water component with that goal.

**Acceptance Scenarios**:

1. **Given** the onboarding profile form, **When** the user views it, **Then** a "Water counter"
   switch is present and is off by default.
2. **Given** the Water counter switch is off, **When** the user looks at the form, **Then** no
   water-goal input is shown.
3. **Given** the user turns the Water counter switch on, **When** the switch toggles, **Then** a
   water-goal input appears, pre-filled with 2000 ml.
4. **Given** the Water counter switch is on and the goal input shows 2000, **When** the user
   changes it to 2500 and completes onboarding, **Then** the Today screen shows the water
   component with a 2500 ml goal.
5. **Given** the user completes onboarding with the Water counter switch off, **When** they open
   the Today screen, **Then** no water component appears and the calorie ring is displayed as it
   was before this feature.

---

### User Story 3 - Turn Water Tracking On or Off Later from Settings (Priority: P2)

A user who skipped water tracking during onboarding — or who no longer wants it — opens Settings
and toggles the "Water counter" switch on or off, and adjusts the goal. The Today and Calendar
screens reflect the change on return.

**Why this priority**: Important for users whose needs change and for anyone who onboarded before
this feature existed, but the feature already delivers its core value through User Stories 1 and
2.

**Independent Test**: Open Settings for an existing profile, turn the Water counter switch on,
set a goal, save, and confirm the Today screen now shows the water component; then return to
Settings, turn it off, save, and confirm the water component disappears from both the Today and
Calendar screens while any previously logged amounts remain in storage.

**Acceptance Scenarios**:

1. **Given** a profile with water tracking off, **When** the user opens Settings, **Then** the
   "Water counter" switch shows off and no goal input is shown.
2. **Given** the user turns the switch on in Settings, **When** it toggles, **Then** a goal
   input appears pre-filled with 2000 ml (or the previously saved goal, if one exists).
3. **Given** the user turns water tracking on in Settings and saves, **When** they return to the
   Today screen, **Then** the water component appears with the saved goal.
4. **Given** water tracking is on with some water logged today, **When** the user turns the
   switch off in Settings and saves, **Then** the water component no longer appears on the Today
   or Calendar screens, and the previously logged amount is still stored.
5. **Given** the user previously turned water tracking off, **When** they turn it back on later,
   **Then** their last saved goal is restored as the starting value and any previously logged
   per-day amounts are shown again on their respective days.
6. **Given** a profile created before this feature existed, **When** the user opens Settings,
   **Then** the "Water counter" switch is present and off, and the rest of the profile is
   unchanged.

---

### User Story 4 - Review and Adjust Water on Past Days (Priority: P3)

A user who tracks water opens the Calendar screen, picks a past day, and sees that day's water
component next to its calorie ring — the bar, the "current / goal" label, the glass icon, and
the up/down arrows. They can correct a past day's amount with the same ±50 ml arrows, exactly as
they can edit that day's food and exercise entries.

**Why this priority**: Useful for fixing forgotten or mistaken entries, but the day-to-day value
is delivered by tracking today (User Story 1); past-day correction is a secondary convenience.

**Independent Test**: With water tracking enabled, log some water today, open the Calendar
screen, select a previous day, tap the up arrow a few times, switch to another day and back, and
confirm the adjusted amount was saved against that specific day and today's amount is unaffected.

**Acceptance Scenarios**:

1. **Given** water tracking is enabled, **When** the user selects any day on the Calendar
   screen, **Then** that day's water component is shown next to its calorie ring, with the bar,
   label, glass icon, and up/down arrows.
2. **Given** a past day shows 300 ml consumed, **When** the user taps the up arrow twice on the
   Calendar screen, **Then** that day's amount becomes 400 ml and is saved against that day
   only.
3. **Given** the user adjusts water on a past day, **When** they return to the Today screen,
   **Then** today's water amount is unchanged.
4. **Given** water tracking is disabled, **When** the user views any day on the Calendar screen,
   **Then** no water component appears and the calorie ring is shown as before this feature.

---

### Edge Cases

- **Down arrow at zero**: Tapping the down arrow when the consumed amount is 0 ml leaves it at
  0 ml; the amount never becomes negative. This applies on both the Today and Calendar screens.
- **Exceeding the goal**: The consumed amount can go above the goal (e.g., 2500 ml against a
  2000 ml goal). The numeric label shows the true amount; the vertical bar fills to its maximum
  and does not visually overflow.
- **Invalid or empty goal input**: If the user turns the switch on but clears the goal input or
  enters a non-positive / non-numeric value, the form cannot be submitted/saved until a whole
  number greater than 0 is entered.
- **New day rollover**: The consumed amount is per calendar day. Opening the app on a new day
  shows 0 ml consumed on Today; the previous day's amount is stored against that previous day
  and remains visible on the Calendar screen for that day.
- **Water tracking disabled**: When the switch is off, no water component appears on the Today or
  Calendar screens, and no water UI appears on the profile form beyond the switch itself; the
  daily goal value is not requested.
- **Disabling after logging**: Turning the switch off does not delete previously recorded per-day
  water amounts or the saved goal — the component is simply not rendered. Turning it back on
  makes those amounts visible again on their respective days and restores the saved goal.
- **Very large goal or amount**: The bar fill is always computed as amount ÷ goal capped at
  100%; unusually large values do not break the layout.
- **History chart**: This feature does not add water to the History chart; that screen is
  unchanged.
- **Days logged before this feature**: A day with no stored water amount is treated as 0 ml.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profile form MUST include a labeled on/off "Water counter" switch, shown in
  both the onboarding profile form and the Settings profile form, defaulting to off.
- **FR-002**: When the Water counter switch is on, the profile form MUST show an input for the
  daily water goal, expressed in milliliters.
- **FR-003**: The water-goal input MUST be pre-filled with 2000 ml (2 liters) the first time the
  switch is turned on, and pre-filled with the user's previously saved goal on subsequent
  occasions.
- **FR-004**: When the Water counter switch is on, the profile form MUST require the water goal
  to be a whole number greater than 0 before it can be submitted/saved.
- **FR-005**: When the Water counter switch is off, the profile form MUST NOT require or show a
  water-goal value, and MUST NOT show any other water-related fields.
- **FR-006**: The system MUST persist, per device: whether water tracking is enabled, and the
  daily water goal.
- **FR-007**: The system MUST record the amount of water consumed separately for each calendar
  day, alongside that day's existing food and exercise data.
- **FR-008**: When water tracking is enabled, the Today screen MUST display a water component
  next to the calorie ring, consisting of: a vertical bar representing consumed ÷ goal, an up
  arrow control, a down arrow control, a text label showing "current amount / goal", and a
  water-glass icon beneath that label.
- **FR-009**: On the Today screen, the calorie ring and the water component MUST be visually
  grouped together within a single parent container, with the water component positioned to the
  right of the calorie ring.
- **FR-010**: Tapping the up arrow MUST increase the selected day's consumed water by exactly
  50 ml.
- **FR-011**: Tapping the down arrow MUST decrease the selected day's consumed water by exactly
  50 ml, but MUST NOT reduce it below 0 ml.
- **FR-012**: The vertical bar's fill MUST be proportional to consumed ÷ goal and MUST be capped
  at 100% (a full bar) when the consumed amount meets or exceeds the goal.
- **FR-013**: The numeric label MUST always show the true consumed amount, even when it exceeds
  the goal.
- **FR-014**: Changes to a day's consumed water MUST persist so that leaving and returning to
  the screen shows the same amount for that day.
- **FR-015**: On a new calendar day, the Today screen MUST show 0 ml consumed, independent of
  prior days' amounts.
- **FR-016**: When water tracking is disabled, the Today and Calendar screens MUST NOT display
  the water component, and MUST present the calorie ring as it appeared before this feature.
- **FR-017**: Disabling water tracking MUST NOT delete previously recorded per-day water amounts
  or the saved goal, and MUST NOT prompt for confirmation; re-enabling MUST restore the last
  saved goal and again show previously recorded amounts on their respective days.
- **FR-018**: A profile created before this feature existed MUST be treated as having water
  tracking disabled, with no change to any other profile field.
- **FR-019**: When water tracking is enabled, the Calendar screen MUST display the same water
  component next to the selected day's calorie ring, with the up/down arrows fully functional so
  the user can adjust that specific day's amount — consistent with how food and exercise entries
  are edited on the Calendar screen.
- **FR-020**: Adjusting water on the Calendar screen MUST affect only the selected day and MUST
  NOT change any other day's amount.
- **FR-021**: This feature MUST NOT change the History chart or the net-calorie / daily-goal
  calculations.

### Key Entities *(include if feature involves data)*

- **User Profile (extended)**: The existing per-device profile gains two attributes — **Water
  Tracking Enabled** (on/off, default off) and **Daily Water Goal** (a positive whole number of
  milliliters, default 2000, only meaningful when tracking is enabled). A profile saved before
  this feature is treated as tracking disabled.
- **Day Log (extended)**: The existing per-day record (food entries, exercise entries) gains a
  **Water Consumed** attribute — a non-negative whole number of milliliters for that calendar
  day, default 0, changed in 50 ml steps from either the Today screen (for the current day) or
  the Calendar screen (for the selected day).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can enable water tracking and set a goal during onboarding in under 20
  seconds of added time versus the pre-feature form.
- **SC-002**: From the Today screen, a user can record a glass of water in a single tap, and the
  displayed amount and bar update with no perceptible delay.
- **SC-003**: Every up-arrow tap changes the amount by exactly +50 ml and every down-arrow tap
  by exactly −50 ml (bounded at 0), with 100% consistency across repeated taps, on both the
  Today and Calendar screens.
- **SC-004**: After adding water and reopening the app the same day, the previously recorded
  amount is shown correctly 100% of the time; on a new day Today shows 0 ml while the prior
  day's amount is still shown on the Calendar for that day.
- **SC-005**: With water tracking off, the app's screens are visually and behaviorally identical
  to before this feature for 100% of flows.
- **SC-006**: The vertical bar's fill visually matches consumed ÷ goal (capped at full) for any
  combination of amount and goal, including amounts above the goal.
- **SC-007**: Adjusting a past day's water on the Calendar screen changes only that day's stored
  amount, verified across at least two different days.

## Assumptions

- **Two surfaces**: The interactive water component (bar + arrows + label + glass icon) appears
  on the Today screen (current day) and on the Calendar screen (selected day), whenever water
  tracking is enabled. The History chart is out of scope.
- **Step size and default goal**: The +/−50 ml step and the 2000 ml (2 liter) default goal were
  specified by the stakeholder and are fixed constants, not user-configurable beyond the goal
  value itself.
- **Units**: All water values are in milliliters, entered and displayed as whole numbers; no
  unit switching (oz/cups) is in scope.
- **Goal is a plain target**: Exceeding the goal is allowed and not treated as an error or
  warning; there is no "over goal" styling requirement analogous to the calorie ring's
  over-goal state. The bar simply caps at full.
- **No per-drink history**: Only a single running total per day is stored, not individual
  timestamped water entries (unlike food/exercise entries). The up/down arrows adjust that
  total.
- **No reminders/notifications**: The feature does not send reminders to drink water; the app
  remains fully offline with no notifications (consistent with the project's local-only,
  no-backend constraint).
- **Disable is non-destructive and silent**: Turning the switch off keeps the saved goal and all
  per-day amounts and does not ask for confirmation; it only stops rendering the component.
- **Sketch interpretation**: The provided sketch shows a tall thin vertical bar with the up
  arrow above the down arrow to its lower-right, and a "(current amount) / (goal)" caption
  beneath the bar; a water-glass icon sits below that caption. The exact visual proportions are
  left to implementation within the project's existing claymorphism-style theme.
- **Layout on small screens**: The ring-plus-water grouping is expected to fit the Today and
  Calendar screen width on typical phones; precise responsive behavior (wrapping, scaling) is an
  implementation detail.
- **Existing day data**: Days logged before this feature existed have no stored water amount and
  are treated as 0 ml if referenced.
