import React from 'react';
import { isToday, isCurrentMonth, formatDateKey } from '../../utils/dateUtils';

/**
 * CalendarDay component - Individual day cell in the calendar
 * @param {object} props - Component props
 * @param {Date} props.date - Date object for this day
 * @param {Array} props.todos - Array of todos for this date
 * @param {boolean} props.isSelected - Boolean indicating if this date is selected
 * @param {Date} props.currentMonth - Current month being displayed
 * @param {function} props.onClick - Function called when day is clicked
 * @param {boolean} props.disabled - Whether the day is disabled (optional)
 */
const CalendarDay = ({
  date,
  todos = [],
  isSelected = false,
  currentMonth,
  onClick,
  disabled = false
}) => {
  if (!date) {
    return null;
  }

  const dayNumber = date.getDate();
  const isCurrentDay = isToday(date);
  const isInCurrentMonth = isCurrentMonth(date, currentMonth);
  const hasTodos = todos && todos.length > 0;
  const completedTodos = todos ? todos.filter(todo => todo.completed) : [];
  const pendingTodos = todos ? todos.filter(todo => !todo.completed) : [];

  // Handle click event
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(date);
    }
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  // Base styles for the day cell
  const baseClasses = `
    relative flex flex-col items-center justify-center
    min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[4rem] lg:min-h-[5rem]
    p-1 sm:p-2
    border border-gray-200
    cursor-pointer
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
    ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}
  `.trim();

  // Conditional styling based on state
  const stateClasses = [
    // Current month vs other months
    isInCurrentMonth ? 'text-gray-900 bg-white' : 'text-gray-400 bg-gray-50',
    
    // Today highlighting
    isCurrentDay && isInCurrentMonth ? 'bg-blue-50 text-blue-600 font-semibold' : '',
    
    // Selected date highlighting
    isSelected ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : '',
    
    // Hover effects (only for current month and not disabled)
    isInCurrentMonth && !disabled ? 'hover:bg-gray-100' : '',
    
    // Selected + today combination
    isSelected && isCurrentDay ? 'bg-blue-200' : ''
  ].filter(Boolean).join(' ');

  const finalClasses = `${baseClasses} ${stateClasses}`;

  return (
    <div
      className={finalClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })}${hasTodos ? `, ${todos.length} todo${todos.length === 1 ? '' : 's'}` : ''}`}
      aria-pressed={isSelected}
      data-date={formatDateKey(date)}
    >
      {/* Day number */}
      <div className="text-sm sm:text-base md:text-lg font-medium">
        {dayNumber}
      </div>

      {/* Todo indicators */}
      {hasTodos && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {/* Completed todos indicator */}
          {completedTodos.length > 0 && (
            <div 
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"
              title={`${completedTodos.length} completed todo${completedTodos.length === 1 ? '' : 's'}`}
            />
          )}
          
          {/* Pending todos indicator */}
          {pendingTodos.length > 0 && (
            <div 
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"
              title={`${pendingTodos.length} pending todo${pendingTodos.length === 1 ? '' : 's'}`}
            />
          )}
          
          {/* Additional todos indicator (if more than 2 total) */}
          {todos.length > 2 && (
            <div 
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"
              title={`${todos.length} total todos`}
            />
          )}
        </div>
      )}

      {/* Today indicator (small dot in top-right corner) */}
      {isCurrentDay && isInCurrentMonth && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
      )}

      {/* Selected date overlay */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
      )}

      {/* Mobile touch target enhancement */}
      <div className="absolute inset-0 sm:hidden" />
    </div>
  );
};

export default CalendarDay;