# wicz craft cartons

An extension-only Shopify app with one job: turn a carton the shopper builds
on the storefront into **one cart line**, priced as the sum of the cubes inside
it, with each flavor's inventory still tracked.

## How it fits together

```
theme: sections/wicz-carton.liquid + assets/wicz-carton-builder.js
  shopper fills the carton's slots (or a capacity-based box)
  -> POST /cart/add.js, one line per flavor and size, each with
       _carton_id      a fresh UUID shared by this carton's lines
       _carton_parent  the carton product's variant id

app: extensions/carton-merge (Cart Transform function, JavaScript -> Wasm)
  groups lines by _carton_id
  -> one linesMerge per group onto the carton variant
       no price adjustment, so the merged price = sum of components
       adds a "contents" attribute: "nº 1 salted, 2″ cube · nº 2 garlic herb, 1.2″ cube × 2"
```

Guards: a group isn't merged if its lines disagree about the parent, or the
parent isn't a variant id. Those lines stay separate at full price, so a bad
request never produces a cheaper or empty carton.

The carton's rules (slot sizes, defaults, capacity) live in the product's
`custom.carton_config` JSON metafield and are read by the theme. The function
doesn't need them, because there's no carton discount: any mix the shopper
adds costs exactly what its parts cost.

## Commands

From this folder (Node 22, see the repo's `.nvmrc`):

| | |
|---|---|
| `npm test --workspace carton-merge` | unit tests + Wasm fixture tests (`extensions/carton-merge/tests`) |
| `shopify app dev --store wicz-craft` | dev preview on the store, plus a local GraphiQL |
| `shopify app dev clean --store wicz-craft` | stop the dev preview, restore the released version |
| `shopify app deploy --allow-updates` | release a new app version |
| `node scripts/seed-store.mjs "<GraphiQL URL>"` | carton template suffixes + `carton_config`, register the Cart Transform, about page, main menu (idempotent) |

The seed script exists because the product CSV import doesn't set JSON
metafields or template suffixes, and the admin only offers templates from the
published theme.

## Tests

- `tests/carton.unit.test.js`: grouping, parent normalization, summaries, guards.
- `tests/wasm.fixtures.test.js`: builds the function and runs every JSON
  fixture in `tests/fixtures/` through the compiled Wasm, validating input and
  output against the Cart Transform schema.
