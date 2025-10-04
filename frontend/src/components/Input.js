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

  // ULTRA AGGRESSIVE FIX - Force black text on white background
  const applyNuclearFix = (element) => {
    if (element) {
      // Force styles with maximum priority and multiple methods
      element.style.setProperty('color', '#000000', 'important');
      element.style.setProperty('background-color', '#ffffff', 'important');
      element.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('text-shadow', 'none', 'important');
      
      // Force override any inherited styles
      element.style.color = '#000000';
      element.style.backgroundColor = '#ffffff';
      element.style.webkitTextFillColor = '#000000';
      
      // Set attributes to force override
      element.setAttribute('style', element.getAttribute('style') + '; color: #000000 !important; background-color: #ffffff !important; -webkit-text-fill-color: #000000 !important;');
      
      // Add data attributes for tracking
      element.setAttribute('data-force-visible', 'true');
      element.setAttribute('data-text-color', '#000000');
      
      console.log('🔧 Input: Applied nuclear fix to', element.name || element.id || 'input');
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
    console.log('🔧 Input: handleChange called', { name: e.target.name, value: e.target.value, type: e.target.type });
    applyNuclearFix(e.target);
    if (onChange) {
      console.log('🔧 Input: Calling parent onChange');
      onChange(e);
    } else {
      console.log('🔧 Input: No parent onChange provided');
    }
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
