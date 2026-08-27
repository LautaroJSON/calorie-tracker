import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { FormTextInput } from "./FormTextInput";
import { InfoDialog } from "./InfoDialog";
import { claySquish, colors, radius, shadow, spacing, typography } from "../lib/theme";
import type { ActivityLevel, Goal, Sex } from "../lib/types";

export interface ProfileFormValues {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface ProfileFormProps {
  initialValues?: ProfileFormValues;
  submitLabel: string;
  onSubmit: (values: ProfileFormValues) => void;
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "No physical activity — mostly sitting or lying down during the day.",
  },
  {
    value: "light",
    label: "Routine",
    description: "Walking or standing for parts of your day, e.g. at work.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Structured exercise about 3 times per week.",
  },
  {
    value: "active",
    label: "High",
    description: "Structured exercise 5 or more times per week.",
  },
];

const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  {
    value: "maintain",
    label: "Maintain",
    description: "Keep your current weight — no adjustment to your calorie target.",
  },
  {
    value: "lose",
    label: "Lose",
    description: "Lose weight — subtracts 500 kcal/day from your calorie target.",
  },
  {
    value: "gain",
    label: "Gain",
    description: "Gain weight — adds 500 kcal/day to your calorie target.",
  },
];

interface OptionRowProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function OptionRow<T extends string>({ options, value, onChange }: OptionRowProps<T>) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.optionPill,
              selected && styles.optionPillSelected,
              claySquish(pressed),
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={selected ? styles.optionTextSelected : styles.optionText}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProfileForm({ initialValues, submitLabel, onSubmit }: ProfileFormProps) {
  const [weightKg, setWeightKg] = useState(initialValues ? String(initialValues.weightKg) : "");
  const [heightCm, setHeightCm] = useState(initialValues ? String(initialValues.heightCm) : "");
  const [age, setAge] = useState(initialValues ? String(initialValues.age) : "");
  const [sex, setSex] = useState<Sex>(initialValues?.sex ?? "male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialValues?.activityLevel ?? "sedentary"
  );
  const [goal, setGoal] = useState<Goal>(initialValues?.goal ?? "maintain");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const parsedWeight = Number(weightKg);
    const parsedHeight = Number(heightCm);
    const parsedAge = Number(age);

    if (!weightKg || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Enter a weight greater than 0.");
      return;
    }
    if (!heightCm || !Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setError("Enter a height greater than 0.");
      return;
    }
    if (!age || !Number.isInteger(parsedAge) || parsedAge <= 0) {
      setError("Enter an age greater than 0.");
      return;
    }

    setError(null);
    onSubmit({
      weightKg: parsedWeight,
      heightCm: parsedHeight,
      age: parsedAge,
      sex,
      activityLevel,
      goal,
    });
  }

  return (
    <Card style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Weight (kg)</Text>
        <FormTextInput
          keyboardType="numeric"
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="70"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Height (cm)</Text>
        <FormTextInput
          keyboardType="numeric"
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="175"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Age</Text>
        <FormTextInput
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          placeholder="30"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sex</Text>
        <OptionRow options={SEX_OPTIONS} value={sex} onChange={setSex} />
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Activity Level</Text>
          <InfoDialog title="Activity Level" items={ACTIVITY_OPTIONS} />
        </View>
        <OptionRow options={ACTIVITY_OPTIONS} value={activityLevel} onChange={setActivityLevel} />
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Weight Goal</Text>
          <InfoDialog title="Weight Goal" items={GOAL_OPTIONS} />
        </View>
        <OptionRow options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  optionPill: {
    flexGrow: 1,
    flexBasis: "40%",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  optionPillSelected: {
    backgroundColor: colors.primary,
    ...shadow.raisedSm,
  },
  optionText: {
    color: colors.textPrimary,
  },
  optionTextSelected: {
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
