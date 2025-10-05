/**
 * EMERGENCY TEXT FIX - The most aggressive fix possible
 * This will remove ALL CSS and force everything to be visible
 */

console.log('🚨 EMERGENCY TEXT FIX: Starting...');

// Emergency function to force ALL text visible
const emergencyTextFix = () => {
  // Get ALL elements on the page
  const allElements = document.querySelectorAll('*');
  console.log(`🚨 Found ${allElements.length} elements to fix`);
  
  allElements.forEach((element, index) => {
    // EMERGENCY METHOD 1: Remove ALL classes and styles
    element.removeAttribute('class');
    element.removeAttribute('style');
    
    // EMERGENCY METHOD 2: Force visible styles
    element.style.cssText = `
      color: #000000 !important;
      background-color: #ffffff !important;
      -webkit-text-fill-color: #000000 !important;
      caret-color: #000000 !important;
      opacity: 1 !important;
      visibility: visible !important;
      text-shadow: none !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
      font-family: Arial, sans-serif !important;
      font-weight: normal !important;
      border: 1px solid #000000 !important;
      padding: 5px !important;
      margin: 2px !important;
      display: block !important;
      outline: none !important;
      box-shadow: none !important;
    `;
    
    // EMERGENCY METHOD 3: Force with setProperty
    element.style.setProperty('color', '#000000', 'important');
    element.style.setProperty('background-color', '#ffffff', 'important');
    element.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
    element.style.setProperty('opacity', '1', 'important');
    element.style.setProperty('visibility', 'visible', 'important');
    element.style.setProperty('text-shadow', 'none', 'important');
    
    // EMERGENCY METHOD 4: Direct style assignment
    element.style.color = '#000000';
    element.style.backgroundColor = '#ffffff';
    element.style.webkitTextFillColor = '#000000';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.textShadow = 'none';
    
    if (index < 5) {
      console.log(`🚨 EMERGENCY FIX applied to element ${index + 1}:`, element.tagName);
    }
  });
  
  console.log(`🚨 EMERGENCY FIX applied to ${allElements.length} elements`);
};

// Remove ALL existing CSS
const removeAllCSS = () => {
  // Remove all stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
  stylesheets.forEach(stylesheet => {
    if (stylesheet.id !== 'emergency-text-fix') {
      stylesheet.remove();
    }
  });
  
  console.log('🚨 Removed all existing CSS');
};

// Inject emergency CSS
const injectEmergencyCSS = () => {
  const style = document.createElement('style');
  style.id = 'emergency-text-fix';
  style.textContent = `
    /* EMERGENCY CSS - OVERRIDES EVERYTHING */
    * {
      color: #000000 !important;
      background-color: #ffffff !important;
      -webkit-text-fill-color: #000000 !important;
      caret-color: #000000 !important;
      opacity: 1 !important;
      visibility: visible !important;
      text-shadow: none !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
      font-family: Arial, sans-serif !important;
      font-weight: normal !important;
      border: 1px solid #000000 !important;
      padding: 5px !important;
      margin: 2px !important;
      display: block !important;
      outline: none !important;
      box-shadow: none !important;
    }
    
    input, textarea, select {
      color: #000000 !important;
      background-color: #ffffff !important;
      -webkit-text-fill-color: #000000 !important;
      caret-color: #000000 !important;
      opacity: 1 !important;
      visibility: visible !important;
      text-shadow: none !important;
      font-size: 16px !important;
      border: 2px solid #000000 !important;
      padding: 10px !important;
      width: 100% !important;
      display: block !important;
      outline: none !important;
      box-shadow: none !important;
    }
    
    input:focus, textarea:focus, select:focus {
      color: #000000 !important;
      background-color: #ffffff !important;
      -webkit-text-fill-color: #000000 !important;
      caret-color: #000000 !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    input::placeholder, textarea::placeholder {
      color: #666666 !important;
      opacity: 1 !important;
    }
  `;
  
  // Remove existing emergency CSS
  const existingStyle = document.getElementById('emergency-text-fix');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Inject the CSS
  document.head.appendChild(style);
  console.log('🚨 EMERGENCY CSS injected');
};

// Run immediately
if (typeof window !== 'undefined') {
  // Remove all CSS first
  removeAllCSS();
  
  // Inject emergency CSS
  injectEmergencyCSS();
  
  // Apply emergency fix
  emergencyTextFix();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      removeAllCSS();
      injectEmergencyCSS();
      emergencyTextFix();
    });
  } else {
    removeAllCSS();
    injectEmergencyCSS();
    emergencyTextFix();
  }
  
  // Run every 25ms for maximum coverage
  setInterval(() => {
    emergencyTextFix();
  }, 25);
  
  // Also run on any DOM mutation
  const observer = new MutationObserver(() => {
    emergencyTextFix();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export { emergencyTextFix, removeAllCSS, injectEmergencyCSS };
