/**
 * NUCLEAR TEXT FIX - The most aggressive fix possible
 * This will make text visible no matter what
 */

console.log('💥 NUCLEAR TEXT FIX: Starting...');

// Nuclear function to force text visibility
const nuclearTextFix = () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, div');
  console.log(`💥 Found ${inputs.length} input elements and ${textElements.length} text elements to fix`);
  
  inputs.forEach((input, index) => {
    // NUCLEAR METHOD 1: Remove all existing styles
    input.removeAttribute('style');
    input.removeAttribute('class');
    
    // NUCLEAR METHOD 2: Force styles with maximum priority
    const nuclearStyles = {
      color: '#000000',
      backgroundColor: '#ffffff',
      background: '#ffffff',
      webkitTextFillColor: '#000000',
      caretColor: '#000000',
      webkitCaretColor: '#000000',
      opacity: '1',
      visibility: 'visible',
      textShadow: 'none',
      fontSize: '16px',
      lineHeight: '1.5',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      border: '2px solid #000000',
      borderRadius: '4px',
      padding: '10px',
      width: '100%',
      display: 'block',
      outline: 'none',
      boxShadow: 'none'
    };
    
    // Apply all styles
    Object.assign(input.style, nuclearStyles);
    
    // NUCLEAR METHOD 3: Force with setProperty
    Object.entries(nuclearStyles).forEach(([property, value]) => {
      input.style.setProperty(property, value, 'important');
    });
    
    // NUCLEAR METHOD 4: Set attributes
    input.setAttribute('style', `
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
    `);
    
    // NUCLEAR METHOD 5: Force override any CSS
    input.style.cssText = `
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
    `;
    
    // NUCLEAR METHOD 6: Event listeners with maximum force
    const nuclearMaintain = (e) => {
      e.target.style.cssText = `
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
      `;
    };
    
    // Remove all existing listeners
    input.removeEventListener('input', nuclearMaintain);
    input.removeEventListener('keyup', nuclearMaintain);
    input.removeEventListener('keydown', nuclearMaintain);
    input.removeEventListener('focus', nuclearMaintain);
    input.removeEventListener('blur', nuclearMaintain);
    input.removeEventListener('change', nuclearMaintain);
    input.removeEventListener('paste', nuclearMaintain);
    
    // Add nuclear listeners
    input.addEventListener('input', nuclearMaintain);
    input.addEventListener('keyup', nuclearMaintain);
    input.addEventListener('keydown', nuclearMaintain);
    input.addEventListener('focus', nuclearMaintain);
    input.addEventListener('blur', nuclearMaintain);
    input.addEventListener('change', nuclearMaintain);
    input.addEventListener('paste', nuclearMaintain);
    
    if (index < 3) {
      console.log(`💥 NUCLEAR FIX applied to input ${index + 1}:`, input.id || input.name || input.type || 'element');
    }
  });
  
  // Also fix all text elements
  textElements.forEach((element, index) => {
    // Force black text for all text elements
    element.style.color = '#000000';
    element.style.setProperty('color', '#000000', 'important');
    element.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
    element.style.setProperty('text-shadow', 'none', 'important');
    element.style.setProperty('opacity', '1', 'important');
    element.style.setProperty('visibility', 'visible', 'important');
    
    if (index < 3) {
      console.log(`💥 NUCLEAR FIX applied to text element ${index + 1}:`, element.tagName);
    }
  });
  
  console.log(`💥 NUCLEAR FIX applied to ${inputs.length} input elements and ${textElements.length} text elements`);
};

// Inject nuclear CSS
const injectNuclearCSS = () => {
  const style = document.createElement('style');
  style.id = 'nuclear-text-fix';
  style.textContent = `
    /* NUCLEAR CSS - OVERRIDES EVERYTHING */
    /* Force all text elements to be black */
    h1, h2, h3, h4, h5, h6, p, span, label, div {
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
      text-shadow: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    /* Force all input elements to be black */
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
  
  // Remove existing nuclear CSS
  const existingStyle = document.getElementById('nuclear-text-fix');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Inject the CSS
  document.head.appendChild(style);
  console.log('💥 NUCLEAR CSS injected');
};

// Run immediately
if (typeof window !== 'undefined') {
  injectNuclearCSS();
  nuclearTextFix();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectNuclearCSS();
      nuclearTextFix();
    });
  } else {
    injectNuclearCSS();
    nuclearTextFix();
  }
  
  // Run every 50ms for maximum coverage
  setInterval(() => {
    nuclearTextFix();
  }, 50);
  
  // Also run on any DOM mutation
  const observer = new MutationObserver(() => {
    nuclearTextFix();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export { nuclearTextFix, injectNuclearCSS };
