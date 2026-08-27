const fs = require('fs');
let code = fs.readFileSync('css/main.css', 'utf8');

// Replace the buggy block
const oldBlock = `/* RESPONSIVE QA FIXES - ENSURE NO HORIZONTAL OVERFLOW & SAFE ZONES */
html, body {
  max-width: 100%;
  overflow-x: hidden;
}`;

const newBlock = `/* RESPONSIVE QA FIXES - ENSURE NO HORIZONTAL OVERFLOW & SAFE ZONES */
html, body {
  max-width: 100%;
}`;

code = code.replace(oldBlock, newBlock);

// Replace mobile #heroPin
const oldPinBlock = `  #heroPin {
    height: 100vh;
    height: 100dvh;
    position: relative;
    /* Prevent content from overlapping the elevator model (upper 55%) */
  }`;

const newPinBlock = `  #heroPin {
    height: 100vh;
    height: 100dvh;
    /* Prevent content from overlapping the elevator model (upper 55%) */
  }`;

code = code.replace(oldPinBlock, newPinBlock);

fs.writeFileSync('css/main.css', code);
console.log("CSS Patched safely.");
