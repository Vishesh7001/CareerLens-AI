import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-brand-primary/20 border-t-brand-primary animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm font-medium text-brand-muted animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

