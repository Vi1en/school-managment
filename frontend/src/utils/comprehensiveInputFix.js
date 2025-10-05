/**
 * Comprehensive Input Visibility Fix
 * Ensures all input fields have visible text and caret with high contrast
 */

export const applyComprehensiveInputFix = () => {
  console.log('🔧 Applying NUCLEAR input visibility fix...');
  
  const fixInputElement = (element) => {
    if (!element) return;
    
    // NUCLEAR APPROACH - Override everything with maximum force
    const nuclearStyles = {
      // Text Visibility - NUCLEAR FORCE
      color: '#2563eb',
      WebkitTextFillColor: '#2563eb',
      textShadow: 'none',
      opacity: '1',
      visibility: 'visible',
      WebkitOpacity: '1',
      
      // Background and Contrast - NUCLEAR FORCE
      backgroundColor: '#ffffff',
      background: '#ffffff',
      backgroundImage: 'none',
      
      // Border and Styling
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      outline: 'none',
      
      // Typography
      fontSize: '16px',
      lineHeight: '1.5',
      fontFamily: 'inherit',
      fontWeight: 'normal',
      
      // Layout
      display: 'block',
      width: '100%',
      padding: '0.5rem 0.75rem',
      
      // Caret/Cursor Visibility - NUCLEAR FORCE
      caretColor: '#2563eb',
      WebkitCaretColor: '#2563eb'
    };
    
    // Apply styles with !important - NUCLEAR FORCE
    Object.entries(nuclearStyles).forEach(([property, value]) => {
      element.style.setProperty(property, value, 'important');
    });
    
    // NUCLEAR OVERRIDE - Force set directly on style object
    element.style.color = '#2563eb';
    element.style.backgroundColor = '#ffffff';
    element.style.webkitTextFillColor = '#2563eb';
    element.style.caretColor = '#2563eb';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.textShadow = 'none';
    
    // NUCLEAR ATTRIBUTE OVERRIDE
    const currentStyle = element.getAttribute('style') || '';
    const nuclearStyle = 'color: #2563eb !important; background-color: #ffffff !important; -webkit-text-fill-color: #2563eb !important; opacity: 1 !important; visibility: visible !important; caret-color: #2563eb !important;';
    element.setAttribute('style', currentStyle + '; ' + nuclearStyle);
    
    // Add data attributes for tracking
    element.setAttribute('data-force-visible', 'true');
    element.setAttribute('data-text-color', '#2563eb');
    element.setAttribute('data-caret-color', '#2563eb');
    element.setAttribute('data-nuclear-fix', 'true');
    
    console.log('🔧 NUCLEAR FIX applied to:', element.tagName, element.type || '');
  };
  
  const fixAllInputs = () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    console.log(`🔧 Found ${inputs.length} input elements to fix`);
    
    inputs.forEach((input, index) => {
      fixInputElement(input);
      
      // Add event listeners to maintain visibility
      const maintainVisibility = (e) => {
        fixInputElement(e.target);
      };
      
      // Remove existing listeners to avoid duplicates
      input.removeEventListener('input', maintainVisibility);
      input.removeEventListener('keyup', maintainVisibility);
      input.removeEventListener('keydown', maintainVisibility);
      input.addEventListener('paste', maintainVisibility);
      input.addEventListener('focus', maintainVisibility);
      input.addEventListener('blur', maintainVisibility);
      
      // Add new listeners
      input.addEventListener('input', maintainVisibility);
      input.addEventListener('keyup', maintainVisibility);
      input.addEventListener('keydown', maintainVisibility);
      input.addEventListener('paste', maintainVisibility);
      input.addEventListener('focus', maintainVisibility);
      input.addEventListener('blur', maintainVisibility);
      
      if (index < 5) {
        console.log(`🔧 Applied fix to input ${index + 1}:`, input.type || input.tagName);
      }
    });
    
    console.log(`✅ Applied comprehensive fix to ${inputs.length} input elements`);
  };
  
  // Run immediately
  fixAllInputs();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixAllInputs);
  } else {
    fixAllInputs();
  }
  
  // Run every 500ms for maximum coverage
  setInterval(fixAllInputs, 500);
  
  // Also run on any DOM mutation
  const observer = new MutationObserver((mutations) => {
    let hasNewInputs = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' || 
              node.querySelector && node.querySelector('input, textarea, select')) {
            hasNewInputs = true;
          }
        }
      });
    });
    
    if (hasNewInputs) {
      console.log('🔄 New inputs detected, applying comprehensive fix...');
      setTimeout(fixAllInputs, 100);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return {
    fixAllInputs,
    fixInputElement
  };
};

  // Inject CSS that will override everything
  const injectNuclearCSS = () => {
    const style = document.createElement('style');
    style.id = 'nuclear-input-fix';
    style.textContent = `
      /* NUCLEAR CSS INJECTION - HIGHEST POSSIBLE SPECIFICITY */
      html body div#root div div div input,
      html body div#root div div div textarea,
      html body div#root div div div select,
      html body div#root div div input,
      html body div#root div div textarea,
      html body div#root div div select,
      html body div#root div input,
      html body div#root div textarea,
      html body div#root div select,
      html body div#root input,
      html body div#root textarea,
      html body div#root select,
      html body div div input,
      html body div div textarea,
      html body div div select,
      html body div input,
      html body div textarea,
      html body div select,
      html body input,
      html body textarea,
      html body select,
      html input,
      html textarea,
      html select,
      input, textarea, select {
        color: #2563eb !important;
        -webkit-text-fill-color: #2563eb !important;
        text-shadow: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        -webkit-opacity: 1 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        caret-color: #2563eb !important;
        -webkit-caret-color: #2563eb !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        font-family: inherit !important;
        border: 1px solid #d1d5db !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 0.75rem !important;
        width: 100% !important;
        display: block !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Focus states */
      input:focus, textarea:focus, select:focus {
        color: #2563eb !important;
        -webkit-text-fill-color: #2563eb !important;
        background-color: #ffffff !important;
        caret-color: #2563eb !important;
        -webkit-caret-color: #2563eb !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Placeholder text */
      input::placeholder, textarea::placeholder {
        color: #6b7280 !important;
        opacity: 1 !important;
        -webkit-text-fill-color: #6b7280 !important;
      }
    `;
    
    // Remove existing nuclear CSS if any
    const existingStyle = document.getElementById('nuclear-input-fix');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Inject the CSS
    document.head.appendChild(style);
    console.log('🔧 NUCLEAR CSS injected');
  };

  // Auto-apply fix when module is imported
  if (typeof window !== 'undefined') {
    injectNuclearCSS();
    applyComprehensiveInputFix();
  }
