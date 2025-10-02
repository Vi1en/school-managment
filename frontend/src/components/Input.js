import React from 'react';

const Input = ({ 
  type = 'text', 
  name, 
  id, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  className = '', 
  ...props 
}) => {
  // Force visibility with inline styles that override everything
  const forceVisibleStyles = {
    color: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    opacity: 1,
    visibility: 'visible',
    fontSize: '16px',
    lineHeight: '1.5',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    width: '100%',
    display: 'block',
    border: '1px solid #d1d5db',
    outline: 'none',
    boxShadow: 'none',
  };

  const baseClasses = `
    w-full px-3 py-2 
    border border-gray-300 
    rounded-md 
    shadow-sm 
    text-black 
    bg-white 
    placeholder-gray-500
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500 
    focus:border-blue-500
    transition-colors
    duration-200
  `.replace(/\s+/g, ' ').trim();

  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={combinedClasses}
      style={forceVisibleStyles}
      onFocus={(e) => {
        // Ensure text stays visible on focus
        e.target.style.color = '#000000';
        e.target.style.backgroundColor = '#ffffff';
        e.target.style.opacity = '1';
        e.target.style.visibility = 'visible';
      }}
      onBlur={(e) => {
        // Ensure text stays visible on blur
        e.target.style.color = '#000000';
        e.target.style.backgroundColor = '#ffffff';
        e.target.style.opacity = '1';
        e.target.style.visibility = 'visible';
      }}
      {...props}
    />
  );
};

export default Input;
