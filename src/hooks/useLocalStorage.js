import { useState, useEffect } from 'react';
import { 
  StorageError, 
  handleStorageOperation, 
  logError 
} from '../utils/errorUtils';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {[*, function, object]} - [value, setValue, status] tuple
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    return handleStorageOperation(() => {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    }, `getItem:${key}`);
  });

  // Status object to track operations
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    lastUpdated: null
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      setStatus({ loading: true, error: null, lastUpdated: null });
      
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to local storage first
      if (typeof window !== 'undefined') {
        handleStorageOperation(() => {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }, `setItem:${key}`);
      }
      
      // Only update state if localStorage operation succeeded
      setStoredValue(valueToStore);
      
      setStatus({ 
        loading: false, 
        error: null, 
        lastUpdated: new Date().toISOString() 
      });
      
      return true;
    } catch (error) {
      logError(error, `useLocalStorage:setValue:${key}`);
      
      setStatus({ 
        loading: false, 
        error: error instanceof StorageError ? error : new StorageError(error.message, `setValue:${key}`),
        lastUpdated: null
      });
      
      return false;
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
          setStatus({
            loading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
            source: 'external'
          });
        } catch (error) {
          logError(error, `useLocalStorage:handleStorageChange:${key}`);
          setStatus({
            loading: false,
            error: new StorageError(error.message, `parseStorageEvent:${key}`),
            lastUpdated: null
          });
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

  return [storedValue, setValue, status];
};

/**
 * Hook specifically for managing todos in localStorage
 * @returns {[object, function, object]} - [todos, setTodos, status] tuple
 */
export const useTodosStorage = () => {
  return useLocalStorage('todos', {});
};

/**
 * Hook for managing calendar settings in localStorage
 * @returns {[object, function, object]} - [settings, setSettings, status] tuple
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
 * @returns {boolean} - True if successful, false otherwise
 */
export const clearAppData = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const keysToRemove = ['todos', 'calendarSettings'];
    
    handleStorageOperation(() => {
      keysToRemove.forEach(key => {
        window.localStorage.removeItem(key);
      });
    }, 'clearAppData');
    
    return true;
  } catch (error) {
    logError(error, 'clearAppData');
    return false;
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
 * @returns {object} - { isAvailable, error }
 */
export const useLocalStorageAvailable = () => {
  const [status, setStatus] = useState({
    isAvailable: false,
    error: null
  });

  useEffect(() => {
    try {
      const available = isLocalStorageAvailable();
      setStatus({ isAvailable: available, error: null });
    } catch (error) {
      setStatus({ 
        isAvailable: false, 
        error: new StorageError(error.message, 'checkAvailability')
      });
    }
  }, []);

  return status;
};