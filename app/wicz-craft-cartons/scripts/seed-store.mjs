// Seeds the store data the theme expects, after the product CSV import:
//   1. carton products: `carton` template suffix + custom.carton_config
//   2. the carton-merge Cart Transform registration
//   3. the about page (template suffix `about`)
//   4. the main menu: shop / cartons / about
//
// Why a script: the product CSV import doesn't set JSON metafields or
// template suffixes, and the admin only lists templates from the published
// theme. The Admin API does all of it, repeatably.
//
// Usage (with `shopify app dev` running, copy the GraphiQL URL it prints):
//   node scripts/seed-store.mjs "http://localhost:3457/graphiql?key=..."
//
// Safe to re-run: every step either overwrites the same values or skips
// what already exists.
import { cartons } from '../../../catalog/cartons.mjs';

const API_VERSION = '2026-07';
const graphiqlUrl = process.argv[2];
if (!graphiqlUrl) {
  console.error('usage: node scripts/seed-store.mjs "<GraphiQL URL from shopify app dev>"');
  process.exit(1);
}
const { origin, searchParams } = new URL(graphiqlUrl);
const endpoint = `${origin}/graphiql/graphql.json?key=${searchParams.get('key')}&api_version=${API_VERSION}`;

async function gql(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (body.errors?.length) throw new Error(JSON.stringify(body.errors, null, 2));
  return body.data;
}

function assertNoUserErrors(label, errors) {
  if (errors?.length) throw new Error(`${label}: ${JSON.stringify(errors)}`);
}

// 1. carton products: template suffix + carton_config
for (const carton of cartons) {
  const { productByIdentifier: product } = await gql(
    `query ($handle: String!) { productByIdentifier(identifier: { handle: $handle }) { id } }`,
    { handle: carton.handle },
  );
  if (!product) {
    console.warn(`skip ${carton.handle}: not in the store yet (import catalog/wicz-craft-products.csv first)`);
    continue;
  }

  const update = await gql(
    `mutation ($product: ProductUpdateInput!) {
      productUpdate(product: $product) { product { handle templateSuffix } userErrors { field message } }
    }`,
    { product: { id: product.id, templateSuffix: 'carton' } },
  );
  assertNoUserErrors(`productUpdate ${carton.handle}`, update.productUpdate.userErrors);

  const set = await gql(
    `mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { metafields { key } userErrors { field message } }
    }`,
    {
      metafields: [
        { ownerId: product.id, namespace: 'custom', key: 'carton_config', type: 'json', value: JSON.stringify(carton.config) },
      ],
    },
  );
  assertNoUserErrors(`metafieldsSet ${carton.handle}`, set.metafieldsSet.userErrors);
  console.log(`seeded ${carton.handle}`);
}

// 2. register the Cart Transform once
const { shopifyFunctions, cartTransforms } = await gql(`{
  shopifyFunctions(first: 25, apiType: "cart_transform") { nodes { id title } }
  cartTransforms(first: 25) { nodes { id functionId } }
}`);
const fn = shopifyFunctions.nodes.find((node) => node.title === 'carton-merge');
if (!fn) throw new Error('carton-merge function not found. run `shopify app deploy` first.');

if (cartTransforms.nodes.some((node) => node.functionId === fn.id)) {
  console.log('cart transform already registered');
} else {
  const created = await gql(
    `mutation ($functionId: String!) {
      cartTransformCreate(functionId: $functionId, blockOnFailure: false) {
        cartTransform { id functionId }
        userErrors { field message }
      }
    }`,
    { functionId: fn.id },
  );
  assertNoUserErrors('cartTransformCreate', created.cartTransformCreate.userErrors);
  console.log(`registered cart transform ${created.cartTransformCreate.cartTransform.id}`);
}

// 3. about page
const { pages } = await gql(`{ pages(first: 1, query: "handle:about") { nodes { id handle templateSuffix } } }`);
let aboutPage = pages.nodes[0];
if (aboutPage) {
  if (aboutPage.templateSuffix !== 'about') {
    const updated = await gql(
      `mutation ($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) { page { id } userErrors { field message } }
      }`,
      { id: aboutPage.id, page: { templateSuffix: 'about' } },
    );
    assertNoUserErrors('pageUpdate about', updated.pageUpdate.userErrors);
  }
  console.log('about page ready');
} else {
  const created = await gql(
    `mutation ($page: PageCreateInput!) {
      pageCreate(page: $page) { page { id handle } userErrors { field message } }
    }`,
    // the about template carries the copy (editable in the theme editor), so the body stays empty
    { page: { title: 'about', handle: 'about', templateSuffix: 'about', body: '', isPublished: true } },
  );
  assertNoUserErrors('pageCreate about', created.pageCreate.userErrors);
  aboutPage = created.pageCreate.page;
  console.log('created about page');
}

// 4. main menu: shop / cartons / about (§7 header)
const { menus, collections } = await gql(`{
  menus(first: 10) { nodes { id handle title } }
  collections(first: 10, query: "handle:shop OR handle:cartons") { nodes { id handle } }
}`);
const mainMenu = menus.nodes.find((menu) => menu.handle === 'main-menu');
const collectionId = (handle) => collections.nodes.find((c) => c.handle === handle)?.id;
if (!mainMenu) throw new Error('main-menu not found');
if (!collectionId('shop') || !collectionId('cartons')) {
  throw new Error('create the "shop" and "cartons" collections first');
}
const menu = await gql(
  `mutation ($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) { menu { items { title } } userErrors { field message } }
  }`,
  {
    id: mainMenu.id,
    title: mainMenu.title,
    items: [
      { title: 'shop', type: 'COLLECTION', resourceId: collectionId('shop') },
      { title: 'cartons', type: 'COLLECTION', resourceId: collectionId('cartons') },
      { title: 'about', type: 'PAGE', resourceId: aboutPage.id },
    ],
  },
);
assertNoUserErrors('menuUpdate main-menu', menu.menuUpdate.userErrors);
console.log(`main menu: ${menu.menuUpdate.menu.items.map((item) => item.title).join(' / ')}`);
