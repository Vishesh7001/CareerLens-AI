import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-heading font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-brand-primary hover:bg-brand-primaryHover text-white shadow-soft-xs hover:shadow-soft focus:ring-brand-primary/30',
    secondary:
      'bg-brand-forestLight hover:bg-brand-sageLight text-brand-primary border border-brand-sageBorder/60 shadow-soft-xs focus:ring-brand-primary/20',
    outline:
      'border border-brand-border bg-white text-brand-charcoal hover:bg-brand-bg hover:border-brand-borderDark shadow-soft-xs focus:ring-brand-border',
    ghost:
      'text-brand-slate hover:bg-brand-bg hover:text-brand-charcoal focus:ring-brand-border',
    danger:
      'bg-brand-danger hover:bg-red-700 text-white shadow-soft-xs focus:ring-brand-danger/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
