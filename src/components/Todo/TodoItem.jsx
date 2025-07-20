import React, { useState } from 'react';
import { Button } from '../UI';

/**
 * TodoItem component for displaying individual todo items
 * @param {object} props - Component props
 * @param {object} props.todo - Todo object with id, title, description, completed
 * @param {function} props.onToggleComplete - Function to toggle completion status
 * @param {function} props.onEdit - Function to edit todo
 * @param {function} props.onDelete - Function to delete todo
 * @param {boolean} props.isLoading - Whether the item is in a loading state
 */
const TodoItem = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!todo) {
    return null;
  }

  const handleToggleComplete = () => {
    if (!isLoading && onToggleComplete) {
      onToggleComplete(todo.id);
    }
  };

  const handleEdit = () => {
    if (!isLoading && onEdit) {
      onEdit(todo);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(todo.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Handle keyboard interactions for accessibility
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const itemClasses = `
    group relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
    ${todo.completed ? 'opacity-75 bg-gray-50' : 'hover:border-gray-300'}
    ${isLoading ? 'pointer-events-none opacity-50' : ''}
  `.trim();

  const titleClasses = `
    font-medium text-gray-900 mb-1 transition-all duration-200
    ${todo.completed ? 'line-through text-gray-500' : ''}
  `.trim();

  const descriptionClasses = `
    text-sm text-gray-600 mb-3 transition-all duration-200
    ${todo.completed ? 'line-through text-gray-400' : ''}
  `.trim();

  return (
    <div className={itemClasses}>
      {/* Main Content */}
      <div className="flex items-start space-x-3">
        {/* Completion Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <button
            type="button"
            onClick={handleToggleComplete}
            onKeyDown={(e) => handleKeyPress(e, handleToggleComplete)}
            disabled={isLoading}
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${todo.completed 
                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `.trim()}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed && (
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Todo Content */}
        <div className="flex-1 min-w-0">
          <h4 className={titleClasses}>
            {todo.title}
          </h4>
          {todo.description && (
            <p className={descriptionClasses}>
              {todo.description}
            </p>
          )}
          
          {/* Metadata */}
          <div className="flex items-center text-xs text-gray-400 space-x-2">
            <span>
              Created: {new Date(todo.createdAt).toLocaleDateString()}
            </span>
            {todo.updatedAt !== todo.createdAt && (
              <>
                <span>•</span>
                <span>
                  Updated: {new Date(todo.updatedAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading}
            className="text-gray-500 hover:text-blue-600"
            aria-label="Edit todo"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="text-gray-500 hover:text-red-600"
            aria-label="Delete todo"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete this todo?
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-500">
            <svg
              className="animate-spin h-4 w-4"
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
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;