// @ts-check

/**
 * box-expand: turns a "build a box" line into the butters picked for it.
 *
 * The theme adds the box as one line: the variant for the chosen format
 * (four, six, eight, one big two small, one big four small), at that
 * format's flat price, with a hidden `_components` property listing the
 * picked butter variant ids, big slot first, e.g. "111,222,222,333".
 *
 * The rules live in the cart transform's `box_rules` metafield (app-owned,
 * set by scripts/seed-store.mjs), not in the cart, so a shopper can't
 * change them:
 *   {
 *     "formats": { "<box variant gid>": { "big": 1, "small": 4 } },
 *     "big":   ["<8 oz salted gid>", "<8 oz unsalted gid>"],
 *     "small": ["<every 2 oz gid>", ...]
 *   }
 *
 * A valid box gets one `lineExpand`: the line keeps its flat price, which
 * Shopify splits across the butters, and each butter's inventory is
 * tracked. An invalid box (wrong count, wrong size, unknown variant) is
 * left alone: it stays one line at the box price, with its visible
 * `slot n` properties still showing the picks.
 *
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 * @typedef {CartTransformRunInput["cart"]["lines"][number]} CartLine
 * @typedef {{ big: number, small: number }} Format
 * @typedef {{ formats: Record<string, Format>, big: string[], small: string[] }} BoxRules
 */

/** @type {CartTransformRunResult} */
const NO_CHANGES = {
  operations: [],
};

const VARIANT_GID = 'gid://shopify/ProductVariant/';

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  const rules = readRules(input.cartTransform?.rules?.jsonValue);
  if (!rules) return NO_CHANGES;

  const operations = [];
  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== 'ProductVariant') continue;
    const format = rules.formats[line.merchandise.id];
    if (!format) continue;

    const picks = parseComponents(line.components?.value);
    if (!picks || !isValidBox(picks, format, rules)) continue;

    operations.push({
      lineExpand: {
        cartLineId: line.id,
        expandedCartItems: countPicks(picks).map(([merchandiseId, quantity]) => ({ merchandiseId, quantity })),
      },
    });
  }

  return operations.length ? { operations } : NO_CHANGES;
}

/**
 * Checks the metafield's shape. Returns null when it's missing or malformed,
 * so a bad config never expands anything.
 *
 * @param {unknown} value
 * @returns {BoxRules | null}
 */
export function readRules(value) {
  if (!value || typeof value !== 'object') return null;
  const { formats, big, small } = /** @type {Record<string, unknown>} */ (value);
  if (!formats || typeof formats !== 'object' || !Array.isArray(big) || !Array.isArray(small)) return null;
  return /** @type {BoxRules} */ ({ formats, big, small });
}

/**
 * "111, 222" or "gid://shopify/ProductVariant/111,..." → variant gids.
 * Null when empty or when any id isn't a variant id.
 *
 * @param {string | null | undefined} value
 * @returns {string[] | null}
 */
export function parseComponents(value) {
  const parts = (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const gids = parts.map(toVariantGid);
  return gids.every(Boolean) ? /** @type {string[]} */ (gids) : null;
}

/**
 * Exactly `big` picks from the big list, then exactly `small` from the small list.
 *
 * @param {string[]} picks
 * @param {Format} format
 * @param {BoxRules} rules
 */
export function isValidBox(picks, format, rules) {
  if (picks.length !== format.big + format.small) return false;
  const big = new Set(rules.big);
  const small = new Set(rules.small);
  return picks.every((id, i) => (i < format.big ? big.has(id) : small.has(id)));
}

/**
 * Collapses repeats into [variant, quantity] pairs, keeping first-pick order.
 *
 * @param {string[]} picks
 * @returns {[string, number][]}
 */
export function countPicks(picks) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const id of picks) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts];
}

/**
 * Accepts "46112007618626" or "gid://shopify/ProductVariant/46112007618626".
 *
 * @param {string} value
 * @returns {string | null}
 */
export function toVariantGid(value) {
  if (value.startsWith(VARIANT_GID)) return /^\d+$/.test(value.slice(VARIANT_GID.length)) ? value : null;
  return /^\d+$/.test(value) ? `${VARIANT_GID}${value}` : null;
}
