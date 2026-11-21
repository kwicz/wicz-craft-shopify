// Captures README screenshots from the local theme preview.
//
// Needs `shopify theme dev` running (http://127.0.0.1:9292) and Google Chrome.
// Uses puppeteer-core, which drives the installed Chrome instead of
// downloading one:
//   npm i --no-save puppeteer-core
//   node tools/screenshots.mjs
//
// Writes JPEGs to docs/screenshots/.
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:9292';
const OUT = new URL('../docs/screenshots/', import.meta.url);
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DESKTOP = { width: 1280, height: 860 };
const MOBILE = { width: 375, height: 812, isMobile: true, hasTouch: true };

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();

/** Settles the page: fonts loaded, reveal-on-scroll animations finished, Shopify preview bar hidden. */
async function settle() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    document
      .querySelectorAll('.scroll-trigger')
      .forEach((el) => el.classList.remove('scroll-trigger', 'animate--slide-in', 'animate--fade-in'));
    const style = document.createElement('style');
    style.textContent = '#preview-bar-iframe, #PBarNextFrameWrapper, [id^="shopify-pc__banner"] { display: none !important; }';
    document.head.append(style);
  });
  await new Promise((resolve) => setTimeout(resolve, 600));
}

async function shoot(name, path, viewport, { fullPage = false, before } = {}) {
  await page.setViewport({ ...viewport, deviceScaleFactor: viewport.isMobile ? 2 : 1 });
  // a fresh query string avoids Shopify serving a cached render for another viewport
  await page.goto(`${BASE}${path}${path.includes('?') ? '&' : '?'}shot=${Date.now()}`, { waitUntil: 'networkidle2' });
  await settle();
  if (before) await before();
  await page.screenshot({ path: new URL(`${name}.jpg`, OUT), type: 'jpeg', quality: 82, fullPage });
  console.log(`saved ${name}.jpg`);
}

const clearCart = () => page.evaluate(() => fetch('/cart/clear.js', { method: 'POST' }));

// --- pages ---
await shoot('home-desktop', '/', DESKTOP, { fullPage: true });
await shoot('home-mobile', '/', MOBILE, { fullPage: true });
await shoot('collection-flavors-desktop', '/collections/shop', DESKTOP, { fullPage: true });
await shoot('product-smoked-sea-salt-mobile', '/products/smoked-sea-salt', MOBILE, { fullPage: true });
await shoot('flight-desktop', '/products/classics-holiday', DESKTOP);

// the builder partway filled: one big, four small, unsalted + caesar × 2 + honey (4 of 5)
const fillBox = () =>
  page.evaluate(() => {
    [...document.querySelectorAll('.wicz-format__input')].find((input) => input.dataset.format === 'one-big-four-small').click();
    document.querySelector('.wicz-big-choice__input[value="unsalted"]').click();
    for (const handle of ['caesar', 'caesar', 'honey']) document.querySelector(`[data-add="${handle}"]`).click();
  });
await shoot('box-builder-desktop', '/products/build-a-box', DESKTOP, { before: fillBox });
await shoot('box-builder-mobile', '/products/build-a-box', MOBILE, { before: fillBox });

// cart: a box, a flight, and a single
await page.setViewport({ ...DESKTOP, deviceScaleFactor: 1 });
await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle2' });
await clearCart();
await page.goto(`${BASE}/products/build-a-box?shot=${Date.now()}`, { waitUntil: 'networkidle2' });
await fillBox();
await page.evaluate(() => document.querySelector('[data-add="white-miso"]').click());
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('[data-submit]')]);
await page.goto(`${BASE}/products/classics-culinary?shot=${Date.now()}`, { waitUntil: 'networkidle2' });
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('.wicz-flight__form button')]);
await page.evaluate(async () => {
  const product = await fetch('/products/chili-crisp.js').then((response) => response.json());
  const small = product.variants.find((variant) => variant.title === '2 oz');
  await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: small.id, quantity: 1 }] }),
  });
});
await shoot('cart-desktop', '/cart', DESKTOP, { fullPage: true });

await shoot('about-desktop', '/pages/about', DESKTOP);

await browser.close();
