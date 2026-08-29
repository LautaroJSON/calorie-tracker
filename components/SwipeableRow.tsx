import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, radius, spacing } from "../lib/theme";

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeLeft: () => void; // edit
  onSwipeRight: () => void; // delete (caller shows the confirmation dialog)
}

// Distance the row must be dragged past for the gesture to fire on release.
const THRESHOLD = 96;
const MAX_DRAG = 140;

export function SwipeableRow({ children, onSwipeLeft, onSwipeRight }: SwipeableRowProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      translateX.value = Math.min(Math.max(e.translationX, -MAX_DRAG), MAX_DRAG);
    })
    .onEnd(() => {
      if (translateX.value > THRESHOLD) {
        runOnJS(onSwipeRight)();
      } else if (translateX.value < -THRESHOLD) {
        runOnJS(onSwipeLeft)();
      }
      translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // The red delete panel fades/scales in as the row is dragged right.
  const deletePanelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const deleteIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(translateX.value, [0, THRESHOLD], [0.6, 1], Extrapolation.CLAMP) },
    ],
  }));

  // The blue edit panel does the same on a left drag.
  const editPanelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));
  const editIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(translateX.value, [-THRESHOLD, 0], [1, 0.6], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.background, styles.deleteBackground, deletePanelStyle]}
        pointerEvents="none"
      >
        <Animated.View style={deleteIconStyle}>
          <Trash2 size={22} color={colors.surface} />
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={[styles.background, styles.editBackground, editPanelStyle]}
        pointerEvents="none"
      >
        <Animated.View style={editIconStyle}>
          <Pencil size={22} color={colors.surface} />
        </Animated.View>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: spacing.sm, // clear the row's marginBottom
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  deleteBackground: {
    backgroundColor: colors.danger,
    justifyContent: "flex-start",
  },
  editBackground: {
    backgroundColor: colors.primary,
    justifyContent: "flex-end",
  },
});
