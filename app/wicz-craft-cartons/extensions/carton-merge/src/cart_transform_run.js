// @ts-check

/**
 * carton-merge: turns the lines a shopper picked in the carton builder into
 * one carton line.
 *
 * The theme adds every pick as its own cart line with two hidden properties:
 *   _carton_id      shared by all lines of one carton (a UUID per add)
 *   _carton_parent  the carton product's variant id
 *
 * For each _carton_id group this returns one `linesMerge` operation. With no
 * price adjustment, Shopify prices the merged line as the sum of its
 * components, and each component's own inventory is decremented.
 *
 * A group is left alone (its lines stay separate, at full price) when its
 * lines disagree about the parent, or the parent id isn't a variant id.
 *
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 * @typedef {CartTransformRunInput["cart"]["lines"][number]} CartLine
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
  const groups = groupCartonLines(input.cart.lines);
  const operations = [];

  for (const [, lines] of groups) {
    const parentVariantId = sharedParent(lines);
    if (!parentVariantId) continue;

    operations.push({
      linesMerge: {
        parentVariantId,
        cartLines: lines.map((line) => ({ cartLineId: line.id, quantity: line.quantity })),
        attributes: [{ key: 'contents', value: describeContents(lines) }],
      },
    });
  }

  return operations.length ? { operations } : NO_CHANGES;
}

/**
 * Groups lines by _carton_id, keeping cart order. Lines without a carton id,
 * or that aren't product variants, are ignored.
 *
 * @param {CartLine[]} lines
 * @returns {Map<string, CartLine[]>}
 */
export function groupCartonLines(lines) {
  /** @type {Map<string, CartLine[]>} */
  const groups = new Map();
  for (const line of lines) {
    const id = line.cartonId?.value?.trim();
    if (!id || line.merchandise.__typename !== 'ProductVariant') continue;
    const group = groups.get(id) ?? [];
    group.push(line);
    groups.set(id, group);
  }
  return groups;
}

/**
 * The parent variant GID every line in the group agrees on, or null.
 *
 * @param {CartLine[]} lines
 * @returns {string | null}
 */
export function sharedParent(lines) {
  const parents = new Set(lines.map((line) => toVariantGid(line.cartonParent?.value)));
  if (parents.size !== 1) return null;
  const [parent] = parents;
  return parent;
}

/**
 * Accepts "46112007618626" or "gid://shopify/ProductVariant/46112007618626".
 *
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function toVariantGid(value) {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw.startsWith(VARIANT_GID)) return /^\d+$/.test(raw.slice(VARIANT_GID.length)) ? raw : null;
  return /^\d+$/.test(raw) ? `${VARIANT_GID}${raw}` : null;
}

/**
 * A readable summary for the merged line, biggest cubes first, then by
 * flavor title (so "nº 1" before "nº 2"), e.g.
 * "nº 1 salted, 2″ cube · nº 2 garlic herb, 1.2″ cube × 2"
 *
 * @param {CartLine[]} lines
 * @returns {string}
 */
export function describeContents(lines) {
  return [...lines]
    .sort((a, b) => sizeOf(b) - sizeOf(a) || titleOf(a).localeCompare(titleOf(b), 'en', { numeric: true }))
    .map((line) => {
      if (line.merchandise.__typename !== 'ProductVariant') return '';
      const { product, title } = line.merchandise;
      const size = title && title !== 'Default Title' ? `, ${title}` : '';
      const count = line.quantity > 1 ? ` × ${line.quantity}` : '';
      return `${product.title}${size}${count}`;
    })
    .filter(Boolean)
    .join(' · ');
}

/** Leading number of a size option like "2″ cube" (0 when there isn't one). */
function sizeOf(/** @type {CartLine} */ line) {
  if (line.merchandise.__typename !== 'ProductVariant') return 0;
  return Number.parseFloat(line.merchandise.title ?? '') || 0;
}

function titleOf(/** @type {CartLine} */ line) {
  return line.merchandise.__typename === 'ProductVariant' ? line.merchandise.product.title : '';
}
