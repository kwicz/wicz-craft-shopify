import { describe, expect, test } from 'vitest';
import { cartTransformRun, countPicks, isValidBox, parseComponents, readRules, toVariantGid } from '../src/cart_transform_run.js';

const gid = (id) => `gid://shopify/ProductVariant/${id}`;
const BOX_FOUR = gid(900);
const BOX_ONE_BIG_TWO = gid(903);
const SALTED_8 = gid(101);
const UNSALTED_8 = gid(201);
const SALTED_2 = gid(102);
const CAESAR_2 = gid(802);
const HONEY_2 = gid(302);
const CAESAR_8 = gid(801);

const rules = {
  formats: {
    [BOX_FOUR]: { big: 0, small: 4 },
    [BOX_ONE_BIG_TWO]: { big: 1, small: 2 },
  },
  big: [SALTED_8, UNSALTED_8],
  small: [SALTED_2, CAESAR_2, HONEY_2],
};

function line(id, variant, components, quantity = 1) {
  return {
    id: `gid://shopify/CartLine/${id}`,
    quantity,
    components: components === undefined ? null : { value: components },
    merchandise: { __typename: 'ProductVariant', id: variant },
  };
}

const run = (lines, metafieldValue = rules) =>
  cartTransformRun({ cart: { lines }, cartTransform: { rules: metafieldValue === null ? null : { jsonValue: metafieldValue } } });

describe('cartTransformRun', () => {
  test('expands a box into its picks, counting repeats', () => {
    const result = run([line(1, BOX_FOUR, '802,802,102,302')]);
    expect(result.operations).toEqual([
      {
        lineExpand: {
          cartLineId: 'gid://shopify/CartLine/1',
          expandedCartItems: [
            { merchandiseId: CAESAR_2, quantity: 2 },
            { merchandiseId: SALTED_2, quantity: 1 },
            { merchandiseId: HONEY_2, quantity: 1 },
          ],
        },
      },
    ]);
  });

  test('expands a one-big box with the 8 oz first', () => {
    const result = run([line(1, BOX_ONE_BIG_TWO, `${UNSALTED_8},802,302`)]);
    expect(result.operations[0].lineExpand.expandedCartItems).toEqual([
      { merchandiseId: UNSALTED_8, quantity: 1 },
      { merchandiseId: CAESAR_2, quantity: 1 },
      { merchandiseId: HONEY_2, quantity: 1 },
    ]);
  });

  test('handles several boxes and ignores single butters', () => {
    const result = run([
      line(1, BOX_FOUR, '102,102,102,102'),
      line(2, CAESAR_2),
      line(3, BOX_ONE_BIG_TWO, '101,102,802'),
    ]);
    expect(result.operations.map((op) => op.lineExpand.cartLineId)).toEqual([
      'gid://shopify/CartLine/1',
      'gid://shopify/CartLine/3',
    ]);
  });

  test('leaves a box alone when the count is wrong', () => {
    expect(run([line(1, BOX_FOUR, '102,102,102')]).operations).toEqual([]);
    expect(run([line(1, BOX_FOUR, '102,102,102,102,102')]).operations).toEqual([]);
  });

  test('leaves a box alone when a flavored 8 oz is in the big slot', () => {
    expect(run([line(1, BOX_ONE_BIG_TWO, `${CAESAR_8},802,302`)]).operations).toEqual([]);
  });

  test('leaves a box alone when an 8 oz is in a small slot', () => {
    expect(run([line(1, BOX_FOUR, '101,102,102,102')]).operations).toEqual([]);
  });

  test('leaves a box alone when its components are missing or garbled', () => {
    expect(run([line(1, BOX_FOUR)]).operations).toEqual([]);
    expect(run([line(1, BOX_FOUR, '102,abc,102,102')]).operations).toEqual([]);
  });

  test('does nothing without rules', () => {
    expect(run([line(1, BOX_FOUR, '102,102,102,102')], null).operations).toEqual([]);
    expect(run([line(1, BOX_FOUR, '102,102,102,102')], { formats: {} }).operations).toEqual([]);
  });
});

describe('helpers', () => {
  test('toVariantGid', () => {
    expect(toVariantGid('123')).toBe(gid(123));
    expect(toVariantGid(gid(123))).toBe(gid(123));
    expect(toVariantGid('gid://shopify/Product/123')).toBeNull();
    expect(toVariantGid('12a')).toBeNull();
  });

  test('parseComponents', () => {
    expect(parseComponents(' 1, 2 ,3')).toEqual([gid(1), gid(2), gid(3)]);
    expect(parseComponents('')).toBeNull();
    expect(parseComponents(undefined)).toBeNull();
  });

  test('isValidBox', () => {
    expect(isValidBox([SALTED_8, SALTED_2, HONEY_2], { big: 1, small: 2 }, rules)).toBe(true);
    expect(isValidBox([SALTED_2, SALTED_8, HONEY_2], { big: 1, small: 2 }, rules)).toBe(false);
  });

  test('countPicks', () => {
    expect(countPicks(['a', 'b', 'a'])).toEqual([['a', 2], ['b', 1]]);
  });

  test('readRules', () => {
    expect(readRules(rules)).toEqual(rules);
    expect(readRules(null)).toBeNull();
    expect(readRules({ formats: {}, big: 'x', small: [] })).toBeNull();
  });
});
