import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLocalStorage,
  useTodosStorage,
  useCalendarSettings,
  clearAppData,
  isLocalStorageAvailable,
  useLocalStorageAvailable
} from '../../hooks/useLocalStorage';

// Mock localStorage
const createLocalStorageMock = () => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => Object.keys(store)[index] || null),
    _store: store // For testing purposes
  };
};

let localStorageMock;

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  get: () => localStorageMock,
  configurable: true
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (localStorageMock) {
      localStorageMock.clear();
    }
  });

  describe('useLocalStorage hook', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current[0]).toBe('initial');
    });

    it('should return stored value when localStorage has data', () => {
      localStorageMock.setItem('test-key', JSON.stringify('stored-value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current[0]).toBe('stored-value');
    });

    it('should update localStorage when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(result.current[0]).toBe('new-value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
    });

    it('should handle function updates', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 10));
      
      act(() => {
        result.current[1](prev => prev + 5);
      });
      
      expect(result.current[0]).toBe(15);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(15));
    });

    it('should handle complex objects', () => {
      const complexObject = { 
        todos: [{ id: 1, title: 'Test', completed: false }],
        settings: { theme: 'dark' }
      };
      
      const { result } = renderHook(() => useLocalStorage('complex-key', {}));
      
      act(() => {
        result.current[1](complexObject);
      });
      
      expect(result.current[0]).toEqual(complexObject);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('complex-key', JSON.stringify(complexObject));
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const { result } = renderHook(() => useLocalStorage('error-key', 'fallback'));
      
      expect(result.current[0]).toBe('fallback');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle JSON parse errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem('invalid-json', 'invalid json string');
      localStorageMock.getItem.mockReturnValue('invalid json string');
      
      const { result } = renderHook(() => useLocalStorage('invalid-json', 'fallback'));
      
      expect(result.current[0]).toBe('fallback');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle setValue errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage write error');
      });
      
      const { result } = renderHook(() => useLocalStorage('error-key', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('useTodosStorage hook', () => {
    it('should return empty object as default', () => {
      const { result } = renderHook(() => useTodosStorage());
      
      expect(result.current[0]).toEqual({});
    });

    it('should store and retrieve todos', () => {
      const todos = {
        '2024-01-15': [
          { id: '1', title: 'Test todo', completed: false }
        ]
      };
      
      const { result } = renderHook(() => useTodosStorage());
      
      act(() => {
        result.current[1](todos);
      });
      
      expect(result.current[0]).toEqual(todos);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('todos', JSON.stringify(todos));
    });
  });

  describe('useCalendarSettings hook', () => {
    it('should return default settings', () => {
      const { result } = renderHook(() => useCalendarSettings());
      
      expect(result.current[0]).toEqual({
        startOfWeek: 0,
        theme: 'light',
        dateFormat: 'short'
      });
    });

    it('should store and retrieve custom settings', () => {
      const customSettings = {
        startOfWeek: 1,
        theme: 'dark',
        dateFormat: 'long'
      };
      
      const { result } = renderHook(() => useCalendarSettings());
      
      act(() => {
        result.current[1](customSettings);
      });
      
      expect(result.current[0]).toEqual(customSettings);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('calendarSettings', JSON.stringify(customSettings));
    });
  });

  describe('clearAppData', () => {
    it('should remove all app-related localStorage keys', () => {
      // Reset mocks for this test
      localStorageMock = createLocalStorageMock();
      localStorageMock.setItem('todos', JSON.stringify({}));
      localStorageMock.setItem('calendarSettings', JSON.stringify({}));
      localStorageMock.setItem('otherKey', 'should not be removed');
      
      clearAppData();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('todos');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('calendarSettings');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('otherKey');
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock = createLocalStorageMock();
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Remove error');
      });
      
      expect(() => clearAppData()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      localStorageMock = createLocalStorageMock();
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      localStorageMock = createLocalStorageMock();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      expect(isLocalStorageAvailable()).toBe(false);
    });
  });

  describe('useLocalStorageAvailable hook', () => {
    it('should return localStorage availability status', () => {
      localStorageMock = createLocalStorageMock();
      const { result } = renderHook(() => useLocalStorageAvailable());
      
      expect(result.current).toBe(true);
    });
  });

  describe('storage event handling', () => {
    it('should update state when storage event occurs', () => {
      const { result } = renderHook(() => useLocalStorage('storage-event-key', 'initial'));
      
      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'storage-event-key',
        newValue: JSON.stringify('updated-from-other-tab'),
        oldValue: JSON.stringify('initial')
      });
      
      act(() => {
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('updated-from-other-tab');
    });

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => useLocalStorage('my-key', 'initial'));
      
      const storageEvent = new StorageEvent('storage', {
        key: 'different-key',
        newValue: JSON.stringify('should-not-update'),
        oldValue: JSON.stringify('old')
      });
      
      act(() => {
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('initial');
    });

    it('should handle invalid JSON in storage events', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useLocalStorage('json-error-key', 'initial'));
      
      const storageEvent = new StorageEvent('storage', {
        key: 'json-error-key',
        newValue: 'invalid json',
        oldValue: JSON.stringify('initial')
      });
      
      act(() => {
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('initial');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});