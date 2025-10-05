/**
 * ULTIMATE INPUT FIX - Overrides everything including inline styles
 * This is the most aggressive fix possible
 */

console.log('🚨 ULTIMATE INPUT FIX: Starting...');

// Function to force input visibility with maximum aggression
const ultimateInputFix = () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  console.log(`🚨 Found ${inputs.length} input elements to fix`);
  
  inputs.forEach((input, index) => {
    // ULTIMATE FORCE - Override everything including inline styles
    const ultimateStyles = {
      // Text Visibility - ULTIMATE FORCE
      color: '#2563eb',
      WebkitTextFillColor: '#2563eb',
      textShadow: 'none',
      opacity: '1',
      visibility: 'visible',
      WebkitOpacity: '1',
      
      // Background and Contrast - ULTIMATE FORCE
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
      
      // Caret/Cursor Visibility - ULTIMATE FORCE
      caretColor: '#2563eb',
      WebkitCaretColor: '#2563eb'
    };
    
    // Method 1: setProperty with !important
    Object.entries(ultimateStyles).forEach(([property, value]) => {
      input.style.setProperty(property, value, 'important');
    });
    
    // Method 2: Direct style override
    input.style.color = '#2563eb';
    input.style.backgroundColor = '#ffffff';
    input.style.webkitTextFillColor = '#2563eb';
    input.style.caretColor = '#2563eb';
    input.style.opacity = '1';
    input.style.visibility = 'visible';
    input.style.textShadow = 'none';
    
    // Method 3: Attribute override - ULTIMATE FORCE
    const currentStyle = input.getAttribute('style') || '';
    const ultimateStyle = 'color: #2563eb !important; background-color: #ffffff !important; -webkit-text-fill-color: #2563eb !important; opacity: 1 !important; visibility: visible !important; caret-color: #2563eb !important; text-shadow: none !important;';
    input.setAttribute('style', ultimateStyle + '; ' + currentStyle);
    
    // Method 4: Force override any conflicting attributes
    input.removeAttribute('data-color');
    input.removeAttribute('data-bg-color');
    input.setAttribute('data-ultimate-fix', 'true');
    input.setAttribute('data-text-color', '#2563eb');
    input.setAttribute('data-bg-color', '#ffffff');
    
    // Method 5: Event listeners to maintain visibility
    const maintainUltimateVisibility = (e) => {
      e.target.style.setProperty('color', '#2563eb', 'important');
      e.target.style.setProperty('background-color', '#ffffff', 'important');
      e.target.style.setProperty('-webkit-text-fill-color', '#2563eb', 'important');
      e.target.style.setProperty('opacity', '1', 'important');
      e.target.style.setProperty('visibility', 'visible', 'important');
      e.target.style.setProperty('caret-color', '#2563eb', 'important');
      e.target.style.setProperty('text-shadow', 'none', 'important');
      
      // Force direct override
      e.target.style.color = '#2563eb';
      e.target.style.backgroundColor = '#ffffff';
      e.target.style.webkitTextFillColor = '#2563eb';
      e.target.style.caretColor = '#2563eb';
    };
    
    // Remove existing listeners to avoid duplicates
    input.removeEventListener('input', maintainUltimateVisibility);
    input.removeEventListener('keyup', maintainUltimateVisibility);
    input.removeEventListener('keydown', maintainUltimateVisibility);
    input.removeEventListener('paste', maintainUltimateVisibility);
    input.removeEventListener('focus', maintainUltimateVisibility);
    input.removeEventListener('blur', maintainUltimateVisibility);
    input.removeEventListener('change', maintainUltimateVisibility);
    
    // Add new listeners
    input.addEventListener('input', maintainUltimateVisibility);
    input.addEventListener('keyup', maintainUltimateVisibility);
    input.addEventListener('keydown', maintainUltimateVisibility);
    input.addEventListener('paste', maintainUltimateVisibility);
    input.addEventListener('focus', maintainUltimateVisibility);
    input.addEventListener('blur', maintainUltimateVisibility);
    input.addEventListener('change', maintainUltimateVisibility);
    
    if (index < 5) {
      console.log(`🚨 ULTIMATE FIX applied to input ${index + 1}:`, input.id || input.name || input.type || 'element');
    }
  });
  
  console.log(`🚨 ULTIMATE FIX applied to ${inputs.length} input elements`);
};

// Inject ULTIMATE CSS that overrides everything
const injectUltimateCSS = () => {
  const style = document.createElement('style');
  style.id = 'ultimate-input-fix';
  style.textContent = `
    /* ULTIMATE CSS INJECTION - OVERRIDES EVERYTHING INCLUDING INLINE STYLES */
    html body div#root div div div div input,
    html body div#root div div div div textarea,
    html body div#root div div div div select,
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
    html body div div div input,
    html body div div div textarea,
    html body div div div select,
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
    
    /* Override any inline styles */
    input[style*="color"], textarea[style*="color"], select[style*="color"] {
      color: #2563eb !important;
      -webkit-text-fill-color: #2563eb !important;
    }
    
    input[style*="background"], textarea[style*="background"], select[style*="background"] {
      background-color: #ffffff !important;
      background: #ffffff !important;
    }
  `;
  
  // Remove existing ultimate CSS if any
  const existingStyle = document.getElementById('ultimate-input-fix');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Inject the CSS
  document.head.appendChild(style);
  console.log('🚨 ULTIMATE CSS injected');
};

// Run immediately
if (typeof window !== 'undefined') {
  injectUltimateCSS();
  ultimateInputFix();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectUltimateCSS();
      ultimateInputFix();
    });
  } else {
    injectUltimateCSS();
    ultimateInputFix();
  }
  
  // Run every 100ms for maximum coverage
  setInterval(() => {
    ultimateInputFix();
  }, 100);
  
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
      console.log('🚨 New inputs detected, applying ULTIMATE fix...');
      setTimeout(ultimateInputFix, 50);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export { ultimateInputFix, injectUltimateCSS };
