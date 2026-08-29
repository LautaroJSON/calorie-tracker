import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { formatClockTime, formatLongDate, localDateOf } from "../lib/datetime";
import { colors, radius, shadow, spacing, typography } from "../lib/theme";
import type { EntryType } from "../lib/types";

interface EntryRowProps {
  type: EntryType;
  calories: number;
  title?: string;
  note?: string;
  createdAt: string;
}

export function EntryRow({ type, calories, title, note, createdAt }: EntryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const sign = type === "food" ? "+" : "-";
  const label = title || (type === "food" ? "Food" : "Exercise");

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => setExpanded((open) => !open)}
    >
      <View style={styles.summary}>
        <View style={styles.info}>
          <Text style={typography.body}>{label}</Text>
          <Text style={styles.time}>{formatClockTime(createdAt)}</Text>
        </View>
        <Text style={[styles.calories, type === "exercise" && { color: colors.success }]}>
          {sign}
          {calories} kcal
        </Text>
      </View>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(120)}
          exiting={FadeOut.duration(90)}
          style={styles.details}
        >
          {note ? <Text style={styles.note}>{note}</Text> : null}
          <Text style={styles.meta}>
            {formatLongDate(localDateOf(createdAt))} · {formatClockTime(createdAt)}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadow.raisedSm,
  },
  rowPressed: {
    opacity: 0.7,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  time: {
    ...typography.caption,
  },
  calories: {
    ...typography.subtitle,
  },
  details: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
  },
});
