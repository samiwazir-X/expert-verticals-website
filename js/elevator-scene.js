(function() {
  'use strict';

  var track = document.getElementById('heroTrack');
  var pin = document.getElementById('heroPin');
  var canvas = document.getElementById('heroGL');
  var reel = document.getElementById('floorReel');
  var ldDir = document.getElementById('ldDir');

  if (!track || !pin || !canvas) return;

  var TOTAL_FRAMES = 240;
  var FLOORS = 7; // G, 01, 02, 03, 04, 05, 06

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

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Pre-populate floor indicator if empty
  if (reel && reel.children.length === 0) {
    var labels = ['G', '01', '02', '03', '04', '05', '06'];
    reel.innerHTML = labels.map(function(l) { return '<li>' + l + '</li>'; }).join('');
  }

  // Preload frame storage
  var frameImages = new Array(TOTAL_FRAMES);
  var framesLoadedCount = 0;
  var currentFrameIndex = -1;
  var isInitialFrameReady = false;

  var targetScrollProgress = 0;
  var currentScrollProgress = 0;
  var curFloor = 0;
  var lastDeltaP = 0;

  var rafId = null;
  var isIntersecting = true;
  var isHidden = document.hidden || false;

  var winW = 0;
  var winH = 0;
  var dpr = 1;

  function getFrameUrl(idx) {
    var num = String(idx + 1).padStart(4, '0');
    return 'assets/sequence/frame-' + num + '.webp';
  }

  function resizeCanvas() {
    winW = pin.clientWidth || window.innerWidth;
    winH = ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight) || window.innerHeight || 800;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(winW * dpr);
    canvas.height = Math.round(winH * dpr);
    canvas.style.width = winW + 'px';
    canvas.style.height = winH + 'px';

    if (isInitialFrameReady && currentFrameIndex >= 0) {
      drawCurrentFrame();
    }
  }

  function drawImageCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    var cw = canvas.width;
    var ch = canvas.height;
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;

    var canvasAspect = cw / ch;
    var imgAspect = iw / ih; // 1280 / 720 = 1.777778

    var isMobile = (winW <= 767);
    var isTablet = (winW > 767 && winW <= 1024);

    var drawW, drawH, drawX, drawY;

    if (canvasAspect > imgAspect) {
      // Viewport is wider than 16:9 (e.g. wide desktop screen)
      drawW = cw;
      drawH = cw / imgAspect;
      drawX = 0;
      // Anchor slightly toward top so the elevator cabin (located at upper 20-60%) is never cropped
      drawY = (ch - drawH) * 0.35;
    } else {
      // Viewport is taller than 16:9 (e.g. mobile portrait, tablet portrait)
      drawH = ch;
      drawW = ch * imgAspect;
      drawY = 0;

      if (isMobile) {
        // On mobile, focus on the elevator shaft (around 62% across the source width)
        // Position it so the elevator cabin is centered in the viewport
        drawX = cw * 0.52 - drawW * 0.62;
        // Don't show empty space past right boundary
        if (drawX + drawW < cw) drawX = cw - drawW;
        if (drawX > 0) drawX = 0;
      } else if (isTablet) {
        drawX = cw * 0.55 - drawW * 0.60;
        if (drawX + drawW < cw) drawX = cw - drawW;
        if (drawX > 0) drawX = 0;
      } else {
        // Standard desktop: place elevator in the right portion, text on left
        drawX = cw * 0.50 - drawW * 0.54;
        if (drawX + drawW < cw) drawX = cw - drawW;
        if (drawX > 0) drawX = 0;
      }
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, drawX, drawY, drawW, drawH);
  }

  function getBestAvailableFrame(targetIdx) {
    if (frameImages[targetIdx] && frameImages[targetIdx].complete && frameImages[targetIdx].naturalWidth > 0) {
      return { img: frameImages[targetIdx], idx: targetIdx };
    }

    // Search outward for closest loaded frame
    for (var dist = 1; dist < TOTAL_FRAMES; dist++) {
      var prev = targetIdx - dist;
      if (prev >= 0 && frameImages[prev] && frameImages[prev].complete && frameImages[prev].naturalWidth > 0) {
        return { img: frameImages[prev], idx: prev };
      }
      var next = targetIdx + dist;
      if (next < TOTAL_FRAMES && frameImages[next] && frameImages[next].complete && frameImages[next].naturalWidth > 0) {
        return { img: frameImages[next], idx: next };
      }
    }
    return null;
  }

  function drawCurrentFrame() {
    var best = getBestAvailableFrame(currentFrameIndex >= 0 ? currentFrameIndex : 0);
    if (best && best.img) {
      drawImageCover(best.img);
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

  function renderLoop() {
    rafId = requestAnimationFrame(renderLoop);

    if (isHidden || !isIntersecting) return;

    var smoothing = (winW <= 767) ? 0.16 : 0.12;
    var deltaP = targetScrollProgress - currentScrollProgress;
    currentScrollProgress += deltaP * smoothing;

    if (isNaN(currentScrollProgress)) currentScrollProgress = 0;
    if (Math.abs(currentScrollProgress - targetScrollProgress) < 0.0001) {
      currentScrollProgress = targetScrollProgress;
    }

    var p = currentScrollProgress;

    // Map scroll progress (0..1) to frame index (0..239)
    var targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(p * (TOTAL_FRAMES - 1))));

    if (targetFrame !== currentFrameIndex) {
      currentFrameIndex = targetFrame;
      drawCurrentFrame();
    }

    // UI Updates
    var carFloorF = p * (FLOORS - 1);

    if (scenes && scenes.length >= 5) {
      for (var s = 0; s < 5; s++) {
        if (scenes[s]) {
          var on = (p >= sceneRanges[s][0] && p < sceneRanges[s][1]);
          scenes[s].classList.toggle('on', on);
        }
      }
    }

    pin.classList.toggle('asc', p > 0.03);

    // Floor indicator reel & arrow
    if (reel) {
      var fl = Math.round(carFloorF);
      if (fl !== curFloor) {
        curFloor = fl;
        reel.style.transform = 'translateY(-' + fl + 'em)';
      }
    }

    if (ldDir) {
      if (deltaP > 0.0008) {
        ldDir.classList.remove('down');
        ldDir.classList.add('up');
      } else if (deltaP < -0.0008) {
        ldDir.classList.remove('up');
        ldDir.classList.add('down');
      }
    }
  }

  // Progressive Preloading Engine
  function loadFrame(idx, onReady) {
    if (frameImages[idx]) return;
    var img = new Image();
    img.onload = function() {
      framesLoadedCount++;
      if (Math.abs(idx - currentFrameIndex) <= 1) { drawCurrentFrame(); }
      if (onReady) onReady(img, idx);
    };
    img.onerror = function() {
      // Non-fatal: neighboring frames cover seamlessly
      console.warn('Frame ' + idx + ' load skipped');
    };
    img.src = getFrameUrl(idx);
    frameImages[idx] = img;
  }

  function startPreloading() {
    // Step 1: Load Frame 1 FIRST and render immediately
    loadFrame(0, function(img) {
      isInitialFrameReady = true;
      currentFrameIndex = 0;
      resizeCanvas();
      drawCurrentFrame();

      // Show hero with clean fade-in
      pin.classList.add('hero-in');

      // Step 2: Load keyframes spread across the sequence (every 6th frame)
      // This gives instant scrubbability from 0% to 100% within ~200ms
      var keyframes = [];
      for (var k = 0; k < TOTAL_FRAMES; k += 6) {
        if (k !== 0) keyframes.push(k);
      }
      if (keyframes.indexOf(TOTAL_FRAMES - 1) === -1) {
        keyframes.push(TOTAL_FRAMES - 1);
      }

      var keyframeQueue = keyframes.slice();
      function loadNextKeyframeBatch() {
        if (keyframeQueue.length === 0) {
          loadRemainingFrames();
          return;
        }
        var batch = keyframeQueue.splice(0, 6);
        var loadedInBatch = 0;
        batch.forEach(function(kIdx) {
          loadFrame(kIdx, function() {
            loadedInBatch++;
            if (loadedInBatch === batch.length) {
              loadNextKeyframeBatch();
            }
          });
        });
      }
      loadNextKeyframeBatch();
    });
  }

  function loadRemainingFrames() {
    var remaining = [];
    for (var i = 0; i < TOTAL_FRAMES; i++) {
      if (!frameImages[i]) remaining.push(i);
    }

    var concurrentLimit = 6;
    var activeCount = 0;

    function next() {
      if (remaining.length === 0) return;
      while (activeCount < concurrentLimit && remaining.length > 0) {
        var idx = remaining.shift();
        activeCount++;
        loadFrame(idx, function() {
          activeCount--;
          next();
        });
      }
    }
    next();
  }

  function init() {
    resizeCanvas();
    updateScrollProgress();
    currentScrollProgress = targetScrollProgress;

    startPreloading();

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    document.addEventListener('visibilitychange', function() {
      isHidden = document.hidden || false;
    });

    var resizeTimer;
    window.addEventListener('resize', function() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        resizeCanvas();
        updateScrollProgress();
      }, 120);
    }, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function() {
        resizeCanvas();
        updateScrollProgress();
      });
    }

    renderLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
