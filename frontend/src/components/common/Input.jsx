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
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {StartIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <StartIcon className="h-5 w-5" aria-hidden="true" />
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
            className={`block w-full rounded-lg border text-sm transition-colors duration-150 py-2.5 ${
              StartIcon ? 'pl-10' : 'pl-3.5'
            } ${EndIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary'
            } ${
              disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white'
            } ${className}`}
            {...props}
          />

          {EndIcon && (
            <button
              type="button"
              onClick={onEndIconClick}
              disabled={disabled}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                onEndIconClick
                  ? 'text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none'
                  : 'text-slate-400 pointer-events-none'
              }`}
              tabIndex={-1}
            >
              <EndIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" id={`${inputId}-error`}>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

