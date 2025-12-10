import React from 'react';

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  label = '',
  error = '',
  required = false,
  ...props
}) => {
  return (
    <div className="form-field">
      {label && (
        <label>
          {label}
          {required && <span style={{color: 'var(--danger)', marginLeft:8}}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'input--error' : ''} ${className}`}
        {...props}
      />
      {error && <p style={{color:'var(--danger)',marginTop:8,fontSize:13}}>{error}</p>}
    </div>
  );
};

export default Input;
