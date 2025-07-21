import React, { useState, useEffect } from 'react';

/**
 * ErrorNotification component for displaying global error notifications
 * @param {object} props - Component props
 * @param {string|Error} props.error - Error message or Error object
 * @param {function} props.onDismiss - Function to call when notification is dismissed
 * @param {number} props.duration - Duration in milliseconds before auto-dismissing (0 for no auto-dismiss)
 * @param {string} props.position - Position of the notification ('top', 'bottom', 'top-right', 'top-left', 'bottom-right', 'bottom-left')
 */
const ErrorNotification = ({
  error,
  onDismiss,
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!error || duration === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [error, duration, onDismiss]);

  // Handle manual dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300); // Wait for fade-out animation
  };

  if (!error) return null;

  // Get error message
  const errorMessage = error instanceof Error ? error.message : error;

  // Position styles
  const positionStyles = {
    'top': 'top-0 left-1/2 transform -translate-x-1/2 mt-4',
    'bottom': 'bottom-0 left-1/2 transform -translate-x-1/2 mb-4',
    'top-right': 'top-0 right-0 mt-4 mr-4',
    'top-left': 'top-0 left-0 mt-4 ml-4',
    'bottom-right': 'bottom-0 right-0 mb-4 mr-4',
    'bottom-left': 'bottom-0 left-0 mb-4 ml-4'
  };

  return (
    <div 
      className={`fixed z-50 ${positionStyles[position]} transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-red-50 border-l-4 border-red-500 p-4 shadow-md rounded-md max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg 
              className="h-5 w-5 text-red-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              {errorMessage}
            </p>
            {error instanceof Error && error.stack && process.env.NODE_ENV !== 'production' && (
              <details className="mt-1 text-xs text-red-700">
                <summary>Error details</summary>
                <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
              </details>
            )}
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDismiss}
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <svg 
                  className="h-5 w-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;