import { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { colors, radius, spacing } from "../lib/theme";

// Shared text field for the app's forms: consistent claymorphism styling, a muted placeholder
// colour, and a blue focus ring instead of the browser/platform default.
export function FormTextInput({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.placeholder}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[styles.input, focused && styles.inputFocused, focused && webFocusStyle, style]}
    />
  );
}

// react-native-web renders TextInput as an <input>; recolour its focus outline to match.
// No-op on native (outline* are web-only style props).
const webFocusStyle =
  Platform.OS === "web"
    ? ({ outlineColor: colors.primary, outlineWidth: 2, outlineOffset: 1 } as unknown as TextStyle)
    : null;

const styles = StyleSheet.create({
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: colors.primary,
  },
});
