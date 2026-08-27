import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { ChevronDown } from "lucide-react-native";

import { claySquish, colors, radius, shadow, spacing, typography } from "../lib/theme";

interface SelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  accessibilityLabel: string;
}

// A lightweight single-select dropdown for Expo Go: a Pressable trigger that opens a
// scrollable option list in React Native's built-in Modal (same pattern as InfoDialog) —
// no native picker dependency, per the project constitution.
export function Select({ value, options, onChange, accessibilityLabel }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          claySquish(pressed),
        ]}
      >
        <Text style={styles.triggerText}>{value}</Text>
        <ChevronDown size={16} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      claySquish(pressed),
                    ]}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <Text style={selected ? styles.optionTextSelected : styles.optionText}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    minWidth: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    // Match FormTextInput's box so selects and text fields line up.
    borderWidth: 2,
    borderColor: "transparent",
  },
  triggerOpen: {
    borderColor: colors.primary,
  },
  triggerText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 220,
    maxHeight: "60%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    ...shadow.raised,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    fontSize: 16,
  },
  optionTextSelected: {
    ...typography.body,
    fontSize: 16,
    color: colors.surface,
    fontWeight: "700",
  },
});
