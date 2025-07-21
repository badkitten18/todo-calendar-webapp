import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock the Calendar component
vi.mock('../components/Calendar/Calendar', () => ({
  default: ({ showWeekNumbers }) => (
    <div data-testid="calendar-component">
      Calendar Component (Week Numbers: {showWeekNumbers ? 'yes' : 'no'})
    </div>
  )
}));

// Mock the ErrorBoundary component
vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallback }) => (
    <div data-testid="error-boundary">
      {children}
    </div>
  )
}));

describe('App', () => {
  beforeEach(() => {
    // Mock setTimeout to avoid waiting in tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the header with title', () => {
    render(<App />);
    
    expect(screen.getByText('Todo Calendar')).toBeInTheDocument();
    expect(screen.getByText('Manage your tasks with a simple calendar interface')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<App />);
    
    expect(screen.getByRole('main').querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-component')).not.toBeInTheDocument();
  });

  it('renders the Calendar component after loading', async () => {
    const { rerender } = render(<App />);
    
    // Fast-forward timer to complete loading
    act(() => {
      vi.advanceTimersByTime(600);
    });
    
    // Force a re-render to apply the state change
    rerender(<App />);
    
    expect(screen.getByTestId('calendar-component')).toBeInTheDocument();
    expect(screen.getByText('Calendar Component (Week Numbers: yes)')).toBeInTheDocument();
  });

  it('renders the footer with current year', () => {
    render(<App />);
    
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear} Todo Calendar App`))).toBeInTheDocument();
  });

  it('wraps the Calendar component in an ErrorBoundary', () => {
    render(<App />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('applies responsive styling', () => {
    const { container } = render(<App />);
    
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-gray-50', 'p-4', 'sm:p-6', 'md:p-8');
    expect(screen.getByRole('main')).toHaveClass('max-w-5xl', 'mx-auto');
  });
});