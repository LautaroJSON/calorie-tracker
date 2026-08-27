import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileForm, type ProfileFormValues } from "../components/ProfileForm";
import { colors, spacing, typography } from "../lib/theme";
import { useProfileGate } from "../lib/profileGate";
import { saveProfile } from "../lib/storage/profileStorage";

export default function OnboardingScreen() {
  const { refreshProfile } = useProfileGate();

  async function handleSubmit(values: ProfileFormValues) {
    await saveProfile({ ...values, updatedAt: new Date().toISOString() });
    // Tells the root layout's Stack.Protected guard a profile now exists, so it swaps
    // to (tabs) on its own — a manual router.replace() here raced the guard's stale
    // state and silently did nothing until the app was reloaded.
    await refreshProfile();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={typography.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself so we can calculate your daily calorie goal.
          </Text>
        </View>
        <ProfileForm submitLabel="Get started" onSubmit={handleSubmit} />
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
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
