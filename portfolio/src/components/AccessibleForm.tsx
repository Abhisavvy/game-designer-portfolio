/**
 * Accessible form components with proper labeling, error handling, and ARIA attributes
 */
import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { createAccessibleField } from '@/utils/accessibility';

interface BaseFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

// Input Field
interface AccessibleInputProps 
  extends BaseFieldProps, 
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required' | 'className'> {}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, description, error, required, className = '', ...inputProps }, ref) => {
    const fieldProps = createAccessibleField(label, description, error, required);

    return (
      <div className={`space-y-2 ${className}`}>
        <label 
          htmlFor={fieldProps.id} 
          id={fieldProps.labelId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        {description && (
          <p 
            id={fieldProps.descriptionId} 
            className="text-sm text-gray-600 flex items-start gap-1"
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            {description}
          </p>
        )}
        
        <input
          {...inputProps}
          ref={ref}
          id={fieldProps.id}
          aria-describedby={fieldProps['aria-describedby']}
          aria-invalid={fieldProps['aria-invalid']}
          aria-required={fieldProps['aria-required']}
          className={`
            w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200 hover:border-gray-400'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        
        {error && (
          <div 
            id={fieldProps.errorId}
            className="flex items-start gap-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Textarea Field
interface AccessibleTextareaProps 
  extends BaseFieldProps, 
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required' | 'className'> {}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, description, error, required, className = '', ...textareaProps }, ref) => {
    const fieldProps = createAccessibleField(label, description, error, required);

    return (
      <div className={`space-y-2 ${className}`}>
        <label 
          htmlFor={fieldProps.id} 
          id={fieldProps.labelId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        {description && (
          <p 
            id={fieldProps.descriptionId} 
            className="text-sm text-gray-600 flex items-start gap-1"
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            {description}
          </p>
        )}
        
        <textarea
          {...textareaProps}
          ref={ref}
          id={fieldProps.id}
          aria-describedby={fieldProps['aria-describedby']}
          aria-invalid={fieldProps['aria-invalid']}
          aria-required={fieldProps['aria-required']}
          className={`
            w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all resize-vertical
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200 hover:border-gray-400'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        
        {error && (
          <div 
            id={fieldProps.errorId}
            className="flex items-start gap-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Select Field
interface AccessibleSelectProps 
  extends BaseFieldProps, 
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required' | 'className'> {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, description, error, required, options, placeholder, className = '', ...selectProps }, ref) => {
    const fieldProps = createAccessibleField(label, description, error, required);

    return (
      <div className={`space-y-2 ${className}`}>
        <label 
          htmlFor={fieldProps.id} 
          id={fieldProps.labelId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        {description && (
          <p 
            id={fieldProps.descriptionId} 
            className="text-sm text-gray-600 flex items-start gap-1"
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            {description}
          </p>
        )}
        
        <select
          {...selectProps}
          ref={ref}
          id={fieldProps.id}
          aria-describedby={fieldProps['aria-describedby']}
          aria-invalid={fieldProps['aria-invalid']}
          aria-required={fieldProps['aria-required']}
          className={`
            w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200 hover:border-gray-400'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <div 
            id={fieldProps.errorId}
            className="flex items-start gap-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// Form Section with proper heading hierarchy
interface FormSectionProps {
  title: string;
  description?: string;
  level?: 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, level = 2, children, className = '' }: FormSectionProps) {
  const renderHeading = () => {
    const headingClass = "text-xl font-semibold text-gray-900";
    switch (level) {
      case 2: return <h2 className={headingClass}>{title}</h2>;
      case 3: return <h3 className={headingClass}>{title}</h3>;
      case 4: return <h4 className={headingClass}>{title}</h4>;
      case 5: return <h5 className={headingClass}>{title}</h5>;
      case 6: return <h6 className={headingClass}>{title}</h6>;
      default: return <h2 className={headingClass}>{title}</h2>;
    }
  };
  
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        {renderHeading()}
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

// Accessible Button with loading state
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export function AccessibleButton({ 
  children, 
  loading = false, 
  loadingText = 'Loading...', 
  variant = 'primary',
  icon,
  disabled,
  className = '',
  ...buttonProps 
}: AccessibleButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variantClasses = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      {...buttonProps}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading && (
        <div 
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" 
          aria-hidden="true"
        />
      )}
      {!loading && icon && <span aria-hidden="true">{icon}</span>}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}