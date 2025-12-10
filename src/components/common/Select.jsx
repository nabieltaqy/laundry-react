import React from 'react';

export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
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
      <select
        value={value}
        onChange={onChange}
        className={`select ${error ? 'input--error' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <p style={{color:'var(--danger)',marginTop:8,fontSize:13}}>{error}</p>}
    </div>
  );
};

export default Select;
