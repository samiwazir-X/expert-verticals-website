const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0' });
  
  // Wait a moment and then scroll
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    window.scrollBy(0, 1000);
  });
  await page.waitForTimeout(500);
  
  await browser.close();
})();
