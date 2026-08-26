/**
 * EXPERT VERTICALS — THREE.JS 3D ELEVATOR SHAFT SCENE
 * Scroll-driven interactive vertical cutaway with device scaling & fallbacks
 */
(function() {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
  var isTablet = window.matchMedia('(max-width: 1024px)').matches && !isMobile;

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
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1013);
  scene.fog = new THREE.Fog(0x0e1013, 14, 44);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);

  // Environment reflections
  try {
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a0c0e);
    
    var strip = new THREE.Mesh(new THREE.PlaneGeometry(20, 4), new THREE.MeshBasicMaterial({ color: 0x8fa3b0 }));
    strip.position.set(0, 8, -6);
    envScene.add(strip);
    
    var strip2 = strip.clone();
    strip2.material = new THREE.MeshBasicMaterial({ color: 0x3a4148 });
    strip2.position.set(-6, 2, 4);
    strip2.rotation.y = Math.PI / 2;
    envScene.add(strip2);
    
    var warm = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ color: 0xE31E24 }));
    warm.position.set(4, 5, 3);
    warm.rotation.y = -Math.PI / 3;
    envScene.add(warm);
    
    scene.environment = pmrem.fromScene(envScene, 0.05).texture;
    pmrem.dispose();
  } catch (e) {
    // Optional environment fallback
  }

  // Materials
  var matSteel = new THREE.MeshStandardMaterial({ color: 0x9aa4ab, metalness: 0.92, roughness: 0.34 });
  var matDark = new THREE.MeshStandardMaterial({ color: 0x1a1d21, metalness: 0.55, roughness: 0.62 });
  var matFrame = new THREE.MeshStandardMaterial({ color: 0x2b3036, metalness: 0.8, roughness: 0.4 });
  var matGlass = new THREE.MeshStandardMaterial({ color: 0xaec4cf, metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.16 });
  var matFloor = new THREE.MeshStandardMaterial({ color: 0x232629, metalness: 0.25, roughness: 0.85 });
  var matLamp = new THREE.MeshStandardMaterial({ color: 0xf4f6f2, emissive: 0xf4f6f2, emissiveIntensity: 0.9 });
  var matRed = new THREE.MeshStandardMaterial({ color: 0xE31E24, emissive: 0xE31E24, emissiveIntensity: 0.85 });

  var FH = 3, HX = 1.4, HZ = 1.35, totalH = (FLOORS - 1) * FH;
  var group = new THREE.Group();
  scene.add(group);

  // Shaft back & side walls
  var back = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 1.4, totalH + 7, 0.25), matDark);
  back.position.set(0, totalH / 2, -HZ - 0.9);
  group.add(back);

  [-1, 1].forEach(function(s) {
    var w = new THREE.Mesh(new THREE.BoxGeometry(0.22, totalH + 7, HZ * 2 + 0.5), matDark);
    w.position.set(s * (HX + 0.55), totalH / 2, 0);
    group.add(w);
  });

  // Guide rails
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
    var r = new THREE.Mesh(new THREE.BoxGeometry(0.07, totalH + 2, 0.09), matSteel);
    r.position.set(p[0] * (HX - 0.18), totalH / 2, p[1] * (HZ - 0.3));
    group.add(r);
  });

  // Floor slabs, landing door lintels and indicators
  var indicators = [];
  for (var f = 0; f < FLOORS; f++) {
    var y = f * FH;
    [-1, 1].forEach(function() {
      var slab = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 0.2, 0.24, 1.5), matFloor);
      slab.position.set(0, y - 0.12, HZ + 0.75);
      group.add(slab);
    });

    var lint = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.16), matFrame);
    lint.position.set(0, y + 2.45, HZ + 0.05);
    group.add(lint);

    [-1, 1].forEach(function(s) {
      var jamb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.5, 0.16), matFrame);
      jamb.position.set(s * 0.72, y + 1.2, HZ + 0.05);
      group.add(jamb);
    });

    var ind = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.09, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x3a1013, emissive: 0xE31E24, emissiveIntensity: 0.12 })
    );
    ind.position.set(-0.95, y + 2.45, HZ + 0.12);
    group.add(ind);
    indicators.push(ind);

    var col = new THREE.Mesh(new THREE.BoxGeometry(0.09, FH, 0.09), matFrame);
    col.position.set(HX + 0.25, y + FH / 2, HZ + 0.3);
    group.add(col);
  }

  // Overhead machine beam & sheave
  var beam = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 1.2, 0.35, 0.8), matFrame);
  beam.position.set(0, totalH + 2.4, -0.4);
  group.add(beam);

  var sheave = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 24), matSteel);
  sheave.rotation.z = Math.PI / 2;
  sheave.position.set(0, totalH + 2.4, -0.4);
  group.add(sheave);

  // Elevator Car
  var car = new THREE.Group();
  var carW = 2.1, carH = 2.45, carD = 1.8;

  var base = new THREE.Mesh(new THREE.BoxGeometry(carW, 0.12, carD), matSteel);
  car.add(base);

  var top = base.clone();
  top.position.y = carH;
  car.add(top);

  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(p) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.09, carH, 0.09), matSteel);
    post.position.set(p[0] * (carW / 2 - 0.05), carH / 2, p[1] * (carD / 2 - 0.05));
    car.add(post);
  });

  var gz = new THREE.Mesh(new THREE.PlaneGeometry(carW - 0.15, carH - 0.15), matGlass);
  gz.position.set(0, carH / 2, carD / 2);
  car.add(gz);

  var gz2 = gz.clone();
  gz2.position.z = -carD / 2;
  car.add(gz2);

  var gx = new THREE.Mesh(new THREE.PlaneGeometry(carD - 0.15, carH - 0.15), matGlass);
  gx.rotation.y = Math.PI / 2;
  gx.position.set(carW / 2, carH / 2, 0);
  car.add(gx);

  var gx2 = gx.clone();
  gx2.position.x = -carW / 2;
  car.add(gx2);

  var cin = new THREE.Mesh(
    new THREE.BoxGeometry(carW - 0.2, 0.05, carD - 0.2),
    new THREE.MeshStandardMaterial({ color: 0x14161a, metalness: 0.4, roughness: 0.5 })
  );
  cin.position.y = 0.1;
  car.add(cin);

  var lamp = new THREE.Mesh(new THREE.BoxGeometry(carW - 0.7, 0.04, carD - 0.7), matLamp);
  lamp.position.y = carH - 0.12;
  car.add(lamp);

  var carLight = new THREE.PointLight(0xf0f4f6, 0.55, 7);
  carLight.position.set(0, carH - 0.4, 0);
  car.add(carLight);

  var carInd = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.05), matRed);
  carInd.position.set(0, carH + 0.14, carD / 2);
  car.add(carInd);

  var hr = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, carW - 0.5, 10), matSteel);
  hr.rotation.z = Math.PI / 2;
  hr.position.set(0, 0.95, -carD / 2 + 0.14);
  car.add(hr);

  group.add(car);

  // Cables & Counterweight
  var cables = [];
  for (var c = 0; c < 3; c++) {
    var cable = new THREE.Mesh(new THREE.BoxGeometry(0.018, 1, 0.018), matDark);
    cable.position.x = -0.5 + c * 0.5;
    group.add(cable);
    cables.push(cable);
  }

  var cw = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.9, 0.28), matDark);
  cw.position.set(0, totalH, -HZ + 0.25);
  group.add(cw);

  // Ground floor landing doors
  var doorL = new THREE.Mesh(new THREE.BoxGeometry(0.66, 2.35, 0.07), matSteel);
  var doorR = doorL.clone();
  doorL.position.set(-0.34, 1.2, HZ + 0.1);
  doorR.position.set(0.34, 1.2, HZ + 0.1);
  group.add(doorL);
  group.add(doorR);

  // Lights
  scene.add(new THREE.HemisphereLight(0x8fa8bb, 0x14171a, 0.55));
  var key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(6, 10, 9);
  scene.add(key);

  var fill = new THREE.PointLight(0x9db4c4, 0.4, 30);
  fill.position.set(-5, totalH * 0.4, 6);
  scene.add(fill);

  // Animation & Scroll Loop
  var clock = new THREE.Clock();
  var started = false;
  var curFloor = 0;
  var rafId;

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  var sceneRanges = [
    [-0.01, 0.15],
    [0.15, 0.37],
    [0.37, 0.58],
    [0.58, 0.8],
    [0.8, 1.01]
  ];

  function resize() {
    if (!pin || !renderer) return;
    var w = pin.clientWidth || window.innerWidth;
    var h = pin.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  function frame() {
    rafId = requestAnimationFrame(frame);
    var t = clock.getElapsedTime();

    if (!started && t > 0.3) {
      started = true;
      pin.classList.add('hero-in');
    }

    var max = track.offsetHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    // Pause heavy rendering if scrolled way past hero
    if (window.scrollY > track.offsetHeight + window.innerHeight) {
      return;
    }

    var pe = ease(p);

    // Car Travel
    var carBaseY = 1.28;
    var carY = carBaseY + pe * ((FLOORS - 1) * FH);
    car.position.y = carY;
    car.position.x = Math.sin(p * 6.28) * 0.02;

    // Doors animation at start
    var open = Math.min(1, Math.max(0, (t - 0.5) / 1.5));
    doorL.position.x = -0.34 - open * 0.58;
    doorR.position.x = 0.34 + open * 0.58;

    // Cable scaling
    var topY = totalH + 2.2;
    var carTop = carY + carH / 2 + 0.1;
    cables.forEach(function(cb) {
      cb.scale.y = Math.max(0.01, topY - carTop);
      cb.position.y = (topY + carTop) / 2;
      cb.position.z = -HZ + 0.25;
    });

    // Counterweight
    cw.position.y = totalH - pe * totalH + 0.95;

    // Camera
    var cx = pe * 3.6;
    var cy = 2.1 + pe * (carY + 0.6 - 2.1);
    var cz = 5.2 + pe * 3.4;
    camera.position.set(cx + Math.sin(t * 0.3) * 0.05, cy, cz);
    camera.lookAt(pe * 1.2, 1.9 + pe * (carY + 0.4 - 1.9), 0);

    // Floor indicators
    var carFloorF = pe * (FLOORS - 1);
    indicators.forEach(function(indMesh, i) {
      var d = Math.abs(i - carFloorF);
      indMesh.material.emissiveIntensity = d < 0.6 ? 0.95 : 0.1;
    });

    // Captions toggle
    if (scenes && scenes.length >= 5) {
      for (var s = 0; s < 5; s++) {
        if (scenes[s]) {
          scenes[s].classList.toggle('on', p >= sceneRanges[s][0] && p < sceneRanges[s][1]);
        }
      }
    }
    pin.classList.toggle('asc', p > 0.04);

    // Reel and arrow
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

  // Cleanup on unload
  window.addEventListener('beforeunload', function() {
    if (rafId) cancelAnimationFrame(rafId);
    if (renderer) renderer.dispose();
  });

})();
