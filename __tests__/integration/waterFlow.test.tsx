import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { DayOverview } from "../../components/DayOverview";
import { WaterCounter } from "../../components/WaterCounter";
import { loadDayLog, setDayWaterMl } from "../../lib/storage/dayStorage";
import type { DayLog } from "../../lib/types";

jest.mock("../../lib/useCountUp", () => ({
  useCountUp: (target: number) => Math.round(target),
}));

const DATE = "2026-08-29";

// Wires WaterCounter to storage the way the Today / Calendar screens do:
// onChange -> setDayWaterMl(date, n) -> reload the day into state.
function WaterFlowHarness({ date }: { date: string }) {
  const [log, setLog] = useState<DayLog | null>(null);
  useEffect(() => {
    loadDayLog(date).then(setLog);
  }, [date]);

  if (!log) return null;
  return (
    <WaterCounter
      waterMl={log.waterMl}
      goalMl={2000}
      onChange={(nextMl) => {
        setDayWaterMl(date, nextMl).then(setLog);
      }}
    />
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("water counter flow → storage", () => {
  it("adds 50 ml per up tap, shows it, and persists it", async () => {
    await render(<WaterFlowHarness date={DATE} />);
    expect(await screen.findByText("0 / 2000")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));

    expect(await screen.findByText("150 / 2000")).toBeTruthy();
    expect((await loadDayLog(DATE)).waterMl).toBe(150);
  });

  it("removes 50 ml per down tap and never goes below zero", async () => {
    await setDayWaterMl(DATE, 50);
    await render(<WaterFlowHarness date={DATE} />);
    expect(await screen.findByText("50 / 2000")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));
    await fireEvent.press(screen.getByLabelText("Remove 50 ml water"));

    expect(await screen.findByText("0 / 2000")).toBeTruthy();
    expect((await loadDayLog(DATE)).waterMl).toBe(0);
  });

  it("keeps each day's water independent", async () => {
    const other = "2026-08-28";
    await setDayWaterMl(other, 300);
    await render(<WaterFlowHarness date={DATE} />);
    expect(await screen.findByText("0 / 2000")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Add 50 ml water"));
    expect(await screen.findByText("50 / 2000")).toBeTruthy();

    expect((await loadDayLog(other)).waterMl).toBe(300);
    expect((await loadDayLog(DATE)).waterMl).toBe(50);
  });
});

describe("DayOverview water visibility", () => {
  it("hides the water counter when tracking is off and shows it when on", async () => {
    await setDayWaterMl(DATE, 250);
    const log = await loadDayLog(DATE);
    const ringProps = {
      netCalories: 0,
      dailyGoal: 2000,
      isOverGoal: false,
      overageAmount: 0,
      uncompensatedExcess: 0,
    };

    const { rerender } = await render(<DayOverview {...ringProps} water={null} />);
    expect(screen.queryByText("250 / 2000")).toBeNull();

    await rerender(
      <DayOverview
        {...ringProps}
        water={{ waterMl: log.waterMl, goalMl: 2000, onChange: () => {} }}
      />
    );
    expect(screen.getByText("250 / 2000")).toBeTruthy();
  });
});
