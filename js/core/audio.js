/* Synthesised sound effects — no audio files, nothing to precache, nothing to license.
   The context is created lazily on the first user gesture to satisfy autoplay policy.

   Deliberately QUIETER and softer than the chemistry app's equivalent. This app asks
   for sustained reading, and a bright arcade sting every eight seconds fights that: the
   default gain is about two thirds, the attacks are slower, and the paper/ink cues are
   filtered noise rather than tones. */
window.EN = window.EN || {};

EN.Sound = (function () {
  let ctx = null, master = null, comp = null;
  let enabled = true;
  let volume = 0.7;
  let lastPlay = 0;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      // A limiter keeps stacked cues (combo + coin + level-up) from clipping.
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 12;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /** One shaped oscillator note. opts: {type, gain, delay, slideTo, attack, filter…} */
  function tone(freq, dur, opts) {
    const a = ac();
    if (!a || !enabled) return;
    const o = opts || {};
    const t0 = a.currentTime + (o.delay || 0);

    const osc = a.createOscillator();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.slideTo), t0 + dur);
    if (o.detune) osc.detune.value = o.detune;

    const g = a.createGain();
    const peak = o.gain === undefined ? 0.09 : o.gain;
    const atk = o.attack === undefined ? 0.018 : o.attack;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    let node = osc;
    if (o.filter) {
      const f = a.createBiquadFilter();
      f.type = o.filter;
      f.frequency.value = o.filterFreq || 900;
      if (o.q) f.Q.value = o.q;
      node = node.connect(f);
    }
    node.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** Filtered noise burst — paper, ink, pencil, breath. */
  function noise(dur, opts) {
    const a = ac();
    if (!a || !enabled) return;
    const o = opts || {};
    const t0 = a.currentTime + (o.delay || 0);
    const frames = Math.max(1, Math.floor(a.sampleRate * dur));
    const buf = a.createBuffer(1, frames, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      const decay = o.reverse ? i / frames : 1 - i / frames;
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    const src = a.createBufferSource();
    src.buffer = buf;

    const filter = a.createBiquadFilter();
    filter.type = o.filter || "bandpass";
    filter.frequency.setValueAtTime(o.freq || 1200, t0);
    if (o.sweepTo) filter.frequency.exponentialRampToValueAtTime(Math.max(40, o.sweepTo), t0 + dur);
    filter.Q.value = o.q || 1;

    const g = a.createGain();
    g.gain.value = o.gain === undefined ? 0.06 : o.gain;

    src.connect(filter).connect(g).connect(master);
    src.start(t0);
  }

  /** Play a sequence of [freq, startOffset] notes. */
  function seq(notes, dur, opts) {
    notes.forEach(([f, at]) =>
      tone(f, dur, Object.assign({}, opts, { delay: ((opts && opts.delay) || 0) + at })));
  }

  /** Rate-limit chatty cues so rapid taps don't machine-gun. */
  function throttled(fn, ms) {
    return function () {
      const now = performance.now();
      if (now - lastPlay < (ms || 45)) return;
      lastPlay = now;
      fn.apply(null, arguments);
    };
  }

  const MAJOR = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];

  return {
    setEnabled(v) { enabled = !!v; },
    isEnabled() { return enabled; },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      if (master) master.gain.value = volume;
    },
    getVolume() { return volume; },

    /* ── core feedback ─────────────────────────────────────── */
    correct()  { tone(587.33, 0.10, { type: "triangle", gain: 0.10 });
                 tone(880, 0.16, { type: "triangle", gain: 0.075, delay: 0.075 }); },
    wrong()    { tone(220, 0.18, { type: "sawtooth", gain: 0.065, filter: "lowpass", filterFreq: 1100 });
                 tone(147, 0.26, { type: "sawtooth", gain: 0.055, delay: 0.09, filter: "lowpass", filterFreq: 800 }); },
    close()    { tone(494, 0.13, { type: "sine", gain: 0.08 });
                 tone(587, 0.18, { type: "sine", gain: 0.055, delay: 0.09 }); },
    error()    { tone(175, 0.11, { type: "square", gain: 0.05 });
                 tone(139, 0.15, { type: "square", gain: 0.045, delay: 0.1 }); },
    click:     throttled(() => tone(520, 0.032, { type: "square", gain: 0.032 }), 32),
    tap:       throttled(() => tone(700, 0.028, { type: "sine", gain: 0.028 }), 32),
    hover:     throttled(() => tone(1040, 0.02, { type: "sine", gain: 0.012 }), 70),
    nav()      { noise(0.17, { freq: 420, sweepTo: 2200, gain: 0.03, filter: "bandpass", q: 0.8 }); },

    /* ── stationery: the app's signature palette ───────────── */
    /** A pen nib touching paper. Used for typing in every free-text field. */
    type:      throttled(() => noise(0.02, { freq: 2600 + Math.random() * 900, gain: 0.02, q: 2 }), 22),
    /** Turning a page. Screen transitions and card reveals. */
    page()     { noise(0.22, { freq: 900, sweepTo: 3200, gain: 0.035, q: 0.6 });
                 noise(0.12, { freq: 2400, gain: 0.02, delay: 0.09 }); },
    /** A single pencil stroke — ticking a descriptor. */
    stroke:    throttled(() => noise(0.055, { freq: 1500, sweepTo: 3000, gain: 0.03, q: 1.4 }), 40),
    /** Setting a cell in a grid — the Band Grid, the Marking Desk, the Architect. */
    cellSet()  { tone(659.25, 0.055, { type: "triangle", gain: 0.05 });
                 noise(0.04, { freq: 1900, gain: 0.02, q: 1.6 }); },
    /** Choosing an option in a list — settings, themes, avatars. */
    select()   { tone(523.25, 0.06, { type: "sine", gain: 0.055, slideTo: 698.46 }); },
    /** A bare tap. The arcade's only voice, deliberately plain. */
    tap:       throttled(() => tone(440, 0.035, { type: "square", gain: 0.03 }), 30),
    /** Red pen. Marking something wrong. */
    redPen()   { noise(0.09, { freq: 1100, sweepTo: 500, gain: 0.05, q: 1.2 });
                 tone(300, 0.08, { type: "sawtooth", gain: 0.04, slideTo: 200 }); },
    /** Ink drying, or a quote committing to the Vault. */
    ink()      { tone(392, 0.14, { type: "sine", gain: 0.055, slideTo: 588 });
                 noise(0.16, { freq: 700, sweepTo: 1800, gain: 0.022 }); },
    /** Rubber on paper — deleting a card in the Essay Architect. */
    erase:     throttled(() => noise(0.1, { freq: 600, gain: 0.03, q: 0.8, filter: "lowpass" }), 60),
    /** Closing a book. Leaving a reference screen. */
    bookClose(){ noise(0.26, { freq: 300, sweepTo: 90, gain: 0.055, filter: "lowpass" });
                 tone(110, 0.2, { type: "sine", gain: 0.045 }); },
    /** Typewriter carriage return — end of a Draft Desk paragraph. */
    carriage() { noise(0.07, { freq: 1800, gain: 0.035 });
                 tone(880, 0.05, { type: "square", gain: 0.03, delay: 0.06 });
                 noise(0.13, { freq: 500, sweepTo: 260, gain: 0.03, delay: 0.09 }); },

    /* ── streaks & scoring ─────────────────────────────────── */
    combo(n)   {
      const step = Math.min(n, 16);
      tone(494 + step * 38, 0.11, { type: "triangle", gain: 0.085 });
      tone(988 + step * 38, 0.09, { type: "sine", gain: 0.035, delay: 0.055 });
    },
    comboBreak() { tone(370, 0.24, { type: "sawtooth", gain: 0.065, slideTo: 110 }); },
    multiplier(level) {
      seq(MAJOR.slice(0, Math.min(4 + level, 8)).map((f, i) => [f, i * 0.06]), 0.17,
          { type: "triangle", gain: 0.065 });
    },
    coin()     { tone(1100, 0.055, { type: "square", gain: 0.042 });
                 tone(1480, 0.11, { type: "square", gain: 0.034, delay: 0.05 }); },
    coinPile() { for (let i = 0; i < 6; i++)
                   tone(950 + Math.random() * 650, 0.065, { type: "square", gain: 0.025, delay: i * 0.05 }); },
    xp()       { tone(830, 0.065, { type: "sine", gain: 0.035, slideTo: 1240 }); },

    /* ── progression ───────────────────────────────────────── */
    levelUp()  {
      seq([[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]], 0.32, { type: "triangle", gain: 0.095 });
      seq([[262, 0], [330, 0.1], [392, 0.2], [523, 0.3]], 0.36, { type: "sine", gain: 0.05 });
      noise(0.52, { freq: 380, sweepTo: 3400, gain: 0.028, reverse: true });
    },
    prestige() {
      seq([[392, 0], [523, 0.11], [659, 0.22], [784, 0.33], [1047, 0.44], [1319, 0.55]], 0.52,
          { type: "triangle", gain: 0.095 });
      seq([[196, 0.05], [262, 0.27], [392, 0.49]], 0.95, { type: "sine", gain: 0.065 });
      noise(1.1, { freq: 190, sweepTo: 5200, gain: 0.035, reverse: true });
    },
    achievement() {
      seq([[784, 0], [988, 0.11], [1319, 0.22]], 0.34, { type: "sine", gain: 0.085 });
      tone(1568, 0.5, { type: "triangle", gain: 0.035, delay: 0.32 });
    },
    rankUp()   { seq([[659, 0], [880, 0.09], [1319, 0.18]], 0.3, { type: "triangle", gain: 0.08 }); },
    unlock()   { tone(660, 0.11, { type: "sine", gain: 0.06, slideTo: 1320 });
                 tone(1320, 0.24, { type: "triangle", gain: 0.05, delay: 0.1 }); },
    quest()    { seq([[587, 0], [784, 0.1], [1175, 0.2]], 0.32, { type: "triangle", gain: 0.085 }); },
    daily()    { seq([[659, 0], [831, 0.09], [988, 0.18], [1319, 0.27]], 0.32, { type: "sine", gain: 0.08 }); },

    /* ── run outcomes ──────────────────────────────────────── */
    win()      { seq([[523, 0], [659, 0.11], [784, 0.22], [1047, 0.33]], 0.36, { type: "triangle", gain: 0.085 }); },
    perfect()  {
      seq([[659, 0], [880, 0.09], [1047, 0.18], [1319, 0.27], [1760, 0.36]], 0.42,
          { type: "triangle", gain: 0.085 });
      seq([[330, 0.02], [440, 0.2], [660, 0.38]], 0.72, { type: "sine", gain: 0.05 });
    },
    lose()     { seq([[415, 0], [349, 0.12], [294, 0.24], [196, 0.36]], 0.32,
                     { type: "sawtooth", gain: 0.065, filter: "lowpass", filterFreq: 1000 }); },
    gameStart(){ tone(392, 0.13, { type: "triangle", gain: 0.06, slideTo: 784 });
                 noise(0.26, { freq: 280, sweepTo: 2600, gain: 0.028, reverse: true }); },
    timeout()  { seq([[440, 0], [415, 0.15], [392, 0.3]], 0.32, { type: "square", gain: 0.06 }); },

    /* ── clocks ────────────────────────────────────────────── */
    tick()     { tone(880, 0.024, { type: "square", gain: 0.024 }); },
    tickUrgent(){ tone(1200, 0.032, { type: "square", gain: 0.045 }); },
    lowTime()  { tone(1320, 0.065, { type: "sawtooth", gain: 0.04 });
                 tone(1050, 0.065, { type: "sawtooth", gain: 0.04, delay: 0.09 }); },

    /* ── power-ups ─────────────────────────────────────────── */
    puFifty()  { noise(0.19, { freq: 2800, sweepTo: 560, gain: 0.045 });
                 tone(830, 0.11, { type: "square", gain: 0.04, slideTo: 415 }); },
    puSkip()   { tone(620, 0.1, { type: "square", gain: 0.045, slideTo: 1240 });
                 tone(930, 0.09, { type: "square", gain: 0.035, delay: 0.075, slideTo: 1660 }); },
    puFreeze() { seq([[1600, 0], [1400, 0.055], [1900, 0.11], [1500, 0.17]], 0.22,
                     { type: "sine", gain: 0.045 });
                 noise(0.42, { freq: 4600, sweepTo: 1900, gain: 0.022 }); },
    puReread() { noise(0.2, { freq: 800, sweepTo: 2600, gain: 0.03, q: 0.7 });
                 tone(523, 0.16, { type: "sine", gain: 0.05, slideTo: 784 }); },
    puHint()   { tone(700, 0.09, { type: "sine", gain: 0.05 });
                 tone(1050, 0.14, { type: "sine", gain: 0.04, delay: 0.07 }); },
    puInsight(){ seq([[784, 0], [1047, 0.07], [1319, 0.14]], 0.26, { type: "sine", gain: 0.06 });
                 noise(0.4, { freq: 900, sweepTo: 4200, gain: 0.024, reverse: true }); },
    puAdrenaline(){ seq([[523, 0], [784, 0.06], [1047, 0.12], [1568, 0.18]], 0.28,
                        { type: "triangle", gain: 0.08 });
                    noise(0.5, { freq: 700, sweepTo: 5000, gain: 0.03, reverse: true }); },

    /* ── matching / grids ──────────────────────────────────── */
    flip()     { tone(420, 0.06, { type: "sine", gain: 0.045, slideTo: 700 });
                 noise(0.055, { freq: 2200, gain: 0.02 }); },
    match()    { tone(830, 0.075, { type: "sine", gain: 0.07 });
                 tone(1240, 0.13, { type: "sine", gain: 0.05, delay: 0.065 }); },
    mismatch() { tone(330, 0.13, { type: "triangle", gain: 0.045, slideTo: 220 }); },
    cellSet:   throttled(() => tone(760, 0.035, { type: "sine", gain: 0.03 }), 35),
    gridClear(){ seq([[659, 0], [880, 0.08], [1175, 0.16], [1568, 0.24]], 0.3,
                     { type: "triangle", gain: 0.075 }); },

    /* ── marking desk / reveal ─────────────────────────────── */
    reveal()   { noise(0.2, { freq: 600, sweepTo: 2400, gain: 0.03, reverse: true });
                 tone(523, 0.18, { type: "sine", gain: 0.05, slideTo: 784 }); },
    bandExact(){ seq([[784, 0], [1175, 0.09]], 0.24, { type: "triangle", gain: 0.08 });
                 tone(1568, 0.3, { type: "sine", gain: 0.03, delay: 0.15 }); },
    bandNear() { tone(587, 0.12, { type: "triangle", gain: 0.06 });
                 tone(698, 0.16, { type: "sine", gain: 0.04, delay: 0.09 }); },
    bandMiss() { tone(311, 0.2, { type: "sawtooth", gain: 0.05, slideTo: 180, filter: "lowpass", filterFreq: 900 }); },

    /* ── Layer C verdicts ─────────────────────────────────────
       Three cues for three verdicts, and a fourth for "unavailable" that is neutral
       rather than negative — the student has not got anything wrong. */
    nailed()   { seq([[659, 0], [988, 0.08], [1319, 0.16]], 0.3, { type: "triangle", gain: 0.08 });
                 noise(0.36, { freq: 1100, sweepTo: 3800, gain: 0.022, reverse: true }); },
    circling() { tone(587, 0.14, { type: "sine", gain: 0.06 });
                 tone(740, 0.14, { type: "sine", gain: 0.05, delay: 0.1 });
                 tone(659, 0.2, { type: "sine", gain: 0.04, delay: 0.2 }); },
    notYet()   { tone(392, 0.18, { type: "triangle", gain: 0.05, slideTo: 294 }); },
    unavailable(){ noise(0.14, { freq: 700, gain: 0.02, q: 0.6 });
                   tone(440, 0.1, { type: "sine", gain: 0.028 }); },
    modelReady(){ seq([[523, 0], [659, 0.09], [784, 0.18], [1047, 0.27]], 0.34,
                      { type: "sine", gain: 0.07 }); },

    /* ── combat ────────────────────────────────────────────── */
    hit()      { tone(180, 0.13, { type: "square", gain: 0.08, slideTo: 85 });
                 noise(0.1, { freq: 560, gain: 0.05 }); },
    crit()     { tone(250, 0.17, { type: "sawtooth", gain: 0.095, slideTo: 68 });
                 noise(0.23, { freq: 1300, sweepTo: 190, gain: 0.07 });
                 tone(1240, 0.14, { type: "square", gain: 0.045, delay: 0.02 }); },
    playerHurt(){ noise(0.3, { freq: 260, sweepTo: 85, gain: 0.09 });
                  tone(115, 0.36, { type: "sawtooth", gain: 0.07, slideTo: 58 }); },
    bossIntro(){ tone(98, 0.95, { type: "sawtooth", gain: 0.08, filter: "lowpass", filterFreq: 460 });
                 tone(147, 0.72, { type: "sawtooth", gain: 0.055, delay: 0.1, filter: "lowpass", filterFreq: 560 });
                 noise(1.05, { freq: 110, sweepTo: 820, gain: 0.038, reverse: true }); },
    bossDefeat(){
      noise(0.72, { freq: 850, sweepTo: 55, gain: 0.1 });
      seq([[262, 0.1], [330, 0.26], [392, 0.42], [523, 0.58]], 0.5, { type: "triangle", gain: 0.09 });
      tone(65, 0.9, { type: "sine", gain: 0.08, delay: 0.05 });
    },
    bossHeal() { seq([[440, 0], [523, 0.09], [659, 0.18]], 0.3, { type: "sine", gain: 0.06 });
                 noise(0.4, { freq: 560, sweepTo: 2200, gain: 0.022, reverse: true }); },
    lowHealth(){ tone(160, 0.5, { type: "sine", gain: 0.06 });
                 tone(120, 0.5, { type: "sine", gain: 0.05, delay: 0.3 }); },
    rewrite()  { noise(0.24, { freq: 1400, sweepTo: 420, gain: 0.04 });
                 tone(415, 0.16, { type: "square", gain: 0.045, slideTo: 622 }); },

    /* ── shop ──────────────────────────────────────────────── */
    purchase() { tone(659, 0.085, { type: "square", gain: 0.045 });
                 tone(880, 0.11, { type: "square", gain: 0.04, delay: 0.075 });
                 tone(1320, 0.17, { type: "triangle", gain: 0.035, delay: 0.15 }); },
    equip()    { tone(880, 0.1, { type: "sine", gain: 0.05, slideTo: 1320 }); },
    denied()   { tone(210, 0.1, { type: "square", gain: 0.05 });
                 tone(158, 0.15, { type: "square", gain: 0.045, delay: 0.085 }); },
    open()     { noise(0.36, { freq: 280, sweepTo: 3000, gain: 0.045, reverse: true });
                 tone(392, 0.15, { type: "sine", gain: 0.05, slideTo: 880 }); },
    rareDrop() {
      seq([[880, 0], [1175, 0.1], [1568, 0.2], [2093, 0.3]], 0.44, { type: "triangle", gain: 0.085 });
      noise(0.9, { freq: 1100, sweepTo: 6200, gain: 0.032, reverse: true });
    }
  };
})();
