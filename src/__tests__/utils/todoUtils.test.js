import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateTodoId,
  createTodo,
  updateTodo,
  toggleTodoComplete,
  validateTodo,
  addTodoToCollection,
  updateTodoInCollection,
  removeTodoFromCollection,
  getTodosForDate,
  getAllTodos,
  getTodoStats,
  filterTodosByStatus,
  searchTodos,
  sortTodosInCollection
} from '../../utils/todoUtils';

describe('todoUtils', () => {
  let testDate;
  let sampleTodo;
  let todosCollection;

  beforeEach(() => {
    testDate = new Date(2024, 0, 15); // January 15, 2024
    vi.useFakeTimers();
    vi.setSystemTime(testDate);

    sampleTodo = {
      id: 'test-id-1',
      title: 'Test Todo',
      description: 'Test Description',
      completed: false,
      dateKey: '2024-01-15',
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z'
    };

    todosCollection = {
      '2024-01-15': [sampleTodo],
      '2024-01-16': [
        {
          id: 'test-id-2',
          title: 'Another Todo',
          description: 'Another Description',
          completed: true,
          dateKey: '2024-01-16',
          createdAt: '2024-01-16T10:00:00.000Z',
          updatedAt: '2024-01-16T10:00:00.000Z'
        }
      ]
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateTodoId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateTodoId();
      const id2 = generateTodoId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^todo_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^todo_\d+_[a-z0-9]+$/);
    });
  });

  describe('createTodo', () => {
    it('should create a todo with required fields', () => {
      const todo = createTodo('Test Title', 'Test Description', testDate);
      
      expect(todo.title).toBe('Test Title');
      expect(todo.description).toBe('Test Description');
      expect(todo.completed).toBe(false);
      expect(todo.dateKey).toBe('2024-01-15');
      expect(todo.id).toMatch(/^todo_\d+_[a-z0-9]+$/);
      expect(todo.createdAt).toBe(testDate.toISOString());
      expect(todo.updatedAt).toBe(testDate.toISOString());
    });

    it('should create a todo with default values', () => {
      const todo = createTodo('Test Title');
      
      expect(todo.title).toBe('Test Title');
      expect(todo.description).toBe('');
      expect(todo.completed).toBe(false);
      expect(todo.dateKey).toBe('2024-01-15');
    });

    it('should trim whitespace from title and description', () => {
      const todo = createTodo('  Test Title  ', '  Test Description  ');
      
      expect(todo.title).toBe('Test Title');
      expect(todo.description).toBe('Test Description');
    });

    it('should throw error for empty title', () => {
      expect(() => createTodo('')).toThrow('Todo title is required');
      expect(() => createTodo('   ')).toThrow('Todo title is required');
      expect(() => createTodo(null)).toThrow('Todo title is required');
      expect(() => createTodo(undefined)).toThrow('Todo title is required');
    });

    it('should throw error for non-string title', () => {
      expect(() => createTodo(123)).toThrow('Todo title is required');
      expect(() => createTodo({})).toThrow('Todo title is required');
    });
  });

  describe('updateTodo', () => {
    it('should update todo title', () => {
      const updated = updateTodo(sampleTodo, { title: 'Updated Title' });
      
      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(sampleTodo.id);
      expect(updated.updatedAt).toBe(testDate.toISOString());
    });

    it('should update todo description', () => {
      const updated = updateTodo(sampleTodo, { description: 'Updated Description' });
      
      expect(updated.description).toBe('Updated Description');
      expect(updated.title).toBe(sampleTodo.title);
    });

    it('should update completion status', () => {
      const updated = updateTodo(sampleTodo, { completed: true });
      
      expect(updated.completed).toBe(true);
    });

    it('should update date', () => {
      const newDate = new Date(2024, 0, 20);
      const updated = updateTodo(sampleTodo, { date: newDate });
      
      expect(updated.dateKey).toBe('2024-01-20');
    });

    it('should update multiple fields', () => {
      const updates = {
        title: 'New Title',
        description: 'New Description',
        completed: true
      };
      const updated = updateTodo(sampleTodo, updates);
      
      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('New Description');
      expect(updated.completed).toBe(true);
    });

    it('should throw error for invalid existing todo', () => {
      expect(() => updateTodo(null, {})).toThrow('Existing todo must be a valid object');
      expect(() => updateTodo({}, {})).toThrow('Existing todo must have an id');
    });

    it('should throw error for invalid title update', () => {
      expect(() => updateTodo(sampleTodo, { title: '' })).toThrow('Todo title must be a non-empty string');
      expect(() => updateTodo(sampleTodo, { title: 123 })).toThrow('Todo title must be a non-empty string');
    });

    it('should throw error for invalid date update', () => {
      expect(() => updateTodo(sampleTodo, { date: 'invalid' })).toThrow('Date must be a valid Date object');
    });
  });

  describe('toggleTodoComplete', () => {
    it('should toggle completion status from false to true', () => {
      const toggled = toggleTodoComplete(sampleTodo);
      
      expect(toggled.completed).toBe(true);
      expect(toggled.updatedAt).toBe(testDate.toISOString());
    });

    it('should toggle completion status from true to false', () => {
      const completedTodo = { ...sampleTodo, completed: true };
      const toggled = toggleTodoComplete(completedTodo);
      
      expect(toggled.completed).toBe(false);
    });
  });

  describe('validateTodo', () => {
    it('should validate a correct todo', () => {
      expect(() => validateTodo(sampleTodo)).not.toThrow();
      expect(validateTodo(sampleTodo)).toBe(true);
    });

    it('should throw error for non-object todo', () => {
      expect(() => validateTodo(null)).toThrow('Todo must be an object');
      expect(() => validateTodo('string')).toThrow('Todo must be an object');
    });

    it('should throw error for missing required fields', () => {
      const incompleteTodo = { id: 'test', title: 'Test' };
      expect(() => validateTodo(incompleteTodo)).toThrow('Todo is missing required fields');
    });

    it('should throw error for invalid field types', () => {
      const invalidTodo = { ...sampleTodo, completed: 'true' };
      expect(() => validateTodo(invalidTodo)).toThrow('Todo completed must be a boolean');
    });

    it('should throw error for invalid dateKey format', () => {
      const invalidTodo = { ...sampleTodo, dateKey: 'invalid-date' };
      expect(() => validateTodo(invalidTodo)).toThrow('Todo dateKey must be in YYYY-MM-DD format');
    });
  });

  describe('addTodoToCollection', () => {
    it('should add todo to existing date', () => {
      const newTodo = createTodo('New Todo', '', testDate);
      const updated = addTodoToCollection(todosCollection, newTodo);
      
      expect(updated['2024-01-15']).toHaveLength(2);
      expect(updated['2024-01-15'][1]).toEqual(newTodo);
    });

    it('should add todo to new date', () => {
      const newDate = new Date(2024, 0, 20);
      const newTodo = createTodo('New Todo', '', newDate);
      const updated = addTodoToCollection(todosCollection, newTodo);
      
      expect(updated['2024-01-20']).toHaveLength(1);
      expect(updated['2024-01-20'][0]).toEqual(newTodo);
    });

    it('should throw error for duplicate todo ID', () => {
      const duplicateTodo = { ...sampleTodo };
      expect(() => addTodoToCollection(todosCollection, duplicateTodo))
        .toThrow('Todo with id test-id-1 already exists');
    });

    it('should throw error for invalid todo', () => {
      const invalidTodo = { id: 'test' };
      expect(() => addTodoToCollection(todosCollection, invalidTodo))
        .toThrow('Todo is missing required fields');
    });
  });

  describe('updateTodoInCollection', () => {
    it('should update existing todo', () => {
      const updates = { title: 'Updated Title' };
      const updated = updateTodoInCollection(todosCollection, 'test-id-1', updates);
      
      expect(updated['2024-01-15'][0].title).toBe('Updated Title');
    });

    it('should move todo to different date when date is updated', () => {
      const newDate = new Date(2024, 0, 20);
      const updates = { date: newDate };
      const updated = updateTodoInCollection(todosCollection, 'test-id-1', updates);
      
      expect(updated['2024-01-15']).toBeUndefined();
      expect(updated['2024-01-20']).toHaveLength(1);
      expect(updated['2024-01-20'][0].dateKey).toBe('2024-01-20');
    });

    it('should throw error for non-existent todo', () => {
      expect(() => updateTodoInCollection(todosCollection, 'non-existent', {}))
        .toThrow('Todo with id non-existent not found');
    });
  });

  describe('removeTodoFromCollection', () => {
    it('should remove existing todo', () => {
      const updated = removeTodoFromCollection(todosCollection, 'test-id-1');
      
      expect(updated['2024-01-15']).toBeUndefined();
      expect(updated['2024-01-16']).toHaveLength(1);
    });

    it('should throw error for non-existent todo', () => {
      expect(() => removeTodoFromCollection(todosCollection, 'non-existent'))
        .toThrow('Todo with id non-existent not found');
    });
  });

  describe('getTodosForDate', () => {
    it('should get todos for existing date using Date object', () => {
      const todos = getTodosForDate(todosCollection, testDate);
      
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(sampleTodo);
    });

    it('should get todos for existing date using string', () => {
      const todos = getTodosForDate(todosCollection, '2024-01-16');
      
      expect(todos).toHaveLength(1);
      expect(todos[0].id).toBe('test-id-2');
    });

    it('should return empty array for non-existent date', () => {
      const todos = getTodosForDate(todosCollection, '2024-01-20');
      
      expect(todos).toEqual([]);
    });
  });

  describe('getAllTodos', () => {
    it('should return all todos as flat array', () => {
      const allTodos = getAllTodos(todosCollection);
      
      expect(allTodos).toHaveLength(2);
      expect(allTodos.map(t => t.id)).toEqual(['test-id-1', 'test-id-2']);
    });

    it('should return empty array for empty collection', () => {
      const allTodos = getAllTodos({});
      
      expect(allTodos).toEqual([]);
    });
  });

  describe('getTodoStats', () => {
    it('should calculate correct statistics', () => {
      const stats = getTodoStats(todosCollection);
      
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(50);
    });

    it('should handle empty collection', () => {
      const stats = getTodoStats({});
      
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('filterTodosByStatus', () => {
    it('should filter completed todos', () => {
      const completed = filterTodosByStatus(todosCollection, true);
      
      expect(Object.keys(completed)).toEqual(['2024-01-16']);
      expect(completed['2024-01-16']).toHaveLength(1);
    });

    it('should filter pending todos', () => {
      const pending = filterTodosByStatus(todosCollection, false);
      
      expect(Object.keys(pending)).toEqual(['2024-01-15']);
      expect(pending['2024-01-15']).toHaveLength(1);
    });
  });

  describe('searchTodos', () => {
    it('should search by title', () => {
      const results = searchTodos(todosCollection, 'Test');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Todo');
    });

    it('should search by description', () => {
      const results = searchTodos(todosCollection, 'Another Description');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-id-2');
    });

    it('should be case insensitive', () => {
      const results = searchTodos(todosCollection, 'test');
      
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      const results = searchTodos(todosCollection, 'nonexistent');
      
      expect(results).toEqual([]);
    });

    it('should handle invalid search terms', () => {
      expect(searchTodos(todosCollection, '')).toEqual([]);
      expect(searchTodos(todosCollection, null)).toEqual([]);
      expect(searchTodos(todosCollection, undefined)).toEqual([]);
    });
  });

  describe('sortTodosInCollection', () => {
    beforeEach(() => {
      todosCollection = {
        '2024-01-15': [
          {
            id: 'todo-1',
            title: 'Z Todo',
            completed: false,
            createdAt: '2024-01-15T10:00:00.000Z'
          },
          {
            id: 'todo-2',
            title: 'A Todo',
            completed: true,
            createdAt: '2024-01-15T11:00:00.000Z'
          }
        ]
      };
    });

    it('should sort by creation time ascending by default', () => {
      const sorted = sortTodosInCollection(todosCollection);
      
      expect(sorted['2024-01-15'][0].id).toBe('todo-1');
      expect(sorted['2024-01-15'][1].id).toBe('todo-2');
    });

    it('should sort by creation time descending', () => {
      const sorted = sortTodosInCollection(todosCollection, 'created', 'desc');
      
      expect(sorted['2024-01-15'][0].id).toBe('todo-2');
      expect(sorted['2024-01-15'][1].id).toBe('todo-1');
    });

    it('should sort by title ascending', () => {
      const sorted = sortTodosInCollection(todosCollection, 'title', 'asc');
      
      expect(sorted['2024-01-15'][0].title).toBe('A Todo');
      expect(sorted['2024-01-15'][1].title).toBe('Z Todo');
    });

    it('should sort by completion status', () => {
      const sorted = sortTodosInCollection(todosCollection, 'completed', 'asc');
      
      expect(sorted['2024-01-15'][0].completed).toBe(false);
      expect(sorted['2024-01-15'][1].completed).toBe(true);
    });
  });
});