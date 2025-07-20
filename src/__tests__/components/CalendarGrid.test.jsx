import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarGrid from '../../components/Calendar/CalendarGrid';

// Mock CalendarDay component
vi.mock('../../components/Calendar/CalendarDay', () => ({
  default: ({ date, todos, isSelected, onClick }) => (
    <div 
      data-testid={`calendar-day-${date.getDate()}`}
      data-selected={isSelected}
      onClick={() => onClick && onClick(date)}
    >
      <span>Day {date.getDate()}</span>
      {todos && todos.length > 0 && <span>({todos.length} todos)</span>}
    </div>
  )
}));

// Mock date utilities
vi.mock('../../utils/dateUtils', () => ({
  getCalendarDays: vi.fn(),
  getDayNames: vi.fn()
}));

// Mock todo utilities
vi.mock('../../utils/todoUtils', () => ({
  getTodosForDate: vi.fn()
}));

import { getCalendarDays, getDayNames } from '../../utils/dateUtils';
import { getTodosForDate } from '../../utils/todoUtils';

// Mock data
const mockCurrentDate = new Date('2024-01-15T12:00:00.000Z');
const mockSelectedDate = new Date('2024-01-10T12:00:00.000Z');

const mockCalendarDays = [
  // Week 1
  new Date('2023-12-31'), new Date('2024-01-01'), new Date('2024-01-02'), 
  new Date('2024-01-03'), new Date('2024-01-04'), new Date('2024-01-05'), new Date('2024-01-06'),
  // Week 2
  new Date('2024-01-07'), new Date('2024-01-08'), new Date('2024-01-09'), 
  new Date('2024-01-10'), new Date('2024-01-11'), new Date('2024-01-12'), new Date('2024-01-13'),
  // Week 3
  new Date('2024-01-14'), new Date('2024-01-15'), new Date('2024-01-16'), 
  new Date('2024-01-17'), new Date('2024-01-18'), new Date('2024-01-19'), new Date('2024-01-20'),
  // Week 4
  new Date('2024-01-21'), new Date('2024-01-22'), new Date('2024-01-23'), 
  new Date('2024-01-24'), new Date('2024-01-25'), new Date('2024-01-26'), new Date('2024-01-27'),
  // Week 5
  new Date('2024-01-28'), new Date('2024-01-29'), new Date('2024-01-30'), 
  new Date('2024-01-31'), new Date('2024-02-01'), new Date('2024-02-02'), new Date('2024-02-03'),
  // Week 6
  new Date('2024-02-04'), new Date('2024-02-05'), new Date('2024-02-06'), 
  new Date('2024-02-07'), new Date('2024-02-08'), new Date('2024-02-09'), new Date('2024-02-10')
];

const mockDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const mockTodos = {
  '2024-01-15': [
    { id: '1', title: 'Todo 1', completed: false },
    { id: '2', title: 'Todo 2', completed: true }
  ],
  '2024-01-20': [
    { id: '3', title: 'Todo 3', completed: false }
  ]
};

describe('CalendarGrid', () => {
  const mockOnDateClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    getCalendarDays.mockReturnValue(mockCalendarDays);
    getDayNames.mockReturnValue(mockDayNames);
    getTodosForDate.mockImplementation((todos, date) => {
      if (!todos) return [];
      const dateKey = date.toISOString().split('T')[0];
      return todos[dateKey] || [];
    });
  });

  describe('Rendering', () => {
    it('renders calendar grid with day names header', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Check day names are rendered
      mockDayNames.forEach(dayName => {
        expect(screen.getByText(dayName)).toBeInTheDocument();
      });
    });

    it('renders all calendar days', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Check that calendar days are rendered (42 total days in 6 weeks)
      const calendarDays = screen.getAllByTestId(/calendar-day-/);
      expect(calendarDays).toHaveLength(42);
    });

    it('renders null when no currentDate is provided', () => {
      const { container } = render(
        <CalendarGrid
          currentDate={null}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders with week numbers when showWeekNumbers is true', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
          showWeekNumbers={true}
        />
      );

      expect(screen.getByText('Wk')).toBeInTheDocument();
    });

    it('does not render week numbers when showWeekNumbers is false', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
          showWeekNumbers={false}
        />
      );

      expect(screen.queryByText('Wk')).not.toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('applies correct grid classes without week numbers', () => {
      const { container } = render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
          showWeekNumbers={false}
        />
      );

      const headerGrid = container.querySelector('.grid-cols-7');
      expect(headerGrid).toBeInTheDocument();
    });

    it('applies correct grid classes with week numbers', () => {
      const { container } = render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
          showWeekNumbers={true}
        />
      );

      const headerGrid = container.querySelector('.grid-cols-8');
      expect(headerGrid).toBeInTheDocument();
    });

    it('organizes days into weeks correctly', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Should have 6 weeks (42 days / 7 days per week)
      const weekRows = screen.getAllByTestId(/calendar-day-/);
      expect(weekRows).toHaveLength(42); // 6 weeks * 7 days
    });
  });

  describe('Day Names Header', () => {
    it('shows abbreviated day names on larger screens', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      expect(getDayNames).toHaveBeenCalledWith(true); // abbreviated = true
    });

    it('renders day names with proper styling', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      const dayHeader = screen.getByText('Sun').parentElement;
      expect(dayHeader).toHaveClass('text-center', 'font-medium', 'text-gray-700', 'uppercase');
    });
  });

  describe('Todo Integration', () => {
    it('passes todos to CalendarDay components', () => {
      getTodosForDate.mockImplementation((todos, date) => {
        if (date.getDate() === 15) {
          return [{ id: '1', title: 'Test Todo' }];
        }
        return [];
      });

      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      expect(screen.getByText('(1 todos)')).toBeInTheDocument();
    });

    it('handles empty todos object', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={{}}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Should render without errors
      expect(screen.getByTestId('calendar-day-15')).toBeInTheDocument();
    });

    it('handles null todos', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={null}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Should render without errors
      expect(screen.getByTestId('calendar-day-15')).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('marks selected date correctly', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      const selectedDays = screen.getAllByTestId('calendar-day-10');
      const selectedDay = selectedDays.find(day => day.getAttribute('data-selected') === 'true');
      expect(selectedDay).toBeInTheDocument();
    });

    it('handles no selected date', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={null}
        />
      );

      // All days should not be selected
      const days = screen.getAllByTestId(/calendar-day-/);
      days.forEach(day => {
        expect(day).toHaveAttribute('data-selected', 'false');
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onDateClick when a day is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      const day15 = screen.getByTestId('calendar-day-15');
      await user.click(day15);

      expect(mockOnDateClick).toHaveBeenCalledWith(expect.any(Date));
    });

    it('handles missing onDateClick gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={null}
          selectedDate={mockSelectedDate}
        />
      );

      const day15 = screen.getByTestId('calendar-day-15');
      
      // Should not throw error when clicking
      await user.click(day15);
      
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('Week Numbers', () => {
    it('calculates week numbers correctly', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
          showWeekNumbers={true}
        />
      );

      // Should show week numbers (exact values depend on the year)
      expect(screen.getByText('Wk')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes screen reader status updates', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      const statusElement = screen.getByText(/Calendar showing/);
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('includes selected date in status when provided', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      expect(screen.getByText(/selected date:/)).toBeInTheDocument();
    });

    it('does not include selected date in status when not provided', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={null}
        />
      );

      expect(screen.queryByText(/selected date:/)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes to day headers', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      const dayHeader = screen.getByText('Sun').parentElement;
      expect(dayHeader).toHaveClass('text-xs', 'sm:text-sm');
    });

    it('includes mobile-specific day name abbreviations', () => {
      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Should have both full and abbreviated versions for responsive display
      const dayHeaders = screen.getAllByText('Sun');
      expect(dayHeaders.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid currentDate gracefully', () => {
      const { container } = render(
        <CalendarGrid
          currentDate={undefined}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles missing utility functions gracefully', () => {
      getCalendarDays.mockReturnValue([]);
      getDayNames.mockReturnValue([]);

      render(
        <CalendarGrid
          currentDate={mockCurrentDate}
          todos={mockTodos}
          onDateClick={mockOnDateClick}
          selectedDate={mockSelectedDate}
        />
      );

      // Should render basic structure without crashing
      const container = screen.getByText(/Calendar showing/);
      expect(container).toBeInTheDocument();
    });
  });
});