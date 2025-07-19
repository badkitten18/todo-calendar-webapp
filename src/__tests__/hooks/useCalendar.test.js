import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendar, useCalendarView, useCalendarState } from '../../hooks/useCalendar';

describe('useCalendar', () => {
  let testDate;

  beforeEach(() => {
    // January 15, 2024 (Monday)
    testDate = new Date(2024, 0, 15);
    vi.useFakeTimers();
    vi.setSystemTime(testDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useCalendar hook', () => {
    it('should initialize with current date by default', () => {
      const { result } = renderHook(() => useCalendar());
      
      expect(result.current.currentDate.getFullYear()).toBe(2024);
      expect(result.current.currentDate.getMonth()).toBe(0); // January
    });

    it('should initialize with provided initial date', () => {
      const initialDate = new Date(2023, 5, 10); // June 10, 2023
      const { result } = renderHook(() => useCalendar(initialDate));
      
      expect(result.current.currentDate.getFullYear()).toBe(2023);
      expect(result.current.currentDate.getMonth()).toBe(5); // June
    });

    it('should initialize with no selected date', () => {
      const { result } = renderHook(() => useCalendar());
      
      expect(result.current.selectedDate).toBeNull();
    });

    describe('navigation functions', () => {
      it('should navigate to previous month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        act(() => {
          result.current.goToPrevMonth();
        });
        
        expect(result.current.currentDate.getMonth()).toBe(11); // December
        expect(result.current.currentDate.getFullYear()).toBe(2023);
      });

      it('should navigate to next month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        act(() => {
          result.current.goToNextMonth();
        });
        
        expect(result.current.currentDate.getMonth()).toBe(1); // February
        expect(result.current.currentDate.getFullYear()).toBe(2024);
      });

      it('should navigate to specific month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        const targetDate = new Date(2024, 6, 15); // July 15, 2024
        
        act(() => {
          result.current.goToMonth(targetDate);
        });
        
        expect(result.current.currentDate.getMonth()).toBe(6); // July
        expect(result.current.currentDate.getFullYear()).toBe(2024);
        expect(result.current.currentDate.getDate()).toBe(1); // Should be first day of month
      });

      it('should navigate to today', () => {
        const pastDate = new Date(2023, 5, 10);
        const { result } = renderHook(() => useCalendar(pastDate));
        
        act(() => {
          result.current.goToToday();
        });
        
        expect(result.current.currentDate.getMonth()).toBe(0); // January (current month)
        expect(result.current.currentDate.getFullYear()).toBe(2024);
        expect(result.current.selectedDate).not.toBeNull();
        expect(result.current.selectedDate.getDate()).toBe(15); // Today's date
      });

      it('should navigate to specific year and month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        act(() => {
          result.current.goToYearMonth(2025, 8); // September 2025
        });
        
        expect(result.current.currentDate.getFullYear()).toBe(2025);
        expect(result.current.currentDate.getMonth()).toBe(8); // September
        expect(result.current.currentDate.getDate()).toBe(1);
      });
    });

    describe('date selection functions', () => {
      it('should select a date', () => {
        const { result } = renderHook(() => useCalendar());
        const dateToSelect = new Date(2024, 0, 20);
        
        act(() => {
          result.current.selectDate(dateToSelect);
        });
        
        expect(result.current.selectedDate).toEqual(dateToSelect);
      });

      it('should clear selected date', () => {
        const { result } = renderHook(() => useCalendar());
        const dateToSelect = new Date(2024, 0, 20);
        
        act(() => {
          result.current.selectDate(dateToSelect);
        });
        
        expect(result.current.selectedDate).toEqual(dateToSelect);
        
        act(() => {
          result.current.clearSelectedDate();
        });
        
        expect(result.current.selectedDate).toBeNull();
      });

      it('should check if date is selected', () => {
        const { result } = renderHook(() => useCalendar());
        const dateToSelect = new Date(2024, 0, 20);
        const otherDate = new Date(2024, 0, 21);
        
        act(() => {
          result.current.selectDate(dateToSelect);
        });
        
        expect(result.current.isDateSelected(dateToSelect)).toBe(true);
        expect(result.current.isDateSelected(otherDate)).toBe(false);
      });

      it('should return false for isDateSelected when no date is selected', () => {
        const { result } = renderHook(() => useCalendar());
        const someDate = new Date(2024, 0, 20);
        
        expect(result.current.isDateSelected(someDate)).toBe(false);
      });
    });

    describe('utility functions', () => {
      it('should check if date is today', () => {
        const { result } = renderHook(() => useCalendar());
        const today = new Date();
        const notToday = new Date(2023, 5, 10);
        
        expect(result.current.isDateToday(today)).toBe(true);
        expect(result.current.isDateToday(notToday)).toBe(false);
      });

      it('should get month year display', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        expect(result.current.getMonthYearDisplay()).toBe('January 2024');
      });

      it('should get current year', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        expect(result.current.getCurrentYear()).toBe(2024);
      });

      it('should get current month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        expect(result.current.getCurrentMonth()).toBe(0); // January
      });

      it('should check if can go to previous month without constraints', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        expect(result.current.canGoToPrevMonth()).toBe(true);
      });

      it('should check if can go to next month without constraints', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        
        expect(result.current.canGoToNextMonth()).toBe(true);
      });

      it('should respect minimum date constraint for previous month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        const minDate = new Date(2024, 0, 1); // January 1, 2024
        
        expect(result.current.canGoToPrevMonth(minDate)).toBe(false);
      });

      it('should respect maximum date constraint for next month', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        const maxDate = new Date(2024, 0, 31); // January 31, 2024
        
        expect(result.current.canGoToNextMonth(maxDate)).toBe(false);
      });

      it('should get navigation info', () => {
        const { result } = renderHook(() => useCalendar(testDate));
        const navInfo = result.current.getNavigationInfo();
        
        expect(navInfo.isCurrentMonth).toBe(true);
        expect(navInfo.monthYear).toBe('January 2024');
        expect(navInfo.year).toBe(2024);
        expect(navInfo.month).toBe(0);
        expect(navInfo.canGoPrev).toBe(true);
        expect(navInfo.canGoNext).toBe(true);
      });

      it('should detect when not in current month', () => {
        const pastDate = new Date(2023, 5, 10);
        const { result } = renderHook(() => useCalendar(pastDate));
        const navInfo = result.current.getNavigationInfo();
        
        expect(navInfo.isCurrentMonth).toBe(false);
      });
    });
  });

  describe('useCalendarView hook', () => {
    it('should initialize with month view by default', () => {
      const { result } = renderHook(() => useCalendarView());
      
      expect(result.current.currentView).toBe('month');
      expect(result.current.isMonthView).toBe(true);
      expect(result.current.isWeekView).toBe(false);
      expect(result.current.isDayView).toBe(false);
    });

    it('should initialize with provided initial view', () => {
      const { result } = renderHook(() => useCalendarView('week'));
      
      expect(result.current.currentView).toBe('week');
      expect(result.current.isWeekView).toBe(true);
    });

    it('should switch to month view', () => {
      const { result } = renderHook(() => useCalendarView('week'));
      
      act(() => {
        result.current.setMonthView();
      });
      
      expect(result.current.currentView).toBe('month');
      expect(result.current.isMonthView).toBe(true);
    });

    it('should switch to week view', () => {
      const { result } = renderHook(() => useCalendarView());
      
      act(() => {
        result.current.setWeekView();
      });
      
      expect(result.current.currentView).toBe('week');
      expect(result.current.isWeekView).toBe(true);
    });

    it('should switch to day view', () => {
      const { result } = renderHook(() => useCalendarView());
      
      act(() => {
        result.current.setDayView();
      });
      
      expect(result.current.currentView).toBe('day');
      expect(result.current.isDayView).toBe(true);
    });

    it('should set custom view', () => {
      const { result } = renderHook(() => useCalendarView());
      
      act(() => {
        result.current.setCurrentView('custom');
      });
      
      expect(result.current.currentView).toBe('custom');
    });
  });

  describe('useCalendarState hook', () => {
    it('should combine calendar and view functionality', () => {
      const { result } = renderHook(() => useCalendarState(testDate, 'week'));
      
      // Calendar functionality
      expect(result.current.currentDate.getFullYear()).toBe(2024);
      expect(result.current.currentDate.getMonth()).toBe(0);
      expect(result.current.selectedDate).toBeNull();
      
      // View functionality
      expect(result.current.currentView).toBe('week');
      expect(result.current.isWeekView).toBe(true);
      
      // Should have all navigation functions
      expect(typeof result.current.goToPrevMonth).toBe('function');
      expect(typeof result.current.goToNextMonth).toBe('function');
      expect(typeof result.current.selectDate).toBe('function');
      
      // Should have all view functions
      expect(typeof result.current.setMonthView).toBe('function');
      expect(typeof result.current.setWeekView).toBe('function');
      expect(typeof result.current.setDayView).toBe('function');
    });

    it('should allow independent operation of calendar and view state', () => {
      const { result } = renderHook(() => useCalendarState(testDate));
      
      act(() => {
        result.current.goToNextMonth();
        result.current.setWeekView();
      });
      
      expect(result.current.currentDate.getMonth()).toBe(1); // February
      expect(result.current.currentView).toBe('week');
    });
  });
});