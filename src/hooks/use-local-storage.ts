"use client"
import { useState, useEffect, useCallback } from 'react';

const isClient = typeof window !== 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isClient) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (isClient) {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
              const parsedItem = JSON.parse(item);
              if (JSON.stringify(parsedItem) !== JSON.stringify(storedValue)) {
                  setStoredValue(parsedItem);
              }
            }
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
        }
    }
  }, [key, storedValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (!isClient) {
        console.warn(`Tried to set localStorage key “${key}” from the server.`);
        return;
      }
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
