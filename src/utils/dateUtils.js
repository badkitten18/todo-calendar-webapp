/**
 * Date utility functions for calendar operations
 */

/**
 * Get the number of days in a given month
 * @param {Date} date - Date object for the month
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
 * @param {Date} date - Date object for the month
 * @returns {number} Day of week (0-6)
 */
export const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * Get the last day of the month (0 = Sunday, 1 = Monday, etc.)
 * @param {Date} date - Date object for the month
 * @returns {number} Day of week (0-6)
 */
export const getLastDayOfMonth = (date) => {
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDate.getDay();
};

/**
 * Format a date as YYYY-MM-DD string for use as storage key
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date key string (YYYY-MM-DD) back to a Date object
 * @param {string} dateKey - Date key string
 * @returns {Date} Date object
 */
export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a date for display (e.g., "January 2024")
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Format a date for display (e.g., "Jan 15, 2024")
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatFullDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  return formatDateKey(date1) === formatDateKey(date2);
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * Get the previous month date
 * @param {Date} date - Current date
 * @returns {Date} Date object for previous month
 */
export const getPreviousMonth = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - 1);
  return newDate;
};

/**
 * Get the next month date
 * @param {Date} date - Current date
 * @returns {Date} Date object for next month
 */
export const getNextMonth = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
};

/**
 * Generate an array of calendar days for a given month
 * Includes days from previous and next month to fill the calendar grid
 * @param {Date} date - Date for the month to generate
 * @returns {Array} Array of date objects for calendar display
 */
export const getCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const daysInPrevMonth = getDaysInMonth(getPreviousMonth(date));
  
  const calendarDays = [];
  
  // Add days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push(new Date(year, month - 1, day));
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }
  
  // Add days from next month to complete the grid (42 days = 6 weeks)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push(new Date(year, month + 1, day));
  }
  
  return calendarDays;
};

/**
 * Get day names for calendar header
 * @param {boolean} abbreviated - Whether to use abbreviated names
 * @returns {Array} Array of day name strings
 */
export const getDayNames = (abbreviated = true) => {
  const days = abbreviated 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return days;
};

/**
 * Check if a date belongs to the current month being displayed
 * @param {Date} date - Date to check
 * @param {Date} currentMonth - Current month being displayed
 * @returns {boolean} True if date is in current month
 */
export const isCurrentMonth = (date, currentMonth) => {
  return date.getMonth() === currentMonth.getMonth() && 
         date.getFullYear() === currentMonth.getFullYear();
};