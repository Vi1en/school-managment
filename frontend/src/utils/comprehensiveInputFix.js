/**
 * Comprehensive Input Visibility Fix
 * Ensures all input fields have visible text and caret with high contrast
 */

export const applyComprehensiveInputFix = () => {
  console.log('🔧 Applying comprehensive input visibility fix...');
  
  const fixInputElement = (element) => {
    if (!element) return;
    
    // Force styles with maximum priority
    const styles = {
      // Text Visibility
      color: '#000000',
      WebkitTextFillColor: '#000000',
      textShadow: 'none',
      opacity: '1',
      visibility: 'visible',
      WebkitOpacity: '1',
      
      // Background and Contrast
      backgroundColor: '#ffffff',
      background: '#ffffff',
      
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
      
      // Caret/Cursor Visibility
      caretColor: '#000000',
      WebkitCaretColor: '#000000'
    };
    
    // Apply styles with !important
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value, 'important');
    });
    
    // Force override any inherited styles
    element.style.color = '#000000';
    element.style.backgroundColor = '#ffffff';
    element.style.webkitTextFillColor = '#000000';
    element.style.caretColor = '#000000';
    
    // Add data attributes for tracking
    element.setAttribute('data-force-visible', 'true');
    element.setAttribute('data-text-color', '#000000');
    element.setAttribute('data-caret-color', '#000000');
    
    console.log('🔧 Fixed input element:', element.tagName, element.type || '');
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

// Auto-apply fix when module is imported
if (typeof window !== 'undefined') {
  applyComprehensiveInputFix();
}
