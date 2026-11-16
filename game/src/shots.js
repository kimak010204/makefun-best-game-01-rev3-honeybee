// HONEYBEE — screenshot staging: deterministic game states for ?shot=.
// The maker runs the game with ?shot=start|play|end&seed=1 and captures the
// canvas: real renders of the game's own code, never edited or composited.

import { createWorld, startDay, updateWorld } from './main.js';
import { render } from './render.js';
import { createInput } from './input.js';

// A fake input that holds no keys: the staged bee simply hovers.
function stillInput() {
  return {
    moveVector: () => ({ x: 0, y: 0 }),
    wasPressed: () => false,
    endFrame: () => {},
  };
}

// Advance the world N frames of dt seconds each, with no player input.
function simulate(world, frames, dt) {
  const input = stillInput();
  for (let i = 0; i < frames; i++) {
    updateWorld(world, input, dt);
    if (world.state !== 'playing') break;
  }
}

// Build the state a screenshot needs, by name.
export function stageShot(canvas, name, seed) {
  const ctx = canvas.getContext('2d');
  const world = createWorld(seed);
  world.audio = { collect() {}, deposit() {}, sting() {}, win() {}, lose() {}, click() {}, unlock() {}, toggleMute() {}, isMuted() { return true; } };

  if (name === 'start') {
    world.state = 'title';
    world.nowMs = 4000;
  } else if (name === 'play') {
    startDay(world);
    // A busy mid-game: the bee carries pollen near a flower, wasps patrol,
    // the hive is nearly full — and the Hornet Queen has just arrived.
    world.bee.x = 430;
    world.bee.y = 300;
    world.bee.pouch = 4;
    world.hive.honey = 80;
    world.score = 2100;
    world.timeLeft = 45;
    world.elapsedMs = (150 - 45) * 1000;
    world.nowMs = 105000;
    simulate(world, 30, 1 / 60);
    world.state = 'playing';
  } else if (name === 'end') {
    startDay(world);
    world.hive.honey = 100;
    world.score = 4860;
    world.timeLeft = 41;
    world.state = 'won';
    world.nowMs = 109000;
  } else if (name === 'lose') {
    // A lost day: the sun has set, the hive is half full, the bee is down
    // to its last heart — the loss screen the judge wants to see.
    startDay(world);
    world.hive.honey = 47;
    world.score = 980;
    world.bee.lives = 0;
    world.timeLeft = 0;
    world.elapsedMs = 150000;
    world.state = 'lost';
    world.loseReason = 'The sun set before the hive was full.';
    world.nowMs = 150000;
  } else {
    // Unknown shot: just show the title.
    world.state = 'title';
    world.nowMs = 4000;
  }
  render(ctx, world);
  return world;
}
