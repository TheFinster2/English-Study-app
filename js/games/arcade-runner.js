/* MARGIN RUNNER — a nib running down the margin of a page.
   ============================================================================
   Earns nothing but a high score. There is no UI.award() call in this file and there must
   never be one: `economy` asserts its absence and `arcade` plays the games for real and
   checks the ledger has not moved.

   What this rewrite is for. The first version was the browser-dinosaur with rectangles:
   jump, duck, one hit and out, score equal to frames survived. Nothing in it rewarded
   playing WELL — the only way to score more was to survive longer, so the optimal strategy
   was to stand as far from every obstacle as the timing allowed and wait. A runner is fun
   when the safe line and the scoring line are different lines, so almost everything below
   exists to pull the player towards danger and then let them feel good about surviving it:

     • ink drops sit in arcs OVER obstacles, and a chain of them multiplies
     • passing an obstacle within a few pixels pays a near-miss bonus
     • a nib pickup absorbs one hit, so a run has an arc instead of a full stop

   And the feel, which matters more than any of the above: variable jump height, coyote
   time, a jump buffer, a dive, squash and stretch on takeoff and landing. Those five are
   the difference between a control that responds and one that argues.

   Everything decorative is behind EN.FX.isReduced(). The game stays completely playable
   with motion off — it just stops throwing ink about.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.marginrunner = (function () {
  const U = EN.U;

  /* A read-only window onto the run in progress, for the suite.
     A canvas game cannot be inspected from the DOM, and reading it off the pixels turned
     out to be unreliable — the chapter label, the ink drops and the floating numbers all
     share the runner's column, so a "topmost bright pixel" probe measured the word
     "Foolscap". This returns the same numbers the collision code uses, which are the ones
     worth asserting. Nothing in the game reads it. */
  let live = null;

  /* ── the world ──
     A fixed logical size with a device-pixel backing store: the same run plays identically
     on a phone and a laptop, and stays sharp on both.

     1.56:1 rather than the old 2.67:1. The canvas is width-constrained on a phone, so the
     aspect ratio decides how tall the playfield is: the old shape left a 140px strip to
     play in on a 390px screen with 300px of the page below it unused. This is 240px, and
     the cost is look-ahead — 442px of track visible instead of 554, about 1.5 seconds of
     warning at opening speed, against gaps of 56–100 frames. */
  const W = 560, H = 360, GROUND = 300;

  /* ── feel ──
     Frames at 60fps. The three that matter most: HOLD_G is the reduced gravity while the
     jump is held, which is what makes a tap a hop and a hold a full jump; COYOTE lets you
     jump a few frames after leaving the ground; BUFFER lets you press jump slightly BEFORE
     landing and still get it. Without the last two a miss feels like the game ignoring you.

     These numbers are derived, not guessed, because the obstacle heights depend on them:
       tap apex   59px      (measured off a real run, not off this arithmetic)
       held apex  110px
     The gap between those two is the entire reason a held jump exists, so `stack` below is
     78 tall — above the tap and under the hold. The first tuning had a tap apex of 110 and
     a stack of 58, which meant the tallest obstacle in the game was clearable by mashing
     and the hold was decorative. */
  const GRAV = 0.72, JUMP_V = -9.6, HOLD_G = 0.30, HOLD_MAX = 11,
        COYOTE = 6, BUFFER = 8, DIVE_G = 1.7, MAX_FALL = 17;

  const RUN_X = 86, RUN_W = 32, RUN_H = 48, DUCK_H = 24;

  /* Standing, the runner's top is GROUND−48; ducking it is GROUND−24. Anything a duck must
     clear therefore has to END between those two, which is a 24px window — hence the
     hanging obstacles are positioned from their BOTTOM edge rather than their top. */
  const DUCK_BAR_BOTTOM = GROUND - 44;

  /* A pass closer than this counts as a near miss. The two numbers are coupled: ducking
     under a hanging bar clears it by 20px, so anything from 20 up would pay the bonus for
     every duck in the game, and a reward you cannot avoid is not a reward. At 10 it fired
     once or twice in a whole run and the mechanic was invisible. 14 leaves a 6px margin
     under the duck and still rewards a deliberately tight jump. */
  const NEAR_PX = 14, NEAR_POINTS = 25;
  const DROP_BASE = 10, COMBO_WINDOW = 100, COMBO_CAP = 10;
  const CHAPTER_EVERY = 1150, CHAPTERS = 6;
  const SHIELD_INVULN = 70;

  /* Named after the states a page passes through, which is flavour and nothing more —
     the arcade does not teach and must not pretend to. */
  const CHAPTER_NAMES = ["Foolscap", "Second Draft", "Red Pen",
                         "Marginalia", "Palimpsest", "Final Copy"];

  /* ── obstacle patterns ──
     Patterns rather than single obstacles, because a random stream of one-offs reads as
     noise. `from` is the chapter a pattern starts appearing in, so the vocabulary grows as
     the run does, and `recover` is how many frames the player is COMMITTED for once they
     have answered it — the spawner adds that to the gap so nothing is ever asked of them
     while they are still in the air from the last thing.

     Internal offsets are in FRAMES of travel, converted at spawn time. Fixed pixel offsets
     were the bug behind "impossible to avoid": `gauntlet` placed its third block 186px
     after its first, which at 8.6px/frame is inside one jump's airborne distance and at
     5px/frame lands you 4 frames before it. There is no single pixel figure that is fair at
     both speeds, so there should never have been one. */
  const AIR_TAP = 27;                  // frames airborne on a tap jump
  const AIR_HOLD = 40;                 // and on a held one

  const PATTERNS = [
    { id: "footnote", from: 1, recover: AIR_TAP, solve: "tap", build: () => {
        /* Max 34 tall, not 40. A tap keeps the runner above 40px for only 14 frames and a
           38px-wide block takes 12.3 to cross at opening speed — 1.7 frames of tolerance on
           the SIMPLEST obstacle in the game, which is where the two-second deaths came from.
           At 34 the window is 20 frames against 13.2. */
        const w = 22 + Math.random() * 10, h = 26 + Math.random() * 6;
        return { obs: [{ kind: "footnote", x: 0, y: GROUND - h, w, h }], width: w };
      } },
    { id: "marginalia", from: 1, recover: 14, solve: "duck", build: () => {
        const w = 56 + Math.random() * 30, h = 28;
        return { obs: [{ kind: "marginalia", x: 0, y: DUCK_BAR_BOTTOM - h, w, h }], width: w };
      } },
    { id: "stack", from: 2, recover: AIR_HOLD, solve: "hold", build: () => ({
        /* 78 tall: above the 59px tap apex and under the 110px held apex. The first
           obstacle that cannot be mashed through, which is how the hold teaches itself. */
        obs: [{ kind: "footnote", x: 0, y: GROUND - 78, w: 28, h: 78 }], width: 28
      }) },
    { id: "staples", from: 2, recover: AIR_HOLD, solve: "hold", build: sp => {
        /* A HELD jump, and the arithmetic is why. A tap clears a 34px block only between
           frames 6 and 21 — a 15-frame window — and the whole pair has to be inside it at
           once. The pair takes about 20 frames to cross at opening speed, so it does not
           fit in a tap jump AT ALL, at any spacing: every airborne death in a measured set
           of eight runs was this pattern or the stack. Held, the window for 34px runs from
           frame 4 to frame 36, which swallows the crossing with eleven frames of timing
           tolerance either side. A wide obstacle wanting a big jump also reads correctly. */
        const d = sp * 8;
        return { obs: [{ kind: "footnote", x: 0, y: GROUND - 34, w: 20, h: 34 },
                       { kind: "footnote", x: d + 20, y: GROUND - 34, w: 20, h: 34 }],
                 width: d + 40 };
      } },
    { id: "jumpduck", from: 3, recover: AIR_TAP + 6, solve: "tap", build: sp => {
        /* The bar sits 16 frames into the jump, which is past the apex — you clear it in
           the air rather than having to land and duck, and a dive gets you under it if you
           would rather have the ink below. */
        const d = sp * 16;
        return { obs: [{ kind: "footnote", x: 0, y: GROUND - 36, w: 24, h: 36 },
                       { kind: "marginalia", x: d + 24, y: DUCK_BAR_BOTTOM - 28, w: 62, h: 28 }],
                 width: d + 86 };
      } },
    { id: "strike", from: 3, recover: AIR_TAP, solve: "time", build: () => ({
        /* A red-pen strike riding up and down. The bob is deliberately confined to a LOW
           band, so a jump is the right answer at every phase of it.
           It used to travel from GROUND−118 to GROUND−30, which needed three different
           answers depending on where it happened to be — run under it high up, duck it in
           the middle, jump it low down — and it kept moving while you were committed. A
           duck chosen twenty frames out was invalidated by the strike descending 15px
           before you got there, which is exactly the "impossible to avoid" case: the answer
           was right when you gave it and wrong on arrival.

           Confined to GROUND−38…−22 it is always cleared by a tap, with margin: the highest
           it rides needs 38px of the 59px available, so the jump window is 15 frames against
           a 10-frame crossing. An earlier attempt used GROUND−58 as the top of the bob,
           which a tap cleared by one pixel — technically solvable, and a coin toss to play. */
        obs: [{ kind: "strike", x: 0, y: GROUND - 30, w: 30, h: 14,
                bobFrom: GROUND - 38, bobTo: GROUND - 22, phase: Math.random() * 6.28,
                bobSpeed: 0.035 }], width: 30
      }) },
    { id: "gauntlet", from: 4, recover: AIR_TAP, solve: "tap", build: sp => {
        /* Jump the first, clear the bar in the air at 13 frames, land at 27, and the third
           block is at 46 — nineteen frames to see it and press, with the jump buffer to
           help. Frames, not pixels, so that holds at every speed. */
        const a = sp * 13, b = sp * 46;
        return { obs: [{ kind: "footnote", x: 0, y: GROUND - 32, w: 20, h: 32 },
                       { kind: "marginalia", x: a + 20, y: DUCK_BAR_BOTTOM - 26, w: 54, h: 26 },
                       /* 34, not 46: the same 14-frame window against an 11-frame crossing
                          left this one two tenths of a frame of tolerance. */
                       { kind: "footnote", x: b + 20, y: GROUND - 34, w: 22, h: 34 }],
                 width: b + 42 };
      } }
  ];

  function start(root, cfg) {
    const host = EN.Arcade.shell(root, Object.assign({}, cfg, { onTimeUp: () => die(true) }));
    const reduced = EN.FX.isReduced();

    host.body.appendChild(U.el("p", { class: "tiny muted",
      text: "Jump the footnotes, duck the marginalia, and collect the ink. Hold Jump to go " +
            "higher; press Duck in the air to dive. Chain ink drops for a multiplier, and " +
            "pass close for a near-miss bonus." }));

    const canvas = U.el("canvas", { class: "runner-canvas",
      "aria-label": "Margin Runner — a canvas game played with the Jump and Duck buttons below." });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    host.body.appendChild(U.el("div", { class: "runner-wrap" }, [canvas]));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Duck on the left, Jump on the right. Tagged with data-act rather than relied on by
       index, so swapping them is a one-line change and cannot silently rebind the game or
       its suite to the wrong control. */
    const duckBtn = U.el("button", { class: "btn run-btn", type: "button",
      "aria-label": "Duck", data: { act: "duck" } }, [
      U.el("span", { class: "run-btn-ico", text: "⬇" }), U.el("span", { text: "Duck" })]);
    const jumpBtn = U.el("button", { class: "btn run-btn", type: "button",
      "aria-label": "Jump", data: { act: "jump" } }, [
      U.el("span", { class: "run-btn-ico", text: "⬆" }), U.el("span", { text: "Jump" })]);
    const pad = U.el("div", { class: "run-pad" }, [duckBtn, jumpBtn]);
    host.body.appendChild(pad);

    /* ── palette ──
       Read once. Reading computed style inside the loop is a layout read per frame, and
       the theme cannot change while a run is in progress. */
    const cs = getComputedStyle(document.documentElement);
    const col = (n, fallback) => ((cs.getPropertyValue(n) || "").trim() || fallback);
    const C = {
      line:   col("--line", "#3a3226"),
      ink:    col("--ink", "#e8dcc4"),
      faint:  col("--ink-faint", "#6f6350"),
      accent: col("--accent", "#c8b48a"),
      good:   col("--good", "#7fb069"),
      warn:   col("--warn", "#d9a84e"),
      bad:    col("--bad", "#c25b52"),
      info:   col("--info", "#6a9fb5"),
      bg:     col("--bg-1", "#17130d")
    };

    /* ── state ── */
    let y = GROUND, vy = 0, grounded = true, ducking = false, diving = false;
    let holding = false, holdFrames = 0, coyote = 0, buffered = 0;
    let sx = 1, sy = 1;                       // squash and stretch
    let obstacles = [], drops = [], parts = [], floats = [], trail = [];
    let dist = 0, score = 0, chapter = 1, speed = 5.0;
    let combo = 0, comboTimer = 0, bestCombo = 0, collected = 0, nearMisses = 0;
    let shield = false, invuln = 0, shake = 0, banner = 0, bannerText = "";
    /* Three seconds of empty page before the first obstacle. A runner that starts you in
       trouble reads as unfair no matter how fair the rest of it is. */
    let gapLeft = 300, dropCooldown = 90;
    let lastHit = null;
    let raf = null, ended = false, dying = 0, frame = 0;
    const bgMarks = [];
    for (let i = 0; i < 22; i++) {
      bgMarks.push({ x: Math.random() * W, y: 44 + Math.random() * (GROUND - 80),
                     w: 18 + Math.random() * 54, d: 0.28 + Math.random() * 0.22 });
    }

    /* ── input ──
       Jump is press-and-hold. Everything releases on a document-level pointerup as well as
       its own, because a finger that slides off a pad never fires the pad's own event and
       the old build left you ducking for the rest of the run. */
    function pressJump() {
      if (ended || dying) return;
      holding = true;
      buffered = BUFFER;
      tryJump();
    }
    function tryJump() {
      if (buffered <= 0) return;
      if (grounded || coyote > 0) {
        vy = JUMP_V;
        grounded = false;
        coyote = 0;
        buffered = 0;
        holdFrames = HOLD_MAX;
        sy = 1.32; sx = 0.78;                 // stretch off the ground
        EN.Sound.tap();
        puff(RUN_X + RUN_W / 2, GROUND, 6);
      }
    }
    function releaseJump() { holding = false; holdFrames = 0; }
    function setDuck(on) {
      if (ended || dying) return;
      ducking = !!on;
      /* Duck in the air is a dive. It is the only way to get down fast enough for the
         jump-then-duck pattern, and it makes the button useful in both states. */
      if (on && !grounded) { diving = true; releaseJump(); }
      if (!on) diving = false;
    }

    /* Each touch is tracked by pointerId and releases only the control it pressed.
       A single document-level handler that released both looked simpler and was wrong: on
       two thumbs, letting go of Duck also cancelled a jump that was still being held, so
       the held jump silently became a tap. A bot that read the obstacle list and reacted
       correctly still could not clear the 78px stack because of it. A pointer we never saw
       go down releases everything, which is the safe answer when tracking has been lost. */
    const held = new Map();
    function bindPress(node, which) {
      node.addEventListener("pointerdown", e => {
        e.preventDefault();
        held.set(e.pointerId, which);
        if (which === "jump") pressJump(); else setDuck(true);
      });
    }
    bindPress(jumpBtn, "jump");
    bindPress(duckBtn, "duck");
    bindPress(canvas, "jump");

    function onUp(e) {
      const which = held.get(e.pointerId);
      held.delete(e.pointerId);
      if (which === "jump") releaseJump();
      else if (which === "duck") setDuck(false);
      else { releaseJump(); setDuck(false); }
    }
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);

    function onKey(e) {
      if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        if (!e.repeat) pressJump();
      }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); setDuck(true); }
    }
    function onKeyUp(e) {
      if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w") releaseJump();
      if (e.key === "ArrowDown" || e.key === "s") setDuck(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKeyUp);

    /* ── particles and numbers ──
       All decoration. Every spawner returns immediately with motion off, so the game logic
       below never has to ask. */
    function part(x, y2, o) {
      if (reduced) return;
      parts.push({ x, y: y2, vx: o.vx, vy: o.vy, life: o.life, max: o.life,
                   size: o.size, colour: o.colour, g: o.g === undefined ? 0.22 : o.g,
                   kind: o.kind || "dot" });
    }
    function puff(x, y2, n) {
      for (let i = 0; i < n; i++) {
        part(x + (Math.random() - 0.5) * 14, y2, {
          vx: -speed * 0.35 - Math.random() * 1.4, vy: -Math.random() * 1.9,
          life: 22 + Math.random() * 12, size: 1.6 + Math.random() * 2.1,
          colour: C.faint, g: 0.06
        });
      }
    }
    function burst(x, y2, n, colour, spread) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * (spread || 3.4);
        part(x, y2, { vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
                      life: 26 + Math.random() * 18, size: 1.6 + Math.random() * 2.6, colour });
      }
    }
    function float(x, y2, text, colour) {
      if (reduced) return;
      floats.push({ x, y: y2, text, colour, life: 46, max: 46 });
    }

    /* ── spawning ──
       Two numbers make a gap: how long the player is COMMITTED by the pattern they just
       answered, and how long they then get to read the next one. Adding the first is the
       fix for "impossible to avoid" — the old spawner counted reaction time from the moment
       a pattern cleared the screen edge, so a stack (40 frames in the air) followed by
       anything at the 56-frame minimum gave 16 frames to see it, decide and press. */
    const REACT_MIN = 42, REACT_VAR = 38;

    function spawnPattern() {
      const usable = PATTERNS.filter(p => p.from <= chapter);
      const p = usable[Math.floor(Math.random() * usable.length)];
      const built = p.build(speed);
      built.obs.forEach(o => {
        obstacles.push(Object.assign({ minGap: Infinity, done: false, born: frame,
                                       pattern: p.id }, o, { x: W + 30 + o.x }));
      });
      if (Math.random() < 0.78) inkFor(p, built, W + 30);
      gapLeft = built.width + speed * (p.recover + REACT_MIN + Math.random() * REACT_VAR);
    }

    /* The runner's centre height `t` frames into a jump, integrated exactly the way step()
       does it. Used to lay ink along the line the player will actually travel. */
    function centreAt(t, hold) {
      let v = JUMP_V, py = GROUND, left = hold ? HOLD_MAX : 0;
      for (let i = 0; i < t; i++) {
        let g = GRAV;
        if (left > 0 && v < 0) { g = HOLD_G; left--; }
        v = Math.min(MAX_FALL, v + g);
        py = Math.min(GROUND, py + v);
      }
      return py - RUN_H / 2;
    }

    /**
     * Ink for a pattern, placed on the trajectory that solves it.
     *
     * The first version guessed a sine arc between two hand-picked heights, and the guess
     * was wrong in both directions: the low ends of the arc sat at ground level against the
     * face of the block you were meant to be jumping, and the peak sat above where the
     * runner's centre could reach. Sampling the jump cannot make either mistake, and it
     * means the reward for a well-timed jump is that the ink is simply *there*.
     */
    function inkFor(p, built, x0) {
      if (p.solve === "duck") {
        /* Under the bar, at the height a ducking runner's centre passes through. */
        const n = 3;
        for (let i = 0; i < n; i++) {
          drops.push({ x: x0 + (built.width / (n - 1)) * i, y: GROUND - DUCK_H / 2,
                       r: 8, taken: false });
        }
        return;
      }
      /* A bobbing strike has no fixed line through it, so baiting one would be a trap. */
      if (p.solve === "time") return;

      const hold = p.solve === "hold";
      const air = hold ? AIR_HOLD : AIR_TAP;
      const n = 4;
      for (let i = 0; i < n; i++) {
        /* Centre the arc on the obstacle, so the apex of the jump and the apex of the ink
           are the same point. */
        const t = ((i + 0.5) / n) * air;
        drops.push({ x: x0 + built.width / 2 + (t - air / 2) * speed,
                     y: centreAt(t, hold), r: 8, taken: false });
      }
    }

    function spawnLine() {
      /* Free ink on an empty stretch, so there is always something to chase. Only laid when
         the stretch really is empty: a line that crossed an obstacle read as the game
         inviting you into it, which is most of what "messy" meant. */
      const n = 3 + Math.floor(Math.random() * 4);
      const span = (n - 1) * speed * 8;
      if (gapLeft < span + speed * 24) { dropCooldown = 30; return; }
      const y2 = GROUND - 46 - Math.random() * 60;
      for (let i = 0; i < n; i++) {
        drops.push({ x: W + 40 + i * speed * 8, y: y2, r: 8, taken: false });
      }
      dropCooldown = 150 + Math.random() * 160;
    }

    /* ── scoring ──
       Distance pays, but thinly. Drops and near misses are where a score comes from, which
       is the point: the safe line and the scoring line are different lines. */
    function addScore(n) { score += n; host.setScore(score); }

    function takeDrop(d) {
      d.taken = true;
      collected++;
      combo++;
      comboTimer = COMBO_WINDOW;
      if (combo > bestCombo) bestCombo = combo;
      const mult = Math.min(combo, COMBO_CAP);
      addScore(DROP_BASE * mult);
      burst(d.x, d.y, 9, C.accent, 2.6);
      float(d.x, d.y - 10, "+" + DROP_BASE * mult, C.accent);
      if (combo > 1 && combo % 5 === 0) {
        EN.Sound.combo(combo);
        float(RUN_X + 40, GROUND - 128, "×" + mult + " chain!", C.good);
      } else EN.Sound.ink();
    }

    function breakCombo() {
      if (combo >= 5) EN.Sound.comboBreak();
      combo = 0;
    }

    function nextChapter() {
      chapter = Math.min(CHAPTERS, chapter + 1);
      bannerText = "Chapter " + chapter + " — " + CHAPTER_NAMES[chapter - 1];
      banner = reduced ? 1 : 96;
      shake = Math.max(shake, reduced ? 0 : 6);
      EN.Sound.carriage();
    }

    /* ── the hit ──
       With a nib in hand the obstacle loses, not you. That single pickup is what gives a
       run a shape: without it every run ends at the first mistake, and the first mistake
       arrives long before the interesting part of the difficulty curve. */
    function hit(o) {
      if (invuln > 0 || dying) return;
      lastHit = { kind: o.kind, pattern: o.pattern, top: Math.round(o.y),
                  h: Math.round(o.h), chapter, speed: Math.round(speed * 10) / 10,
                  grounded, airborne: !grounded, shielded: true };
      if (shield) {
        shield = false;
        invuln = SHIELD_INVULN;
        o.dead = true;
        breakCombo();
        shake = reduced ? 0 : 10;
        burst(o.x + o.w / 2, o.y + o.h / 2, 16, C.bad, 4.2);
        float(RUN_X + 30, GROUND - 120, "Nib spent", C.bad);
        EN.Sound.redPen();
        return;
      }
      lastHit.shielded = false;
      die(false);
    }

    function die(timeUp) {
      if (ended || dying) return;
      breakCombo();
      if (reduced || timeUp) return finish();
      dying = 34;
      shake = 14;
      burst(RUN_X + RUN_W / 2, y - RUN_H / 2, 26, C.bad, 5);
      burst(RUN_X + RUN_W / 2, y - RUN_H / 2, 14, C.ink, 3);
      EN.Sound.redPen();
    }

    function finish() {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      teardown();
      EN.Arcade.over(host, cfg, score, [
        ["Distance", Math.floor(dist / 10) + "m"],
        ["Ink", collected],
        ["Best chain", "×" + Math.min(bestCombo, COMBO_CAP)],
        ["Near misses", nearMisses]
      ]);
    }

    function teardown() {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    }

    /* ── the loop ── */
    function loop() {
      if (ended) return;
      frame++;
      if (frame % 45 === 0) host.clock();
      if (host.isDead()) return die(true);

      if (dying > 0) {
        /* A beat of frozen world before the results, so a death registers as a thing that
           happened rather than as the screen being replaced. */
        if (--dying === 0) return finish();
        step(0);
        draw();
        raf = requestAnimationFrame(loop);
        return;
      }

      step(1);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function step(active) {
      if (active) {
        /* ── vertical ── */
        if (coyote > 0) coyote--;
        if (buffered > 0) { buffered--; tryJump(); }

        let g = GRAV;
        if (holding && holdFrames > 0 && vy < 0) { g = HOLD_G; holdFrames--; }
        if (diving && !grounded) g = DIVE_G;
        vy = Math.min(MAX_FALL, vy + g);

        const wasAir = !grounded;
        y += vy;
        if (y >= GROUND) {
          y = GROUND;
          if (wasAir && vy > 3) {
            sy = 0.7; sx = 1.28;              // squash on landing
            puff(RUN_X + RUN_W / 2, GROUND, Math.min(10, 3 + Math.floor(vy)));
            if (vy > 11) shake = Math.max(shake, reduced ? 0 : 3);
          }
          vy = 0;
          grounded = true;
          diving = false;
        } else if (grounded) {
          grounded = false;
          coyote = COYOTE;
        }

        /* ── pace ──
           Chapters step the speed; distance nudges it inside a chapter. Capped, because a
           runner stops being a game of skill once it outruns human reaction time. */
        /* Capped at 8.4 rather than 9.8. The visible track is 442px, so the cap decides how
           much warning the last chapter gives: 8.4 leaves 53 frames of it, and 9.8 left 45. */
        const want = 5.0 + (chapter - 1) * 0.62 + Math.min(1.0, dist / 12000);
        speed += (Math.min(8.4, want) - speed) * 0.02;
        dist += speed;
        if (frame % 6 === 0) addScore(1);
        if (Math.floor(dist / CHAPTER_EVERY) + 1 > chapter && chapter < CHAPTERS) nextChapter();

        /* ── obstacles ── */
        gapLeft -= speed;
        if (gapLeft <= 0) spawnPattern();
        dropCooldown -= speed * 0.35;
        if (dropCooldown <= 0) spawnLine();

        const rh = ducking && grounded ? DUCK_H : RUN_H;
        const rTop = y - rh, rBot = y, rL = RUN_X, rR = RUN_X + RUN_W;

        obstacles.forEach(o => {
          o.x -= speed;
          if (o.bobFrom !== undefined) {
            o.phase += o.bobSpeed;
            o.y = o.bobFrom + (Math.sin(o.phase) * 0.5 + 0.5) * (o.bobTo - o.bobFrom);
          }
          if (o.dead) return;
          const overlapX = rR > o.x && rL < o.x + o.w;
          if (overlapX) {
            if (rBot > o.y && rTop < o.y + o.h) { hit(o); return; }
            /* Not touching: remember how close it came, for the near-miss bonus. */
            const gap = rBot <= o.y ? o.y - rBot : rTop - (o.y + o.h);
            if (gap >= 0 && gap < o.minGap) o.minGap = gap;
          }
          if (!o.done && o.x + o.w < rL) {
            o.done = true;
            if (o.minGap < NEAR_PX) {
              nearMisses++;
              addScore(NEAR_POINTS);
              float(rL + 8, o.y - 12, "+" + NEAR_POINTS, C.info);
              burst(rL, (o.y + o.h / 2), 5, C.info, 1.8);
              EN.Sound.tap();
            }
          }
        });
        obstacles = obstacles.filter(o => !o.dead && o.x + o.w > -30);

        /* ── drops ── */
        const cx = RUN_X + RUN_W / 2, cy = y - rh / 2;
        drops.forEach(d => {
          d.x -= speed;
          if (d.taken) return;
          const dx = d.x - cx, dy = d.y - cy;
          if (dx * dx + dy * dy < (d.r + 17) * (d.r + 17)) takeDrop(d);
        });
        drops = drops.filter(d => !d.taken && d.x > -20);

        /* A chain has to be kept alive, or it is just a total. */
        if (comboTimer > 0 && --comboTimer === 0) breakCombo();

        /* The nib. Rare, and never in a place that needs a dive to reach. */
        if (!shield && frame % 240 === 0 && Math.random() < 0.5) {
          drops.push({ x: W + 40, y: GROUND - 60 - Math.random() * 40, r: 10, nib: true, taken: false });
        }

        if (invuln > 0) invuln--;
        if (!reduced) {
          trail.push({ x: RUN_X, y, h: rh });
          if (trail.length > 9) trail.shift();
        }
      }

      /* Decoration advances even during the death beat, so the ink keeps flying. */
      sx += (1 - sx) * 0.18;
      sy += (1 - sy) * 0.18;
      if (shake > 0) shake *= 0.86;
      if (banner > 0) banner--;
      bgMarks.forEach(m => {
        m.x -= speed * m.d;
        if (m.x + m.w < 0) { m.x = W + Math.random() * 60; m.y = 44 + Math.random() * (GROUND - 80); }
      });
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--; });
      parts = parts.filter(p => p.life > 0);
      floats.forEach(f => { f.y -= 0.9; f.life--; });
      floats = floats.filter(f => f.life > 0);
    }

    /* ── drawing ── */
    function draw() {
      ctx.save();
      if (shake > 0.4) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }
      ctx.clearRect(-20, -20, W + 40, H + 40);

      /* Ruled page. The ruling gets denser and more inked as the chapters pass, which is
         the only progress indicator the player does not have to read. */
      const rules = 7 + chapter;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55 + chapter * 0.05;
      for (let i = 1; i < rules; i++) {
        const ly = (GROUND / rules) * i + 8;
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      /* Faint marks scrolling behind at a fraction of the speed. Parallax is most of what
         makes a flat canvas read as a place rather than a strip. */
      ctx.fillStyle = C.faint;
      ctx.globalAlpha = 0.16;
      bgMarks.forEach(m => ctx.fillRect(m.x, m.y, m.w, 2));
      ctx.globalAlpha = 1;

      /* The margin rule. */
      ctx.strokeStyle = C.bad;
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(52, H); ctx.stroke();
      ctx.globalAlpha = 1;

      /* Speed lines once it is genuinely quick. */
      if (!reduced && speed > 6.4) {
        ctx.strokeStyle = C.faint;
        ctx.globalAlpha = Math.min(0.4, (speed - 6.4) * 0.3);
        for (let i = 0; i < 5; i++) {
          const ly = 30 + ((frame * (5 + i) * 2.2) % (GROUND - 20));
          ctx.beginPath(); ctx.moveTo(W - 40 - i * 22, ly); ctx.lineTo(W - 96 - i * 22, ly); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      /* Ground. */
      ctx.fillStyle = C.ink;
      ctx.fillRect(0, GROUND, W, 3);

      obstacles.forEach(drawObstacle);
      drops.forEach(drawDrop);

      /* Trail, then the runner over it. */
      if (!reduced) {
        trail.forEach((t, i) => {
          ctx.globalAlpha = (i / trail.length) * 0.18;
          drawNib(t.x, t.y, t.h, 1, 1, true);
        });
        ctx.globalAlpha = 1;
      }
      const rh = ducking && grounded ? DUCK_H : RUN_H;
      if (!(invuln > 0 && Math.floor(frame / 4) % 2)) {
        drawNib(RUN_X, y, rh, sx, sy, false);
      }

      parts.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.colour;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      });
      ctx.globalAlpha = 1;

      drawHud();
      ctx.restore();
    }

    /* A pen nib with legs, rather than a rectangle. It costs a dozen lines and it is the
       difference between "a block is jumping" and "something is running". */
    function drawNib(x, ny, h, scaleX, scaleY, ghost) {
      const w = RUN_W * scaleX, hh = h * scaleY;
      ctx.save();
      ctx.translate(x + RUN_W / 2, ny);
      ctx.scale(1, 1);
      const top = -hh, bot = 0;
      ctx.fillStyle = ghost ? C.accent : (shield ? C.good : C.accent);
      ctx.beginPath();
      ctx.moveTo(-w / 2, top + hh * 0.12);
      ctx.lineTo(w / 2, top + hh * 0.46);
      ctx.lineTo(w / 2, top + hh * 0.62);
      ctx.lineTo(-w / 2, bot - hh * 0.06);
      ctx.closePath();
      ctx.fill();
      if (!ghost) {
        /* The slit and the breather hole — the two marks that make a nib a nib. */
        ctx.strokeStyle = C.bg;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.06, top + hh * 0.44);
        ctx.lineTo(w * 0.4, top + hh * 0.53);
        ctx.stroke();
        ctx.fillStyle = C.bg;
        ctx.beginPath(); ctx.arc(-w * 0.12, top + hh * 0.42, Math.max(1.4, w * 0.09), 0, 6.283); ctx.fill();

        /* Legs: two strokes alternating while grounded, tucked in the air. */
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 3;
        const swing = grounded ? Math.sin(frame * 0.42) * 6 : -3;
        ctx.beginPath();
        ctx.moveTo(-w * 0.18, bot - 2); ctx.lineTo(-w * 0.18 + swing, bot + 8);
        ctx.moveTo(w * 0.1, bot - 2); ctx.lineTo(w * 0.1 - swing, bot + 8);
        ctx.stroke();

        if (shield) {
          ctx.strokeStyle = C.good;
          ctx.globalAlpha = 0.75;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, top + hh / 2, Math.max(w, hh) * 0.78, 0, 6.283);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
    }

    function drawObstacle(o) {
      if (o.kind === "marginalia") {
        /* A handwritten squiggle hanging into the margin. */
        ctx.strokeStyle = C.info;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= o.w; i += 4) {
          const yy = o.y + o.h * 0.5 + Math.sin((i / o.w) * 7 + o.born * 0.1) * o.h * 0.34;
          if (i === 0) ctx.moveTo(o.x + i, yy); else ctx.lineTo(o.x + i, yy);
        }
        ctx.stroke();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = C.info;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.globalAlpha = 1;
        return;
      }
      if (o.kind === "strike") {
        ctx.strokeStyle = C.bad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h); ctx.lineTo(o.x + o.w, o.y);
        ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.stroke();
        return;
      }
      /* A footnote: a little block of ruled text with a superscript marker. */
      ctx.fillStyle = C.warn;
      ctx.globalAlpha = 0.22;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.warn;
      ctx.lineWidth = 2;
      for (let ly = o.y + 5; ly < o.y + o.h - 2; ly += 7) {
        ctx.beginPath(); ctx.moveTo(o.x + 3, ly); ctx.lineTo(o.x + o.w - 3, ly); ctx.stroke();
      }
      ctx.fillStyle = C.warn;
      ctx.beginPath(); ctx.arc(o.x + o.w - 3, o.y - 3, 2.6, 0, 6.283); ctx.fill();
    }

    function drawDrop(d) {
      if (d.nib) {
        ctx.fillStyle = C.good;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(frame * 0.05);
        ctx.beginPath();
        ctx.moveTo(0, -d.r); ctx.lineTo(d.r * 0.7, 0); ctx.lineTo(0, d.r); ctx.lineTo(-d.r * 0.7, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        return;
      }
      /* An ink drop: a circle with a tail, bobbing a little so it reads as a pickup. */
      const bob = reduced ? 0 : Math.sin(frame * 0.1 + d.x * 0.05) * 2;
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.arc(d.x, d.y + bob, d.r, 0, 6.283);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(d.x - d.r * 0.55, d.y + bob - d.r * 0.7);
      ctx.lineTo(d.x, d.y + bob - d.r * 2.1);
      ctx.lineTo(d.x + d.r * 0.55, d.y + bob - d.r * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    function drawHud() {
      ctx.font = "700 15px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "top";

      ctx.fillStyle = C.faint;
      ctx.fillText(CHAPTER_NAMES[chapter - 1], 62, 10);

      if (combo > 1) {
        const mult = Math.min(combo, COMBO_CAP);
        ctx.textAlign = "right";
        ctx.fillStyle = mult >= COMBO_CAP ? C.good : C.accent;
        ctx.font = "800 20px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("×" + mult, W - 14, 10);
        /* The chain timer, so a player can see it running out rather than guess. */
        ctx.fillStyle = C.line;
        ctx.fillRect(W - 74, 34, 60, 4);
        ctx.fillStyle = C.accent;
        ctx.fillRect(W - 74, 34, 60 * (comboTimer / COMBO_WINDOW), 4);
        ctx.textAlign = "left";
      }

      if (shield) {
        ctx.fillStyle = C.good;
        ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("◆ nib", 62, 32);
      }

      floats.forEach(f => {
        ctx.globalAlpha = Math.min(1, f.life / 18);
        ctx.fillStyle = f.colour;
        ctx.font = "800 15px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(f.text, f.x, f.y);
      });
      ctx.globalAlpha = 1;

      if (banner > 0) {
        const t = banner / 96;
        ctx.globalAlpha = reduced ? 1 : Math.min(1, t * 2.4);
        ctx.textAlign = "center";
        ctx.fillStyle = C.ink;
        ctx.font = "800 24px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(bannerText, W / 2, GROUND / 2 - 22);
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      }

      if (dying > 0) {
        ctx.globalAlpha = 0.8;
        ctx.textAlign = "center";
        ctx.fillStyle = C.bad;
        ctx.font = "800 26px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Struck out", W / 2, GROUND / 2 - 10);
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      }
    }

    EN.UI.onLeave(() => {
      ended = true;
      cancelAnimationFrame(raf);
      teardown();
    });

    live = () => ({
      y, vy, grounded, ducking, diving, chapter, speed, score, dist,
      combo, bestCombo, collected, nearMisses, shield, invuln, ended, dying, lastHit,
      obstacles: obstacles.map(o => ({ kind: o.kind, pattern: o.pattern,
                                       x: o.x, y: o.y, w: o.w, h: o.h })),
      drops: drops.length, parts: parts.length, floats: floats.length,
      runnerTop: y - (ducking && grounded ? DUCK_H : RUN_H)
    });

    host.clock();
    host.setScore(0);
    loop();
  }

  return {
    start,
    /* Test seam. Null between runs. */
    state: () => (live ? live() : null),
    geometry: { W, H, GROUND, RUN_X, RUN_W, RUN_H, DUCK_H, DUCK_BAR_BOTTOM,
                GRAV, JUMP_V, HOLD_G, HOLD_MAX, MAX_FALL, AIR_TAP, AIR_HOLD,
                NEAR_PX, COMBO_CAP, CHAPTERS, SPEED_MIN: 5.0, SPEED_MAX: 8.4,
                patterns: PATTERNS.map(p => ({ id: p.id, from: p.from,
                                               solve: p.solve, recover: p.recover })) },
    /* Build a pattern at a given speed, so the suite can check that the jump it asks for
       is actually wide enough to cross it — at the slowest speed AND the fastest. */
    buildAt: (id, sp) => {
      const p = PATTERNS.find(x => x.id === id);
      return p ? p.build(sp) : null;
    }
  };
})();
