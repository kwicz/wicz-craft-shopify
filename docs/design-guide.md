# Wicz Craft — Shopify Design Guide

This guide is the design spec for the Wicz Craft Shopify storefront, a practice store selling homemade cultured butter. The **name** is Wicz Craft. **Everything else** (color, type, voice, layout, components) follows the "Really Good Butter" visual system below.

> **For the agent:** This document is the source of truth. When something isn't covered, choose the plainer, quieter option. Don't add gradients (except the foil sheen in §6), emoji, exclamation points, stock lifestyle photos, butter puns, or flavor numbers. Use a bracketed placeholder like `[PRICE]` wherever a fact is missing. Never invent one.

> **Revision (Nov 21, 2026):** The store is back on the **bright** system, where every flavor has its own ground and ink pair, now for twelve flavors. The **classics** get lighter, mellow pairs. The **culinary and holiday** flavors get bold, poppy pairs. **Unsalted** is distinguished from salted by **silver foil**. Sizes are **8 oz and 2 oz**. Multi-flavor sales go through a **box builder**, and the flights are presets of it (§8.2). A muted-band "quieter" direction was tried and dropped. The canvas "Wicz Craft — current vs. quieter" shows every version, and the "bright" row is current. Background research is in `premium-butter-market-research.md`.

---

## 1. Brand in one paragraph

Wicz Craft makes small-batch cultured butter in Portland, Oregon. The cream is cultured for 48 hours. The look is **mod-dairy**: foil wrappers, a soft and slightly wonky heavy serif, and a typewriter-style monospace for details. Each flavor wears one ground color and one ink color. The classics are soft and mellow, and the culinary flavors are loud. The voice is plain, lowercase, and a little deadpan, and every understated claim is backed by one specific fact.

---

## 2. Name & wordmark

- **Store name:** Wicz Craft
- **Wordmark:** `wicz craft`, lowercase, set in the display face (§4). Stack it on two lines (`wicz` / `craft`) when there's room. Use one line in the header.
- **Descriptor / tagline:** `really good butter`. Set it in the mono face under or beside the wordmark, or use it as the hero line.
- **Stamp line:** *it's really good.* (italic display, inside a circular stamp, §7)
- **Process line:** `cultured 48 hours`. It goes on every pack.
- **Location line:** `cultured butter · portland, oregon`. Add back `grass-fed cream` only once the cream source is confirmed. It has to be literally true.

Don't use the Wicz Craft **holiday gift labels** styling here (Cormorant/EB Garamond, white labels, "Winter Solstice Collection"). That's a separate family gift project.

---

## 3. Color

### 3.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `--foil` | `#F6E8A4` | Gold foil: the primary brand surface, hero blocks, and salted |
| `--foil-fold` | `#EBD98C` | Darker gold for folds, borders on foil, and hover on foil |
| `--silver` | `#E6E8EC` | Silver foil, for **unsalted** only |
| `--silver-fold` | `#D3D6DC` | Darker silver for folds and borders on silver |
| `--periwinkle` | `#93AEEB` | Wordmark and large display type **only** (see the contrast rule) |
| `--periwinkle-deep` | `#3F5BB0` | All small text, links, buttons, icons, and stamps |
| `--cream` | `#FFF4E6` | Page background ("toast cream") |
| `--crust` | `#C98A45` | Rare accent, such as a sale badge |
| `--ink` | `#3F5BB0` | Default body text (same as periwinkle-deep) |

### 3.2 Flavor color pairs

Each flavor has four colors:
- **Ground:** the wrapper surface.
- **Ink:** the display color for the flavor name.
- **Deep:** the small-text color on that ground.
- **Fold:** the darker edge and shadow tone.

**Classics: lighter and mellow.** Soft grounds with soft inks.

| Flavor | Ground | Ink (display) | Deep (small text) | Fold | Pair name |
|---|---|---|---|---|---|
| salted | `#F6E8A4` | `#93AEEB` | `#3F5BB0` | `#EBD98C` | gold foil × periwinkle |
| unsalted | `#E6E8EC` | `#93AEEB` | `#3F5BB0` | `#D3D6DC` | silver foil × periwinkle |
| honey | `#FCE3BE` | `#D9873A` | `#8A4A12` | `#EED0A4` | soft apricot × amber |
| garlic herb | `#E1EDCF` | `#6F9B4E` | `#3E5A26` | `#CCDDB6` | soft pistachio × herb |

**Culinary & holiday: bold.** Poppy pairs, three of them on dark grounds.

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

**Salted vs. unsalted:** the only difference is the foil. Salted is gold, unsalted is silver, and the ink and type are the same. Shoppers already know this convention from the butter aisle, and it makes the two easy to tell apart.

Expose these as product metafields (`custom.color_ground`, `custom.color_ink`, `custom.color_deep`, `custom.color_fold`) so cards and product pages pick up each flavor's colors automatically. The classic/culinary split controls **color intensity only**. Single packs never carry a "classic" or "culinary" label. Groupings appear only as flight names.

### 3.3 Contrast rule (important)

The inks on light grounds are **low-contrast**, especially on the mellow classics (about 1.8–2.1:1). Use the **ink** color only for display text **≥ 32px** (or ≥ 24px bold). Everything smaller uses the **deep** color, which passes WCAG AA (4.5:1) on its ground. That includes body text, prices, labels, buttons, and form text. On the dark grounds (chili crisp, smoked sea salt, brown butter sage), the ink is readable at any size.

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

Both faces are free on Google Fonts. If Shopify's font picker doesn't offer them, self-host the woff2 files in `assets/` or load them with a `<link>` in `theme.liquid`.

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

- Use it for the wordmark, the hero line, and **flavor names on packs and cards**.
- H2–H3 headings use the same face at weight 800, `'opsz' 72`, line-height 0.95, and letter-spacing -0.03em.
- **Accent italic** (stamps, pull-quotes, the "honey. also really good." moments): Fraunces italic 800, `'SOFT' 100, 'WONK' 1`.

### 4.2 Details: DM Mono

Use it for body copy, nav, prices, product meta, buttons, forms, and the footer.

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

On cards, long flavor names (`brown butter sage`, `cranberry orange`, `smoked sea salt`) stack one word per line.

---

## 5. Voice & copy

- **Lowercase** everywhere except legal text and proper nouns that need capitals.
- **Plain and deadpan.** Say less. Pair each understated line with **one specific fact**, such as `cultured 48 hours`, `[BUTTERFAT]% butterfat`, or `batch [__] · made [DATE]`. Use facts instead of adjectives.
- **Never:** exclamation points, puns ("butter believe it"), "artisanal," "elevate," "indulge," emoji, **flavor numbers** (`nº`), or "deal"/"save" language.

Sample lines you can use as-is:

- we made butter. it's really good.
- cultured 48 hours in portland, oregon.
- salted. really good. *honey. also really good.*
- keep cold. spread generously.
- soften 20 minutes before serving. freezes beautifully.

Product description pattern (two or three short sentences):

> **caesar.** cultured butter with [INGREDIENTS]. for steak, roast chicken, and the end of the loaf.

---

## 6. Surfaces & materials

### 6.1 Foil

Foil is the brand's main material, and the foil sheen is the only gradient allowed anywhere on the site. The sheen sits on top of whatever the flavor's ground is: gold, silver, a pastel, or a dark ground.

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

- Hero and feature blocks may sit **rotated −2.5° to −3°**, like a butter brick dropped on the table. Do this at most once per page.
- The wrapper's end folds are subtle triangles in the flavor's fold color at the left and right edges.

### 6.2 Radii, borders, shadow

- Radius: **6px** for cards, buttons, and inputs. **999px** for pills, stamps, and dots. Nothing in between.
- Borders: **1.5px** solid `--periwinkle-deep`, or the flavor's deep color.
- Only foil gets the shadow above. Everything else is flat.

### 6.3 Spacing

Use an 8px base unit with steps of 8, 16, 24, 40, 64, and 96. Content max-width is **1200px**, with side gutters of 24px on mobile and 48px on desktop. Leave generous space around the wordmark.

---

## 7. Components

**Header.** Cream background. The `wicz craft` wordmark sits on the left (display, 28–32px, single line). Mono nav sits on the right (`shop`, `build a box`, `flights`, `about`, `cart (0)`), weight 500, 14px. The bottom border is a 1.5px deep periwinkle line.

**Hero.** A large gold foil block, rotated about −2.5°, holds a stacked `really / good / butter` (or `wicz / craft`) in periwinkle display at 160–200px. A mono detail column sits top-right (`cultured butter`, `cultured 48 hours`, `portland, oregon`). A stamp overlaps the lower-right corner.

**Stamp.** A circle 120–170px across with a 2px deep border, rotated 12°. Inside it, *it's / really / good.* is set in italic display at 22–26px in the deep color. Use it on the hero, the about page, and inside box lids, at most once per page.

**Product card / pack.** The background is the flavor's **ground** with the foil sheen. `wicz craft` sits top-left in mono (deep). The flavor name is set in display in the flavor's **ink** (40–48px). `cultured 48 hours` sits at the bottom in mono (deep). Seasonal flavors get an outlined `holiday` pill top-right (1.5px deep border, deep text, mono 13px). The price goes below the card in mono. Hover adds no drop shadow. Instead, the card moves up 2px and the bottom border darkens to the flavor's fold color.

**Buttons.**
- Primary: `--periwinkle-deep` fill, `--cream` text, DM Mono 500 lowercase 15px, 6px radius, padding 14px × 22px.
- Secondary: transparent, with a 1.5px deep border and deep text.
- On a flavor page, the primary button uses that flavor's deep color with cream text. On the dark grounds, the ink is the fill and the ground is the text.

**Flavor pill / tag.** 999px radius, background in the flavor's deep color, ground-colored text, mono 13px, lowercase.

**Flavor dots.** A row of 22px circles, each filled with a flavor's ground and ringed 3px in its ink. Unsalted's dot is silver. Use dots to show what's inside a box. An empty slot is a 22px circle with a 1.5px dashed deep border.

**Carton stripes.** Vertical stripes 20px wide, alternating ground and ink. Use them as a decorative band on box and flight pages, inside box lids, and in the footer.

**Builder tray.** A row of slots matching the chosen box format: one large slot for the 8 oz plus small slots for the 2 oz cubes. Each filled slot shows that flavor's foil card in miniature, and empty slots are dashed. Show the running count in mono (`3 of 4 picked`) and the fixed box price.

**Footer.** Gold foil background (the salted pair). It holds a large stacked `wicz / craft` wordmark, the mono location line, and one sample voice line. A carton-stripe band across the top is optional.

---

## 8. Catalog & pricing

### 8.1 Singles

There are twelve flavors, each with a `size` option of **8 oz** or **2 oz**. Products are named by flavor only, never by number.

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

"Intensity" is internal and only sets the color treatment. It's never shown to customers.

### 8.2 Boxes: the builder and flights

The **box builder** handles every multi-flavor purchase. A customer picks a format and then fills its slots. Each format has one **flat price** no matter which flavors are chosen.

**Pricing rule:** each format costs roughly 10% less than buying the same butter as singles (counting all 2 oz picks as flavored), rounded to a clean number. Plain picks inside a box don't lower the price. Keep it simple.

| Format | Contents | Singles total | Box price |
|---|---|---|---|
| four | 4 × 2 oz, any flavors | $24 | **$21** |
| six | 6 × 2 oz, any flavors | $36 | **$32** |
| eight | 8 × 2 oz, any flavors | $48 | **$42** |
| one big, two small | 1 × 8 oz **salted or unsalted** + 2 × 2 oz, any flavors | $26 | **$23** |
| one big, four small | 1 × 8 oz **salted or unsalted** + 4 × 2 oz, any flavors | $38 | **$34** |

The 8 oz in the "one big" formats is the everyday butter, so it's salted or unsalted only. [DECIDE: allow a flavored 8 oz for +$2?]

**Flights** are presets of the *eight* format at **$42**:

| Flight | Contents (8 × 2 oz) | Theme pair | Seasonal |
|---|---|---|---|
| classics + culinary | salted, unsalted, honey, garlic herb, hot honey, chili crisp, caesar, french onion | gold foil × periwinkle | |
| classics + holiday | salted, unsalted, honey, garlic herb, cranberry orange ×2, brown butter sage ×2 | pale orange × cranberry | holiday |
| culinary + holiday | hot honey, chili crisp, white miso, caesar, smoked sea salt, french onion, cranberry orange, brown butter sage | brown butter × sage | holiday |

Holiday flights come off the site after the season. Flight pages include a "make it your own" link that opens the builder pre-filled with that flight, so customers can swap flavors.

Show the saving plainly in mono, for example `$48 if bought separately`. Don't use "deal" or "save."

**Shopify implementation notes:**
- Make a "build a box" product with one variant per format.
- Store each pick as a line-item property (`big: salted`, `slot 1: caesar`, …).
- Make each flight its own product that adds a pre-filled box.
- Validate the slot count before add-to-cart.
- Shopify's native Bundles app is an alternative, but a custom builder section is the intended practice build.

### 8.3 Cost notes (internal)

- Cream is $4.78/quart (40% fat). One quart yields about 15 oz of butter after losses, so cream costs **about $0.32 per oz of butter**: roughly $2.55 per 8 oz and $0.64 per 2 oz.
- Target: keep ingredients plus packaging at or below **about ⅓ of price**. Cream alone is 11–18% of these prices.
- [PACKAGING COST per 8 oz / 2 oz / box]
- [FLAVOR INGREDIENT COST per flavor]. Caesar (parmesan, anchovy) and chili crisp will cost the most.
- Byproduct: about 2 cups of buttermilk per quart.

### 8.4 Product data

**Metafields:** `custom.color_ground`, `custom.color_ink`, `custom.color_deep`, `custom.color_fold`, `custom.seasonal`, `custom.price_tier` (plain / flavored), `custom.ingredients`, `custom.pairs_with` (e.g. "warm bread, radishes"), and `custom.allergens`. Flights also get `custom.flight_contents`, a list of flavor handles.

**Facts:**
- Culturing: **48 hours** (confirmed)
- Cream: 40% fat (confirmed). Source: [CREAM SOURCE]. This is needed before saying "grass-fed."
- Finished butterfat: [BUTTERFAT %]. Finished butter must be at least 80% in the US.
- Batch size: [BATCH SIZE]

**Ingredients** (placeholders to confirm):
- salted: cultured cream, sea salt
- unsalted: cultured cream
- honey: cultured cream, honey, sea salt
- all other flavors: [INGREDIENTS]

**Allergens:** every product says *contains: milk.* If caesar is made with anchovy, it says *contains: milk, fish.* Boxes list the combined allergens of what's inside.

**Care line** (every product page): keep cold. soften 20 minutes before serving. best within 2–3 weeks, or freeze.

---

## 9. Pages

- **Home:** hero → flavor grid (12 cards, 4 across on desktop and 2 on mobile, classics first) → flights row (3 cards with flavor dots) → a "build a box" call-out → a one-line story ("we made butter. it's really good.") with the stamp → footer.
- **Collection:** cream background, mono filter chips (e.g. `all`, `holiday`, `flights`), and cards as in §7.
- **Product (single):** the page picks up the flavor's colors through CSS variables. A large foil image area sits on the left. The right side holds the name (display), price, size selector as pills (`8 oz` / `2 oz`), primary button, ingredients, care line, and `pairs with`.
- **Build a box:**
  1. Choose a format. Show five pill/cards with the contents and price.
  2. Fill the slots. If the format has a big slot, offer salted or unsalted for it. Below that, show the flavor grid with a `+` on each card. The builder tray (§7) stays visible and sticky, and shows the count and the fixed price.
  3. Add to cart. The button is disabled until every slot is filled.
- **Flight:** the same layout as a single product, plus flavor dots, a carton-stripe band, the "if bought separately" line, and a "make it your own" link into the builder.
- **About:** short. Three or four voice lines, the stamp, and the location line.
- **Cart:** flat cream background and mono throughout. Foil appears only on the checkout summary block. Boxes list their picks under the line item.

---

## 10. Imagery

- Product shots (or rendered placeholders) show **foil-wrapped butter in its flavor colors** on a cream ground, shot top-down or at a slight 3/4 angle with soft shadows.
- Until real photos exist, build placeholders in CSS using the `.foil` class plus the wordmark. Don't use stock photos.
- No people, kitchens, wheat fields, cows, or holiday props.

---

## 11. Don'ts (quick checklist)

- Don't number flavors (`nº`) anywhere.
- Don't use periwinkle or any other light ink for small text.
- Don't label single packs "classic" or "culinary". Intensity is shown through color only, and groupings appear only as flight names.
- Don't put unsalted in gold foil. Unsalted is always silver.
- Don't use gradients other than the foil sheen.
- Don't use radii other than 6px or 999px.
- Don't use Title Case or ALL CAPS in headlines. The brand is lowercase.
- Don't use exclamation points, puns, emoji, or "deal"/"save" language.
- Don't use Fraunces without the `SOFT 100 / WONK 1` settings. It looks generic without them.
- Don't mix in the Wicz Craft holiday label fonts (Cormorant/EB Garamond).
- Don't use more than one rotated element or more than one stamp per page.
