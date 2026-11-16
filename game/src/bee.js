// HONEYBEE — the bee: position, flight physics and the pollen pouch.
// A heavier pouch slows the bee, so trips back to the hive are a real choice.

import { BEE, VIEW } from './config.js';

export function createBee() {
  return {
    x: VIEW.width * 0.5,
    y: VIEW.height * 0.55,
    vx: 0,
    vy: 0,
    facing: 1, // 1 right, -1 left
    pouch: 0, // pollen carried right now
    lives: BEE.lives,
    invulnerableUntil: 0,
    wingPhase: 0,
    collecting: null, // flower id the bee is parked on, else null
    collectProgressMs: 0,
  };
}

// Top speed shrinks as the pouch fills: a full bee is a slow bee.
export function beeTopSpeed(bee) {
  return Math.max(BEE.minSpeed, BEE.maxSpeed - bee.pouch * BEE.slowPerPollen);
}

export function updateBee(bee, move, dt, nowMs) {
  const top = beeTopSpeed(bee);
  bee.vx += move.x * BEE.accel * dt;
  bee.vy += move.y * BEE.accel * dt;
  // Drag: the bee glides to a stop instead of halting dead.
  const drag = Math.exp(-6 * dt);
  bee.vx *= drag;
  bee.vy *= drag;
  const speed = Math.hypot(bee.vx, bee.vy);
  if (speed > top) {
    bee.vx = (bee.vx / speed) * top;
    bee.vy = (bee.vy / speed) * top;
  }
  bee.x += bee.vx * dt;
  bee.y += bee.vy * dt;
  // Stay inside the meadow (above the ground, below the sky's top).
  const r = BEE.radius;
  if (bee.x < r) { bee.x = r; bee.vx = Math.max(0, bee.vx); }
  if (bee.x > VIEW.width - r) { bee.x = VIEW.width - r; bee.vx = Math.min(0, bee.vx); }
  if (bee.y < r + 8) { bee.y = r + 8; bee.vy = Math.max(0, bee.vy); }
  if (bee.y > VIEW.groundY - r) { bee.y = VIEW.groundY - r; bee.vy = Math.min(0, bee.vy); }
  if (Math.abs(bee.vx) > 20) bee.facing = bee.vx > 0 ? 1 : -1;
  bee.wingPhase += dt * (14 + speed / 25);
  return bee;
}

export function beeIsInvulnerable(bee, nowMs) {
  return nowMs < bee.invulnerableUntil;
}

// A sting costs one life and knocks the bee away from the attacker.
export function stingBee(bee, fromX, fromY, nowMs) {
  if (beeIsInvulnerable(bee, nowMs)) return false;
  bee.lives -= 1;
  bee.invulnerableUntil = nowMs + BEE.stingInvulnerableMs;
  const dx = bee.x - fromX;
  const dy = bee.y - fromY;
  const len = Math.hypot(dx, dy) || 1;
  bee.vx = (dx / len) * 320;
  bee.vy = (dy / len) * 320 - 80;
  // A sting shakes loose one pollen, if the bee carries any.
  if (bee.pouch > 0) bee.pouch -= 1;
  return true;
}
