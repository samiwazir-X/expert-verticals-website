const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

// Replace visualViewport logic with a robust fallback
code = code.replace(/window\.visualViewport \? window\.visualViewport\.height : window\.innerHeight/g, 
"((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800");

fs.writeFileSync('js/elevator-scene.js', code);
console.log("Patched visualViewport");
