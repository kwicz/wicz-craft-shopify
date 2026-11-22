# Wicz Craft — Shopify Design Guide

This is the design spec for the Wicz Craft Shopify storefront, a practice store that sells homemade cultured butter. The **name** is Wicz Craft. **Everything else** (color, type, voice, layout, components, packaging) follows the "Really Good Butter" visual system below.

> **For the agent:** This document is the source of truth. If something isn't covered, choose the plainer, quieter option. Don't add gradients (except the foil sheen in §6), stripes, emoji, exclamation points, stock lifestyle photos, butter puns, or flavor numbers. When a fact is missing, write a bracketed placeholder like `[PRICE]` instead of inventing it.

> **Revision (Nov 21, 2026):** We're back to the **bright** system. Each of the twelve flavors has its own ground and ink pair. The **classics** are lighter and mellow. The **culinary and holiday** flavors are bold and poppy. **Unsalted** wears **silver foil**. Sizes are **8 oz and 2 oz**, and multi-flavor sales go through a **box builder** (§8.2). Five **add-ons** (spreader, butter keeper, butter board, flaky salt, gift card) are covered in §8.5. Packaging is a **butter-yellow window box** (§10). The logo is a **butter stamp, "the mold"** (§2.1), pressed into every cube. Stripes are gone everywhere. Background research is in `premium-butter-market-research.md`.

> **Visual reference:** the design canvas **[Wicz Craft — products & packaging](https://claude.ai/artifact/Shb2njzYZSvU6A6qzvj2Vo)** shows the twelve-flavor lineup, the logo ("the mold") in every use, and the window box in all three sizes. It's an artifact on the owner's account, not a project file. Open it with the artifact tools (its boards are `project/Bright-Lineup.dc.html`, `project/Butter-Stamp.dc.html`, and `project/Window-Box.dc.html`) rather than fetching it from the web. When this guide and the canvas disagree, this guide wins.

> **Product data:** the sheet **[Wicz Craft — product catalog](https://claude.ai/artifact/GRfWvbN4wi2p8jJoLKZ7Hs)** has one row per flavor on its `Flavors` tab: 8 oz and 2 oz prices, ingredients, allergens, best-within, pairs with, product description, seasonal flag, handle, and the four color hexes. Its `Boxes` and `Flights` tabs hold the builder formats and flight presets, and its `Add-ons` tab holds the five add-ons. It's a Claude Sheets artifact on the owner's account; read its cells with the Claude Docs connector. Prices and colors match this guide. For **ingredients, allergens, shelf life, descriptions, and handles, the sheet is the source of truth**. Rows marked `draft` in its status columns haven't been confirmed yet.

---

## 1. Brand in one paragraph

Wicz Craft makes small-batch cultured butter in Portland, Oregon, from cream cultured for 48 hours. The look is **mod-dairy**: retro grocery packaging updated for 2026, like a 1960s European butter brick redesigned by a Portland studio.

- **Material comes first.** The foil wrapper is the hero, so the package reads as butter before you read a word.
- **One pale ground and one loud ink per flavor.** The classics are soft and mellow. The culinary flavors are poppy and confident, but never neon.
- **Soft, wonky type.** A heavy, rounded, slightly melty lowercase serif feels like the letters are softening at room temperature. It's paired with a clean typewriter monospace for lab-label precision.

The voice is plain, lowercase, and a little deadpan, and every understated claim is backed by one specific fact.

---

## 2. Name, wordmark & logo

- **Store name:** Wicz Craft
- **Wordmark:** `wicz craft`, lowercase, set in the display face (§4). Stack it (`wicz` / `craft`) when there's room, and use one line in the header.
- **Descriptor / tagline:** `really good butter`. Set it in the mono face under or beside the wordmark, or use it as the hero line.
- **Phrase stamp:** *it's really good.* Italic display inside a circular stamp (§7). Website only.
- **Process line:** `cultured 48 hours`. It goes on every pack.
- **Location line:** `cultured butter · portland, oregon`. Add back `grass-fed cream` only once the cream source is confirmed, because it has to be literally true.

### 2.1 Logo: the butter stamp ("the mold")

Dairies once pressed carved stamps into butter to mark whose it was. The Wicz Craft logo is that stamp: a **scalloped edge, like an antique wooden butter mold**, with a `wc` monogram in the melty display face and a fine dotted ring between them.

**Construction** (on a 160 × 160 grid):
- **Scalloped edge:** a circle of radius 70 with 18 scallops (about 4.5 deep), stroked at 3 with round joins.
- **Dotted inner ring:** radius 56, stroke 1.5, round dots (dash 1.5, gap 5).
- **Monogram:** `wc` in Fraunces 900 with `'SOFT' 100, 'WONK' 1`, about 62 units tall, centered, baseline at about y = 96.
- **Small sizes (≤ 40px):** thicken the scalloped edge to a stroke of 8, drop the dotted ring, and enlarge `wc` to about 74 units.

**Where it's used:**
- **Pressed into the top of every cube and block.** This is the signature detail.
- The window-box seal.
- The favicon.
- Stickers.
- The social avatar.
- The add-ons: burned into the spreader handle, branded on the butter board, printed on the salt tin lid, and on the gift card (§8.5).

The wordmark stays for headers, box tops, and labels. The stamp is always one color: `--periwinkle-deep` on light grounds, `--cream` on periwinkle. On the butter itself it's an emboss with no ink.

Don't use the Wicz Craft **holiday gift labels** styling here (Cormorant/EB Garamond, white labels, "Winter Solstice Collection"). That's a separate family gift project.

---

## 3. Color

### 3.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `--foil` | `#F6E8A4` | Gold foil and butter-yellow: the main brand surface, hero blocks, salted, the box |
| `--foil-fold` | `#EBD98C` | Darker gold for folds, borders on foil, and hover on foil |
| `--silver` | `#E6E8EC` | Silver foil, for **unsalted** only |
| `--silver-fold` | `#D3D6DC` | Darker silver for folds and borders on silver |
| `--periwinkle` | `#93AEEB` | Wordmark and large display type **only** (see the contrast rule) |
| `--periwinkle-deep` | `#3F5BB0` | All small text, links, buttons, icons, stamps, the logo |
| `--cream` | `#FFF4E6` | Page background ("toast cream") and the box insert |
| `--crust` | `#C98A45` | Rare accent, such as a sale badge |
| `--ink` | `#3F5BB0` | Default body text (same as periwinkle-deep) |

### 3.2 Flavor color pairs

Each flavor has four colors:
- **ground:** the wrapper surface
- **ink:** the display color for the flavor name
- **deep:** the small-text color on that ground
- **fold:** the darker edge and shadow tone

**Classics: lighter, mellow.** Soft grounds and soft inks.

| Flavor | Ground | Ink (display) | Deep (small text) | Fold | Pair name |
|---|---|---|---|---|---|
| salted | `#F6E8A4` | `#93AEEB` | `#3F5BB0` | `#EBD98C` | gold foil × periwinkle |
| unsalted | `#E6E8EC` | `#93AEEB` | `#3F5BB0` | `#D3D6DC` | silver foil × periwinkle |
| honey | `#FCE3BE` | `#D9873A` | `#8A4A12` | `#EED0A4` | soft apricot × amber |
| garlic herb | `#E1EDCF` | `#6F9B4E` | `#3E5A26` | `#CCDDB6` | soft pistachio × herb |

**Culinary & holiday: bold.** Poppy pairs. Three of them use dark grounds.

| Flavor | Ground | Ink (display) | Deep (small text) | Fold | Pair name |
|---|---|---|---|---|---|
| hot honey | `#FFD8A8` | `#D93B8C` | `#A51E63` | `#EEC48F` | apricot × magenta |
| chili crisp | `#7A1E1E` | `#FF8A3D` | `#FF9A55` | `#5A1414` | oxblood × tangerine *(dark)* |
| white miso | `#E2D4F7` | `#2F8F55` | `#1F6B3E` | `#CFBFE8` | lilac × kelly green |
| caesar | `#D6EDB8` | `#E5583A` | `#B23A20` | `#C4DBA4` | pistachio × tomato |
| smoked sea salt | `#2E2C2B` | `#FFD23F` | `#FFD23F` | `#1A1918` | charcoal × yolk *(dark)* |
| french onion | `#F7D58A` | `#7B3FC4` | `#5A2A96` | `#E6C173` | golden × red-onion purple |
| cranberry orange *(holiday)* | `#FFDCC2` | `#D0103A` | `#9E0C2C` | `#EFC6A8` | pale orange × cranberry |
| brown butter sage *(holiday)* | `#4A2C1A` | `#B5D99C` | `#B5D99C` | `#2F1C10` | brown butter × sage *(dark)* |

**Salted vs. unsalted:** only the foil changes. Salted is gold and unsalted is silver, with the same ink and type. Shoppers already know this convention from the butter aisle, and it makes the two easy to tell apart.

Expose these as product metafields (`custom.color_ground`, `custom.color_ink`, `custom.color_deep`, `custom.color_fold`) so cards and product pages pick up each flavor's colors automatically. The classic/culinary split controls **color intensity only**. Single packs never carry a "classic" or "culinary" label. Groupings appear only as flight names.

### 3.3 Contrast rule (important)

The inks on light grounds are **low-contrast**, especially the mellow classics at about 1.8–2.1:1. Use the **ink** color only for display text **≥ 32px** (or ≥ 24px bold). Everything smaller uses the **deep** color, which passes WCAG AA (4.5:1) on its ground. That covers body text, prices, labels, buttons, and form text. On the dark grounds (chili crisp, smoked sea salt, brown butter sage), the ink is readable at any size.

### 3.4 CSS tokens

```css
:root {
  --foil: #F6E8A4;
  --foil-fold: #EBD98C;
  --silver: #E6E8EC;
  --silver-fold: #D3D6DC;
  --periwinkle: #93AEEB;
  --periwinkle-deep: #3F5BB0;
  --cream: #FFF4E6;
  --crust: #C98A45;

  --bg: var(--cream);
  --text: var(--periwinkle-deep);
  --display: var(--periwinkle);

  /* per-flavor, overridden on product templates from metafields */
  --flavor-ground: var(--foil);
  --flavor-ink: var(--periwinkle);
  --flavor-deep: var(--periwinkle-deep);
  --flavor-fold: var(--foil-fold);
}
```

---

## 4. Typography

Both faces are free on Google Fonts. If Shopify's font picker doesn't offer them, self-host the woff2 files in `assets/` or load them via `<link>` in `theme.liquid`.

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 4.1 Display: Fraunces, soft and wonky

The signature look comes from **variable-font settings**, not a separate font. Always set the axes.

```css
.display {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 900;
  font-variation-settings: 'SOFT' 100, 'WONK' 1, 'opsz' 144;
  letter-spacing: -0.045em;
  line-height: 0.8;
  text-transform: lowercase;
  color: var(--flavor-ink, var(--display));
}
```

- Use it for the wordmark, the hero line, the `wc` monogram, and **flavor names on packs and cards**.
- Headings H2–H3 use the same face at weight 800, `'opsz' 72`, line-height 0.95, and letter-spacing -0.03em.
- **Accent italic** (phrase stamp, pull-quotes, the "honey. also really good." moments): Fraunces italic 800 with `'SOFT' 100, 'WONK' 1`.

### 4.2 Details: DM Mono

Use DM Mono for body copy, nav, prices, product meta, buttons, forms, the footer, and all small print on packaging.

```css
body, .mono {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 400;          /* 500 for emphasis, nav, buttons */
  text-transform: lowercase;  /* except legal text and user-entered content */
  color: var(--text);
}
```

### 4.3 Scale (desktop → mobile)

| Role | Desktop | Mobile |
|---|---|---|
| Hero wordmark / hero line | 160–200px | 72–96px |
| H1 page title | 72px | 44px |
| H2 section | 44px | 32px |
| Flavor name on card | 40–48px | 32–36px |
| Body | 16px | 16px |
| Small / meta | 13–14px | 13px |

Long flavor names (`brown butter sage`, `cranberry orange`, `smoked sea salt`) stack one word per line on cards.

---

## 5. Voice & copy

- **Lowercase** everywhere except legal text and proper nouns that need capitals.
- **Plain and deadpan.** Say less. Pair each understated line with **one specific fact** (`cultured 48 hours`, `[BUTTERFAT]% butterfat`, `batch [__] · made [DATE]`) rather than adjectives.
- **Never:** exclamation points, puns ("butter believe it"), "artisanal," "elevate," "indulge," emoji, **flavor numbers** (`nº`), or "deal"/"save" language.

Sample lines you can use as-is:

- we made butter. it's really good.
- cultured 48 hours in portland, oregon.
- salted. really good. *honey. also really good.*
- keep cold. spread generously.
- soften 20 minutes before serving. freezes beautifully.

Product description pattern (two or three short sentences). Draft descriptions for all twelve flavors and the five add-ons are in the product catalog sheet's `Description` columns.

> **caesar.** cultured butter with parmesan, anchovy, garlic, and lemon. for steak, roast chicken, and the end of the loaf.

---

## 6. Surfaces & materials

### 6.1 Foil

Foil is the brand's main material and belongs to the **butter**. Its sheen is the only gradient allowed anywhere. The sheen sits on top of the flavor's ground, whether that's gold, silver, a pastel, or a dark color. Boxes and web blocks that aren't butter can be flat butter-yellow without the sheen.

```css
.foil {
  background-color: var(--flavor-ground, var(--foil));
  background-image:
    linear-gradient(112deg, rgba(255,255,255,0) 14%, rgba(255,255,255,.6) 27%, rgba(255,255,255,0) 40%,
                            rgba(255,255,255,0) 58%, rgba(255,255,255,.38) 69%, rgba(255,255,255,0) 80%),
    repeating-linear-gradient(31deg, rgba(176,146,50,.06) 0 2px, rgba(255,255,255,.07) 2px 6px);
  border-radius: 6px;
  box-shadow: 0 2px 0 var(--flavor-fold, var(--foil-fold)), 0 18px 34px rgba(120,95,40,.22), 0 4px 8px rgba(120,95,40,.12);
}
```

- Hero and feature blocks may sit **rotated −2.5° to −3°**, like a butter brick dropped on the table. Do this once per page at most.
- The wrapper's end folds are subtle triangles in the flavor's fold color at the left and right edges.

### 6.2 Radii, borders, shadow

- Radius: **6px** for cards, buttons, and inputs. **999px** for pills, stamps, and dots. Nothing in between.
- Borders: **1.5px** solid `--periwinkle-deep`, or the flavor's deep color.
- Only foil gets the shadow above. Everything else is flat.

### 6.3 Spacing

Use an 8px base unit with steps of 8 / 16 / 24 / 40 / 64 / 96. Content max-width is **1200px**, with side gutters of 24px on mobile and 48px on desktop. Leave generous space around the wordmark.

---

## 7. Components

**Header.** Cream background. On the left, the `wicz craft` wordmark (display, 28–32px, single line). On the right, mono nav (`shop`, `build a box`, `flights`, `about`, `cart (0)`) at weight 500, 14px. A 1.5px deep periwinkle line runs along the bottom.

**Hero.** A full-width photo of the gold-foil salted 8 oz block, rotated about −2.5°, on cream, with empty space for type (a taller crop on mobile). Over it, as live HTML: a stacked `really / good / butter` (or `wicz / craft`) in periwinkle display at 160–200px, a mono detail column (`cultured butter`, `cultured 48 hours`, `portland, oregon`), and the phrase stamp. This replaces the earlier CSS foil-block hero.

**Phrase stamp.** A circle 120–170px across with a 2px deep border, rotated 12°. Inside, *it's / really / good.* in italic display at 22–26px, deep color. Use it on the hero and the about page, at most once per page.

**Logo stamp.** See §2.1. On the web, it appears in the footer and on the about page, and as an embossed detail in product imagery.

**Product card / pack.**
- The background is the flavor's **ground** with the foil sheen.
- `wicz craft` sits top-left in mono (deep).
- The flavor name is set in display, in the flavor's **ink** (40–48px).
- `cultured 48 hours` sits at the bottom in mono (deep).
- Seasonal flavors get an outlined `holiday` pill top-right (1.5px deep border, deep text, mono 13px).
- The price goes below the card in mono.
- No drop shadow on hover. Instead, the card moves up 2px and its bottom border darkens to the flavor's fold color.

**Add-on card.** For the five add-ons, which aren't butter, so no foil. Cream card with a 1.5px `--periwinkle-deep` border and 6px radius. The add-on's pack shot fills the top. Below it: the name in an H3, a one-line description in mono, and the price. A secondary button (`add`) adds it to the cart in place. In the cart and checkout upsell rows, use a compact version: a 64px thumbnail, name, price, and `add`.

**Buttons.**
- Primary: `--periwinkle-deep` fill, `--cream` text, DM Mono 500 lowercase 15px, 6px radius, padding 14px × 22px.
- Secondary: transparent, with a 1.5px deep border and deep text.
- On a flavor page, the primary button uses that flavor's deep color with cream text. On the dark grounds, use the ink as the fill and the ground as the text.

**Flavor pill / tag.** 999px radius, background in the flavor's deep color, ground-colored text, mono 13px, lowercase.

**Flavor dots.** A row of 22px circles, each filled with a flavor's ground and ringed 3px in its ink. Unsalted's dot is silver. Use them to show what's inside a box. An empty slot is a 22px circle with a 1.5px dashed deep border.

**Builder tray.** A row of slots that matches the chosen box format: one large slot for the 8 oz plus small slots for the 2 oz cubes. Each filled slot shows that flavor's foil card in miniature, and empty slots are dashed. Show the running count in mono (`3 of 4 picked`) and the fixed box price.

**Footer.** Butter-yellow background. It holds a large stacked `wicz / craft` wordmark, the logo stamp, the mono location line, one sample voice line, and a `gift cards` link.

---

## 8. Catalog & pricing

### 8.1 Singles

Twelve flavors, each with a `size` option of **8 oz** or **2 oz**. Products are named by flavor only, never by number.

| Product | Intensity | Price tier | 8 oz | 2 oz | Seasonal |
|---|---|---|---|---|---|
| salted | mellow | plain | $14 | $5 | |
| unsalted | mellow | plain | $14 | $5 | |
| honey | mellow | flavored | $16 | $6 | |
| garlic herb | mellow | flavored | $16 | $6 | |
| hot honey | bold | flavored | $16 | $6 | |
| chili crisp | bold | flavored | $16 | $6 | |
| white miso | bold | flavored | $16 | $6 | |
| caesar | bold | flavored | $16 | $6 | |
| smoked sea salt | bold | flavored | $16 | $6 | |
| french onion | bold | flavored | $16 | $6 | |
| cranberry orange | bold | flavored | $16 | $6 | holiday |
| brown butter sage | bold | flavored | $16 | $6 | holiday |

"Intensity" is internal. It only sets the color treatment and is never shown to customers.

### 8.2 Boxes: the builder and flights

The **box builder** handles every multi-flavor purchase. The customer picks a format, then fills its slots. Each format has one **flat price**, no matter which flavors are chosen.

**Pricing rule:** each format costs about 10% less than buying the same items as singles (counting every 2 oz pick as flavored), rounded to a clean number. Plain picks inside a box don't lower the price. Keep it simple.

| Format | Contents | Box size (§10) | Singles total | Box price |
|---|---|---|---|---|
| four | 4 × 2 oz, any flavors | small | $24 | **$21** |
| six | 6 × 2 oz, any flavors | medium | $36 | **$32** |
| eight | 8 × 2 oz, any flavors | large | $48 | **$42** |
| one big, two small | 1 × 8 oz **classic** + 2 × 2 oz, any flavors | medium | $26 | **$23** |
| one big, four small | 1 × 8 oz **classic** + 4 × 2 oz, any flavors | large | $38 | **$34** |

In the "one big" formats, the 8 oz is one of the four classics: salted, unsalted, honey, or garlic herb. The box price stays flat whichever one is picked (decided Nov 21, 2026). Honey and garlic herb show the foil pack in the builder until top-down block photos (`builder-block-honey.png`, `builder-block-garlic-herb.png`) are shot.

**Flights** are presets of the *eight* format, at **$42**:

| Flight | Contents (8 × 2 oz) | Seasonal |
|---|---|---|
| classics + culinary | salted, unsalted, honey, garlic herb, hot honey, chili crisp, caesar, french onion | |
| classics + holiday | salted, unsalted, honey, garlic herb, cranberry orange ×2, brown butter sage ×2 | holiday |
| culinary + holiday | hot honey, chili crisp, white miso, caesar, smoked sea salt, french onion, cranberry orange, brown butter sage | holiday |

Holiday flights come off the site after the season. Flight pages include a "make it your own" link that opens the builder pre-filled with that flight.

Show the saving plainly in mono, e.g. `$48 if bought separately`. Never "deal" or "save."

**Shopify implementation notes:**
- Create a "build a box" product with one variant per format.
- Record the picks as line-item properties (`big: salted`, `slot 1: caesar`, …).
- Make each flight its own product that adds a pre-filled box.
- Validate the slot count before add-to-cart.
- Shopify's native Bundles app is an alternative, but a custom builder section is the intended practice build.

### 8.3 Cost notes (internal)

- Cream costs $4.78/quart (40% fat). One quart yields about 15 oz of butter after losses, which puts cream at **about $0.32 per oz of butter**: roughly $2.55 per 8 oz and $0.64 per 2 oz.
- Target: ingredients plus packaging at or below **about ⅓ of price**. Cream alone is 11–18% of these prices.
- [PACKAGING COST per 8 oz wrap / 2 oz wrap / small, medium, large box / sticker]
- [FLAVOR INGREDIENT COST per flavor]. Caesar (parmesan, anchovy) and chili crisp will cost the most.
- [ADD-ON COST per item]. Add-ons are bought in and branded, so check each one's margin against its price in §8.5.
- Byproduct: about 2 cups of buttermilk per quart.

### 8.4 Product data

The full per-flavor data lives in the **[Wicz Craft — product catalog](https://claude.ai/artifact/GRfWvbN4wi2p8jJoLKZ7Hs)** sheet. Its columns map to Shopify like this:

| Sheet column | Shopify field |
|---|---|
| Flavor | product title |
| Handle | product handle |
| 8 oz / 2 oz | `size` variant prices |
| Description | product description |
| Ingredients | `custom.ingredients` |
| Allergens | `custom.allergens` |
| Pairs with | `custom.pairs_with` |
| Best within | `custom.best_within` |
| Seasonal | `custom.seasonal` |
| Ground / Ink / Deep / Fold | `custom.color_ground`, `custom.color_ink`, `custom.color_deep`, `custom.color_fold` |

**Metafields:** `custom.color_ground`, `custom.color_ink`, `custom.color_deep`, `custom.color_fold`, `custom.seasonal`, `custom.price_tier` (plain / flavored), `custom.ingredients`, `custom.pairs_with` (e.g. "warm bread, radishes"), `custom.allergens`, `custom.best_within`. Flights also get `custom.flight_contents`, a list of flavor handles.

**Facts:**
- Culturing: **48 hours** (confirmed)
- Cream: 40% fat (confirmed). Source: [CREAM SOURCE], which is needed before using "grass-fed."
- Finished butterfat: [BUTTERFAT %]. Finished butter must be ≥ 80% in the US.
- Batch size: [BATCH SIZE]

**Ingredients** (drafts until marked `confirmed` in the sheet):

| Flavor | Ingredients | Allergens |
|---|---|---|
| salted | cultured cream, sea salt | milk |
| unsalted | cultured cream | milk |
| honey | cultured cream, honey, sea salt | milk |
| garlic herb | cultured cream, roasted garlic, parsley, thyme, chives, sea salt, black pepper | milk |
| hot honey | cultured cream, honey, chili flakes, apple cider vinegar, sea salt | milk |
| chili crisp | cultured cream, sunflower oil, chili flakes, fried shallot, fried garlic, sichuan peppercorn, sugar, sea salt | milk |
| white miso | cultured cream, white miso (soybeans, rice, salt, koji) | milk, soy |
| caesar | cultured cream, parmesan, anchovy, garlic, lemon zest, black pepper | milk, fish |
| smoked sea salt | cultured cream, smoked sea salt | milk |
| french onion | cultured cream, caramelized onion, gruyère, thyme, sea salt, black pepper | milk |
| cranberry orange | cultured cream, dried cranberries (cranberries, cane sugar, sunflower oil), orange zest, sea salt | milk |
| brown butter sage | cultured cream (part browned), sage, sea salt | milk |

**Allergens:** every product lists its allergens as *contains: milk.*, *contains: milk, soy.* (white miso), or *contains: milk, fish.* (caesar). Boxes list the combined allergens of everything inside.

**Care line** (every product page): keep cold. soften 20 minutes before serving. best within 2–3 weeks, or freeze. For **garlic herb, caesar, and french onion**, the line says *best within 1 week, or freeze.* instead, because of the garlic, anchovy, and onion. A box that holds any of those uses the 1-week line.

### 8.5 Add-ons

Five add-ons go with the butter. Four are physical goods bought in and branded with the mold. The fifth is a Shopify gift card. They're on the catalog's `Add-ons` tab.

| Add-on | Price | Handle | What it is | Where it's offered |
|---|---|---|---|---|
| spreader | $12 | `butter-spreader` | maple butter spreader, the mold burned into the handle | checkout add-on · every butter page |
| butter keeper | $30 | `butter-keeper` | cream-glazed french butter keeper (butter bell) with a thin periwinkle rim | 8 oz product pages · cart |
| butter board | $34 | `butter-board` | small maple paddle board, the mold branded near the handle | flight and box pages · cart gift add-on |
| flaky salt | $7 | `flaky-salt` | flaky sea salt in a small tin, butter-yellow lid with the mold | unsalted page · checkout add-on |
| gift card | $25 / $50 / $100 | `gift-card` | digital Shopify gift card, good for pickup or local delivery. **Coming soon** (see below) | nav · footer · collection pill |

Prices are set against what similar goods sell for: handmade maple spreaders run about $11–12, Butter Bell crocks about $31–35, small maple paddle boards about $30–35, and small flaky-salt tins about $5–7. Sizes are still open: [SPREADER LENGTH], [KEEPER CAPACITY], [BOARD DIMENSIONS], [SALT NET WT].

- **No foil.** Add-ons aren't butter, so they use the add-on card (§7), not the foil card.
- **Gift card, coming soon (Nov 21, 2026):** not on sale yet. `nav`, the footer and the `gift cards` pill go to `/pages/gift-cards`: the $50 card front, `coming soon.`, one line of copy, and an email signup (`tell me`). Signups become customers subscribed to email, tagged `waitlist: gift cards`. The gift card stays out of the cart upsell row until it launches.
- **Gift card front:** a vector design, not a photo. Butter-yellow card, the mold, the `wicz craft` wordmark, *a gift of really good butter.*, and the amount. One image per amount.
- **Copy:** same voice as the butter. Descriptions are in the catalog's `Description` column.
- **Allergens:** none of the add-ons contain milk. The flaky salt page lists `ingredients: sea salt.` and no allergen line.
- **Shopify:** the spreader, keeper, board, and salt are ordinary products in an `add-ons` collection. Use Shopify's complementary products (Search & Discovery) for the "where it's offered" spots, or a custom cart upsell section. The gift card is a Shopify gift card product with $25, $50, and $100 denominations.

---

## 9. Pages

- **Home:** hero → flavor grid (12 cards, 4 across on desktop and 2 on mobile, classics first) → flights row (3 cards with flavor dots) → "build a box" call-out → one-line story ("we made butter. it's really good.") with the phrase stamp → footer.
- **Collection:** cream background, mono filter chips (e.g. `all`, `holiday`, `flights`, `add-ons`), and cards as described in §7.
- **Product (single):** the page picks up the flavor's colors through CSS variables. A large foil image area sits on the left, ideally showing the embossed stamp on the cube. Details go on the right: name (display), price, size selector as pills (`8 oz` / `2 oz`), primary button, ingredients, allergens, care line, `pairs with`. Below it, a `goes with` row of add-on cards (§8.5 says which).
- **Add-on product:** cream page, no flavor colors. Pack shot, in-use shot, and detail shot on the left. Name, price, description, size, and the primary button on the right. Below it, a `goes with` row of three butter cards.
- **Gift cards, coming soon:** the card front, `coming soon.`, one line of copy, and an email field with a `tell me` button. Once live: the card front image, amount pills (`$25` / `$50` / `$100`), recipient fields, and the primary button.
- **Build a box:**
  1. **Choose a format:** five pill-cards showing contents and price.
  2. **Fill the slots:** the big slot offers the four classics. Below it, show the flavor grid with a `+` on each card, and keep the builder tray (§7) sticky with the count and fixed price.
  3. **Add to cart:** the button stays disabled until every slot is full.
- **Flight:** the same layout as a single product, plus flavor dots, the "if bought separately" line, a window-box image, a "make it your own" link into the builder, and a butter board add-on card.
- **About:** short. Three or four voice lines, the phrase stamp, the logo stamp, and the location line.
- **Cart:** flat cream background with mono throughout. Flat butter-yellow appears only on the checkout summary block. Boxes list their picks under the line item. One compact upsell row sits under the items (spreader, butter keeper, or board, by what's in the cart). Never more than one row.

---

## 10. Packaging

### 10.1 The butter

- **Wraps:** each cube or block is wrapped in its flavor's foil color (§3.2). Unsalted is silver.
- **Emboss:** the logo stamp ("the mold," §2.1) is pressed into the top of every 2 oz cube and 8 oz block. No ink goes on the butter itself.
- **Sizes:** a 2 oz cube is about **1.6″** on a side. An 8 oz block takes up the space of four cubes (2×2 cells).

### 10.2 The window box

Bundles ship in a **matte butter-yellow paperboard box** (`#F6E8A4`, flat, no sheen) with a **clear window** across the top, so the colored foil cubes show through. The foil stays on the butter and the box stays quiet. Inside, a **cream insert** with dividers sits on a **1.6″ grid**.

| Box | Grid | Holds |
|---|---|---|
| small | 2×2 | four, or one 8 oz block |
| medium | 2×3 | six, or one big, two small |
| large | 2×4 | eight (all flights), or one big, four small |

- **Top:** a band with the `wicz craft` wordmark (deep periwinkle) and the format name in mono. The window takes up the rest.
- **Window film:** PET is the clearest. PLA is compostable but a little hazier. [CHOOSE]
- **Seal:** the logo stamp on a round cream sticker, overlapping a corner of the window.
- **Sides:** plain butter-yellow with the wordmark and `cultured butter · portland, oregon · keep cold`. Batch and date are **hand-stamped in periwinkle ink**, a little crooked (`batch [__] · made [DATE]`). No stripes.
- **Box height:** about 1.75″, so the cubes clear the film.
- **Contents sticker:** printed per order and placed on the bottom or a short side. It lists `inside` and the format name, one line per flavor with its dot and size, batch, date, combined allergens, and `keep cold. spread generously.`
- **Add-ons in an order** ride beside the window box, not inside it. A spreader can tuck under the box's seal band.

### 10.3 Keeping it cold

The window box isn't insulated. That's fine, because orders are **local only**: pickup and hand delivery in Portland. There's no shipping.

---

## 11. Imagery

- Product shots, or rendered placeholders, show **foil-wrapped butter in its flavor colors** with the stamp embossed on top, on a cream ground. Shoot top-down or at a slight 3/4 angle, with soft shadows.
- Bundle shots show the **window box** from above with the cubes visible.
- **In situ shots** show the unwrapped butter, stamp up, on a **wooden butter board, a wooden or bamboo cutting board, or a nice plate**, with a butter knife beside it and a swipe taken out. Next to it is **one food that suits the flavor** (bread, a cracker, a potato) with the butter spread on it. The food comes from that flavor's `pairs with` metafield. Rotate the boards and plates across flavors so the set doesn't repeat. Keep the framing tight and the surfaces pale.
- **Add-on shots:** three per item (pack shot alone on cream, in use with the butter, and a detail). Generate the spreader, board, and salt tin plain and composite the mold in post so it always matches the logo. Where an in situ butter shot shows a board or spreader, prefer the Wicz Craft ones, so the add-ons appear across the site.
- **The audience is foodies.** Style the food the way Food52 or Smitten Kitchen would: natural window light, real crumbs and a little mess, and specific foods (a liege waffle, a crumpet, delicata squash) rather than generic ones. No pancakes.
- Images are AI-generated (Gemini) on **plain wrappers**. The type (`wicz craft`, the flavor name, `cultured 48 hours`) is rendered from the real fonts and added in post, so it's always spelled and set correctly. Builder pieces are overhead shots of each cube and block with transparent backgrounds, composited into photos of the empty box insert. The full shot list is the "Wicz Craft — website image shot list" sheet.
- Until an image exists, build a placeholder in CSS with the `.foil` class plus the wordmark. Don't use stock photos.
- No people, kitchens, wheat fields, cows, or holiday props. A board or plate with food on it is fine. A kitchen counter scene is not.

---

## 12. Don'ts (quick checklist)

- Don't number flavors (`nº`) anywhere.
- Don't use stripes anywhere: not on packaging, the web, or as decoration.
- Don't use periwinkle or any other light ink for small text.
- Don't label single packs "classic" or "culinary." Intensity is shown through color only, and groupings appear only as flight names.
- Don't use gold foil for unsalted. Unsalted is always silver.
- Don't use gradients other than the foil sheen, and use the sheen only on butter or foil blocks.
- Don't put add-ons on foil cards.
- Don't use radii other than 6px or 999px.
- Don't set headlines in Title Case or ALL CAPS. The brand is lowercase.
- Don't use exclamation points, puns, emoji, or "deal"/"save" language.
- Don't use Fraunces without the `SOFT 100 / WONK 1` settings. It looks generic without them.
- Don't mix in the Wicz Craft holiday label fonts (Cormorant/EB Garamond).
- Don't use more than one rotated element or one phrase stamp per web page.
- Don't show more than one upsell row in the cart.
- Don't put the logo in more than one color, and don't ink it onto the butter.
