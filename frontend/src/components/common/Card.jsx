import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-brand-border shadow-soft p-6 ${
        hoverEffect
          ? 'hover:shadow-soft-md hover:border-brand-borderDark transition-all duration-200'
          : 'transition-shadow duration-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
