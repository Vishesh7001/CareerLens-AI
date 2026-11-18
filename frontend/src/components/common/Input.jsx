import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      id,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      error,
      helperText,
      disabled = false,
      required = false,
      startIcon: StartIcon,
      endIcon: EndIcon,
      onEndIconClick,
      className = '',
      autoComplete,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-heading font-medium text-brand-charcoal mb-1.5"
          >
            {label}
            {required && <span className="text-brand-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-xl">
          {StartIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
              <StartIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`block w-full rounded-xl border text-sm transition-all duration-150 py-2.5 shadow-soft-xs ${
              StartIcon ? 'pl-10' : 'pl-3.5'
            } ${EndIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-brand-danger/60 text-brand-charcoal bg-red-50/20 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-brand-danger/20 focus:border-brand-danger'
                : 'border-brand-border text-brand-charcoal bg-white placeholder-brand-muted/70 hover:border-brand-borderDark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary'
            } ${
              disabled ? 'bg-brand-bg text-brand-muted cursor-not-allowed border-brand-border/60' : ''
            } ${className}`}
            {...props}
          />

          {EndIcon && (
            <button
              type="button"
              onClick={onEndIconClick}
              disabled={disabled}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
                onEndIconClick
                  ? 'text-brand-muted hover:text-brand-charcoal cursor-pointer focus:outline-none'
                  : 'text-brand-muted pointer-events-none'
              }`}
              tabIndex={-1}
            >
              <EndIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-brand-danger flex items-center gap-1" id={`${inputId}-error`}>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1.5 text-xs text-brand-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
