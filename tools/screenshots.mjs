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
await shoot('collection-flavors-desktop', '/collections/shop', DESKTOP);
await shoot('product-garlic-herb-desktop', '/products/garlic-herb', DESKTOP);
await shoot('product-chili-crisp-mobile', '/products/chili-crisp', MOBILE, { fullPage: true });
await shoot('carton-half-dozen-desktop', '/products/half-dozen', DESKTOP, { fullPage: true });

// build your own, partway filled: 2″ salted, 2 × 1.2″ honey (5 of 6 slots)
await shoot('carton-build-your-own-mobile', '/products/build-your-own', MOBILE, {
  fullPage: true,
  before: () =>
    page.evaluate(() => {
      const plus = (handle, size) =>
        [...document.querySelectorAll('[data-step="1"]')].find((button) => {
          const input = document.getElementById(button.getAttribute('aria-controls'));
          return input.dataset.handle === handle && input.dataset.size.startsWith(size);
        });
      plus('salted', '2').click();
      plus('honey', '1.2').click();
      plus('honey', '1.2').click();
      plus('white-miso', '1.2').click();
    }),
});

// cart with two merged cartons and one loose cube
await page.goto(`${BASE}/products/one-big-four-small`, { waitUntil: 'networkidle2' });
await clearCart();
for (const handle of ['one-big-four-small', 'half-dozen']) {
  await page.goto(`${BASE}/products/${handle}?shot=${Date.now()}`, { waitUntil: 'networkidle2' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('[data-submit]')]);
}
await page.evaluate(async () => {
  const chili = await fetch('/products/chili-crisp.js').then((response) => response.json());
  const small = chili.variants.find((variant) => variant.title.startsWith('1.2'));
  await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: small.id, quantity: 1 }] }),
  });
});
await shoot('cart-desktop', '/cart', DESKTOP, { fullPage: true });

await shoot('about-desktop', '/pages/about', DESKTOP);

await browser.close();
