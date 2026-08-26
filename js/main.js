/**
 * EXPERT VERTICALS — PRODUCTION JAVASCRIPT
 * Interactions, Form Validation, ARIA Accessibility, Interactive Modules & Analytics
 */
(function() {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ TOAST NOTIFICATION SYSTEM ============ */
  var toastEl = document.getElementById('toast');
  var toastMsg = document.getElementById('toastMsg');
  var toastTimer;

  function showToast(msg) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toastEl.classList.remove('show');
    }, 4500);
  }
  window.showToast = showToast;

  /* ============ ANALYTICS EVENT TRACKING ============ */
  function trackEvent(eventName, eventDetails) {
    // Dispatch custom event for Google Analytics / GTM / Plausible
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({
        event: eventName,
        eventDetails: eventDetails || {}
      });
    }
    // Debug log in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Analytics Event]', eventName, eventDetails);
    }
  }
  window.trackEvent = trackEvent;

  /* ============ NAVIGATION & MOBILE MENU ============ */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (mnav) mnav.setAttribute('aria-hidden', 'true');
  }

  function openMenu() {
    document.body.classList.add('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    if (mnav) mnav.setAttribute('aria-hidden', 'false');
  }

  if (burger && mnav) {
    burger.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = document.body.classList.contains('menu-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mnav.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
        if (burger) burger.focus();
      }
    });
  }

  /* ============ REVEAL ON SCROLL ============ */
  if ('IntersectionObserver' in window) {
    var rvIO = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          rvIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.rv').forEach(function(el) {
      if (reduceMotion) {
        el.classList.add('in');
      } else {
        rvIO.observe(el);
      }
    });
  } else {
    document.querySelectorAll('.rv').forEach(function(el) {
      el.classList.add('in');
    });
  }

  /* ============ ACTIVE SECTION SPY & FLOOR NAVIGATOR ============ */
  var secIds = ['intro', 'about', 'solutions', 'coordinate', 'sectors', 'engineering', 'service', 'institutional', 'contact'];
  var darkIds = ['engineering', 'contact'];

  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        document.querySelectorAll('[data-sec]').forEach(function(a) {
          var isMatch = a.getAttribute('data-sec') === id;
          a.classList.toggle('act', isMatch);
          if (isMatch) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });

        var isDarkSection = darkIds.indexOf(id) !== -1 || (id === 'intro' && window.scrollY < window.innerHeight * 3.5);
        document.body.classList.toggle('on-dark', isDarkSection);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    secIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) secIO.observe(el);
    });
  }

  /* ============ SOLUTIONS INTERACTIVE TABS ============ */
  var solutionsData = [
    {
      name: 'Passenger Elevators',
      desc: 'High-efficiency traction and hydraulic systems for apartment towers, corporate headquarters, commercial office complexes, luxury hotels, educational campuses and mixed-use developments.',
      env: ['Residential Towers & Apartments', 'Corporate Offices & Headquarters', 'Commercial Complexes & Mixed-Use', 'Hotels & Hospitality Properties']
    },
    {
      name: 'Hospital / Bed Elevators',
      desc: 'Engineered specifically for critical healthcare environments with extended cabin dimensions for hospital beds/stretchers, ultra-smooth leveling, emergency priority controls, and antibacterial finishes.',
      env: ['Public & Private Hospitals', 'Specialized Medical Clinics', 'Diagnostic & Surgical Centres', 'Rehabilitation Facilities']
    },
    {
      name: 'Goods / Freight Lifts',
      desc: 'Heavy-duty vertical transportation engineered for manufacturing plants, industrial warehouses, distribution centres, shopping malls and back-of-house logistical operations.',
      env: ['Industrial Factories & Plants', 'Warehouses & Logistics Hubs', 'Retail Complexes & Superstores', 'Commercial Production Facilities']
    },
    {
      name: 'Service Lifts',
      desc: 'Dedicated staff and utility elevators designed for hotels, commercial towers and institutional facilities to separate guest circulation from facility maintenance and housekeeping.',
      env: ['Hotels & Resorts', 'Corporate Headquarters', 'Large Institutional Facilities', 'Convention & Exhibition Centres']
    },
    {
      name: 'Home / Residential Lifts',
      desc: 'Compact, quiet and architectural private home elevators engineered for villas, duplexes and bungalows, offering minimal pit and headroom requirements without machine rooms.',
      env: ['Private Luxury Villas & Houses', 'Duplex Residences', 'Multi-Generational Homes', 'Low-Rise Residential Units']
    },
    {
      name: 'Panoramic / Scenic Elevators',
      desc: 'Custom glass cabin elevators designed as prominent architectural focal points for modern shopping malls, landmark hotels, corporate atriums and viewing towers.',
      env: ['Shopping Malls & Retail Atriums', 'Landmark Corporate Towers', 'Luxury Hotel Lobbies', 'Public Cultural Facilities']
    },
    {
      name: 'Dumbwaiters',
      desc: 'Compact electric vertical conveyors for rapid, sanitary transport of food, tableware, laboratory samples, pharmaceuticals, office documents and small packages.',
      env: ['Fine-Dining Restaurants & Cafeterias', 'Hospitals & Medical Labs', 'Hotels & Room Service Hubs', 'Multi-Story Corporate Offices']
    },
    {
      name: 'Accessibility / Platform Solutions',
      desc: 'Vertical platform lifts and accessibility solutions providing barrier-free access for wheelchair users and individuals with reduced mobility in compliance with accessibility codes.',
      env: ['Public Buildings & Civic Centres', 'Educational Campuses', 'Community & Religious Facilities', 'Commercial Entrances']
    }
  ];

  var iconsSVG = [
    '<svg viewBox="0 0 54 64"><rect x="12" y="6" width="30" height="48"/><line x1="27" y1="14" x2="27" y2="44"/><circle cx="27" cy="30" r="11"/><path d="M27 24v12M22 29h10"/></svg>',
    '<svg viewBox="0 0 54 64"><rect x="12" y="6" width="30" height="48"/><line x1="27" y1="12" x2="27" y2="52"/><path d="M17 22h8M17 30h8M17 38h8M36 22h2M36 30h2M36 38h2"/></svg>',
    '<svg viewBox="0 0 54 64"><rect x="8" y="10" width="38" height="44"/><line x1="27" y1="10" x2="27" y2="54"/><path d="M15 20h6M33 20h6M15 54v6M39 54v6"/></svg>',
    '<svg viewBox="0 0 54 64"><rect x="14" y="6" width="26" height="52"/><line x1="27" y1="12" x2="27" y2="50"/><circle cx="22" cy="20" r="1.6"/><circle cx="32" cy="20" r="1.6"/><circle cx="22" cy="28" r="1.6"/><circle cx="32" cy="28" r="1.6"/></svg>',
    '<svg viewBox="0 0 54 64"><path d="M10 58L22 8h10l12 50"/><line x1="27" y1="12" x2="27" y2="54"/></svg>',
    '<svg viewBox="0 0 54 64"><rect x="14" y="6" width="26" height="52"/><path d="M20 54L26 12h2l6 42"/><line x1="10" y1="2" x2="10" y2="62"/></svg>',
    '<svg viewBox="0 0 54 64"><rect x="18" y="20" width="18" height="24"/><line x1="18" y1="32" x2="36" y2="32"/><line x1="27" y1="20" x2="27" y2="44"/><path d="M22 44v14M32 44v14"/></svg>',
    '<svg viewBox="0 0 54 64"><rect x="10" y="14" width="34" height="30"/><path d="M10 34h34M27 14v30"/><path d="M18 52v8M36 52v8M12 60h30"/></svg>'
  ];

  var solList = document.getElementById('solList');
  var spTitle = document.getElementById('spTitle');
  var spDesc = document.getElementById('spDesc');
  var spEnv = document.getElementById('spEnv');
  var spNo = document.getElementById('spNo');
  var spIcon = document.getElementById('spIcon');

  if (solList && spTitle) {
    var arrowSvg = '<svg class="ic ic-st i-arrow" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>';
    solutionsData.forEach(function(s, i) {
      var btn = document.createElement('button');
      btn.className = 'sol-row';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('id', 'tab-sol-' + i);
      btn.setAttribute('aria-controls', 'panel-sol');
      btn.dataset.i = i;
      btn.innerHTML = '<span class="sol-doors" aria-hidden="true"><i></i><i></i></span><span class="sol-no">' + String(i + 1).padStart(2, '0') + '</span><span class="sol-name">' + s.name + '</span>' + arrowSvg;
      solList.appendChild(btn);
    });

    function setSol(i) {
      var s = solutionsData[i];
      if (!s) return;
      solList.querySelectorAll('.sol-row').forEach(function(r, k) {
        var active = k === i;
        r.classList.toggle('active', active);
        r.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (spNo) spNo.textContent = 'S/' + String(i + 1).padStart(2, '0');
      spTitle.textContent = s.name;
      spDesc.textContent = s.desc;
      if (spIcon) spIcon.innerHTML = iconsSVG[i] || '';
      if (spEnv) {
        spEnv.innerHTML = s.env.map(function(e) {
          return '<li><svg class="ic ic-st" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>' + e + '</li>';
        }).join('');
      }
    }

    solList.addEventListener('click', function(e) {
      var r = e.target.closest('.sol-row');
      if (r) {
        setSol(+r.dataset.i);
        trackEvent('solution_tab_clicked', { solution: solutionsData[+r.dataset.i].name });
      }
    });

    solList.addEventListener('mouseover', function(e) {
      var r = e.target.closest('.sol-row');
      if (r) setSol(+r.dataset.i);
    });

    solList.addEventListener('keydown', function(e) {
      var r = e.target.closest('.sol-row');
      if (!r) return;
      var cur = +r.dataset.i;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        var next = (cur + 1) % solutionsData.length;
        var nextBtn = solList.querySelector('[data-i="' + next + '"]');
        if (nextBtn) { nextBtn.focus(); setSol(next); }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var prev = (cur - 1 + solutionsData.length) % solutionsData.length;
        var prevBtn = solList.querySelector('[data-i="' + prev + '"]');
        if (prevBtn) { prevBtn.focus(); setSol(prev); }
      }
    });

    setSol(0);
  }

  /* ============ SECTORS REDIRECT / SCROLL ============ */
  document.querySelectorAll('.sector').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var href = btn.dataset.href;
      if (href) {
        var target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        } else {
          window.location.href = href;
        }
      }
    });
  });

  /* ============ LIFECYCLE STAGES SCROLL OBSERVER ============ */
  var stages = document.querySelectorAll('.stage');
  var pdReel = document.getElementById('pdReel');
  var procBar = document.getElementById('procBar');
  var procCap = document.getElementById('procCap');
  var stageCaps = [
    'Requirement <span>Assessment</span>',
    'Technical <span>Planning</span>',
    'Equipment <span>Sourcing</span>',
    'Shop Drawing &amp; Site <span>Coordination</span>',
    'Delivery &amp; <span>Installation</span>',
    'Testing &amp; <span>Commissioning</span>',
    'Training &amp; <span>Documentation</span>',
    'Maintenance &amp; <span>Lifecycle</span>'
  ];

  function setStage(i) {
    stages.forEach(function(s, k) { s.classList.toggle('on', k === i); });
    if (pdReel) pdReel.style.transform = 'translateY(-' + (i * 100) + '%)';
    if (procBar) procBar.style.height = ((i / (stages.length - 1)) * 100) + '%';
    if (procCap) procCap.innerHTML = stageCaps[i] || '';
  }

  if (stages.length > 0 && 'IntersectionObserver' in window) {
    var stIO = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setStage([].indexOf.call(stages, entry.target));
        }
      });
    }, { threshold: 0.55 });
    stages.forEach(function(s) { stIO.observe(s); });
  }

  /* ============ ENGINEERING SCHEMATIC INSPECTOR ============ */
  var partsData = {
    overhead: {
      n: 'Machine / Drive Arrangement',
      d: 'The traction machine, permanent magnet synchronous gearless motor or hydraulic power unit that drives elevator movement — engineered for energy efficiency, silent operation, and long service life.'
    },
    rails: {
      n: 'Guide Rails',
      d: 'Precision cold-drawn steel T-profile guide rails securely anchored to shaft walls to ensure smooth vertical travel of the cabin and counterweight with minimal vibration.'
    },
    control: {
      n: 'Microprocessor Control System',
      d: 'Advanced VVVF (Variable Voltage Variable Frequency) controller managing motion profiles, collective dispatching, door operations, passenger safety interlocks, and emergency rescue logic.'
    },
    car: {
      n: 'Elevator Cabin / Car',
      d: 'The passenger or freight enclosure constructed with rigid steel frames, vibration dampers, architectural finishes, LED ceiling illumination, and integrated Car Operating Panels (COP).'
    },
    cw: {
      n: 'Counterweight Assembly',
      d: 'Engineered balance assembly balancing the dead weight of the car plus 40–50% of rated passenger capacity, significantly reducing motor work and electrical energy consumption.'
    },
    landing: {
      n: 'Landing Doors & Interlocks',
      d: 'Heavy-gauge steel landing doors fitted with fail-safe electromechanical door interlocks and infrared curtain sensors to prevent door closure on arriving passengers.'
    },
    pit: {
      n: 'Elevator Pit & Buffers',
      d: 'The structural space below the lowest terminal floor housing energy-absorbing polyurethane or oil buffers, safety gear clearances, and water-sealed pit infrastructure.'
    },
    shaft: {
      n: 'Hoistway / Shaft Infrastructure',
      d: 'The vertical building shaft coordinating plumb tolerances, dividing beams, ventilation requirements, lighting, and electrical interfaces with civil and architectural structures.'
    }
  };

  var partList = document.getElementById('partList');
  var schem = document.getElementById('schem');
  var piTitle = document.getElementById('piTitle');
  var piDesc = document.getElementById('piDesc');

  if (partList && schem) {
    Object.keys(partsData).forEach(function(k, i) {
      var li = document.createElement('li');
      li.dataset.part = k;
      li.innerHTML = '<button type="button"><i>CP/' + String(i + 1).padStart(2, '0') + '</i>' + partsData[k].n + '</button>';
      partList.appendChild(li);
    });

    function setPart(k) {
      var data = partsData[k];
      if (!data) return;
      schem.classList.add('sel');
      schem.querySelectorAll('.part').forEach(function(p) {
        p.classList.toggle('on', p.dataset.part === k);
      });
      partList.querySelectorAll('li').forEach(function(li) {
        li.classList.toggle('on', li.dataset.part === k);
      });
      if (piTitle) piTitle.textContent = data.n;
      if (piDesc) piDesc.textContent = data.d;
    }

    partList.addEventListener('click', function(e) {
      var b = e.target.closest('button');
      if (b) setPart(b.parentElement.dataset.part);
    });

    partList.addEventListener('mouseover', function(e) {
      var b = e.target.closest('button');
      if (b) setPart(b.parentElement.dataset.part);
    });

    schem.querySelectorAll('.part').forEach(function(p) {
      p.addEventListener('mouseenter', function() { setPart(p.dataset.part); });
      p.addEventListener('click', function() { setPart(p.dataset.part); });
    });

    setPart('car');
  }

  /* ============ BEFORE / AFTER MODERNIZATION SLIDER ============ */
  var baSlider = document.getElementById('baSlider');
  var baHandle = document.getElementById('baHandle');

  if (baSlider && baHandle) {
    var baNew = baSlider.querySelector('.ba-new');
    var baLine = baSlider.querySelector('.ba-line');
    var baValue = 50;
    var baDragging = false;

    function baSet(val) {
      baValue = Math.max(0, Math.min(100, val));
      if (baNew) baNew.style.clipPath = 'inset(0 0 0 ' + baValue + '%)';
      if (baLine) baLine.style.left = baValue + '%';
      baHandle.style.left = baValue + '%';
      baHandle.setAttribute('aria-valuenow', Math.round(baValue));
    }

    function baFromPointer(e) {
      var rect = baSlider.getBoundingClientRect();
      var clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      var pos = ((clientX - rect.left) / rect.width) * 100;
      baSet(pos);
    }

    baSlider.addEventListener('pointerdown', function(e) {
      baDragging = true;
      baFromPointer(e);
    });

    window.addEventListener('pointermove', function(e) {
      if (baDragging) {
        e.preventDefault();
        baFromPointer(e);
      }
    });

    window.addEventListener('pointerup', function() {
      baDragging = false;
    });

    baHandle.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        baSet(baValue - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        baSet(baValue + 5);
      } else if (e.key === 'Home') {
        e.preventDefault();
        baSet(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        baSet(100);
      }
    });

    baSet(50);
  }

  /* ============ FAQ ACCORDIONS ============ */
  document.querySelectorAll('.faq-item').forEach(function(item) {
    var q = item.querySelector('.faq-q');
    if (q) {
      q.addEventListener('click', function() {
        var isOpen = item.classList.toggle('open');
        q.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  });

  /* ============ RFQ / BOQ & ENQUIRY FORMS ============ */
  var rfqForms = document.querySelectorAll('form.rfq, form[data-rfq="true"]');

  rfqForms.forEach(function(form) {
    var fileInput = form.querySelector('input[type="file"]');
    var fileNameSpan = form.querySelector('.filebtn span, #fileName');

    if (fileInput && fileNameSpan) {
      fileInput.addEventListener('change', function() {
        var file = fileInput.files[0];
        if (file) {
          // File size limit: 10 MB (10 * 1024 * 1024 bytes)
          if (file.size > 10 * 1024 * 1024) {
            showToast('File exceeds 10 MB limit. Please compress or email to info@theexpert.pk');
            fileInput.value = '';
            fileNameSpan.textContent = 'Choose file…';
            return;
          }
          // File extensions check
          var allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
          var name = file.name.toLowerCase();
          var isAllowed = allowed.some(function(ext) { return name.endsWith(ext); });
          if (!isAllowed) {
            showToast('Invalid file format. Please upload PDF, DOCX, or XLSX.');
            fileInput.value = '';
            fileNameSpan.textContent = 'Choose file…';
            return;
          }
          fileNameSpan.textContent = file.name;
          trackEvent('boq_file_attached', { fileName: file.name, size: file.size });
        } else {
          fileNameSpan.textContent = 'Choose file…';
        }
      });
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var isValid = true;

      // Validate required inputs
      form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function(input) {
        var fg = input.closest('.fg') || input.parentElement;
        var val = input.value.trim();
        var bad = false;

        if (input.type === 'checkbox') {
          bad = !input.checked;
        } else if (input.type === 'email') {
          bad = !val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        } else {
          bad = !val;
        }

        if (fg) fg.classList.toggle('err', bad);
        if (bad) isValid = false;
      });

      if (!isValid) {
        showToast('Please complete all required fields correctly.');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'SUBMITTING...';
      }

      trackEvent('rfq_form_submitted', {
        page: window.location.pathname,
        name: (form.querySelector('[name="name"]') || {}).value || '',
        org: (form.querySelector('[name="org"]') || {}).value || '',
        email: (form.querySelector('[name="email"]') || {}).value || ''
      });

      // Simulate transmission with complete feedback
      setTimeout(function() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
        form.reset();
        if (fileNameSpan) fileNameSpan.textContent = 'Choose file…';
        form.querySelectorAll('.fg.err').forEach(function(f) { f.classList.remove('err'); });

        showToast('Thank You. Your enquiry has been received. The Expert Verticals team will review and respond shortly.');
      }, 1000);
    });
  });

  /* ============ COOKIE CONSENT BANNER ============ */
  var cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) {
    var consentChoice = localStorage.getItem('ev_cookie_consent');
    if (!consentChoice) {
      setTimeout(function() {
        cookieBanner.classList.add('show');
      }, 1200);
    }

    var acceptBtn = cookieBanner.querySelector('.cookie-accept');
    var declineBtn = cookieBanner.querySelector('.cookie-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        localStorage.setItem('ev_cookie_consent', 'accepted');
        cookieBanner.classList.remove('show');
        trackEvent('cookies_accepted');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function() {
        localStorage.setItem('ev_cookie_consent', 'declined');
        cookieBanner.classList.remove('show');
        trackEvent('cookies_declined');
      });
    }
  }

  /* ============ FOOTER COPYRIGHT YEAR ============ */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ============ OUTBOUND & TELEPHONE CLICKS TRACKING ============ */
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a) {
    a.addEventListener('click', function() {
      trackEvent('phone_click', { number: a.getAttribute('href') });
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(function(a) {
    a.addEventListener('click', function() {
      trackEvent('email_click', { email: a.getAttribute('href') });
    });
  });

  document.querySelectorAll('a[href*="maps.google"], a[href*="goo.gl/maps"]').forEach(function(a) {
    a.addEventListener('click', function() {
      trackEvent('directions_click', { url: a.getAttribute('href') });
    });
  });

})();
