import React, { useEffect, useRef } from 'react';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  onFocus, 
  onBlur,
  ...props 
}) => {
  const inputRef = useRef(null);

  // ULTRA AGGRESSIVE FIX - Force black text on white background
  const applyNuclearFix = (element) => {
    if (element) {
      // Force styles with maximum priority
      element.style.setProperty('color', '#000000', 'important');
      element.style.setProperty('background-color', '#ffffff', 'important');
      element.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('text-shadow', 'none', 'important');
      element.style.setProperty('font-size', '16px', 'important');
      element.style.setProperty('line-height', '1.5', 'important');
      element.style.setProperty('padding', '0.75rem 1rem', 'important');
      element.style.setProperty('border', '1px solid #d4d4d4', 'important');
      element.style.setProperty('border-radius', '0.5rem', 'important');
      element.style.setProperty('width', '100%', 'important');
      element.style.setProperty('display', 'block', 'important');
      element.style.setProperty('outline', 'none', 'important');
      element.style.setProperty('box-shadow', 'none', 'important');
      element.style.setProperty('font-family', 'inherit', 'important');
      
      // Force override any inherited styles
      element.style.color = '#000000';
      element.style.backgroundColor = '#ffffff';
      element.style.webkitTextFillColor = '#000000';
      
      // Add data attributes for tracking
      element.setAttribute('data-force-visible', 'true');
      element.setAttribute('data-text-color', '#000000');
      
      console.log('🔧 SearchInput: Applied nuclear fix');
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      applyNuclearFix(inputRef.current);
      
      // Add event listeners to maintain visibility
      const input = inputRef.current;
      const maintainVisibility = (e) => {
        applyNuclearFix(e.target);
      };
      
      input.addEventListener('input', maintainVisibility);
      input.addEventListener('keyup', maintainVisibility);
      input.addEventListener('keydown', maintainVisibility);
      input.addEventListener('paste', maintainVisibility);
      input.addEventListener('focus', maintainVisibility);
      input.addEventListener('blur', maintainVisibility);
      
      // Cleanup function
      return () => {
        input.removeEventListener('input', maintainVisibility);
        input.removeEventListener('keyup', maintainVisibility);
        input.removeEventListener('keydown', maintainVisibility);
        input.removeEventListener('paste', maintainVisibility);
        input.removeEventListener('focus', maintainVisibility);
        input.removeEventListener('blur', maintainVisibility);
      };
    }
  }, []);

  const handleFocus = (e) => {
    applyNuclearFix(e.target);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    applyNuclearFix(e.target);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    applyNuclearFix(e.target);
    if (onChange) onChange(e);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`search-input ${className}`}
      style={{
        color: '#000000',
        backgroundColor: '#ffffff',
        WebkitTextFillColor: '#000000',
        opacity: 1,
        visibility: 'visible',
        textShadow: 'none'
      }}
      {...props}
    />
  );
};

export default SearchInput;
