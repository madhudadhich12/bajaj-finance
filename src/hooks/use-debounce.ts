import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by the specified delay.
 * Returns the debounced value which only updates after the caller
 * stops changing the input value for `delay` milliseconds.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before the value is updated
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
