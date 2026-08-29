import { CircularProgressBase } from "react-native-circular-progress-indicator";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { colors, spacing, typography } from "../lib/theme";
import { useCountUp } from "../lib/useCountUp";

interface CalorieRingProps {
  netCalories: number;
  dailyGoal: number;
  isOverGoal: boolean;
  overageAmount: number;
  uncompensatedExcess: number;
}

export function CalorieRing({
  netCalories,
  dailyGoal,
  isOverGoal,
  overageAmount,
  uncompensatedExcess,
}: CalorieRingProps) {
  const activeColor = isOverGoal ? colors.danger : colors.primary;
  // The library's built-in center value is animated through Reanimated's native
  // `text` prop, which renders blank on RN's New Architecture in release Android
  // builds. Draw our own centered <Text> instead, with a JS-driven count-up.
  const displayValue = useCountUp(netCalories);

  return (
    <Card style={styles.container}>
      {uncompensatedExcess > 0 && <Text style={styles.ringLabel}>(-{uncompensatedExcess})</Text>}
      <CircularProgressBase
        value={netCalories}
        maxValue={Math.max(dailyGoal, 1)}
        radius={90}
        activeStrokeColor={activeColor}
        activeStrokeWidth={14}
        inActiveStrokeColor={colors.background}
        inActiveStrokeWidth={14}
      >
        <View style={styles.centerContent}>
          <Text style={styles.centerValue}>{displayValue}</Text>
          <Text style={styles.centerTitle}>kcal</Text>
        </View>
      </CircularProgressBase>
      {isOverGoal ? (
        <Text style={[styles.statusText, { color: colors.danger }]}>
          Goal exceeded by {overageAmount} kcal
        </Text>
      ) : (
        <Text style={styles.statusText}>Goal: {dailyGoal} kcal</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
  },
  ringLabel: {
    ...typography.subtitle,
    color: colors.danger,
  },
  centerContent: {
    alignItems: "center",
  },
  centerValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  centerTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusText: {
    ...typography.caption,
  },
});
