// Builds catalog/wicz-craft-products.csv (Shopify product import format) from
// the design guide §8. Prices are 0.00 placeholders; the theme renders them as
// [PRICE]. Ingredients the guide marks unknown stay as [ingredients].
// Run: node catalog/build-csv.mjs
import { writeFileSync } from 'node:fs';
import { cartons } from './cartons.mjs';

const flavors = [
  { handle: 'salted', n: 1, name: 'salted', ground: '#F6E8A4', ink: '#93AEEB', deep: '#3F5BB0',
    ingredients: 'cultured grass-fed cream, sea salt', pairs: 'warm bread, radishes',
    body: 'cultured butter with sea salt. for warm bread, radishes, and most things.' },
  { handle: 'garlic-herb', n: 2, name: 'garlic herb', ground: '#D6EDB8', ink: '#E5583A', deep: '#B23A20',
    ingredients: '[ingredients]', pairs: 'steak, potatoes, the end of the loaf',
    body: 'cultured butter with roasted garlic and fresh herbs. for steak, potatoes, and the end of the loaf.' },
  { handle: 'honey', n: 3, name: 'honey', ground: '#FFD8A8', ink: '#D93B8C', deep: '#A51E63',
    ingredients: 'cultured grass-fed cream, honey, sea salt', pairs: 'toast, biscuits, cornbread',
    body: 'cultured butter with honey and a little salt. for toast, biscuits, and cornbread.' },
  { handle: 'white-miso', n: 4, name: 'white miso', ground: '#E2D4F7', ink: '#2F8F55', deep: '#1F6B3E',
    ingredients: '[ingredients]', pairs: 'corn, mushrooms, rice',
    body: 'cultured butter with white miso. for corn, mushrooms, and rice.' },
  // deep is #FF9147, not the guide's #FF8A3D: 4.62:1 on oxblood vs 4.41:1 (AA for small text)
  { handle: 'chili-crisp', n: 5, name: 'chili crisp', ground: '#7A1E1E', ink: '#FF8A3D', deep: '#FF9147',
    ingredients: '[ingredients]', pairs: 'eggs, noodles, dumplings',
    body: 'cultured butter with chili crisp. for eggs, noodles, and dumplings.' },
];

const sizes = [
  { value: '2″ cube', sku: '2IN' },
  { value: '1.2″ cube', sku: '12IN' },
];

const headers = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams',
  'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping',
  'Variant Taxable', 'Status',
  'Flavor number (product.metafields.custom.flavor_number)',
  'Color ground (product.metafields.custom.color_ground)',
  'Color ink (product.metafields.custom.color_ink)',
  'Color deep (product.metafields.custom.color_deep)',
  'Ingredients (product.metafields.custom.ingredients)',
  'Pairs with (product.metafields.custom.pairs_with)',
];
// Not in the CSV on purpose: the carton template suffix and the JSON
// custom.carton_config. Shopify's import ignores both; they're set by
// app/wicz-craft-cartons/scripts/seed-store.mjs after importing.

const rows = [];
for (const f of flavors) {
  sizes.forEach((size, i) => {
    const first = i === 0;
    rows.push({
      'Handle': f.handle,
      'Title': first ? `nº ${f.n} ${f.name}` : '',
      'Body (HTML)': first ? `<p><strong>nº ${f.n} ${f.name}.</strong> ${f.body}</p>` : '',
      'Vendor': first ? 'Wicz Craft' : '',
      'Type': first ? 'butter' : '',
      'Tags': first ? 'flavor' : '',
      'Published': first ? 'TRUE' : '',
      'Option1 Name': first ? 'size' : '',
      'Option1 Value': size.value,
      'Variant SKU': `WC-${String(f.n).padStart(2, '0')}-${size.sku}`,
      'Variant Grams': '0',
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': '100',
      'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': '0.00',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Status': first ? 'active' : '',
      'Flavor number (product.metafields.custom.flavor_number)': first ? String(f.n) : '',
      'Color ground (product.metafields.custom.color_ground)': first ? f.ground : '',
      'Color ink (product.metafields.custom.color_ink)': first ? f.ink : '',
      'Color deep (product.metafields.custom.color_deep)': first ? f.deep : '',
      'Ingredients (product.metafields.custom.ingredients)': first ? f.ingredients : '',
      'Pairs with (product.metafields.custom.pairs_with)': first ? f.pairs : '',
    });
  });
}

for (const c of cartons) {
  rows.push({
    'Handle': c.handle,
    'Title': c.title,
    'Body (HTML)': `<p><strong>${c.title}.</strong> ${c.body}</p>`,
    'Vendor': 'Wicz Craft',
    'Type': 'carton',
    'Tags': 'carton',
    'Published': 'TRUE',
    'Option1 Name': 'Title',
    'Option1 Value': 'Default Title',
    'Variant SKU': `WC-CTN-${c.handle.toUpperCase()}`,
    'Variant Grams': '0',
    // the carton itself is not stocked; each cube inside is
    'Variant Inventory Tracker': '',
    'Variant Inventory Qty': '',
    'Variant Inventory Policy': 'continue',
    'Variant Fulfillment Service': 'manual',
    'Variant Price': '0.00',
    'Variant Requires Shipping': 'TRUE',
    'Variant Taxable': 'TRUE',
    'Status': 'active',
    'Color ground (product.metafields.custom.color_ground)': c.pair[0],
    'Color ink (product.metafields.custom.color_ink)': c.pair[1],
    'Color deep (product.metafields.custom.color_deep)': c.pair[2],
  });
}

const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h] ?? '')).join(','))].join('\n') + '\n';
writeFileSync(new URL('./wicz-craft-products.csv', import.meta.url), csv);
console.log(`wrote ${rows.length} rows`);
