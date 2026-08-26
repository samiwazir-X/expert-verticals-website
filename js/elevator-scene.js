/**
 * EXPERT VERTICALS — ADVANCED THREE.JS 3D ELEVATOR CUTAWAY
 * High-performance, scroll-driven interactive 3D hoistway experience
 * Fully responsive with Breakpoint Architecture, VisualViewport & Performance Pausing
 */
(function() {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fallback() {
    document.body.classList.add('no3d');
  }

  if (reduceMotion || typeof THREE === 'undefined') {
    fallback();
    return;
  }

  function isWebGLAvailable() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    fallback();
    return;
  }

  var track = document.getElementById('heroTrack');
  var pin = document.getElementById('heroPin');
  var canvas = document.getElementById('heroGL');
  var reel = document.getElementById('floorReel');
  var ldDir = document.getElementById('ldDir');

  if (!track || !pin || !canvas) return;

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

  var SCENE_CONFIG = {
    mobileSmall: { maxW: 480, fov: 54, z: 9.5, x: 0, dpr: 1.25, segments: 12, floors: 7, antialias: false },
    mobileLarge: { maxW: 767, fov: 48, z: 8.5, x: 0, dpr: 1.5, segments: 16, floors: 7, antialias: false },
    tablet: { maxW: 1024, fov: 44, z: 7.5, x: 0.5, dpr: 1.75, segments: 24, floors: 9, antialias: true },
    desktop: { maxW: Infinity, fov: 40, z: 6.2, x: 1.35, dpr: 2.0, segments: 32, floors: 11, antialias: true }
  };

  function getBreakpoint(w) {
    if (w <= SCENE_CONFIG.mobileSmall.maxW) return 'mobileSmall';
    if (w <= SCENE_CONFIG.mobileLarge.maxW) return 'mobileLarge';
    if (w <= SCENE_CONFIG.tablet.maxW) return 'tablet';
    return 'desktop';
  }

  var currentBp = null;
  var config = null;

  var renderer, scene, camera, group, clock, rafId;
  var materials = {}, geometries = [];
  var isIntersecting = true;
  var isHidden = document.hidden;
  
  var targetScrollProgress = 0;
  var currentScrollProgress = 0;
  var curFloor = 0;
  var mouseX = 0, mouseY = 0;

  var car, doorL, doorR, cw, cables = [], indicators = [];
  var totalH, FH = 3.2;

  function disposeScene() {
    if (rafId) cancelAnimationFrame(rafId);
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
    if (renderer) {
      renderer.dispose();
      var ctx = renderer.getContext();
      if (ctx && typeof ctx.getExtension === 'function') {
        var loseCtx = ctx.getExtension('WEBGL_lose_context');
        if (loseCtx) loseCtx.loseContext();
      }
      renderer = null;
    }
    cables = [];
    indicators = [];
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
    var winH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
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

  function buildScene() {
    disposeScene();
    
    var winW = pin.clientWidth || window.innerWidth;
    currentBp = getBreakpoint(winW);
    config = SCENE_CONFIG[currentBp];

    if (!initRenderer()) return;

    document.body.classList.remove('no3d');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1013);
    scene.fog = new THREE.Fog(0x0e1013, 14, 56);

    var winH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    camera = new THREE.PerspectiveCamera(config.fov, winW / winH, 0.1, 150);

    materials = {
      steel: new THREE.MeshStandardMaterial({ color: 0xc8d1da, metalness: 0.94, roughness: 0.24 }),
      darkMetal: new THREE.MeshStandardMaterial({ color: 0x181b1f, metalness: 0.8, roughness: 0.4 }),
      structure: new THREE.MeshStandardMaterial({ color: 0x121417, metalness: 0.6, roughness: 0.75 }),
      glass: new THREE.MeshStandardMaterial({ color: 0xcce0ec, metalness: 0.96, roughness: 0.05, transparent: true, opacity: 0.28 }),
      red: new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 0.85 }),
      redGlow: new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 1.4 }),
      lamp: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 }),
      floor: new THREE.MeshStandardMaterial({ color: 0x22262b, metalness: 0.35, roughness: 0.8 })
    };

    var FLOORS = config.floors;
    var HX = 1.5, HZ = 1.45;
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
    var geoSide = new THREE.BoxGeometry(0.18, totalH + 8, HZ * 2 + 0.8);
    var geoRail = new THREE.BoxGeometry(0.08, totalH + 4, 0.1);
    var geoSlab = new THREE.BoxGeometry(HX * 2 + 0.4, 0.26, 1.6);
    var geoLintel = new THREE.BoxGeometry(1.6, 0.22, 0.18);
    var geoJamb = new THREE.BoxGeometry(0.16, 2.6, 0.18);
    var geoInd = new THREE.BoxGeometry(0.36, 0.1, 0.06);

    var backWall = new THREE.Mesh(geoWall, materials.structure);
    backWall.position.set(0, totalH / 2, -HZ - 0.95);
    group.add(backWall);

    [-1, 1].forEach(function(s) {
      var sideWall = new THREE.Mesh(geoSide, materials.structure);
      sideWall.position.set(s * (HX + 0.65), totalH / 2, 0);
      group.add(sideWall);
    });

    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
      var rail = new THREE.Mesh(geoRail, materials.steel);
      rail.position.set(p[0] * (HX - 0.15), totalH / 2, p[1] * (HZ - 0.28));
      group.add(rail);
    });

    for (var f = 0; f < FLOORS; f++) {
      var y = f * FH;
      var slab = new THREE.Mesh(geoSlab, materials.floor);
      slab.position.set(0, y - 0.13, HZ + 0.8);
      group.add(slab);

      var lintel = new THREE.Mesh(geoLintel, materials.darkMetal);
      lintel.position.set(0, y + 2.55, HZ + 0.06);
      group.add(lintel);

      [-1, 1].forEach(function(s) {
        var jamb = new THREE.Mesh(geoJamb, materials.darkMetal);
        jamb.position.set(s * 0.78, y + 1.25, HZ + 0.06);
        group.add(jamb);
      });

      var ind = new THREE.Mesh(geoInd, new THREE.MeshStandardMaterial({ color: 0x220507, emissive: 0xE31E24, emissiveIntensity: 0.15 }));
      ind.position.set(-1.05, y + 2.55, HZ + 0.14);
      group.add(ind);
      indicators.push(ind);
    }

    var machineBase = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 1.2, 0.4, 1.2), materials.darkMetal);
    machineBase.position.set(0, totalH + 2.6, -0.3);
    group.add(machineBase);

    var motorCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, config.segments), materials.darkMetal);
    motorCyl.rotation.z = Math.PI / 2;
    motorCyl.position.set(-0.5, totalH + 2.9, -0.3);
    group.add(motorCyl);

    var sheave = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, config.segments), materials.red);
    sheave.rotation.z = Math.PI / 2;
    sheave.position.set(0.2, totalH + 2.9, -0.3);
    group.add(sheave);

    car = new THREE.Group();
    var carW = 2.2, carH = 2.55, carD = 1.9;

    var carBase = new THREE.Mesh(new THREE.BoxGeometry(carW, 0.16, carD), materials.darkMetal);
    car.add(carBase);
    var carRoof = new THREE.Mesh(new THREE.BoxGeometry(carW, 0.16, carD), materials.darkMetal);
    carRoof.position.y = carH;
    car.add(carRoof);
    var crosshead = new THREE.Mesh(new THREE.BoxGeometry(carW + 0.2, 0.25, 0.3), materials.steel);
    crosshead.position.set(0, carH + 0.2, 0);
    car.add(crosshead);

    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.1, carH, 0.1), materials.steel);
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

    var handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, carW - 0.4, Math.max(8, config.segments / 2)), materials.steel);
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

    scene.add(new THREE.HemisphereLight(0x9cb6c8, 0x121518, 0.8));
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(6, 14, 10);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0xE31E24, 0.7);
    rimLight.position.set(-6, totalH * 0.5, -6);
    scene.add(rimLight);
    var fillLight = new THREE.PointLight(0x8fa8bb, 0.6, 45);
    fillLight.position.set(4, totalH * 0.5, 8);
    scene.add(fillLight);

    clock = new THREE.Clock();
    targetScrollProgress = 0;
    
    // Initial calculate scroll progress
    updateScrollProgress();
    currentScrollProgress = targetScrollProgress;

    frame();
  }

  function updateScrollProgress() {
    var viewH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var rect = track.getBoundingClientRect();
    // Scroll progress strictly relative to track geometry
    var travel = Math.max(1, track.offsetHeight - viewH);
    var p = -rect.top / travel;
    targetScrollProgress = Math.max(0, Math.min(1, p));
  }

  window.addEventListener('scroll', function() {
    if (!isHidden && isIntersecting) updateScrollProgress();
  }, { passive: true });

  window.addEventListener('mousemove', function(e) {
    if (config.maxW <= 1024) return;
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  var resizeTimeout;
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function(entries) {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        var w = pin.clientWidth || window.innerWidth;
        var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        var newBp = getBreakpoint(w);
        
        if (newBp !== currentBp) {
          // Major breakpoint shift: completely rebuild to prevent memory leaks and handle DPR/geometry shifts
          buildScene();
        } else if (camera && renderer) {
          // Minor resize (e.g. mobile Safari address bar collapse): just update aspect ratio
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
        var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
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

  // Pausing Engine offscreen
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      isIntersecting = entries[0].isIntersecting;
      if (isIntersecting && !isHidden) updateScrollProgress();
    }, { rootMargin: '0px' });
    io.observe(track);
  }

  document.addEventListener('visibilitychange', function() {
    isHidden = document.hidden;
    if (!isHidden && isIntersecting) updateScrollProgress();
  });

  function frame() {
    rafId = requestAnimationFrame(frame);
    if (!scene || !camera || !renderer || isHidden || !isIntersecting) return;

    var t = clock.getElapsedTime();

    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * (config.maxW <= 767 ? 0.18 : 0.12);

    var carBaseY = 1.35;
    var maxTravel = totalH;
    var carY = carBaseY + currentScrollProgress * maxTravel;
    car.position.y = carY;

    var doorOpen = Math.min(1, Math.max(0, (t - 0.3) / 1.4));
    doorL.position.x = -0.35 - doorOpen * 0.55;
    doorR.position.x = 0.35 + doorOpen * 0.55;

    var topSheaveY = totalH + 2.6;
    var carTopY = carY + 2.75;
    cables.forEach(function(cb) {
      var cableLen = Math.max(0.01, topSheaveY - carTopY);
      cb.scale.y = cableLen;
      cb.position.y = carTopY + cableLen / 2;
      cb.position.z = -HZ + 0.3;
    });

    cw.position.y = totalH - currentScrollProgress * maxTravel + 1.1;

    var camTargetX = config.x + (config.maxW <= 1024 ? 0 : 0.4) + mouseX;
    var camTargetY = config.maxW <= 767 ? (carY + 1.25) : (carY + 0.8 - mouseY);

    camera.position.x += (camTargetX - camera.position.x) * 0.1;
    camera.position.y += (camTargetY - camera.position.y) * 0.1;
    camera.position.z = config.z;
    camera.lookAt(config.x, config.maxW <= 767 ? (carY + 0.95) : (carY + 0.6), 0);

    var carFloorF = currentScrollProgress * (config.floors - 1);
    indicators.forEach(function(indMesh, i) {
      var d = Math.abs(i - carFloorF);
      indMesh.material.emissiveIntensity = d < 0.65 ? 1.5 : 0.15;
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

  // Ensure DOM is fully loaded before first build
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildScene);
  } else {
    buildScene();
  }

})();
