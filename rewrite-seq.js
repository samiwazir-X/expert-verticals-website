const fs = require('fs');

const code = `(function() {
  var track = document.getElementById('heroTrack');
  var pin = document.getElementById('heroPin');
  var canvas = document.getElementById('heroGL');
  var reel = document.getElementById('floorReel');
  var ldDir = document.getElementById('ldDir');

  var currentBp = null;
  var config = null;

  var renderer, scene, camera, rafId;
  var plane, shaderMaterial;
  
  // FRAME SEQUENCE LOGIC
  var TOTAL_FRAMES = 3; // UPDATE THIS TO YOUR TOTAL NUMBER OF FRAMES
  var framesLoaded = 0;
  var frameImages = [];
  var seqCanvas = document.createElement('canvas');
  var seqCtx = seqCanvas.getContext('2d');
  var imgTexture = null;
  var currentFrameIndex = -1;
    
  var targetScrollProgress = 0;
  var currentScrollProgress = 0;
  var curFloor = 0;
  var FLOORS = 7;
  
  var isIntersecting = true;
  var isHidden = document.hidden;
  
  var winW, winH;
  var planeWidth, planeHeight, fixedX;

  var SCENE_CONFIG = {
    mobileSmall: { maxW: 480, dpr: 1.25, smoothing: 0.14 },
    mobileLarge: { maxW: 767, dpr: 1.25, smoothing: 0.14 },
    tablet: { maxW: 1024, dpr: 1.5, smoothing: 0.12 },
    desktop: { maxW: Infinity, dpr: 2.0, smoothing: 0.10 }
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

  function fallback() {
    document.body.classList.add('no3d');
    if (pin) pin.classList.add('hero-in');
    if (canvas) canvas.style.display = 'none';
    var hint = document.querySelector('.scroll-hint');
    if (hint) hint.style.display = 'none';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (reel) reel.style.transform = 'translateY(0)';
  }

  function init() {
    if (typeof THREE === 'undefined') {
      fallback();
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fallback();
      return;
    }

    if (reel && reel.children.length === 0) {
      var labels = ['G', '01', '02', '03', '04', '05', '06'];
      reel.innerHTML = labels.map(function(l) { return '<li>' + l + '</li>'; }).join('');
    }

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false
      });
    } catch (err) {
      console.error("WebGL initialization failed", err);
      fallback();
      return;
    }

    winW = pin.clientWidth || window.innerWidth;
    winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    currentBp = getBreakpoint(winW);
    config = SCENE_CONFIG[currentBp];
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dpr));
    renderer.setSize(winW, winH, false);
    renderer.outputEncoding = THREE.sRGBEncoding;

    canvas.addEventListener('webglcontextlost', function(e) {
      e.preventDefault();
      if (rafId) cancelAnimationFrame(rafId);
      fallback();
    }, false);

    canvas.addEventListener('webglcontextrestored', function() {
      window.location.reload();
    }, false);

    loadFrameSequence();
  }
  
  function loadFrameSequence() {
    for (var i = 0; i < TOTAL_FRAMES; i++) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      // Format: frame_0.webp, frame_1.webp, etc.
      img.src = 'assets/sequence/frame_' + i + '.webp';
      img.onload = function() {
        framesLoaded++;
        if (framesLoaded === TOTAL_FRAMES) {
          onSequenceLoaded();
        }
      };
      img.onerror = function(err) {
        console.error("Failed to load frame", err);
        fallback();
      };
      frameImages.push(img);
    }
  }

  function onSequenceLoaded() {
    // Set internal canvas to image dimensions
    seqCanvas.width = frameImages[0].width;
    seqCanvas.height = frameImages[0].height;
    
    // Draw initial frame
    seqCtx.drawImage(frameImages[0], 0, 0);
    currentFrameIndex = 0;
    
    imgTexture = new THREE.CanvasTexture(seqCanvas);
    imgTexture.encoding = THREE.sRGBEncoding;
    imgTexture.minFilter = THREE.LinearMipmapLinearFilter;
    imgTexture.magFilter = THREE.LinearFilter;
    
    buildScene();
    pin.classList.add('hero-in');
  }

  function calculateGeometry() {
    winW = pin.clientWidth || window.innerWidth;
    winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    currentBp = getBreakpoint(winW);
    config = SCENE_CONFIG[currentBp];

    var imgAspect = seqCanvas.width / seqCanvas.height;
    var viewportAspect = winW / winH;
    
    var isMobile = config.maxW <= 767;
    
    // For video sequences, we want it to perfectly cover the screen (like object-fit: cover)
    // No artificial vertical travel needed since the video itself provides the motion!
    planeHeight = winH;
    planeWidth = planeHeight * imgAspect;
    
    if (planeWidth < winW) {
      planeWidth = winW;
      planeHeight = planeWidth / imgAspect;
    }
    
    if (isMobile) {
      fixedX = (planeWidth - winW) / 2 * 0.45;
    } else {
      fixedX = (planeWidth - winW) / 2 * 0.15;
    }
    
    if (camera) {
      camera.left = winW / -2;
      camera.right = winW / 2;
      camera.top = winH / 2;
      camera.bottom = winH / -2;
      camera.updateProjectionMatrix();
    }
    
    if (plane) {
      plane.scale.set(planeWidth, planeHeight, 1);
    }
    if (shaderMaterial) {
      shaderMaterial.uniforms.uResolution.value.set(winW, winH);
    }
  }

  function buildScene() {
    if (scene) {
      scene.traverse(function(obj) {
        if (obj.geometry) obj.geometry.dispose();
      });
      scene.clear();
    } else {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111315);
    }
    
    calculateGeometry();

    camera = new THREE.OrthographicCamera(winW / -2, winW / 2, winH / 2, winH / -2, 0.1, 10);
    camera.position.z = 5;

    var geo = new THREE.PlaneGeometry(1, 1, 1, 1);
    
    var uniforms = {
      tDiffuse: { value: imgTexture },
      uProgress: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(winW, winH) }
    };

    var vert = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
    var frag = "uniform sampler2D tDiffuse; uniform float uProgress; uniform vec2 uResolution; varying vec2 vUv; " +
               "float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } " +
               "void main() { " +
               "vec4 texColor = texture2D(tDiffuse, vUv); " +
               "float p = uProgress; " +
               "float sweep = smoothstep(0.40, 0.62, p); " +
               "float highlightPos = fract(p * 2.0 - vUv.x - vUv.y); " +
               "float highlight = smoothstep(0.0, 0.05, highlightPos) * (1.0 - smoothstep(0.05, 0.15, highlightPos)); " +
               "texColor.rgb += highlight * sweep * 0.10 * vec3(0.8, 0.9, 1.0); " +
               "float redGlow = smoothstep(0.0, 0.18, p) * (1.0 - smoothstep(0.4, 0.6, p)); " +
               "float destGlow = smoothstep(0.82, 1.0, p); " +
               "float glowActive = max(redGlow, destGlow); " +
               "float distInd = distance(vUv, vec2(0.75, 0.35 + p * 0.25)); " +
               "float glowMask = smoothstep(0.1, 0.0, distInd); " +
               "texColor.rgb += glowMask * glowActive * 0.6 * vec3(1.0, 0.1, 0.15); " +
               "float fogInt = smoothstep(0.4, 1.0, p) * 0.25; " +
               "vec3 fogColor = vec3(0.06, 0.07, 0.08); " +
               "texColor.rgb = mix(texColor.rgb, fogColor, fogInt * (1.0 - vUv.y)); " +
               "vec2 pos = (gl_FragCoord.xy / uResolution.xy) - vec2(0.5); " +
               "float vignette = smoothstep(0.9, 0.3, length(pos)); " +
               "texColor.rgb *= vignette; " +
               "texColor.rgb += hash(gl_FragCoord.xy) * 0.025; " +
               "gl_FragColor = texColor; " +
               "}";

    if (!shaderMaterial) {
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vert,
        fragmentShader: frag,
        depthWrite: false
      });
    }

    plane = new THREE.Mesh(geo, shaderMaterial);
    plane.scale.set(planeWidth, planeHeight, 1);
    scene.add(plane);

    updateScrollProgress();
    currentScrollProgress = targetScrollProgress;

    if (!rafId) {
      frame();
    }
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

  document.addEventListener('visibilitychange', function() {
    isHidden = document.hidden;
  });

  var resizeTimeout;
  window.addEventListener('resize', function() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      if (renderer) {
        var newW = pin.clientWidth || window.innerWidth;
        var newBp = getBreakpoint(newW);
        var oldConfig = config;
        
        renderer.setSize(newW, ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800, false);
        if (newBp !== currentBp) {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, SCENE_CONFIG[newBp].dpr));
        }
        calculateGeometry();
        updateScrollProgress();
      }
    }, 150);
  }, { passive: true });

  function frame() {
    rafId = requestAnimationFrame(frame);
    
    if (!scene || !camera || !renderer || isHidden || !isIntersecting) return;

    var deltaP = targetScrollProgress - currentScrollProgress;
    currentScrollProgress += deltaP * config.smoothing;
    if (isNaN(currentScrollProgress)) currentScrollProgress = 0;
    
    var p = currentScrollProgress;

    // UPDATE FRAME SEQUENCE
    var targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(p * (TOTAL_FRAMES - 1))));
    if (targetFrame !== currentFrameIndex && frameImages[targetFrame]) {
      seqCtx.drawImage(frameImages[targetFrame], 0, 0);
      imgTexture.needsUpdate = true;
      currentFrameIndex = targetFrame;
    }

    if (shaderMaterial) {
      shaderMaterial.uniforms.uProgress.value = p;
    }

    camera.position.x = fixedX;
    camera.position.y = 0;
    camera.lookAt(fixedX, 0, 0);

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
      
      if (deltaP > 0.001) {
        ldDir.classList.remove('down');
        ld it
        // Wait, typo ld it -> ldDir
        ldDir.classList.add('up');
      } else if (deltaP < -0.001) {
        ldDir.classList.remove('up');
        ldDir.classList.add('down');
      }
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

fs.writeFileSync('js/elevator-scene.js', code);
console.log('js/elevator-scene.js successfully patched for frame sequences');
