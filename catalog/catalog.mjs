// The wicz craft catalog (design guide §3.2, §8). One source for
// catalog/build-csv.mjs and app/wicz-craft-cartons/scripts/seed-store.mjs.
// Unknown facts stay as bracketed placeholders (guide, "for the agent").

export const SIZES = { big: '8 oz', small: '2 oz' };
export const CARE_LINE = 'keep cold. soften 20 minutes before serving. best within 2–3 weeks, or freeze.';

const flavor = (handle, name, [ground, ink, deep, fold], extra = {}) => ({
  handle,
  name,
  ground,
  ink,
  deep,
  fold,
  tier: 'flavored',
  seasonal: false,
  ingredients: '[INGREDIENTS]',
  pairs: '[PAIRS WITH]',
  allergens: 'contains: milk.',
  body: `cultured butter with [INGREDIENTS].`,
  ...extra,
});

// Order is the guide's: classics first, then culinary, then holiday.
export const flavors = [
  flavor('salted', 'salted', ['#F6E8A4', '#93AEEB', '#3F5BB0', '#EBD98C'], {
    tier: 'plain',
    ingredients: 'cultured cream, sea salt',
    pairs: 'warm bread, radishes',
    body: 'cultured butter with sea salt. for warm bread, radishes, and most things.',
  }),
  flavor('unsalted', 'unsalted', ['#E6E8EC', '#93AEEB', '#3F5BB0', '#D3D6DC'], {
    tier: 'plain',
    ingredients: 'cultured cream',
    body: 'cultured butter. nothing added.',
  }),
  flavor('honey', 'honey', ['#FCE3BE', '#D9873A', '#8A4A12', '#EED0A4'], {
    ingredients: 'cultured cream, honey, sea salt',
    body: 'cultured butter with honey and a little salt.',
  }),
  flavor('garlic-herb', 'garlic herb', ['#E1EDCF', '#6F9B4E', '#3E5A26', '#CCDDB6']),
  flavor('hot-honey', 'hot honey', ['#FFD8A8', '#D93B8C', '#A51E63', '#EEC48F']),
  flavor('chili-crisp', 'chili crisp', ['#7A1E1E', '#FF8A3D', '#FF9A55', '#5A1414']),
  flavor('white-miso', 'white miso', ['#E2D4F7', '#2F8F55', '#1F6B3E', '#CFBFE8']),
  flavor('caesar', 'caesar', ['#D6EDB8', '#E5583A', '#B23A20', '#C4DBA4'], {
    pairs: 'steak, roast chicken, the end of the loaf',
    allergens: 'contains: milk. [CONFIRM: fish, if made with anchovy]',
    body: 'cultured butter with [INGREDIENTS]. for steak, roast chicken, and the end of the loaf.',
  }),
  flavor('smoked-sea-salt', 'smoked sea salt', ['#2E2C2B', '#FFD23F', '#FFD23F', '#1A1918']),
  flavor('french-onion', 'french onion', ['#F7D58A', '#7B3FC4', '#5A2A96', '#E6C173']),
  flavor('cranberry-orange', 'cranberry orange', ['#FFDCC2', '#D0103A', '#9E0C2C', '#EFC6A8'], { seasonal: true }),
  flavor('brown-butter-sage', 'brown butter sage', ['#4A2C1A', '#B5D99C', '#B5D99C', '#2F1C10'], { seasonal: true }),
];

export const PRICES = {
  plain: { [SIZES.big]: '14.00', [SIZES.small]: '5.00' },
  flavored: { [SIZES.big]: '16.00', [SIZES.small]: '6.00' },
};

// §8.2: one product, one variant per format, flat prices.
// `big` slots take an 8 oz salted or unsalted; `small` slots take any 2 oz.
export const BOX_HANDLE = 'build-a-box';
export const BIG_FLAVORS = ['salted', 'unsalted'];
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

// §8.2 flights: presets of the eight format. Each borrows one flavor's colors.
const colorsOf = (handle) => flavors.find((f) => f.handle === handle);
export const flights = [
  {
    handle: 'classics-culinary',
    title: 'classics + culinary',
    colors: colorsOf('salted'),
    seasonal: false,
    contents: ['salted', 'unsalted', 'honey', 'garlic-herb', 'hot-honey', 'chili-crisp', 'caesar', 'french-onion'],
  },
  {
    handle: 'classics-holiday',
    title: 'classics + holiday',
    colors: colorsOf('cranberry-orange'),
    seasonal: true,
    contents: ['salted', 'unsalted', 'honey', 'garlic-herb', 'cranberry-orange', 'cranberry-orange', 'brown-butter-sage', 'brown-butter-sage'],
  },
  {
    handle: 'culinary-holiday',
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
}));

// Old catalog (2″ / 1.2″ cubes and cartons), archived by the seed script.
export const RETIRED = ['a-little-four', 'half-dozen', 'one-big-four-small', 'build-your-own'];
