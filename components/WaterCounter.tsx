import {
  CircleArrowDown,
  CircleArrowUp,
  GlassWater,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  WATER_STEP_ML,
  nextWaterMl,
  waterFillRatio,
} from "../lib/calculations/water";
import { claySquish, colors, spacing, typography } from "../lib/theme";
import { Card } from "./Card";

interface WaterCounterProps {
  waterMl: number;
  goalMl: number;
  onChange: (nextMl: number) => void;
}

// Vertical water gauge shown next to the calorie ring when water tracking is on. The bar fills
// toward the daily goal; the arrows add / remove one glass (50 ml).
export function WaterCounter({ waterMl, goalMl, onChange }: WaterCounterProps) {
  const fillPercent = `${waterFillRatio(waterMl, goalMl) * 100}%` as const;

  return (
    <Card style={styles.container}>
      <View style={styles.gaugeRow}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { height: fillPercent }]} />
        </View>
        <View style={styles.arrows}>
          <Pressable
            accessibilityLabel="Add 50 ml water"
            style={({ pressed }) => claySquish(pressed)}
            onPress={() => onChange(nextWaterMl(waterMl, WATER_STEP_ML))}
          >
            <CircleArrowUp color={colors.primary} size={30} />
          </Pressable>
          <Pressable
            accessibilityLabel="Remove 50 ml water"
            style={({ pressed }) => claySquish(pressed)}
            onPress={() => onChange(nextWaterMl(waterMl, -WATER_STEP_ML))}
          >
            <CircleArrowDown color={colors.textSecondary} size={30} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.label}>
        {waterMl} / {goalMl}
      </Text>
      <GlassWater color={colors.textSecondary} size={20} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  gaugeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  barTrack: {
    width: 16,
    height: 170,
    borderRadius: 8,
    backgroundColor: colors.background,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  arrows: {
    gap: spacing.xs,
  },
  label: {
    textAlign: "center",
    width: 71,
    ...typography.caption,
  },
});
