import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingSpinner } from "../../components/LoadingPlaceholder";
import { NetCaloriesChart, type NetCaloriesPoint } from "../../components/NetCaloriesChart";
import { computeNetCalories } from "../../lib/calculations/netCalories";
import { loadAllDayLogs } from "../../lib/storage/dayStorage";
import { todayIsoDate } from "../../lib/storage/keys";
import { colors, spacing, typography } from "../../lib/theme";

function addDays(date: string, amount: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}

export default function HistoryScreen() {
  const [points, setPoints] = useState<NetCaloriesPoint[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAllDayLogs().then((dayLogs) => {
        const today = todayIsoDate();

        if (dayLogs.length === 0) {
          setPoints([]);
          return;
        }

        const netByDate = new Map(
          dayLogs.map((log) => [log.date, computeNetCalories(log).netCalories])
        );

        const earliest = dayLogs[0].date;
        const series: NetCaloriesPoint[] = [];
        for (let date = earliest; date <= today; date = addDays(date, 1)) {
          series.push({ date, netCalories: netByDate.get(date) ?? 0 });
        }
        setPoints(series);
      });
    }, [])
  );

  if (points === null) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {points.length === 0 ? (
          <Text style={[typography.body, styles.empty]}>
            Log some entries to see your trend here.
          </Text>
        ) : (
          <NetCaloriesChart points={points} />
        )}
      </ScrollView>
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
  },
  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
