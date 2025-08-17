import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormValidationProps {
  children: React.ReactNode;
  validationRules: ValidationRules;
  onSubmit: (data: FormData, isValid: boolean) => void;
  className?: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return 'This field is required';
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum ${rule.minLength} characters required`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} characters allowed`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rule.min && parseFloat(value) < rule.min) {
      return `Minimum value is ${rule.min}`;
    }

    if (rule.max && parseFloat(value) > rule.max) {
      return `Maximum value is ${rule.max}`;
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const value = formData.get(fieldName) as string || '';
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  };

  return {
    errors,
    touched,
    validateForm,
    handleFieldChange,
    clearErrors: () => setErrors({}),
    clearTouched: () => setTouched({})
  };
};

const FormValidation: React.FC<FormValidationProps> = ({
  children,
  validationRules,
  onSubmit,
  className = ''
}) => {
  const { errors, validateForm } = useFormValidation(validationRules);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isValid = validateForm(formData);
    onSubmit(formData, isValid);
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {children}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-sm">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-500 font-medium">Please fix the following errors:</span>
          </div>
          <ul className="text-red-400 text-sm space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              error && <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export const FormField: React.FC<{
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  error,
  touched,
  onChange,
  className = ''
}) => {
  const hasError = touched && error;

  return (
    <div className={className}>
      <label className="block text-gray-400 text-sm font-medium mb-2 tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full bg-matte-black border text-white rounded-sm px-4 py-3 focus:outline-none transition-colors duration-300 ${
          hasError 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-gray-700 focus:border-acid-yellow'
        }`}
        required={required}
      />
      {hasError && (
        <div className="flex items-center space-x-2 mt-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormValidation;