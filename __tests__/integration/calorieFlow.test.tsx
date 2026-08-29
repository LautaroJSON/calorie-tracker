import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen } from "@testing-library/react-native";

import { CalorieRing } from "../../components/CalorieRing";
import { computeNetCalories } from "../../lib/calculations/netCalories";
import { addEntry, deleteEntry, loadDayLog, updateEntry } from "../../lib/storage/dayStorage";

jest.mock("../../lib/useCountUp", () => ({
  useCountUp: (target: number) => Math.round(target),
}));

const DATE = "2026-08-29";

// Builds the calorie ring from whatever is currently in storage for the day — the same
// data path the Today / Calendar screens use (loadDayLog -> computeNetCalories -> <CalorieRing>).
async function ringFromStorage() {
  const log = await loadDayLog(DATE);
  const { netCalories, uncompensatedExcess } = computeNetCalories(log);
  return (
    <CalorieRing
      netCalories={netCalories}
      dailyGoal={2000}
      isOverGoal={false}
      overageAmount={0}
      uncompensatedExcess={uncompensatedExcess}
    />
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("calorie entry flow → calorie ring", () => {
  it("reflects an add, then an edit, then a delete of a food entry", async () => {
    // Alta
    await addEntry(DATE, "food", { calories: 500 });
    const { rerender } = await render(await ringFromStorage());
    expect(screen.getByText("500")).toBeTruthy();

    // Modificación
    const afterAdd = await loadDayLog(DATE);
    await updateEntry(DATE, "food", afterAdd.foodEntries[0].id, { calories: 800 });
    await rerender(await ringFromStorage());
    expect(screen.getByText("800")).toBeTruthy();
    expect(screen.queryByText("500")).toBeNull();

    // Baja (eliminar el alta)
    await deleteEntry(DATE, "food", afterAdd.foodEntries[0].id);
    await rerender(await ringFromStorage());
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("subtracts exercise calories from food in the ring value", async () => {
    await addEntry(DATE, "food", { calories: 600 });
    await addEntry(DATE, "exercise", { calories: 200 });
    await render(await ringFromStorage());
    expect(screen.getByText("400")).toBeTruthy();
  });

  it("never shows a negative net value when exercise exceeds food", async () => {
    await addEntry(DATE, "food", { calories: 100 });
    await addEntry(DATE, "exercise", { calories: 500 });
    await render(await ringFromStorage());
    expect(screen.getByText("0")).toBeTruthy();
    // the uncompensated excess badge appears instead
    expect(screen.getByText("(-400)")).toBeTruthy();
  });
});
