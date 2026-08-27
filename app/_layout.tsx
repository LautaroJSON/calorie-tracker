import { Stack } from "expo-router";

import { LoadingSpinner } from "../components/LoadingPlaceholder";
import { ProfileGateProvider, useProfileGate } from "../lib/profileGate";

function RootNavigator() {
  const { hasProfile } = useProfileGate();

  if (hasProfile === null) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: "Settings", presentation: "modal" }}
        />
        <Stack.Screen
          name="entry-form"
          options={{ headerShown: true, title: "Add Entry", presentation: "modal" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProfileGateProvider>
      <RootNavigator />
    </ProfileGateProvider>
  );
}
