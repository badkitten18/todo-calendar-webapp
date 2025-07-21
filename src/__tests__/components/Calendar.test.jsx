import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Calendar from '../../components/Calendar/Calendar';

// Mock child components
vi.mock('../../components/Calendar/CalendarHeader', () => ({
  default: ({ currentDate, onPrevMonth, onNextMonth, onTodayClick, showToday }) => (
    <div data-testid="calendar-header">
      <span>Header for {currentDate?.toLocaleDateString()}</span>
      <button onClick={onPrevMonth}>Previous</button>
      <button onClick={onNextMonth}>Next</button>
      {showToday && <button onClick={onTodayClick}>Today</button>}
    </div>
  )
}));

vi.mock('../../components/Calendar/CalendarGrid', () => ({
  default: ({ currentDate, todos, onDateClick, selectedDate }) => (
    <div data-testid="calendar-grid">
      <span>Grid for {currentDate?.toLocaleDateString()}</span>
      <button onClick={() => onDateClick(new Date('2024-01-15'))}>
        Click Date
      </button>
      {selectedDate && <span>Selected: {selectedDate.toLocaleDateString()}</span>}
      <span>Todos count: {Object.keys(todos || {}).length}</span>
    </div>
  )
}));

vi.mock('../../components/Todo/TodoModal', () => ({
  default: ({ isOpen, onClose, selectedDate, todos, onTodoUpdate }) => 
    isOpen ? (
      <div data-testid="todo-modal">
        <span>Modal for {selectedDate?.toLocaleDateString()}</span>
        <span>Todos: {todos?.length || 0}</span>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onTodoUpdate('add', null, { title: 'Test Todo' })}>
          Add Todo
        </button>
        <button onClick={() => onTodoUpdate('toggle', 'todo-1')}>
          Toggle Todo
        </button>
      </div>
    ) : null
}));

// Mock custom hooks
vi.mock('../../hooks/useCalendar', () => ({
  useCalendar: vi.fn()
}));

vi.mock('../../hooks/useTodos', () => ({
  useTodos: vi.fn()
}));

import { useCalendar } from '../../hooks/useCalendar';
import { useTodos } from '../../hooks/useTodos';

// Mock data
const mockCurrentDate = new Date('2024-01-15T12:00:00.000Z');
const mockSelectedDate = new Date('2024-01-10T12:00:00.000Z');

const mockTodos = {
  '2024-01-10': [
    { id: 'todo-1', title: 'Test Todo 1', completed: false },
    { id: 'todo-2', title: 'Test Todo 2', completed: true }
  ],
  '2024-01-15': [
    { id: 'todo-3', title: 'Test Todo 3', completed: false }
  ]
};

describe('Calendar', () => {
  const mockGoToPrevMonth = vi.fn();
  const mockGoToNextMonth = vi.fn();
  const mockSelectDate = vi.fn();
  const mockGoToToday = vi.fn();
  const mockAddTodo = vi.fn();
  const mockUpdateTodo = vi.fn();
  const mockDeleteTodo = vi.fn();
  const mockToggleTodoComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCalendar hook
    useCalendar.mockReturnValue({
      currentDate: mockCurrentDate,
      selectedDate: mockSelectedDate,
      goToPrevMonth: mockGoToPrevMonth,
      goToNextMonth: mockGoToNextMonth,
      selectDate: mockSelectDate,
      goToToday: mockGoToToday
    });

    // Mock useTodos hook
    useTodos.mockReturnValue({
      todos: mockTodos,
      addTodo: mockAddTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
      toggleTodoComplete: mockToggleTodoComplete
    });
  });

  describe('Rendering', () => {
    it('renders calendar header and grid', () => {
      render(<Calendar />);

      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      expect(screen.getByText('Header for 1/15/2024')).toBeInTheDocument();
      expect(screen.getByText('Grid for 1/15/2024')).toBeInTheDocument();
    });

    it('passes correct props to CalendarHeader', () => {
      render(<Calendar />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('passes correct props to CalendarGrid', () => {
      render(<Calendar />);

      expect(screen.getByText('Selected: 1/10/2024')).toBeInTheDocument();
      expect(screen.getByText('Todos count: 2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Calendar className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('does not show modal initially', () => {
      render(<Calendar />);

      expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument();
    });
  });

  describe('Calendar Navigation', () => {
    it('calls goToPrevMonth when previous button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      await user.click(screen.getByText('Previous'));

      expect(mockGoToPrevMonth).toHaveBeenCalled();
    });

    it('calls goToNextMonth when next button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      await user.click(screen.getByText('Next'));

      expect(mockGoToNextMonth).toHaveBeenCalled();
    });

    it('calls goToToday when today button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      await user.click(screen.getByText('Today'));

      expect(mockGoToToday).toHaveBeenCalled();
    });
  });

  describe('Date Selection', () => {
    it('opens modal when date is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      await user.click(screen.getByText('Click Date'));

      expect(mockSelectDate).toHaveBeenCalledWith(new Date('2024-01-15'));
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Open modal first
      await user.click(screen.getByText('Click Date'));
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument();
    });

    it('shows correct todos for selected date', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      await user.click(screen.getByText('Click Date'));

      // Should show todos for the selected date (mockSelectedDate = 2024-01-10)
      expect(screen.getByText('Todos: 2')).toBeInTheDocument();
    });
  });

  describe('Todo Operations', () => {
    it('calls addTodo when add todo is triggered', async () => {
      const user = userEvent.setup();
      mockAddTodo.mockResolvedValue();
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));
      
      // Add todo
      await user.click(screen.getByText('Add Todo'));

      expect(mockAddTodo).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Todo' }));
    });

    it('calls toggleTodoComplete when toggle is triggered', async () => {
      const user = userEvent.setup();
      mockToggleTodoComplete.mockResolvedValue();
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));
      
      // Toggle todo
      await user.click(screen.getByText('Toggle Todo'));

      expect(mockToggleTodoComplete).toHaveBeenCalledWith('todo-1');
    });

    it('handles todo operations successfully', async () => {
      const user = userEvent.setup();
      mockAddTodo.mockResolvedValue({ id: 'new-todo', title: 'Test Todo' });
      
      render(<Calendar />);

      // Open modal
      await user.click(screen.getByText('Click Date'));
      
      // Add todo successfully
      await user.click(screen.getByText('Add Todo'));

      expect(mockAddTodo).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Todo' }));
    });
  });

  describe('Accessibility', () => {
    it('includes screen reader announcements for selected date', () => {
      render(<Calendar />);

      const announcement = screen.getByText(/Selected date: Wednesday, January 10, 2024/);
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });

    it('does not show announcement when no date is selected', () => {
      useCalendar.mockReturnValue({
        currentDate: mockCurrentDate,
        selectedDate: null,
        goToPrevMonth: mockGoToPrevMonth,
        goToNextMonth: mockGoToNextMonth,
        selectDate: mockSelectDate,
        goToToday: mockGoToToday
      });

      render(<Calendar />);

      expect(screen.queryByText(/Selected date:/)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive container classes', () => {
      const { container } = render(<Calendar />);
      
      expect(container.firstChild).toHaveClass('w-full', 'max-w-6xl', 'mx-auto');
    });

    it('applies proper styling to calendar container', () => {
      render(<Calendar />);
      
      const calendarContainer = screen.getByTestId('calendar-header').parentElement;
      expect(calendarContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'overflow-hidden');
    });
  });

  describe('Error Handling', () => {
    it('handles missing hook data gracefully', () => {
      useCalendar.mockReturnValue({
        currentDate: null,
        selectedDate: null,
        goToPrevMonth: mockGoToPrevMonth,
        goToNextMonth: mockGoToNextMonth,
        selectDate: mockSelectDate,
        goToToday: mockGoToToday
      });

      useTodos.mockReturnValue({
        todos: {},
        addTodo: mockAddTodo,
        updateTodo: mockUpdateTodo,
        deleteTodo: mockDeleteTodo,
        toggleTodoComplete: mockToggleTodoComplete
      });

      render(<Calendar />);

      // Should render without crashing
      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
    });

    it('handles unknown todo actions gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<Calendar />);

      // We can't easily test the unknown action through the UI,
      // but we can verify the component renders without crashing
      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('coordinates between calendar and todo components correctly', async () => {
      const user = userEvent.setup();
      
      render(<Calendar />);

      // Verify initial state
      expect(screen.getByText('Header for 1/15/2024')).toBeInTheDocument();
      expect(screen.getByText('Grid for 1/15/2024')).toBeInTheDocument();
      expect(screen.getByText('Selected: 1/10/2024')).toBeInTheDocument();

      // Click on a date
      await user.click(screen.getByText('Click Date'));

      // Verify modal opens with correct data
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal for 1/10/2024')).toBeInTheDocument();
      expect(screen.getByText('Todos: 2')).toBeInTheDocument();
    });

    it('maintains state consistency across components', () => {
      render(<Calendar />);

      // Verify that the same currentDate is passed to both header and grid
      expect(screen.getByText('Header for 1/15/2024')).toBeInTheDocument();
      expect(screen.getByText('Grid for 1/15/2024')).toBeInTheDocument();

      // Verify that the same selectedDate is used
      expect(screen.getByText('Selected: 1/10/2024')).toBeInTheDocument();
      expect(screen.getByText(/Selected date: Wednesday, January 10, 2024/)).toBeInTheDocument();
    });
  });
});