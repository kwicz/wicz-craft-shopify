// Loads the wicz craft catalog (catalog/catalog.mjs) and the store setup the
// theme expects, through the Admin API:
//   1. product metafield definitions (custom.*)
//   2. products: 12 flavors (8 oz / 2 oz), "build a box" (one variant per
//      format), 3 flights, 4 add-ons, the gift card. Upserted by handle with
//      productSet, so re-running replaces variants, prices and metafields
//      with what the catalog says. Then custom.goes_with on each product
//      (the `goes with` upsell row, guide §8.5).
//   3. old catalog products (2″ / 1.2″ cubes era cartons) archived, not deleted
//   4. collections: shop (flavors, guide order), holiday, flights, add-ons
//   5. the box-expand Cart Transform, plus its box_rules metafield
//   6. the about page, the main menu (shop / build a box / flights /
//      gift cards / about) and a `gift cards` link in the footer menu
//
// Why a script: the CSV import skips list metafields and template suffixes,
// can't publish, and can't configure a cart transform.
//
// Usage (with `shopify app dev` running, copy the GraphiQL URL it prints):
//   node scripts/seed-store.mjs "http://localhost:3457/graphiql?key=..."
//
// Safe to re-run.
import {
  flavors, SIZES, PRICES, box, formats, flights, BIG_FLAVORS, RETIRED,
  addOns, giftCard, goesWith,
} from '../../../catalog/catalog.mjs';
import { connect, assertNoUserErrors } from './admin.mjs';

const graphiqlUrl = process.argv[2];
if (!graphiqlUrl) {
  console.error('usage: node scripts/seed-store.mjs "<GraphiQL URL from shopify app dev>"');
  process.exit(1);
}
const gql = connect(graphiqlUrl);

// ---------- 1. metafield definitions ----------
const DEFINITIONS = [
  ['color_ground', 'color ground', 'color'],
  ['color_ink', 'color ink', 'color'],
  ['color_deep', 'color deep', 'color'],
  ['color_fold', 'color fold', 'color'],
  ['seasonal', 'seasonal', 'boolean'],
  ['price_tier', 'price tier', 'single_line_text_field'],
  ['ingredients', 'ingredients', 'multi_line_text_field'],
  ['pairs_with', 'pairs with', 'single_line_text_field'],
  ['allergens', 'allergens', 'single_line_text_field'],
  ['best_within', 'best within', 'single_line_text_field'],
  ['flight_contents', 'flight contents', 'list.single_line_text_field'],
  ['made_of', 'made of', 'single_line_text_field'],
  ['item_size', 'size', 'single_line_text_field'],
  ['goes_with', 'goes with', 'list.product_reference'],
];
const { metafieldDefinitions } = await gql(`{
  metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "custom") { nodes { key } }
}`);
const existingKeys = new Set(metafieldDefinitions.nodes.map((node) => node.key));
for (const [key, name, type] of DEFINITIONS) {
  if (existingKeys.has(key)) continue;
  const created = await gql(
    `mutation ($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) { createdDefinition { key } userErrors { field message } }
    }`,
    { definition: { namespace: 'custom', key, name, type, ownerType: 'PRODUCT', access: { storefront: 'PUBLIC_READ' } } },
  );
  assertNoUserErrors(`metafieldDefinitionCreate ${key}`, created.metafieldDefinitionCreate.userErrors);
  console.log(`defined custom.${key}`);
}

// ---------- 2. products ----------
const { locations, publications } = await gql(`{
  locations(first: 1) { nodes { id } }
  publications(first: 20) { nodes { id name } }
}`);
const locationId = locations.nodes[0].id;
const onlineStore = publications.nodes.find((p) => p.name === 'Online Store');
if (!onlineStore) throw new Error('Online Store publication not found');

const mf = (key, type, value) => ({ namespace: 'custom', key, type, value });
const colorFields = (c) => [
  mf('color_ground', 'color', c.ground),
  mf('color_ink', 'color', c.ink),
  mf('color_deep', 'color', c.deep),
  mf('color_fold', 'color', c.fold),
];

async function publish(id) {
  const published = await gql(
    `mutation ($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id, input: [{ publicationId: onlineStore.id }] },
  );
  assertNoUserErrors(`publish ${id}`, published.publishablePublish.userErrors);
}

/** Upserts one product by handle and returns { id, variants: [{ id, title }] }. */
async function upsert(handle, input) {
  const result = await gql(
    `mutation ($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
      productSet(identifier: $identifier, input: $input, synchronous: true) {
        product { id handle variants(first: 10) { nodes { id title } } }
        userErrors { field message }
      }
    }`,
    { identifier: { handle }, input: { handle, vendor: 'Wicz Craft', status: 'ACTIVE', ...input } },
  );
  assertNoUserErrors(`productSet ${handle}`, result.productSet.userErrors);
  const { product } = result.productSet;
  await publish(product.id);
  console.log(`product ${handle}`);
  return { id: product.id, variants: product.variants.nodes };
}

const stocked = (name, value, price, sku) => ({
  optionValues: [{ optionName: name, name: value }],
  price,
  inventoryPolicy: 'DENY',
  inventoryItem: { sku, tracked: true },
  inventoryQuantities: [{ locationId, name: 'available', quantity: 100 }],
});
const unstocked = (name, value, price, sku) => ({
  optionValues: [{ optionName: name, name: value }],
  price,
  inventoryPolicy: 'CONTINUE',
  inventoryItem: { sku, tracked: false },
});

/** handle → { big, small } variant gids */
const butterVariants = {};
for (const f of flavors) {
  const sizes = [SIZES.big, SIZES.small];
  const product = await upsert(f.handle, {
    title: f.name,
    descriptionHtml: `<p><strong>${f.name}.</strong> ${f.body}</p>`,
    productType: 'butter',
    tags: ['flavor', ...(f.seasonal ? ['holiday'] : [])],
    templateSuffix: null,
    productOptions: [{ name: 'size', values: sizes.map((name) => ({ name })) }],
    variants: sizes.map((size) =>
      stocked('size', size, PRICES[f.tier][size], `WC-${f.handle}-${size.replace(' ', '')}`.toUpperCase()),
    ),
    metafields: [
      ...colorFields(f),
      mf('seasonal', 'boolean', String(f.seasonal)),
      mf('price_tier', 'single_line_text_field', f.tier),
      mf('ingredients', 'multi_line_text_field', f.ingredients),
      mf('pairs_with', 'single_line_text_field', f.pairs),
      mf('allergens', 'single_line_text_field', f.allergens),
      mf('best_within', 'single_line_text_field', f.bestWithin),
    ],
  });
  const byTitle = (title) => product.variants.find((v) => v.title === title).id;
  butterVariants[f.handle] = { big: byTitle(SIZES.big), small: byTitle(SIZES.small) };
}

const boxProduct = await upsert(box.handle, {
  title: box.title,
  descriptionHtml: `<p>${box.body}</p>`,
  productType: 'box',
  tags: ['box'],
  templateSuffix: 'box',
  productOptions: [{ name: 'format', values: formats.map((f) => ({ name: f.title })) }],
  // the theme's builder reads each format's slot counts from these
  variants: formats.map((f) => ({
    ...unstocked('format', f.title, f.price, `WC-BOX-${f.key}`.toUpperCase()),
    metafields: [
      mf('box_big', 'number_integer', String(f.big)),
      mf('box_small', 'number_integer', String(f.small)),
    ],
  })),
  metafields: [
    ...colorFields(box.colors),
    mf('seasonal', 'boolean', 'false'),
    mf('allergens', 'single_line_text_field', 'contains: milk. see each butter.'),
  ],
});

for (const flight of flights) {
  // the kit renamed flight handles to `<name>-flight`; move the old product
  // (and leave a redirect) instead of creating a second one
  const { old, current } = await gql(
    `query ($old: String!, $current: String!) {
      old: productByIdentifier(identifier: { handle: $old }) { id }
      current: productByIdentifier(identifier: { handle: $current }) { id }
    }`,
    { old: flight.oldHandle, current: flight.handle },
  );
  if (old && !current) {
    const renamed = await gql(
      `mutation ($product: ProductUpdateInput!) { productUpdate(product: $product) { userErrors { field message } } }`,
      { product: { id: old.id, handle: flight.handle, redirectNewHandle: true } },
    );
    assertNoUserErrors(`rename ${flight.oldHandle}`, renamed.productUpdate.userErrors);
    console.log(`renamed ${flight.oldHandle} → ${flight.handle}`);
  }
  await upsert(flight.handle, {
    title: flight.title,
    descriptionHtml: `<p><strong>${flight.title}.</strong> ${flight.body}</p>`,
    productType: 'flight',
    tags: ['flight', ...(flight.seasonal ? ['holiday'] : [])],
    templateSuffix: 'flight',
    productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
    variants: [unstocked('Title', 'Default Title', flight.price, `WC-FLIGHT-${flight.handle}`.toUpperCase())],
    metafields: [
      ...colorFields(flight.colors),
      mf('seasonal', 'boolean', String(flight.seasonal)),
      mf('allergens', 'single_line_text_field', flight.allergens),
      mf('best_within', 'single_line_text_field', flight.bestWithin),
      mf('flight_contents', 'list.single_line_text_field', JSON.stringify(flight.contents)),
    ],
  });
}

for (const addOn of addOns) {
  await upsert(addOn.handle, {
    title: addOn.title,
    descriptionHtml: `<p>${addOn.body}</p>`,
    productType: 'add-on',
    tags: ['add-on'],
    templateSuffix: 'addon',
    productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
    variants: [stocked('Title', 'Default Title', addOn.price, `WC-ADD-${addOn.handle}`.toUpperCase())],
    metafields: [
      mf('made_of', 'single_line_text_field', addOn.madeOf),
      mf('item_size', 'single_line_text_field', addOn.size),
      ...(addOn.ingredients ? [mf('ingredients', 'multi_line_text_field', addOn.ingredients)] : []),
    ],
  });
}

// Gift cards must be switched on in the admin first (Settings > Gift cards).
let giftCardId = null;
try {
  const product = await upsert(giftCard.handle, {
    title: giftCard.title,
    giftCard: true,
    descriptionHtml: `<p>${giftCard.body}</p>`,
    productType: 'gift card',
    tags: ['gift card'],
    templateSuffix: 'gift-card',
    productOptions: [{ name: 'amount', values: giftCard.amounts.map((amount) => ({ name: '$' + amount })) }],
    variants: giftCard.amounts.map((amount) => ({
      ...unstocked('amount', '$' + amount, amount + '.00', 'WC-GIFT-' + amount),
      inventoryItem: { sku: 'WC-GIFT-' + amount, tracked: false, requiresShipping: false },
    })),
  });
  giftCardId = product.id;
} catch (error) {
  if (!/activated/.test(error.message)) throw error;
  console.warn('skipped the gift card: turn on gift cards in Settings > Gift cards, then re-run');
}

// custom.goes_with: add-on cards on butter pages, butter cards on add-on
// pages (guide §8.5). A list of product references, so it's editable in the
// admin like any other metafield.
const productIds = {};
for (const handle of [
  ...flavors.map((f) => f.handle), box.handle, ...flights.map((f) => f.handle), ...addOns.map((a) => a.handle),
]) {
  const { productByIdentifier } = await gql(
    `query ($handle: String!) { productByIdentifier(identifier: { handle: $handle }) { id } }`,
    { handle },
  );
  productIds[handle] = productByIdentifier.id;
}
const goesWithFields = [
  ...[...flavors.map((f) => f.handle), box.handle, ...flights.map((f) => f.handle)].map((handle) => [handle, goesWith(handle)]),
  ...addOns.map((addOn) => [addOn.handle, addOn.goesWith]),
].map(([handle, targets]) => ({
  ownerId: productIds[handle],
  namespace: 'custom',
  key: 'goes_with',
  type: 'list.product_reference',
  value: JSON.stringify(targets.map((target) => productIds[target])),
}));
for (let i = 0; i < goesWithFields.length; i += 25) {
  const set = await gql(
    `mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { userErrors { field message } }
    }`,
    { metafields: goesWithFields.slice(i, i + 25) },
  );
  assertNoUserErrors('metafieldsSet goes_with', set.metafieldsSet.userErrors);
}
console.log(`goes with set on ${goesWithFields.length} products`);

// ---------- 3. archive the old catalog ----------
for (const handle of RETIRED) {
  const { productByIdentifier: product } = await gql(
    `query ($handle: String!) { productByIdentifier(identifier: { handle: $handle }) { id status } }`,
    { handle },
  );
  if (!product || product.status === 'ARCHIVED') continue;
  const archived = await gql(
    `mutation ($product: ProductUpdateInput!) { productUpdate(product: $product) { userErrors { field message } } }`,
    { product: { id: product.id, status: 'ARCHIVED' } },
  );
  assertNoUserErrors(`archive ${handle}`, archived.productUpdate.userErrors);
  console.log(`archived ${handle}`);
}

// ---------- 4. collections ----------
async function smartCollection(handle, title, tag) {
  const { collectionByIdentifier: existing } = await gql(
    `query ($handle: String!) { collectionByIdentifier(identifier: { handle: $handle }) { id } }`,
    { handle },
  );
  if (existing) return existing.id;
  const created = await gql(
    `mutation ($input: CollectionInput!) {
      collectionCreate(input: $input) { collection { id } userErrors { field message } }
    }`,
    {
      input: {
        handle,
        title,
        ruleSet: { appliedDisjunctively: false, rules: [{ column: 'TAG', relation: 'EQUALS', condition: tag }] },
      },
    },
  );
  assertNoUserErrors(`collectionCreate ${handle}`, created.collectionCreate.userErrors);
  const { id } = created.collectionCreate.collection;
  await publish(id);
  console.log(`created collection ${handle}`);
  return id;
}
const shopId = await smartCollection('shop', 'shop', 'flavor');
const holidayId = await smartCollection('holiday', 'holiday', 'holiday');
const flightsId = await smartCollection('flights', 'flights', 'flight');
const addOnsId = await smartCollection('add-ons', 'add-ons', 'add-on');

/**
 * Puts a smart collection in a fixed order. New products join a smart
 * collection a few seconds after they're created, and a reorder sent before
 * then is silently dropped, so this waits for every product, reorders, and
 * checks the result.
 */
async function orderCollection(id, handles) {
  const sorted = await gql(
    `mutation ($input: CollectionInput!) { collectionUpdate(input: $input) { userErrors { field message } } }`,
    { input: { id, sortOrder: 'MANUAL' } },
  );
  assertNoUserErrors('collectionUpdate', sorted.collectionUpdate.userErrors);
  const members = `query ($id: ID!) {
    collection(id: $id) { handle products(first: 50, sortKey: COLLECTION_DEFAULT) { nodes { id handle } } }
  }`;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const { collection } = await gql(members, { id });
    const nodes = collection.products.nodes;
    const current = nodes.map((node) => node.handle);
    if (handles.every((handle, i) => current[i] === handle)) {
      console.log(`${collection.handle} collection ordered`);
      return;
    }
    if (handles.every((handle) => current.includes(handle))) {
      const moves = handles.map((handle, i) => ({ id: nodes.find((node) => node.handle === handle).id, newPosition: String(i) }));
      const reordered = await gql(
        `mutation ($id: ID!, $moves: [MoveInput!]!) {
          collectionReorderProducts(id: $id, moves: $moves) { userErrors { field message } }
        }`,
        { id, moves },
      );
      assertNoUserErrors('collectionReorderProducts', reordered.collectionReorderProducts.userErrors);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  console.warn(`couldn't order collection ${id}; re-run the script`);
}
// the guide's order, classics first (§9)
await orderCollection(shopId, flavors.map((f) => f.handle));
await orderCollection(flightsId, flights.map((f) => f.handle));
await orderCollection(addOnsId, addOns.map((a) => a.handle));

// ---------- 5. cart transform + rules ----------
const { shopifyFunctions, cartTransforms } = await gql(`{
  shopifyFunctions(first: 25, apiType: "cart_transform") { nodes { id title } }
  cartTransforms(first: 25) { nodes { id functionId } }
}`);
const fn = shopifyFunctions.nodes.find((node) => node.title === 'box-expand');
if (!fn) throw new Error('box-expand function not found. run `shopify app deploy` first.');

for (const stale of cartTransforms.nodes.filter((node) => node.functionId !== fn.id)) {
  const deleted = await gql(
    `mutation ($id: ID!) { cartTransformDelete(id: $id) { userErrors { field message } } }`,
    { id: stale.id },
  );
  assertNoUserErrors('cartTransformDelete', deleted.cartTransformDelete.userErrors);
  console.log(`removed old cart transform ${stale.id}`);
}

let transformId = cartTransforms.nodes.find((node) => node.functionId === fn.id)?.id;
if (!transformId) {
  const created = await gql(
    `mutation ($functionId: String!) {
      cartTransformCreate(functionId: $functionId, blockOnFailure: false) {
        cartTransform { id }
        userErrors { field message }
      }
    }`,
    { functionId: fn.id },
  );
  assertNoUserErrors('cartTransformCreate', created.cartTransformCreate.userErrors);
  transformId = created.cartTransformCreate.cartTransform.id;
  console.log(`registered cart transform ${transformId}`);
}

const boxVariant = (title) => boxProduct.variants.find((v) => v.title === title).id;
const rules = {
  formats: Object.fromEntries(formats.map((f) => [boxVariant(f.title), { big: f.big, small: f.small }])),
  big: BIG_FLAVORS.map((handle) => butterVariants[handle].big),
  small: flavors.map((f) => butterVariants[f.handle].small),
};
const rulesSet = await gql(
  `mutation ($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { userErrors { field message } }
  }`,
  { metafields: [{ ownerId: transformId, namespace: '$app', key: 'box_rules', type: 'json', value: JSON.stringify(rules) }] },
);
assertNoUserErrors('metafieldsSet box_rules', rulesSet.metafieldsSet.userErrors);
console.log('box rules set');

// ---------- 6. about page + main menu ----------
const { pages } = await gql(`{ pages(first: 1, query: "handle:about") { nodes { id templateSuffix } } }`);
let aboutPage = pages.nodes[0];
if (!aboutPage) {
  const created = await gql(
    `mutation ($page: PageCreateInput!) {
      pageCreate(page: $page) { page { id } userErrors { field message } }
    }`,
    // the about template carries the copy (editable in the theme editor)
    { page: { title: 'about', handle: 'about', templateSuffix: 'about', body: '', isPublished: true } },
  );
  assertNoUserErrors('pageCreate about', created.pageCreate.userErrors);
  aboutPage = created.pageCreate.page;
  console.log('created about page');
} else if (aboutPage.templateSuffix !== 'about') {
  const updated = await gql(
    `mutation ($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) { page { id } userErrors { field message } }
    }`,
    { id: aboutPage.id, page: { templateSuffix: 'about' } },
  );
  assertNoUserErrors('pageUpdate about', updated.pageUpdate.userErrors);
}

const { menus } = await gql(`{ menus(first: 10) { nodes { id handle title } } }`);
const mainMenu = menus.nodes.find((menu) => menu.handle === 'main-menu');
if (!mainMenu) throw new Error('main-menu not found');
const menu = await gql(
  `mutation ($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) { menu { items { title } } userErrors { field message } }
  }`,
  {
    id: mainMenu.id,
    title: mainMenu.title,
    items: [
      { title: 'shop', type: 'COLLECTION', resourceId: shopId },
      { title: 'build a box', type: 'PRODUCT', resourceId: boxProduct.id },
      { title: 'flights', type: 'COLLECTION', resourceId: flightsId },
      ...(giftCardId ? [{ title: 'gift cards', type: 'PRODUCT', resourceId: giftCardId }] : []),
      { title: 'about', type: 'PAGE', resourceId: aboutPage.id },
    ],
  },
);
assertNoUserErrors('menuUpdate main-menu', menu.menuUpdate.userErrors);
console.log(`main menu: ${menu.menuUpdate.menu.items.map((item) => item.title).join(' / ')}`);

// footer: keep whatever is there, and add `gift cards` once (guide §7 footer)
const footerMenu = menus.nodes.find((m) => m.handle === 'footer');
if (footerMenu && giftCardId) {
  const { menu: footer } = await gql(
    `query ($id: ID!) { menu(id: $id) { items { title type resourceId url } } }`,
    { id: footerMenu.id },
  );
  if (!footer.items.some((item) => item.resourceId === giftCardId)) {
    const items = [
      ...footer.items.map(({ title, type, resourceId, url }) => ({ title, type, ...(resourceId ? { resourceId } : { url }) })),
      { title: 'gift cards', type: 'PRODUCT', resourceId: giftCardId },
    ];
    const updated = await gql(
      `mutation ($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, items: $items) { userErrors { field message } }
      }`,
      { id: footerMenu.id, title: footerMenu.title, items },
    );
    assertNoUserErrors('menuUpdate footer', updated.menuUpdate.userErrors);
    console.log('footer menu: added gift cards');
  }
}
void holidayId;
