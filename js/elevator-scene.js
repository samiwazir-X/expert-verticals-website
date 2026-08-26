/**
 * EXPERT VERTICALS — ADVANCED THREE.JS 3D ELEVATOR CUTAWAY
 * High-performance, scroll-driven interactive 3D hoistway experience
 */
(function() {
  'use strict';

  function initElevatorScene() {
    var track = document.getElementById('heroTrack');
    var pin = document.getElementById('heroPin');
    var canvas = document.getElementById('heroGL');
    var reel = document.getElementById('floorReel');
    var ldDir = document.getElementById('ldDir');

    if (!track || !pin || !canvas) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    var isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

    var scenes = [
      document.querySelector('.s1'),
      document.querySelector('.s2'),
      document.querySelector('.s3'),
      document.querySelector('.s4'),
      document.querySelector('.s5')
    ];

    var FLOORS = isMobile ? 7 : (isTablet ? 9 : 11);
    if (reel) {
      var labels = ['G'];
      for (var fi = 1; fi < FLOORS; fi++) {
        labels.push(String(fi).padStart(2, '0'));
      }
      reel.innerHTML = labels.map(function(l) { return '<li>' + l + '</li>'; }).join('');
    }

    function fallback() {
      document.body.classList.add('no3d');
    }

    if (reduceMotion || typeof THREE === 'undefined') {
      fallback();
      return;
    }

    // Check WebGL availability
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

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !isMobile,
        powerPreference: 'high-performance',
        alpha: false
      });
    } catch (err) {
      fallback();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(pin.clientWidth || window.innerWidth, pin.clientHeight || window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Remove no3d if previously added
    document.body.classList.remove('no3d');

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1013);
    scene.fog = new THREE.Fog(0x0e1013, 14, 52);

    var camera = new THREE.PerspectiveCamera(40, (pin.clientWidth || window.innerWidth) / (pin.clientHeight || window.innerHeight), 0.1, 150);

    // ============ MATERIALS ============
    var matSteel = new THREE.MeshStandardMaterial({ color: 0xb5bec7, metalness: 0.92, roughness: 0.28 });
    var matDarkMetal = new THREE.MeshStandardMaterial({ color: 0x1c1f24, metalness: 0.75, roughness: 0.45 });
    var matStructure = new THREE.MeshStandardMaterial({ color: 0x14171a, metalness: 0.6, roughness: 0.7 });
    var matGlass = new THREE.MeshStandardMaterial({ color: 0xbcd3e0, metalness: 0.95, roughness: 0.05, transparent: true, opacity: 0.22 });
    var matRed = new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 0.75 });
    var matRedGlow = new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 1.2 });
    var matLamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 });
    var matFloor = new THREE.MeshStandardMaterial({ color: 0x22262b, metalness: 0.35, roughness: 0.8 });

    var FH = 3.2, HX = 1.5, HZ = 1.45, totalH = (FLOORS - 1) * FH;
    var group = new THREE.Group();
    scene.add(group);

    // Center offset to place shaft nicely on the right on desktop, centered on mobile
    var shaftOffsetX = isMobile ? 0 : 1.35;
    group.position.x = shaftOffsetX;

    // ============ HOISTWAY SHAFT STRUCTURE ============
    // Back Wall
    var backWall = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 1.8, totalH + 8, 0.2), matStructure);
    backWall.position.set(0, totalH / 2, -HZ - 0.95);
    group.add(backWall);

    // Side structural columns and beams
    [-1, 1].forEach(function(s) {
      var sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, totalH + 8, HZ * 2 + 0.8), matStructure);
      sideWall.position.set(s * (HX + 0.65), totalH / 2, 0);
      group.add(sideWall);
    });

    // Vertical Cold-Drawn Guide Rails
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, totalH + 4, 0.1), matSteel);
      rail.position.set(p[0] * (HX - 0.15), totalH / 2, p[1] * (HZ - 0.28));
      group.add(rail);
    });

    // Floor slabs, door lintels & glowing floor indicators
    var indicators = [];
    for (var f = 0; f < FLOORS; f++) {
      var y = f * FH;
      
      // Floor Slab
      var slab = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 0.4, 0.26, 1.6), matFloor);
      slab.position.set(0, y - 0.13, HZ + 0.8);
      group.add(slab);

      // Floor Lintels
      var lintel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.18), matDarkMetal);
      lintel.position.set(0, y + 2.55, HZ + 0.06);
      group.add(lintel);

      // Door Jambs
      [-1, 1].forEach(function(s) {
        var jamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 0.18), matDarkMetal);
        jamb.position.set(s * 0.78, y + 1.25, HZ + 0.06);
        group.add(jamb);
      });

      // Digital Floor Indicator on Landing
      var ind = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.1, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x220507, emissive: 0xE31E24, emissiveIntensity: 0.15 })
      );
      ind.position.set(-1.05, y + 2.55, HZ + 0.14);
      group.add(ind);
      indicators.push(ind);
    }

    // Overhead Traction Motor Machine & Red Pulley Sheave
    var machineBase = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 1.2, 0.4, 1.2), matDarkMetal);
    machineBase.position.set(0, totalH + 2.6, -0.3);
    group.add(machineBase);

    var motorCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 24), matDarkMetal);
    motorCylinder.rotation.z = Math.PI / 2;
    motorCylinder.position.set(-0.5, totalH + 2.9, -0.3);
    group.add(motorCylinder);

    var sheave = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 32), matRed);
    sheave.rotation.z = Math.PI / 2;
    sheave.position.set(0.2, totalH + 2.9, -0.3);
    group.add(sheave);

    // ============ ELEVATOR CAR (CABIN) ============
    var car = new THREE.Group();
    var carW = 2.2, carH = 2.55, carD = 1.9;

    // Platform Base & Roof
    var carBase = new THREE.Mesh(new THREE.BoxGeometry(carW, 0.16, carD), matDarkMetal);
    car.add(carBase);

    var carRoof = new THREE.Mesh(new THREE.BoxGeometry(carW, 0.16, carD), matDarkMetal);
    carRoof.position.y = carH;
    car.add(carRoof);

    // Upper crosshead safety beam
    var crosshead = new THREE.Mesh(new THREE.BoxGeometry(carW + 0.2, 0.25, 0.3), matSteel);
    crosshead.position.set(0, carH + 0.2, 0);
    car.add(crosshead);

    // Corner structural steel posts
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.1, carH, 0.1), matSteel);
      post.position.set(p[0] * (carW / 2 - 0.05), carH / 2, p[1] * (carD / 2 - 0.05));
      car.add(post);
    });

    // Glass Walls (Front, Back, Left, Right)
    var glassFront = new THREE.Mesh(new THREE.PlaneGeometry(carW - 0.16, carH - 0.18), matGlass);
    glassFront.position.set(0, carH / 2, carD / 2);
    car.add(glassFront);

    var glassBack = glassFront.clone();
    glassBack.position.z = -carD / 2;
    glassBack.rotation.y = Math.PI;
    car.add(glassBack);

    var glassSideL = new THREE.Mesh(new THREE.PlaneGeometry(carD - 0.16, carH - 0.18), matGlass);
    glassSideL.rotation.y = Math.PI / 2;
    glassSideL.position.set(carW / 2, carH / 2, 0);
    car.add(glassSideL);

    var glassSideR = glassSideL.clone();
    glassSideR.position.x = -carW / 2;
    glassSideR.rotation.y = -Math.PI / 2;
    car.add(glassSideR);

    // Cabin Floor Inlay
    var floorInlay = new THREE.Mesh(new THREE.BoxGeometry(carW - 0.22, 0.04, carD - 0.22), matFloor);
    floorInlay.position.y = 0.1;
    car.add(floorInlay);

    // Illuminated LED Ceiling Panel
    var ceilingLamp = new THREE.Mesh(new THREE.BoxGeometry(carW - 0.6, 0.04, carD - 0.6), matLamp);
    ceilingLamp.position.y = carH - 0.1;
    car.add(ceilingLamp);

    // Warm Interior Point Light
    var interiorLight = new THREE.PointLight(0xffffff, 1.2, 8);
    interiorLight.position.set(0, carH - 0.35, 0);
    car.add(interiorLight);

    // Red Digital Floor Indicator Display over car door
    var carDisp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.06), matRedGlow);
    carDisp.position.set(0, carH + 0.12, carD / 2 + 0.02);
    car.add(carDisp);

    // Car Operating Panel (COP) inside
    var cop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.04), matSteel);
    cop.position.set(carW / 2 - 0.1, 1.3, carD / 4);
    car.add(cop);

    // Polished Handrail
    var handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, carW - 0.4, 12), matSteel);
    handrail.rotation.z = Math.PI / 2;
    handrail.position.set(0, 1.0, -carD / 2 + 0.16);
    car.add(handrail);

    group.add(car);

    // ============ SUSPENSION CABLES & COUNTERWEIGHT ============
    var cables = [];
    for (var c = 0; c < 3; c++) {
      var cable = new THREE.Mesh(new THREE.BoxGeometry(0.022, 1, 0.022), matSteel);
      cable.position.x = -0.4 + c * 0.4;
      group.add(cable);
      cables.push(cable);
    }

    // Counterweight
    var cw = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.1, 0.32), matDarkMetal);
    cw.position.set(0, totalH, -HZ + 0.3);
    group.add(cw);

    // Ground Floor Landing Doors (Animated on start)
    var doorL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.45, 0.08), matSteel);
    var doorR = doorL.clone();
    doorL.position.set(-0.35, 1.25, HZ + 0.1);
    doorR.position.set(0.35, 1.25, HZ + 0.1);
    group.add(doorL);
    group.add(doorR);

    // ============ LIGHTING ============
    scene.add(new THREE.HemisphereLight(0x9cb6c8, 0x121518, 0.7));

    var keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(6, 12, 10);
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0xE31E24, 0.65);
    rimLight.position.set(-6, totalH * 0.5, -6);
    scene.add(rimLight);

    var fillLight = new THREE.PointLight(0x8fa8bb, 0.5, 40);
    fillLight.position.set(4, totalH * 0.5, 8);
    scene.add(fillLight);

    // ============ SCROLL & ANIMATION LOOP ============
    var clock = new THREE.Clock();
    var curFloor = 0;
    var rafId;
    var targetScrollProgress = 0;
    var currentScrollProgress = 0;
    var mouseX = 0, mouseY = 0;

    // Mouse parallax tracking
    window.addEventListener('mousemove', function(e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    }, { passive: true });

    function resize() {
      if (!pin || !renderer) return;
      var w = pin.clientWidth || window.innerWidth;
      var h = pin.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      // Center or offset shaft based on screen width
      isMobile = w <= 768;
      group.position.x = isMobile ? 0 : 1.35;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    var sceneRanges = [
      [-0.01, 0.16],
      [0.16, 0.38],
      [0.38, 0.60],
      [0.60, 0.82],
      [0.82, 1.01]
    ];

    function frame() {
      rafId = requestAnimationFrame(frame);
      var t = clock.getElapsedTime();

      var max = track.offsetHeight - window.innerHeight;
      targetScrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      
      // Smooth linear interpolation for buttery motion
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.12;

      // Car Vertical Travel
      var carBaseY = 1.35;
      var maxTravel = (FLOORS - 1) * FH;
      var carY = carBaseY + currentScrollProgress * maxTravel;
      car.position.y = carY;

      // Ground Doors open / close smoothly on load
      var doorOpen = Math.min(1, Math.max(0, (t - 0.3) / 1.4));
      doorL.position.x = -0.35 - doorOpen * 0.55;
      doorR.position.x = 0.35 + doorOpen * 0.55;

      // Cable scaling and positioning
      var topSheaveY = totalH + 2.6;
      var carTopY = carY + carH + 0.2;
      cables.forEach(function(cb) {
        var cableLen = Math.max(0.01, topSheaveY - carTopY);
        cb.scale.y = cableLen;
        cb.position.y = carTopY + cableLen / 2;
        cb.position.z = -HZ + 0.3;
      });

      // Counterweight reciprocal downward travel
      cw.position.y = totalH - currentScrollProgress * maxTravel + 1.1;

      // Camera dynamic tracking
      var camTargetX = group.position.x + (isMobile ? 0 : 0.4) + mouseX;
      var camTargetY = carY + 0.8 - mouseY;
      var camTargetZ = 6.2;

      camera.position.x += (camTargetX - camera.position.x) * 0.1;
      camera.position.y += (camTargetY - camera.position.y) * 0.1;
      camera.position.z = camTargetZ;
      camera.lookAt(group.position.x, carY + 0.6, 0);

      // Floor indicators glow when car arrives
      var carFloorF = currentScrollProgress * (FLOORS - 1);
      indicators.forEach(function(indMesh, i) {
        var d = Math.abs(i - carFloorF);
        indMesh.material.emissiveIntensity = d < 0.65 ? 1.4 : 0.15;
      });

      // Update story captions
      if (scenes && scenes.length >= 5) {
        for (var s = 0; s < 5; s++) {
          if (scenes[s]) {
            scenes[s].classList.toggle('on', currentScrollProgress >= sceneRanges[s][0] && currentScrollProgress < sceneRanges[s][1]);
          }
        }
      }
      pin.classList.toggle('asc', currentScrollProgress > 0.03);

      // Floor reel & direction arrow
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

    frame();

    window.addEventListener('beforeunload', function() {
      if (rafId) cancelAnimationFrame(rafId);
      if (renderer) renderer.dispose();
    });
  }

  // Ensure initialization happens once DOM and scripts are fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof THREE !== 'undefined') {
        initElevatorScene();
      } else {
        window.addEventListener('load', initElevatorScene);
      }
    });
  } else {
    if (typeof THREE !== 'undefined') {
      initElevatorScene();
    } else {
      window.addEventListener('load', initElevatorScene);
    }
  }

})();
