import { render, screen } from "@testing-library/react-native";

import { CalorieRing } from "../CalorieRing";

// The count-up animation is a display detail, not what these tests are about — freeze it to
// the target value so assertions are deterministic.
jest.mock("../../lib/useCountUp", () => ({
  useCountUp: (target: number) => Math.round(target),
}));

const baseProps = {
  netCalories: 0,
  dailyGoal: 2000,
  isOverGoal: false,
  overageAmount: 0,
  uncompensatedExcess: 0,
};

describe("CalorieRing", () => {
  it("shows the net calories value and the kcal label", async () => {
    await render(<CalorieRing {...baseProps} netCalories={1450} />);
    expect(screen.getByText("1450")).toBeTruthy();
    expect(screen.getByText("kcal")).toBeTruthy();
  });

  it("shows the daily goal when under goal", async () => {
    await render(<CalorieRing {...baseProps} netCalories={1200} dailyGoal={2000} />);
    expect(screen.getByText("Goal: 2000 kcal")).toBeTruthy();
  });

  it("shows the overage message when over goal", async () => {
    await render(
      <CalorieRing
        {...baseProps}
        netCalories={2300}
        dailyGoal={2000}
        isOverGoal
        overageAmount={300}
      />
    );
    expect(screen.getByText("Goal exceeded by 300 kcal")).toBeTruthy();
    expect(screen.queryByText("Goal: 2000 kcal")).toBeNull();
  });

  it("shows the uncompensated-excess badge only when it is positive", async () => {
    const { rerender } = await render(<CalorieRing {...baseProps} uncompensatedExcess={0} />);
    expect(screen.queryByText("(-0)")).toBeNull();

    await rerender(<CalorieRing {...baseProps} uncompensatedExcess={150} />);
    expect(screen.getByText("(-150)")).toBeTruthy();
  });
});
