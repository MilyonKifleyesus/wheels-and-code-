import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import FormValidation, { FormField, useFormValidation } from './FormValidation';
import { describe, it, expect, vi } from 'vitest';

// Tests for the useFormValidation hook
describe('useFormValidation Hook', () => {
  const rules = {
    name: { required: true, minLength: 3 },
    email: { required: true, pattern: /@/ },
  };

  it('should validate required fields', () => {
    const { result } = renderHook(() => useFormValidation(rules));
    const formData = new FormData();
    formData.append('name', '');
    formData.append('email', 'test@example.com');

    act(() => {
      result.current.validateForm(formData);
    });

    expect(result.current.errors.name).toBe('This field is required');
  });

  it('should validate minLength', () => {
    const { result } = renderHook(() => useFormValidation(rules));
    const formData = new FormData();
    formData.append('name', 'a');
    formData.append('email', 'test@example.com');

    act(() => {
      result.current.validateForm(formData);
    });

    expect(result.current.errors.name).toBe('Minimum 3 characters required');
  });

  it('should validate pattern', () => {
    const { result } = renderHook(() => useFormValidation(rules));
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'test');

    act(() => {
      result.current.validateForm(formData);
    });

    expect(result.current.errors.email).toBe('Invalid format');
  });

  it('should return true for a valid form', () => {
    const { result } = renderHook(() => useFormValidation(rules));
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'test@example.com');

    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData);
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });
});

// Tests for the FormValidation and FormField components
describe('FormValidation Component', () => {
  const validationRules = {
    name: { required: true, minLength: 2 },
  };

  it('should show error messages on invalid input and submit', async () => {
    const handleSubmit = vi.fn();
    render(
      <FormValidation validationRules={validationRules} onSubmit={handleSubmit}>
        <FormField name="name" label="Name" required />
        <button type="submit">Submit</button>
      </FormValidation>
    );

    const input = screen.getByLabelText(/Name/);
    const submitButton = screen.getByText('Submit');

    // Type an invalid value
    fireEvent.change(input, { target: { value: 'a' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check for error message
    const errorMessage = await screen.findByText((content, element) => {
      return element.tagName.toLowerCase() === 'li' && content.includes('Minimum 2 characters required');
    });
    expect(errorMessage).toBeInTheDocument();

    // Check that onSubmit was called with isValid: false
    expect(handleSubmit).toHaveBeenCalledWith(expect.any(FormData), false);
  });

  it('should submit successfully with valid data', async () => {
    const handleSubmit = vi.fn();
    render(
      <FormValidation validationRules={validationRules} onSubmit={handleSubmit}>
        <FormField name="name" label="Name" required />
        <button type="submit">Submit</button>
      </FormValidation>
    );

    const input = screen.getByLabelText(/Name/);
    const submitButton = screen.getByText('Submit');

    // Type a valid value
    fireEvent.change(input, { target: { value: 'John' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check that no error message is shown
    expect(screen.queryByText(/Please fix the following errors/)).not.toBeInTheDocument();

    // Check that onSubmit was called with isValid: true
    expect(handleSubmit).toHaveBeenCalledWith(expect.any(FormData), true);
    const formData = handleSubmit.mock.calls[0][0];
    expect(formData.get('name')).toBe('John');
  });
});
