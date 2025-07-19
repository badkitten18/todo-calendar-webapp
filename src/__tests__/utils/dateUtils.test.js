import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  formatDateKey,
  parseDateKey,
  formatMonthYear,
  formatFullDate,
  isSameDay,
  isToday,
  getPreviousMonth,
  getNextMonth,
  getCalendarDays,
  getDayNames,
  isCurrentMonth
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  let testDate;
  
  beforeEach(() => {
    // January 15, 2024 (Monday)
    testDate = new Date(2024, 0, 15);
  });

  describe('getDaysInMonth', () => {
    it('should return correct number of days for January', () => {
      const januaryDate = new Date(2024, 0, 1);
      expect(getDaysInMonth(januaryDate)).toBe(31);
    });

    it('should return correct number of days for February in leap year', () => {
      const febLeapYear = new Date(2024, 1, 1);
      expect(getDaysInMonth(febLeapYear)).toBe(29);
    });

    it('should return correct number of days for February in non-leap year', () => {
      const febNonLeapYear = new Date(2023, 1, 1);
      expect(getDaysInMonth(febNonLeapYear)).toBe(28);
    });

    it('should return correct number of days for April', () => {
      const aprilDate = new Date(2024, 3, 1);
      expect(getDaysInMonth(aprilDate)).toBe(30);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('should return correct first day for January 2024', () => {
      const januaryDate = new Date(2024, 0, 1);
      expect(getFirstDayOfMonth(januaryDate)).toBe(1); // Monday
    });

    it('should return correct first day for February 2024', () => {
      const februaryDate = new Date(2024, 1, 1);
      expect(getFirstDayOfMonth(februaryDate)).toBe(4); // Thursday
    });
  });

  describe('getLastDayOfMonth', () => {
    it('should return correct last day for January 2024', () => {
      const januaryDate = new Date(2024, 0, 1);
      expect(getLastDayOfMonth(januaryDate)).toBe(3); // Wednesday (Jan 31)
    });
  });

  describe('formatDateKey', () => {
    it('should format date correctly', () => {
      expect(formatDateKey(testDate)).toBe('2024-01-15');
    });

    it('should pad single digit months and days', () => {
      const singleDigitDate = new Date(2024, 0, 5);
      expect(formatDateKey(singleDigitDate)).toBe('2024-01-05');
    });

    it('should handle December correctly', () => {
      const decemberDate = new Date(2024, 11, 25);
      expect(formatDateKey(decemberDate)).toBe('2024-12-25');
    });
  });

  describe('parseDateKey', () => {
    it('should parse date key correctly', () => {
      const parsed = parseDateKey('2024-01-15');
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0); // January is 0
      expect(parsed.getDate()).toBe(15);
    });

    it('should handle December correctly', () => {
      const parsed = parseDateKey('2024-12-25');
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(11); // December is 11
      expect(parsed.getDate()).toBe(25);
    });
  });

  describe('formatMonthYear', () => {
    it('should format month and year correctly', () => {
      expect(formatMonthYear(testDate)).toBe('January 2024');
    });

    it('should handle different months correctly', () => {
      const julyDate = new Date(2024, 6, 15);
      expect(formatMonthYear(julyDate)).toBe('July 2024');
    });
  });

  describe('formatFullDate', () => {
    it('should format full date correctly', () => {
      expect(formatFullDate(testDate)).toBe('Jan 15, 2024');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same dates', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 15);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return true for same day with different times', () => {
      const date1 = new Date(2024, 0, 15, 10, 30);
      const date2 = new Date(2024, 0, 15, 15, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for different date', () => {
      expect(isToday(testDate)).toBe(false);
    });
  });

  describe('getPreviousMonth', () => {
    it('should return previous month correctly', () => {
      const prevMonth = getPreviousMonth(testDate);
      expect(prevMonth.getMonth()).toBe(11); // December
      expect(prevMonth.getFullYear()).toBe(2023);
    });

    it('should handle year transition correctly', () => {
      const marchDate = new Date(2024, 2, 15);
      const prevMonth = getPreviousMonth(marchDate);
      expect(prevMonth.getMonth()).toBe(1); // February
      expect(prevMonth.getFullYear()).toBe(2024);
    });
  });

  describe('getNextMonth', () => {
    it('should return next month correctly', () => {
      const nextMonth = getNextMonth(testDate);
      expect(nextMonth.getMonth()).toBe(1); // February
      expect(nextMonth.getFullYear()).toBe(2024);
    });

    it('should handle year transition correctly', () => {
      const decemberDate = new Date(2024, 11, 15);
      const nextMonth = getNextMonth(decemberDate);
      expect(nextMonth.getMonth()).toBe(0); // January
      expect(nextMonth.getFullYear()).toBe(2025);
    });
  });

  describe('getCalendarDays', () => {
    it('should return 42 days for calendar grid', () => {
      const calendarDays = getCalendarDays(testDate);
      expect(calendarDays).toHaveLength(42);
    });

    it('should include days from previous month', () => {
      const calendarDays = getCalendarDays(testDate);
      // January 2024 starts on Monday, so Sunday should be from previous month
      expect(calendarDays[0].getMonth()).toBe(11); // December
      expect(calendarDays[0].getDate()).toBe(31); // Dec 31
    });

    it('should include all days of current month', () => {
      const calendarDays = getCalendarDays(testDate);
      const januaryDays = calendarDays.filter(day => day.getMonth() === 0);
      expect(januaryDays).toHaveLength(31);
    });

    it('should include days from next month to fill grid', () => {
      const calendarDays = getCalendarDays(testDate);
      const februaryDays = calendarDays.filter(day => day.getMonth() === 1);
      expect(februaryDays.length).toBeGreaterThan(0);
    });
  });

  describe('getDayNames', () => {
    it('should return abbreviated day names by default', () => {
      const dayNames = getDayNames();
      expect(dayNames).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });

    it('should return full day names when requested', () => {
      const dayNames = getDayNames(false);
      expect(dayNames).toEqual([
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ]);
    });
  });

  describe('isCurrentMonth', () => {
    it('should return true for dates in current month', () => {
      const currentMonth = new Date(2024, 0, 1);
      const dateInMonth = new Date(2024, 0, 15);
      expect(isCurrentMonth(dateInMonth, currentMonth)).toBe(true);
    });

    it('should return false for dates in different month', () => {
      const currentMonth = new Date(2024, 0, 1);
      const dateInDifferentMonth = new Date(2024, 1, 15);
      expect(isCurrentMonth(dateInDifferentMonth, currentMonth)).toBe(false);
    });

    it('should return false for dates in different year', () => {
      const currentMonth = new Date(2024, 0, 1);
      const dateInDifferentYear = new Date(2023, 0, 15);
      expect(isCurrentMonth(dateInDifferentYear, currentMonth)).toBe(false);
    });
  });
});