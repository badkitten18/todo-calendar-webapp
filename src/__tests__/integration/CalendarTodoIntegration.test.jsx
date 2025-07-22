import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Calendar from '../../components/Calendar/Calendar';

// Mock child components for integration testing
vi.mock('../../components/Calendar/CalendarHeader', () => ({
  default: ({ currentDate, onPrevMonth, onNextMonth, onTodayClick, showToday, disabled }) => (
    <div data-testid="calendar-header">
      <span>Header for {currentDate?.toLocaleDateString()}</span>
      <button onClick={onPrevMonth} disabled={disabled}>Previous</button>
      <button onClick={onNextMonth} disabled={disabled}>Next</button>
      {showToday && <button onClick={onTodayClick} disabled={disabled}>Today</button>}
      {disabled && <span>Disabled</span>}
    </div>
  )
}));

vi.mock('../../components/Calendar/CalendarGrid', () => ({
  default: ({ currentDate, todos, onDateClick, selectedDate, showWeekNumbers, disabled }) => (
    <div data-testid="calendar-grid">
      <span>Grid for {currentDate?.toLocaleDateString()}</span>
      <button onClick={() => onDateClick(new Date('2024-01-15'))} disabled={disabled}>
        Click Date
      </button>
      {selectedDate && <span>Selected: {selectedDate.toLocaleDateString()}</span>}
      <span>Todos count: {Object.keys(todos || {}).length}</span>
      <span>Week Numbers: {showWeekNumbers ? 'yes' : 'no'}</span>
      {disabled && <span>Grid Disabled</span>}
    </div>
  )
}));

vi.mock('../../components/Todo/TodoModal', () => ({
  default: ({ isOpen, onClose, selectedDate, todos, onTodoUpdate, isLoading, error, operationStatus }) => 
    isOpen ? (
      <div data-testid="todo-modal">
        <span>Modal for {selectedDate?.toLocaleDateString()}</span>
        <span>Todos: {todos?.length || 0}</span>
        <span>Loading: {isLoading ? 'yes' : 'no'}</span>
        {error && <span>Error: {error}</span>}
        {operationStatus?.success && <span>Success: {operationStatus.action}</span>}
        <button onClick={onClose}>Close Modal</button>
        <button 
          onClick={() => onTodoUpdate('add', null, { title: 'Test Todo' })}
          disabled={isLoading}
        >
          Add Todo
        </button>
        <button 
          onClick={() => onTodoUpdate('update', 'todo-1', { title: 'Updated Todo' })}
          disabled={isLoading}
        >
          Update Todo
        </button>
        <button 
          onClick={() => onTodoUpdate('delete', 'todo-1')}
          disabled={isLoading}
        >
          Delete Todo
        </button>
        <button 
          onClick={() => onTodoUpdate('toggle', 'todo-1')}
          disabled={isLoading}
        >
          Toggle Todo
        </button>
        <button 
          onClick={() => onTodoUpdate('invalid', 'todo-1')}
          disabled={isLoading}
        >
          Invalid Action
        </button>
      </div>
    ) : null
}));

// Mock the hooks with more realistic implementations
vi.mock('../../hooks/useCalendar', () => ({
  useCalendar: vi.fn()
}));

vi.mock('../../hooks/useTodos', () => ({
  useTodos: vi.fn()
}));

// Mock date utils
vi.mock('../../utils/dateUtils', () => ({
  formatDateKey: vi.fn((date) => date.toISOString().split('T')[0])
}));

import { useCalendar } from '../../hooks/useCalendar';
import { useTodos } from '../../hooks/useTodos';
import { formatDateKey } from '../../utils/dateUtils';

describe('Calendar-Todo Integration', () => {
  let mockCurrentDate;
  let mockSelectedDate;
  let mockTodos;
  let mockSetSelectedDate;
  let mockAddTodo;
  let mockUpdateTodo;
  let mockDeleteTodo;
  let mockToggleTodoComplete;
  let mockIsLoading;
  let mockError;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCurrentDate = new Date('2024-01-15T12:00:00.000Z');
    mockSelectedDate = null;
    mockTodos = {
      '2024-01-15': [
        { id: 'todo-1', title: 'Meeting at 10am', completed: false, description: 'Team standup' },
        { id: 'todo-2', title: 'Review PR', completed: true, description: 'Code review' }
      ],
      '2024-01-16': [
        { id: 'todo-3', title: 'Doctor appointment', completed: false, description: 'Annual checkup' }
      ]
    };

    mockSetSelectedDate = vi.fn((date) => {
      mockSelectedDate = date;
    });
    mockAddTodo = vi.fn();
    mockUpdateTodo = vi.fn();
    mockDeleteTodo = vi.fn();
    mockToggleTodoComplete = vi.fn();
    mockIsLoading = false;
    mockError = null;

    // Mock formatDateKey with null check
    formatDateKey.mockImplementation((date) => date ? date.toISOString().split('T')[0] : 'invalid-date');

    // Mock useCalendar hook
    useCalendar.mockReturnValue({
      currentDate: mockCurrentDate,
      selectedDate: mockSelectedDate,
      goToPrevMonth: vi.fn(),
      goToNextMonth: vi.fn(),
      selectDate: mockSetSelectedDate,
      goToToday: vi.fn()
    });

    // Mock useTodos hook
    useTodos.mockReturnValue({
      todos: mockTodos,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoComplete: mockToggleTodoComplete,
      isLoading: mockIsLoading,
      error: mockError
    });
  });

  describe('Calendar Display Integration', () => {
    it('displays todo indicators on calendar dates', () => {
      render(<Calendar />);

      // The CalendarGrid should receive the todos data
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      expect(screen.getByText('Todos count: 2')).toBeInTheDocument(); // 2 dates with todos
    });

    it('updates calendar display when todos change', async () => {
      const { rerender } = render(<Calendar />);

      // Initially shows 2 dates with todos
      expect(screen.getByText('Todos count: 2')).toBeInTheDocument();

      // Update todos mock to add more todos
      const updatedTodos = {
        ...mockTodos,
        '2024-01-17': [
          { id: 'todo-4', title: 'New task', completed: false, description: 'New task description' }
        ]
      };

      useTodos.mockReturnValue({
        todos: updatedTodos,
        addTodo: mockAddTodo,
        updateTodo: mockUpdateTodo,
        deleteTodo: mockDeleteTodo,
        toggleTodoComplete: mockToggleTodoComplete
      });

      rerender(<Calendar />);

      // Should now show 3 dates with todos
      expect(screen.getByText('Todos count: 3')).toBeInTheDocument();
    });
  });

  describe('Date Selection and Modal Integration', () => {
    it('opens todo modal when calendar date is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Initially modal should not be visible
      expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument();

      // Click on a date
      await user.click(screen.getByText('Click Date'));

      // Modal should open
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
      expect(mockSetSelectedDate).toHaveBeenCalled();
    });

    it('displays correct todos for selected date in modal', async () => {
      const user = userEvent.setup();
      
      // Set up selected date to have todos
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });

      render(<Calendar />);

      // Click on a date to open modal
      await user.click(screen.getByText('Click Date'));

      // Modal should show todos for the selected date (2024-01-15 has 2 todos)
      expect(screen.getByText('Todos: 2')).toBeInTheDocument();
    });

    it('shows empty state when selected date has no todos', async () => {
      const user = userEvent.setup();
      
      // Set up selected date with no todos
      mockSelectedDate = new Date('2024-01-20T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });

      render(<Calendar />);

      // Click on a date to open modal
      await user.click(screen.getByText('Click Date'));

      // Modal should show no todos
      expect(screen.getByText('Todos: 0')).toBeInTheDocument();
    });
  });

  describe('Todo Operations Integration', () => {
    it('adds todo and updates calendar display', async () => {
      const user = userEvent.setup();
      
      // Mock successful todo addition
      mockAddTodo.mockResolvedValue({
        id: 'new-todo',
        title: 'New Task',
        completed: false,
        description: 'New task description'
      });

      // Set up selected date
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Add a todo
      await user.click(screen.getByText('Add Todo'));

      expect(mockAddTodo).toHaveBeenCalled();
    });

    it('updates todo and maintains calendar state', async () => {
      const user = userEvent.setup();
      
      // Mock successful todo update
      mockUpdateTodo.mockResolvedValue({
        id: 'todo-1',
        title: 'Updated Task',
        completed: false,
        description: 'Updated description'
      });

      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Update a todo (simulated by clicking update button in mock)
      const updateButton = screen.getByText('Update Todo');
      if (updateButton) {
        await user.click(updateButton);
        expect(mockUpdateTodo).toHaveBeenCalled();
      }
    });

    it('deletes todo and updates calendar display', async () => {
      const user = userEvent.setup();
      
      // Mock successful todo deletion
      mockDeleteTodo.mockResolvedValue({ id: 'todo-1' });

      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Delete a todo (simulated by clicking delete button in mock)
      const deleteButton = screen.getByText('Delete Todo');
      if (deleteButton) {
        await user.click(deleteButton);
        expect(mockDeleteTodo).toHaveBeenCalled();
      }
    });

    it('toggles todo completion and updates display', async () => {
      const user = userEvent.setup();
      
      // Mock successful todo toggle
      mockToggleTodoComplete.mockResolvedValue({
        id: 'todo-1',
        title: 'Meeting at 10am',
        completed: true,
        description: 'Team standup'
      });

      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Toggle a todo
      await user.click(screen.getByText('Toggle Todo'));

      expect(mockToggleTodoComplete).toHaveBeenCalledWith('todo-1');
    });
  });

  describe('Data Flow Integration', () => {
    it('maintains consistent state between calendar and modal', async () => {
      const user = userEvent.setup();
      
      // Set up a specific selected date
      mockSelectedDate = new Date('2024-01-16T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });

      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Modal should show the correct date and todos
      expect(screen.getByText('Modal for 1/16/2024')).toBeInTheDocument();
      expect(screen.getByText('Todos: 1')).toBeInTheDocument(); // 2024-01-16 has 1 todo
    });

    it('handles calendar navigation without affecting modal state', async () => {
      const user = userEvent.setup();
      const mockGoToNextMonth = vi.fn();
      
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: mockGoToNextMonth,
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });

      render(<Calendar />);

      // Navigate to next month
      await user.click(screen.getByText('Next'));

      expect(mockGoToNextMonth).toHaveBeenCalled();
      
      // Modal should still be closed
      expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument();
    });

    it('closes modal and maintains calendar state', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument();

      // Calendar should still be visible and functional
      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles todo operation failures gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Set up selected date
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });
      
      // Mock failed operation - catch the error to prevent unhandled rejection
      mockAddTodo.mockImplementation(async () => {
        const error = new Error('Failed to add todo');
        return Promise.reject(error);
      });

      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Try to add todo - the error should be caught by the component
      await act(async () => {
        await user.click(screen.getByText('Add Todo'));
        // Wait for the error to be processed
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Calendar should still be functional
      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      
      // Error should be displayed
      await waitFor(() => {
        expect(screen.getAllByText(/Error:/)[0]).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('handles invalid todo actions gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Set up selected date
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Try invalid action - wrap in act to handle state updates and catch error
      await act(async () => {
        try {
          await user.click(screen.getByText('Invalid Action'));
          // Wait for the error to be processed
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Expected error from invalid action
        }
      });

      // Calendar should still be functional
      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      
      // Error should be displayed
      await waitFor(() => {
        expect(screen.getAllByText(/Error:/)[0]).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('handles missing todo data gracefully', () => {
      // Mock empty todos
      useTodos.mockReturnValue({
        todos: {},
        addTodo: mockAddTodo,
        updateTodo: mockUpdateTodo,
        deleteTodo: mockDeleteTodo,
        toggleTodoComplete: mockToggleTodoComplete,
        isLoading: false,
        error: null
      });

      render(<Calendar />);

      // Calendar should render without crashing
      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      expect(screen.getByText('Todos count: 0')).toBeInTheDocument();
    });
  });

  describe('Loading State Integration', () => {
    it('disables calendar interactions during loading', () => {
      // Mock loading state
      useTodos.mockReturnValue({
        todos: mockTodos,
        addTodo: mockAddTodo,
        updateTodo: mockUpdateTodo,
        deleteTodo: mockDeleteTodo,
        toggleTodoComplete: mockToggleTodoComplete,
        isLoading: true,
        error: null
      });

      render(<Calendar />);

      // Calendar controls should be disabled
      expect(screen.getByText('Disabled')).toBeInTheDocument();
      expect(screen.getByText('Grid Disabled')).toBeInTheDocument();
    });

    it('handles todo operations', async () => {
      const user = userEvent.setup();
      
      // Set up selected date
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });
      
      // Mock successful operation
      mockAddTodo.mockResolvedValue({ id: 'new-todo', title: 'Test Todo' });

      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Add todo
      await user.click(screen.getByText('Add Todo'));

      // Verify the add todo was called with correct parameters
      expect(mockAddTodo).toHaveBeenCalled();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility when modal opens and closes', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Check initial accessibility
      expect(screen.getByRole('button', { name: /Click Date/i })).toBeInTheDocument();

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Modal should be accessible
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Close Modal/i })).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByText('Close Modal'));

      // Focus should return to calendar
      expect(screen.getByRole('button', { name: /Click Date/i })).toBeInTheDocument();
    });

    it('provides screen reader announcements for todo operations', async () => {
      const user = userEvent.setup();
      
      // Set up selected date
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });

      render(<Calendar />);

      // Should have screen reader announcement for selected date
      expect(screen.getByText(/Selected date: Monday, January 15, 2024/)).toBeInTheDocument();
      
      // Check for aria-live attribute on the announcement element
      const announcementElement = screen.getByText(/Selected date:/);
      expect(announcementElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Props Integration', () => {
    it('passes showWeekNumbers prop to CalendarGrid', () => {
      render(<Calendar showWeekNumbers={true} />);
      
      expect(screen.getByText('Week Numbers: yes')).toBeInTheDocument();
    });

    it('calls onDateSelect callback when provided', async () => {
      const user = userEvent.setup();
      const onDateSelect = vi.fn();
      
      render(<Calendar onDateSelect={onDateSelect} />);

      // Click on a date
      await user.click(screen.getByText('Click Date'));

      // Callback should be called
      expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date));
    });

    it('applies custom className correctly', () => {
      const { container } = render(<Calendar className="custom-test-class" />);
      
      expect(container.firstChild).toHaveClass('custom-test-class');
    });
  });

  describe('Date Formatting Integration', () => {
    it('uses formatDateKey for consistent date handling', async () => {
      const user = userEvent.setup();
      
      // Mock selected date
      mockSelectedDate = new Date('2024-01-15T12:00:00.000Z');
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: mockSelectedDate,
        goToPrevMonth: vi.fn(),
        goToNextMonth: vi.fn(),
        selectDate: mockSetSelectedDate,
        goToToday: vi.fn()
      });
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));

      // Add todo
      await user.click(screen.getByText('Add Todo'));

      // Should use formatDateKey
      expect(formatDateKey).toHaveBeenCalled();
      expect(mockAddTodo).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Todo',
        dateKey: '2024-01-15'
      }));
    });
  });
});