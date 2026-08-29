// Mocks the native gesture-handler module so components that import it work under Jest.
require("react-native-gesture-handler/jestSetup");

// In-memory AsyncStorage so storage-layer functions work in tests without a device.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Hand-rolled reanimated mock — `react-native-reanimated/mock` pulls in
// react-native-worklets native initializers that crash under Jest. We only need the pieces
// EntryRow / SwipeableRow use.
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");
  const chainable = new Proxy(() => chainable, { get: () => () => chainable });
  const Anim = React.forwardRef(({ entering, exiting, layout, ...rest }, ref) =>
    React.createElement(View, { ...rest, ref })
  );
  return {
    __esModule: true,
    default: { View: Anim, createAnimatedComponent: (c) => c },
    View: Anim,
    FadeIn: chainable,
    FadeOut: chainable,
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    interpolate: (value) => value,
    runOnJS: (fn) => fn,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withSpring: (v) => v,
    withTiming: (v) => v,
    withDelay: (_, v) => v,
  };
});

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
