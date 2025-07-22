import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, Button, FormError } from '../UI';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import { formatFullDate } from '../../utils/dateUtils';
import { useError } from '../../contexts/ErrorContext';

/**
 * TodoModal component - Modal container for todo operations
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {function} props.onClose - Function to close modal
 * @param {Date} props.selectedDate - Date for todo operations
 * @param {Array} props.todos - Todos for the selected date
 * @param {function} props.onTodoUpdate - Function to handle todo changes (add, update, delete, toggle)
 * @param {boolean} props.isLoading - Whether modal is in loading state
 * @param {string|Error} props.error - Error message or Error object
 * @param {object} props.operationStatus - Status of the current operation
 */
const TodoModal = ({
  isOpen,
  onClose,
  selectedDate,
  todos = [],
  onTodoUpdate,
  isLoading = false,
  error = null,
  operationStatus = {}
}) => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [editingTodo, setEditingTodo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  
  // Get global error handler
  const { handleError } = useError();

  // Reset view when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView('list');
      setEditingTodo(null);
      setFormLoading(false);
      setModalError(null);
    }
  }, [isOpen]);

  // Update modal error when props error changes
  useEffect(() => {
    if (error) {
      setModalError(error);
    }
  }, [error]);

  // Handle adding new todo
  const handleAddTodo = () => {
    setEditingTodo(null);
    setCurrentView('form');
    setModalError(null);
  };

  // Handle editing existing todo
  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setCurrentView('form');
    setModalError(null);
  };

  // Handle form submission (add or update)
  const handleFormSubmit = async (formData) => {
    if (!onTodoUpdate) return;

    setFormLoading(true);
    setModalError(null);
    
    try {
      if (editingTodo) {
        // Update existing todo
        await onTodoUpdate('update', editingTodo.id, {
          title: formData.title,
          description: formData.description,
          date: formData.date || selectedDate
        });
      } else {
        // Add new todo
        await onTodoUpdate('add', null, {
          title: formData.title,
          description: formData.description,
          date: formData.date || selectedDate
        });
      }
      
      // Return to list view
      setCurrentView('list');
      setEditingTodo(null);
    } catch (error) {
      // Set modal error
      setModalError(error);
      
      // Log error to global error handler but don't show notification
      // since we're showing the error in the form
      handleError(error, 'TodoModal:formSubmit');
      
      // Don't re-throw, just handle the error gracefully
      // The error is already set in modalError state
    } finally {
      setFormLoading(false);
    }
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setCurrentView('list');
    setEditingTodo(null);
    setFormLoading(false);
    setModalError(null);
  };

  // Handle todo completion toggle
  const handleToggleComplete = async (todoId) => {
    if (!onTodoUpdate) return;

    try {
      await onTodoUpdate('toggle', todoId);
    } catch (error) {
      setModalError(error);
      handleError(error, 'TodoModal:toggleComplete');
    }
  };

  // Handle todo deletion
  const handleDeleteTodo = async (todoId) => {
    if (!onTodoUpdate) return;

    try {
      await onTodoUpdate('delete', todoId);
    } catch (error) {
      setModalError(error);
      handleError(error, 'TodoModal:deleteTodo');
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (formLoading) return; // Prevent closing during form submission
    
    setCurrentView('list');
    setEditingTodo(null);
    setFormLoading(false);
    setModalError(null);
    onClose();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && currentView === 'form' && !formLoading) {
      e.stopPropagation(); // Prevent modal from closing
      handleFormCancel();
    }
  };

  // Determine modal size based on view and screen size
  const getModalSize = () => {
    if (currentView === 'form') {
      return 'md'; // Form is more compact
    }
    return todos.length > 0 ? 'lg' : 'md'; // List needs more space when there are todos
  };

  // Get modal title
  const getModalTitle = () => {
    if (currentView === 'form') {
      return editingTodo ? 'Edit Todo' : 'Add New Todo';
    }
    return selectedDate ? `Todos for ${formatFullDate(selectedDate)}` : 'Todos';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size={getModalSize()}
      closeOnBackdrop={!formLoading}
      closeOnEscape={currentView === 'list' && !formLoading}
      className="sm:max-w-full sm:mx-2 md:mx-4" // Responsive sizing
    >
      <div onKeyDown={handleKeyDown}>
        <ModalBody className="p-0">
          {/* Error display */}
          {modalError && currentView === 'list' && (
            <div className="px-6 pt-6 pb-0">
              <FormError error={modalError} />
            </div>
          )}
          
          {/* Success message */}
          {operationStatus.success && currentView === 'list' && (
            <div className="px-6 pt-6 pb-0">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg 
                      className="h-5 w-5 text-green-400" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {operationStatus.action === 'add' && 'Todo added successfully'}
                      {operationStatus.action === 'update' && 'Todo updated successfully'}
                      {operationStatus.action === 'delete' && 'Todo deleted successfully'}
                      {operationStatus.action === 'toggle' && 'Todo status updated successfully'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'list' ? (
            <div className="p-6">
              {/* Add Todo Button */}
              <div className="mb-6 flex justify-between items-center">
                <div className="flex-1">
                  {todos.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Manage your todos for this date
                    </p>
                  )}
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddTodo}
                  disabled={isLoading}
                  className="flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Todo
                </Button>
              </div>

              {/* Todo List */}
              <div className="relative">
                <TodoList
                  todos={todos}
                  selectedDate={selectedDate}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
                  isLoading={isLoading}
                />
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Form View */}
              <TodoForm
                todo={editingTodo}
                selectedDate={selectedDate}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={formLoading}
              />
            </div>
          )}
        </ModalBody>
      </div>

      {/* Loading Overlay for entire modal */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-3 text-gray-600">
            <svg
              className="animate-spin h-6 w-6"
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
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .modal-content {
            margin: 0.5rem;
            max-height: calc(100vh - 1rem);
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }
        }
      `}</style>
    </Modal>
  );
};

export default TodoModal;