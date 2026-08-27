const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

// Remove IntersectionObserver
code = code.replace(/if \('IntersectionObserver' in window\) \{[\s\S]*?io\.observe\(track\);\n  \}/, '');
// Remove document.hidden listener
code = code.replace(/document\.addEventListener\('visibilitychange'[\s\S]*?\n  \}\);/, '');

// Remove early returns
code = code.replace(/if \(!scene \|\| !camera \|\| !renderer \|\| isHidden \|\| !isIntersecting\) return;/, 'if (!scene || !camera || !renderer) return;');

// Remove from scroll
code = code.replace(/if \(!isHidden && isIntersecting\) updateScrollProgress\(\);/, 'updateScrollProgress();');

fs.writeFileSync('js/elevator-scene.js', code);
console.log("Patched!");
