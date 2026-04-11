import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAsyncStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, boolean] {
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
    (newValue: T) => {
      setValue(newValue);
      AsyncStorage.setItem(key, JSON.stringify(newValue)).catch(() => {});
    },
    [key]
  );

  return [value, setStored, loaded];
}
