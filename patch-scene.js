const fs = require('fs');
let code = fs.readFileSync('js/elevator-scene.js', 'utf8');

code = code.replace(/function disposeScene\(\) \{[\s\S]*?function initRenderer/m, 
`function disposeScene() {
    if (scene) {
      scene.traverse(function(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(function(m) { m.dispose(); });
          } else {
            obj.material.dispose();
          }
        }
      });
      scene.clear();
    }
    cables = [];
    indicators = [];
  }

  function initRenderer`);

// Remove renderer.dispose() and loseContext from disposeScene.

// Now modify buildScene. We should only initRenderer if it doesn't exist.
code = code.replace(/if \(!initRenderer\(\)\) return;/m, 
`if (!renderer) {
      if (!initRenderer()) return;
    } else {
      // Just update size/dpr if renderer exists
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dpr));
      var winW = pin.clientWidth || window.innerWidth;
      var winH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      renderer.setSize(winW, winH, false);
    }`);

// Also we should only recreate scene and camera if they don't exist.
code = code.replace(/scene = new THREE\.Scene\(\);[\s\S]*?camera = new THREE\.PerspectiveCamera.*?;/m, 
`if (!scene) {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0e1013);
      scene.fog = new THREE.Fog(0x0e1013, 14, 56);
    }
    
    var winW = pin.clientWidth || window.innerWidth;
    var winH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    if (!camera) {
      camera = new THREE.PerspectiveCamera(config.fov, winW / winH, 0.1, 150);
    } else {
      camera.fov = config.fov;
      camera.aspect = winW / winH;
      camera.updateProjectionMatrix();
    }`);

fs.writeFileSync('js/elevator-scene.js', code);
console.log("Scene patched!");
