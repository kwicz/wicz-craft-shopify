import { describe, expect, test } from 'vitest';
import {
  cartTransformRun,
  describeContents,
  groupCartonLines,
  sharedParent,
  toVariantGid,
} from '../src/cart_transform_run.js';

const PARENT = '46112007618626';
const PARENT_GID = `gid://shopify/ProductVariant/${PARENT}`;

/** Builds a cart line the way the input query shapes it. */
function line(id, { product, size = '1.2″ cube', quantity = 1, cartonId, parent = PARENT } = {}) {
  return {
    id: `gid://shopify/CartLine/${id}`,
    quantity,
    cartonId: cartonId === undefined ? null : { value: cartonId },
    cartonParent: cartonId === undefined ? null : { value: parent },
    merchandise: {
      __typename: 'ProductVariant',
      id: `gid://shopify/ProductVariant/${1000 + Number(id)}`,
      title: size,
      product: { title: product },
    },
  };
}

const run = (lines) => cartTransformRun({ cart: { lines } });

describe('cartTransformRun', () => {
  test('merges one carton into a single line on the carton variant', () => {
    const result = run([
      line(1, { product: 'nº 1 salted', cartonId: 'a' }),
      line(2, { product: 'nº 3 honey', quantity: 2, cartonId: 'a' }),
    ]);

    expect(result.operations).toEqual([
      {
        linesMerge: {
          parentVariantId: PARENT_GID,
          cartLines: [
            { cartLineId: 'gid://shopify/CartLine/1', quantity: 1 },
            { cartLineId: 'gid://shopify/CartLine/2', quantity: 2 },
          ],
          attributes: [{ key: 'contents', value: 'nº 1 salted, 1.2″ cube · nº 3 honey, 1.2″ cube × 2' }],
        },
      },
    ]);
  });

  test('keeps mixed sizes in the same carton', () => {
    const result = run([
      line(1, { product: 'nº 1 salted', size: '2″ cube', cartonId: 'big' }),
      line(2, { product: 'nº 2 garlic herb', cartonId: 'big' }),
    ]);
    const merge = result.operations[0].linesMerge;
    expect(merge.cartLines).toHaveLength(2);
    expect(merge.attributes[0].value).toBe('nº 1 salted, 2″ cube · nº 2 garlic herb, 1.2″ cube');
  });

  test('merges two cartons separately, even with the same parent', () => {
    const result = run([
      line(1, { product: 'nº 1 salted', cartonId: 'first' }),
      line(2, { product: 'nº 1 salted', cartonId: 'second' }),
      line(3, { product: 'nº 4 white miso', cartonId: 'first' }),
    ]);
    expect(result.operations).toHaveLength(2);
    expect(result.operations[0].linesMerge.cartLines.map((l) => l.cartLineId)).toEqual([
      'gid://shopify/CartLine/1',
      'gid://shopify/CartLine/3',
    ]);
    expect(result.operations[1].linesMerge.cartLines.map((l) => l.cartLineId)).toEqual([
      'gid://shopify/CartLine/2',
    ]);
  });

  test('leaves single cubes (no carton id) alone', () => {
    const result = run([
      line(1, { product: 'nº 5 chili crisp' }),
      line(2, { product: 'nº 1 salted', cartonId: 'a' }),
    ]);
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].linesMerge.cartLines).toEqual([
      { cartLineId: 'gid://shopify/CartLine/2', quantity: 1 },
    ]);
  });

  test('does not merge a group whose lines disagree about the parent', () => {
    const result = run([
      line(1, { product: 'nº 1 salted', cartonId: 'a', parent: '111' }),
      line(2, { product: 'nº 3 honey', cartonId: 'a', parent: '222' }),
    ]);
    expect(result).toEqual({ operations: [] });
  });

  test('does not merge when the parent is not a variant id', () => {
    const result = run([line(1, { product: 'nº 1 salted', cartonId: 'a', parent: 'not-a-number' })]);
    expect(result).toEqual({ operations: [] });
  });

  test('returns no operations for an empty cart', () => {
    expect(run([])).toEqual({ operations: [] });
  });
});

describe('helpers', () => {
  test('toVariantGid accepts numeric ids and variant gids only', () => {
    expect(toVariantGid('123')).toBe('gid://shopify/ProductVariant/123');
    expect(toVariantGid(' 123 ')).toBe('gid://shopify/ProductVariant/123');
    expect(toVariantGid('gid://shopify/ProductVariant/123')).toBe('gid://shopify/ProductVariant/123');
    expect(toVariantGid('gid://shopify/Product/123')).toBeNull();
    expect(toVariantGid('gid://shopify/ProductVariant/abc')).toBeNull();
    expect(toVariantGid('')).toBeNull();
    expect(toVariantGid(undefined)).toBeNull();
  });

  test('groupCartonLines ignores blank ids and custom products', () => {
    const custom = { id: 'gid://shopify/CartLine/9', quantity: 1, cartonId: { value: 'a' }, cartonParent: { value: PARENT }, merchandise: { __typename: 'CustomProduct' } };
    const groups = groupCartonLines([line(1, { product: 'x', cartonId: '  ' }), custom]);
    expect(groups.size).toBe(0);
  });

  test('sharedParent normalizes numeric and gid forms to the same parent', () => {
    const lines = [
      line(1, { product: 'a', cartonId: 'g', parent: PARENT }),
      line(2, { product: 'b', cartonId: 'g', parent: PARENT_GID }),
    ];
    expect(sharedParent(lines)).toBe(PARENT_GID);
  });

  test('describeContents lists big cubes first, then by flavor number', () => {
    const lines = [
      line(1, { product: 'nº 5 chili crisp', cartonId: 'a' }),
      line(2, { product: 'nº 10 test', cartonId: 'a' }),
      line(3, { product: 'nº 2 garlic herb', size: '2″ cube', cartonId: 'a' }),
      line(4, { product: 'nº 1 salted', cartonId: 'a' }),
    ];
    expect(describeContents(lines)).toBe(
      'nº 2 garlic herb, 2″ cube · nº 1 salted, 1.2″ cube · nº 5 chili crisp, 1.2″ cube · nº 10 test, 1.2″ cube',
    );
  });

  test('describeContents drops "Default Title"', () => {
    expect(describeContents([line(1, { product: 'nº 1 salted', size: 'Default Title', cartonId: 'a' })])).toBe('nº 1 salted');
  });
});
