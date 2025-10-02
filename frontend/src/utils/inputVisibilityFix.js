// Input Visibility Fix
// This script ensures all input fields are visible by forcing proper CSS styles

export const fixInputVisibility = () => {
  console.log('Applying input visibility fix...');
  
  // Function to fix input visibility
  const fixInputs = () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    console.log(`Found ${inputs.length} input elements to fix`);
    
    inputs.forEach((input, index) => {
      // Force visibility styles
      input.style.color = '#000000';
      input.style.backgroundColor = '#ffffff';
      input.style.border = '1px solid #d1d5db';
      
      // Log if we're fixing any inputs
      if (index < 5) { // Only log first 5 to avoid spam
        console.log(`Fixed input ${index + 1}:`, input.type || input.tagName, input.name || input.id || 'unnamed');
      }
    });
  };

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
      e.target.style.color = '#000000';
      e.target.style.backgroundColor = '#ffffff';
    }
  });

  console.log('Input visibility fix applied successfully');
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
