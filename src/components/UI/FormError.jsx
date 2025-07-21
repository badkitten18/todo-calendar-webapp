import React from 'react';

/**
 * FormError component for displaying form validation errors
 * @param {object} props - Component props
 * @param {string|object} props.error - Error message or error object
 * @param {string} props.className - Additional CSS classes
 */
const FormError = ({ error, className = '' }) => {
  if (!error) return null;

  // Handle different error types
  let errorMessage = '';
  let errorDetails = null;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || 'An error occurred';
    
    // Handle validation errors with field errors
    if (error.name === 'ValidationError' && error.fieldErrors) {
      errorDetails = Object.entries(error.fieldErrors).map(([field, message]) => (
        <li key={field} className="text-sm">
          <strong>{field}:</strong> {message}
        </li>
      ));
    }
  } else if (typeof error === 'object') {
    errorMessage = error.message || 'An error occurred';
    
    // Handle field errors object
    if (error.fieldErrors || error.errors) {
      const fieldErrors = error.fieldErrors || error.errors;
      errorDetails = Object.entries(fieldErrors).map(([field, message]) => (
        <li key={field} className="text-sm">
          <strong>{field}:</strong> {message}
        </li>
      ));
    }
  }

  return (
    <div className={`p-3 bg-red-50 border border-red-200 rounded-md ${className}`} role="alert">
      <div className="flex">
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
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">
            {errorMessage}
          </p>
          {errorDetails && (
            <ul className="mt-1 list-disc list-inside text-red-700 pl-2">
              {errorDetails}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormError;