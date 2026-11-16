// HONEYBEE — wasps: they patrol the meadow and chase the bee when it comes close.
// A wasp that stings the bee gets scared off and circles back later.

import { FIELD, VIEW, QUEEN } from './config.js';

export function createWasps(count, seed, speed = FIELD.waspSpeed) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const wasps = [];
  for (let i = 0; i < count; i++) {
    const wseed = Math.floor(rnd() * 100000);
    wasps.push({
      x: 80 + rnd() * (VIEW.width - 160),
      y: 80 + rnd() * 220,
      vx: 0,
      vy: 0,
      speed,
      state: 'patrol', // patrol | chase | flee
      patrolTarget: { x: 100 + rnd() * (VIEW.width - 200), y: 80 + rnd() * 220 },
      fleeUntilMs: 0,
      wingPhase: rnd() * 6,
      seed: wseed,
      // A per-wasp seeded RNG: patrol retargets stay deterministic,
      // so two runs with the same seed play out identically.
      rngState: wseed,
    });
  }
  return wasps;
}

function waspRandom(wasp) {
  wasp.rngState = (wasp.rngState * 1664525 + 1013904223) >>> 0;
  return wasp.rngState / 4294967296;
}

// The Hornet Queen: one big hunter who never patrols — she only chases.
export function createQueen() {
  return {
    x: VIEW.width - 60,
    y: 60,
    vx: 0,
    vy: 0,
    speed: QUEEN.speed,
    state: 'chase',
    fleeUntilMs: 0,
    wingPhase: 0,
    arrived: false,
  };
}

export function updateQueen(queen, bee, dt, nowMs) {
  if (!queen) return;
  if (queen.state === 'flee') {
    if (nowMs < queen.fleeUntilMs) {
      const dx = queen.x - bee.x;
      const dy = queen.y - bee.y;
      const len = Math.hypot(dx, dy) || 1;
      queen.vx = (dx / len) * queen.speed * 1.4;
      queen.vy = (dy / len) * queen.speed * 1.4;
    } else {
      queen.state = 'chase';
    }
  } else {
    const dx = bee.x - queen.x;
    const dy = bee.y - queen.y;
    const len = Math.hypot(dx, dy) || 1;
    queen.vx = (dx / len) * queen.speed;
    queen.vy = (dy / len) * queen.speed;
  }
  queen.x += queen.vx * dt;
  queen.y += queen.vy * dt;
  if (queen.x < 30) queen.x = 30;
  if (queen.x > VIEW.width - 30) queen.x = VIEW.width - 30;
  if (queen.y < 40) queen.y = 40;
  if (queen.y > VIEW.groundY - 40) queen.y = VIEW.groundY - 40;
  queen.wingPhase += dt * 34;
}

export function queenTouchingBee(queen, bee) {
  return queen && Math.hypot(queen.x - bee.x, queen.y - bee.y) < QUEEN.radius + 12;
}

export function scareQueen(queen, nowMs) {
  queen.state = 'flee';
  queen.fleeUntilMs = nowMs + QUEEN.fleeMs;
}

export function updateWasps(wasps, bee, dt, nowMs) {
  for (const w of wasps) {
    const dBee = Math.hypot(bee.x - w.x, bee.y - w.y);
    if (w.state === 'flee') {
      if (nowMs < w.fleeUntilMs) {
        // Dart away from the bee, fast.
        const dx = w.x - bee.x;
        const dy = w.y - bee.y;
        const len = Math.hypot(dx, dy) || 1;
        w.vx = (dx / len) * w.speed * 1.6;
        w.vy = (dy / len) * w.speed * 1.6;
      } else {
        w.state = 'patrol';
      }
    } else if (dBee < FIELD.waspChaseRadius) {
      w.state = 'chase';
      const dx = bee.x - w.x;
      const dy = bee.y - w.y;
      const len = Math.hypot(dx, dy) || 1;
      w.vx = (dx / len) * w.speed;
      w.vy = (dy / len) * w.speed;
    } else {
      w.state = 'patrol';
      const dx = w.patrolTarget.x - w.x;
      const dy = w.patrolTarget.y - w.y;
      const len = Math.hypot(dx, dy);
      if (len < 24) {
        w.patrolTarget = {
          x: 80 + waspRandom(w) * (VIEW.width - 160),
          y: 70 + waspRandom(w) * 230,
        };
      } else {
        w.vx = (dx / len) * w.speed * 0.45;
        w.vy = (dy / len) * w.speed * 0.45;
      }
    }
    w.x += w.vx * dt;
    w.y += w.vy * dt;
    if (w.x < 20) w.x = 20;
    if (w.x > VIEW.width - 20) w.x = VIEW.width - 20;
    if (w.y < 30) w.y = 30;
    if (w.y > VIEW.groundY - 30) w.y = VIEW.groundY - 30;
    w.wingPhase += dt * 30;
  }
  return wasps;
}

// A wasp close enough to touch the bee stings it, then flees for a while.
export function waspTouchingBee(wasp, bee) {
  return Math.hypot(wasp.x - bee.x, wasp.y - bee.y) < 26;
}

export function scareWasp(wasp, nowMs) {
  wasp.state = 'flee';
  wasp.fleeUntilMs = nowMs + 4000;
}
