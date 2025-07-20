import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoItem from '../../components/Todo/TodoItem';

// Mock todo data
const mockTodo = {
  id: 'todo-1',
  title: 'Test Todo',
  description: 'This is a test todo description',
  completed: false,
  dateKey: '2024-01-15',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z'
};

const mockCompletedTodo = {
  ...mockTodo,
  id: 'todo-2',
  title: 'Completed Todo',
  completed: true,
  updatedAt: '2024-01-15T11:00:00.000Z'
};

const mockTodoWithoutDescription = {
  ...mockTodo,
  id: 'todo-3',
  title: 'Todo without description',
  description: ''
};

describe('TodoItem', () => {
  const mockOnToggleComplete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders todo item with title and description', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Test Todo')).toBeInTheDocument();
      expect(screen.getByText('This is a test todo description')).toBeInTheDocument();
    });

    it('renders todo item without description', () => {
      render(
        <TodoItem
          todo={mockTodoWithoutDescription}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Todo without description')).toBeInTheDocument();
      expect(screen.queryByText('This is a test todo description')).not.toBeInTheDocument();
    });

    it('renders null when no todo is provided', () => {
      const { container } = render(
        <TodoItem
          todo={null}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('displays creation date', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Created: 1\/15\/2024/)).toBeInTheDocument();
    });

    it('displays updated date when different from created date', () => {
      render(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Created: 1\/15\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/Updated: 1\/15\/2024/)).toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('renders unchecked checkbox for incomplete todo', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toHaveClass('bg-green-500');
    });

    it('renders checked checkbox for completed todo', () => {
      render(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as incomplete/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveClass('bg-green-500');
    });

    it('applies completed styling to completed todo', () => {
      render(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const title = screen.getByText('Completed Todo');
      expect(title).toHaveClass('line-through');
      expect(title).toHaveClass('text-gray-500');
    });

    it('does not apply completed styling to incomplete todo', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const title = screen.getByText('Test Todo');
      expect(title).not.toHaveClass('line-through');
      expect(title).toHaveClass('text-gray-900');
    });
  });

  describe('User Interactions', () => {
    it('calls onToggleComplete when checkbox is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      await user.click(checkbox);

      expect(mockOnToggleComplete).toHaveBeenCalledWith('todo-1');
    });

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Hover to show action buttons
      const todoItem = screen.getByText('Test Todo').closest('div');
      await user.hover(todoItem);

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTodo);
    });

    it('shows delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Hover to show action buttons
      const todoItem = screen.getByText('Test Todo').closest('div');
      await user.hover(todoItem);

      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      expect(screen.getByText('Are you sure you want to delete this todo?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onDelete when delete is confirmed', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Hover to show action buttons
      const todoItem = screen.getByText('Test Todo').closest('div');
      await user.hover(todoItem);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      // Confirm deletion - use getByText to target the specific confirmation button
      const confirmButton = screen.getByText('Delete');
      await user.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith('todo-1');
    });

    it('cancels delete when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Hover to show action buttons
      const todoItem = screen.getByText('Test Todo').closest('div');
      await user.hover(todoItem);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
      expect(screen.queryByText('Are you sure you want to delete this todo?')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('toggles completion with Enter key on checkbox', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      checkbox.focus();
      await user.keyboard('{Enter}');

      expect(mockOnToggleComplete).toHaveBeenCalledWith('todo-1');
    });

    it('toggles completion with Space key on checkbox', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      checkbox.focus();
      await user.keyboard(' ');

      expect(mockOnToggleComplete).toHaveBeenCalledWith('todo-1');
    });
  });

  describe('Loading State', () => {
    it('disables interactions when loading', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      expect(checkbox).toBeDisabled();
      
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    it('shows loading overlay when loading', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    it('does not call handlers when loading and clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      await user.click(checkbox);

      expect(mockOnToggleComplete).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles missing callback functions gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={null}
          onEdit={null}
          onDelete={null}
        />
      );

      const checkbox = screen.getByRole('button', { name: /mark as complete/i });
      
      // Should not throw error when clicking
      await user.click(checkbox);
      
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });
});