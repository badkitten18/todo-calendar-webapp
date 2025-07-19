import React, { forwardRef } from 'react';

/**
 * Reusable Input component with validation styling
 * @param {object} props - Component props
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {function} props.onBlur - Blur handler
 * @param {function} props.onFocus - Focus handler
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.error - Error message
 * @param {string} props.label - Input label
 * @param {string} props.helperText - Helper text
 * @param {string} props.size - Input size ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 */
const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  label,
  helperText,
  size = 'md',
  className = '',
  ...rest
}, ref) => {
  // Base input styles
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Error styles
  const errorStyles = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : '';

  // Combine all styles
  const inputStyles = `${baseStyles} ${sizeStyles[size]} ${errorStyles} ${className}`;

  const inputId = rest.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          className={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : 
            undefined
          }
          {...rest}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea component with similar styling
 */
export const Textarea = forwardRef(({
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  label,
  helperText,
  rows = 3,
  className = '',
  ...rest
}, ref) => {
  // Base textarea styles
  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-vertical';

  // Error styles
  const errorStyles = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : '';

  // Combine all styles
  const textareaStyles = `${baseStyles} px-3 py-2 text-sm ${errorStyles} ${className}`;

  const textareaId = rest.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          rows={rows}
          className={textareaStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : 
            helperText ? `${textareaId}-helper` : 
            undefined
          }
          {...rest}
        />
      </div>
      
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;