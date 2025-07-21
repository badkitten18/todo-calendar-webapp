import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorNotification from '../../../components/UI/ErrorNotification';

describe('ErrorNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when no error is provided', () => {
    const { container } = render(<ErrorNotification error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders string error message', () => {
    render(<ErrorNotification error="This is an error notification" />);
    
    expect(screen.getByText('This is an error notification')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders Error object with message', () => {
    const error = new Error('Error object message');
    render(<ErrorNotification error={error} />);
    
    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Error with stack');
    error.stack = 'Error: Error with stack\n    at Component\n    at App';
    
    render(<ErrorNotification error={error} />);
    
    expect(screen.getByText('Error details')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('auto-dismisses after duration', async () => {
    const onDismiss = vi.fn();
    render(
      <ErrorNotification 
        error="Auto-dismiss error" 
        onDismiss={onDismiss} 
        duration={2000} 
      />
    );
    
    expect(screen.getByText('Auto-dismiss error')).toBeInTheDocument();
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Wait for fade-out animation
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorNotification 
        error="No auto-dismiss" 
        onDismiss={onDismiss} 
        duration={0} 
      />
    );
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses when close button is clicked', () => {
    const onDismiss = vi.fn();
    
    render(
      <ErrorNotification 
        error="Dismissible error" 
        onDismiss={onDismiss} 
        duration={0} 
      />
    );
    
    // Click dismiss button
    const dismissButton = screen.getByLabelText('Dismiss');
    act(() => {
      dismissButton.click();
    });
    
    // Wait for fade-out animation
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(onDismiss).toHaveBeenCalled();
  });

  it('applies position styles correctly', () => {
    const positions = ['top', 'bottom', 'top-right', 'top-left', 'bottom-right', 'bottom-left'];
    
    positions.forEach(position => {
      const { unmount } = render(
        <ErrorNotification 
          error="Positioned error" 
          position={position} 
        />
      );
      
      const notification = screen.getByRole('alert');
      
      if (position === 'top') {
        expect(notification).toHaveClass('top-0');
        expect(notification).toHaveClass('left-1/2');
      } else if (position === 'bottom') {
        expect(notification).toHaveClass('bottom-0');
        expect(notification).toHaveClass('left-1/2');
      } else if (position === 'top-right') {
        expect(notification).toHaveClass('top-0');
        expect(notification).toHaveClass('right-0');
      } else if (position === 'top-left') {
        expect(notification).toHaveClass('top-0');
        expect(notification).toHaveClass('left-0');
      } else if (position === 'bottom-right') {
        expect(notification).toHaveClass('bottom-0');
        expect(notification).toHaveClass('right-0');
      } else if (position === 'bottom-left') {
        expect(notification).toHaveClass('bottom-0');
        expect(notification).toHaveClass('left-0');
      }
      
      unmount();
    });
  });
});