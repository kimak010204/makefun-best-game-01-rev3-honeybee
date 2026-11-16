// HONEYBEE — configuration: every tunable number of the game lives here.
// One place to tune the difficulty, the palette and the field layout.

export const VIEW = {
  width: 960,
  height: 600,
  groundY: 470, // where the grass starts; the sky lives above it
};

export const DAY = {
  seconds: 150, // one full day: fill the hive before the sun sets
  honeyTarget: 100, // honey percent that wins the game
  honeyPerPollen: 5, // honey gained for each pollen deposited
};

export const BEE = {
  radius: 14,
  accel: 1500, // px/s^2 while a key is held
  maxSpeed: 260, // px/s with an empty pouch
  slowPerPollen: 22, // px/s lost for each pollen carried
  minSpeed: 120,
  pouchCapacity: 6, // pollen the bee can carry at once
  lives: 3,
  stingInvulnerableMs: 2000, // grace period after a sting
  collectMs: 450, // ms spent on a flower to pick one pollen
};

export const FIELD = {
  flowerCount: 12,
  pollenPerFlower: 3, // pollen a fresh flower holds
  pollenRegrowMs: 8000, // ms for one pollen to grow back
  spiderFlowers: 3, // flowers that hide a spider
  waspStart: 2, // wasps at the start of the day
  waspExtraAtHoney: 50, // one more wasp once honey passes this
  waspSpeed: 150,
  waspChaseRadius: 220,
};

export const SCORE = {
  pollen: 10, // per pollen picked
  deposit: 50, // per pollen delivered to the hive
  fullPouchBonus: 100, // delivering a full pouch
  timeBonusPerSecond: 10, // on a win, per second left
  noStingBonus: 500, // on a win with all lives kept
};

// Three difficulties, picked on the title screen: the day gets shorter,
// the wasps get faster and more numerous, and more flowers hide spiders.
export const DIFFICULTY = {
  easy: { label: 'EASY — a gentle morning', wasps: 1, waspSpeed: 120, daySeconds: 180, spiders: 2 },
  normal: { label: 'NORMAL — a busy summer day', wasps: 2, waspSpeed: 150, daySeconds: 150, spiders: 3 },
  hard: { label: 'HARD — the meadow fights back', wasps: 3, waspSpeed: 185, daySeconds: 120, spiders: 4 },
};

// The Hornet Queen: at 75% honey she storms in — bigger, faster than any
// wasp, and she does not stop chasing until she lands a sting.
export const QUEEN = {
  radius: 26,
  speed: 205,
  atHoney: 75,
  fleeMs: 5000,
};

// Cheerful meadow palette: warm sun, blue sky, green grass, bright flowers.
export const PALETTE = {
  skyTop: '#7ec8f7',
  skyBottom: '#dff3ff',
  sun: '#ffd94d',
  sunRays: '#ffe98a',
  cloud: '#ffffff',
  grassTop: '#7ec850',
  grassBottom: '#4da32e',
  dirt: '#8a5a33',
  trunk: '#7a4a21',
  leaves: '#3f9142',
  leavesDark: '#2f7031',
  hive: '#c98a2e',
  hiveDark: '#a86f1d',
  hiveHole: '#5a3a12',
  beeYellow: '#ffcf3f',
  beeBlack: '#2b2b2b',
  wing: 'rgba(255,255,255,0.75)',
  waspBody: '#3a2b1f',
  waspStripe: '#e8a13a',
  spider: '#222222',
  petalColors: ['#ff5a7a', '#ffd23f', '#b678f0', '#ff8c42', '#ffffff', '#ff6fb5'],
  petalCenter: '#ffcf3f',
  stem: '#3f9142',
  hudPanel: 'rgba(255,255,255,0.85)',
  hudText: '#2b3a2b',
  danger: '#d43d2a',
};
