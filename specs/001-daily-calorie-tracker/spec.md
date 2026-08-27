# Feature Specification: Daily Calorie Tracker

**Feature Branch**: `001-daily-calorie-tracker`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "Una app móvil de contador de calorías diarias sin login ni backend, con todos los datos guardados localmente en el dispositivo. Al abrir la app por primera vez, el usuario completa un formulario con peso (kg), altura (cm), edad y sexo. Con estos datos se calcula su Tasa de Metabolismo Basal (TMB) usando la fórmula de Harris-Benedict revisada... Pantalla principal (día actual) con indicador circular de progreso, entradas de comida y ejercicio, lista de entradas editable/eliminable, botón flotante '+'. Lógica del contador: calorías netas = comida - ejercicio, nunca negativas (mostrar excedente entre paréntesis), indicador debe reflejar exceso sobre el objetivo. Sistema de calendario mensual para navegar y editar días pasados, distinguiendo visualmente hoy y el día seleccionado. Pantalla de historial con gráfico de líneas de calorías netas en el tiempo. Diseño minimalista con ícono de perfil circular y filas de entradas con bordes redondeados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Profile Setup (Priority: P1)

A new user opens the app for the first time and is guided through entering their weight, height, age, and sex so the app can calculate their daily calorie goal (Basal Metabolic Rate) before they can use any other feature.

**Why this priority**: Without a profile and a computed daily goal, no other screen (main tracking, calendar, history) has anything meaningful to show. This is the mandatory entry point for every user.

**Independent Test**: Can be fully tested by launching the app for the first time, completing the profile form, and verifying a daily calorie goal is calculated and the user is taken to the main tracking screen.

**Acceptance Scenarios**:

1. **Given** the app has never been opened on this device, **When** the user launches it, **Then** they are presented with a form requesting weight (kg), height (cm), age, and sex, with no way to skip it.
2. **Given** the user has entered valid weight, height, age, and a sex (male), **When** they submit the form, **Then** the system computes the daily calorie goal as (10 × weight) + (6.25 × height) − (5 × age) + 5 and proceeds to the main screen.
3. **Given** the user has entered valid weight, height, age, and a sex (female), **When** they submit the form, **Then** the system computes the daily calorie goal as (10 × weight) + (6.25 × height) − (5 × age) − 161 and proceeds to the main screen.
4. **Given** the user enters a zero, negative, or non-numeric value for weight, height, or age, **When** they attempt to submit, **Then** the form shows a validation error and does not proceed.

---

### User Story 2 - Track Today's Food and Exercise (Priority: P1)

On the main screen, the user logs what they eat and any exercise they do throughout the day, and sees at a glance how many net calories they have consumed against their daily goal.

**Why this priority**: This is the core, everyday value loop of the app — the reason someone opens it repeatedly.

**Independent Test**: Can be fully tested by adding one or more food entries and, optionally, exercise entries on the main screen, and verifying the circular progress indicator and net calorie total update correctly, including the zero-floor and over-goal behaviors.

**Acceptance Scenarios**:

1. **Given** the user is on the main screen for the current day, **When** they tap the floating "+" button and add a food entry with a calorie amount and an optional note, **Then** the entry appears in the day's list with its time, note, and calories, and the circular indicator updates to reflect the new total.
2. **Given** the user has logged 500 food calories, **When** they add an exercise entry of 200 calories burned, **Then** the net calories shown is 300 (500 − 200).
3. **Given** the user has logged 200 food calories, **When** they add an exercise entry of 350 calories burned, **Then** the net calories shown is 0 with the uncompensated excess displayed as "0 (-150)".
4. **Given** the user's net calories for the day exceed their daily calorie goal, **When** they view the main screen, **Then** the circular indicator visually signals the overage (e.g., a distinct color) and shows the amount by which the goal was exceeded.
5. **Given** the user has not logged anything yet today, **When** they open the main screen, **Then** the indicator shows 0 net calories against the daily goal with no overage state.

---

### User Story 3 - Edit and Delete Entries (Priority: P2)

The user corrects a mistake or removes an entry they no longer want counted, for the day they are currently viewing.

**Why this priority**: Mistakes in manual calorie entry are common; without correction the tracker quickly becomes untrustworthy, but the app is still usable without it for a first pass.

**Independent Test**: Can be fully tested by editing an existing entry's calories or note and verifying the list and totals update, and by deleting an entry and verifying it disappears and totals recalculate.

**Acceptance Scenarios**:

1. **Given** an existing food or exercise entry in the day's list, **When** the user edits its calorie amount and/or note and saves, **Then** the list reflects the updated values and the net calories and progress indicator recalculate accordingly.
2. **Given** an existing entry in the day's list, **When** the user deletes it, **Then** it no longer appears in the list and the net calories and progress indicator recalculate as if it never existed.
3. **Given** an entry that caused an uncompensated-exercise-excess display (e.g., "0 (-150)"), **When** the user deletes enough exercise entries to remove the excess, **Then** the display returns to a normal positive or zero net value without the parenthetical excess.

---

### User Story 4 - Review and Edit Past Days via Calendar (Priority: P2)

The user opens a monthly calendar to jump back to a previous day and review or correct what they logged that day.

**Why this priority**: Tracking history and being able to fix a past day is expected of any calorie tracker, but the app already delivers value for "today" without it.

**Independent Test**: Can be fully tested by logging entries on the current day, navigating to a different past day via the calendar, adding/editing/deleting entries there, and confirming the current day's data is unaffected.

**Acceptance Scenarios**:

1. **Given** the user opens the monthly calendar, **When** they select a day in the past, **Then** they see that day's own list of entries and net calories, separate from any other day.
2. **Given** the user is viewing a past day, **When** they add, edit, or delete an entry, **Then** only that day's totals change; today's totals remain unaffected.
3. **Given** the calendar is open, **When** the currently selected day is the same as today's date, **Then** the calendar still shows a visually distinct marker for "today" and a visually distinct marker for "selected", so the user can tell both facts are true at once.
4. **Given** the calendar is open, **When** the user tries to select a date after today, **Then** the date is not selectable.
5. **Given** the user opens a brand-new calendar day that has never been logged before, **When** they view it, **Then** it starts with zero entries and zero net calories.

---

### User Story 5 - Update Profile Settings (Priority: P3)

The user's weight, height, age, or other profile detail changes over time, so they update it from a settings screen and the daily calorie goal recalculates.

**Why this priority**: Useful for long-term accuracy but not required for the app to deliver value on day one.

**Independent Test**: Can be fully tested by opening the settings screen, changing a profile value, saving, and confirming the daily calorie goal used going forward reflects the new value.

**Acceptance Scenarios**:

1. **Given** the user opens the settings screen, **When** they view it, **Then** their current weight, height, age, and sex are pre-filled.
2. **Given** the user changes their weight and saves, **When** they return to the main screen, **Then** the daily calorie goal is recalculated using the new value.

---

### User Story 6 - View Calorie Trends Over Time (Priority: P3)

The user opens a history screen to see a line chart of their net calories per day, to understand whether they are trending up, down, or staying level.

**Why this priority**: Valuable for reflection and motivation, but purely additive on top of the day-by-day tracking that already works without it.

**Independent Test**: Can be fully tested by logging entries across multiple different days and then opening the history screen to confirm each logged day appears as a point on the line chart with the correct net calorie value.

**Acceptance Scenarios**:

1. **Given** the user has logged entries on several different days, **When** they open the history screen, **Then** they see a line chart with one point per logged day showing that day's net calories.
2. **Given** a day has no logged entries, **When** it falls within the charted range, **Then** it is represented as zero net calories rather than being omitted in a way that breaks the trend line.

---

### Edge Cases

- What happens when net calories for a day are exactly equal to the daily calorie goal? The indicator MUST show the goal as met, not as exceeded.
- What happens when the user has zero entries for the viewed day? Net calories show as 0 against the goal, with no overage or excess indicator.
- What happens when deleting an entry removes the condition that caused an overage or an uncompensated exercise excess? The display MUST immediately drop back to the correct non-overage/non-excess state.
- What happens if the user tries to navigate the calendar to a future date? The date MUST NOT be selectable.
- What happens if the user opens the app after completing setup once before, on a later day? The app MUST go straight to the main screen for the current date without repeating profile setup.
- What happens if the user enters invalid profile values (zero, negative, or non-numeric weight/height/age)? The form MUST show a validation error and block submission.
- What happens when the calendar day changes while the app is open and idle? The app MUST begin treating the new date as "today" with its own fresh, empty entry list, without requiring an app restart.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT require account creation, login, or any credential entry; all features are available after completing local profile setup.
- **FR-002**: System MUST store all profile and entry data locally on the device only; no data is transmitted to or stored on any remote server or service.
- **FR-003**: On first launch, system MUST present a profile setup form collecting weight (kg), height (cm), age (years), and sex, and MUST prevent access to any other screen until it is completed.
- **FR-004**: System MUST validate that weight, height, and age are positive numeric values before allowing the profile form to be submitted.
- **FR-005**: System MUST calculate the user's daily calorie goal using the revised Harris-Benedict formula: for male sex, (10 × weight) + (6.25 × height) − (5 × age) + 5; for female sex, (10 × weight) + (6.25 × height) − (5 × age) − 161.
- **FR-006**: Users MUST be able to view and edit their profile (weight, height, age, sex) at any time from a settings screen, with the daily calorie goal recalculated immediately when changes are saved.
- **FR-007**: The main screen MUST display a circular progress indicator showing the current day's net calories relative to the daily calorie goal.
- **FR-008**: Users MUST be able to add a food entry consisting of a required positive calorie amount and an optional text note.
- **FR-009**: Users MUST be able to add an exercise entry consisting of a required positive calorie-burned amount and an optional text note.
- **FR-010**: System MUST automatically timestamp each entry with the time it was created.
- **FR-011**: System MUST display, for the day currently being viewed, a list of all food and exercise entries showing time, note (if present), and calorie amount.
- **FR-012**: Users MUST be able to edit the calorie amount and/or note of any existing entry.
- **FR-013**: Users MUST be able to delete any existing entry.
- **FR-014**: The main screen MUST provide a floating action control for adding a new food or exercise entry.
- **FR-015**: System MUST calculate a day's net calories as the sum of that day's food entry calories minus the sum of that day's exercise entry calories.
- **FR-016**: Net calories displayed MUST never be negative; when a day's exercise calories exceed its food calories, the system MUST display net calories as 0 and separately display the uncompensated exercise excess (e.g., "0 (-150)").
- **FR-017**: When a day's net calories exceed the daily calorie goal, the progress indicator MUST visually communicate the overage (e.g., a distinct color) and MUST display the amount by which the goal was exceeded.
- **FR-018**: Users MUST be able to open a monthly calendar view and select any date on or before the current date to view and edit that date's entries.
- **FR-019**: The calendar MUST visually distinguish, using distinct styles, the current calendar date and the date currently selected by the user, such that both remain distinguishable from each other even when they are the same date.
- **FR-020**: The calendar MUST NOT allow selection of dates after the current date.
- **FR-021**: System MUST persist and group entries by calendar day; each calendar day not previously logged MUST start with zero entries and zero net calories, independent of any other day.
- **FR-022**: System MUST provide a history screen displaying a line chart of net calories per day over time.
- **FR-023**: Every screen MUST display a circular profile icon in the top corner that provides access to the profile/settings screen.
- **FR-024**: Entry list rows MUST be rendered with rounded corners and MUST display calories, note, and time for each entry.

### Key Entities

- **User Profile**: The single per-device profile containing weight (kg), height (cm), age (years), and sex, plus the daily calorie goal derived from them. Exactly one profile exists per app install; it can be edited but not deleted.
- **Daily Log**: A calendar date's collection of entries. Groups all Food Entries and Exercise Entries recorded for that date and is the basis for that date's net calorie calculation. Every calendar date implicitly has a Daily Log (empty until entries are added).
- **Food Entry**: A single logged instance of calories consumed, with a calorie amount, an optional note, and a creation timestamp. Belongs to exactly one Daily Log.
- **Exercise Entry**: A single logged instance of calories burned, with a calorie amount, an optional note, and a creation timestamp. Belongs to exactly one Daily Log.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can complete profile setup and reach the main tracking screen with their daily calorie goal visible in under 1 minute.
- **SC-002**: A user can log a new food or exercise entry from the main screen in 3 taps or fewer.
- **SC-003**: After adding, editing, or deleting any entry, the displayed net calories and progress indicator reflect the change with no perceptible delay.
- **SC-004**: 100% of days where exercise calories exceed food calories display net calories as 0 together with the correct uncompensated excess amount.
- **SC-005**: A user can select any past calendar day and view only that day's own entries, with zero data crossover between days, across at least a full month of history.
- **SC-006**: A user can correctly identify, at a glance, whether the calendar's "today" marker and "selected day" marker refer to the same date or different dates, in every combination.
- **SC-007**: All profile and entry data survives a full app close and reopen with no loss, since no backend or account exists.

## Assumptions

- Sex is limited to the two options used by the given Harris-Benedict formula variants (male/female); no other options are in scope for the calorie-goal calculation.
- The daily calorie goal applied to any day (past or present) is always the one derived from the user's current profile at the time it is viewed; goals are not historically snapshotted per day even if the profile is edited later.
- Entry timestamps are set automatically at creation and are not user-editable; editing an entry changes its calories and/or note only.
- The history line chart covers every calendar day from the earliest logged entry through today; days with no entries within that range are treated as zero net calories.
- The app supports a single user/profile per device install; there is no concept of multiple profiles, switching users, or shared data.
- Future calendar dates cannot be selected or logged against.
