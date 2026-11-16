// HONEYBEE — the flower field: where pollen grows, and where spiders hide.
// Each flower holds pollen that regrows over time; a few flowers hide a spider.

import { FIELD, VIEW, PALETTE, BEE } from './config.js';

// Seeded shuffle so the meadow is the same every run with the same seed.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createField(seed, spiderCount = FIELD.spiderFlowers) {
  const random = mulberry32(seed);
  const flowers = [];
  // Scatter flowers across the grass, keeping the hive tree clear on the right.
  for (let i = 0; i < FIELD.flowerCount; i++) {
    const x = 60 + random() * (VIEW.width - 260);
    const y = VIEW.groundY + 30 + random() * (VIEW.height - VIEW.groundY - 70);
    flowers.push({
      id: i,
      x,
      y,
      stemH: 26 + random() * 22,
      petal: PALETTE.petalColors[i % PALETTE.petalColors.length],
      petals: 5 + Math.floor(random() * 3),
      pollen: FIELD.pollenPerFlower,
      regrowAtMs: 0,
      hasSpider: false,
      swayPhase: random() * Math.PI * 2,
      bloom: 0.6 + random() * 0.4, // size variation
    });
  }
  // Spiders claim a few flowers at random (never the two nearest the hive).
  const shuffled = [...flowers].sort(() => random() - 0.5);
  for (let i = 0; i < spiderCount; i++) shuffled[i].hasSpider = true;
  return { flowers, random };
}

// One pollen grows back per interval until the flower is full again.
export function updateField(field, nowMs) {
  for (const f of field.flowers) {
    if (f.pollen < FIELD.pollenPerFlower && nowMs >= f.regrowAtMs) {
      f.pollen += 1;
      f.regrowAtMs = nowMs + FIELD.pollenRegrowMs;
    }
  }
}

// The flower the bee is hovering over (close enough to land on), if any.
export function flowerUnderBee(field, bee) {
  let best = null;
  let bestD = 48;
  for (const f of field.flowers) {
    const headY = f.y - f.stemH;
    const d = Math.hypot(bee.x - f.x, bee.y - headY);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}

// Pick one pollen from a flower: returns true when a pollen was taken.
export function pickPollen(flower, bee, nowMs) {
  if (flower.pollen <= 0) return false;
  if (bee.pouch >= BEE.pouchCapacity) return false;
  flower.pollen -= 1;
  flower.regrowAtMs = nowMs + FIELD.pollenRegrowMs;
  bee.pouch += 1;
  return true;
}
