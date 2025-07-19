import { useState, useCallback } from 'react';
import { 
  getPreviousMonth, 
  getNextMonth, 
  isToday,
  formatDateKey 
} from '../utils/dateUtils';

/**
 * Custom hook for managing calendar state and navigation
 * @param {Date} initialDate - Initial date to display (defaults to current date)
 * @returns {object} Calendar state and navigation functions
 */
export const useCalendar = (initialDate = new Date()) => {
  // Current month being displayed
  const [currentDate, setCurrentDate] = useState(initialDate);
  
  // Currently selected date (for todo operations)
  const [selectedDate, setSelectedDate] = useState(null);

  /**
   * Navigate to the previous month
   */
  const goToPrevMonth = useCallback(() => {
    setCurrentDate(prevDate => getPreviousMonth(prevDate));
  }, []);

  /**
   * Navigate to the next month
   */
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => getNextMonth(prevDate));
  }, []);

  /**
   * Navigate to a specific month/year
   * @param {Date} date - Date representing the month to navigate to
   */
  const goToMonth = useCallback((date) => {
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  /**
   * Navigate to today's month
   */
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }, []);

  /**
   * Select a specific date
   * @param {Date} date - Date to select
   */
  const selectDate = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  /**
   * Clear the selected date
   */
  const clearSelectedDate = useCallback(() => {
    setSelectedDate(null);
  }, []);

  /**
   * Check if a date is currently selected
   * @param {Date} date - Date to check
   * @returns {boolean} True if the date is selected
   */
  const isDateSelected = useCallback((date) => {
    if (!selectedDate) return false;
    return formatDateKey(date) === formatDateKey(selectedDate);
  }, [selectedDate]);

  /**
   * Check if a date is today
   * @param {Date} date - Date to check
   * @returns {boolean} True if the date is today
   */
  const isDateToday = useCallback((date) => {
    return isToday(date);
  }, []);

  /**
   * Get the current month name and year for display
   * @returns {string} Formatted month and year (e.g., "January 2024")
   */
  const getMonthYearDisplay = useCallback(() => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }, [currentDate]);

  /**
   * Get the current year
   * @returns {number} Current year
   */
  const getCurrentYear = useCallback(() => {
    return currentDate.getFullYear();
  }, [currentDate]);

  /**
   * Get the current month (0-based)
   * @returns {number} Current month (0-11)
   */
  const getCurrentMonth = useCallback(() => {
    return currentDate.getMonth();
  }, [currentDate]);

  /**
   * Check if we can navigate to previous month (optional constraint)
   * @param {Date} minDate - Minimum allowed date (optional)
   * @returns {boolean} True if previous month navigation is allowed
   */
  const canGoToPrevMonth = useCallback((minDate = null) => {
    if (!minDate) return true;
    const prevMonth = getPreviousMonth(currentDate);
    return prevMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  }, [currentDate]);

  /**
   * Check if we can navigate to next month (optional constraint)
   * @param {Date} maxDate - Maximum allowed date (optional)
   * @returns {boolean} True if next month navigation is allowed
   */
  const canGoToNextMonth = useCallback((maxDate = null) => {
    if (!maxDate) return true;
    const nextMonth = getNextMonth(currentDate);
    return nextMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  }, [currentDate]);

  /**
   * Navigate to a specific year and month
   * @param {number} year - Year to navigate to
   * @param {number} month - Month to navigate to (0-based)
   */
  const goToYearMonth = useCallback((year, month) => {
    setCurrentDate(new Date(year, month, 1));
  }, []);

  /**
   * Get navigation info for UI components
   * @returns {object} Navigation state information
   */
  const getNavigationInfo = useCallback(() => {
    const today = new Date();
    const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && 
                          currentDate.getMonth() === today.getMonth();
    
    return {
      isCurrentMonth,
      monthYear: getMonthYearDisplay(),
      year: getCurrentYear(),
      month: getCurrentMonth(),
      canGoPrev: canGoToPrevMonth(),
      canGoNext: canGoToNextMonth()
    };
  }, [currentDate, getMonthYearDisplay, getCurrentYear, getCurrentMonth, canGoToPrevMonth, canGoToNextMonth]);

  return {
    // State
    currentDate,
    selectedDate,
    
    // Navigation functions
    goToPrevMonth,
    goToNextMonth,
    goToMonth,
    goToToday,
    goToYearMonth,
    
    // Selection functions
    selectDate,
    clearSelectedDate,
    
    // Utility functions
    isDateSelected,
    isDateToday,
    getMonthYearDisplay,
    getCurrentYear,
    getCurrentMonth,
    canGoToPrevMonth,
    canGoToNextMonth,
    getNavigationInfo
  };
};

/**
 * Hook for managing calendar view state (month/week/day views)
 * @param {string} initialView - Initial view mode ('month', 'week', 'day')
 * @returns {object} View state and functions
 */
export const useCalendarView = (initialView = 'month') => {
  const [currentView, setCurrentView] = useState(initialView);

  const setMonthView = useCallback(() => setCurrentView('month'), []);
  const setWeekView = useCallback(() => setCurrentView('week'), []);
  const setDayView = useCallback(() => setCurrentView('day'), []);

  const isMonthView = currentView === 'month';
  const isWeekView = currentView === 'week';
  const isDayView = currentView === 'day';

  return {
    currentView,
    setCurrentView,
    setMonthView,
    setWeekView,
    setDayView,
    isMonthView,
    isWeekView,
    isDayView
  };
};

/**
 * Combined hook that provides both calendar navigation and view management
 * @param {Date} initialDate - Initial date to display
 * @param {string} initialView - Initial view mode
 * @returns {object} Combined calendar state and functions
 */
export const useCalendarState = (initialDate = new Date(), initialView = 'month') => {
  const calendar = useCalendar(initialDate);
  const view = useCalendarView(initialView);

  return {
    ...calendar,
    ...view
  };
};