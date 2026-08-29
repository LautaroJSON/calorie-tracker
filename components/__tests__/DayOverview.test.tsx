import { render, screen } from "@testing-library/react-native";

import { DayOverview } from "../DayOverview";

jest.mock("../../lib/useCountUp", () => ({
  useCountUp: (target: number) => Math.round(target),
}));

const ringProps = {
  netCalories: 900,
  dailyGoal: 2000,
  isOverGoal: false,
  overageAmount: 0,
  uncompensatedExcess: 0,
};

describe("DayOverview", () => {
  it("shows only the calorie ring when there is no water prop", async () => {
    await render(<DayOverview {...ringProps} />);
    expect(screen.getByText("900")).toBeTruthy();
    expect(screen.queryByLabelText("Add 50 ml water")).toBeNull();
  });

  it("shows only the calorie ring when water is null", async () => {
    await render(<DayOverview {...ringProps} water={null} />);
    expect(screen.queryByLabelText("Add 50 ml water")).toBeNull();
  });

  it("shows the water counter alongside the ring when water is provided", async () => {
    await render(
      <DayOverview
        {...ringProps}
        water={{ waterMl: 500, goalMl: 2000, onChange: () => {} }}
      />
    );
    expect(screen.getByText("900")).toBeTruthy();
    expect(screen.getByText("500 / 2000")).toBeTruthy();
    expect(screen.getByLabelText("Add 50 ml water")).toBeTruthy();
  });
});
