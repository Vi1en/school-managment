import React, { useEffect, useRef } from 'react';

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
  const inputRef = useRef(null);

  // NUCLEAR FIX - Force black text on white background
  const applyNuclearFix = (element) => {
    if (element) {
      element.style.cssText = `
        color: #000000 !important;
        background-color: #ffffff !important;
        border: 1px solid #d1d5db !important;
        border-radius: 0.375rem !important;
        box-shadow: none !important;
        display: block !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        opacity: 1 !important;
        outline: none !important;
        padding: 0.5rem 0.75rem !important;
        text-shadow: none !important;
        visibility: visible !important;
        width: 100% !important;
        -webkit-text-fill-color: #000000 !important;
        -webkit-opacity: 1 !important;
        font-family: inherit !important;
      `;
      
      // Add data attributes for tracking
      element.setAttribute('data-force-visible', 'true');
      element.setAttribute('data-text-color', '#000000');
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      applyNuclearFix(inputRef.current);
    }
  }, []);

  const handleFocus = (e) => {
    applyNuclearFix(e.target);
  };

  const handleBlur = (e) => {
    applyNuclearFix(e.target);
  };

  const handleInput = (e) => {
    applyNuclearFix(e.target);
  };

  const handleChange = (e) => {
    applyNuclearFix(e.target);
    if (onChange) onChange(e);
  };

  return (
    <input
      ref={inputRef}
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={className}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      {...props}
    />
  );
};

export default Input;
