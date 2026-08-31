const fs = require('fs');

const code = `(function() {
  var track = document.getElementById('heroTrack');
  var pin = document.getElementById('heroPin');
  var canvas = document.getElementById('heroGL');
  if (!track || !pin || !canvas) return;

  var SCENE_CONFIG = {
    mobileSmall: { maxW: 480, dpr: 1.0 },
    mobileLarge: { maxW: 767, dpr: 1.25 },
    tablet: { maxW: 1024, dpr: 1.5 },
    desktop: { maxW: Infinity, dpr: 2.0 }
  };

  function getBreakpoint(w) {
    if (w <= 480) return 'mobileSmall';
    if (w <= 767) return 'mobileLarge';
    if (w <= 1024) return 'tablet';
    return 'desktop';
  }

  function smoothstep(min, max, value) {
    var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  var scenes = [
    document.querySelector('.s1'),
    document.querySelector('.s2'),
    document.querySelector('.s3'),
    document.querySelector('.s4'),
    document.querySelector('.s5')
  ];

  var sceneRanges = [
    [-0.01, 0.18],
    [0.18, 0.40],
    [0.40, 0.62],
    [0.62, 0.82],
    [0.82, 1.01]
  ];

  var reel = document.getElementById('floorReel');
  var ldDir = document.getElementById('ldDir');

  var currentBp = null;
  var config = null;

  var renderer, scene, camera, clock, rafId;
  var plane, shaderMaterial;
    
  var targetScrollProgress = 0;
  var currentScrollProgress = 0;
  var curFloor = 0;
  var mouseX = 0, mouseY = 0;
  var FLOORS = 7;
  
  var isIntersecting = true;
  var isHidden = document.hidden;
  
  var imgTexture = null;
  var textureLoaded = false;

  function disposeScene() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
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
  }

  function fallback() {
    document.body.classList.add('no3d');
  }

  function initRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false
      });
    } catch (err) {
      fallback();
      return false;
    }
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dpr));
    var winW = pin.clientWidth || window.innerWidth;
    var winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    renderer.setSize(winW, winH, false);
    renderer.outputEncoding = THREE.sRGBEncoding;

    canvas.addEventListener('webglcontextlost', function(e) {
      e.preventDefault();
      if (rafId) cancelAnimationFrame(rafId);
    }, false);

    canvas.addEventListener('webglcontextrestored', function() {
      buildScene();
    }, false);

    return true;
  }

  function loadAssetsAndBuild() {
    var loader = new THREE.TextureLoader();
    loader.load('assets/expert-verticals-elevator-hero.png', function(tex) {
      tex.encoding = THREE.sRGBEncoding;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      imgTexture = tex;
      textureLoaded = true;
      buildScene();
    }, undefined, function(err) {
      console.error('Texture load error', err);
      fallback();
    });
  }

  function buildScene() {
    if (!textureLoaded) return;
    disposeScene();
    
    var winW = pin.clientWidth || window.innerWidth;
    currentBp = getBreakpoint(winW);
    config = SCENE_CONFIG[currentBp];

    if (!renderer) {
      if (!initRenderer()) return;
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dpr));
      var winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
      renderer.setSize(winW, winH, false);
    }

    document.body.classList.remove('no3d');

    if (!scene) {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111315);
    }
    
    var winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    
    if (!camera) {
      camera = new THREE.PerspectiveCamera(40, winW / winH, 0.1, 150);
    } else {
      camera.fov = 40;
      camera.aspect = winW / winH;
      camera.updateProjectionMatrix();
    }

    if (reel) {
      var labels = ['G'];
      for (var fi = 1; fi < FLOORS; fi++) labels.push(String(fi).padStart(2, '0'));
      reel.innerHTML = labels.map(function(l) { return '<li>' + l + '</li>'; }).join('');
    }

    // Dynamic plane scaling based on 16:9 ratio and vertical pan needs
    var imgAspect = 16 / 9;
    var maxZ = 12.0; // max distance camera will pull back
    var fovRad = camera.fov * Math.PI / 180;
    var maxVisH = 2 * Math.tan(fovRad / 2) * maxZ;
    var maxVisW = maxVisH * camera.aspect;
    
    // Make plane large enough to allow vertical panning (e.g., 2.5x the max visible height)
    var targetH = maxVisH * 3.0; 
    var targetW = targetH * imgAspect;
    
    if (targetW < maxVisW * 1.5) {
      targetW = maxVisW * 1.5;
      targetH = targetW / imgAspect;
    }

    var geo = new THREE.PlaneGeometry(targetW, targetH, 1, 1);
    
    var uniforms = {
      tDiffuse: { value: imgTexture },
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(winW, winH) }
    };

    var vert = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
    var frag = "uniform sampler2D tDiffuse; uniform float uProgress; uniform float uTime; uniform vec2 uResolution; varying vec2 vUv; " +
               "float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } " +
               "void main() { " +
               "vec4 texColor = texture2D(tDiffuse, vUv); " +
               "float p = uProgress; " +
               "float sweep = smoothstep(0.40, 0.62, p); " +
               "float highlightPos = fract(p * 2.0 - vUv.x - vUv.y); " +
               "float highlight = smoothstep(0.0, 0.05, highlightPos) * smoothstep(0.15, 0.05, highlightPos); " +
               "texColor.rgb += highlight * sweep * 0.12 * vec3(0.8, 0.9, 1.0); " +
               "float redGlow = smoothstep(0.0, 0.18, p) * (1.0 - smoothstep(0.4, 0.6, p)); " +
               "float destGlow = smoothstep(0.82, 1.0, p); " +
               "float glowActive = max(redGlow, destGlow); " +
               "float distInd = distance(vUv, vec2(0.75, 0.35 + p * 0.25)); " +
               "float glowMask = smoothstep(0.1, 0.0, distInd); " +
               "texColor.rgb += glowMask * glowActive * 0.8 * vec3(1.0, 0.1, 0.15); " +
               "float fogInt = smoothstep(0.4, 1.0, p) * 0.35; " +
               "vec3 fogColor = vec3(0.06, 0.07, 0.08); " +
               "texColor.rgb = mix(texColor.rgb, fogColor, fogInt * (1.0 - vUv.y)); " +
               "float abstractLights = smoothstep(0.62, 0.82, p) * (1.0 - smoothstep(0.9, 1.0, p)); " +
               "float envMask = smoothstep(0.2, 0.0, distance(vUv, vec2(0.2 + sin(vUv.y*10.0)*0.1, vUv.y))); " +
               "texColor.rgb += envMask * abstractLights * 0.15 * vec3(0.7, 0.8, 0.9); " +
               "vec2 pos = (gl_FragCoord.xy / uResolution.xy) - vec2(0.5); " +
               "float vignette = smoothstep(0.9, 0.3, length(pos)); " +
               "texColor.rgb *= vignette; " +
               "texColor.rgb += hash(vUv * uTime) * 0.035; " +
               "gl_FragColor = texColor; " +
               "}";

    shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      depthWrite: false
    });

    plane = new THREE.Mesh(geo, shaderMaterial);
    scene.add(plane);

    plane.userData.targetW = targetW;
    plane.userData.targetH = targetH;

    clock = new THREE.Clock();
    targetScrollProgress = 0;
    
    updateScrollProgress();
    currentScrollProgress = targetScrollProgress;

    frame();
  }

  function updateScrollProgress() {
    var viewH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    var rect = track.getBoundingClientRect();
    
    isIntersecting = (rect.bottom > 0 && rect.top < viewH);

    var travel = Math.max(1, track.offsetHeight - viewH);
    var p = -rect.top / travel;
    targetScrollProgress = Math.max(0, Math.min(1, p));
  }

  window.addEventListener('scroll', function() {
    updateScrollProgress();
  }, { passive: true });

  window.addEventListener('mousemove', function(e) {
    if (config && config.maxW <= 1024) return;
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  document.addEventListener('visibilitychange', function() {
    isHidden = document.hidden;
  });

  var resizeTimeout;
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function(entries) {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        var w = pin.clientWidth || window.innerWidth;
        var h = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
        var newBp = getBreakpoint(w);
        
        if (newBp !== currentBp) {
          buildScene();
        } else if (camera && renderer && plane) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          if (shaderMaterial) shaderMaterial.uniforms.uResolution.value.set(w, h);
          updateScrollProgress();
        }
      }, 100);
    });
    ro.observe(pin);
  } else {
    window.addEventListener('resize', function() {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        var w = pin.clientWidth || window.innerWidth;
        var h = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
        var newBp = getBreakpoint(w);
        if (newBp !== currentBp) {
          buildScene();
        } else if (camera && renderer && plane) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          if (shaderMaterial) shaderMaterial.uniforms.uResolution.value.set(w, h);
          updateScrollProgress();
        }
      }, 100);
    }, { passive: true });
  }

  function frame() {
    rafId = requestAnimationFrame(frame);
    
    if (!scene || !camera || !renderer || isHidden || !isIntersecting) return;

    var dt = clock.getDelta();
    var t = clock.getElapsedTime();

    var deltaP = targetScrollProgress - currentScrollProgress;
    currentScrollProgress += deltaP * (config.maxW <= 767 ? 0.15 : 0.10);
    if (isNaN(currentScrollProgress)) currentScrollProgress = 0;
    
    var p = currentScrollProgress;

    if (shaderMaterial) {
      shaderMaterial.uniforms.uProgress.value = p;
      shaderMaterial.uniforms.uTime.value = t;
    }

    // Sequence Choreography
    var s1 = smoothstep(0.00, 0.18, p); // Ground
    var s2 = smoothstep(0.18, 0.40, p); // Ascending
    var s3 = smoothstep(0.40, 0.62, p); // Engineering Reveal
    var s4 = smoothstep(0.62, 0.82, p); // Environments
    var s5 = smoothstep(0.82, 1.00, p); // Destination

    var isMobile = config.maxW <= 767;
    var tW = plane.userData.targetW;
    var tH = plane.userData.targetH;

    // Z Zoom
    var startZ = isMobile ? 5.5 : 4.5;
    var camZ = startZ 
             - (s1 * 0.2) // subtle push in
             + (s2 * 1.5) // zoom out
             + (s3 * 1.5) // pull back
             + (s4 * 2.0) // gradual pullback
             + (s5 * 1.5); // settle wide

    // Y Pan (simulate ascending)
    var startY = -tH * 0.18; 
    var endY = tH * 0.18;
    var travelY = endY - startY;

    var camY = startY 
             + (s2 * travelY * 0.3)
             + (s3 * travelY * 0.3)
             + (s4 * travelY * 0.25)
             + (s5 * travelY * 0.15);

    // X Pan (maintain composition)
    var startX = isMobile ? -tW * 0.1 : -tW * 0.08;
    var endX = isMobile ? tW * 0.02 : tW * 0.05;
    var travelX = endX - startX;

    var camX = startX
             + (s2 * travelX * 0.2)
             + (s3 * travelX * 0.3)
             + (s4 * travelX * 0.3)
             + (s5 * travelX * 0.2);

    camera.position.x += (camX + (mouseX * tW * 0.05) - camera.position.x) * 0.1;
    camera.position.y += (camY - (mouseY * tH * 0.05) - camera.position.y) * 0.1;
    camera.position.z += (camZ - camera.position.z) * 0.1;
    camera.lookAt(camX, camY, 0); // Always look straight at the plane to avoid perspective warp

    // UI Updates
    var carFloorF = p * (FLOORS - 1);
    
    if (scenes && scenes.length >= 5) {
      for (var s = 0; s < 5; s++) {
        if (scenes[s]) {
          scenes[s].classList.toggle('on', p >= sceneRanges[s][0] && p < sceneRanges[s][1]);
        }
      }
    }
    pin.classList.toggle('asc', p > 0.03);

    if (reel && ldDir) {
      var fl = Math.round(carFloorF);
      if (fl !== curFloor) {
        curFloor = fl;
        reel.style.transform = 'translateY(-' + fl + 'em)';
      }
      
      // Direction arrow logic
      if (deltaP > 0.001) {
        ldDir.classList.remove('down');
        ldDir.classList.add('up');
      } else if (deltaP < -0.001) {
        ldDir.classList.remove('up');
        ldDir.classList.add('down');
      }
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAssetsAndBuild);
  } else {
    loadAssetsAndBuild();
  }
})();
`;

fs.writeFileSync('js/elevator-scene.js', code);
console.log('Elevator scene 2.5D integration completed.');
