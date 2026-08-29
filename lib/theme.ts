// Claymorphism-inspired design tokens: soft, rounded, high-contrast shapes that "pop" off
// a tinted canvas using shadow (not borders) to read as puffy 3D surfaces. Native
// StyleSheet only — see .claude/skills/claymorphism for the source design-system guidance.

export const colors = {
  background: "#E9EFFC",
  surface: "#FFFFFF",
  border: "#D7E0F5",
  textPrimary: "#1C398E",
  textSecondary: "#5B6B9A",
  // Muted grey for TextInput placeholders — noticeably lighter than textSecondary so hint
  // text never reads as a filled-in value. RN's default placeholder color varies by platform,
  // so every TextInput sets `placeholderTextColor={colors.placeholder}` explicitly.
  placeholder: "#A9B2CC",
  primary: "#3B82F6",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  full: 999,
} as const;

// A single soft directional shadow stands in for claymorphism's puffy dual-shadow look.
// Uses the cross-platform `boxShadow` style prop (React Native 0.76+, New Architecture) —
// one value that renders on both iOS and Android, replacing the deprecated `shadow*` props
// and `elevation`. `raised` surfaces read as popped off the tinted canvas; flat/sunken
// surfaces (inputs, unselected pills) simply omit it. Colour is #3B5BA9 (rgb 59,91,169).
export const shadow = {
  raised: {
    boxShadow: "0px 8px 16px rgba(59, 91, 169, 0.18)",
  },
  raisedSm: {
    boxShadow: "0px 4px 8px rgba(59, 91, 169, 0.15)",
  },
} as const;

// Squish-on-press feedback for clay-style buttons and chips: spread the result onto a
// Pressable's style array using its `pressed` render prop.
export function claySquish(pressed: boolean) {
  return pressed ? { transform: [{ scale: 0.96 as const }], opacity: 0.9 } : null;
}

export const typography = {
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  // Small uppercase, letter-spaced field/section labels — the "label-caps" accent from
  // the claymorphism type scale, kept separate from `caption` so sentences (empty states,
  // dialog copy, timestamps) never get forced into all-caps.
  label: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
  },
};
