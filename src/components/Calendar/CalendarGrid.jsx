import React from 'react';
import CalendarDay from './CalendarDay';
import { getCalendarDays, getDayNames } from '../../utils/dateUtils';
import { getTodosForDate } from '../../utils/todoUtils';

/**
 * CalendarGrid component - Renders the calendar grid layout
 * @param {object} props - Component props
 * @param {Date} props.currentDate - Current month being displayed
 * @param {object} props.todos - Object containing todos organized by date key
 * @param {function} props.onDateClick - Function called when a date is clicked
 * @param {Date} props.selectedDate - Currently selected date
 * @param {boolean} props.showWeekNumbers - Whether to show week numbers (optional)
 */
const CalendarGrid = ({
  currentDate,
  todos = {},
  onDateClick,
  selectedDate,
  showWeekNumbers = false
}) => {
  if (!currentDate) {
    return null;
  }

  // Generate calendar days for the current month
  const calendarDays = getCalendarDays(currentDate);
  const dayNames = getDayNames(true); // Use abbreviated day names

  // Helper function to get todos for a specific date
  const getTodosForDay = (date) => {
    return getTodosForDate(todos, date);
  };

  // Helper function to check if a date is selected
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Split calendar days into weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Get week number for a given date (ISO week)
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  return (
    <div className="w-full">
      {/* Calendar Grid Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Day Names Header */}
        <div className={`grid ${showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'} bg-gray-50 border-b border-gray-200`}>
          {/* Week number column header */}
          {showWeekNumbers && (
            <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-200">
              Wk
            </div>
          )}
          
          {/* Day name headers */}
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="p-2 text-center text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide"
            >
              <span className="hidden sm:inline">{dayName}</span>
              <span className="sm:hidden">{dayName.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Weeks */}
        <div className="divide-y divide-gray-200">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className={`grid ${showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'} divide-x divide-gray-200`}
            >
              {/* Week number */}
              {showWeekNumbers && (
                <div className="flex items-center justify-center p-2 bg-gray-50 text-xs text-gray-500 font-medium">
                  {getWeekNumber(week[0])}
                </div>
              )}
              
              {/* Calendar days */}
              {week.map((date, dayIndex) => (
                <CalendarDay
                  key={`${weekIndex}-${dayIndex}`}
                  date={date}
                  todos={getTodosForDay(date)}
                  isSelected={isDateSelected(date)}
                  currentMonth={currentDate}
                  onClick={onDateClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>



      {/* Accessibility improvements */}
      <div className="sr-only" aria-live="polite" id="calendar-status">
        Calendar showing {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        {selectedDate && `, selected date: ${selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}`}
      </div>
    </div>
  );
};

export default CalendarGrid;