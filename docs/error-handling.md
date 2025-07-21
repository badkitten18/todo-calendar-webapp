# Error Handling Guide

## Overview

This document outlines the error handling strategy for the Todo Calendar application. Proper error handling is crucial for providing a good user experience and making the application robust and maintainable.

## Error Handling Layers

### 1. Component Level Error Handling

- **ErrorBoundary**: Catches JavaScript errors in the component tree and displays a fallback UI
- **Form Validation**: Validates user input and provides immediate feedback
- **Component-specific error states**: Components handle their own error states when appropriate

### 2. Application Level Error Handling

- **ErrorContext**: Provides global error state management and notifications
- **Error Utilities**: Standardized error handling utilities and custom error classes

### 3. Data Layer Error Handling

- **API Error Handling**: Standardized handling of API responses and errors
- **Storage Error Handling**: Graceful handling of localStorage errors

## Error Types

### Custom Error Classes

```javascript
// ApiError for API-related errors
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ValidationError for form validation errors
class ValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

// StorageError for localStorage errors
class StorageError extends Error {
  constructor(message, operation) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
  }
}
```

## Error Handling Components

### ErrorBoundary

The `ErrorBoundary` component catches JavaScript errors in the component tree and displays a fallback UI.

```jsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

### FormError

The `FormError` component displays form validation errors in a consistent way.

```jsx
<FormError error={validationError} />
```

### ErrorNotification

The `ErrorNotification` component displays global error notifications.

```jsx
<ErrorNotification 
  error={error} 
  onDismiss={clearError} 
  duration={5000} 
  position="top-right"
/>
```

## Error Context

The `ErrorContext` provides global error state management and notifications.

```jsx
// Wrap your application with ErrorProvider
<ErrorProvider>
  <App />
</ErrorProvider>

// Use the error context in components
const { error, setError, clearError, handleError } = useError();

// Handle errors
try {
  // Do something that might throw
} catch (error) {
  handleError(error, 'ComponentName');
}
```

## Form Validation

Form validation is handled using the `validateFormData` utility.

```javascript
// Define validation rules
const validationRules = {
  title: {
    required: true,
    requiredMessage: 'Title is required',
    maxLength: 100,
    maxLengthMessage: 'Title must be 100 characters or less'
  },
  description: {
    maxLength: 500,
    maxLengthMessage: 'Description must be 500 characters or less'
  }
};

// Validate form data
const result = validateFormData(formData, validationRules);

if (!result.isValid) {
  // Handle validation errors
  setErrors(result.errors);
  return;
}
```

## API Error Handling

API errors are handled using the `handleApiResponse` utility.

```javascript
try {
  const response = await fetch('/api/todos');
  const data = await handleApiResponse(response);
  // Process data
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
    console.error(`API Error (${error.status}): ${error.message}`);
  } else {
    // Handle other errors
    console.error('Error:', error);
  }
}
```

## Storage Error Handling

Storage errors are handled using the `handleStorageOperation` utility.

```javascript
try {
  const result = handleStorageOperation(() => {
    return localStorage.getItem('todos');
  }, 'getItem:todos');
  // Process result
} catch (error) {
  if (error instanceof StorageError) {
    // Handle storage error
    console.error(`Storage Error (${error.operation}): ${error.message}`);
  } else {
    // Handle other errors
    console.error('Error:', error);
  }
}
```

## Best Practices

1. **Be specific**: Use specific error messages that help users understand what went wrong
2. **Provide guidance**: Include information on how to resolve the error when possible
3. **Log errors**: Log errors for debugging purposes
4. **Graceful degradation**: Ensure the application continues to function even when errors occur
5. **Error recovery**: Provide ways for users to recover from errors
6. **Consistent error handling**: Use consistent error handling patterns throughout the application
7. **Avoid exposing sensitive information**: Don't include sensitive information in error messages

## Error Handling Flow

1. **Try-Catch Blocks**: Use try-catch blocks to catch errors at the source
2. **Error Propagation**: Propagate errors up the component tree when appropriate
3. **Error Logging**: Log errors for debugging purposes
4. **User Feedback**: Provide feedback to users about errors
5. **Error Recovery**: Provide ways for users to recover from errors

## Testing Error Handling

Test error handling by simulating errors and verifying that they are handled correctly.

```javascript
// Test error handling in a component
it('handles errors gracefully', async () => {
  // Mock a function to throw an error
  mockFunction.mockImplementation(() => {
    throw new Error('Test error');
  });

  render(<MyComponent />);

  // Verify that the error is handled correctly
  expect(screen.getByText('An error occurred')).toBeInTheDocument();
});
```