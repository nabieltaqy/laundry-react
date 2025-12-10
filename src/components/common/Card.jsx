import React from 'react';

export const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-sub">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
