const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

// Completely remove the IntersectionObserver block
code = code.replace(/if \('IntersectionObserver' in window\) \{[\s\S]*?io\.observe\(track\);\n  \}/, '');

// Completely remove document.hidden listener
code = code.replace(/document\.addEventListener\('visibilitychange'[\s\S]*?\n  \}\);/, '');

// Modify frame() early return to just check scene/camera/renderer
code = code.replace(/if \(!scene \|\| !camera \|\| !renderer \|\| isHidden \|\| !isIntersecting\) return;/, 
'if (!scene || !camera || !renderer) return;');

// Remove isIntersecting and isHidden variables from the top
code = code.replace(/var isIntersecting = true;\n  var isHidden = document\.hidden;\n/, '');

// Modify scroll event listener
code = code.replace(/if \(!isHidden && isIntersecting\) updateScrollProgress\(\);/, 'updateScrollProgress();');

fs.writeFileSync('js/elevator-scene.js', code);
console.log("Removed IntersectionObserver!");
