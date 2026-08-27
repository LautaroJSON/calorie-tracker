import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { FormTextInput } from "./FormTextInput";
import { Select } from "./Select";
import {
  clockFieldsFromDate,
  clockFieldsFromIso,
  combineDateAndTime,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  to24Hour,
  type Meridiem,
} from "../lib/datetime";
import { claySquish, colors, radius, shadow, spacing, typography } from "../lib/theme";

export interface EntryFormValues {
  calories: number;
  note?: string;
  createdAt: string;
}

interface EntryFormProps {
  targetDate: string;
  initialValues?: {
    calories: number;
    note?: string;
    createdAt?: string;
  };
  submitLabel: string;
  onSubmit: (values: EntryFormValues) => void;
}

const MERIDIEM_OPTIONS: Meridiem[] = ["AM", "PM"];

export function EntryForm({ targetDate, initialValues, submitLabel, onSubmit }: EntryFormProps) {
  const [calories, setCalories] = useState(
    initialValues ? String(initialValues.calories) : ""
  );
  const [note, setNote] = useState(initialValues?.note ?? "");

  const initialClock = initialValues?.createdAt
    ? clockFieldsFromIso(initialValues.createdAt)
    : clockFieldsFromDate(new Date());
  const [hour, setHour] = useState(String(initialClock.hour12));
  const [minute, setMinute] = useState(String(initialClock.minute).padStart(2, "0"));
  const [meridiem, setMeridiem] = useState<Meridiem>(initialClock.meridiem);

  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const parsedCalories = Number(calories);
    if (!calories || !Number.isFinite(parsedCalories) || parsedCalories <= 0) {
      setError("Enter a calorie amount greater than 0.");
      return;
    }

    setError(null);

    const { hours, minutes } = to24Hour(Number(hour), Number(minute), meridiem);
    const createdAt = combineDateAndTime(targetDate, hours, minutes);

    onSubmit({ calories: parsedCalories, note: note.trim() || undefined, createdAt });
  }

  return (
    <Card style={styles.container}>
      <View style={styles.field}>
        <Text style={typography.label}>Calories</Text>
        <FormTextInput
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
          placeholder="500"
          autoFocus
        />
      </View>

      <View style={styles.field}>
        <Text style={typography.label}>Note (optional)</Text>
        <FormTextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Lunch"
        />
      </View>

      <View style={styles.field}>
        <Text style={typography.label}>Time (optional)</Text>
        <View style={styles.timeRow}>
          <Select
            value={hour}
            options={HOUR_OPTIONS}
            onChange={setHour}
            accessibilityLabel="Hour"
          />
          <Text style={styles.timeSeparator}>:</Text>
          <Select
            value={minute}
            options={MINUTE_OPTIONS}
            onChange={setMinute}
            accessibilityLabel="Minutes"
          />
          <View style={styles.meridiemGroup}>
            {MERIDIEM_OPTIONS.map((option) => {
              const selected = option === meridiem;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.meridiemPill,
                    selected && styles.meridiemPillSelected,
                    claySquish(pressed),
                  ]}
                  onPress={() => setMeridiem(option)}
                >
                  <Text style={selected ? styles.meridiemTextSelected : styles.meridiemText}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={({ pressed }) => [styles.submitButton, claySquish(pressed)]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitLabel}>{submitLabel}</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  meridiemGroup: {
    flexDirection: "row",
    gap: spacing.xs,
    marginLeft: spacing.xs,
  },
  meridiemPill: {
    minWidth: 52,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  meridiemPillSelected: {
    backgroundColor: colors.primary,
    ...shadow.raisedSm,
  },
  meridiemText: {
    color: colors.textPrimary,
  },
  meridiemTextSelected: {
    color: colors.surface,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    ...shadow.raisedSm,
  },
  submitLabel: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
});
