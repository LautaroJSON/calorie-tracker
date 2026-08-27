import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { claySquish, colors, radius, shadow, spacing } from "../lib/theme";

export function ProfileIcon() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open profile settings"
      onPress={() => router.push("/settings")}
      style={({ pressed }) => [styles.circle, claySquish(pressed)]}
    >
      <User size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    ...shadow.raisedSm,
  },
});
