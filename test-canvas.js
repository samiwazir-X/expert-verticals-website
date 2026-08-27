const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('js/elevator-scene.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;

// Mock THREE.js
window.THREE = require('three');

// Mock visualViewport
window.visualViewport = { height: 1000 };

// Mock IntersectionObserver & ResizeObserver
window.IntersectionObserver = class { observe(){} unobserve(){} };
window.ResizeObserver = class { observe(){} unobserve(){} };
window.matchMedia = () => ({ matches: false, addListener: () => {} });

// Execute the script
try {
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = js;
  window.document.body.appendChild(scriptEl);
  
  setTimeout(() => {
    console.log("Executed successfully. No fatal errors.");
    process.exit(0);
  }, 1000);
} catch (e) {
  console.error("Error executing script:", e);
  process.exit(1);
}
