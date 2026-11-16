// HONEYBEE — tiny synth sounds, made with WebAudio, no audio files.
// Everything is guarded: no sound before the first user gesture, M mutes.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch (e) {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, durMs, type, vol, whenMs = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + whenMs / 1000;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + durMs / 1000 + 0.02);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    // A soft pop when a pollen is picked.
    collect() {
      tone(660, 90, 'sine', 0.12);
      tone(990, 110, 'sine', 0.08, 60);
    },
    // A happy little arpeggio when pollen becomes honey.
    deposit() {
      tone(523, 110, 'triangle', 0.14);
      tone(659, 110, 'triangle', 0.14, 90);
      tone(784, 180, 'triangle', 0.16, 180);
    },
    // A low angry buzz for a sting.
    sting() {
      tone(140, 260, 'sawtooth', 0.16);
      tone(110, 300, 'sawtooth', 0.12, 80);
    },
    // Sunrise fanfare for a win.
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 220, 'triangle', 0.16, i * 130));
    },
    // A sad slide down for a loss.
    lose() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 260, 'sine', 0.13, i * 160));
    },
    // A click when a button-ish action happens.
    click() {
      tone(880, 60, 'square', 0.06);
    },
  };
}
