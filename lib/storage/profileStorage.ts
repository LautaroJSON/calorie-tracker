import AsyncStorage from "@react-native-async-storage/async-storage";

import { PROFILE_KEY } from "./keys";
import type { UserProfile } from "../types";

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return null;
  }
  return {
    activityLevel: "sedentary",
    goal: "maintain",
    waterTrackingEnabled: false,
    waterGoalMl: 2000,
    ...JSON.parse(raw),
  } as UserProfile;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
