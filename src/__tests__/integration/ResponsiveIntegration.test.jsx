import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../../App';

// Mock window.matchMedia for testing responsive behavior
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock the Calendar component
vi.mock('../../components/Calendar/Calendar', () => ({
  default: ({ showWeekNumbers, className }) => (
    <div data-testid="calendar-component" className={className || ''}>
      <h2>Calendar Component</h2>
      <div>Week Numbers: {showWeekNumbers ? 'yes' : 'no'}</div>
    </div>
  )
}));

describe('Responsive Integration', () => {
  beforeEach(() => {
    // Mock setTimeout to avoid waiting in tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      // Mock small screen size (mobile)
      mockMatchMedia(true); // Matches small screen media query
    });

    it('applies mobile-specific styles', () => {
      const { container } = render(<App />);
      
      // Fast-forward timer to complete loading
      act(() => {
        vi.advanceTimersByTime(600);
      });
      
      // Check for mobile-specific padding
      expect(container.querySelector('.app-container')).toHaveClass('p-4');
      
      // Check for mobile-specific typography
      expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-2xl');
    });
  });

  describe('Tablet View', () => {
    beforeEach(() => {
      // Mock medium screen size (tablet)
      mockMatchMedia(query => query.includes('sm')); // Matches sm breakpoint
    });

    it('applies tablet-specific styles', () => {
      const { container } = render(<App />);
      
      // Fast-forward timer to complete loading
      act(() => {
        vi.advanceTimersByTime(600);
      });
      
      // Check for tablet-specific padding
      expect(container.querySelector('.app-container')).toHaveClass('sm:p-6');
    });
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      // Mock large screen size (desktop)
      mockMatchMedia(query => query.includes('md')); // Matches md breakpoint
    });

    it('applies desktop-specific styles', () => {
      const { container } = render(<App />);
      
      // Fast-forward timer to complete loading
      act(() => {
        vi.advanceTimersByTime(600);
      });
      
      // Check for desktop-specific padding
      expect(container.querySelector('.app-container')).toHaveClass('md:p-8');
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive container classes', () => {
      const { container } = render(<App />);
      
      // Fast-forward timer to complete loading
      act(() => {
        vi.advanceTimersByTime(600);
      });
      
      // Check for responsive container classes
      expect(container.querySelector('.app-container')).toHaveClass('min-h-screen', 'bg-gray-50');
      expect(screen.getByRole('main')).toHaveClass('max-w-5xl', 'mx-auto');
    });
  });
});