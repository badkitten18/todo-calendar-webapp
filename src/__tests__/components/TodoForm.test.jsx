import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoForm from '../../components/Todo/TodoForm';
import { ErrorProvider } from '../../contexts/ErrorContext';

// Mock the formatFullDate function
vi.mock('../../utils/dateUtils', () => ({
  formatFullDate: vi.fn().mockReturnValue('Monday, January 1, 2024')
}));

// Mock the useError hook
const mockHandleError = vi.fn();
vi.mock('../../contexts/ErrorContext', () => ({
  useError: () => ({
    handleError: mockHandleError
  }),
  ErrorProvider: ({ children }) => <div data-testid="error-provider">{children}</div>
}));

describe('TodoForm', () => {
  const mockDate = new Date(2024, 0, 1); // January 1, 2024
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  const renderComponent = (props = {}) => {
    const result = render(
      <ErrorProvider>
        <TodoForm
          selectedDate={mockDate}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          {...props}
        />
      </ErrorProvider>
    );
    
    // Helper function to get form elements
    const getFormElements = () => ({
      titleInput: screen.getByPlaceholderText('Enter todo title...'),
      descriptionInput: screen.getByPlaceholderText('Enter todo description (optional)...'),
      submitButton: screen.getByRole('button', { name: props.todo ? 'Update Todo' : 'Add Todo' }),
      cancelButton: screen.getByRole('button', { name: 'Cancel' })
    });
    
    return {
      ...result,
      getFormElements
    };
  };
  
  describe('Rendering', () => {
    it('renders the form with correct title for new todo', () => {
      const { getFormElements } = renderComponent();
      const { titleInput, descriptionInput, submitButton, cancelButton } = getFormElements();
      
      expect(screen.getByText('Add New Todo')).toBeInTheDocument();
      expect(screen.getByText('Monday, January 1, 2024')).toBeInTheDocument();
      expect(titleInput).toBeInTheDocument();
      expect(descriptionInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });
    
    it('renders the form with correct title for editing todo', () => {
      const todo = { title: 'Test Todo', description: 'Test Description' };
      const { getFormElements } = renderComponent({ todo });
      const { submitButton } = getFormElements();
      
      expect(screen.getByText('Edit Todo')).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Update Todo');
    });
    
    it('pre-fills form fields when editing a todo', () => {
      const todo = { title: 'Test Todo', description: 'Test Description' };
      const { getFormElements } = renderComponent({ todo });
      const { titleInput, descriptionInput } = getFormElements();
      
      expect(titleInput).toHaveValue('Test Todo');
      expect(descriptionInput).toHaveValue('Test Description');
    });
    
    it('disables form fields when isLoading is true', () => {
      const { getFormElements } = renderComponent({ isLoading: true });
      const { titleInput, descriptionInput, submitButton, cancelButton } = getFormElements();
      
      expect(titleInput).toBeDisabled();
      expect(descriptionInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
  
  describe('Form Validation', () => {
    it('shows error when title is empty and field is blurred', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput } = getFormElements();
      fireEvent.blur(titleInput);
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    
    it('shows error when title is too long', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput } = getFormElements();
      // Since maxLength prevents typing more than 100 chars, we need to set the value directly
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
      fireEvent.blur(titleInput);
      
      expect(screen.getByText('Title must be 100 characters or less')).toBeInTheDocument();
    });
    
    it('shows error when description is too long', async () => {
      const { getFormElements } = renderComponent();
      
      const { descriptionInput } = getFormElements();
      // Since maxLength prevents typing more than 500 chars, we need to set the value directly
      fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(501) } });
      fireEvent.blur(descriptionInput);
      
      expect(screen.getByText('Description must be 500 characters or less')).toBeInTheDocument();
    });
    
    it('clears error when user starts typing after error', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput } = getFormElements();
      fireEvent.blur(titleInput);
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      
      await userEvent.type(titleInput, 'New Title');
      
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
    
    it('disables submit button when title is empty', () => {
      renderComponent();
      
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeDisabled();
    });
    
    it('enables submit button when title is not empty', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput, submitButton } = getFormElements();
      await userEvent.type(titleInput, 'New Todo');
      
      expect(submitButton).not.toBeDisabled();
    });
  });
  
  describe('Form Submission', () => {
    it('calls onSubmit with correct data when form is submitted', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput, descriptionInput, submitButton } = getFormElements();
      
      // Clear any existing values first
      await userEvent.clear(titleInput);
      await userEvent.clear(descriptionInput);
      
      await userEvent.type(titleInput, 'New Todo');
      await userEvent.type(descriptionInput, 'Todo Description');
      
      await userEvent.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'Todo Description',
        date: mockDate
      });
    });
    
    it('trims whitespace from inputs when submitting', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput, descriptionInput, submitButton } = getFormElements();
      
      // Clear any existing values first
      await userEvent.clear(titleInput);
      await userEvent.clear(descriptionInput);
      
      await userEvent.type(titleInput, '  New Todo  ');
      await userEvent.type(descriptionInput, '  Todo Description  ');
      
      await userEvent.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'Todo Description',
        date: mockDate
      });
    });
    
    it('does not submit when validation fails', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput, submitButton } = getFormElements();
      
      // Clear any existing values first
      await userEvent.clear(titleInput);
      
      // Set a value that's too long directly since maxLength prevents typing
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
      
      await userEvent.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Title must be 100 characters or less')).toBeInTheDocument();
    });
    
    it('shows error message when submission fails', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));
      const { getFormElements } = renderComponent();
      
      const { titleInput, submitButton } = getFormElements();
      await userEvent.type(titleInput, 'New Todo');
      
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
      
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), 'TodoForm:submit');
    });
  });
  
  describe('Keyboard Interactions', () => {
    it('submits form when Ctrl+Enter is pressed', async () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput } = getFormElements();
      await userEvent.type(titleInput, 'New Todo');
      
      fireEvent.keyDown(titleInput, { key: 'Enter', ctrlKey: true });
      
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    
    it('cancels form when Escape is pressed', () => {
      const { getFormElements } = renderComponent();
      
      const { titleInput } = getFormElements();
      fireEvent.keyDown(titleInput, { key: 'Escape' });
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
    
    it('calls onCancel when cancel button is clicked', async () => {
      const { getFormElements } = renderComponent();
      
      const { cancelButton } = getFormElements();
      await userEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});