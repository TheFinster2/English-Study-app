/* ARCADE — the three games play, and none of them pays.
   ============================================================================
   The arcade is the one part of the app that must be fun for its own sake, because it is
   structurally forbidden from paying anything: an endless runner worth 1 XP a second beats
   studying, so the rule is no XP, no Marks, no achievements, only a high score.

   `economy` asserts the absence of the UI.award() call. This suite asserts the behaviour
   from the other end — play Letter Crush for real, score tens of thousands, and check the
   ledger has not moved — and then checks the mechanics that make it worth playing, because
   a match-3 with a broken cascade is not a game.

   Letter Crush gets the detail because it is the one with state worth breaking: 64 tiles
   that must all still exist after arbitrary cascades, gravity that must leave no holes, and
   a board that must never be dead.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

/* Finds a legal move from the DOM alone, the way a player reading the board would. Kept
   out of the page's own model on purpose: a test that asked the game which moves exist
   would pass even if the board it DREW disagreed with its model. */
const FIND_MOVE = `(() => {
  const N = 8;
  const at = {};
  document.querySelectorAll(".crush-cell").forEach(n =>
    at[n.style.getPropertyValue("--r") + ":" + n.style.getPropertyValue("--c")] = n);
  const L = n => (n ? n.querySelector(".crush-face").textContent : null);
  const g = [];
  for (let r = 0; r < N; r++) { g.push([]); for (let c = 0; c < N; c++) g[r].push(L(at[r + ":" + c])); }
  const SP = new Set(["↔", "↕", "✹", "✦"]);
  const runs = x => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N - 2; c++)
      if (x[r][c] && x[r][c] === x[r][c + 1] && x[r][c] === x[r][c + 2]) return true;
    for (let c = 0; c < N; c++) for (let r = 0; r < N - 2; r++)
      if (x[r][c] && x[r][c] === x[r + 1][c] && x[r][c] === x[r + 2][c]) return true;
    return false;
  };
  /* Prefer two adjacent specials — that is the combo path, and the most breakable. */
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0,1],[1,0]]) {
    const r2 = r + dr, c2 = c + dc;
    if (r2 < N && c2 < N && SP.has(g[r][c]) && SP.has(g[r2][c2])) return { mv: [r, c, r2, c2], combo: true };
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0,1],[1,0]]) {
    const r2 = r + dr, c2 = c + dc;
    if (r2 >= N || c2 >= N) continue;
    const x = g.map(y => y.slice());
    const t = x[r][c]; x[r][c] = x[r2][c2]; x[r2][c2] = t;
    if (runs(x)) return { mv: [r, c, r2, c2], combo: false };
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (SP.has(g[r][c])) {
    if (c + 1 < N) return { mv: [r, c, r, c + 1], combo: false };
    if (r + 1 < N) return { mv: [r, c, r + 1, c], combo: false };
  }
  return null;
})()`;

module.exports = {
  name: "arcade",
  needsBrowser: true,
  about: "the arcade plays, and pays nothing",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");

      /* Buy time the way a student does, and record the ledger before playing. */
      const before = await page.evaluate(() => {
        EN.State.data.coins = 9000;
        EN.State.save();
        EN.Arcade.buy("lettercrush", "t30");
        return { xp: EN.State.data.xp, lifetime: EN.State.data.lifetimeXp,
                 level: EN.State.data.level, coins: EN.State.data.coins,
                 achievements: Object.keys(EN.State.data.achievements).length,
                 mastery: EN.State.overallAccuracy(), answered: EN.State.data.stats.answered };
      });

      await h.goto(page, "/arcade/lettercrush", 900);
      const init = await page.evaluate(() => ({
        tiles: document.querySelectorAll(".crush-cell").length,
        positioned: Array.from(document.querySelectorAll(".crush-cell")).every(n =>
          n.style.getPropertyValue("--r") !== "" && n.style.getPropertyValue("--c") !== ""),
        slots: document.querySelectorAll(".crush-slot").length,
        labelled: Array.from(document.querySelectorAll(".crush-cell")).every(n => n.getAttribute("aria-label"))
      }));
      t.eq(init.tiles, 64, "the board opens with a full 8×8 of tiles");
      t.ok(init.positioned, "every tile has a grid position");
      t.atLeast(init.slots, 4, "a word order is on screen from the first frame");
      t.ok(init.labelled, "every tile has an accessible name");

      /* A board that opens with no legal move is the worst first impression there is. */
      const opening = await page.evaluate(FIND_MOVE);
      t.ok(!!opening, "the opening board has a legal move");

      /* ── play it ── */
      let moves = 0, combos = 0, scoredMoves = 0, broke = null;
      let sawSpecial = false, maxScore = 0, words = 0;
      for (let step = 0; step < 45 && !broke; step++) {
        const found = await page.evaluate(FIND_MOVE);
        if (!found) { broke = "no legal move on the board after " + moves + " moves"; break; }
        if (found.combo) combos++;
        const scoreBefore = await page.evaluate(() =>
          Number((document.querySelector(".gmeta .chip") || {}).textContent) || 0);

        for (const [r, c] of [[found.mv[0], found.mv[1]], [found.mv[2], found.mv[3]]]) {
          await page.evaluate(([rr, cc]) => {
            const n = Array.from(document.querySelectorAll(".crush-cell")).find(x =>
              x.style.getPropertyValue("--r") === String(rr) &&
              x.style.getPropertyValue("--c") === String(cc));
            if (n) n.click();
          }, [r, c]);
          await page.waitForTimeout(80);
        }
        await page.waitForTimeout(900);
        moves++;

        const st = await page.evaluate(() => ({
          tiles: document.querySelectorAll(".crush-cell").length,
          onBoard: new Set(Array.from(document.querySelectorAll(".crush-cell")).map(n =>
            n.style.getPropertyValue("--r") + ":" + n.style.getPropertyValue("--c"))).size,
          specials: document.querySelectorAll(".crush-cell.sp").length,
          score: Number((document.querySelector(".gmeta .chip") || {}).textContent) || 0,
          words: Number(((document.querySelector(".crush-order .chip") || {}).textContent || "")
                   .replace(/\D/g, "")) || 0
        }));
        if (st.tiles !== 64) broke = "tile count went to " + st.tiles + " after " + moves + " moves";
        else if (st.onBoard !== 64) broke = "two tiles share a square after " + moves + " moves";
        if (st.specials) sawSpecial = true;
        if (st.score > scoreBefore) scoredMoves++;
        maxScore = Math.max(maxScore, st.score);
        words = Math.max(words, st.words);
      }

      t.ok(!broke, "the board stayed intact through " + moves + " moves" + (broke ? " — " + broke : ""));
      t.atLeast(moves, 20, "moves played");
      t.atLeast(scoredMoves / Math.max(1, moves), 0.8, "share of legal moves that scored");
      t.ok(sawSpecial, "specials appear during normal play");
      t.atLeast(maxScore, 1000, "score accumulates");
      t.atLeast(words, 1, "at least one word order was completed");
      t.note("  " + moves + " moves · " + scoredMoves + " scored · " + combos +
             " special-vs-special swaps · " + words + " words · score " + maxScore);

      /* ── and the ledger has not moved ──────────────────────────
         The whole point. Tens of thousands of points, and nothing the rest of the app
         trades in has changed. */
      const after = await page.evaluate(() => ({
        xp: EN.State.data.xp, lifetime: EN.State.data.lifetimeXp,
        level: EN.State.data.level, coins: EN.State.data.coins,
        achievements: Object.keys(EN.State.data.achievements).length,
        mastery: EN.State.overallAccuracy(), answered: EN.State.data.stats.answered
      }));
      t.eq(after, before, "a full game of Letter Crush moved no XP, level, Marks, achievement or statistic");
      /* And a high score IS written — the one thing the arcade is allowed to record. Taken
         from the public API rather than by running the clock down, which would take half an
         hour of ticket. */
      const high = await page.evaluate(() => {
        const was = EN.Arcade.best("lettercrush");
        EN.Arcade.score("lettercrush", was + 12345);
        return { was, now: EN.Arcade.best("lettercrush"),
                 xp: EN.State.data.xp, ach: Object.keys(EN.State.data.achievements).length };
      });
      t.eq(high.now, high.was + 12345, "a high score is recorded");
      t.eq({ xp: high.xp, ach: high.ach }, { xp: before.xp, ach: before.achievements },
           "recording a high score still moves no XP and no achievement");

      /* The board must fit a 360px phone; it is the widest fixed-grid thing in the app. */
      for (const width of [390, 360]) {
        await page.setViewportSize({ width, height: 844 });
        await page.waitForTimeout(320);
        const ov = await page.evaluate(() => {
          const doc = document.documentElement;
          const b = document.querySelector(".crush-board").getBoundingClientRect();
          return { doc: doc.scrollWidth - doc.clientWidth,
                   boardRight: Math.round(b.right), cw: doc.clientWidth,
                   square: Math.abs(b.width - b.height) < 2 };
        });
        t.atMost(ov.doc, 1, width + "px: no horizontal overflow while playing");
        t.atMost(ov.boardRight, ov.cw + 1, width + "px: the board fits the viewport");
        t.ok(ov.square, width + "px: the board is square");
      }

      /* The ticket is burned by the game loop, so backgrounding must not cost anything. */
      const clock = await page.evaluate(async () => {
        const a = EN.Arcade.remaining("lettercrush");
        document.dispatchEvent(new Event("visibilitychange"));
        await new Promise(r => setTimeout(r, 1200));
        return { before: a, after: EN.Arcade.remaining("lettercrush") };
      });
      t.ok(clock.after >= clock.before - 2,
           "the ticket does not drain while nothing is being played");

      t.eq(page.errors.slice(0, 4), [], "console and page errors while playing");
      await page.close();

      /* ── the other two start and pay nothing either ── */
      for (const id of ["marginrunner", "wordtower"]) {
        const p2 = await h.open("/home");
        const pre = await p2.evaluate(gid => {
          EN.State.data.coins = 9000; EN.State.save(); EN.Arcade.buy(gid, "t5");
          return { xp: EN.State.data.xp, ach: Object.keys(EN.State.data.achievements).length };
        }, id);
        await h.goto(p2, "/arcade/" + id, 900);
        const alive = await p2.evaluate(() => document.getElementById("view").childNodes.length > 0);
        t.ok(alive, id + ": starts and renders");
        await p2.waitForTimeout(1200);
        const post = await p2.evaluate(() => ({
          xp: EN.State.data.xp, ach: Object.keys(EN.State.data.achievements).length
        }));
        t.eq(post, pre, id + ": pays no XP and no achievement");
        t.eq(p2.errors.slice(0, 3), [], id + ": no errors");
        await p2.close();
      }
    } finally {
      await h.close();
    }
  }
};
