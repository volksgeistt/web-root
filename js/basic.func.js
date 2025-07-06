function makeUnselectable(selector) {
  const elements = typeof selector === 'string' 
    ? document.querySelectorAll(selector) 
    : [selector];
  
  elements.forEach(el => {
    el.style.cssText += `
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
    `;
    
    el.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    });
    
    el.addEventListener('mousedown', function(e) {
      if (e.detail > 1) { 
        e.preventDefault();
        return false;
      }
    });
  });
}

function disableRightClick(selector = document) {
  const elements = selector === document 
    ? [document] 
    : typeof selector === 'string' 
      ? document.querySelectorAll(selector) 
      : [selector];
  
  elements.forEach(el => {
    el.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
  });
}

function disableDragDrop(selector = document) {
  const elements = selector === document 
    ? [document] 
    : typeof selector === 'string' 
      ? document.querySelectorAll(selector) 
      : [selector];
  
  elements.forEach(el => {
    el.addEventListener('dragstart', function(e) {
      e.preventDefault();
      return false;
    });
    
    el.addEventListener('drop', function(e) {
      e.preventDefault();
      return false;
    });
    
    el.addEventListener('dragover', function(e) {
      e.preventDefault();
      return false;
    });
  });
}

function disableDevTools() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
     if (e.ctrlKey && e.key === 'a') {
       e.preventDefault();
       return false;
     }
    
     if (e.ctrlKey && e.key === 's') {
       e.preventDefault();
       return false;
     }
  });
}

function protectImages(selector = 'img') {
  const images = document.querySelectorAll(selector);
  images.forEach(img => {
    img.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
    
    img.addEventListener('dragstart', function(e) {
      e.preventDefault();
      return false;
    });
    
    img.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    });
    
    img.style.cssText += `
      -webkit-user-drag: none !important;
      -khtml-user-drag: none !important;
      -moz-user-drag: none !important;
      -o-user-drag: none !important;
      user-drag: none !important;sssss
      pointer-events: auto !important;
    `;
  });
}

function disableCopy() {
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'c') {
      if (!e.target.matches('input, textarea, [contenteditable="true"], .selectable')) {
        e.preventDefault();
        return false;
      }
    }
    
    if (e.ctrlKey && e.key === 'x') {
      if (!e.target.matches('input, textarea, [contenteditable="true"], .selectable')) {
        e.preventDefault();
        return false;
      }
    }
    
     if (e.ctrlKey && e.key === 'v') {
       if (!e.target.matches('input, textarea, [contenteditable="true"], .selectable')) {
         e.preventDefault();
         return false;
       }
     }
  });
}

function disableZoom() {
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
      e.preventDefault();
      return false;
    }
  });
  
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      return false;
    }
  }, { passive: false });
}

function protectConsole() {
  if (typeof console !== 'undefined') {
    console.clear = function() {
      console.log('%c Console access detected!', 'color: red; font-size: 20px; font-weight: bold;');
    };
  }
  
  setTimeout(() => {
    console.log('%c⚠️ STOP!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. Executing code here could compromise your security.', 'color: red; font-size: 16px;');
  }, 1000);
}

function detectDevTools() {
  let devtools = {
    open: false,
    orientation: null
  };
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        document.body.style.filter = 'blur(5px)';
        console.log('%cDeveloper tools detected!', 'color: red; font-size: 20px;');
      }
    } else {
      if (devtools.open) {
        devtools.open = false;
        document.body.style.filter = 'none';
      }
    }
  }, 500);
}


function initBasicProtection() {
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    
    input, textarea, [contenteditable="true"], .selectable {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    
    ::selection {
      background: transparent !important;
    }
    ::-moz-selection {
      background: transparent !important;
    }
  `;
  document.head.appendChild(style);
  
  makeUnselectable('button, .btn, nav, header, .logo, p, h1, h2, h3, h4, h5, h6, div, span');
  
  disableRightClick();
  disableDragDrop();
  disableDevTools();
  protectImages();
  disableCopy();
  disableZoom(); 
  protectConsole();
  detectDevTools(); 
  
  document.addEventListener('selectstart', function(e) {
    if (!e.target.matches('input, textarea, [contenteditable="true"], .selectable')) {
      e.preventDefault();
      return false;
    }
  });
  
  document.addEventListener('mousedown', function(e) {
    if (e.detail > 1 && !e.target.matches('input, textarea, [contenteditable="true"], .selectable')) {
      e.preventDefault();
      return false;
    }
  });
  
  console.log('Basic functions loaded.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBasicProtection);
} else {
  initBasicProtection();
}