import React from 'react';
import { Button } from '../UI';
import { formatMonthYear, getPreviousMonth, getNextMonth } from '../../utils/dateUtils';

/**
 * CalendarHeader component - Display month/year and navigation controls
 * @param {object} props - Component props
 * @param {Date} props.currentDate - Date object for current month
 * @param {function} props.onPrevMonth - Function to navigate to previous month
 * @param {function} props.onNextMonth - Function to navigate to next month
 * @param {boolean} props.disabled - Whether navigation is disabled (optional)
 * @param {boolean} props.showToday - Whether to show "Today" button (optional)
 * @param {function} props.onTodayClick - Function called when "Today" button is clicked (optional)
 */
const CalendarHeader = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  disabled = false,
  showToday = true,
  onTodayClick
}) => {
  if (!currentDate) {
    return null;
  }

  // Handle navigation clicks
  const handlePrevMonth = () => {
    if (!disabled && onPrevMonth) {
      onPrevMonth();
    }
  };

  const handleNextMonth = () => {
    if (!disabled && onNextMonth) {
      onNextMonth();
    }
  };

  const handleTodayClick = () => {
    if (!disabled && onTodayClick) {
      onTodayClick();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, action) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      action();
    }
  };

  // Check if we can navigate to previous/next month
  const canNavigatePrev = !disabled && onPrevMonth;
  const canNavigateNext = !disabled && onNextMonth;

  // Get month/year display text
  const monthYearText = formatMonthYear(currentDate);

  // Check if current month is today's month
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Previous Month Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          onKeyDown={(e) => handleKeyDown(e, handlePrevMonth)}
          disabled={!canNavigatePrev}
          className="p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label={`Go to ${formatMonthYear(getPreviousMonth(currentDate))}`}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
      </div>

      {/* Month/Year Display */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 text-center">
          {monthYearText}
        </h1>
      </div>

      {/* Next Month Button and Today Button */}
      <div className="flex items-center space-x-2">
        {/* Today Button */}
        {showToday && onTodayClick && !isCurrentMonth && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTodayClick}
            onKeyDown={(e) => handleKeyDown(e, handleTodayClick)}
            disabled={disabled}
            className="hidden sm:inline-flex text-sm px-3 py-1.5"
            aria-label="Go to current month"
          >
            Today
          </Button>
        )}

        {/* Next Month Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          onKeyDown={(e) => handleKeyDown(e, handleNextMonth)}
          disabled={!canNavigateNext}
          className="p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label={`Go to ${formatMonthYear(getNextMonth(currentDate))}`}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* Mobile Today Button */}
      {showToday && onTodayClick && !isCurrentMonth && (
        <div className="sm:hidden absolute top-16 left-1/2 transform -translate-x-1/2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTodayClick}
            disabled={disabled}
            className="text-xs px-2 py-1"
          >
            Today
          </Button>
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" id="calendar-navigation-status">
        Currently viewing {monthYearText}
      </div>
    </div>
  );
};

export default CalendarHeader;