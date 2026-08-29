const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

// Change mobile cam target Y and lookAt Y to push elevator into upper half of screen
code = code.replace(/var camTargetY = config\.maxW <= 767 \? \(carY \+ 1\.25\) : \(carY \+ 0\.8 - mouseY\);/,
"var camTargetY = config.maxW <= 767 ? (carY - 0.2) : (carY + 0.8 - mouseY);");

code = code.replace(/camera\.lookAt\(config\.x, config\.maxW <= 767 \? \(carY \+ 0\.95\) : \(carY \+ 0\.6\), 0\);/,
"camera.lookAt(config.x, config.maxW <= 767 ? (carY - 0.5) : (carY + 0.6), 0);");

fs.writeFileSync('js/elevator-scene.js', code);
console.log('Successfully patched camera framing for mobile');
