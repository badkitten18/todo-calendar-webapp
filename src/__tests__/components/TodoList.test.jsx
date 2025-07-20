import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoList from '../../components/Todo/TodoList';

// Mock TodoItem component
vi.mock('../../components/Todo/TodoItem', () => ({
  default: ({ todo, onToggleComplete, onEdit, onDelete, isLoading }) => (
    <div data-testid={`todo-item-${todo.id}`}>
      <span>{todo.title}</span>
      <span>{todo.completed ? 'completed' : 'pending'}</span>
      <button onClick={() => onToggleComplete && onToggleComplete(todo.id)}>Toggle</button>
      <button onClick={() => onEdit && onEdit(todo)}>Edit</button>
      <button onClick={() => onDelete && onDelete(todo.id)}>Delete</button>
      {isLoading && <span>Loading</span>}
    </div>
  )
}));

// Mock date utilities
vi.mock('../../utils/dateUtils', () => ({
  formatFullDate: (date) => date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}));

// Mock todo data
const mockTodos = [
  {
    id: 'todo-1',
    title: 'First Todo',
    description: 'First todo description',
    completed: false,
    dateKey: '2024-01-15',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'todo-2',
    title: 'Second Todo',
    description: 'Second todo description',
    completed: true,
    dateKey: '2024-01-15',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T11:00:00.000Z'
  },
  {
    id: 'todo-3',
    title: 'Third Todo',
    description: 'Third todo description',
    completed: false,
    dateKey: '2024-01-15',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-01-15T08:00:00.000Z'
  }
];

const mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');

describe('TodoList', () => {
  const mockOnToggleComplete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders todo list with todos', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('First Todo')).toBeInTheDocument();
      expect(screen.getByText('Second Todo')).toBeInTheDocument();
      expect(screen.getByText('Third Todo')).toBeInTheDocument();
    });

    it('displays date header when selectedDate is provided', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Monday, January 15, 2024/)).toBeInTheDocument();
    });

    it('does not display date header when selectedDate is not provided', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Monday, January 15, 2024/)).not.toBeInTheDocument();
    });

    it('displays statistics correctly', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('3 total')).toBeInTheDocument();
      expect(screen.getByText('2 pending')).toBeInTheDocument();
      expect(screen.getByText('1 completed')).toBeInTheDocument();
    });

    it('displays progress bar with correct percentage', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument(); // 1 out of 3 completed
    });

    it('applies custom className', () => {
      const { container } = render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no todos provided', () => {
      render(
        <TodoList
          todos={[]}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No todos yet')).toBeInTheDocument();
      expect(screen.getByText(/No todos scheduled for Monday, January 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText('Click "Add Todo" to create your first task for this date')).toBeInTheDocument();
    });

    it('renders empty state when todos is null', () => {
      render(
        <TodoList
          todos={null}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No todos yet')).toBeInTheDocument();
    });

    it('renders empty state without date when selectedDate is not provided', () => {
      render(
        <TodoList
          todos={[]}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No todos yet')).toBeInTheDocument();
      expect(screen.getByText('No todos to display')).toBeInTheDocument();
    });
  });

  describe('Todo Sorting', () => {
    it('sorts todos with incomplete first, then by creation date', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const todoItems = screen.getAllByTestId(/todo-item-/);
      
      // Should be sorted: incomplete todos first (newest first), then completed todos (oldest first)
      // Expected order: todo-1 (incomplete, newest), todo-3 (incomplete, oldest), todo-2 (completed)
      expect(todoItems[0]).toHaveAttribute('data-testid', 'todo-item-todo-1');
      expect(todoItems[1]).toHaveAttribute('data-testid', 'todo-item-todo-3');
      expect(todoItems[2]).toHaveAttribute('data-testid', 'todo-item-todo-2');
    });
  });

  describe('User Interactions', () => {
    it('calls onToggleComplete when toggle button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const toggleButton = screen.getAllByText('Toggle')[0];
      await user.click(toggleButton);

      expect(mockOnToggleComplete).toHaveBeenCalledWith('todo-1');
    });

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getAllByText('Edit')[0];
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTodos[0]);
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('todo-1');
    });
  });

  describe('Loading State', () => {
    it('shows loading overlay when isLoading is true', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      expect(screen.getByText('Updating todos...')).toBeInTheDocument();
    });

    it('passes loading state to TodoItem components', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const loadingTexts = screen.getAllByText('Loading');
      expect(loadingTexts).toHaveLength(mockTodos.length);
    });

    it('does not show loading overlay when isLoading is false', () => {
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={false}
        />
      );

      expect(screen.queryByText('Updating todos...')).not.toBeInTheDocument();
    });
  });

  describe('Statistics and Progress', () => {
    it('calculates statistics correctly for all completed todos', () => {
      const allCompletedTodos = mockTodos.map(todo => ({ ...todo, completed: true }));
      
      render(
        <TodoList
          todos={allCompletedTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('3 total')).toBeInTheDocument();
      expect(screen.getByText('3 completed')).toBeInTheDocument();
      expect(screen.queryByText(/pending/)).not.toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('calculates statistics correctly for all pending todos', () => {
      const allPendingTodos = mockTodos.map(todo => ({ ...todo, completed: false }));
      
      render(
        <TodoList
          todos={allPendingTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('3 total')).toBeInTheDocument();
      expect(screen.getByText('3 pending')).toBeInTheDocument();
      expect(screen.queryByText(/completed/)).not.toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('does not show progress bar for empty todos', () => {
      render(
        <TodoList
          todos={[]}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing callback functions gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={null}
          onEdit={null}
          onDelete={null}
        />
      );

      // Should render without errors
      expect(screen.getByText('First Todo')).toBeInTheDocument();
      
      // Clicking buttons should not throw errors
      const toggleButton = screen.getAllByText('Toggle')[0];
      await user.click(toggleButton);
      
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('handles todos with missing properties gracefully', () => {
      const incompleteTodos = [
        {
          id: 'todo-1',
          title: 'Incomplete Todo',
          completed: false,
          // Missing other properties
        }
      ];

      render(
        <TodoList
          todos={incompleteTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Incomplete Todo')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive styling classes', () => {
      const { container } = render(
        <TodoList
          todos={mockTodos}
          selectedDate={mockSelectedDate}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const todoListContainer = container.querySelector('.space-y-3');
      expect(todoListContainer).toBeInTheDocument();
    });
  });
});