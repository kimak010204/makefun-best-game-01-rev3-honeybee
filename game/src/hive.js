// HONEYBEE — the hive: home base in the old oak tree.
// Flying into the hive mouth with pollen deposits it as honey.

import { VIEW } from './config.js';

export const HIVE = {
  x: VIEW.width - 95, // hive mouth, in the oak on the right
  y: 150,
  radius: 46,
  treeX: VIEW.width - 70,
  treeTopY: 60,
  canopyR: 95,
};

export function createHiveState() {
  return {
    honey: 0, // 0..100, the win meter
    depositedTotal: 0, // pollen delivered so far
    flashUntilMs: 0, // brief glow after a deposit
  };
}

// True when the bee is close enough to the hive mouth to deposit.
export function beeAtHive(bee) {
  return Math.hypot(bee.x - HIVE.x, bee.y - HIVE.y) < HIVE.radius + 14;
}

// Deposit the whole pouch: returns the pollen count, honey gained, and
// whether the pouch was full (a full pouch earns a bonus).
export function depositPollen(hive, bee, honeyPerPollen, nowMs) {
  if (bee.pouch <= 0) return { count: 0, gained: 0, wasFull: false };
  const count = bee.pouch;
  const gained = count * honeyPerPollen;
  hive.honey = Math.min(100, hive.honey + gained);
  hive.depositedTotal += count;
  const wasFull = count >= 6;
  bee.pouch = 0;
  hive.flashUntilMs = nowMs + 600;
  return { count, gained, wasFull };
}
