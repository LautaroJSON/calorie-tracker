import { fireEvent, render, screen } from "@testing-library/react-native";

import { EntryRow } from "../EntryRow";

// A fixed local timestamp: 2026-03-05 07:05 local.
const CREATED_AT = new Date(2026, 2, 5, 7, 5).toISOString();

describe("EntryRow", () => {
  it("shows the title in the summary line", async () => {
    await render(
      <EntryRow type="food" calories={450} title="Breakfast" createdAt={CREATED_AT} />
    );
    expect(screen.getByText("Breakfast")).toBeTruthy();
    expect(screen.getByText("+450 kcal")).toBeTruthy();
  });

  it("falls back to the entry type when there is no title", async () => {
    await render(<EntryRow type="food" calories={200} createdAt={CREATED_AT} />);
    expect(screen.getByText("Food")).toBeTruthy();

    await render(<EntryRow type="exercise" calories={120} createdAt={CREATED_AT} />);
    expect(screen.getByText("Exercise")).toBeTruthy();
  });

  it("has no edit or delete buttons", async () => {
    await render(
      <EntryRow type="food" calories={450} title="Breakfast" createdAt={CREATED_AT} />
    );
    expect(screen.queryByLabelText("Edit entry")).toBeNull();
    expect(screen.queryByLabelText("Delete entry")).toBeNull();
  });

  it("expands on tap to show the note and a date · time line, and collapses again", async () => {
    await render(
      <EntryRow
        type="food"
        calories={600}
        title="Lunch"
        note="grilled chicken salad"
        createdAt={CREATED_AT}
      />
    );

    // collapsed: note not shown
    expect(screen.queryByText("grilled chicken salad")).toBeNull();

    await fireEvent.press(screen.getByText("Lunch"));
    expect(screen.getByText("grilled chicken salad")).toBeTruthy();
    expect(screen.getByText("05 - March - 2026 · 7:05 AM")).toBeTruthy();

    await fireEvent.press(screen.getByText("Lunch"));
    expect(screen.queryByText("grilled chicken salad")).toBeNull();
  });

  it("shows no note line when expanded and the entry has no note", async () => {
    await render(<EntryRow type="food" calories={300} title="Snack" createdAt={CREATED_AT} />);
    await fireEvent.press(screen.getByText("Snack"));
    expect(screen.getByText("05 - March - 2026 · 7:05 AM")).toBeTruthy();
    // the meta line is the only extra text; no empty note row
  });

  it("shows the time in 12-hour AM/PM form", async () => {
    const pm = new Date(2026, 2, 5, 13, 30).toISOString();
    await render(<EntryRow type="food" calories={500} title="Merienda" createdAt={pm} />);
    expect(screen.getByText("1:30 PM")).toBeTruthy();
  });
});
