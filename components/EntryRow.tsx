import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";

import { claySquish, colors, radius, shadow, spacing, typography } from "../lib/theme";
import type { EntryType } from "../lib/types";

interface EntryRowProps {
  type: EntryType;
  calories: number;
  note?: string;
  createdAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function EntryRow({ type, calories, note, createdAt, onEdit, onDelete }: EntryRowProps) {
  const sign = type === "food" ? "+" : "-";

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={typography.body}>{note || (type === "food" ? "Food" : "Exercise")}</Text>
        <Text style={styles.time}>{formatTime(createdAt)}</Text>
      </View>
      <Text style={[styles.calories, type === "exercise" && { color: colors.success }]}>
        {sign}
        {calories} kcal
      </Text>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Pressable
              accessibilityLabel="Edit entry"
              onPress={onEdit}
              style={({ pressed }) => [styles.actionButton, claySquish(pressed)]}
            >
              <Pencil size={16} color={colors.textSecondary} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              accessibilityLabel="Delete entry"
              onPress={onDelete}
              style={({ pressed }) => [styles.actionButton, claySquish(pressed)]}
            >
              <Trash2 size={16} color={colors.danger} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadow.raisedSm,
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
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
});
