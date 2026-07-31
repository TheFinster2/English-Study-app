/* THE ECONOMY — the rules that stop the app being farmable, and the ones that stop it
   punishing honest play. Both directions, because every fix in one direction so far has
   broken the other.
   ============================================================================
   The rush floor is the case in point. It exists so that tapping through a run without
   reading pays nothing. Calibrated by eye it grew until it exceeded the clock: 99% of
   Rapid Fire questions had a floor above their time share, so the entire mode paid zero to
   everybody. A gate nobody can pass is not a gate, it is a broken mode — so this suite
   asserts BOTH that the floor exists and that it is reachable.
   ============================================================================ */
"use strict";
const { loadData, dataFiles, allQuestions } = require("../lib/measure");
const { harness } = require("../lib/browser");

/* What each timed mode gives a student per item, from js/screens/play.js's dispatch. */
const MODES = [
  { id: "rapid", totalTime: 120, count: 24 },
  { id: "drill", totalTime: 0, count: 15 },
  { id: "survival", totalTime: 0, count: 40 }
];
/* Boss clocks, from BOSSES in js/games/boss.js. */
const BOSSES = [
  { id: "party", mod: "common", perQ: 26, cards: 1 },
  { id: "double", mod: "moduleA", perQ: 34, cards: 2 },
  { id: "critic", mod: "moduleB", perQ: 30, cards: 1 },
  { id: "examiner", mod: null, perQ: 28, cards: 1 }
];

module.exports = {
  name: "economy",
  needsBrowser: true,
  about: "the rush floor is both real and reachable; nothing pays for nothing",

  async run(t, { ROOT }) {
    const { EN: DATA } = loadData(ROOT, dataFiles(ROOT));
    const qs = allQuestions(DATA);
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");

      /* ── the floor is reachable in every mode ────────────────
         Computed with the app's own UI.rushFloor, so this cannot drift from the shipped
         numbers the way a re-implementation in the test would. */
      const report = await page.evaluate(({ modes, bosses }) => {
        const U = EN.U, UI = EN.UI;
        const all = EN.Bank.all();
        const split = q => ({ read: [q.stem || "", q.q].join(" "), scan: q.choices.join(" ") });
        const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
        const out = { modes: [], bosses: [], scales: [] };

        modes.forEach(m => {
          const per = m.totalTime ? m.totalTime / m.count : 0;
          const floors = all.map(q => UI.rushFloor(split(q), per) / 1000);
          out.modes.push({
            id: m.id, per,
            median: median(floors),
            worst: Math.max.apply(null, floors),
            /* Unreachable = no answer at any moment in the item's share of the clock
               would score, which is the shape of the bug this suite exists for. */
            unreachable: per ? floors.filter(f => f >= per).length / floors.length : 0
          });
        });

        bosses.forEach(b => {
          const pool = b.mod ? all.filter(q => q.mod === b.mod) : all;
          const rounds = [];
          for (let i = 0; i + b.cards <= pool.length; i += b.cards) {
            const set = pool.slice(i, i + b.cards);
            rounds.push(UI.rushFloor({
              read: set.map(q => [q.stem || "", q.q].join(" ")).join(" "),
              scan: set.map(q => q.choices.join(" ")).join(" ")
            }, b.perQ) / 1000);
          }
          out.bosses.push({
            id: b.id, clock: b.perQ, median: median(rounds),
            worst: Math.max.apply(null, rounds),
            unreachable: rounds.filter(f => f >= b.perQ).length / rounds.length,
            /* The window is what the student actually has: clock minus floor. */
            window: b.perQ - median(rounds)
          });
        });

        /* Difficulty must not close the window either — Nightmare shrinks the clock
           toward the reading estimate, and the floor has to stay clear of it. */
        ["standard", "hard", "nightmare"].forEach(d => {
          EN.State.data.settings.difficulty = d;
          const b = bosses[0];
          const pool = all.filter(q => q.mod === b.mod);
          const wins = pool.map(q => {
            const s = split(q);
            const clock = UI.timeBudget(b.perQ, s.read + " " + s.scan);
            return clock - UI.rushFloor(s, clock) / 1000;
          });
          out.scales.push({ difficulty: d, medianWindow: median(wins), worst: Math.min.apply(null, wins) });
        });
        EN.State.data.settings.difficulty = "standard";

        return out;
      }, { modes: MODES, bosses: BOSSES });

      report.modes.forEach(m => {
        t.eq(m.unreachable, 0, "mode " + m.id + ": share of questions where XP is unreachable");
        t.atMost(m.median, m.per ? m.per * 0.5 : 9,
                 "mode " + m.id + ": median floor against its " + (m.per ? m.per.toFixed(1) + "s share" : "9s cap"));
        t.note("  " + m.id.padEnd(9) + (m.per ? m.per.toFixed(1) + "s/item" : "untimed").padEnd(11) +
               "floor median " + m.median.toFixed(1) + "s, worst " + m.worst.toFixed(1) + "s");
      });

      report.bosses.forEach(b => {
        t.eq(b.unreachable, 0, "boss " + b.id + ": share of rounds where XP is unreachable");
        /* Ten seconds of usable window is the difference between a gate and a trap. */
        t.atLeast(b.window, 10, "boss " + b.id + ": median seconds in which an answer scores");
        t.note("  " + b.id.padEnd(9) + b.clock + "s clock, floor " + b.median.toFixed(1) +
               "s → " + b.window.toFixed(1) + "s window");
      });

      report.scales.forEach(s => {
        t.atLeast(s.medianWindow, 8, s.difficulty + ": median scoring window");
        t.atLeast(s.worst, 1, s.difficulty + ": worst-case scoring window is not negative");
        t.note("  " + s.difficulty.padEnd(11) + "window median " + s.medianWindow.toFixed(1) +
               "s, worst " + s.worst.toFixed(1) + "s");
      });

      /* ── a floor still exists ────────────────────────────────
         The other direction. If the floor collapsed to nothing, tapping would pay. */
      const floorReal = await page.evaluate(() => {
        const q = EN.Bank.all()[0];
        return EN.UI.rushFloor({ read: [q.stem || "", q.q].join(" "), scan: q.choices.join(" ") }, 0);
      });
      t.atLeast(floorReal, 1200, "an unread question still has a floor of at least a second");

      /* ── the arcade and the Draft Desk pay nothing ───────────
         Structural, not a promise: assert the absence of the call, then assert the
         behaviour. Either alone would be weaker. */
      const src = await page.evaluate(async () => {
        const files = ["js/core/arcade.js", "js/games/arcade-lettercrush.js", "js/games/arcade-runner.js",
                       "js/games/arcade-wordtower.js", "js/screens/draft.js"];
        const out = {};
        for (const f of files) {
          const text = await (await fetch(f)).text();
          /* Strip comments first. Every one of these files DOCUMENTS that it never calls
             UI.award(), so a naive substring search matches the promise instead of the
             code and the check passes for exactly the wrong reason — it would have gone on
             "failing" after somebody added a real call. */
          const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
          out[f] = /\bUI\s*\.\s*award\s*\(/.test(code);
        }
        return out;
      });
      Object.keys(src).forEach(f => {
        t.eq(src[f], false, f + " does not call UI.award()");
      });

      /* Play the arcade for real and check the ledger is untouched. */
      const arcade = await page.evaluate(() => {
        const before = { xp: EN.State.data.xp, coins: EN.State.data.coins, level: EN.State.data.level,
                         lifetime: EN.State.data.lifetimeXp,
                         achievements: Object.keys(EN.State.data.achievements).length };
        EN.Arcade.tick("lettercrush", 5);
        EN.Arcade.score("lettercrush", 9999);
        const after = { xp: EN.State.data.xp, coins: EN.State.data.coins, level: EN.State.data.level,
                        lifetime: EN.State.data.lifetimeXp,
                        achievements: Object.keys(EN.State.data.achievements).length };
        return { before, after, high: EN.Arcade.best("lettercrush") };
      });
      t.eq(arcade.after, arcade.before, "a 9,999-point arcade score moves no XP, Marks, level or achievement");
      t.eq(arcade.high, 9999, "the arcade does record a high score");

      /* Write a long draft and check the same. */
      const draft = await page.evaluate(() => {
        const before = { xp: EN.State.data.xp, coins: EN.State.data.coins, lifetime: EN.State.data.lifetimeXp };
        EN.State.saveDraft({ id: "t1", title: "T", body: "word ".repeat(4000), prompt: "",
                             clock: "off", created: 1, updated: 1, elapsed: 3600 });
        const after = { xp: EN.State.data.xp, coins: EN.State.data.coins, lifetime: EN.State.data.lifetimeXp };
        return { before, after, words: EN.State.data.stats.draftWords };
      });
      t.eq(draft.after, draft.before, "a 4,000-word draft and an hour at the desk pay nothing");
      t.atLeast(draft.words, 4000, "the draft's words are still counted for the collection achievement");

      /* ── levelling stays as tuned ────────────────────────────
         The brief was explicit that these numbers are deliberate and should not soften. */
      const curve = await page.evaluate(() => ({
        needed1: EN.State.xpNeeded(1), needed30: EN.State.xpNeeded(30), needed60: EN.State.xpNeeded(60),
        max: EN.State.MAX_LEVEL,
        total: Array.from({ length: 60 }, (_, i) => EN.State.xpNeeded(i + 1)).reduce((a, b) => a + b, 0)
      }));
      t.eq(curve.max, 60, "sixty levels");
      t.eq(curve.needed1, 130, "level 1 costs 130 XP");
      t.eq(curve.needed30, Math.round(130 * Math.pow(30, 1.5)), "the n^1.5 curve is unchanged at level 30");
      /* Derived from the formula rather than a remembered figure: 130 × Σ n^1.5 for
         n = 1..60. Asserting a number somebody guessed is how a test starts lying. */
      const expectTotal = Array.from({ length: 60 }, (_, i) => Math.round(130 * Math.pow(i + 1, 1.5)))
        .reduce((a, b) => a + b, 0);
      t.eq(curve.total, expectTotal, "cumulative XP to level 60 matches 130 × n^1.5");
      t.atLeast(curve.total, 1.4e6, "total XP to level 60 is still deliberately harsh");
      t.note("  level 60 needs " + curve.needed60.toLocaleString() + " XP; " +
             (curve.total / 1e6).toFixed(2) + "M cumulative");

      /* Marks pay out at 60% — the number the brief said to copy. */
      const payout = await page.evaluate(() => {
        EN.State.data.coins = 0;
        const got = EN.UI.award({ xp: 100, coins: 100, accuracy: 1 });
        return { coins: got.coins, xp: got.xp };
      });
      t.atMost(payout.coins, 60, "Marks pay out at no more than 60% of the nominal figure");
      t.atLeast(payout.coins, 40, "Marks do pay out");

      t.eq(page.errors.slice(0, 4), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
