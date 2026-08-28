const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

code = code.replace("var HX = 1.5, HZ = 1.45;", "");
code = code.replace("var totalH, FH = 3.2;", "var totalH, FH = 3.2;\n  var HX = 1.5, HZ = 1.45;");

fs.writeFileSync('js/elevator-scene.js', code);
console.log("Patched HZ again");
