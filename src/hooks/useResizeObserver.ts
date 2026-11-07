import { RefObject, useEffect, useRef, useState } from "react";

export type ElementSize = { width: number; height: number };

export const useResizeObserver = (
  ref: RefObject<HTMLElement | null>,
  debounceMs = 100,
): ElementSize | undefined => {
  const [size, setSize] = useState<ElementSize>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSize({ width, height }), debounceMs);
    });
    observer.observe(element);

    return () => {
      clearTimeout(timerRef.current);
      observer.disconnect();
    };
  }, [ref, debounceMs]);

  return size;
};
