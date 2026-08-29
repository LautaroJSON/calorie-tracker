# Feature Specification: Entry Row — Title Field, Expand on Tap, Swipe to Edit/Delete

**Feature Branch**: `005-entry-row-swipe-and-title`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "vamos a actualizar la funcionalidad \"add food\" Ahora, en el formulario tendremos los campos \"Calories\" \"Title\" (Opcional) y Note (opcional). En el componente \"EntryRow\" mostrara lo mismo de siempre, pero en vez de la prop \"note\" mostrara \"title\". ahora el EntryRow es presionable, al pulsar en cualquier parte del componente, este se expande y muestra la informacion completa: \"title\" debajo de este \"note\" en un tono mas claro. las calorias fecha y hora. (recordar que la hora se muestra en formato pm y am.) los iconos de editar y eliminar se quitan por completo. ahora para eliminar se debe deslizar el \"EntroRow\" con un gesto hacia la derecha y para editar a la izquierda. mientras deslicez a la derecha, se vera en el extremo izquierdo un fondo rojo y un cesto de basura como feedback visual al usuario que esta por eliminar. para este tipo de animaciones dime si es necesario una bibloteca/libreria adicional al proyecto o se puede de forma nativa."

## Clarifications

### Session 2026-08-29

- Q: On swipe-to-delete, keep the confirmation dialog or delete immediately? → A: Keep the
  existing confirmation dialog — the swipe triggers it, and the entry is removed only after the
  user confirms.
- Q: Does the Title field + row redesign apply to food only, or food and exercise? → A: Both —
  the entry form and entry row are shared, and the change applies consistently to food and
  exercise entries.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Give an Entry a Title (Priority: P1)

When adding or editing an entry, the user can give it a short **Title** (optional) in addition
to the existing calorie amount, optional note, and optional time. The title is what identifies
the entry at a glance in the day's list.

**Why this priority**: The list currently leans on the free-text note to label entries; a
dedicated, short title separates "what this is" (Breakfast, Run) from "details about it"
(scrambled eggs + toast, 5 km easy pace). Every other part of this feature builds on the entry
now having a title.

**Independent Test**: Open the entry form, enter calories and a title, save, and confirm the
day's list shows that title on the entry's row; edit the entry, change the title, save, and
confirm the row updates.

**Acceptance Scenarios**:

1. **Given** the entry form, **When** the user views it, **Then** it shows four inputs in
   order: Calories, Title (optional), Note (optional), Time (optional).
2. **Given** the user enters calories and a title but no note, **When** they save, **Then** the
   entry is stored with that title and no note, and the day's list row shows the title.
3. **Given** the user enters calories only (no title, no note), **When** they save, **Then** the
   entry saves successfully and its row shows a sensible fallback label (the entry type).
4. **Given** an existing entry with a title, **When** the user opens it to edit, **Then** the
   Title field is pre-filled with the stored title.
5. **Given** an entry created before this feature existed (which has no title), **When** it is
   shown or edited, **Then** it behaves as if the title were empty — its row shows the fallback
   label and the Title field is empty on edit.

---

### User Story 2 - Expand a Row to See Full Details (Priority: P1)

In the day's list, each entry row shows a compact summary (title + time + calories, as today).
Tapping anywhere on the row expands it in place to reveal the full details: the title, the note
beneath it in a lighter tone, and the calories, date, and time (time shown in 12-hour AM/PM
format). Tapping again collapses it.

**Why this priority**: With the edit/delete icons removed (User Story 3), tapping the row needs
a clear purpose, and users still need a way to read a long note and confirm an entry's exact
date/time without opening the edit form.

**Independent Test**: In a day with at least one entry that has a note, tap the row and confirm
it expands to show title, note (lighter tone), calories, date, and an AM/PM time; tap again and
confirm it collapses back to the summary.

**Acceptance Scenarios**:

1. **Given** a collapsed entry row, **When** the user taps anywhere on it, **Then** it expands
   in place to show: the title, the note below it in a visually lighter tone, the calorie
   amount, the date, and the time in 12-hour AM/PM format (e.g. "7:15 AM").
2. **Given** an expanded entry row, **When** the user taps it again, **Then** it collapses back
   to the compact summary.
3. **Given** an entry with no note, **When** its row is expanded, **Then** no empty note line is
   shown; the other details still appear.
4. **Given** an entry with no title, **When** its row is expanded, **Then** the fallback label
   is shown in the title position.
5. **Given** a row is expanded, **When** the user leaves the screen and returns, **Then** the
   row is collapsed again (expansion is not persisted).

---

### User Story 3 - Swipe to Edit or Delete (Priority: P1)

The separate edit (pencil) and delete (trash) icon buttons are removed from the row entirely.
Instead, the user swipes the row: swipe **right** to delete, swipe **left** to edit. While
swiping right, a red background with a trash-can icon is progressively revealed at the left edge
of the row as a "you are about to delete" cue.

**Why this priority**: This replaces the only existing way to edit or remove an entry, so the
list is not fully usable without it.

**Independent Test**: In a day with an entry, swipe its row to the right and confirm the delete
flow triggers with the red/trash visual cue during the drag; swipe another row to the left and
confirm the edit form opens for that entry.

**Acceptance Scenarios**:

1. **Given** an entry row, **When** the user looks at it, **Then** there are no edit or delete
   icon buttons anywhere on the row.
2. **Given** an entry row, **When** the user drags it to the right, **Then** a red background
   with a trash-can icon is revealed at the left edge, growing with the drag distance.
3. **Given** the user has dragged a row right far enough and releases, **When** the gesture
   completes, **Then** the existing "Are you sure?" confirmation dialog appears; confirming
   deletes the entry and cancelling leaves it in place with the row springing back.
4. **Given** the user drags a row right only a little and releases, **When** the gesture is
   below the activation threshold, **Then** the row springs back and nothing is deleted.
5. **Given** an entry row, **When** the user drags it to the left far enough and releases,
   **Then** the edit form opens for that entry, pre-filled with its current values.
6. **Given** the user is swiping a row horizontally, **When** the gesture is clearly
   horizontal, **Then** the vertical scrolling of the list is not disrupted, and vice versa.
7. **Given** one row is mid-swipe or open, **When** the user swipes a different row, **Then**
   the first row returns to its resting position.

---

### Edge Cases

- **Entry with neither title nor note**: The row shows the entry-type fallback label ("Food" /
  "Exercise") collapsed and expanded; nothing looks broken or empty.
- **Very long title**: The collapsed row truncates the title to a single line; the expanded row
  may wrap it.
- **Very long note**: Only visible when expanded; it wraps to as many lines as needed.
- **Legacy entries (no title field stored)**: Treated as title = empty everywhere; no
  migration prompt, no change to their stored calories/note/time.
- **Accidental small swipe**: Below the activation threshold the row animates back with no
  action taken.
- **Swipe then scroll**: Starting a vertical scroll while a row is partly open closes the row.
- **Deleting the last entry of a day**: The list returns to its empty state as it does today.
- **Editing via left swipe on the Calendar screen**: Opens the edit form for the entry on the
  selected (possibly past) day, consistent with today's behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The entry form MUST include an optional **Title** text input, shown between the
  Calories input and the Note input.
- **FR-002**: The Title input MUST NOT be required — an entry can be saved with an empty title.
- **FR-003**: On saving, a non-empty title MUST be stored with the entry; an empty/whitespace
  title MUST be stored as "no title".
- **FR-004**: When editing an existing entry, the Title input MUST be pre-filled with the
  entry's stored title (empty if none).
- **FR-005**: The system MUST store the title per entry, alongside the existing calorie amount,
  optional note, and timestamp, using the same on-device storage as today.
- **FR-006**: An entry stored before this feature existed MUST be treated as having an empty
  title, with no change to its other stored values and no migration step visible to the user.
- **FR-007**: The compact (collapsed) entry row MUST show the entry's title where it currently
  shows the note; when the title is empty it MUST show the entry-type fallback label.
- **FR-008**: The collapsed row MUST otherwise look and behave as today (summary line + time +
  signed calorie amount).
- **FR-009**: Tapping anywhere on a collapsed entry row MUST expand it in place; tapping an
  expanded row MUST collapse it.
- **FR-010**: The expanded row MUST show the title, the note directly beneath it in a visually
  lighter tone, and the entry's calorie amount, date, and time.
- **FR-011**: Time in the expanded row MUST be displayed in 12-hour format with an AM/PM
  suffix.
- **FR-012**: The expanded row MUST omit the note line entirely when the entry has no note.
- **FR-013**: Row expansion state MUST NOT be persisted — every row starts collapsed when the
  screen is shown.
- **FR-014**: The edit and delete icon buttons MUST be removed from the entry row entirely.
- **FR-015**: Swiping an entry row to the right MUST initiate deletion of that entry; swiping
  it to the left MUST open the edit form for that entry.
- **FR-016**: While the user swipes a row to the right, a red background with a trash-can icon
  MUST be progressively revealed from the left edge, scaling with the drag distance, as a
  delete cue.
- **FR-017**: A swipe that does not pass the activation threshold MUST cancel with the row
  animating back to its resting position and no action taken.
- **FR-018**: Horizontal swipe gestures on a row MUST NOT break vertical scrolling of the list,
  and vertical scrolling MUST NOT accidentally trigger swipe actions.
- **FR-019**: At most one row may be open/mid-swipe at a time — swiping or opening another row
  MUST reset any previously open row.
- **FR-020**: Deletion via swipe MUST still show the current confirmation dialog; the entry is
  removed only after the user confirms, and the row returns to rest if the user cancels.
- **FR-021**: The Title field, the expand-on-tap behavior, and the swipe-to-edit/delete
  interaction MUST apply consistently to both food and exercise entries (the entry form and
  entry row are shared between the two types).
- **FR-022**: The entry list ordering (ascending by time) and the day-context behavior on the
  Today and Calendar screens MUST be unchanged.

### Key Entities *(include if feature involves data)*

- **Entry (Food / Exercise)**: The existing per-day entry gains an optional **Title** — a short
  free-text label, distinct from the existing free-text **Note**. All other attributes
  (calorie amount, note, timestamp, id) are unchanged. A title is absent on entries created
  before this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add an entry with a title in the same number of steps as before plus
  at most one extra field interaction.
- **SC-002**: From the day's list, a user can read an entry's full note and exact date/time
  without opening the edit form, in a single tap.
- **SC-003**: A user can delete an entry in one gesture (plus a confirmation step only if
  confirmation is retained) and edit an entry in one gesture.
- **SC-004**: In casual use, vertical scrolling of the entry list and horizontal row swipes do
  not interfere with each other — a user scrolling the list does not accidentally delete or
  open entries, verified across repeated trials.
- **SC-005**: 100% of entries created before this feature continue to display and open for
  editing correctly, showing an empty title.
- **SC-006**: The collapsed list remains as scannable as before — the row height for a
  collapsed entry does not increase.

## Assumptions

- **Applies to the shared entry form and row**: "Add food" is the wording in the request, but
  the entry form (`Add/Edit Food` and `Add/Edit Exercise`) and the entry row are the same
  component for both entry types, and the change applies to both (FR-021, confirmed in
  clarification).
- **Swipe = complete-on-release**: Swiping past a distance threshold and releasing performs the
  action (delete / open edit); it is not a "reveal a button to tap" interaction. A partial
  swipe springs back.
- **Independent expansion**: Multiple rows may be expanded at once; expanding one does not
  collapse others. (Only one row may be *swiped* open at a time — FR-019.)
- **Title length**: Titles are short single-line labels; there is no hard character limit
  enforced, but the collapsed row shows one truncated line.
- **Date/time source**: The date and AM/PM time shown in the expanded row come from the
  entry's existing stored timestamp; no new date/time data is captured.
- **Edit still uses the existing form screen**: Left-swipe navigates to the same entry form
  used today (now with the Title field), pre-filled — it is not an inline edit.
- **No undo**: There is no undo-after-delete mechanism; the retained confirmation dialog
  (FR-020) is the safeguard against an accidental delete.
- **History screen unaffected**: The net-calories History chart does not show individual
  entries and is unchanged.
