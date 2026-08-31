const fs = require('fs');
let js = fs.readFileSync('js/elevator-scene.js', 'utf8');

// Replace the shader setup with a simple MeshBasicMaterial
js = js.replace(/var uniforms = \{[\s\S]*?depthWrite: false\n      \}\);/m, `
    shaderMaterial = new THREE.MeshBasicMaterial({
      map: imgTexture,
      depthWrite: false
    });
`);

// Remove shaderMaterial uniform updates in calculateGeometry
js = js.replace(/if \(shaderMaterial\) \{\n\s*shaderMaterial\.uniforms\.uResolution\.value\.set\(winW, winH\);\n\s*\}/g, "");

// Remove shaderMaterial uniform updates in frame
js = js.replace(/if \(shaderMaterial\) \{\n\s*shaderMaterial\.uniforms\.uProgress\.value = p;\n\s*\}/g, "");

fs.writeFileSync('js/elevator-scene.js', js);
console.log('Shader replaced with MeshBasicMaterial');
