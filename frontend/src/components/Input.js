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
      style={{
        color: '#000000',
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
        '--tw-text-opacity': '1',
        '--tw-bg-opacity': '1'
      }}
      {...props}
    />
  );
};

export default Input;
