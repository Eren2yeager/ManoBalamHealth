import { useState, useEffect } from "react";

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` milliseconds have elapsed since the last change.
 * Used by PsychologistFilters and any search input that fires on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
