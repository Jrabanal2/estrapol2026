// frontend/src/hooks/usePersistedState.ts
import { useState, useEffect, useCallback } from 'react';

// Helper function for debounce
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export const usePersistedState = <T>(
  key: string, 
  defaultValue: T,
  options: {
    sessionStorage?: boolean;
    debounce?: number;
  } = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  const { sessionStorage = false, debounce: debounceTime = 300 } = options;
  
  const storage = sessionStorage ? window.sessionStorage : window.localStorage;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      // Si no hay datos guardados, intentar cargar desde localStorage si estamos usando sessionStorage
      if (sessionStorage) {
        const localItem = window.localStorage.getItem(key);
        if (localItem) {
          return JSON.parse(localItem);
        }
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return defaultValue;
    }
  });

  // Debounced save function
  const saveState = useCallback(
    debounce((value: T) => {
      try {
        storage.setItem(key, JSON.stringify(value));
        // También guardar en localStorage como backup si es sessionStorage
        if (sessionStorage) {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
        console.log(`💾 Estado guardado: ${key}`, value);
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
      }
    }, debounceTime),
    [key, storage, sessionStorage, debounceTime]
  );

  useEffect(() => {
    saveState(state);
  }, [state, saveState]);

  // Función para limpiar el estado guardado
  const clearState = useCallback(() => {
    try {
      storage.removeItem(key);
      if (sessionStorage) {
        window.localStorage.removeItem(key);
      }
      setState(defaultValue);
      console.log(`🗑️ Estado limpiado: ${key}`);
    } catch (error) {
      console.error(`Error clearing ${key} from storage:`, error);
    }
  }, [key, storage, sessionStorage, defaultValue]);

  return [state, setState, clearState];
};