import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DayOverview } from "../../components/DayOverview";
import { EntryList, type EntryListItem } from "../../components/EntryList";
import { LoadingSpinner } from "../../components/LoadingPlaceholder";
import { calculateDailyCalorieGoal } from "../../lib/calculations/calorieGoal";
import {
  computeGoalStatus,
  computeNetCalories,
} from "../../lib/calculations/netCalories";
import { confirmDestructive } from "../../lib/confirm";
import {
  deleteEntry,
  loadDayLog,
  setDayWaterMl,
} from "../../lib/storage/dayStorage";
import { todayIsoDate } from "../../lib/storage/keys";
import { loadProfile } from "../../lib/storage/profileStorage";
import {
  claySquish,
  colors,
  radius,
  shadow,
  spacing,
  typography,
} from "../../lib/theme";
import type { DayLog, UserProfile } from "../../lib/types";

export default function TodayScreen() {
  const router = useRouter();
  const today = todayIsoDate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const reload = useCallback(() => {
    loadProfile().then(setProfile);
    loadDayLog(today).then(setDayLog);
  }, [today]);

  useFocusEffect(reload);

  function openEntryForm(type: "food" | "exercise", item?: EntryListItem) {
    setAddMenuOpen(false);
    router.push({
      pathname: "/entry-form",
      params: {
        type,
        date: today,
        ...(item
          ? {
              entryId: item.id,
              calories: String(item.calories),
              title: item.title ?? "",
              note: item.note ?? "",
              createdAt: item.createdAt,
            }
          : {}),
      },
    });
  }

  function handleEdit(item: EntryListItem) {
    openEntryForm(item.type, item);
  }

  function handleDelete(item: EntryListItem) {
    confirmDestructive(
      "Delete entry",
      "Are you sure you want to delete this entry?",
      async () => {
        await deleteEntry(today, item.type, item.id);
        reload();
      },
    );
  }

  function handleWaterChange(nextMl: number) {
    setDayWaterMl(today, nextMl).then(setDayLog);
  }

  if (!profile || !dayLog) {
    return <LoadingSpinner />;
  }

  const dailyGoal = Math.round(calculateDailyCalorieGoal(profile));
  const {
    totalFoodCalories,
    totalExerciseCalories,
    netCalories,
    uncompensatedExcess,
  } = computeNetCalories(dayLog);
  const { isOverGoal, overageAmount } = computeGoalStatus(
    totalFoodCalories - totalExerciseCalories,
    dailyGoal,
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <DayOverview
          netCalories={netCalories}
          dailyGoal={dailyGoal}
          isOverGoal={isOverGoal}
          overageAmount={Math.round(overageAmount)}
          uncompensatedExcess={uncompensatedExcess}
          water={
            profile.waterTrackingEnabled
              ? {
                  waterMl: dayLog.waterMl,
                  goalMl: profile.waterGoalMl,
                  onChange: handleWaterChange,
                }
              : null
          }
        />
        <EntryList
          dayLog={dayLog}
          emptyMessage="No entries yet today."
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </ScrollView>

      {addMenuOpen && (
        <View style={styles.addMenu}>
          <Pressable
            style={({ pressed }) => [styles.addMenuItem, claySquish(pressed)]}
            onPress={() => openEntryForm("food")}
          >
            <Text style={styles.addMenuLabel}>Add Food</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.addMenuItem, claySquish(pressed)]}
            onPress={() => openEntryForm("exercise")}
          >
            <Text style={styles.addMenuLabel}>Add Exercise</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        accessibilityLabel="Add entry"
        style={({ pressed }) => [styles.fab, claySquish(pressed)]}
        onPress={() => setAddMenuOpen((open) => !open)}
      >
        <Plus color={colors.surface} size={28} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.raised,
  },
  addMenu: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg + 68,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadow.raised,
  },
  addMenuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addMenuLabel: {
    ...typography.body,
    fontSize: 15,
  },
});
