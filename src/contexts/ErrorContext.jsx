import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorNotification } from '../components/UI';
import { formatErrorMessage } from '../utils/errorUtils';

// Create context
const ErrorContext = createContext({
  error: null,
  setError: () => {},
  clearError: () => {},
  handleError: () => {}
});

/**
 * Error Provider component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle error
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    // Format error message
    const formattedError = typeof error === 'string' 
      ? error 
      : formatErrorMessage(error);
    
    setError(formattedError);
    
    // Return the error for further handling if needed
    return error;
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError, handleError }}>
      {children}
      <ErrorNotification 
        error={error} 
        onDismiss={clearError} 
        duration={5000} 
        position="top-right"
      />
    </ErrorContext.Provider>
  );
};

/**
 * Custom hook to use the error context
 * @returns {object} Error context
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  
  return context;
};

export default ErrorContext;