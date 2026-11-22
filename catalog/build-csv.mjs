// Builds catalog/wicz-craft-products.csv (Shopify product import format)
// from catalog/catalog.mjs (design guide §8).
// Run: node catalog/build-csv.mjs
//
// The CSV is for importing into a fresh store by hand. Shopify's import
// skips list metafields and template suffixes, so the flight contents and
// the `box` / `flight` templates are set by
// app/wicz-craft-cartons/scripts/seed-store.mjs, which also loads the whole
// catalog through the Admin API without this file.
import { writeFileSync } from 'node:fs';
import { flavors, SIZES, PRICES, box, formats, flights } from './catalog.mjs';

const MF = {
  ground: 'Color ground (product.metafields.custom.color_ground)',
  ink: 'Color ink (product.metafields.custom.color_ink)',
  deep: 'Color deep (product.metafields.custom.color_deep)',
  fold: 'Color fold (product.metafields.custom.color_fold)',
  seasonal: 'Seasonal (product.metafields.custom.seasonal)',
  tier: 'Price tier (product.metafields.custom.price_tier)',
  ingredients: 'Ingredients (product.metafields.custom.ingredients)',
  pairs: 'Pairs with (product.metafields.custom.pairs_with)',
  allergens: 'Allergens (product.metafields.custom.allergens)',
  bestWithin: 'Best within (product.metafields.custom.best_within)',
};

const headers = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams',
  'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Status',
  ...Object.values(MF),
];

const colorColumns = (c) => ({ [MF.ground]: c.ground, [MF.ink]: c.ink, [MF.deep]: c.deep, [MF.fold]: c.fold });
const sku = (...parts) => ['WC', ...parts].join('-').toUpperCase();
const base = {
  'Vendor': 'Wicz Craft',
  'Published': 'TRUE',
  'Variant Grams': '0',
  'Variant Fulfillment Service': 'manual',
  'Variant Requires Shipping': 'TRUE',
  'Variant Taxable': 'TRUE',
  'Status': 'active',
};
// only the first row of a product carries product-level columns
const variantOnly = (row) =>
  Object.fromEntries(Object.entries(row).filter(([key]) => key === 'Handle' || key.startsWith('Variant') || key === 'Option1 Value'));

const rows = [];

for (const f of flavors) {
  [SIZES.big, SIZES.small].forEach((size, i) => {
    const row = {
      ...base,
      'Handle': f.handle,
      'Title': f.name,
      'Body (HTML)': `<p><strong>${f.name}.</strong> ${f.body}</p>`,
      'Type': 'butter',
      'Tags': ['flavor', f.seasonal ? 'holiday' : ''].filter(Boolean).join(', '),
      'Option1 Name': 'size',
      'Option1 Value': size,
      'Variant SKU': sku(f.handle, size.replace(' ', '')),
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': '100',
      'Variant Inventory Policy': 'deny',
      'Variant Price': PRICES[f.tier][size],
      ...colorColumns(f),
      [MF.seasonal]: String(f.seasonal),
      [MF.tier]: f.tier,
      [MF.ingredients]: f.ingredients,
      [MF.pairs]: f.pairs,
      [MF.allergens]: f.allergens,
      [MF.bestWithin]: f.bestWithin,
    };
    rows.push(i === 0 ? row : variantOnly(row));
  });
}

formats.forEach((format, i) => {
  const row = {
    ...base,
    'Handle': box.handle,
    'Title': box.title,
    'Body (HTML)': `<p>${box.body}</p>`,
    'Type': 'box',
    'Tags': 'box',
    'Option1 Name': 'format',
    'Option1 Value': format.title,
    'Variant SKU': sku('box', format.key),
    // the box isn't stocked; the butters inside are
    'Variant Inventory Tracker': '',
    'Variant Inventory Policy': 'continue',
    'Variant Price': format.price,
    ...colorColumns(box.colors),
    [MF.seasonal]: 'false',
    [MF.allergens]: 'contains: milk. see each butter.',
  };
  rows.push(i === 0 ? row : variantOnly(row));
});

for (const flight of flights) {
  rows.push({
    ...base,
    'Handle': flight.handle,
    'Title': flight.title,
    'Body (HTML)': `<p><strong>${flight.title}.</strong> ${flight.body}</p>`,
    'Type': 'flight',
    'Tags': ['flight', flight.seasonal ? 'holiday' : ''].filter(Boolean).join(', '),
    'Option1 Name': 'Title',
    'Option1 Value': 'Default Title',
    'Variant SKU': sku('flight', flight.handle),
    'Variant Inventory Tracker': '',
    'Variant Inventory Policy': 'continue',
    'Variant Price': flight.price,
    ...colorColumns(flight.colors),
    [MF.seasonal]: String(flight.seasonal),
    [MF.allergens]: flight.allergens,
    [MF.bestWithin]: flight.bestWithin,
  });
}

const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h] ?? '')).join(','))].join('\n') + '\n';
writeFileSync(new URL('./wicz-craft-products.csv', import.meta.url), csv);
console.log(`wrote ${rows.length} rows`);
