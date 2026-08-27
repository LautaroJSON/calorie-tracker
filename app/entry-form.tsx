import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryForm, type EntryFormValues } from "../components/EntryForm";
import { formatLongDate } from "../lib/datetime";
import { addEntry, updateEntry } from "../lib/storage/dayStorage";
import { todayIsoDate } from "../lib/storage/keys";
import { colors, spacing, typography } from "../lib/theme";
import type { EntryType } from "../lib/types";

export default function EntryFormScreen() {
  const router = useRouter();
  const raw = useLocalSearchParams<Record<string, string>>();
  const type = raw.type as EntryType;
  const date = raw.date ?? todayIsoDate();
  const entryId = raw.entryId;
  const isEdit = Boolean(entryId);
  const typeLabel = type === "food" ? "Food" : "Exercise";

  async function handleSubmit(values: EntryFormValues) {
    if (isEdit && entryId) {
      await updateEntry(date, type, entryId, values);
    } else {
      await addEntry(date, type, values);
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={[typography.title, styles.title]}>
          {isEdit ? `Edit ${typeLabel}` : `Add ${typeLabel}`}
        </Text>
        <Text style={styles.headerDate}>{formatLongDate(date)}</Text>
      </View>
      <EntryForm
        targetDate={date}
        submitLabel={isEdit ? "Save changes" : "Add entry"}
        initialValues={
          isEdit
            ? { calories: Number(raw.calories ?? 0), note: raw.note, createdAt: raw.createdAt }
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flexShrink: 1,
  },
  headerDate: {
    ...typography.caption,
    flexShrink: 1,
    textAlign: "right",
  },
});
