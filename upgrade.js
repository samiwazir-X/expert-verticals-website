const fs = require('fs');

const code = `(function() {
  var track = document.getElementById('heroTrack');
  var pin = document.getElementById('heroPin');
  var canvas = document.getElementById('heroGL');
  if (!track || !pin || !canvas) return;

  var SCENE_CONFIG = {
    mobileSmall: { maxW: 480, fov: 54, z: 9.5, x: 0, dpr: 1.0, segments: 8, floors: 7, antialias: false },
    mobileLarge: { maxW: 767, fov: 48, z: 8.5, x: 0, dpr: 1.25, segments: 12, floors: 7, antialias: false },
    tablet: { maxW: 1024, fov: 44, z: 7.5, x: 0.5, dpr: 1.5, segments: 24, floors: 9, antialias: true },
    desktop: { maxW: Infinity, fov: 40, z: 6.2, x: 1.35, dpr: 2.0, segments: 32, floors: 11, antialias: true }
  };

  function getBreakpoint(w) {
    if (w <= 480) return 'mobileSmall';
    if (w <= 767) return 'mobileLarge';
    if (w <= 1024) return 'tablet';
    return 'desktop';
  }

  var scenes = [
    document.querySelector('.s1'),
    document.querySelector('.s2'),
    document.querySelector('.s3'),
    document.querySelector('.s4'),
    document.querySelector('.s5')
  ];

  var sceneRanges = [
    [-0.01, 0.16],
    [0.16, 0.38],
    [0.38, 0.60],
    [0.60, 0.82],
    [0.82, 1.01]
  ];

  var reel = document.getElementById('floorReel');
  var ldDir = document.getElementById('ldDir');

  var currentBp = null;
  var config = null;

  var renderer, scene, camera, group, clock, rafId;
  var materials = {}, geometries = [];
    
  var targetScrollProgress = 0;
  var currentScrollProgress = 0;
  var currentDoorOpen = 1.0;
  var curFloor = 0;
  var mouseX = 0, mouseY = 0;

  var car, doorL, doorR, cw, cables = [], indicators = [];
  var totalH, FH = 3.2;
  var HX = 1.5, HZ = 1.45;
  
  var isIntersecting = true;
  var isHidden = document.hidden;

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
    cables = [];
    indicators = [];
  }

  function fallback() {
    document.body.classList.add('no3d');
  }

  function initRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: config.antialias,
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
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; // Adds a cinematic tone if desired, but let's stick to base for exact colors.

    canvas.addEventListener('webglcontextlost', function(e) {
      e.preventDefault();
      if (rafId) cancelAnimationFrame(rafId);
    }, false);

    canvas.addEventListener('webglcontextrestored', function() {
      buildScene();
    }, false);

    return true;
  }

  function buildScene() {
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
    // Cinematic subtle haze
    scene.fog = new THREE.Fog(0x111315, 8, 45); 
    
    var winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    
    if (!camera) {
      camera = new THREE.PerspectiveCamera(config.fov, winW / winH, 0.1, 150);
    } else {
      camera.fov = config.fov;
      camera.aspect = winW / winH;
      camera.updateProjectionMatrix();
    }

    materials = {
      steel: new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.25 }), // Brushed stainless-steel
      darkMetal: new THREE.MeshStandardMaterial({ color: 0x181b1f, metalness: 0.7, roughness: 0.5 }), // Architectural graphite
      structure: new THREE.MeshStandardMaterial({ color: 0x121417, metalness: 0.6, roughness: 0.8 }), // Deep charcoal structure
      glass: new THREE.MeshStandardMaterial({ color: 0x1a1c1e, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.6 }), // Smoke-tinted glass
      red: new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 0.85 }),
      redGlow: new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 1.8 }), // Signature engineering red
      lamp: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe6f2ff, emissiveIntensity: 1.2 }), // Cool-white illumination
      floor: new THREE.MeshStandardMaterial({ color: 0x0a0b0c, metalness: 0.1, roughness: 0.95 }) // Matte black interior floor
    };

    var FLOORS = config.floors;
    totalH = (FLOORS - 1) * FH;

    if (reel) {
      var labels = ['G'];
      for (var fi = 1; fi < FLOORS; fi++) labels.push(String(fi).padStart(2, '0'));
      reel.innerHTML = labels.map(function(l) { return '<li>' + l + '</li>'; }).join('');
    }

    group = new THREE.Group();
    scene.add(group);
    group.position.x = config.x;

    // Shaft
    var geoWall = new THREE.BoxGeometry(HX * 2 + 1.8, totalH + 8, 0.2);
    var backWall = new THREE.Mesh(geoWall, materials.darkMetal);
    backWall.position.set(0, totalH / 2, -HZ - 0.95);
    group.add(backWall);

    var geoSide = new THREE.BoxGeometry(0.18, totalH + 8, HZ * 2 + 0.8);
    var leftWall = new THREE.Mesh(geoSide, materials.structure);
    leftWall.position.set(-HX - 0.4, totalH / 2, 0);
    group.add(leftWall);
    
    var rightWall = leftWall.clone();
    rightWall.position.x = HX + 0.4;
    group.add(rightWall);

    for (var f = 0; f < FLOORS; f++) {
      var y = f * FH;
      
      var cyl = new THREE.CylinderGeometry(0.04, 0.04, totalH + 8, config.segments);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
        var rail = new THREE.Mesh(cyl, materials.steel);
        rail.position.set(p[0] * (HX - 0.15), totalH / 2, p[1] * (HZ - 0.28));
        group.add(rail);
      });

      var slab = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 0.8, 0.26, 0.8), materials.darkMetal);
      slab.position.set(0, y - 0.13, HZ + 0.8);
      group.add(slab);

      var lintel = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 0.8, 0.6, 0.15), materials.structure);
      lintel.position.set(0, y + 2.55, HZ + 0.06);
      group.add(lintel);

      [-1, 1].forEach(function(s) {
        var jamb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.15), materials.structure);
        jamb.position.set(s * 0.78, y + 1.25, HZ + 0.06);
        group.add(jamb);
      });

      var ind = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.04), materials.lamp);
      ind.position.set(-1.05, y + 2.55, HZ + 0.14);
      group.add(ind);
      indicators.push(ind);
    }

    car = new THREE.Group();
    var carW = 2.4, carH = 3.0, carD = 1.8;
    
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(carW, carH, carD), materials.steel);
    cabin.position.y = carH / 2;
    car.add(cabin);

    var geoPost = new THREE.BoxGeometry(0.1, carH, 0.1);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
      var post = new THREE.Mesh(geoPost, materials.structure);
      post.position.set(p[0] * (carW / 2 - 0.05), carH / 2, p[1] * (carD / 2 - 0.05));
      car.add(post);
    });

    var glassFront = new THREE.Mesh(new THREE.PlaneGeometry(carW - 0.16, carH - 0.18), materials.glass);
    glassFront.position.set(0, carH / 2, carD / 2);
    car.add(glassFront);
    var glassBack = glassFront.clone();
    glassBack.position.z = -carD / 2;
    glassBack.rotation.y = Math.PI;
    car.add(glassBack);
    var glassSideL = new THREE.Mesh(new THREE.PlaneGeometry(carD - 0.16, carH - 0.18), materials.glass);
    glassSideL.rotation.y = Math.PI / 2;
    glassSideL.position.set(carW / 2, carH / 2, 0);
    car.add(glassSideL);
    var glassSideR = glassSideL.clone();
    glassSideR.position.x = -carW / 2;
    glassSideR.rotation.y = -Math.PI / 2;
    car.add(glassSideR);

    var floorInlay = new THREE.Mesh(new THREE.BoxGeometry(carW - 0.22, 0.04, carD - 0.22), materials.floor);
    floorInlay.position.y = 0.1;
    car.add(floorInlay);

    var ceilingLamp = new THREE.Mesh(new THREE.BoxGeometry(carW - 0.6, 0.04, carD - 0.6), materials.lamp);
    ceilingLamp.position.y = carH - 0.1;
    car.add(ceilingLamp);

    var interiorLight = new THREE.PointLight(0xffffff, config.maxW <= 767 ? 1.5 : 1.3, 10);
    interiorLight.position.set(0, carH - 0.35, 0);
    car.add(interiorLight);

    var carDisp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.06), materials.redGlow);
    carDisp.position.set(0, carH + 0.12, carD / 2 + 0.02);
    car.add(carDisp);

    var cop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.04), materials.steel);
    cop.position.set(carW / 2 - 0.1, 1.3, carD / 4);
    car.add(cop);

    // Slim stainless-steel handrail
    var handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, carW - 0.4, Math.max(8, config.segments / 2)), materials.steel);
    handrail.rotation.z = Math.PI / 2;
    handrail.position.set(0, 1.0, -carD / 2 + 0.16);
    car.add(handrail);

    group.add(car);

    for (var c = 0; c < 3; c++) {
      var cable = new THREE.Mesh(new THREE.BoxGeometry(0.022, 1, 0.022), materials.steel);
      cable.position.x = -0.4 + c * 0.4;
      group.add(cable);
      cables.push(cable);
    }

    cw = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.1, 0.32), materials.darkMetal);
    cw.position.set(0, totalH, -HZ + 0.3);
    group.add(cw);

    doorL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.45, 0.08), materials.steel);
    doorR = doorL.clone();
    doorL.position.set(-0.35, 1.25, HZ + 0.1);
    doorR.position.set(0.35, 1.25, HZ + 0.1);
    group.add(doorL);
    group.add(doorR);

    // Cinematic Architectural Lighting
    scene.add(new THREE.HemisphereLight(0x7a8c9e, 0x0a0c0e, 0.6));
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(8, 20, 12);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0xE31E24, 1.2);
    rimLight.position.set(-8, totalH * 0.5, -8);
    scene.add(rimLight);
    var fillLight = new THREE.PointLight(0x5c758a, 0.8, 50);
    fillLight.position.set(5, totalH * 0.5, 10);
    scene.add(fillLight);

    clock = new THREE.Clock();
    targetScrollProgress = 0;
    
    updateScrollProgress();
    currentScrollProgress = targetScrollProgress;

    // Start with camera already in correct position based on scroll
    camera.position.x = config.x;
    camera.position.y = 1.35 + currentScrollProgress * totalH;
    camera.position.z = config.z;

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
        } else if (camera && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
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
        } else if (camera && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          updateScrollProgress();
        }
      }, 100);
    }, { passive: true });
  }

  function frame() {
    rafId = requestAnimationFrame(frame);
    
    if (!scene || !camera || !renderer || isHidden || !isIntersecting) return;

    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * (config.maxW <= 767 ? 0.18 : 0.12);
    if (isNaN(currentScrollProgress)) currentScrollProgress = 0;

    var carBaseY = 1.35;
    var maxTravel = totalH;
    var carY = carBaseY + currentScrollProgress * maxTravel;
    car.position.y = carY;

    // Cinematic Doors: Tied to scroll progress. Open at Ground, close as we ascend.
    var targetDoorOpen = (currentScrollProgress < 0.05) ? 1.0 : 0.0;
    currentDoorOpen += (targetDoorOpen - currentDoorOpen) * 0.1;
    
    doorL.position.x = -0.35 - currentDoorOpen * 0.55;
    doorR.position.x = 0.35 + currentDoorOpen * 0.55;

    var topSheaveY = totalH + 2.6;
    var carTopY = carY + 2.75;
    cables.forEach(function(cb) {
      var cableLen = Math.max(0.01, topSheaveY - carTopY);
      cb.scale.y = cableLen;
      cb.position.y = carTopY + cableLen / 2;
      cb.position.z = -HZ + 0.3;
    });

    cw.position.y = totalH - currentScrollProgress * maxTravel + 1.1;

    // --- Cinematic Camera Choreography ---
    // Calculate phases based on currentScrollProgress (p)
    var p = currentScrollProgress;
    var camZoomOut = Math.max(0, Math.min(1, (p - 0.15) / (0.7 - 0.15)));
    camZoomOut = camZoomOut * camZoomOut * (3 - 2 * camZoomOut); // Smoothstep
    
    var camSettle = Math.max(0, Math.min(1, (p - 0.7) / (1.0 - 0.7)));
    camSettle = camSettle * camSettle * (3 - 2 * camSettle); // Smoothstep

    var isMobile = config.maxW <= 767;

    // 1. Ground Floor (p=0): Close, slightly low, front 3/4.
    // 2. Engineering Reveal (p>0.15): Pull back and crane up.
    // 3. Destination (p>0.7): Wide orbital.

    var targetZ = isMobile 
        ? (config.z - 2.0) + (camZoomOut * 2.0) // Keep it tighter on mobile
        : 4.5 + (camZoomOut * (config.z - 4.5)) + (camSettle * 1.5);

    var targetX = isMobile 
        ? config.x 
        : 0.5 + (camZoomOut * (config.x - 0.5)) + (camSettle * 1.5) + mouseX;

    // Mobile uses lower framing to keep the text area clear at the bottom.
    var targetY = isMobile
        ? (carY - 1.5) + (camZoomOut * 1.3)
        : (carY - 0.5) + (camZoomOut * 2.0) + (camSettle * 1.0) - mouseY;

    var lookAtY = isMobile
        ? (carY + 1.0) - (camZoomOut * 0.5)
        : (carY + 1.0) - (camZoomOut * 0.5);

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(config.x, lookAtY, 0);

    var carFloorF = currentScrollProgress * (config.floors - 1);
    indicators.forEach(function(indMesh, i) {
      var d = Math.abs(i - carFloorF);
      indMesh.material.emissiveIntensity = d < 0.65 ? 1.8 : 0.15; // Brighter active indicator
    });

    if (scenes && scenes.length >= 5) {
      for (var s = 0; s < 5; s++) {
        if (scenes[s]) {
          scenes[s].classList.toggle('on', currentScrollProgress >= sceneRanges[s][0] && currentScrollProgress < sceneRanges[s][1]);
        }
      }
    }
    pin.classList.toggle('asc', currentScrollProgress > 0.03);

    if (reel && ldDir) {
      var fl = Math.round(carFloorF);
      if (fl !== curFloor) {
        ldDir.classList.toggle('down', fl < curFloor);
        curFloor = fl;
        reel.style.transform = 'translateY(-' + fl + 'em)';
      }
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildScene);
  } else {
    buildScene();
  }
})();
`;

fs.writeFileSync('js/elevator-scene.js', code);
console.log('Successfully upgraded elevator-scene.js to cinematic standards');
