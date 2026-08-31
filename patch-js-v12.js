const fs = require('fs');
let js = fs.readFileSync('js/elevator-scene.js', 'utf8');

// Update TOTAL_FRAMES
js = js.replace(/var TOTAL_FRAMES = \d+;/, 'var TOTAL_FRAMES = 240;');

// Update img.src generation
// Old: img.src = 'assets/sequence/frame_' + i + '.webp';
// New: img.src = 'assets/sequence/frame-' + String(i + 1).padStart(4, '0') + '.webp';
js = js.replace(/img\.src = 'assets\/sequence\/frame_' \+ i \+ '\.webp';/, "img.src = 'assets/sequence/frame-' + String(i + 1).padStart(4, '0') + '.webp';");

fs.writeFileSync('js/elevator-scene.js', js);
console.log('js/elevator-scene.js patched for 240 frames');
