import { Alert, Platform } from "react-native";

export function confirmDestructive(
  title: string,
  message: string,
  onConfirm: () => void
): void {
  if (Platform.OS === "web") {
    // react-native-web's Alert.alert is a no-op, so confirmation needs the web-native dialog.
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}
