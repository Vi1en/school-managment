// Input Visibility Fix
// This script ensures all input fields are visible by forcing proper CSS styles

export const fixInputVisibility = () => {
  console.log('🔧 Applying input visibility fix...');
  
  // Function to fix input visibility
  const fixInputs = () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    console.log(`🔍 Found ${inputs.length} input elements to fix`);
    
    inputs.forEach((input, index) => {
      // Force visibility styles with multiple approaches
      input.style.setProperty('color', '#000000', 'important');
      input.style.setProperty('background-color', '#ffffff', 'important');
      input.style.setProperty('border', '1px solid #d1d5db', 'important');
      input.style.setProperty('opacity', '1', 'important');
      input.style.setProperty('visibility', 'visible', 'important');
      
      // Also set CSS custom properties
      input.style.setProperty('--text-color', '#000000', 'important');
      input.style.setProperty('--bg-color', '#ffffff', 'important');
      
      // Force focus styles
      input.addEventListener('focus', () => {
        input.style.setProperty('color', '#000000', 'important');
        input.style.setProperty('background-color', '#ffffff', 'important');
      });
      
      // Log if we're fixing any inputs
      if (index < 5) { // Only log first 5 to avoid spam
        console.log(`✅ Fixed input ${index + 1}:`, input.type || input.tagName, input.name || input.id || 'unnamed');
        console.log('   Applied styles:', {
          color: input.style.color,
          backgroundColor: input.style.backgroundColor,
          border: input.style.border
        });
      }
    });
    
    console.log(`✅ Applied visibility fix to ${inputs.length} input elements`);
  };

  // Inject global CSS to force input visibility
  const injectGlobalCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Force input visibility - Global Override */
      input, textarea, select {
        color: #000000 !important;
        background-color: #ffffff !important;
        border: 1px solid #d1d5db !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      input[type="text"], input[type="number"], input[type="email"], 
      input[type="password"], input[type="tel"], input[type="date"], 
      input[type="file"], textarea, select {
        color: #000000 !important;
        background-color: #ffffff !important;
        border: 1px solid #d1d5db !important;
      }
      
      input:focus, textarea:focus, select:focus {
        color: #000000 !important;
        background-color: #ffffff !important;
        border-color: #3b82f6 !important;
      }
      
      input::placeholder, textarea::placeholder {
        color: #6b7280 !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    console.log('🎨 Injected global CSS for input visibility');
  };

  // Inject CSS first
  injectGlobalCSS();

  // Fix inputs immediately
  fixInputs();

  // Fix inputs after DOM changes (for dynamically added inputs)
  const observer = new MutationObserver((mutations) => {
    let shouldFix = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' || 
                node.querySelector('input, textarea, select')) {
              shouldFix = true;
            }
          }
        });
      }
    });
    
    if (shouldFix) {
      console.log('New inputs detected, applying fix...');
      setTimeout(fixInputs, 100); // Small delay to ensure DOM is ready
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also fix on focus events (in case styles are overridden)
  document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      e.target.style.setProperty('color', '#000000', 'important');
      e.target.style.setProperty('background-color', '#ffffff', 'important');
      console.log('🔧 Fixed focused input:', e.target.type || e.target.tagName);
    }
  });

  // Apply fix every 2 seconds to catch any missed inputs
  setInterval(() => {
    const inputs = document.querySelectorAll('input, textarea, select');
    let fixedCount = 0;
    inputs.forEach((input) => {
      if (input.style.color !== 'rgb(0, 0, 0)' && input.style.color !== '#000000') {
        input.style.setProperty('color', '#000000', 'important');
        input.style.setProperty('background-color', '#ffffff', 'important');
        fixedCount++;
      }
    });
    if (fixedCount > 0) {
      console.log(`🔧 Fixed ${fixedCount} inputs that lost visibility`);
    }
  }, 2000);

  console.log('✅ Input visibility fix applied successfully');
};

// Auto-apply fix when script loads
if (typeof window !== 'undefined') {
  // Apply immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixInputVisibility);
  } else {
    fixInputVisibility();
  }
}
