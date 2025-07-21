import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../../App';

// Mock the Calendar component
vi.mock('../../components/Calendar/Calendar', () => ({
  default: ({ showWeekNumbers, onDateSelect, className }) => (
    <div data-testid="calendar-component" className={className || ''}>
      <h2>Calendar Component</h2>
      <div>Week Numbers: {showWeekNumbers ? 'yes' : 'no'}</div>
      <button onClick={() => onDateSelect && onDateSelect(new Date('2024-01-15'))}>
        Select Date
      </button>
    </div>
  )
}));

// Mock the ErrorBoundary component
vi.mock('../../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallback }) => (
    <div data-testid="error-boundary">
      {children}
    </div>
  )
}));

describe('App Integration', () => {
  beforeEach(() => {
    // Mock setTimeout to avoid waiting in tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('App Initialization', () => {
    it('renders loading state initially and then shows calendar', async () => {
      const { rerender } = render(<App />);
      
      // Initially shows loading spinner
      expect(screen.getByRole('main').querySelector('.animate-spin')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-component')).not.toBeInTheDocument();
      
      // Fast-forward timer to complete loading
      act(() => {
        vi.advanceTimersByTime(600);
      });
      
      // Force a re-render to apply the state change
      rerender(<App />);
      
      // Now calendar should be visible
      expect(screen.getByTestId('calendar-component')).toBeInTheDocument();
      expect(screen.queryByRole('main').querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    
    it('wraps calendar in error boundary for error handling', () => {
      const { rerender } = render(<App />);
      
      // Fast-forward timer to complete loading
      act(() => {
        vi.advanceTimersByTime(600);
      });
      
      // Force a re-render to apply the state change
      rerender(<App />);
      
      // Calendar should be wrapped in error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-component')).toBeInTheDocument();
    });
  });
  
  describe('App Layout', () => {
    it('renders header with title and description', () => {
      render(<App />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Todo Calendar');
      expect(screen.getByText('Manage your tasks with a simple calendar interface')).toBeInTheDocument();
    });
    
    it('renders footer with current year', () => {
      render(<App />);
      
      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(`© ${currentYear} Todo Calendar App`))).toBeInTheDocument();
    });
    
    it('applies responsive styling to container', () => {
      const { container } = render(<App />);
      
      expect(container.querySelector('.app-container')).toHaveClass('min-h-screen', 'bg-gray-50', 'p-4', 'sm:p-6', 'md:p-8');
      expect(screen.getByRole('main')).toHaveClass('max-w-5xl', 'mx-auto');
    });
  });
  
  describe('Error Handling', () => {
    it('provides error context to entire application', () => {
      // Since ErrorProvider doesn't have a testid, we'll just verify the app renders
      // without throwing an error about missing ErrorProvider context
      expect(() => render(<App />)).not.toThrow();
      
      // Verify the app renders successfully
      expect(screen.getByText('Todo Calendar')).toBeInTheDocument();
    });
  });
});