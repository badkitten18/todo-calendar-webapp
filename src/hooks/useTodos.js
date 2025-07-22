import { useCallback } from 'react';
import { useTodosStorage } from './useLocalStorage';
import {
  createTodo,

  addTodoToCollection,
  updateTodoInCollection,
  removeTodoFromCollection,
  getTodosForDate,
  getAllTodos,
  getTodoStats,
  filterTodosByStatus,
  searchTodos,
  sortTodosInCollection,
  toggleTodoComplete as toggleTodoCompleteUtil
} from '../utils/todoUtils';
import { formatDateKey } from '../utils/dateUtils';

/**
 * Custom hook for managing todos with localStorage persistence
 * @returns {object} Todos state and CRUD operations
 */
export const useTodos = () => {
  const [todos, setTodos] = useTodosStorage();

  /**
   * Add a new todo
   * @param {string} title - Todo title
   * @param {string} description - Todo description (optional)
   * @param {Date} date - Date for the todo (defaults to today)
   * @returns {Promise<object>} The created todo
   */
  const addTodo = useCallback(async (title, description = '', date = new Date()) => {
    try {
      const newTodo = createTodo(title, description, date);
      const updatedTodos = addTodoToCollection(todos, newTodo);
      setTodos(updatedTodos);
      return newTodo;
    } catch (error) {
      throw new Error(`Failed to add todo: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Update an existing todo
   * @param {string} todoId - ID of the todo to update
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>} The updated todo
   */
  const updateTodoById = useCallback(async (todoId, updates) => {
    try {
      const updatedTodos = updateTodoInCollection(todos, todoId, updates);
      setTodos(updatedTodos);
      
      // Find and return the updated todo
      const allUpdatedTodos = getAllTodos(updatedTodos);
      const updatedTodo = allUpdatedTodos.find(todo => todo.id === todoId);
      return updatedTodo;
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Delete a todo
   * @param {string} todoId - ID of the todo to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  const deleteTodo = useCallback(async (todoId) => {
    try {
      const updatedTodos = removeTodoFromCollection(todos, todoId);
      setTodos(updatedTodos);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Toggle the completion status of a todo
   * @param {string} todoId - ID of the todo to toggle
   * @returns {Promise<object>} The updated todo
   */
  const toggleTodoComplete = useCallback(async (todoId) => {
    try {
      // Find the current todo
      const allCurrentTodos = getAllTodos(todos);
      const currentTodo = allCurrentTodos.find(todo => todo.id === todoId);
      
      if (!currentTodo) {
        throw new Error(`Todo with id ${todoId} not found`);
      }

      const toggledTodo = toggleTodoCompleteUtil(currentTodo);
      const updatedTodos = updateTodoInCollection(todos, todoId, { completed: toggledTodo.completed });
      setTodos(updatedTodos);
      
      return toggledTodo;
    } catch (error) {
      throw new Error(`Failed to toggle todo completion: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Get todos for a specific date
   * @param {Date|string} date - Date to get todos for
   * @returns {Array} Array of todos for the date
   */
  const getTodosForSpecificDate = useCallback((date) => {
    return getTodosForDate(todos, date);
  }, [todos]);

  /**
   * Get all todos as a flat array
   * @returns {Array} All todos
   */
  const getAllTodosFlat = useCallback(() => {
    return getAllTodos(todos);
  }, [todos]);

  /**
   * Get todo statistics
   * @returns {object} Statistics about todos
   */
  const getStats = useCallback(() => {
    return getTodoStats(todos);
  }, [todos]);

  /**
   * Filter todos by completion status
   * @param {boolean} completed - Filter by completion status
   * @returns {object} Filtered todos collection
   */
  const filterByStatus = useCallback((completed) => {
    return filterTodosByStatus(todos, completed);
  }, [todos]);

  /**
   * Search todos by title or description
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching todos
   */
  const searchTodosInCollection = useCallback((searchTerm) => {
    return searchTodos(todos, searchTerm);
  }, [todos]);

  /**
   * Sort todos within each date
   * @param {string} sortBy - Sort criteria ('created', 'title', 'completed')
   * @param {string} order - Sort order ('asc', 'desc')
   * @returns {object} Sorted todos collection
   */
  const sortTodos = useCallback((sortBy = 'created', order = 'asc') => {
    return sortTodosInCollection(todos, sortBy, order);
  }, [todos]);

  /**
   * Get a specific todo by ID
   * @param {string} todoId - ID of the todo to find
   * @returns {object|null} The todo object or null if not found
   */
  const getTodoById = useCallback((todoId) => {
    const allTodos = getAllTodos(todos);
    return allTodos.find(todo => todo.id === todoId) || null;
  }, [todos]);

  /**
   * Check if a date has any todos
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if date has todos
   */
  const hasDateTodos = useCallback((date) => {
    const dateTodos = getTodosForDate(todos, date);
    return dateTodos.length > 0;
  }, [todos]);

  /**
   * Get the count of todos for a specific date
   * @param {Date|string} date - Date to count todos for
   * @returns {number} Number of todos for the date
   */
  const getTodoCountForDate = useCallback((date) => {
    const dateTodos = getTodosForDate(todos, date);
    return dateTodos.length;
  }, [todos]);

  /**
   * Get the count of completed todos for a specific date
   * @param {Date|string} date - Date to count completed todos for
   * @returns {number} Number of completed todos for the date
   */
  const getCompletedCountForDate = useCallback((date) => {
    const dateTodos = getTodosForDate(todos, date);
    return dateTodos.filter(todo => todo.completed).length;
  }, [todos]);

  /**
   * Get the count of pending todos for a specific date
   * @param {Date|string} date - Date to count pending todos for
   * @returns {number} Number of pending todos for the date
   */
  const getPendingCountForDate = useCallback((date) => {
    const dateTodos = getTodosForDate(todos, date);
    return dateTodos.filter(todo => !todo.completed).length;
  }, [todos]);

  /**
   * Clear all todos (with confirmation)
   * @returns {Promise<boolean>} True if cleared successfully
   */
  const clearAllTodos = useCallback(async () => {
    try {
      setTodos({});
      return true;
    } catch (error) {
      throw new Error(`Failed to clear todos: ${error.message}`);
    }
  }, [setTodos]);

  /**
   * Clear todos for a specific date
   * @param {Date|string} date - Date to clear todos for
   * @returns {Promise<boolean>} True if cleared successfully
   */
  const clearTodosForDate = useCallback(async (date) => {
    try {
      const dateKey = typeof date === 'string' ? date : formatDateKey(date);
      const updatedTodos = { ...todos };
      delete updatedTodos[dateKey];
      setTodos(updatedTodos);
      return true;
    } catch (error) {
      throw new Error(`Failed to clear todos for date: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Bulk update multiple todos
   * @param {Array} todoIds - Array of todo IDs to update
   * @param {object} updates - Updates to apply to all todos
   * @returns {Promise<Array>} Array of updated todos
   */
  const bulkUpdateTodos = useCallback(async (todoIds, updates) => {
    try {
      let updatedTodos = { ...todos };
      const updatedTodosList = [];

      for (const todoId of todoIds) {
        updatedTodos = updateTodoInCollection(updatedTodos, todoId, updates);
        const allUpdated = getAllTodos(updatedTodos);
        const updatedTodo = allUpdated.find(todo => todo.id === todoId);
        if (updatedTodo) {
          updatedTodosList.push(updatedTodo);
        }
      }

      setTodos(updatedTodos);
      return updatedTodosList;
    } catch (error) {
      throw new Error(`Failed to bulk update todos: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Bulk delete multiple todos
   * @param {Array} todoIds - Array of todo IDs to delete
   * @returns {Promise<boolean>} True if all deletions were successful
   */
  const bulkDeleteTodos = useCallback(async (todoIds) => {
    try {
      let updatedTodos = { ...todos };

      for (const todoId of todoIds) {
        updatedTodos = removeTodoFromCollection(updatedTodos, todoId);
      }

      setTodos(updatedTodos);
      return true;
    } catch (error) {
      throw new Error(`Failed to bulk delete todos: ${error.message}`);
    }
  }, [todos, setTodos]);

  /**
   * Get todos for a date range
   * @param {Date} startDate - Start date (inclusive)
   * @param {Date} endDate - End date (inclusive)
   * @returns {Array} Array of todos within the date range
   */
  const getTodosForDateRange = useCallback((startDate, endDate) => {
    const startKey = formatDateKey(startDate);
    const endKey = formatDateKey(endDate);
    const rangeTodos = [];

    for (const dateKey in todos) {
      if (dateKey >= startKey && dateKey <= endKey) {
        rangeTodos.push(...todos[dateKey]);
      }
    }

    return rangeTodos;
  }, [todos]);

  return {
    // State
    todos,
    
    // CRUD Operations
    addTodo,
    updateTodo: updateTodoById,
    deleteTodo,
    toggleTodoComplete,
    
    // Data Retrieval
    getTodosForDate: getTodosForSpecificDate,
    getAllTodos: getAllTodosFlat,
    getTodoById,
    getTodosForDateRange,
    
    // Statistics and Counts
    getStats,
    hasDateTodos,
    getTodoCountForDate,
    getCompletedCountForDate,
    getPendingCountForDate,
    
    // Filtering and Searching
    filterByStatus,
    searchTodos: searchTodosInCollection,
    sortTodos,
    
    // Bulk Operations
    bulkUpdateTodos,
    bulkDeleteTodos,
    
    // Utility Operations
    clearAllTodos,
    clearTodosForDate
  };
};