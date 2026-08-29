import { useEffect, useRef, useState } from "react";

// Animates a number from its current displayed value up/down to `target` over
// `duration` ms, updating on every animation frame. Pure JS (requestAnimationFrame)
// on purpose: animating text through Reanimated's native `text` prop is unreliable
// on RN's New Architecture (Fabric), which is exactly why the circular-progress
// library's built-in center value renders blank in release Android builds.
export function useCountUp(target: number, duration = 500): number {
  const [displayValue, setDisplayValue] = useState(() => Math.round(target));
  const fromRef = useRef(displayValue);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Math.round(target);
    if (from === to) return;

    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const current = Math.round(from + (to - from) * progress);
      setDisplayValue(current);
      fromRef.current = current;
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return displayValue;
}
