import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTodos } from '../../hooks/useTodos';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { useError } from '../../contexts/ErrorContext';

// Create a test component that uses the hooks
const TestComponent = () => {
  const { todos, addTodo, clearAllTodos, status: todosStatus } = useTodos();
  const { handleError } = useError();
  
  const handleAddTodo = async () => {
    try {
      await addTodo('Test Todo', '', new Date(2024, 0, 15));
    } catch (error) {
      handleError(error, 'TestComponent');
    }
  };
  
  const handleClearTodos = async () => {
    try {
      await clearAllTodos();
    } catch (error) {
      handleError(error, 'TestComponent');
    }
  };
  
  return (
    <div>
      <h1>Todos</h1>
      <div data-testid="todos-count">{Object.keys(todos).length} dates with todos</div>
      <div data-testid="todos-status">
        {todosStatus?.loading && <span>Loading...</span>}
        {todosStatus?.error && <span>Error: {todosStatus.error.message}</span>}
        {todosStatus?.lastUpdated && <span>Last updated: {todosStatus.lastUpdated}</span>}
      </div>
      
      <button onClick={handleAddTodo}>
        Add Todo
      </button>
      
      <button onClick={handleClearTodos}>
        Clear Todos
      </button>
    </div>
  );
};

describe('Data Persistence Integration', () => {
  // Mock localStorage
  let mockStorage = {};
  
  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage = {};
    
    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => mockStorage[key] || null),
        setItem: vi.fn((key, value) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        })
      },
      writable: true
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Todo Data Persistence', () => {
    it('persists todos to localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Initially no todos
      expect(screen.getByTestId('todos-count')).toHaveTextContent('0 dates with todos');
      
      // Add a todo
      await user.click(screen.getByText('Add Todo'));
      
      // Should update the UI
      expect(screen.getByTestId('todos-count')).toHaveTextContent('1 dates with todos');
      
      // Should save to localStorage
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(mockStorage.todos).toBeDefined();
      
      // The stored value should be a JSON string containing the todo
      const storedTodos = JSON.parse(mockStorage.todos);
      expect(storedTodos).toHaveProperty('2024-01-15');
      expect(storedTodos['2024-01-15']).toHaveLength(1);
      expect(storedTodos['2024-01-15'][0].title).toBe('Test Todo');
    });
    
    it('loads todos from localStorage on initialization', () => {
      // Set up localStorage with existing todos
      const existingTodos = {
        '2024-01-15': [
          { id: 'todo-1', title: 'Existing Todo', completed: false }
        ],
        '2024-01-16': [
          { id: 'todo-2', title: 'Another Todo', completed: true }
        ]
      };
      
      mockStorage.todos = JSON.stringify(existingTodos);
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Should load todos from localStorage
      expect(screen.getByTestId('todos-count')).toHaveTextContent('2 dates with todos');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('todos');
    });
    
    it('updates localStorage when todos change', async () => {
      const user = userEvent.setup();
      
      // Set up localStorage with existing todos
      const existingTodos = {
        '2024-01-15': [
          { id: 'todo-1', title: 'Existing Todo', completed: false }
        ]
      };
      
      mockStorage.todos = JSON.stringify(existingTodos);
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Initially has 1 date with todos
      expect(screen.getByTestId('todos-count')).toHaveTextContent('1 dates with todos');
      
      // Clear todos
      await user.click(screen.getByText('Clear Todos'));
      
      // Should update the UI
      expect(screen.getByTestId('todos-count')).toHaveTextContent('0 dates with todos');
      
      // Should update localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith('todos', '{}');
    });
  });
  
  describe('Error Handling with Storage', () => {
    it('handles localStorage errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage.setItem to throw an error
      window.localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      // Mock console.error to avoid test output noise
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Add a todo (which will trigger the error)
      await user.click(screen.getByText('Add Todo'));
      
      // Verify console.error was called
      expect(console.error).toHaveBeenCalled();
      
      // Restore console.error
      console.error = originalConsoleError;
    });
    
    it('continues to function after storage error', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage.setItem to throw an error only once
      window.localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      // Mock console.error to avoid test output noise
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Add a todo (which will trigger the error)
      await user.click(screen.getByText('Add Todo'));
      
      // Try adding another todo
      await user.click(screen.getByText('Add Todo'));
      
      // Should work this time
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(2);
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });
});