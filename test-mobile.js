const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  // iPhone 13 Pro Max viewport
  await page.setViewport({ width: 428, height: 926, isMobile: true, hasTouch: true });
  console.log('Navigating to live site...');
  await page.goto('https://samiwazir-x.github.io/expert-verticals-website/', { waitUntil: 'networkidle0' });
  
  console.log('Evaluating specific variables...');
  const state = await page.evaluate(() => {
    return {
      hasNo3dClass: document.body.classList.contains('no3d'),
      pinHeight: document.getElementById('heroPin') ? document.getElementById('heroPin').clientHeight : -1,
      trackHeight: document.getElementById('heroTrack') ? document.getElementById('heroTrack').offsetHeight : -1,
      s1Opacity: window.getComputedStyle(document.querySelector('.hero-s.s1')).opacity,
      rendererExists: typeof renderer !== 'undefined' && !!renderer,
      isWebGL2: document.createElement('canvas').getContext('webgl2') !== null,
      isWebGL: document.createElement('canvas').getContext('webgl') !== null
    };
  });
  console.log('State:', state);
  
  await browser.close();
})();
