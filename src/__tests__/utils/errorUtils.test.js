import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ApiError,
  ValidationError,
  StorageError,
  formatErrorMessage,
  handleApiResponse,
  handleStorageOperation,
  validateFormData,
  logError,
  createSafeFunction
} from '../../utils/errorUtils';

describe('Error Utilities', () => {
  describe('Custom Error Classes', () => {
    it('creates ApiError with correct properties', () => {
      const error = new ApiError('API request failed', 404, { detail: 'Not found' });
      
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('API request failed');
      expect(error.status).toBe(404);
      expect(error.data).toEqual({ detail: 'Not found' });
    });
    
    it('creates ValidationError with correct properties', () => {
      const fieldErrors = { title: 'Title is required' };
      const error = new ValidationError('Validation failed', fieldErrors);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.fieldErrors).toEqual(fieldErrors);
    });
    
    it('creates StorageError with correct properties', () => {
      const error = new StorageError('Storage operation failed', 'setItem');
      
      expect(error.name).toBe('StorageError');
      expect(error.message).toBe('Storage operation failed');
      expect(error.operation).toBe('setItem');
    });
  });
  
  describe('formatErrorMessage', () => {
    it('formats ApiError correctly', () => {
      const error = new ApiError('API request failed', 404);
      const message = formatErrorMessage(error);
      
      expect(message).toBe('API Error (404): API request failed');
    });
    
    it('formats ValidationError correctly', () => {
      const fieldErrors = { title: 'Title is required', date: 'Date is invalid' };
      const error = new ValidationError('Validation failed', fieldErrors);
      const message = formatErrorMessage(error);
      
      expect(message).toBe('Validation Error: Validation failed (title: Title is required, date: Date is invalid)');
    });
    
    it('formats StorageError correctly', () => {
      const error = new StorageError('Storage operation failed', 'setItem');
      const message = formatErrorMessage(error);
      
      expect(message).toBe('Storage Error (setItem): Storage operation failed');
    });
    
    it('formats generic Error correctly', () => {
      const error = new Error('Generic error');
      const message = formatErrorMessage(error);
      
      expect(message).toBe('Generic error');
    });
    
    it('handles error without message', () => {
      const error = new Error();
      const message = formatErrorMessage(error);
      
      expect(message).toBe('An unknown error occurred');
    });
  });
  
  describe('handleApiResponse', () => {
    it('returns JSON data for successful response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      };
      
      const result = await handleApiResponse(mockResponse);
      
      expect(result).toEqual({ data: 'test' });
      expect(mockResponse.json).toHaveBeenCalled();
    });
    
    it('throws ApiError for failed response with JSON error data', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: 'Bad request' })
      };
      
      await expect(handleApiResponse(mockResponse)).rejects.toThrow(ApiError);
      await expect(handleApiResponse(mockResponse)).rejects.toMatchObject({
        message: 'Bad request',
        status: 400
      });
    });
    
    it('throws ApiError for failed response without JSON error data', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      
      await expect(handleApiResponse(mockResponse)).rejects.toThrow(ApiError);
      await expect(handleApiResponse(mockResponse)).rejects.toMatchObject({
        message: 'Request failed with status 500',
        status: 500
      });
    });
  });
  
  describe('handleStorageOperation', () => {
    it('returns operation result when successful', () => {
      const mockOperation = vi.fn().mockReturnValue('success');
      
      const result = handleStorageOperation(mockOperation, 'getItem');
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalled();
    });
    
    it('throws StorageError when operation fails', () => {
      const mockError = new Error('Storage not available');
      const mockOperation = vi.fn().mockImplementation(() => {
        throw mockError;
      });
      
      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => handleStorageOperation(mockOperation, 'setItem')).toThrow(StorageError);
      expect(() => handleStorageOperation(mockOperation, 'setItem')).toThrow('Storage not available');
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('validateFormData', () => {
    it('validates required fields', () => {
      const data = { title: '', description: 'Test' };
      const rules = {
        title: { required: true, requiredMessage: 'Title is required' },
        description: { required: true }
      };
      
      const result = validateFormData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ title: 'Title is required' });
    });
    
    it('validates minLength constraint', () => {
      const data = { title: 'A', description: 'Test' };
      const rules = {
        title: { minLength: 3, minLengthMessage: 'Title must be at least 3 characters' }
      };
      
      const result = validateFormData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ title: 'Title must be at least 3 characters' });
    });
    
    it('validates maxLength constraint', () => {
      const data = { title: 'Very long title', description: 'Test' };
      const rules = {
        title: { maxLength: 10 }
      };
      
      const result = validateFormData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ title: 'Maximum length is 10 characters' });
    });
    
    it('validates pattern constraint', () => {
      const data = { email: 'invalid-email', description: 'Test' };
      const rules = {
        email: { 
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          patternMessage: 'Invalid email format'
        }
      };
      
      const result = validateFormData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ email: 'Invalid email format' });
    });
    
    it('validates custom constraint', () => {
      const data = { password: 'password', confirmPassword: 'different' };
      const rules = {
        confirmPassword: { 
          custom: (value, data) => value === data.password,
          customMessage: 'Passwords must match'
        }
      };
      
      const result = validateFormData(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ confirmPassword: 'Passwords must match' });
    });
    
    it('returns isValid=true when all validations pass', () => {
      const data = { title: 'Valid Title', description: 'Test description' };
      const rules = {
        title: { required: true, minLength: 3, maxLength: 20 },
        description: { required: true }
      };
      
      const result = validateFormData(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });
  
  describe('logError', () => {
    it('logs error with context to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      logError(error, 'TestContext');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in TestContext:', error);
      
      consoleErrorSpy.mockRestore();
    });
    
    it('logs error with default context when not provided', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in application:', error);
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('createSafeFunction', () => {
    it('returns function result when no error occurs', () => {
      const mockFn = vi.fn().mockReturnValue('success');
      const safeFn = createSafeFunction(mockFn, 'default');
      
      const result = safeFn('arg1', 'arg2');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
    
    it('returns default value when error occurs', () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Function failed');
      });
      const safeFn = createSafeFunction(mockFn, 'default');
      
      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = safeFn('arg1', 'arg2');
      
      expect(result).toBe('default');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});