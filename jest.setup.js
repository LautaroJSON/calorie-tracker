// In-memory AsyncStorage so storage-layer functions work in tests without a device.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Reanimated ships a Jest mock; the circular-progress ring depends on it.
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// We don't test the third-party ring — stub it so CalorieRing's own centre content
// (the value <Text> we render as children) is what the tests see.
jest.mock("react-native-circular-progress-indicator", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Passthrough = ({ children }) => React.createElement(View, null, children);
  return { __esModule: true, default: Passthrough, CircularProgressBase: Passthrough };
});

// Stub every lucide icon as a plain View (keeps props like accessibilityLabel) — the
// icon package ships ESM that Jest's transform doesn't pick up, and we don't test glyphs.
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Icon = (props) => React.createElement(View, props);
  return new Proxy(
    { __esModule: true },
    { get: (target, key) => (key in target ? target[key] : Icon) }
  );
});
