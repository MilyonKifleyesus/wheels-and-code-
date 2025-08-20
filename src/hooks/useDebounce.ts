import { useEffect, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function debounced(...args: Parameters<T>) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      fn(...args);
    }, delayMs);
  }

  return debounced as T;
}
