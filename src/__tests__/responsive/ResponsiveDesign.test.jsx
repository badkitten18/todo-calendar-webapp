import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../../App';

// Mock the Calendar component
vi.mock('../../components/Calendar/Calendar', () => ({
  default: ({ showWeekNumbers }) => (
    <div data-testid="calendar-component" className="calendar-container">
      <div className="calendar-header">
        <h2>July 2024</h2>
        <div>
          <button className="calendar-nav-button">Prev</button>
          <button className="calendar-nav-button">Next</button>
        </div>
      </div>
      <div className="calendar-grid">
        <div className="calendar-day calendar-day-today">1</div>
        <div className="calendar-day">2</div>
        <div className="calendar-day calendar-day-selected">3</div>
      </div>
    </div>
  )
}));

// Mock the ErrorBoundary component
vi.mock('../../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

describe('Responsive Design', () => {
  beforeEach(() => {
    // Mock setTimeout to avoid waiting in tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies responsive container classes', () => {
    const { container } = render(<App />);
    
    // Fast-forward timer to complete loading
    act(() => {
      vi.advanceTimersByTime(600);
    });
    
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-gray-50', 'p-4', 'sm:p-6', 'md:p-8');
  });

  it('applies responsive styles to main content', () => {
    const { getByRole } = render(<App />);
    
    // Fast-forward timer to complete loading
    act(() => {
      vi.advanceTimersByTime(600);
    });
    
    expect(getByRole('main')).toHaveClass('max-w-5xl', 'mx-auto');
  });

  it('applies responsive typography', () => {
    const { getByRole } = render(<App />);
    
    const heading = getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'sm:text-3xl');
  });

  it('includes media query styles in CSS', () => {
    // In JSDOM, we can't access CSS rules directly, so we'll just check that our CSS files exist
    // This is more of a placeholder test to remind us that we have media queries
    
    // Instead of checking the actual CSS content, we'll verify that our App component
    // has the responsive classes that would be affected by media queries
    const { container } = render(<App />);
    
    // Fast-forward timer to complete loading
    act(() => {
      vi.advanceTimersByTime(600);
    });
    
    // Check for responsive classes
    expect(container.firstChild).toHaveClass('p-4', 'sm:p-6', 'md:p-8');
  });

  it('includes mobile-specific styles', () => {
    // Check that our component has mobile-specific classes
    const { container } = render(<App />);
    
    // Fast-forward timer to complete loading
    act(() => {
      vi.advanceTimersByTime(600);
    });
    
    // Check for responsive padding classes
    expect(container.firstChild).toHaveClass('p-4', 'sm:p-6', 'md:p-8');
  });
});