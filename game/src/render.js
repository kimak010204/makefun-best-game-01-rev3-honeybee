// HONEYBEE — every pixel: sky, sun, meadow, oak, flowers, bee, wasps, HUD.
// All art is drawn in code (no image files), so the game needs no network.

import { VIEW, PALETTE, BEE, DAY } from './config.js';
import { HIVE } from './hive.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSky(ctx, timeLeft, daySeconds, nowMs) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.groundY);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.width, VIEW.groundY);
  // The sun crosses the sky as the day runs out: high at noon, low at dusk.
  const frac = timeLeft / daySeconds; // 1 at dawn, 0 at sunset
  const sunX = 120 + (1 - frac) * (VIEW.width - 280);
  const sunY = 90 + (1 - frac) * 130;
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.fillStyle = PALETTE.sunRays;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + nowMs / 9000;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
    ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
    ctx.lineWidth = 5;
    ctx.strokeStyle = PALETTE.sunRays;
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(-8, -8, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Soft drifting clouds.
  ctx.fillStyle = PALETTE.cloud;
  const clouds = [
    { x: ((nowMs / 60) % (VIEW.width + 240)) - 120, y: 60, s: 1 },
    { x: ((nowMs / 90 + 300) % (VIEW.width + 240)) - 120, y: 130, s: 0.7 },
    { x: ((nowMs / 45 + 600) % (VIEW.width + 240)) - 120, y: 40, s: 0.85 },
  ];
  for (const c of clouds) {
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 52 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 30 * c.s, c.y + 4, 36 * c.s, 13 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - 32 * c.s, c.y + 5, 32 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMeadow(ctx, nowMs) {
  const grad = ctx.createLinearGradient(0, VIEW.groundY, 0, VIEW.height);
  grad.addColorStop(0, PALETTE.grassTop);
  grad.addColorStop(1, PALETTE.grassBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, VIEW.groundY, VIEW.width, VIEW.height - VIEW.groundY);
  // Grass tufts swaying gently.
  ctx.strokeStyle = '#2f7031';
  ctx.lineWidth = 2;
  for (let i = 0; i < 40; i++) {
    const x = (i * 97) % VIEW.width;
    const y = VIEW.groundY + 12 + ((i * 53) % 100);
    const sway = Math.sin(nowMs / 700 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sway, y - 10, x + sway * 1.6, y - 16);
    ctx.stroke();
  }
  // A few dirt patches for texture.
  ctx.fillStyle = PALETTE.dirt;
  ctx.globalAlpha = 0.35;
  for (const [x, y, r] of [[180, 540, 26], [420, 570, 34], [700, 545, 22], [90, 580, 18]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawOakAndHive(ctx, hive, nowMs) {
  // The old oak on the right edge.
  ctx.fillStyle = PALETTE.trunk;
  ctx.beginPath();
  ctx.moveTo(HIVE.treeX - 16, VIEW.groundY);
  ctx.quadraticCurveTo(HIVE.treeX - 10, 220, HIVE.treeX - 6, 120);
  ctx.lineTo(HIVE.treeX + 22, 120);
  ctx.quadraticCurveTo(HIVE.treeX + 14, 220, HIVE.treeX + 26, VIEW.groundY);
  ctx.closePath();
  ctx.fill();
  // Canopy: three soft green blobs.
  ctx.fillStyle = PALETTE.leaves;
  for (const [dx, dy, r] of [[-40, -30, 52], [30, -40, 58], [0, -70, 55]]) {
    ctx.beginPath();
    ctx.arc(HIVE.treeX + dx, HIVE.treeTopY + dy + 40, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.leavesDark;
  ctx.beginPath();
  ctx.arc(HIVE.treeX - 30, HIVE.treeTopY + 10, 26, 0, Math.PI * 2);
  ctx.arc(HIVE.treeX + 40, HIVE.treeTopY - 10, 22, 0, Math.PI * 2);
  ctx.fill();
  // The hive: a skep hanging under the canopy, glowing when honey lands.
  const glow = nowMs < hive.flashUntilMs ? 0.5 : 0;
  ctx.save();
  ctx.translate(HIVE.x, HIVE.y);
  if (glow > 0) {
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#ffe98a';
    ctx.beginPath();
    ctx.arc(0, 0, HIVE.radius + 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = PALETTE.hive;
  ctx.beginPath();
  ctx.arc(0, 0, HIVE.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.hiveDark;
  ctx.lineWidth = 3;
  for (const r of [14, 26, 38]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.hiveHole;
  ctx.beginPath();
  ctx.ellipse(0, 6, 9, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Honey dripping from the hive mouth shows progress at a glance.
  const drip = Math.floor(hive.honey / 25);
  ctx.fillStyle = '#e8a13a';
  for (let i = 0; i < drip; i++) {
    ctx.beginPath();
    ctx.arc(-24 + i * 16, HIVE.radius - 6, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFlowers(ctx, field, nowMs) {
  for (const f of field.flowers) {
    const sway = Math.sin(nowMs / 900 + f.swayPhase) * 4;
    const headX = f.x + sway;
    const headY = f.y - f.stemH;
    // Stem + leaves.
    ctx.strokeStyle = PALETTE.stem;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.quadraticCurveTo(f.x + sway / 2, f.y - f.stemH / 2, headX, headY);
    ctx.stroke();
    ctx.fillStyle = PALETTE.stem;
    ctx.beginPath();
    ctx.ellipse(f.x - 8, f.y - f.stemH * 0.5, 9, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Petals.
    ctx.fillStyle = f.petal;
    for (let i = 0; i < f.petals; i++) {
      const a = (i / f.petals) * Math.PI * 2;
      const px = headX + Math.cos(a) * 13 * f.bloom;
      const py = headY + Math.sin(a) * 13 * f.bloom;
      ctx.beginPath();
      ctx.ellipse(px, py, 8 * f.bloom, 5 * f.bloom, a, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center: golden, with pollen dots that vanish as the bee picks them.
    ctx.fillStyle = PALETTE.petalCenter;
    ctx.beginPath();
    ctx.arc(headX, headY, 8 * f.bloom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff7cc';
    for (let i = 0; i < f.pollen; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(headX + Math.cos(a) * 4, headY + Math.sin(a) * 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // A spider lurks on its flower: eight legs, a dark body, no mistaking it.
    if (f.hasSpider) {
      ctx.strokeStyle = PALETTE.spider;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = -0.4 + i * 0.5;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX + Math.cos(a - 1.2) * 12, headY + Math.sin(a - 1.2) * 12 - 6);
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX + Math.cos(a + 1.2) * 12, headY + Math.sin(a + 1.2) * 12 - 6);
        ctx.stroke();
      }
      ctx.fillStyle = PALETTE.spider;
      ctx.beginPath();
      ctx.arc(headX, headY - 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d43d2a';
      ctx.beginPath();
      ctx.arc(headX - 2, headY - 4, 1.5, 0, Math.PI * 2);
      ctx.arc(headX + 2, headY - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawBee(ctx, bee, nowMs) {
  const blink = bee.invulnerableUntil > nowMs && Math.floor(nowMs / 120) % 2 === 0;
  ctx.save();
  ctx.translate(bee.x, bee.y);
  if (blink) ctx.globalAlpha = 0.45;
  ctx.scale(bee.facing, 1);
  // Wings: two translucent ellipses flapping fast.
  const flap = Math.sin(bee.wingPhase) * 0.5;
  ctx.fillStyle = PALETTE.wing;
  ctx.beginPath();
  ctx.ellipse(-2, -14 - flap * 4, 12, 6 + flap * 3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -13 - flap * 3, 10, 5 + flap * 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Body: a plump yellow ellipse with two black stripes.
  ctx.fillStyle = PALETTE.beeYellow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.beeBlack;
  ctx.beginPath();
  ctx.ellipse(-3, 0, 4, 10.5, 0, -Math.PI / 2.6, Math.PI / 2.6);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-9, 0, 3, 9, 0, -Math.PI / 2.6, Math.PI / 2.6);
  ctx.fill();
  // Head, eye, smile, antennae.
  ctx.fillStyle = PALETTE.beeYellow;
  ctx.beginPath();
  ctx.arc(12, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(14, -4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(15, 0, 3, 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, -8);
  ctx.quadraticCurveTo(12, -14, 16, -14);
  ctx.moveTo(13, -8);
  ctx.quadraticCurveTo(16, -13, 20, -12);
  ctx.stroke();
  // Pouch: a little sack under the bee that fills with golden dots.
  if (bee.pouch > 0) {
    ctx.fillStyle = '#e8a13a';
    ctx.beginPath();
    ctx.ellipse(0, 12, 7 + bee.pouch, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(bee.pouch), 0, 15);
  }
  ctx.restore();
}

function drawQueen(ctx, q, nowMs) {
  // The Hornet Queen: a wasp grown huge, with a golden crown and red eyes.
  ctx.save();
  ctx.translate(q.x, q.y);
  const dir = q.vx >= 0 ? 1 : -1;
  ctx.scale(dir, 1);
  const flap = Math.sin(q.wingPhase) * 0.5;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.ellipse(-4, -20 - flap * 5, 18, 9 + flap * 4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -19 - flap * 4, 15, 8 + flap * 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a1a12';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath();
  ctx.ellipse(-6, 0, 5, 12, 0, -Math.PI / 2.6, Math.PI / 2.6);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-16, 0, 4, 11, 0, -Math.PI / 2.6, Math.PI / 2.6);
  ctx.fill();
  // Crown: three golden points on her head.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.moveTo(8, -12);
  ctx.lineTo(12, -22);
  ctx.lineTo(16, -12);
  ctx.lineTo(20, -22);
  ctx.lineTo(24, -12);
  ctx.lineTo(26, -20);
  ctx.lineTo(28, -10);
  ctx.closePath();
  ctx.fill();
  // Red eyes, a stinger, and fury.
  ctx.fillStyle = '#ff2e2e';
  ctx.beginPath();
  ctx.arc(20, -4, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-34, 3);
  ctx.stroke();
  ctx.restore();
}

function drawWasp(ctx, w, nowMs) {
  ctx.save();
  ctx.translate(w.x, w.y);
  const dir = w.vx >= 0 ? 1 : -1;
  ctx.scale(dir, 1);
  const flap = Math.sin(w.wingPhase) * 0.5;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(-2, -11 - flap * 3, 10, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.waspBody;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.waspStripe;
  ctx.beginPath();
  ctx.ellipse(-4, 0, 4, 8.5, 0, -Math.PI / 2.6, Math.PI / 2.6);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-11, 0, 3, 7.5, 0, -Math.PI / 2.6, Math.PI / 2.6);
  ctx.fill();
  // Angry eyes + stinger: this one means trouble.
  ctx.fillStyle = '#d43d2a';
  ctx.beginPath();
  ctx.arc(12, -3, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(-22, 2);
  ctx.stroke();
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  // A heart drawn with two arcs + a triangle: reliable in any browser,
  // where emoji hearts render as white outlines in headless Chrome.
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.35);
  ctx.bezierCurveTo(-size, -size * 0.45, -size * 0.45, -size * 1.05, 0, -size * 0.35);
  ctx.bezierCurveTo(size * 0.45, -size * 1.05, size, -size * 0.45, 0, size * 0.35);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#e23b3b';
    ctx.fill();
  } else {
    ctx.fillStyle = '#c9c9c9';
    ctx.fill();
  }
  ctx.restore();
}

function drawMiniSun(ctx, x, y, r) {
  // A tiny sun for the HUD timer: circle + rays, no emoji needed.
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#e8a13a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r + 2), Math.sin(a) * (r + 2));
    ctx.lineTo(Math.cos(a) * (r + 6), Math.sin(a) * (r + 6));
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHud(ctx, state) {
  const { hive, bee, timeLeft, score } = state;
  ctx.save();
  // Honey jar (top left): the win meter.
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 12, 10, 210, 54, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🍯 HONEY', 22, 30);
  ctx.fillStyle = '#e8e0c8';
  roundRect(ctx, 22, 38, 150, 14, 7);
  ctx.fill();
  ctx.fillStyle = hive.honey >= DAY.honeyTarget ? '#7ec850' : '#e8a13a';
  const w = Math.max(0, Math.min(1, hive.honey / DAY.honeyTarget)) * 150;
  if (w > 0) {
    roundRect(ctx, 22, 38, w, 14, 7);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${Math.floor(hive.honey)}%`, 180, 50);
  // Lives (drawn hearts) + pollen pouch (top middle).
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 232, 10, 150, 54, 10);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    drawHeart(ctx, 256 + i * 26, 30, 11, i < bee.lives);
  }
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = PALETTE.hudText;
  ctx.textAlign = 'left';
  ctx.fillText(`pouch ${bee.pouch}/${6}`, 242, 54);
  // Sun timer (top right): seconds left until sunset.
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, VIEW.width - 172, 10, 160, 54, 10);
  ctx.fill();
  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);
  drawMiniSun(ctx, VIEW.width - 148, 28, 9);
  ctx.fillStyle = timeLeft < 30 ? PALETTE.danger : PALETTE.hudText;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${mins}:${String(secs).padStart(2, '0')}`, VIEW.width - 24, 34);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('until sunset', VIEW.width - 24, 54);
  // Score (bottom left).
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 12, VIEW.height - 44, 170, 32, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${score}`, 22, VIEW.height - 22);
  ctx.restore();
}

function overlayPanel(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(43,58,43,0.22)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = 'rgba(255,253,245,0.96)';
  roundRect(ctx, VIEW.width / 2 - 260, VIEW.height / 2 - 130, 520, 260, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  roundRect(ctx, VIEW.width / 2 - 260, VIEW.height / 2 - 130, 520, 260, 18);
  ctx.stroke();
  ctx.fillStyle = '#2b3a2b';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW.width / 2, VIEW.height / 2 - 78);
  ctx.font = '16px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW.width / 2, VIEW.height / 2 - 34 + i * 26);
  });
  ctx.restore();
}

export function render(ctx, world) {
  const { state, bee, field, wasps, queen, hive, timeLeft, score, nowMs } = world;
  const daySeconds = world.diff ? world.diff.daySeconds : DAY.seconds;
  drawSky(ctx, timeLeft, daySeconds, nowMs);
  drawMeadow(ctx, nowMs);
  drawOakAndHive(ctx, hive, nowMs);
  drawFlowers(ctx, field, nowMs);
  for (const w of wasps) drawWasp(ctx, w, nowMs);
  if (queen) drawQueen(ctx, queen, nowMs);
  drawBee(ctx, bee, nowMs);
  if (state === 'playing' || state === 'won' || state === 'lost') {
    drawHud(ctx, { hive, bee, timeLeft, score });
  }
  // The Queen's arrival gets a banner: the player must see her coming.
  if (state === 'playing' && world.queenAnnounced && nowMs < (world.queenAnnounceUntilMs || 0)) {
    ctx.save();
    ctx.fillStyle = 'rgba(43,26,18,0.85)';
    roundRect(ctx, VIEW.width / 2 - 230, 76, 460, 44, 12);
    ctx.fill();
    ctx.strokeStyle = '#ff9d2e';
    ctx.lineWidth = 3;
    roundRect(ctx, VIEW.width / 2 - 230, 76, 460, 44, 12);
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑 THE HORNET QUEEN HAS COME!', VIEW.width / 2, 105);
    ctx.restore();
  }
  if (state === 'title') {
    overlayPanel(ctx, '🐝 HONEYBEE', [
      'You are a little bee in a sunny meadow.',
      'Visit flowers to gather pollen, then carry it home',
      'to the hive. Fill the honey jar to 100% before sunset!',
      '',
      'WASD / arrows to fly  •  M mute  •  SPACE to start',
      'Beware wasps and spiders — three stings and you fall!',
      'At 75% honey the Hornet Queen storms in…',
    ], '#e8a13a');
    // Difficulty picker under the panel: 1 easy, 2 normal, 3 hard.
    ctx.save();
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    const labels = ['1 EASY', '2 NORMAL', '3 HARD'];
    const keys = ['easy', 'normal', 'hard'];
    labels.forEach((label, i) => {
      const x = VIEW.width / 2 - 150 + i * 150;
      const y = VIEW.height / 2 + 152;
      const selected = world.difficulty === keys[i];
      ctx.fillStyle = selected ? '#e8a13a' : 'rgba(255,253,245,0.9)';
      roundRect(ctx, x - 62, y - 20, 124, 34, 10);
      ctx.fill();
      if (selected) {
        ctx.strokeStyle = '#a86f1d';
        ctx.lineWidth = 2;
        roundRect(ctx, x - 62, y - 20, 124, 34, 10);
        ctx.stroke();
      }
      ctx.fillStyle = selected ? '#fff' : '#2b3a2b';
      ctx.fillText(label, x, y + 5);
    });
    ctx.restore();
  } else if (state === 'won') {
    overlayPanel(ctx, '🎉 HIVE FULL!', [
      `The hive overflows with honey. Score: ${score}`,
      'The meadow sings your name, little bee.',
      '',
      'Press R or SPACE to play again',
    ], '#7ec850');
  } else if (state === 'lost') {
    overlayPanel(ctx, '🌇 SUNSET…', [
      world.loseReason || 'The day is over.',
      `Honey reached ${Math.floor(hive.honey)}% — so close!  Score: ${score}`,
      '',
      'Press R or SPACE to try again',
    ], '#d43d2a');
  }
}
