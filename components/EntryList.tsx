import { StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { EntryRow } from "./EntryRow";
import { colors, typography } from "../lib/theme";
import type { DayLog, EntryType } from "../lib/types";

export interface EntryListItem {
  type: EntryType;
  id: string;
  calories: number;
  title?: string;
  note?: string;
  createdAt: string;
}

interface EntryListProps {
  dayLog: DayLog;
  emptyMessage?: string;
  onEdit?: (item: EntryListItem) => void;
  onDelete?: (item: EntryListItem) => void;
}

export function EntryList({
  dayLog,
  emptyMessage = "No entries yet.",
  onEdit,
  onDelete,
}: EntryListProps) {
  const items: EntryListItem[] = [
    ...dayLog.foodEntries.map((entry) => ({ type: "food" as const, ...entry })),
    ...dayLog.exerciseEntries.map((entry) => ({ type: "exercise" as const, ...entry })),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (items.length === 0) {
    return (
      <Card style={styles.emptyContainer}>
        <Text style={[typography.caption, styles.emptyText]}>{emptyMessage}</Text>
      </Card>
    );
  }

  return (
    <View>
      {items.map((item) => (
        <EntryRow
          key={item.id}
          type={item.type}
          calories={item.calories}
          note={item.note}
          createdAt={item.createdAt}
          onEdit={onEdit ? () => onEdit(item) : undefined}
          onDelete={onDelete ? () => onDelete(item) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
