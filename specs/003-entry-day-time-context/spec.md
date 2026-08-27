# Feature Specification: Day Context Header and Optional Time on Entry Form

**Feature Branch**: `003-entry-day-time-context`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "cuando se agregue calorias (add food) y se tenga seleccionado un dia, en el modal de add food, se debe mostrar a que dia se esta agregando. esta informacion estara a la altura del titulo, (dentro del contenedor del titulo, que tenga un align between para separar el titulo de la fecha) la fecha estara en formato DD - MMMM - AAAA. ademas. en la carga de calorias, un campo nuevo opcional para cargar la hora y minutos, por defecto sera el momento actual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Which Day an Entry Is Being Added To (Priority: P1)

A user who has selected a day (for example, a past day on the calendar) opens the entry form to
log food. The form clearly shows, next to its title, the full date the entry will be recorded
against, so the user is confident they are logging to the right day and not to "today" by
mistake.

**Why this priority**: Logging calories against the wrong day silently corrupts the user's
history and undermines trust in every downstream number (daily totals, net calories, trends).
Showing the target date is the single most valuable safeguard and is the core of this request.

**Independent Test**: Can be fully tested by selecting a non-today day, opening the entry form,
and confirming the displayed date matches the selected day in the required format, positioned on
the same line as the title with the title and date pushed to opposite ends of their shared
container.

**Acceptance Scenarios**:

1. **Given** a user has selected a day that is not today, **When** they open the entry form to
   add food, **Then** the form header shows the title on one side and the selected day's date on
   the other side of the same container.
2. **Given** the entry form is open for a selected day, **When** the user reads the date, **Then**
   it is formatted as day number, month name, and full year separated by " - " (pattern
   `DD - MMMM - AAAA`).
3. **Given** the selected day is today, **When** the user opens the entry form, **Then** the
   header still shows today's date in the same position and format.
4. **Given** the entry form is open, **When** the user submits the entry, **Then** the entry is
   stored against the date shown in the header, not against the current calendar day.

---

### User Story 2 - Record the Time of an Entry (Priority: P2)

When logging food, a user can optionally set the time the food was consumed as a 12-hour clock
value: an hour dropdown (1–12), a minute dropdown (00–59), and an AM / PM selector. If they do
nothing, the current time is pre-selected, so the common case stays a one-tap flow while users
who are catching up on earlier meals can still place them at the right time of day.

**Why this priority**: Time-of-day is useful context for reviewing eating patterns and is
required for entries to be shown in a sensible order, but the feature still delivers value
without it (the day header alone prevents the worst error). It builds on Story 1's form changes.

**Independent Test**: Can be fully tested by opening the entry form, leaving the time untouched
and confirming the saved entry carries the current time, then adding another entry with an
explicitly chosen earlier time (via the hour/minute/AM-PM controls) and confirming that time is
saved.

**Acceptance Scenarios**:

1. **Given** the entry form is open, **When** the user does not interact with the time controls,
   **Then** the hour, minute, and AM/PM controls already show the current time, and the saved
   entry uses that time.
2. **Given** the entry form is open, **When** the user picks an hour (1–12), a minute (00–59),
   and AM or PM, **Then** the saved entry uses the chosen time combined with the selected day's
   date.
3. **Given** the hour or minute control is opened, **When** the option list is shown, **Then**
   it lists exactly 1–12 (hour) or 00–59 (minute) and scrolls if it does not fit.
4. **Given** a saved entry with a specific time, **When** the user reopens it to edit, **Then**
   the hour, minute, and AM/PM controls are all pre-selected from the entry's stored time.
5. **Given** the time controls are labeled optional, **When** the user views the form, **Then**
   they are visually distinguishable as not required, consistent with the existing optional
   "Note" field.

---

### Edge Cases

- **Past day + default time**: When the selected day is in the past and the user keeps the
  default time, the entry is stored with the selected day's date and the current wall-clock time
  (e.g., selecting last Tuesday at 3:10 PM stores "last Tuesday 15:10"). This is acceptable and
  expected.
- **Entry ordering**: When entries in the same day have different times (including a mix of
  defaulted and manually set times), the day's entry list is shown in ascending time order.
- **Editing an older entry created before this feature**: Entries saved before this feature have
  a recorded timestamp already; that timestamp is used as the pre-filled time when editing and
  for ordering. No migration or backfill is required.
- **Time is always valid**: The hour and minute controls are dropdowns limited to 1–12 and
  00–59, so there is no invalid, empty, or out-of-range time state to handle — the controls
  always hold a selectable value (pre-set to "now").
- **Long month names**: The header must remain readable and not clip or overlap the title when
  the month name is long; the date wraps or shrinks rather than pushing the title off-screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The entry form MUST display the date of the day the entry will be recorded against,
  within the same container as the form title, with the title and the date aligned to opposite
  ends of that container (space-between layout).
- **FR-002**: The displayed date MUST use the format `DD - MMMM - AAAA`: two-digit day, full
  month name, four-digit year, each part separated by " - " (e.g., `05 - March - 2026`).
- **FR-003**: The date shown MUST be the currently selected day from the screen that opened the
  form; if no day was explicitly selected, it MUST be today.
- **FR-004**: The entry form MUST include an optional 12-hour time control consisting of three
  parts: an hour selector with options 1–12, a minute selector with options 00–59, and an
  AM / PM selector. The hour and minute selectors MUST be dropdown/list pickers (not free-text
  fields), so only in-range values can be chosen.
- **FR-005**: All three time controls MUST default to the current time at the moment the form
  is opened (hour, minute, and AM/PM pre-selected to match "now").
- **FR-006**: On submission, the system MUST record the entry using whatever the three time
  controls currently show (defaulted or user-changed), combined with the selected day's date.
- **FR-007**: When the user changes any of the three time controls, the system MUST record the
  entry using the resulting time combined with the selected day's date.
- **FR-008**: The optional time control MUST NOT block form submission.
- **FR-009**: When editing an existing entry, the hour, minute, and AM / PM selectors MUST all
  be pre-selected from that entry's stored time.
- **FR-010**: Each day's food and exercise entry lists MUST be displayed in ascending order of
  each entry's recorded time.
- **FR-011**: The day-context header and the optional time control MUST appear and behave
  identically for every use of the entry form: adding or editing, food or exercise.
- **FR-012**: The month name in the date MUST be shown in English (e.g., `05 - March - 2026`),
  consistent with the rest of the app's UI text.

### Key Entities *(include if data involved)*

- **Entry (food or exercise)**: A single logged item for a day. Relevant attributes: calorie
  amount, optional note, and a recorded moment (date + time). The date component comes from the
  selected day; the time component comes from the optional time field or defaults to the current
  time. The recorded moment determines the entry's position in the day's list.
- **Selected day**: The day currently in focus on the screen that launches the entry form. It
  determines both the header date and the date component of any entry created or edited from that
  form.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability checks, users correctly identify which day an entry will be logged to
  before submitting, in 100% of attempts where a non-today day is selected.
- **SC-002**: Logging food to a selected past day requires no more taps than before this feature
  when the user accepts the default time (no added mandatory steps).
- **SC-003**: 95% of entries are created without the user needing to open or adjust the time
  field (the default is correct for the common "log it now" case).
- **SC-004**: When a user sets a specific time, the entry appears in the correct chronological
  position in the day's list 100% of the time.
- **SC-005**: The displayed date matches the `DD - MMMM - AAAA` pattern for every day a user can
  select, including single-digit days shown with a leading zero.

## Assumptions

- The screens that open the entry form already track a "selected day" (today on the main screen,
  any chosen day on the calendar screen); this feature surfaces that existing value and does not
  add day-picking to the form itself.
- Future days cannot be selected (the calendar already restricts selection to today or earlier),
  so the header date is always today or a past date.
- The time control captures a 12-hour hour + minute + AM/PM only; seconds are not user-editable
  and default to the current moment's value.
- Time is entered as a 12-hour clock (matching how entry times are already displayed in the day
  list) and stored/ordered internally in 24-hour form; it is entered and displayed in the user's
  local timezone, with no timezone selection.
- The AM / PM selector is a two-option toggle rendered with the app's existing pill-selector
  pattern (as used for Sex / Activity Level / Weight Goal) — a single-tap choice between two
  values.
- The hour and minute selectors are dropdown/list pickers built from React Native's built-in
  `Modal` + a scrollable list (the same pattern as the existing `InfoDialog`), NOT a native
  picker component — this keeps the app Expo Go-compatible with no new native dependency (Expo
  Go / Constitution II). The minute list (60 options) scrolls within a bounded-height sheet.
- Introducing time-based ordering (FR-010) replaces the previous insertion-order display; this is
  considered an improvement and existing entries already carry a timestamp that makes the
  ordering well-defined.
- The header date is display-only and not editable from the form.
- The day header and optional time field apply to the entire shared entry form (add and edit,
  food and exercise), even though the original request named "add food"; a single consistent
  form is simpler than conditional behavior per entry type.
- Month names render in English to match the app's existing UI language.
- This is an extension of the existing daily calorie tracker (feature 001) and its profile
  extension (feature 002): it adds no new screens and changes only the entry form and the day
  entry lists.
