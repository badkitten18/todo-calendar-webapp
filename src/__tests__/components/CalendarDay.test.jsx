import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarDay from '../../components/Calendar/CalendarDay';

// Mock date utilities
vi.mock('../../utils/dateUtils', () => ({
  isToday: vi.fn(),
  isSameDay: vi.fn(),
  isCurrentMonth: vi.fn(),
  formatDateKey: vi.fn()
}));

import { isToday, isSameDay, isCurrentMonth, formatDateKey } from '../../utils/dateUtils';

// Mock data
const mockDate = new Date('2024-01-15T12:00:00.000Z');
const mockCurrentMonth = new Date('2024-01-01T12:00:00.000Z');
const mockTodos = [
  {
    id: 'todo-1',
    title: 'First Todo',
    completed: false,
    dateKey: '2024-01-15'
  },
  {
    id: 'todo-2',
    title: 'Second Todo',
    completed: true,
    dateKey: '2024-01-15'
  },
  {
    id: 'todo-3',
    title: 'Third Todo',
    completed: false,
    dateKey: '2024-01-15'
  }
];

describe('CalendarDay', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    isToday.mockReturnValue(false);
    isSameDay.mockReturnValue(false);
    isCurrentMonth.mockReturnValue(true);
    formatDateKey.mockReturnValue('2024-01-15');
  });

  describe('Rendering', () => {
    it('renders day number correctly', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders null when no date is provided', () => {
      const { container } = render(
        <CalendarDay
          date={null}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('applies correct aria-label', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={mockTodos}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveAttribute('aria-label', expect.stringContaining('3 todos'));
    });

    it('sets correct data-date attribute', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveAttribute('data-date', '2024-01-15');
    });
  });

  describe('Styling States', () => {
    it('applies current month styling', () => {
      isCurrentMonth.mockReturnValue(true);
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveClass('text-gray-900', 'bg-white');
    });

    it('applies other month styling', () => {
      isCurrentMonth.mockReturnValue(false);
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveClass('text-gray-400', 'bg-gray-50');
    });

    it('applies today styling', () => {
      isToday.mockReturnValue(true);
      isCurrentMonth.mockReturnValue(true);
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveClass('bg-blue-50', 'text-blue-600', 'font-semibold');
    });

    it('applies selected styling', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          isSelected={true}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveClass('bg-blue-100', 'ring-2', 'ring-blue-500');
    });

    it('applies disabled styling', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveClass('cursor-not-allowed', 'opacity-50');
      expect(dayButton).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Todo Indicators', () => {
    it('does not show indicators when no todos', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={[]}
        />
      );

      expect(screen.queryByTitle(/todo/)).not.toBeInTheDocument();
    });

    it('shows completed todos indicator', () => {
      const completedTodos = [
        { id: '1', completed: true },
        { id: '2', completed: true }
      ];

      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={completedTodos}
        />
      );

      expect(screen.getByTitle('2 completed todos')).toBeInTheDocument();
    });

    it('shows pending todos indicator', () => {
      const pendingTodos = [
        { id: '1', completed: false },
        { id: '2', completed: false }
      ];

      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={pendingTodos}
        />
      );

      expect(screen.getByTitle('2 pending todos')).toBeInTheDocument();
    });

    it('shows both completed and pending indicators', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={mockTodos}
        />
      );

      expect(screen.getByTitle('1 completed todo')).toBeInTheDocument();
      expect(screen.getByTitle('2 pending todos')).toBeInTheDocument();
    });

    it('shows additional todos indicator for more than 2 todos', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={mockTodos}
        />
      );

      expect(screen.getByTitle('3 total todos')).toBeInTheDocument();
    });
  });

  describe('Today Indicator', () => {
    it('shows today indicator when date is today and in current month', () => {
      isToday.mockReturnValue(true);
      isCurrentMonth.mockReturnValue(true);
      
      const { container } = render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const todayIndicator = container.querySelector('.absolute.top-1.right-1');
      expect(todayIndicator).toBeInTheDocument();
      expect(todayIndicator).toHaveClass('bg-blue-600', 'rounded-full');
    });

    it('does not show today indicator when date is today but not in current month', () => {
      isToday.mockReturnValue(true);
      isCurrentMonth.mockReturnValue(false);
      
      const { container } = render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const todayIndicator = container.querySelector('.absolute.top-1.right-1');
      expect(todayIndicator).not.toBeInTheDocument();
    });

    it('does not show today indicator when date is not today', () => {
      isToday.mockReturnValue(false);
      isCurrentMonth.mockReturnValue(true);
      
      const { container } = render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const todayIndicator = container.querySelector('.absolute.top-1.right-1');
      expect(todayIndicator).not.toBeInTheDocument();
    });
  });

  describe('Selected Date Overlay', () => {
    it('shows selected overlay when date is selected', () => {
      const { container } = render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          isSelected={true}
        />
      );

      const overlay = container.querySelector('.absolute.inset-0.border-2.border-blue-500');
      expect(overlay).toBeInTheDocument();
    });

    it('does not show selected overlay when date is not selected', () => {
      const { container } = render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          isSelected={false}
        />
      );

      const overlay = container.querySelector('.absolute.inset-0.border-2.border-blue-500');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when day is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      await user.click(dayButton);

      expect(mockOnClick).toHaveBeenCalledWith(mockDate);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const dayButton = screen.getByRole('button');
      await user.click(dayButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('calls onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      dayButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledWith(mockDate);
    });

    it('calls onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      dayButton.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledWith(mockDate);
    });

    it('does not call onClick when disabled and key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const dayButton = screen.getByRole('button');
      dayButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct role and tabindex', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveAttribute('tabIndex', '0');
    });

    it('has correct aria-pressed attribute', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          isSelected={true}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('has correct tabindex when disabled', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          disabled={true}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Error Handling', () => {
    it('handles missing onClick gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={null}
        />
      );

      const dayButton = screen.getByRole('button');
      
      // Should not throw error when clicking
      await user.click(dayButton);
      
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('handles missing todos gracefully', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
          todos={null}
        />
      );

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const dayButton = screen.getByRole('button');
      expect(dayButton).toHaveClass('min-h-[2.5rem]', 'sm:min-h-[3rem]', 'md:min-h-[4rem]', 'lg:min-h-[5rem]');
    });

    it('includes mobile touch target enhancement', () => {
      const { container } = render(
        <CalendarDay
          date={mockDate}
          currentMonth={mockCurrentMonth}
          onClick={mockOnClick}
        />
      );

      const touchTarget = container.querySelector('.absolute.inset-0.sm\\:hidden');
      expect(touchTarget).toBeInTheDocument();
    });
  });
});