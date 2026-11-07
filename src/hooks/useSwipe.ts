import { RefObject, useEffect, useRef } from "react";

export type SwipeDirection = "left" | "right";

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/** Horizontal swipe direction, or undefined if the movement does not exceed `threshold`. */
export const getSwipeDirection = (
  startX: number,
  endX: number,
  threshold: number,
): SwipeDirection | undefined => {
  const distance = startX - endX;
  if (Math.abs(distance) <= threshold) return undefined;
  return distance > 0 ? "left" : "right";
};

export const useSwipe = (
  ref: RefObject<HTMLElement | null>,
  { threshold = 100, onSwipeLeft, onSwipeRight }: SwipeOptions,
) => {
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight });
  const startXRef = useRef<number | null>(null);
  const lastXRef = useRef(0);

  useEffect(() => {
    callbacksRef.current = { onSwipeLeft, onSwipeRight };
  }, [onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const start = (x: number) => {
      startXRef.current = x;
      lastXRef.current = x;
    };
    const move = (x: number) => {
      if (startXRef.current !== null) lastXRef.current = x;
    };
    const end = () => {
      const startX = startXRef.current;
      startXRef.current = null;
      if (startX === null) return;

      const direction = getSwipeDirection(startX, lastXRef.current, threshold);
      if (direction === "left") callbacksRef.current.onSwipeLeft?.();
      if (direction === "right") callbacksRef.current.onSwipeRight?.();
    };

    const onMouseDown = (e: MouseEvent) => start(e.clientX);
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX;
      if (x !== undefined) start(x);
    };
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX;
      if (x !== undefined) move(x);
    };
    const options = { passive: true };

    element.addEventListener("mousedown", onMouseDown, options);
    element.addEventListener("mousemove", onMouseMove, options);
    element.addEventListener("mouseup", end, options);
    element.addEventListener("mouseleave", end, options);
    element.addEventListener("touchstart", onTouchStart, options);
    element.addEventListener("touchmove", onTouchMove, options);
    element.addEventListener("touchend", end, options);
    element.addEventListener("touchcancel", end, options);

    return () => {
      element.removeEventListener("mousedown", onMouseDown);
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mouseup", end);
      element.removeEventListener("mouseleave", end);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", end);
      element.removeEventListener("touchcancel", end);
    };
  }, [ref, threshold]);
};
