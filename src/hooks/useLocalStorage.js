import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {[*, function]} - [value, setValue] tuple
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
};

/**
 * Hook specifically for managing todos in localStorage
 * @returns {[object, function]} - [todos, setTodos] tuple
 */
export const useTodosStorage = () => {
  return useLocalStorage('todos', {});
};

/**
 * Hook for managing calendar settings in localStorage
 * @returns {[object, function]} - [settings, setSettings] tuple
 */
export const useCalendarSettings = () => {
  const defaultSettings = {
    startOfWeek: 0, // 0 = Sunday, 1 = Monday
    theme: 'light',
    dateFormat: 'short'
  };
  
  return useLocalStorage('calendarSettings', defaultSettings);
};

/**
 * Utility function to clear all app data from localStorage
 */
export const clearAppData = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keysToRemove = ['todos', 'calendarSettings'];
    keysToRemove.forEach(key => {
      window.localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app data:', error);
  }
};

/**
 * Utility function to check if localStorage is available
 * @returns {boolean} - True if localStorage is available
 */
export const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Hook to get localStorage availability status
 * @returns {boolean} - True if localStorage is available
 */
export const useLocalStorageAvailable = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(isLocalStorageAvailable());
  }, []);

  return isAvailable;
};