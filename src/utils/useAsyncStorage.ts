import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Updater<T> = T | ((prev: T) => T);

export function useAsyncStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: Updater<T>) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key).then((stored) => {
      if (stored !== null) {
        try {
          setValue(JSON.parse(stored) as T);
        } catch {
          // ignore parse error, keep default
        }
      }
      setLoaded(true);
    });
  }, [key]);

  const setStored = useCallback(
    (updater: Updater<T>) => {
      setValue((prev) => {
        const newValue =
          typeof updater === "function"
            ? (updater as (prev: T) => T)(prev)
            : updater;
        AsyncStorage.setItem(key, JSON.stringify(newValue)).catch(() => {});
        return newValue;
      });
    },
    [key]
  );

  return [value, setStored, loaded];
}
