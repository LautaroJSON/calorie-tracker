import { StyleSheet, View } from "react-native";

import { spacing } from "../lib/theme";
import { CalorieRing } from "./CalorieRing";
import { WaterCounter } from "./WaterCounter";

interface DayOverviewProps {
  netCalories: number;
  dailyGoal: number;
  isOverGoal: boolean;
  overageAmount: number;
  uncompensatedExcess: number;
  water?: {
    waterMl: number;
    goalMl: number;
    onChange: (nextMl: number) => void;
  } | null;
}

// Wraps the calorie ring and, when water tracking is enabled, the water gauge beside it. With
// no `water` prop it renders the ring exactly as before this feature.
export function DayOverview({ water, ...ringProps }: DayOverviewProps) {
  if (!water) {
    return <CalorieRing {...ringProps} />;
  }

  return (
    <View style={styles.row}>
      <CalorieRing {...ringProps} />
      <WaterCounter
        waterMl={water.waterMl}
        goalMl={water.goalMl}
        onChange={water.onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: spacing.md,
  },
});
