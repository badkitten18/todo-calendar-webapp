/**
 * Error handling utilities
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Custom error class for storage errors
 */
export class StorageError extends Error {
  constructor(message, operation) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
  }
}

/**
 * Format error message for display
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error) {
  if (error instanceof ApiError) {
    return `API Error (${error.status}): ${error.message}`;
  }
  
  if (error instanceof ValidationError) {
    const fieldErrors = Object.entries(error.fieldErrors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
    
    return `Validation Error: ${error.message} (${fieldErrors})`;
  }
  
  if (error instanceof StorageError) {
    return `Storage Error (${error.operation}): ${error.message}`;
  }
  
  return error.message || 'An unknown error occurred';
}

/**
 * Handle API errors
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} Response data or throws ApiError
 */
export async function handleApiResponse(response) {
  if (!response.ok) {
    let errorData = null;
    
    try {
      errorData = await response.json();
    } catch (e) {
      // Ignore JSON parsing errors
    }
    
    throw new ApiError(
      errorData?.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }
  
  return response.json();
}

/**
 * Handle localStorage errors
 * @param {function} operation - Function that performs localStorage operation
 * @param {string} operationName - Name of the operation for error reporting
 * @returns {any} Result of the operation
 */
export function handleStorageOperation(operation, operationName) {
  try {
    return operation();
  } catch (error) {
    console.error(`LocalStorage operation failed: ${operationName}`, error);
    throw new StorageError(
      error.message || 'Storage operation failed',
      operationName
    );
  }
}

/**
 * Validate form data
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} Validation result with isValid and errors
 */
export function validateFormData(data, rules) {
  const errors = {};
  
  Object.entries(rules).forEach(([field, rule]) => {
    if (rule.required && (!data[field] || data[field].trim() === '')) {
      errors[field] = rule.requiredMessage || 'This field is required';
    } else if (rule.minLength && data[field] && data[field].length < rule.minLength) {
      errors[field] = rule.minLengthMessage || `Minimum length is ${rule.minLength} characters`;
    } else if (rule.maxLength && data[field] && data[field].length > rule.maxLength) {
      errors[field] = rule.maxLengthMessage || `Maximum length is ${rule.maxLength} characters`;
    } else if (rule.pattern && data[field] && !rule.pattern.test(data[field])) {
      errors[field] = rule.patternMessage || 'Invalid format';
    } else if (rule.custom && !rule.custom(data[field], data)) {
      errors[field] = rule.customMessage || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Log error to console and optionally to an error tracking service
 * @param {Error} error - The error to log
 * @param {string} context - Context where the error occurred
 */
export function logError(error, context = '') {
  console.error(`Error in ${context || 'application'}:`, error);
  
  // In a real app, you might send this to an error tracking service
  // Example: Sentry.captureException(error);
}

/**
 * Create a safe function that catches errors and returns a default value
 * @param {function} fn - Function to make safe
 * @param {any} defaultValue - Default value to return on error
 * @returns {function} Safe function
 */
export function createSafeFunction(fn, defaultValue = null) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, 'createSafeFunction');
      return defaultValue;
    }
  };
}