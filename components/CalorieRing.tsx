import CircularProgress from "react-native-circular-progress-indicator";
import { StyleSheet, Text } from "react-native";

import { Card } from "./Card";
import { colors, spacing, typography } from "../lib/theme";

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

  return (
    <Card style={styles.container}>
      {uncompensatedExcess > 0 && <Text style={styles.ringLabel}>(-{uncompensatedExcess})</Text>}
      <CircularProgress
        value={netCalories}
        maxValue={Math.max(dailyGoal, 1)}
        radius={90}
        activeStrokeColor={activeColor}
        activeStrokeWidth={14}
        inActiveStrokeColor={colors.background}
        inActiveStrokeWidth={14}
        progressValueColor={colors.textPrimary}
        progressValueFontSize={32}
        title="kcal"
        titleColor={colors.textSecondary}
      />
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
  statusText: {
    ...typography.caption,
  },
});
