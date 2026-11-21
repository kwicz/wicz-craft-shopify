# wicz craft cartons

An extension-only Shopify app with one job: turn a **box** the shopper builds
on the storefront into the butters inside it. The box stays one cart line at
its flat price, and each butter's inventory is still tracked.

## How it fits together

```
theme: sections/wicz-box-builder.liquid + assets/wicz-box-builder.js
  shopper picks a format (four, six, eight, one big two small, one big four small)
  and fills its slots
  -> POST /cart/add, one line: the format's variant, at its flat price, with
       big: unsalted, 8 oz        visible properties, listed in the cart
       slot 1: caesar ...
       _components: 111,222,222   hidden: picked variant ids, 8 oz first
  (flight pages post the same line for the "eight" format, pre-filled)

app: extensions/box-expand (Cart Transform function, JavaScript -> Wasm)
  for each line whose variant is a box format
  -> checks the picks against the rules: right count, 8 oz salted or
     unsalted in the big slot, 2 oz in every small slot
  -> one lineExpand into the picked variants (repeats counted)
       no price adjustment: the box keeps its flat price, which Shopify
       splits across the butters
```

The rules live in an app-owned JSON metafield on the cart transform
(`box_rules`), not in the cart, so a shopper can't change them:

```json
{
  "formats": { "gid://shopify/ProductVariant/<box four>": { "big": 0, "small": 4 } },
  "big":   ["<8 oz salted>", "<8 oz unsalted>"],
  "small": ["<every 2 oz>"]
}
```

A box that fails the check isn't expanded: it stays one line at the box
price, with its picks still listed. The price never depends on what the
shopper sends, only on which format variant they bought.

Why expand instead of merge: a box can cost more than its parts (four 2 oz
salted are $20 as singles; the box is $21, §8.2). A merge prices a bundle
from its components and can only discount; an expand starts from the
bundle's own price.

## Commands

From this folder (Node 22, see the repo's `.nvmrc`):

| | |
|---|---|
| `npm test --workspace box-expand -- --run` | unit tests + Wasm fixture tests (`extensions/box-expand/tests`) |
| `shopify app dev --store wicz-craft` | dev preview on the store, plus a local GraphiQL |
| `shopify app dev clean --store wicz-craft` | stop the dev preview, restore the released version |
| `shopify app deploy --allow-updates` | release a new app version |
| `node scripts/seed-store.mjs "<GraphiQL URL>"` | load the catalog and store setup (idempotent, below) |

`seed-store.mjs` reads `catalog/catalog.mjs` and, through the Admin API:
creates the `custom.*` metafield definitions; upserts the 12 flavors, the
"build a box" product (one variant per format, with `custom.box_big` /
`custom.box_small` slot counts) and the 3 flights; archives the old carton
products; creates and orders the `shop`, `holiday` and `flights`
collections; registers the Cart Transform and writes `box_rules`; and sets
the about page and main menu. The product CSV import can't do most of that
(list metafields, template suffixes, publishing, function config).

## Tests

- `tests/box.unit.test.js`: expansion, repeats, several boxes, wrong counts,
  wrong sizes, garbled ids, missing rules.
- `tests/wasm.fixtures.test.js`: builds the function and runs every JSON
  fixture in `tests/fixtures/` through the compiled Wasm, validating input and
  output against the Cart Transform schema.
