import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, shadow, spacing } from "../lib/theme";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// A puffy, raised surface — the base building block of the app's claymorphism look.
export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.raised,
  },
});
