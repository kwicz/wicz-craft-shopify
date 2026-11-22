// Loads the site kit's images into the store (catalog/image-map.csv says
// where each one goes). Every image becomes a file in Content > Files under
// its kit filename, so the theme can find it by name, then:
//   - product media, in the map's media order, with alt text
//   - variant images (8 oz / 2 oz, each box format, each gift card amount)
//   - collection images
// Theme-only images (hero, lineup, builder pieces, cart, share image) stay in
// Files; the theme reads them with `images['<filename>']` or an image picker.
// Rows marked `coming` are skipped until the files exist.
//
// Usage (with `shopify app dev` running, copy the GraphiQL URL it prints):
//   node scripts/seed-images.mjs "<GraphiQL URL>" <unzipped wicz-craft-images folder>
//
// Safe to re-run: files that already exist are reused, media already on a
// product is kept, and only the order and variant links are re-applied.
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, assertNoUserErrors } from './admin.mjs';
import { BOX_HANDLE, formats } from '../../../catalog/catalog.mjs';

const [graphiqlUrl, imagesDir] = process.argv.slice(2);
if (!graphiqlUrl || !imagesDir) {
  console.error('usage: node scripts/seed-images.mjs "<GraphiQL URL>" <images folder>');
  process.exit(1);
}
const gql = connect(graphiqlUrl);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- read the map ----------
const mapPath = fileURLToPath(new URL('../../../catalog/image-map.csv', import.meta.url));
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((cells) => Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ''])));
}
const rows = parseCsv(readFileSync(mapPath, 'utf8')).filter((row) => row.status === 'included');

function localPath(row) {
  const candidates = [
    join(imagesDir, row.path_in_zip.replace(/^images\//, '')),
    join(imagesDir, row.path_in_zip),
    join(imagesDir, row.file),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error(`missing ${row.file} (looked in ${imagesDir})`);
  return found;
}

// The map names products by handle in quotes, and the box and gift card by title.
const productHandle = (name) => ({ 'build a box': BOX_HANDLE, 'gift card': 'gift-card' })[name] ?? name;
// The kit calls the flavors collection `all`; the store's is `shop`.
const collectionHandle = (name) => ({ all: 'shop' })[name] ?? name;
const formatTitles = new Set(formats.map((f) => f.title));

/** product handle → [{ row, position, variant }] */
const productMedia = {};
/** collection handle → row */
const collectionImages = {};
for (const row of rows) {
  const placement = row['shopify placement'];
  const product = placement.match(/^product '([^']+)'/);
  const collection = placement.match(/^collection '([^']+)'/);
  if (product) {
    const handle = productHandle(product[1]);
    const position = Number(placement.match(/media position (\d+)/)?.[1] ?? 100);
    const variant = placement.match(/(\d+ oz) variant image/)?.[1] ?? placement.match(/variant '([^']+)' image/)?.[1];
    // sizes (`8 oz`), box formats, and gift card amounts (`$25`)
    if (variant && !/oz$/.test(variant) && !/^\$\d+$/.test(variant) && !formatTitles.has(variant)) {
      throw new Error(`unknown variant ${variant}`);
    }
    (productMedia[handle] ??= []).push({ row, position, variant });
  } else if (collection) {
    collectionImages[collectionHandle(collection[1])] = row;
  }
}
for (const list of Object.values(productMedia)) list.sort((a, b) => a.position - b.position);

// ---------- upload every image to Files ----------
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

async function findFile(filename) {
  const stem = filename.replace(/\.[^.]+$/, '');
  const { files } = await gql(
    `query ($query: String!) {
      files(first: 10, query: $query) {
        nodes { id fileStatus alt ... on MediaImage { image { url } } }
      }
    }`,
    { query: `filename:${stem}` },
  );
  // filename search is prefix-ish; match the stored name exactly
  return files.nodes.find((node) => {
    const url = node.image?.url;
    return url && basename(new URL(url).pathname) === filename;
  });
}

async function upload(path, filename, alt) {
  const mimeType = MIME[filename.split('.').pop().toLowerCase()];
  const { stagedUploadsCreate } = await gql(
    `mutation ($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    { input: [{ resource: 'IMAGE', filename, mimeType, httpMethod: 'POST', fileSize: String(statSync(path).size) }] },
  );
  assertNoUserErrors(`stagedUploadsCreate ${filename}`, stagedUploadsCreate.userErrors);
  const [target] = stagedUploadsCreate.stagedTargets;
  const form = new FormData();
  for (const { name, value } of target.parameters) form.append(name, value);
  form.append('file', new Blob([readFileSync(path)], { type: mimeType }), filename);
  const response = await fetch(target.url, { method: 'POST', body: form });
  if (!response.ok) throw new Error(`upload ${filename}: ${response.status} ${await response.text()}`);

  const { fileCreate } = await gql(
    `mutation ($files: [FileCreateInput!]!) {
      fileCreate(files: $files) { files { id } userErrors { field message } }
    }`,
    { files: [{ originalSource: target.resourceUrl, filename, alt, contentType: 'IMAGE', duplicateResolutionMode: 'RAISE_ERROR' }] },
  );
  assertNoUserErrors(`fileCreate ${filename}`, fileCreate.userErrors);
  return fileCreate.files[0].id;
}

async function waitReady(id, filename) {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const { node } = await gql(
      `query ($id: ID!) { node(id: $id) { ... on MediaImage { fileStatus image { url } } } }`,
      { id },
    );
    if (node.fileStatus === 'READY') return node.image.url;
    if (node.fileStatus === 'FAILED') throw new Error(`${filename} failed to process`);
    await sleep(2000);
  }
  throw new Error(`${filename} still processing; re-run the script`);
}

/** filename → { id, url } */
const files = {};
for (const row of rows) {
  const existing = await findFile(row.file);
  if (existing) {
    files[row.file] = { id: existing.id };
    if (existing.alt !== row['alt text']) {
      const { fileUpdate } = await gql(
        `mutation ($files: [FileUpdateInput!]!) { fileUpdate(files: $files) { userErrors { field message } } }`,
        { files: [{ id: existing.id, alt: row['alt text'] }] },
      );
      assertNoUserErrors(`fileUpdate ${row.file}`, fileUpdate.userErrors);
    }
    continue;
  }
  files[row.file] = { id: await upload(localPath(row), row.file, row['alt text']) };
  console.log(`uploaded ${row.file}`);
}
for (const row of rows) files[row.file].url = await waitReady(files[row.file].id, row.file);
console.log(`${rows.length} files ready`);

// ---------- product media ----------
for (const [handle, entries] of Object.entries(productMedia)) {
  const { productByIdentifier: product } = await gql(
    `query ($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id
        media(first: 50) { nodes { id } }
        variants(first: 20) { nodes { id title media(first: 5) { nodes { id } } } }
      }
    }`,
    { handle },
  );
  if (!product) {
    console.warn(`no product ${handle}; run seed-store.mjs first`);
    continue;
  }
  const wanted = entries.map((entry) => files[entry.row.file].id);
  const current = product.media.nodes.map((node) => node.id);
  const toAdd = wanted.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !wanted.includes(id));
  const updates = [
    ...toAdd.map((id) => ({ id, referencesToAdd: [product.id] })),
    ...toRemove.map((id) => ({ id, referencesToRemove: [product.id] })),
  ];
  if (updates.length) {
    const { fileUpdate } = await gql(
      `mutation ($files: [FileUpdateInput!]!) { fileUpdate(files: $files) { userErrors { field message } } }`,
      { files: updates },
    );
    assertNoUserErrors(`fileUpdate ${handle}`, fileUpdate.userErrors);
  }

  const moves = wanted.map((id, i) => ({ id, newPosition: String(i) }));
  const { productReorderMedia } = await gql(
    `mutation ($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) { mediaUserErrors { field message } }
    }`,
    { id: product.id, moves },
  );
  assertNoUserErrors(`productReorderMedia ${handle}`, productReorderMedia.mediaUserErrors);

  // a variant holds one image; detach any other before appending
  const variantMedia = entries
    .filter((entry) => entry.variant)
    .map((entry) => {
      const variant = product.variants.nodes.find((v) => v.title === entry.variant);
      if (!variant) throw new Error(`${handle} has no variant ${entry.variant}`);
      return { variant, mediaId: files[entry.row.file].id };
    })
    .filter(({ variant, mediaId }) => variant.media.nodes[0]?.id !== mediaId);
  const stale = variantMedia
    .filter(({ variant }) => variant.media.nodes.length)
    .map(({ variant }) => ({ variantId: variant.id, mediaIds: variant.media.nodes.map((node) => node.id) }));
  if (stale.length) {
    const { productVariantDetachMedia } = await gql(
      `mutation ($productId: ID!, $variantMedia: [ProductVariantDetachMediaInput!]!) {
        productVariantDetachMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { field message } }
      }`,
      { productId: product.id, variantMedia: stale },
    );
    assertNoUserErrors(`productVariantDetachMedia ${handle}`, productVariantDetachMedia.userErrors);
  }
  if (variantMedia.length) {
    const { productVariantAppendMedia } = await gql(
      `mutation ($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
        productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { field message } }
      }`,
      {
        productId: product.id,
        variantMedia: variantMedia.map(({ variant, mediaId }) => ({ variantId: variant.id, mediaIds: [mediaId] })),
      },
    );
    assertNoUserErrors(`productVariantAppendMedia ${handle}`, productVariantAppendMedia.userErrors);
  }
  console.log(`${handle}: ${wanted.length} images${toAdd.length ? ` (${toAdd.length} new)` : ''}`);
}

// ---------- collection images ----------
for (const [handle, row] of Object.entries(collectionImages)) {
  const { collectionByIdentifier: collection } = await gql(
    `query ($handle: String!) { collectionByIdentifier(identifier: { handle: $handle }) { id image { altText url } } }`,
    { handle },
  );
  if (!collection) {
    console.warn(`no collection ${handle}; run seed-store.mjs first`);
    continue;
  }
  if (collection.image && basename(new URL(collection.image.url).pathname).startsWith(row.file.replace(/\.[^.]+$/, ''))) continue;
  const { collectionUpdate } = await gql(
    `mutation ($input: CollectionInput!) { collectionUpdate(input: $input) { userErrors { field message } } }`,
    { input: { id: collection.id, image: { src: files[row.file].url, altText: row['alt text'] } } },
  );
  assertNoUserErrors(`collectionUpdate ${handle}`, collectionUpdate.userErrors);
  console.log(`collection ${handle} image set`);
}
