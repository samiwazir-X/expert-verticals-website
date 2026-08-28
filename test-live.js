const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.setViewport({ width: 1200, height: 800 });
  console.log('Navigating to live site...');
  await page.goto('https://samiwazir-x.github.io/expert-verticals-website/', { waitUntil: 'networkidle0' });
  
  console.log('Evaluating specific variables...');
  const state = await page.evaluate(() => {
    return {
      hasNo3dClass: document.body.classList.contains('no3d'),
      canvasExists: !!document.getElementById('heroGL'),
      pinHeight: document.getElementById('heroPin') ? document.getElementById('heroPin').clientHeight : -1,
      trackHeight: document.getElementById('heroTrack') ? document.getElementById('heroTrack').offsetHeight : -1,
      navHeight: document.getElementById('nav') ? document.getElementById('nav').offsetHeight : -1,
      s1Visible: window.getComputedStyle(document.querySelector('.hero-s.s1')).opacity
    };
  });
  console.log('State:', state);
  
  await browser.close();
})();
