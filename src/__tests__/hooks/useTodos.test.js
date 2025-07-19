import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

// Mock the localStorage hook
vi.mock('../../hooks/useLocalStorage', () => ({
  useTodosStorage: vi.fn()
}));

// Mock the utility functions
vi.mock('../../utils/todoUtils', async () => {
  const actual = await vi.importActual('../../utils/todoUtils');
  return actual;
});

import { useTodosStorage } from '../../hooks/useLocalStorage';

describe('useTodos', () => {
  let mockTodos;
  let mockSetTodos;
  let testDate;

  beforeEach(() => {
    testDate = new Date(2024, 0, 15); // January 15, 2024
    vi.useFakeTimers();
    vi.setSystemTime(testDate);

    mockTodos = {
      '2024-01-15': [
        {
          id: 'todo-1',
          title: 'Test Todo 1',
          description: 'Test Description 1',
          completed: false,
          dateKey: '2024-01-15',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z'
        }
      ],
      '2024-01-16': [
        {
          id: 'todo-2',
          title: 'Test Todo 2',
          description: 'Test Description 2',
          completed: true,
          dateKey: '2024-01-16',
          createdAt: '2024-01-16T10:00:00.000Z',
          updatedAt: '2024-01-16T10:00:00.000Z'
        }
      ]
    };

    mockSetTodos = vi.fn();
    useTodosStorage.mockReturnValue([mockTodos, mockSetTodos]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return todos from storage', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.todos).toEqual(mockTodos);
    });

    it('should provide all CRUD operations', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(typeof result.current.addTodo).toBe('function');
      expect(typeof result.current.updateTodo).toBe('function');
      expect(typeof result.current.deleteTodo).toBe('function');
      expect(typeof result.current.toggleTodoComplete).toBe('function');
    });
  });

  describe('addTodo', () => {
    it('should add a new todo', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const newTodo = await result.current.addTodo('New Todo', 'New Description', testDate);
        expect(newTodo.title).toBe('New Todo');
        expect(newTodo.description).toBe('New Description');
        expect(newTodo.dateKey).toBe('2024-01-15');
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should add todo with default values', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const newTodo = await result.current.addTodo('New Todo');
        expect(newTodo.title).toBe('New Todo');
        expect(newTodo.description).toBe('');
        expect(newTodo.dateKey).toBe('2024-01-15');
      });
    });

    it('should handle add todo errors', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        await expect(result.current.addTodo('')).rejects.toThrow('Failed to add todo');
      });
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const updatedTodo = await result.current.updateTodo('todo-1', { 
          title: 'Updated Title' 
        });
        expect(updatedTodo.title).toBe('Updated Title');
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should handle update todo errors', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        await expect(result.current.updateTodo('non-existent', {}))
          .rejects.toThrow('Failed to update todo');
      });
    });
  });

  describe('deleteTodo', () => {
    it('should delete an existing todo', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const success = await result.current.deleteTodo('todo-1');
        expect(success).toBe(true);
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should handle delete todo errors', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        await expect(result.current.deleteTodo('non-existent'))
          .rejects.toThrow('Failed to delete todo');
      });
    });
  });

  describe('toggleTodoComplete', () => {
    it('should toggle todo completion status', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const toggledTodo = await result.current.toggleTodoComplete('todo-1');
        expect(toggledTodo.completed).toBe(true);
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should handle toggle errors for non-existent todo', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        await expect(result.current.toggleTodoComplete('non-existent'))
          .rejects.toThrow('Failed to toggle todo completion');
      });
    });
  });

  describe('data retrieval functions', () => {
    it('should get todos for a specific date', () => {
      const { result } = renderHook(() => useTodos());
      
      const dateTodos = result.current.getTodosForDate('2024-01-15');
      expect(dateTodos).toHaveLength(1);
      expect(dateTodos[0].id).toBe('todo-1');
    });

    it('should get todos for date using Date object', () => {
      const { result } = renderHook(() => useTodos());
      
      const dateTodos = result.current.getTodosForDate(testDate);
      expect(dateTodos).toHaveLength(1);
      expect(dateTodos[0].id).toBe('todo-1');
    });

    it('should get all todos as flat array', () => {
      const { result } = renderHook(() => useTodos());
      
      const allTodos = result.current.getAllTodos();
      expect(allTodos).toHaveLength(2);
      expect(allTodos.map(t => t.id)).toEqual(['todo-1', 'todo-2']);
    });

    it('should get todo by ID', () => {
      const { result } = renderHook(() => useTodos());
      
      const todo = result.current.getTodoById('todo-1');
      expect(todo.title).toBe('Test Todo 1');
      
      const nonExistent = result.current.getTodoById('non-existent');
      expect(nonExistent).toBeNull();
    });

    it('should get todos for date range', () => {
      const { result } = renderHook(() => useTodos());
      
      const startDate = new Date(2024, 0, 15);
      const endDate = new Date(2024, 0, 16);
      const rangeTodos = result.current.getTodosForDateRange(startDate, endDate);
      
      expect(rangeTodos).toHaveLength(2);
    });
  });

  describe('statistics and counts', () => {
    it('should get todo statistics', () => {
      const { result } = renderHook(() => useTodos());
      
      const stats = result.current.getStats();
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(50);
    });

    it('should check if date has todos', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.hasDateTodos('2024-01-15')).toBe(true);
      expect(result.current.hasDateTodos('2024-01-20')).toBe(false);
    });

    it('should get todo count for date', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.getTodoCountForDate('2024-01-15')).toBe(1);
      expect(result.current.getTodoCountForDate('2024-01-20')).toBe(0);
    });

    it('should get completed count for date', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.getCompletedCountForDate('2024-01-15')).toBe(0);
      expect(result.current.getCompletedCountForDate('2024-01-16')).toBe(1);
    });

    it('should get pending count for date', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.getPendingCountForDate('2024-01-15')).toBe(1);
      expect(result.current.getPendingCountForDate('2024-01-16')).toBe(0);
    });
  });

  describe('filtering and searching', () => {
    it('should filter todos by completion status', () => {
      const { result } = renderHook(() => useTodos());
      
      const completed = result.current.filterByStatus(true);
      expect(Object.keys(completed)).toEqual(['2024-01-16']);
      
      const pending = result.current.filterByStatus(false);
      expect(Object.keys(pending)).toEqual(['2024-01-15']);
    });

    it('should search todos', () => {
      const { result } = renderHook(() => useTodos());
      
      const results = result.current.searchTodos('Test Todo 1');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('todo-1');
    });

    it('should sort todos', () => {
      const { result } = renderHook(() => useTodos());
      
      const sorted = result.current.sortTodos('title', 'asc');
      expect(sorted['2024-01-15'][0].title).toBe('Test Todo 1');
    });
  });

  describe('bulk operations', () => {
    it('should bulk update todos', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const updated = await result.current.bulkUpdateTodos(
          ['todo-1', 'todo-2'], 
          { completed: true }
        );
        expect(updated).toHaveLength(2);
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should bulk delete todos', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const success = await result.current.bulkDeleteTodos(['todo-1', 'todo-2']);
        expect(success).toBe(true);
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should handle bulk operation errors', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        await expect(result.current.bulkUpdateTodos(['non-existent'], {}))
          .rejects.toThrow('Failed to bulk update todos');
      });
    });
  });

  describe('utility operations', () => {
    it('should clear all todos', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const success = await result.current.clearAllTodos();
        expect(success).toBe(true);
      });
      
      expect(mockSetTodos).toHaveBeenCalledWith({});
    });

    it('should clear todos for specific date', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const success = await result.current.clearTodosForDate('2024-01-15');
        expect(success).toBe(true);
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });

    it('should clear todos for date using Date object', async () => {
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        const success = await result.current.clearTodosForDate(testDate);
        expect(success).toBe(true);
      });
      
      expect(mockSetTodos).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      mockSetTodos.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useTodos());
      
      await act(async () => {
        await expect(result.current.addTodo('Test'))
          .rejects.toThrow('Failed to add todo');
      });
    });
  });

  describe('memoization', () => {
    it('should memoize functions properly', () => {
      const { result, rerender } = renderHook(() => useTodos());
      
      const firstAddTodo = result.current.addTodo;
      const firstGetTodos = result.current.getTodosForDate;
      
      rerender();
      
      expect(result.current.addTodo).toBe(firstAddTodo);
      expect(result.current.getTodosForDate).toBe(firstGetTodos);
    });

    it('should update memoized functions when todos change', () => {
      const { result, rerender } = renderHook(() => useTodos());
      
      const firstGetTodos = result.current.getTodosForDate;
      
      // Change the mock data
      useTodosStorage.mockReturnValue([{}, mockSetTodos]);
      rerender();
      
      expect(result.current.getTodosForDate).not.toBe(firstGetTodos);
    });
  });
});