import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value by specified delay (default: 400ms)
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 400ms)
 * @returns Debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
