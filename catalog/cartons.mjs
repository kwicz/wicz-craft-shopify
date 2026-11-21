// Carton definitions (design guide §8), shared by catalog/build-csv.mjs and
// app/wicz-craft-cartons/scripts/seed-store.mjs.
// Each carton borrows one flavor's color pair. Its contents rule lives in
// custom.carton_config, which the theme's carton builder reads. Flavors are
// referenced by product handle and sizes by their option value.
// Note: the CSV import does not set this JSON metafield or the `carton`
// template suffix; run app/wicz-craft-cartons/scripts/seed-store.mjs.
export const BIG = '2″ cube';
export const SMALL = '1.2″ cube';
const slot = (size, flavor = null) => ({ size, default: flavor });
const pairs = {
  salted: ['#F6E8A4', '#93AEEB', '#3F5BB0'],
  garlic: ['#D6EDB8', '#E5583A', '#B23A20'],
  honey: ['#FFD8A8', '#D93B8C', '#A51E63'],
  miso: ['#E2D4F7', '#2F8F55', '#1F6B3E'],
};
export const cartons = [
  { handle: 'a-little-four', title: 'a little four', pair: pairs.miso,
    // the guide doesn't say which four flavors, so every slot starts empty
    config: { mode: 'slots', slots: [slot(SMALL), slot(SMALL), slot(SMALL), slot(SMALL)] },
    body: 'four 1.2″ cubes. you pick the flavors.' },
  { handle: 'half-dozen', title: 'half dozen', pair: pairs.garlic,
    config: { mode: 'slots', slots: [
      slot(SMALL, 'salted'), slot(SMALL, 'garlic-herb'), slot(SMALL, 'honey'),
      slot(SMALL, 'white-miso'), slot(SMALL, 'chili-crisp'), slot(SMALL, 'salted')] },
    body: 'six 1.2″ cubes. the whole lineup, plus an extra salted. swap any of them.' },
  { handle: 'one-big-four-small', title: 'one big, four small', pair: pairs.salted,
    config: { mode: 'slots', slots: [
      slot(BIG, 'salted'), slot(SMALL, 'garlic-herb'), slot(SMALL, 'honey'),
      slot(SMALL, 'white-miso'), slot(SMALL, 'chili-crisp')] },
    body: 'one 2″ salted and four 1.2″ flavors. swap any of them.' },
  { handle: 'build-your-own', title: 'build your own', pair: pairs.honey,
    config: { mode: 'capacity', capacity: 6, weights: { [BIG]: 2, [SMALL]: 1 } },
    body: 'a box with six slots. a 2″ cube takes two, a 1.2″ cube takes one. fill it however you like.' },
];

