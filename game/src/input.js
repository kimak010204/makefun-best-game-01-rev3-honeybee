// HONEYBEE — keyboard input: tracks which keys are held and edge presses.
// The game reads this every frame; nothing here knows about the game itself.

export function createInput() {
  const held = new Set();
  const pressed = new Set(); // edge-triggered: cleared once per frame by the loop

  function keyOf(event) {
    const k = event.key;
    if (k === ' ') return 'space';
    return k.length === 1 ? k.toLowerCase() : k.toLowerCase();
  }

  function onDown(event) {
    const k = keyOf(event);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) || k === 'space') {
      event.preventDefault(); // keep arrows/space from scrolling the page
    }
    if (!held.has(k)) pressed.add(k);
    held.add(k);
  }

  function onUp(event) {
    held.delete(keyOf(event));
  }

  function onBlur() {
    held.clear();
  }

  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);

  return {
    // Held-down direction, as a unit-ish vector (x right, y down).
    moveVector() {
      let x = 0;
      let y = 0;
      if (held.has('arrowleft') || held.has('a')) x -= 1;
      if (held.has('arrowright') || held.has('d')) x += 1;
      if (held.has('arrowup') || held.has('w')) y -= 1;
      if (held.has('arrowdown') || held.has('s')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.SQRT2;
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    // True only on the frame the key went down.
    wasPressed(name) {
      return pressed.has(name);
    },
    endFrame() {
      pressed.clear();
    },
    detach() {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}
