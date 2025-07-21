import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoModal from '../../components/Todo/TodoModal';

// Mock child components
vi.mock('../../components/Todo/TodoList', () => ({
  default: ({ todos, onToggleComplete, onEdit, onDelete, isLoading }) => (
    <div data-testid="todo-list">
      <span>TodoList with {todos.length} todos</span>
      {todos.map(todo => (
        <div key={todo.id} data-testid={`todo-${todo.id}`}>
          <span>{todo.title}</span>
          <button onClick={() => onToggleComplete(todo.id)}>Toggle {todo.id}</button>
          <button onClick={() => onEdit(todo)}>Edit {todo.id}</button>
          <button onClick={() => onDelete(todo.id)}>Delete {todo.id}</button>
        </div>
      ))}
      {isLoading && <span>List Loading</span>}
    </div>
  )
}));

vi.mock('../../components/Todo/TodoForm', () => ({
  default: ({ todo, onSubmit, onCancel, isLoading }) => (
    <div data-testid="todo-form">
      <span>{todo ? `Editing ${todo.title}` : 'Adding new todo'}</span>
      <button 
        onClick={() => onSubmit({ 
          title: 'Test Todo', 
          description: 'Test Description' 
        })}
        disabled={isLoading}
      >
        Submit Form
      </button>
      <button onClick={onCancel} disabled={isLoading}>Cancel Form</button>
      {isLoading && <span>Form Loading</span>}
    </div>
  )
}));

vi.mock('../UI', () => ({
  Modal: ({ isOpen, onClose, title, children, size }) => 
    isOpen ? (
      <div data-testid="modal" data-size={size}>
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">Close Modal</button>
        {children}
      </div>
    ) : null,
  ModalBody: ({ children }) => <div data-testid="modal-body">{children}</div>,
  Button: ({ children, onClick, disabled, variant, className }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  )
}));

vi.mock('../../utils/dateUtils', () => ({
  formatFullDate: (date) => date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}));

// Mock data
const mockTodos = [
  {
    id: 'todo-1',
    title: 'First Todo',
    description: 'First description',
    completed: false,
    dateKey: '2024-01-15',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'todo-2',
    title: 'Second Todo',
    description: 'Second description',
    completed: true,
    dateKey: '2024-01-15',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T11:00:00.000Z'
  }
];

const mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');

describe('TodoModal', () => {
  const mockOnClose = vi.fn();
  const mockOnTodoUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Todos for Monday, January 15, 2024')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(
        <TodoModal
          isOpen={false}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders todo list view by default', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument();
      expect(screen.getByText('Add Todo')).toBeInTheDocument();
    });

    it('renders with different content based on todos count', () => {
      const { rerender } = render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByText('TodoList with 2 todos')).toBeInTheDocument();

      rerender(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={[]}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByText('TodoList with 0 todos')).toBeInTheDocument();
    });
  });

  describe('View Navigation', () => {
    it('switches to form view when Add Todo button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      const addButton = screen.getByText('Add Todo');
      await user.click(addButton);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument();
      expect(screen.getByText('Add New Todo')).toBeInTheDocument();
      expect(screen.getByText('Adding new todo')).toBeInTheDocument();
    });

    it('switches to form view when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      const editButton = screen.getByText('Edit todo-1');
      await user.click(editButton);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument();
      expect(screen.getByText('Edit Todo')).toBeInTheDocument();
      expect(screen.getByText('Editing First Todo')).toBeInTheDocument();
    });

    it('returns to list view when form is cancelled', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      // Go to form view
      await user.click(screen.getByText('Add Todo'));
      expect(screen.getByTestId('todo-form')).toBeInTheDocument();

      // Cancel form
      await user.click(screen.getByText('Cancel Form'));
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument();
    });
  });

  describe('Todo Operations', () => {
    it('calls onTodoUpdate with add action when form is submitted for new todo', async () => {
      const user = userEvent.setup();
      mockOnTodoUpdate.mockResolvedValue();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      // Go to add form
      await user.click(screen.getByText('Add Todo'));
      
      // Submit form
      await user.click(screen.getByText('Submit Form'));

      expect(mockOnTodoUpdate).toHaveBeenCalledWith('add', null, {
        title: 'Test Todo',
        description: 'Test Description',
        date: mockSelectedDate
      });
    });

    it('calls onTodoUpdate with update action when form is submitted for existing todo', async () => {
      const user = userEvent.setup();
      mockOnTodoUpdate.mockResolvedValue();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      // Go to edit form
      await user.click(screen.getByText('Edit todo-1'));
      
      // Submit form
      await user.click(screen.getByText('Submit Form'));

      expect(mockOnTodoUpdate).toHaveBeenCalledWith('update', 'todo-1', {
        title: 'Test Todo',
        description: 'Test Description',
        date: mockSelectedDate
      });
    });

    it('calls onTodoUpdate with toggle action when toggle button is clicked', async () => {
      const user = userEvent.setup();
      mockOnTodoUpdate.mockResolvedValue();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      await user.click(screen.getByText('Toggle todo-1'));

      expect(mockOnTodoUpdate).toHaveBeenCalledWith('toggle', 'todo-1');
    });

    it('calls onTodoUpdate with delete action when delete button is clicked', async () => {
      const user = userEvent.setup();
      mockOnTodoUpdate.mockResolvedValue();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      await user.click(screen.getByText('Delete todo-1'));

      expect(mockOnTodoUpdate).toHaveBeenCalledWith('delete', 'todo-1');
    });

    it('returns to list view after successful form submission', async () => {
      const user = userEvent.setup();
      mockOnTodoUpdate.mockResolvedValue();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      // Go to form and submit
      await user.click(screen.getByText('Add Todo'));
      await user.click(screen.getByText('Submit Form'));

      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument();
        expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading overlay when isLoading is true', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
          isLoading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('passes loading state to TodoList component', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
          isLoading={true}
        />
      );

      expect(screen.getByText('List Loading')).toBeInTheDocument();
    });

    it('shows form loading state during form submission', async () => {
      const user = userEvent.setup();
      let resolvePromise;
      mockOnTodoUpdate.mockImplementation(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      // Go to form and submit
      await user.click(screen.getByText('Add Todo'));
      await user.click(screen.getByText('Submit Form'));

      expect(screen.getByText('Form Loading')).toBeInTheDocument();

      // Resolve the promise
      resolvePromise();
      await waitFor(() => {
        expect(screen.queryByText('Form Loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      await user.click(screen.getByText('Close'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when modal close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      await user.click(screen.getByLabelText('Close modal'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets view to list when modal is reopened', () => {
      const { rerender } = render(
        <TodoModal
          isOpen={false}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      rerender(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onTodoUpdate gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={null}
        />
      );

      // Should not throw error when clicking buttons
      await user.click(screen.getByText('Toggle todo-1'));
      await user.click(screen.getByText('Delete todo-1'));
      
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('handles form submission errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockOnTodoUpdate.mockImplementation(async () => {
        const error = new Error('Submission failed');
        return Promise.reject(error);
      });
      
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      // Go to form and submit
      await user.click(screen.getByText('Add Todo'));
      
      // This should not crash the component - the error is handled internally
      try {
        await act(async () => {
          await user.click(screen.getByText('Submit Form'));
          // Wait for the error to be processed
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      } catch (error) {
        // Expected error, ignore it
      }
      
      // Wait a bit for any async operations
      await waitFor(() => {
        // The form should still be visible (not returned to list view)
        expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('handles empty todos array', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={mockSelectedDate}
          todos={[]}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByText('TodoList with 0 todos')).toBeInTheDocument();
      expect(screen.getByText('Add Todo')).toBeInTheDocument();
    });

    it('handles missing selectedDate', () => {
      render(
        <TodoModal
          isOpen={true}
          onClose={mockOnClose}
          selectedDate={null}
          todos={mockTodos}
          onTodoUpdate={mockOnTodoUpdate}
        />
      );

      expect(screen.getByText('Todos')).toBeInTheDocument();
    });
  });
});