import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { loadProfile } from "./storage/profileStorage";

interface ProfileGateContextValue {
  hasProfile: boolean | null;
  refreshProfile: () => Promise<void>;
}

const ProfileGateContext = createContext<ProfileGateContextValue | null>(null);

export function ProfileGateProvider({ children }: { children: ReactNode }) {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const refreshProfile = useCallback(async () => {
    const profile = await loadProfile();
    setHasProfile(profile !== null);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <ProfileGateContext.Provider value={{ hasProfile, refreshProfile }}>
      {children}
    </ProfileGateContext.Provider>
  );
}

// Lets onboarding tell the root layout "the profile now exists" right after saving it,
// so the Stack.Protected guard flips and swaps to (tabs) without requiring an app reload.
export function useProfileGate() {
  const ctx = useContext(ProfileGateContext);
  if (!ctx) {
    throw new Error("useProfileGate must be used within a ProfileGateProvider");
  }
  return ctx;
}
