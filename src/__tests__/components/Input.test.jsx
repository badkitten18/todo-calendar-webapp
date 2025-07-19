import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input, { Textarea } from '../../components/UI/Input';

describe('Input', () => {
  it('should render with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render with label', () => {
    render(<Input label="Test Label" />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render with required indicator', () => {
    render(<Input label="Required Field" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('required');
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text here" />);
    
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('should handle value and onChange', () => {
    const handleChange = vi.fn();
    render(<Input value="test value" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test value');
    
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle onFocus and onBlur', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should render different input types', () => {
    const { rerender, container } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('should render different sizes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-4', 'py-3', 'text-base');
  });

  it('should handle disabled state', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-gray-50');
  });

  it('should render error state', () => {
    render(<Input error="This field is required" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    
    // Should show error icon
    const errorIcon = screen.getByRole('textbox').parentElement.querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
  });

  it('should render helper text', () => {
    render(<Input helperText="This is helper text" />);
    
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should not show helper text when error is present', () => {
    render(<Input error="Error message" helperText="Helper text" />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);
    
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(<Input data-testid="custom-input" maxLength={10} />);
    
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Input 
        label="Accessible Input" 
        error="Error message" 
        helperText="Helper text"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Textarea', () => {
  it('should render textarea', () => {
    render(<Textarea />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should render with label', () => {
    render(<Textarea label="Description" />);
    
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('should handle value and onChange', () => {
    const handleChange = vi.fn();
    render(<Textarea value="textarea content" onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('textarea content');
    
    fireEvent.change(textarea, { target: { value: 'new content' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should render with custom rows', () => {
    render(<Textarea rows={5} />);
    
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('should render error state', () => {
    render(<Textarea error="This field is required" />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-300');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<Textarea disabled />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:bg-gray-50');
  });

  it('should render helper text', () => {
    render(<Textarea helperText="Enter your description here" />);
    
    expect(screen.getByText('Enter your description here')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" />);
    
    expect(screen.getByRole('textbox')).toHaveClass('custom-textarea');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should have resize-vertical class', () => {
    render(<Textarea />);
    
    expect(screen.getByRole('textbox')).toHaveClass('resize-vertical');
  });
});