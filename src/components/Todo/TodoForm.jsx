import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '../UI';
import { formatFullDate } from '../../utils/dateUtils';

/**
 * TodoForm component for adding and editing todos
 * @param {object} props - Component props
 * @param {object} props.todo - Existing todo for editing (null for new todo)
 * @param {Date} props.selectedDate - Date for the todo
 * @param {function} props.onSubmit - Function called on form submission
 * @param {function} props.onCancel - Function called on form cancellation
 * @param {boolean} props.isLoading - Whether form is in loading state
 */
const TodoForm = ({
  todo = null,
  selectedDate,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when todo prop changes
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || ''
      });
    } else {
      setFormData({
        title: '',
        description: ''
      });
    }
    setErrors({});
    setTouched({});
  }, [todo]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    // Description validation (optional but with length limit)
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle input blur (for validation feedback)
  const handleInputBlur = (field) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate specific field on blur
    if (field === 'title' && !formData.title.trim()) {
      setErrors(prev => ({
        ...prev,
        title: 'Title is required'
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      title: true,
      description: true
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: selectedDate
      });
    } catch (error) {
      // Handle submission errors
      setErrors({
        submit: error.message || 'Failed to save todo'
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle key press (Enter to submit, Escape to cancel)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const isEditing = !!todo;
  const formTitle = isEditing ? 'Edit Todo' : 'Add New Todo';
  const submitButtonText = isEditing ? 'Update Todo' : 'Add Todo';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {formTitle}
        </h3>
        {selectedDate && (
          <p className="text-sm text-gray-600">
            {formatFullDate(selectedDate)}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="space-y-4">
        {/* Title Input */}
        <Input
          label="Title"
          type="text"
          placeholder="Enter todo title..."
          value={formData.title}
          onChange={handleInputChange('title')}
          onBlur={handleInputBlur('title')}
          error={touched.title ? errors.title : ''}
          required
          disabled={isLoading}
          className="w-full"
          maxLength={100}
        />

        {/* Description Textarea */}
        <Textarea
          label="Description"
          placeholder="Enter todo description (optional)..."
          value={formData.description}
          onChange={handleInputChange('description')}
          onBlur={handleInputBlur('description')}
          error={touched.description ? errors.description : ''}
          disabled={isLoading}
          rows={3}
          maxLength={500}
          helperText={`${formData.description.length}/500 characters`}
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading || !formData.title.trim()}
          >
            {submitButtonText}
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Press Ctrl+Enter to save, Escape to cancel</p>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;