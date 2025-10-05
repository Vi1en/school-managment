/**
 * VISIBLE TEXT FIX - Simple and direct fix for invisible typed text
 * This ensures that when you type in input fields, the text is always visible
 */

console.log('🔍 VISIBLE TEXT FIX: Starting...');

// Simple function to make input text visible
const makeTextVisible = () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  console.log(`🔍 Found ${inputs.length} input elements to make visible`);
  
  inputs.forEach((input, index) => {
    // Simple, direct fix - black text on white background
    input.style.color = '#000000';
    input.style.backgroundColor = '#ffffff';
    input.style.webkitTextFillColor = '#000000';
    input.style.caretColor = '#000000';
    input.style.opacity = '1';
    input.style.visibility = 'visible';
    input.style.textShadow = 'none';
    
    // Force with !important
    input.style.setProperty('color', '#000000', 'important');
    input.style.setProperty('background-color', '#ffffff', 'important');
    input.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
    input.style.setProperty('caret-color', '#000000', 'important');
    input.style.setProperty('opacity', '1', 'important');
    input.style.setProperty('visibility', 'visible', 'important');
    input.style.setProperty('text-shadow', 'none', 'important');
    
    // Add event listeners to maintain visibility when typing
    const keepTextVisible = (e) => {
      e.target.style.color = '#000000';
      e.target.style.backgroundColor = '#ffffff';
      e.target.style.webkitTextFillColor = '#000000';
      e.target.style.caretColor = '#000000';
      e.target.style.opacity = '1';
      e.target.style.visibility = 'visible';
      e.target.style.textShadow = 'none';
    };
    
    // Remove existing listeners
    input.removeEventListener('input', keepTextVisible);
    input.removeEventListener('keyup', keepTextVisible);
    input.removeEventListener('keydown', keepTextVisible);
    input.removeEventListener('focus', keepTextVisible);
    input.removeEventListener('blur', keepTextVisible);
    
    // Add new listeners
    input.addEventListener('input', keepTextVisible);
    input.addEventListener('keyup', keepTextVisible);
    input.addEventListener('keydown', keepTextVisible);
    input.addEventListener('focus', keepTextVisible);
    input.addEventListener('blur', keepTextVisible);
    
    if (index < 3) {
      console.log(`🔍 Made text visible for input ${index + 1}:`, input.id || input.name || input.type || 'element');
    }
  });
  
  console.log(`🔍 Made text visible for ${inputs.length} input elements`);
};

// Run immediately
if (typeof window !== 'undefined') {
  makeTextVisible();
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makeTextVisible);
  } else {
    makeTextVisible();
  }
  
  // Run every 200ms to catch new inputs
  setInterval(makeTextVisible, 200);
  
  // Also run when new elements are added
  const observer = new MutationObserver(() => {
    makeTextVisible();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export { makeTextVisible };
