import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileForm, type ProfileFormValues } from "../components/ProfileForm";
import { LoadingSpinner } from "../components/LoadingPlaceholder";
import { loadProfile, saveProfile } from "../lib/storage/profileStorage";
import { colors, spacing } from "../lib/theme";
import type { UserProfile } from "../lib/types";

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile);
    }, [])
  );

  async function handleSubmit(values: ProfileFormValues) {
    await saveProfile({ ...values, updatedAt: new Date().toISOString() });
    router.back();
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ProfileForm
          initialValues={profile}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
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
});
