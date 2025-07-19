import { formatDateKey } from './dateUtils';

/**
 * Generate a unique ID for a todo item
 * @returns {string} Unique identifier
 */
export const generateTodoId = () => {
  return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new todo object with default values
 * @param {string} title - Todo title (required)
 * @param {string} description - Todo description (optional)
 * @param {Date} date - Date for the todo
 * @returns {object} New todo object
 */
export const createTodo = (title, description = '', date = new Date()) => {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Todo title is required and must be a non-empty string');
  }

  const now = new Date();
  const dateKey = formatDateKey(date);

  return {
    id: generateTodoId(),
    title: title.trim(),
    description: description.trim(),
    completed: false,
    dateKey,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
};

/**
 * Update an existing todo with new data
 * @param {object} existingTodo - The existing todo object
 * @param {object} updates - Object containing fields to update
 * @returns {object} Updated todo object
 */
export const updateTodo = (existingTodo, updates) => {
  if (!existingTodo || typeof existingTodo !== 'object') {
    throw new Error('Existing todo must be a valid object');
  }

  if (!existingTodo.id) {
    throw new Error('Existing todo must have an id');
  }

  const updatedTodo = { ...existingTodo };

  // Update title if provided
  if (updates.title !== undefined) {
    if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
      throw new Error('Todo title must be a non-empty string');
    }
    updatedTodo.title = updates.title.trim();
  }

  // Update description if provided
  if (updates.description !== undefined) {
    updatedTodo.description = typeof updates.description === 'string' ? updates.description.trim() : '';
  }

  // Update completed status if provided
  if (updates.completed !== undefined) {
    updatedTodo.completed = Boolean(updates.completed);
  }

  // Update date if provided
  if (updates.date !== undefined) {
    if (!(updates.date instanceof Date)) {
      throw new Error('Date must be a valid Date object');
    }
    updatedTodo.dateKey = formatDateKey(updates.date);
  }

  // Always update the updatedAt timestamp
  updatedTodo.updatedAt = new Date().toISOString();

  return updatedTodo;
};

/**
 * Toggle the completed status of a todo
 * @param {object} todo - The todo object to toggle
 * @returns {object} Updated todo object
 */
export const toggleTodoComplete = (todo) => {
  return updateTodo(todo, { completed: !todo.completed });
};

/**
 * Validate a todo object structure
 * @param {object} todo - Todo object to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export const validateTodo = (todo) => {
  if (!todo || typeof todo !== 'object') {
    throw new Error('Todo must be an object');
  }

  const requiredFields = ['id', 'title', 'completed', 'dateKey', 'createdAt', 'updatedAt'];
  const missingFields = requiredFields.filter(field => !(field in todo));
  
  if (missingFields.length > 0) {
    throw new Error(`Todo is missing required fields: ${missingFields.join(', ')}`);
  }

  if (typeof todo.id !== 'string' || todo.id.length === 0) {
    throw new Error('Todo id must be a non-empty string');
  }

  if (typeof todo.title !== 'string' || todo.title.trim().length === 0) {
    throw new Error('Todo title must be a non-empty string');
  }

  if (typeof todo.completed !== 'boolean') {
    throw new Error('Todo completed must be a boolean');
  }

  if (typeof todo.dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(todo.dateKey)) {
    throw new Error('Todo dateKey must be in YYYY-MM-DD format');
  }

  if (typeof todo.description !== 'string') {
    throw new Error('Todo description must be a string');
  }

  return true;
};

/**
 * Add a todo to a todos collection organized by date
 * @param {object} todosCollection - Existing todos organized by date key
 * @param {object} todo - Todo to add
 * @returns {object} Updated todos collection
 */
export const addTodoToCollection = (todosCollection, todo) => {
  validateTodo(todo);
  
  const updatedCollection = { ...todosCollection };
  const { dateKey } = todo;
  
  if (!updatedCollection[dateKey]) {
    updatedCollection[dateKey] = [];
  }
  
  // Check if todo with same ID already exists
  const existingIndex = updatedCollection[dateKey].findIndex(t => t.id === todo.id);
  if (existingIndex !== -1) {
    throw new Error(`Todo with id ${todo.id} already exists for date ${dateKey}`);
  }
  
  updatedCollection[dateKey] = [...updatedCollection[dateKey], todo];
  
  return updatedCollection;
};

/**
 * Update a todo in a todos collection
 * @param {object} todosCollection - Existing todos organized by date key
 * @param {string} todoId - ID of todo to update
 * @param {object} updates - Updates to apply
 * @returns {object} Updated todos collection
 */
export const updateTodoInCollection = (todosCollection, todoId, updates) => {
  const updatedCollection = { ...todosCollection };
  let todoFound = false;
  let oldDateKey = null;
  let updatedTodo = null;

  // Find the todo in the collection
  for (const dateKey in updatedCollection) {
    const todoIndex = updatedCollection[dateKey].findIndex(t => t.id === todoId);
    if (todoIndex !== -1) {
      todoFound = true;
      oldDateKey = dateKey;
      const existingTodo = updatedCollection[dateKey][todoIndex];
      updatedTodo = updateTodo(existingTodo, updates);
      
      // Remove from old date
      updatedCollection[dateKey] = updatedCollection[dateKey].filter(t => t.id !== todoId);
      
      // Clean up empty arrays
      if (updatedCollection[dateKey].length === 0) {
        delete updatedCollection[dateKey];
      }
      
      break;
    }
  }

  if (!todoFound) {
    throw new Error(`Todo with id ${todoId} not found`);
  }

  // Add to new date (might be same as old date)
  const newDateKey = updatedTodo.dateKey;
  if (!updatedCollection[newDateKey]) {
    updatedCollection[newDateKey] = [];
  }
  updatedCollection[newDateKey] = [...updatedCollection[newDateKey], updatedTodo];

  return updatedCollection;
};

/**
 * Remove a todo from a todos collection
 * @param {object} todosCollection - Existing todos organized by date key
 * @param {string} todoId - ID of todo to remove
 * @returns {object} Updated todos collection
 */
export const removeTodoFromCollection = (todosCollection, todoId) => {
  const updatedCollection = { ...todosCollection };
  let todoFound = false;

  for (const dateKey in updatedCollection) {
    const todoIndex = updatedCollection[dateKey].findIndex(t => t.id === todoId);
    if (todoIndex !== -1) {
      todoFound = true;
      updatedCollection[dateKey] = updatedCollection[dateKey].filter(t => t.id !== todoId);
      
      // Clean up empty arrays
      if (updatedCollection[dateKey].length === 0) {
        delete updatedCollection[dateKey];
      }
      
      break;
    }
  }

  if (!todoFound) {
    throw new Error(`Todo with id ${todoId} not found`);
  }

  return updatedCollection;
};

/**
 * Get todos for a specific date
 * @param {object} todosCollection - Todos organized by date key
 * @param {Date|string} date - Date to get todos for (Date object or YYYY-MM-DD string)
 * @returns {Array} Array of todos for the date
 */
export const getTodosForDate = (todosCollection, date) => {
  const dateKey = typeof date === 'string' ? date : formatDateKey(date);
  return todosCollection[dateKey] || [];
};

/**
 * Get all todos in a collection as a flat array
 * @param {object} todosCollection - Todos organized by date key
 * @returns {Array} Flat array of all todos
 */
export const getAllTodos = (todosCollection) => {
  const allTodos = [];
  for (const dateKey in todosCollection) {
    allTodos.push(...todosCollection[dateKey]);
  }
  return allTodos;
};

/**
 * Get statistics about todos in a collection
 * @param {object} todosCollection - Todos organized by date key
 * @returns {object} Statistics object
 */
export const getTodoStats = (todosCollection) => {
  const allTodos = getAllTodos(todosCollection);
  const completed = allTodos.filter(todo => todo.completed);
  const pending = allTodos.filter(todo => !todo.completed);
  
  return {
    total: allTodos.length,
    completed: completed.length,
    pending: pending.length,
    completionRate: allTodos.length > 0 ? (completed.length / allTodos.length) * 100 : 0
  };
};

/**
 * Filter todos by completion status
 * @param {object} todosCollection - Todos organized by date key
 * @param {boolean} completed - Filter by completion status
 * @returns {object} Filtered todos collection
 */
export const filterTodosByStatus = (todosCollection, completed) => {
  const filteredCollection = {};
  
  for (const dateKey in todosCollection) {
    const filteredTodos = todosCollection[dateKey].filter(todo => todo.completed === completed);
    if (filteredTodos.length > 0) {
      filteredCollection[dateKey] = filteredTodos;
    }
  }
  
  return filteredCollection;
};

/**
 * Search todos by title or description
 * @param {object} todosCollection - Todos organized by date key
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Array of matching todos with their date keys
 */
export const searchTodos = (todosCollection, searchTerm) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  const results = [];
  
  for (const dateKey in todosCollection) {
    const matchingTodos = todosCollection[dateKey].filter(todo => 
      todo.title.toLowerCase().includes(term) || 
      todo.description.toLowerCase().includes(term)
    );
    
    matchingTodos.forEach(todo => {
      results.push({ ...todo, dateKey });
    });
  }
  
  return results;
};

/**
 * Sort todos within each date by creation time, completion status, or title
 * @param {object} todosCollection - Todos organized by date key
 * @param {string} sortBy - Sort criteria: 'created', 'title', 'completed'
 * @param {string} order - Sort order: 'asc' or 'desc'
 * @returns {object} Sorted todos collection
 */
export const sortTodosInCollection = (todosCollection, sortBy = 'created', order = 'asc') => {
  const sortedCollection = {};
  
  for (const dateKey in todosCollection) {
    const todos = [...todosCollection[dateKey]];
    
    todos.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'completed':
          comparison = a.completed === b.completed ? 0 : a.completed ? 1 : -1;
          break;
        case 'created':
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    sortedCollection[dateKey] = todos;
  }
  
  return sortedCollection;
};