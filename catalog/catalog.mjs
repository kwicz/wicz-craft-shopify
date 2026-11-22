// The wicz craft catalog (design guide §3.2, §8). One source for
// catalog/build-csv.mjs and app/wicz-craft-cartons/scripts/seed-store.mjs.
// Unknown facts stay as bracketed placeholders (guide, "for the agent").

export const SIZES = { big: '8 oz', small: '2 oz' };
// Care line (guide §8.4). Garlic, anchovy and onion flavors keep 1 week;
// a box holding any of them uses the short line too.
export const careLine = (bestWithin) =>
  `keep cold. soften 20 minutes before serving. best within ${bestWithin}, or freeze.`;
export const CARE_LINE = careLine('2–3 weeks');

// Data from the site kit's data/flavors.csv (Nov 21, 2026). Ingredients are
// drafts until the recipes are confirmed.
const flavor = (handle, name, [ground, ink, deep, fold], extra) => ({
  handle,
  name,
  ground,
  ink,
  deep,
  fold,
  tier: 'flavored',
  seasonal: false,
  allergens: 'contains: milk.',
  bestWithin: '2–3 weeks',
  ...extra,
});

// Order is the guide's: classics first, then culinary, then holiday.
export const flavors = [
  flavor('salted', 'salted', ['#F6E8A4', '#93AEEB', '#3F5BB0', '#EBD98C'], {
    tier: 'plain',
    ingredients: 'cultured cream, sea salt',
    pairs: 'warm bread, radishes',
    body: 'cultured butter with sea salt. for warm bread, radishes, and eating off the knife.',
  }),
  flavor('unsalted', 'unsalted', ['#E6E8EC', '#93AEEB', '#3F5BB0', '#D3D6DC'], {
    tier: 'plain',
    ingredients: 'cultured cream',
    pairs: 'baking, pan sauces, soft scrambled eggs',
    body: 'cultured butter, nothing added. for baking, pan sauces, and soft scrambled eggs.',
  }),
  flavor('honey', 'honey', ['#FCE3BE', '#D9873A', '#8A4A12', '#EED0A4'], {
    ingredients: 'cultured cream, honey, sea salt',
    pairs: 'crumpets, biscuits, cornbread',
    body: 'cultured butter with honey and a little sea salt. for crumpets, biscuits, and cornbread.',
  }),
  flavor('garlic-herb', 'garlic herb', ['#E1EDCF', '#6F9B4E', '#3E5A26', '#CCDDB6'], {
    ingredients: 'cultured cream, roasted garlic, parsley, thyme, chives, sea salt, black pepper',
    pairs: 'baguette, steak, roast potatoes',
    bestWithin: '1 week',
    body: 'cultured butter with roasted garlic, parsley, thyme, and chives. for baguette, steak, and roast potatoes.',
  }),
  flavor('hot-honey', 'hot honey', ['#FFD8A8', '#D93B8C', '#A51E63', '#EEC48F'], {
    ingredients: 'cultured cream, honey, chili flakes, apple cider vinegar, sea salt',
    pairs: 'fried chicken, cornbread, pizza crust',
    body: 'cultured butter with honey, chili, and a splash of vinegar. for fried chicken, cornbread, and pizza crust.',
  }),
  flavor('chili-crisp', 'chili crisp', ['#7A1E1E', '#FF8A3D', '#FF9A55', '#5A1414'], {
    ingredients: 'cultured cream, sunflower oil, chili flakes, fried shallot, fried garlic, sichuan peppercorn, sugar, sea salt',
    pairs: 'dumplings, fried eggs, rice',
    body: 'cultured butter with crunchy chili, shallot, and sichuan pepper. for dumplings, fried eggs, and a bowl of rice.',
  }),
  flavor('white-miso', 'white miso', ['#E2D4F7', '#2F8F55', '#1F6B3E', '#CFBFE8'], {
    ingredients: 'cultured cream, white miso (soybeans, rice, salt, koji)',
    allergens: 'contains: milk, soy.',
    pairs: 'corn on the cob, roasted delicata squash, rice',
    body: 'cultured butter with white miso. for corn on the cob, roasted delicata squash, and rice.',
  }),
  flavor('caesar', 'caesar', ['#D6EDB8', '#E5583A', '#B23A20', '#C4DBA4'], {
    ingredients: 'cultured cream, parmesan, anchovy, garlic, lemon zest, black pepper',
    allergens: 'contains: milk, fish.',
    pairs: 'steak, roast chicken, the end of the loaf',
    bestWithin: '1 week',
    body: 'cultured butter with parmesan, anchovy, garlic, and lemon. for steak, roast chicken, and the end of the loaf.',
  }),
  flavor('smoked-sea-salt', 'smoked sea salt', ['#2E2C2B', '#FFD23F', '#FFD23F', '#1A1918'], {
    ingredients: 'cultured cream, smoked sea salt',
    pairs: 'radishes, grilled corn, baked potatoes',
    body: 'cultured butter with smoked sea salt. for radishes, grilled corn, and baked potatoes.',
  }),
  flavor('french-onion', 'french onion', ['#F7D58A', '#7B3FC4', '#5A2A96', '#E6C173'], {
    ingredients: 'cultured cream, caramelized onion, gruyère, thyme, sea salt, black pepper',
    pairs: 'toasted baguette, steak, baked potatoes',
    bestWithin: '1 week',
    body: 'cultured butter with slow-caramelized onion, gruyère, and thyme. for toasted baguette, steak, and baked potatoes.',
  }),
  flavor('cranberry-orange', 'cranberry orange', ['#FFDCC2', '#D0103A', '#9E0C2C', '#EFC6A8'], {
    seasonal: true,
    ingredients: 'cultured cream, dried cranberries (cranberries, cane sugar, sunflower oil), orange zest, sea salt',
    pairs: 'scones, cornbread, turkey sandwiches',
    body: 'cultured butter with dried cranberry and orange zest. for scones, cornbread, and the leftover turkey sandwich.',
  }),
  flavor('brown-butter-sage', 'brown butter sage', ['#4A2C1A', '#B5D99C', '#B5D99C', '#2F1C10'], {
    seasonal: true,
    ingredients: 'cultured cream (part browned), sage, sea salt',
    pairs: 'delicata squash, gnocchi, roast chicken',
    body: 'cultured butter, part of it browned, with crisp sage. for delicata squash, gnocchi, and roast chicken.',
  }),
].map((f) => ({ ...f, care: careLine(f.bestWithin) }));

export const PRICES = {
  plain: { [SIZES.big]: '14.00', [SIZES.small]: '5.00' },
  flavored: { [SIZES.big]: '16.00', [SIZES.small]: '6.00' },
};

// §8.2: one product, one variant per format, flat prices.
// `big` slots take an 8 oz of a classic (no extra charge); `small` slots take any 2 oz.
export const BOX_HANDLE = 'build-a-box';
export const BIG_FLAVORS = ['salted', 'unsalted', 'honey', 'garlic-herb'];
export const formats = [
  { key: 'four', title: 'four', big: 0, small: 4, price: '21.00', separately: '24.00' },
  { key: 'six', title: 'six', big: 0, small: 6, price: '32.00', separately: '36.00' },
  { key: 'eight', title: 'eight', big: 0, small: 8, price: '42.00', separately: '48.00' },
  { key: 'one-big-two-small', title: 'one big, two small', big: 1, small: 2, price: '23.00', separately: '26.00' },
  { key: 'one-big-four-small', title: 'one big, four small', big: 1, small: 4, price: '34.00', separately: '38.00' },
];
export const box = {
  handle: BOX_HANDLE,
  title: 'build a box',
  colors: flavors[0],
  body: 'pick a box, then fill it. one price per box, whatever goes in.',
};

// §8.4: a box lists the combined allergens of everything inside, and uses
// the 1-week care line if it holds any 1-week flavor.
export function boxFacts(handles) {
  const inside = handles.map(colorsOfHandle);
  const allergens = [...new Set(inside.flatMap((f) => f.allergens.replace(/^contains: |\.$/g, '').split(', ')))];
  const bestWithin = inside.some((f) => f.bestWithin === '1 week') ? '1 week' : '2–3 weeks';
  return { allergens: `contains: ${allergens.join(', ')}.`, bestWithin, care: careLine(bestWithin) };
}
const colorsOfHandle = (handle) => flavors.find((f) => f.handle === handle);

// §8.2 flights: presets of the eight format. Each borrows one flavor's colors.
const colorsOf = (handle) => flavors.find((f) => f.handle === handle);
export const flights = [
  {
    handle: 'classics-culinary-flight',
    oldHandle: 'classics-culinary',
    title: 'classics + culinary',
    colors: colorsOf('salted'),
    seasonal: false,
    contents: ['salted', 'unsalted', 'honey', 'garlic-herb', 'hot-honey', 'chili-crisp', 'caesar', 'french-onion'],
  },
  {
    handle: 'classics-holiday-flight',
    oldHandle: 'classics-holiday',
    title: 'classics + holiday',
    colors: colorsOf('cranberry-orange'),
    seasonal: true,
    contents: ['salted', 'unsalted', 'honey', 'garlic-herb', 'cranberry-orange', 'cranberry-orange', 'brown-butter-sage', 'brown-butter-sage'],
  },
  {
    handle: 'culinary-holiday-flight',
    oldHandle: 'culinary-holiday',
    title: 'culinary + holiday',
    colors: colorsOf('brown-butter-sage'),
    seasonal: true,
    contents: ['hot-honey', 'chili-crisp', 'white-miso', 'caesar', 'smoked-sea-salt', 'french-onion', 'cranberry-orange', 'brown-butter-sage'],
  },
].map((flight) => ({
  ...flight,
  format: 'eight',
  price: '42.00',
  body: `eight 2 oz butters: ${flight.contents.map((h) => colorsOf(h).name).join(', ')}.`,
  ...boxFacts(flight.contents),
}));

// §8.5 add-ons: bought in and branded with the mold. Not butter, so no
// flavor colors and no foil card. Sizes are still open in the guide.
export const ADD_ONS_HANDLE = 'add-ons';
export const addOns = [
  {
    handle: 'butter-spreader',
    title: 'spreader',
    price: '12.00',
    madeOf: 'maple, food-safe oil',
    size: '[SPREADER LENGTH]',
    body: 'maple butter spreader with the mold burned into the handle. rounded blade, made for soft butter.',
    goesWith: ['salted', 'honey', 'garlic-herb'],
  },
  {
    handle: 'butter-keeper',
    title: 'butter keeper',
    price: '30.00',
    madeOf: 'glazed stoneware',
    size: '[KEEPER CAPACITY]',
    body: 'cream-glazed french butter keeper. pack butter into the bell, put a little cold water in the base, and it stays soft on the counter.',
    goesWith: ['honey', 'salted', 'hot-honey'],
  },
  {
    handle: 'butter-board',
    title: 'butter board',
    price: '34.00',
    madeOf: 'maple, food-safe oil',
    size: '[BOARD DIMENSIONS]',
    body: 'small maple paddle board with the mold branded near the handle. room for one block, two cubes, and the bread.',
    goesWith: ['classics-culinary-flight', 'build-a-box', 'chili-crisp'],
  },
  {
    handle: 'flaky-salt',
    title: 'flaky salt',
    price: '7.00',
    madeOf: 'sea salt',
    size: '[SALT NET WT]',
    ingredients: 'sea salt',
    body: 'flaky sea salt in a small tin. for unsalted butter, radishes, and the top of anything.',
    goesWith: ['unsalted', 'smoked-sea-salt', 'salted'],
  },
];

// Gift cards are coming soon: /pages/gift-cards takes emails until this is
// true (then also switch gift cards on in Settings > Gift cards and re-seed).
export const GIFT_CARDS_LIVE = false;

export const giftCard = {
  handle: 'gift-card',
  title: 'gift card',
  amounts: ['25', '50', '100'],
  body: 'a gift of really good butter. good for anything in the shop, for pickup or local delivery.',
};

// §8.5 "where it's offered": the `goes with` row on each butter page.
// The spreader is on every butter page, the keeper on every 8 oz page (all
// twelve flavors come in 8 oz), the salt on unsalted, the board on flights
// and the box.
export function goesWith(handle) {
  if (handle === BOX_HANDLE || flights.some((f) => f.handle === handle)) {
    return ['butter-board', 'butter-spreader'];
  }
  return ['butter-spreader', 'butter-keeper', ...(handle === 'unsalted' ? ['flaky-salt'] : [])];
}

// Old catalog (2″ / 1.2″ cubes and cartons), archived by the seed script.
export const RETIRED = ['a-little-four', 'half-dozen', 'one-big-four-small', 'build-your-own'];
