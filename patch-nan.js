const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

code = code.replace(/currentScrollProgress \+= \(targetScrollProgress - currentScrollProgress\) \* \(config\.maxW <= 767 \? 0\.18 : 0\.12\);/,
"currentScrollProgress += (targetScrollProgress - currentScrollProgress) * (config.maxW <= 767 ? 0.18 : 0.12);\n    if (isNaN(currentScrollProgress)) currentScrollProgress = 0;");

fs.writeFileSync('js/elevator-scene.js', code);
console.log("Patched NaN");
