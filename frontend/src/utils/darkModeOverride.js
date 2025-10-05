// frontend/src/utils/darkModeOverride.js
/**
 * DARK MODE OVERRIDE FIX
 * This script specifically targets and overrides the dark mode rule that sets
 * body color to white (#fff) and background to dark (#0a0a0a)
 */

console.log('🌙 DARK MODE OVERRIDE: Starting...');

const overrideDarkModeRule = () => {
  // Method 1: Inject CSS to override the specific dark mode rule
  const style = document.createElement('style');
  style.id = 'dark-mode-override-fix';
  style.textContent = `
    /* NUCLEAR OVERRIDE: Target the exact dark mode rule */
    @media (prefers-color-scheme: dark) {
      body {
        color: #000000 !important;
        background-color: #ffffff !important;
      }
      
      /* Force all elements to have black text */
      * {
        color: #000000 !important;
      }
      
      /* Specifically target inputs */
      input, textarea, select {
        color: #000000 !important;
        background-color: #ffffff !important;
        -webkit-text-fill-color: #000000 !important;
        caret-color: #000000 !important;
      }
    }
    
    /* Ultra specific override for html body */
    html body {
      color: #000000 !important;
      background-color: #ffffff !important;
    }
  `;
  
  // Remove existing override if any
  const existingStyle = document.getElementById('dark-mode-override-fix');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Inject the CSS
  document.head.appendChild(style);
  console.log('🌙 DARK MODE OVERRIDE: CSS injected');
  
  // Method 2: Directly override body styles
  document.body.style.setProperty('color', '#000000', 'important');
  document.body.style.setProperty('background-color', '#ffffff', 'important');
  console.log('🌙 DARK MODE OVERRIDE: Body styles overridden');
  
  // Method 3: Override all input elements
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    input.style.setProperty('color', '#000000', 'important');
    input.style.setProperty('background-color', '#ffffff', 'important');
    input.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
    input.style.setProperty('caret-color', '#000000', 'important');
  });
  console.log(`🌙 DARK MODE OVERRIDE: Fixed ${inputs.length} input elements`);
};

// Method 4: Monitor for dynamically added elements
const setupDarkModeMonitoring = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        // Re-apply the fix when new elements are added
        setTimeout(overrideDarkModeRule, 10);
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Re-apply fix periodically
  setInterval(overrideDarkModeRule, 100);
};

// Auto-apply when module is imported
if (typeof window !== 'undefined') {
  // Apply immediately
  overrideDarkModeRule();
  
  // Apply when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      overrideDarkModeRule();
      setupDarkModeMonitoring();
    });
  } else {
    setupDarkModeMonitoring();
  }
}

export default overrideDarkModeRule;
