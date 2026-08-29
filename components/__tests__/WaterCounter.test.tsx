import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { WaterCounter } from "../WaterCounter";
import { nextWaterMl } from "../../lib/calculations/water";

// Stateful wrapper: mirrors how a screen wires WaterCounter (controlled value + onChange).
function Harness({ goalMl = 2000, initial = 0 }: { goalMl?: number; initial?: number }) {
  const [ml, setMl] = useState(initial);
  return <WaterCounter waterMl={ml} goalMl={goalMl} onChange={setMl} />;
}

describe("WaterCounter", () => {
  it("shows the current amount and goal", async () => {
    await render(<WaterCounter waterMl={350} goalMl={2500} onChange={() => {}} />);
    expect(screen.getByText("350 / 2500")).toBeTruthy();
  });

  it("adds 50 ml per up-arrow tap", async () => {
    await render(<Harness />);
    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    expect(screen.getByText("150 / 2000")).toBeTruthy();
  });

  it("removes 50 ml per down-arrow tap", async () => {
    await render(<Harness initial={200} />);
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    expect(screen.getByText("150 / 2000")).toBeTruthy();
  });

  it("never goes below zero", async () => {
    await render(<Harness initial={50} />);
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    expect(screen.getByText("0 / 2000")).toBeTruthy();
  });

  it("lets the amount exceed the goal", async () => {
    await render(<Harness goalMl={100} initial={100} />);
    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    expect(screen.getByText("150 / 100")).toBeTruthy();
  });

  it("calls onChange with the value from nextWaterMl", async () => {
    const onChange = jest.fn();
    await render(<WaterCounter waterMl={80} goalMl={2000} onChange={onChange} />);
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    expect(onChange).toHaveBeenCalledWith(nextWaterMl(80, -50));
  });
});
