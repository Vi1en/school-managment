// NUCLEAR INPUT VISIBILITY FIX
// This script runs immediately to fix invisible input text

console.log('🚨 NUCLEAR INPUT FIX: Starting...');

// Function to force input visibility with maximum aggression
const forceInputVisibility = () => {
  // Find all inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  console.log(`Found ${inputs.length} input elements`);
  
  inputs.forEach((input, index) => {
    // Force visibility with setProperty for maximum specificity
    input.style.setProperty('color', '#000000', 'important');
    input.style.setProperty('background-color', '#ffffff', 'important');
    input.style.setProperty('border-color', '#d1d5db', 'important');
    input.style.setProperty('opacity', '1', 'important');
    input.style.setProperty('visibility', 'visible', 'important');
    input.style.setProperty('font-size', '16px', 'important');
    input.style.setProperty('line-height', '1.5', 'important');
    input.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
    input.style.setProperty('-webkit-opacity', '1', 'important');
    input.style.setProperty('text-shadow', 'none', 'important');
    
    // Override any CSS variables
    input.style.setProperty('--tw-text-opacity', '1', 'important');
    input.style.setProperty('--tw-bg-opacity', '1', 'important');
    input.style.setProperty('--tw-border-opacity', '1', 'important');
    
    // Force set attributes
    input.setAttribute('style', input.getAttribute('style') + '; color: #000000 !important; background-color: #ffffff !important; -webkit-text-fill-color: #000000 !important;');
    
    // Add event listeners to maintain visibility
    const maintainVisibility = (e) => {
      e.target.style.setProperty('color', '#000000', 'important');
      e.target.style.setProperty('background-color', '#ffffff', 'important');
      e.target.style.setProperty('opacity', '1', 'important');
      e.target.style.setProperty('visibility', 'visible', 'important');
      e.target.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
      e.target.style.setProperty('-webkit-opacity', '1', 'important');
    };
    
    input.addEventListener('focus', maintainVisibility);
    input.addEventListener('blur', maintainVisibility);
    input.addEventListener('input', maintainVisibility);
    input.addEventListener('change', maintainVisibility);
    input.addEventListener('keyup', maintainVisibility);
    input.addEventListener('keydown', maintainVisibility);
    
    if (index < 5) {
      console.log(`Fixed input ${index + 1}:`, input.type || input.tagName, input.name || input.id);
    }
  });
  
  console.log(`✅ Applied nuclear fix to ${inputs.length} input elements`);
};

// Run immediately
forceInputVisibility();

// Run again after DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', forceInputVisibility);
} else {
  forceInputVisibility();
}

// Run every 2 seconds to catch any missed inputs
setInterval(forceInputVisibility, 2000);

// Run when new inputs are added to the page
const observer = new MutationObserver((mutations) => {
  let hasNewInputs = false;
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' || 
            node.querySelector('input, textarea, select')) {
          hasNewInputs = true;
        }
      }
    });
  });
  
  if (hasNewInputs) {
    console.log('🔄 New inputs detected, applying emergency fix...');
    setTimeout(forceInputVisibility, 100);
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('✅ EMERGENCY INPUT FIX: Complete');
