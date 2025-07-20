import React from 'react';
import TodoItem from './TodoItem';
import { formatFullDate } from '../../utils/dateUtils';

/**
 * TodoList component for displaying a list of todos for a specific date
 * @param {object} props - Component props
 * @param {Array} props.todos - Array of todos to display
 * @param {Date} props.selectedDate - Date for which todos are being displayed
 * @param {function} props.onToggleComplete - Function to toggle todo completion status
 * @param {function} props.onEdit - Function to edit a todo
 * @param {function} props.onDelete - Function to delete a todo
 * @param {boolean} props.isLoading - Whether the list is in a loading state
 * @param {string} props.className - Additional CSS classes
 */
const TodoList = ({
  todos = [],
  selectedDate,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false,
  className = ''
}) => {
  // Handle empty state
  if (!todos || todos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No todos yet
        </h3>
        <p className="text-gray-500 mb-4">
          {selectedDate 
            ? `No todos scheduled for ${formatFullDate(selectedDate)}`
            : 'No todos to display'
          }
        </p>
        <p className="text-sm text-gray-400">
          Click "Add Todo" to create your first task for this date
        </p>
      </div>
    );
  }

  // Sort todos: incomplete first, then by creation date
  const sortedTodos = [...todos].sort((a, b) => {
    // First sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then sort by creation date (newest first for incomplete, oldest first for completed)
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return a.completed ? dateA - dateB : dateB - dateA;
  });

  // Get statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div className={`w-full ${className}`}>
      {/* Header with date and statistics */}
      {selectedDate && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {formatFullDate(selectedDate)}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {totalTodos} total
            </span>
            {pendingTodos > 0 && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                {pendingTodos} pending
              </span>
            )}
            {completedTodos > 0 && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {completedTodos} completed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {totalTodos > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((completedTodos / totalTodos) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <div className="flex items-center space-x-3 text-gray-600">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Updating todos...</span>
          </div>
        </div>
      )}


    </div>
  );
};

export default TodoList;