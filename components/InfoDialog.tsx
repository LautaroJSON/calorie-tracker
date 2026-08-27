import { useState } from "react";
import { Info } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { claySquish, colors, radius, shadow, spacing, typography } from "../lib/theme";

export interface InfoDialogItem {
  label: string;
  description: string;
}

interface InfoDialogProps {
  title: string;
  items: InfoDialogItem[];
}

export function InfoDialog({ title, items }: InfoDialogProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`What does ${title} mean?`}
        onPress={() => setVisible(true)}
        hitSlop={8}
        style={({ pressed }) => claySquish(pressed)}
      >
        <Info size={16} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={typography.subtitle}>{title}</Text>
            {items.map((item) => (
              <View key={item.label} style={styles.item}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            ))}
            <Pressable
              style={({ pressed }) => [styles.closeButton, claySquish(pressed)]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeLabel}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.raised,
  },
  item: {
    gap: 2,
  },
  itemLabel: {
    ...typography.body,
    fontWeight: "600",
  },
  itemDescription: {
    ...typography.caption,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
    ...shadow.raisedSm,
  },
  closeLabel: {
    color: colors.surface,
    fontWeight: "700",
  },
});
