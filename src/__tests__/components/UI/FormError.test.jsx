import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormError from '../../../components/UI/FormError';
import { ValidationError } from '../../../utils/errorUtils';

describe('FormError', () => {
  it('renders nothing when no error is provided', () => {
    const { container } = render(<FormError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders string error message', () => {
    render(<FormError error="This is an error message" />);
    
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
  });

  it('renders Error object with message', () => {
    const error = new Error('Error object message');
    render(<FormError error={error} />);
    
    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });

  it('renders ValidationError with field errors', () => {
    const fieldErrors = {
      title: 'Title is required',
      email: 'Invalid email format'
    };
    const error = new ValidationError('Validation failed', fieldErrors);
    
    render(<FormError error={error} />);
    
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('title:')).toBeInTheDocument();
    expect(screen.getByText(/Title is required/)).toBeInTheDocument();
    expect(screen.getByText('email:')).toBeInTheDocument();
    expect(screen.getByText(/Invalid email format/)).toBeInTheDocument();
  });

  it('renders error object with fieldErrors property', () => {
    const error = {
      message: 'Form has errors',
      fieldErrors: {
        name: 'Name is too short',
        password: 'Password is weak'
      }
    };
    
    render(<FormError error={error} />);
    
    expect(screen.getByText('Form has errors')).toBeInTheDocument();
    expect(screen.getByText('name:')).toBeInTheDocument();
    expect(screen.getByText(/Name is too short/)).toBeInTheDocument();
    expect(screen.getByText('password:')).toBeInTheDocument();
    expect(screen.getByText(/Password is weak/)).toBeInTheDocument();
  });

  it('renders error object with errors property', () => {
    const error = {
      message: 'Form has errors',
      errors: {
        name: 'Name is too short',
        password: 'Password is weak'
      }
    };
    
    render(<FormError error={error} />);
    
    expect(screen.getByText('Form has errors')).toBeInTheDocument();
    expect(screen.getByText('name:')).toBeInTheDocument();
    expect(screen.getByText(/Name is too short/)).toBeInTheDocument();
    expect(screen.getByText('password:')).toBeInTheDocument();
    expect(screen.getByText(/Password is weak/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <FormError 
        error="Error message" 
        className="custom-class"
      />
    );
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveClass('custom-class');
  });
});