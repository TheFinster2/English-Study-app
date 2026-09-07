/* RUNNER — Margin Runner's rules are the ones it says it has.
   ============================================================================
   The game is a canvas, so there is nothing in the DOM to read. It exposes a read-only
   `state()` and its `geometry` constants for this suite; nothing in the game reads either.
   The first attempt at testing it went through the pixels instead, on the principle that
   what is DRAWN is what matters — and measured the word "Foolscap", because the chapter
   label, the ink drops and the floating scores all pass through the runner's column.

   What has to hold is the design, because it is a set of numbers that silently contradict
   each other the moment one of them moves:

     • a tap clears a footnote and CANNOT clear the 78px stack; a held jump can. That gap is
       the only reason the hold exists. The first tuning had a tap apex of 110px against a
       58px stack, so the tallest obstacle in the game was clearable by mashing.
     • a hanging bar has to catch a standing runner and miss a ducking one. That is a 24px
       window between the two hitbox heights, so it is specified from the bar's BOTTOM edge.
     • ink has to sit where the runner can actually reach it, or the risk/reward loop that
       the whole rewrite is built on is decoration.
     • the near-miss threshold has to be under the duck's clearance, or every duck in the
       game pays the bonus for free.

   And one input regression worth its own check: a document-level pointerup that released
   both controls meant letting go of Duck cancelled a jump that was still being held, so a
   held jump became a tap. A bot reacting correctly still could not clear the stack.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

/* Jump, optionally holding, and report how high the runner actually got. */
const APEX = `(async (holdMs, alsoTapDuckFirst) => {
  const S = () => EN.Games.marginrunner.state();
  const pads = { 0: document.querySelector('[data-act="jump"]'),
                 1: document.querySelector('[data-act="duck"]') };
  const down = (n, id) => n.dispatchEvent(new PointerEvent("pointerdown",
    { bubbles: true, cancelable: true, pointerId: id }));
  const up = id => document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: id }));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ground = S().y;
  /* Duck first, on the ground, so releasing it mid-jump exercises the pointer tracking.
     Pressing duck in the AIR is a dive and is meant to cancel the hold. */
  if (alsoTapDuckFirst) { down(pads[1], 2); await sleep(40); }
  down(pads[0], 1);
  if (alsoTapDuckFirst) { await sleep(40); up(2); }
  if (holdMs > 0) await sleep(holdMs);
  up(1);
  let top = ground;
  for (let i = 0; i < 60; i++) { top = Math.min(top, S().y); await sleep(16); }
  up(1); up(2);
  return Math.round(ground - top);
})`;

module.exports = {
  name: "runner",
  needsBrowser: true,
  about: "Margin Runner's jump, its obstacles and its rewards agree with each other",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");
      await page.waitForTimeout(500);
      const ledgerBefore = await page.evaluate(() => {
        EN.State.data.coins = 90000;
        EN.Arcade.buy("marginrunner", "t30");
        return { xp: EN.State.data.xp, lifetime: EN.State.data.lifetimeXp,
                 level: EN.State.data.level,
                 ach: Object.keys(EN.State.data.achievements).length };
      });

      const g = await page.evaluate(() => EN.Games.marginrunner.geometry);

      /* ── it opens ── */
      for (const w of [390, 360]) {
        await page.setViewportSize({ width: w, height: 844 });
        await h.goto(page, "/arcade/marginrunner", 900);
        const open = await page.evaluate(() => {
          const c = document.querySelector(".runner-canvas");
          return { canvas: !!c, w: c && c.width, hh: c && c.height,
                   labelled: !!(c && c.getAttribute("aria-label")),
                   pads: document.querySelectorAll(".run-btn").length,
                   tall: c ? Math.round(c.getBoundingClientRect().height) : 0,
                   ov: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        t.ok(open.canvas, w + "px — the canvas is there");
        t.eq(open.pads, 2, "  with a Jump and a Duck pad, which are real buttons");
        t.ok(open.labelled, "  and an accessible name, since a canvas has no content");
        t.eq(open.ov, 0, "  and no horizontal overflow");
        /* The old 2.67:1 canvas was a 140px strip on a phone. */
        t.atLeast(open.tall, 190, "  and a playfield worth playing in (" + open.tall + "px tall)");
      }

      /* ── the jump, measured, and the obstacles it has to clear ── */
      await page.setViewportSize({ width: 390, height: 844 });
      const apexOf = async (hold, duckFirst) => {
        await h.goto(page, "/arcade/marginrunner", 800);
        return page.evaluate(APEX + "(" + hold + "," + (duckFirst ? "true" : "false") + ")");
      };
      const tap = await apexOf(0, false);
      const held = await apexOf(320, false);
      t.note("  tap apex " + tap + "px · held apex " + held + "px");
      t.ok(held > tap + 25, "holding the jump goes meaningfully higher than tapping it (" +
                            tap + " → " + held + ")");

      const STACK = 78, FOOTNOTE_MAX = 40;
      t.ok(tap > FOOTNOTE_MAX, "a tap clears the tallest ordinary footnote (" + FOOTNOTE_MAX + "px)");
      t.ok(tap < STACK, "a tap does NOT clear the " + STACK + "px stack — this is why the hold exists");
      t.ok(held > STACK, "and a held jump does");

      /* ── the hanging bar's 24px window ── */
      const standTop = g.GROUND - g.RUN_H, duckTop = g.GROUND - g.DUCK_H;
      t.ok(standTop < g.DUCK_BAR_BOTTOM,
           "a standing runner is caught by a hanging bar, so ducking is required");
      t.ok(duckTop >= g.DUCK_BAR_BOTTOM,
           "and a ducking one clears it by " + (duckTop - g.DUCK_BAR_BOTTOM) + "px");
      t.ok(g.NEAR_PX < duckTop - g.DUCK_BAR_BOTTOM,
           "the near-miss threshold is under that clearance, so a duck does not pay it for free");

      /* ── ink has to be reachable ── */
      const reachHigh = g.GROUND - held - g.RUN_H / 2;
      t.ok(reachHigh <= g.GROUND - 122,
           "the highest ink arc is inside the runner's reach at the held apex");

      /* ── solvability: the jump a pattern asks for must outlast the crossing ──
         This is the assertion the "impossible to avoid" report turned into. A pattern is
         only fair if the jump it demands keeps the runner clear for the WHOLE time the
         obstacle is passing, not merely at first contact — and that has to hold at the
         slowest speed and the fastest, because the crossing takes fewer frames as the page
         speeds up while the jump takes exactly as many. Three patterns failed it:
           staples  — a 34px pair took ~20 frames to cross against a 15-frame tap window,
                      so it did not fit in a tap jump at ANY spacing
           gauntlet — fixed pixel offsets, fair at 5px/frame and lethal at 8.4
           strike   — cleared the top of its bob by one pixel */
      const solve = await page.evaluate(() => {
        const G = EN.Games.marginrunner.geometry;
        /* The same integration step() uses. */
        const rise = (t, hold) => {
          let v = G.JUMP_V, y = 0, left = hold ? G.HOLD_MAX : 0;
          for (let i = 0; i < t; i++) {
            let g = G.GRAV;
            if (left > 0 && v < 0) { g = G.HOLD_G; left--; }
            v = Math.min(G.MAX_FALL, v + g);
            y = Math.min(0, y + v);
          }
          return -y;
        };
        const out = [];
        G.patterns.forEach(p => {
          if (p.solve !== "tap" && p.solve !== "hold") return;
          const hold = p.solve === "hold";
          const air = hold ? G.AIR_HOLD : G.AIR_TAP;
          [G.SPEED_MIN, G.SPEED_MAX].forEach(sp => {
            /* The WORST build, not a sample of one. Footnote and staples randomise
               their dimensions, so a single build made this a coin flip: the same check
               reported 6 frames of slack on one run and 2.8 on the next, and a fairness
               test that passes three times in four is not a fairness test. */
            let built = null, hardest = -1;
            for (let k = 0; k < 40; k++) {
              const cand = EN.Games.marginrunner.buildAt(p.id, sp);
              const gr = cand.obs.filter(o => o.y + o.h >= G.GROUND - 4);
              if (!gr.length) { built = cand; break; }
              const span = Math.max.apply(null, gr.map(o => o.x + o.w)) -
                           Math.min.apply(null, gr.map(o => o.x));
              const tall = G.GROUND - Math.min.apply(null, gr.map(o => o.y));
              /* Wider costs frames of crossing; taller costs frames of window. Both make
                 the pattern harder, so the sum is a fair proxy for the worst case. */
              const cost = span + tall * 4;
              if (cost > hardest) { hardest = cost; built = cand; }
            }
            if (!built) return;
            const ground = built.obs.filter(o => o.y + o.h >= G.GROUND - 4)
              .sort((x, y) => x.x - y.x);
            if (!ground.length) return;
            /* Obstacles closer together than one airborne window are taken by the SAME
               jump; anything further apart is a separate jump, which is how `gauntlet` is
               built. Clustering matters: treating a pattern as one jump reported gauntlet
               as needing a 60-frame jump it was never meant to need. */
            const clusters = [[ground[0]]];
            for (let i = 1; i < ground.length; i++) {
              const prev = clusters[clusters.length - 1];
              const gapFrames = (ground[i].x - (prev[prev.length - 1].x + prev[prev.length - 1].w)) / sp;
              if (gapFrames < air) prev.push(ground[i]);
              else clusters.push([ground[i]]);
            }
            clusters.forEach((cl, ci) => {
              const need = G.GROUND - Math.min.apply(null, cl.map(o => o.y));
              const x1 = Math.min.apply(null, cl.map(o => o.x));
              const x2 = Math.max.apply(null, cl.map(o => o.x + o.w));
              let from = -1, to = -1;
              for (let t = 0; t <= 80; t++) {
                if (rise(t, hold) > need) { if (from < 0) from = t; to = t; }
              }
              const windowFrames = from < 0 ? 0 : to - from;
              const crossing = (x2 - x1 + G.RUN_W) / sp;
              out.push({ id: p.id + (clusters.length > 1 ? "#" + (ci + 1) : ""), sp,
                         kind: "jump", window: windowFrames,
                         crossing: Math.round(crossing * 10) / 10,
                         slack: Math.round((windowFrames - crossing) * 10) / 10 });
              /* And between clusters: land, see the next one, press. */
              if (ci > 0) {
                const prev = clusters[ci - 1];
                const gapFrames = (x1 - (prev[prev.length - 1].x + prev[prev.length - 1].w)) / sp;
                out.push({ id: p.id + "#" + ci + "→" + (ci + 1), sp, kind: "recover",
                           window: Math.round(gapFrames * 10) / 10, crossing: air,
                           slack: Math.round((gapFrames - air) * 10) / 10 });
              }
            });
          });
        });
        return out;
      });
      solve.forEach(r => {
        t.atLeast(r.slack, 3,
          r.id + " at " + r.sp + "px/frame is clearable for the whole crossing " +
          "(" + r.window + "-frame window vs " + r.crossing + "-frame crossing)");
      });
      t.note("  solvability: " + solve.map(r =>
        r.id + "@" + r.sp + " +" + r.slack + "f").join(" · "));

      /* ── the input regression ── */
      const whileDucking = await apexOf(320, true);
      t.ok(whileDucking > STACK,
           "releasing Duck does not cancel a jump that is still held (apex " +
           whileDucking + "px, needs > " + STACK + ")");

      /* ── it actually plays, and the rewards fire ── */
      await h.goto(page, "/arcade/marginrunner", 800);
      const played = await page.evaluate(async () => {
        const S = () => EN.Games.marginrunner.state();
        const pads = { 0: document.querySelector('[data-act="jump"]'),
                 1: document.querySelector('[data-act="duck"]') };
        const down = (n, id) => n.dispatchEvent(new PointerEvent("pointerdown",
          { bubbles: true, cancelable: true, pointerId: id }));
        const up = id => document.dispatchEvent(new PointerEvent("pointerup",
          { bubbles: true, pointerId: id }));
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const G = EN.Games.marginrunner.geometry;
        const peak = { chapter: 1, ink: 0, combo: 0, score: 0, drops: 0 };
        const t0 = performance.now();
        let holdUntil = 0, duckUntil = 0, ducking = false;
        while (performance.now() - t0 < 14000) {
          const s = S();
          if (!s || s.ended || s.dying) break;
          peak.chapter = Math.max(peak.chapter, s.chapter);
          peak.ink = Math.max(peak.ink, s.collected);
          peak.combo = Math.max(peak.combo, s.bestCombo);
          peak.score = Math.max(peak.score, s.score);
          peak.drops = Math.max(peak.drops, s.drops);
          const ahead = s.obstacles.filter(o => o.x + o.w > G.RUN_X - 4).sort((a, b) => a.x - b.x)[0];
          const now = performance.now();
          if (ahead) {
            const eta = (ahead.x - (G.RUN_X + G.RUN_W)) / Math.max(1, s.speed);
            const hanging = ahead.y + ahead.h < G.GROUND - 4;
            const tall = (G.GROUND - ahead.y) > 59;
            if (hanging && eta < 12) duckUntil = now + 260;
            else if (!hanging && eta < (tall ? 20 : 13) && s.grounded) {
              down(pads[0], 1);
              holdUntil = now + (tall ? 320 : 60);
            }
          }
          if (holdUntil && now > holdUntil) { up(1); holdUntil = 0; }
          if (duckUntil && !ducking) { down(pads[1], 2); ducking = true; }
          if (ducking && now > duckUntil) { up(2); ducking = false; duckUntil = 0; }
          await sleep(16);
        }
        up(1); up(2);
        return peak;
      });
      t.note("  a bot reached chapter " + played.chapter + ", score " + played.score +
             ", " + played.ink + " ink, chain ×" + played.combo);
      t.atLeast(played.ink, 3, "ink drops are placed where a player collects them");
      t.atLeast(played.combo, 2, "and chain, so the multiplier is reachable");
      t.atLeast(played.drops, 1, "there is always ink on screen to chase");
      t.atLeast(played.chapter, 2, "and a competent run reaches at least the second chapter");
      t.atLeast(played.score, 100, "  scoring more than survival alone would give");

      /* ── the ledger ── */
      const after = await page.evaluate(() => ({
        xp: EN.State.data.xp, lifetime: EN.State.data.lifetimeXp,
        level: EN.State.data.level, ach: Object.keys(EN.State.data.achievements).length
      }));
      t.eq(after.xp, ledgerBefore.xp, "playing it pays no XP");
      t.eq(after.lifetime, ledgerBefore.lifetime, "  nor lifetime XP");
      t.eq(after.level, ledgerBefore.level, "  nor a level");
      t.eq(after.ach, ledgerBefore.ach, "  nor an achievement");

      /* ── with motion off it still plays, and throws no ink about ── */
      const rp = await h.open("/home");
      await rp.emulateMedia({ reducedMotion: "reduce" });
      await rp.reload({ waitUntil: "load" });
      await rp.waitForTimeout(600);
      await rp.evaluate(() => { EN.State.data.coins = 90000; EN.Arcade.buy("marginrunner", "t30"); });
      await h.goto(rp, "/arcade/marginrunner", 900);
      const still = await rp.evaluate(async () => {
        const pads = { 0: document.querySelector('[data-act="jump"]'),
                 1: document.querySelector('[data-act="duck"]') };
        pads[0].dispatchEvent(new PointerEvent("pointerdown",
          { bubbles: true, cancelable: true, pointerId: 1 }));
        await new Promise(r => setTimeout(r, 400));
        document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
        await new Promise(r => setTimeout(r, 600));
        const s = EN.Games.marginrunner.state();
        return { running: !!s && !s.ended, parts: s ? s.parts : -1, score: s ? s.score : -1 };
      });
      t.ok(still.running, "with motion off the game still runs");
      t.eq(still.parts, 0, "  and spawns no particles at all");
      t.atLeast(still.score, 1, "  and still scores");
      t.eq(rp.errors.slice(0, 3), [], "console and page errors, motion off");
      await rp.close();

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
