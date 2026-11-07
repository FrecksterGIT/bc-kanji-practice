import { useEffect, useRef } from "react";

export const useGlobalEvent = <K extends keyof WindowEventMap>(
  type: K,
  handler: (e: WindowEventMap[K]) => void,
) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (e: WindowEventMap[K]) => handlerRef.current(e);
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type]);
};
