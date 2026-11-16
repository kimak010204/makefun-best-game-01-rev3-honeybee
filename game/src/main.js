// HONEYBEE — the game loop: states, collisions, scoring and the day timer.
// States: title → playing → won | lost. R or SPACE restarts from any end screen.

import { VIEW, DAY, BEE, FIELD, SCORE, DIFFICULTY, QUEEN } from './config.js';
import { createInput } from './input.js';
import { createBee, updateBee, stingBee, beeIsInvulnerable } from './bee.js';
import { createField, updateField, flowerUnderBee, pickPollen } from './flowers.js';
import { createWasps, updateWasps, waspTouchingBee, scareWasp, createQueen, updateQueen, queenTouchingBee, scareQueen } from './enemies.js';
import { createHiveState, beeAtHive, depositPollen } from './hive.js';
import { createAudio } from './audio.js';
import { render } from './render.js';

export function createWorld(seed = 1, difficulty = 'normal') {
  const diff = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  return {
    seed,
    difficulty,
    diff,
    state: 'title', // title | playing | won | lost
    bee: createBee(),
    field: createField(seed, diff.spiders),
    wasps: createWasps(diff.wasps, seed + 7, diff.waspSpeed),
    queen: null, // the Hornet Queen arrives at 75% honey
    queenAnnounced: false,
    hive: createHiveState(),
    timeLeft: diff.daySeconds,
    score: 0,
    elapsedMs: 0,
    nowMs: 0,
    loseReason: '',
    waspExtraSpawned: false,
    stats: { picked: 0, deposited: 0, stings: 0 },
  };
}

export function startDay(world) {
  const seed = world.seed;
  const difficulty = world.difficulty;
  const fresh = createWorld(seed, difficulty);
  Object.assign(world, fresh);
  world.state = 'playing';
  world.nowMs = 0;
}

export function updateWorld(world, input, dt) {
  const nowMs = world.nowMs + dt * 1000;
  world.nowMs = nowMs;
  if (world.state !== 'playing') return world;

  world.elapsedMs += dt * 1000;
  world.timeLeft = Math.max(0, world.diff.daySeconds - world.elapsedMs / 1000);

  // The extra wasp joins once the hive is half full: the day gets harder.
  if (!world.waspExtraSpawned && world.hive.honey >= FIELD.waspExtraAtHoney) {
    world.waspExtraSpawned = true;
    world.wasps.push(...createWasps(1, world.seed + 99, world.diff.waspSpeed));
  }

  // At 75% honey the Hornet Queen storms in — the day's final boss.
  if (!world.queen && world.hive.honey >= QUEEN.atHoney) {
    world.queen = createQueen();
    world.queenAnnounced = true;
    world.queenAnnounceUntilMs = nowMs + 2500;
  }
  if (world.queen) updateQueen(world.queen, world.bee, dt, nowMs);

  const move = input.moveVector();
  updateBee(world.bee, move, dt, nowMs);
  updateField(world.field, nowMs);
  updateWasps(world.wasps, world.bee, dt, nowMs);

  // Landing on a flower: pick pollen, one at a time, unless it hides a spider.
  const flower = flowerUnderBee(world.field, world.bee);
  if (flower && world.bee.pouch < BEE.pouchCapacity) {
    if (flower.hasSpider) {
      if (stingBee(world.bee, flower.x, flower.y - flower.stemH, nowMs)) {
        world.stats.stings += 1;
        world.audio.sting();
      }
      world.bee.collecting = null;
    } else if (flower.pollen > 0) {
      if (world.bee.collecting !== flower.id) {
        world.bee.collecting = flower.id;
        world.bee.collectProgressMs = 0;
      }
      world.bee.collectProgressMs += dt * 1000;
      if (world.bee.collectProgressMs >= BEE.collectMs) {
        world.bee.collectProgressMs = 0;
        if (pickPollen(flower, world.bee, nowMs)) {
          world.score += SCORE.pollen;
          world.stats.picked += 1;
          world.audio.collect();
        }
      }
    } else {
      world.bee.collecting = null;
    }
  } else {
    world.bee.collecting = null;
  }

  // Home at the hive: deposit the whole pouch as honey.
  if (beeAtHive(world.bee) && world.bee.pouch > 0) {
    const result = depositPollen(world.hive, world.bee, DAY.honeyPerPollen, nowMs);
    world.score += result.count * SCORE.deposit;
    if (result.wasFull) world.score += SCORE.fullPouchBonus;
    world.stats.deposited += result.count;
    world.audio.deposit();
  }

  // Wasps: a touch stings (unless the bee just got stung).
  for (const w of world.wasps) {
    if (waspTouchingBee(w, world.bee) && !beeIsInvulnerable(world.bee, nowMs)) {
      if (stingBee(world.bee, w.x, w.y, nowMs)) {
        world.stats.stings += 1;
        world.audio.sting();
        scareWasp(w, nowMs);
      }
    }
  }

  // The Hornet Queen: a touch stings too, then she circles back for more.
  if (world.queen && queenTouchingBee(world.queen, world.bee) && !beeIsInvulnerable(world.bee, nowMs)) {
    if (stingBee(world.bee, world.queen.x, world.queen.y, nowMs)) {
      world.stats.stings += 1;
      world.audio.sting();
      scareQueen(world.queen, nowMs);
    }
  }

  // Endings.
  if (world.bee.lives <= 0) {
    world.state = 'lost';
    world.loseReason = 'Three stings — the little bee tumbles to the grass.';
    world.audio.lose();
  } else if (world.hive.honey >= DAY.honeyTarget) {
    world.state = 'won';
    world.score += Math.floor(world.timeLeft) * SCORE.timeBonusPerSecond;
    if (world.stats.stings === 0) world.score += SCORE.noStingBonus;
    world.audio.win();
  } else if (world.timeLeft <= 0) {
    world.state = 'lost';
    world.loseReason = 'The sun set before the hive was full.';
    world.audio.lose();
  }
  return world;
}

// One frame: read input, advance the world, draw it.
export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const input = createInput();
  const audio = createAudio();
  const world = createWorld(1);
  world.audio = audio;

  let last = performance.now();
  let raf = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (input.wasPressed('m')) {
      audio.toggleMute();
    }
    if (world.state === 'title') {
      if (input.wasPressed('1')) { world.difficulty = 'easy'; audio.click(); }
      if (input.wasPressed('2')) { world.difficulty = 'normal'; audio.click(); }
      if (input.wasPressed('3')) { world.difficulty = 'hard'; audio.click(); }
      if (input.wasPressed('space') || input.wasPressed('enter')) {
        audio.unlock();
        audio.click();
        startDay(world);
      }
    } else if (world.state === 'won' || world.state === 'lost') {
      if (input.wasPressed('r') || input.wasPressed('space') || input.wasPressed('enter')) {
        audio.click();
        startDay(world);
      }
    } else {
      updateWorld(world, input, dt);
    }
    render(ctx, world);
    input.endFrame();
    raf = requestAnimationFrame(frame);
  }

  return {
    world,
    start() {
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      input.detach();
    },
  };
}
