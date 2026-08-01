/* NEXTUP — the home screen's one recommendation.
   ============================================================================
   The home screen carries fourteen modes, four texts, five modules, a Vault count, a
   mistake list and a quest board, and answered none of "what should I do right now".
   It now answers it once, from a fixed ladder.

   Testing "a card appears" would be worthless. What has to hold is that the LADDER is
   ordered — each rung fires only when every rung above it is satisfied — and that the
   route it hands back goes somewhere real. A recommender that recommends an empty screen
   is worse than none, because the student follows it.

   Each case sets up the save the rung needs, on top of the previous one, and asserts the
   rung. Order is the assertion: the mistakes case is only meaningful because the due-cards
   case ran first and its setup silenced the Vault.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

/* [label, expected rung title fragment, expected route, save mutation] */
const LADDER = [
  ["a fresh save opens the Vault", "none seen yet", "/game/cloze", ""],

  ["a mistake backlog beats a quiet Vault", "Rehabilitate 9 mistakes", "/game/rehab", `
    EN.Bank.quotes().forEach(q => EN.State.data.srs[q.id] =
      { box:5, due:"2099-01-01", reps:9, lapses:0 });
    EN.State.data.mistakes = EN.Bank.all().slice(0,9).map(q => ({ id:q.id, misses:2 }));`],

  ["a weak module beats a clean slate", "Module B", "/game/drill/moduleB", `
    EN.State.data.mistakes = [];
    EN.DATA.modules.forEach(m => EN.State.data.modules[m.id] = { seen:40, correct:34 });
    EN.State.data.modules["moduleB"] = { seen:51, correct:14 };
    EN.Bank.activeTextIds().forEach(id => EN.State.data.texts[id] = { seen:40, correct:34 });`],

  ["an untouched text beats a strong one", "Start on W;t", "/game/drill/wit", `
    EN.DATA.modules.forEach(m => EN.State.data.modules[m.id] = { seen:40, correct:38 });
    EN.State.data.texts["wit"] = { seen:1, correct:1 };`],

  ["a mode never played is offered", "Try ", null, `
    EN.Bank.activeTextIds().forEach(id => EN.State.data.texts[id] = { seen:40, correct:36 });
    EN.State.data.modesPlayed = {};`],

  ["a weak text once everything is played", "Drill W;t", "/game/drill/wit", `
    EN.Screens.play.MODES.forEach(m => EN.State.data.modesPlayed[m.id] = 3);
    EN.State.data.texts["wit"] = { seen:30, correct:9 };`],

  ["the daily challenge when nothing lags", "Today's challenge", null, `
    EN.Bank.activeTextIds().forEach(id => EN.State.data.texts[id] = { seen:40, correct:36 });
    EN.State.daily().claimed = false;`],

  ["and it admits when nothing is behind", "Nothing is behind", "/draft", `
    EN.State.daily().claimed = true;`]
];

/* A rung below this many answers is a guess dressed as advice. */
const EVIDENCE_FLOOR = 10;

module.exports = {
  name: "nextup",
  needsBrowser: true,
  about: "the home screen's recommendation ladder is ordered, and its routes go somewhere",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");
      await page.waitForTimeout(400);

      for (const [label, fragment, route, setup] of LADDER) {
        const n = await page.evaluate(s => {
          if (s) new Function("EN", s)(EN);
          return EN.Screens.home.nextUp();
        }, setup);
        t.ok(n.title.indexOf(fragment) >= 0,
             label + (n.title.indexOf(fragment) >= 0 ? "" : " (got: " + n.title + ")"));
        if (route) t.eq(n.go, route, "  and sends them to " + route);
        t.ok(!!n.why && n.why.length > 40, "  with a reason, not just a verdict");
        t.ok(!!n.cta, "  and something to press");

        /* Followed immediately, in the save that produced it — Mistake Rehab renders an
           empty state once the backlog is gone, so checking these routes after the whole
           ladder had run would test the wrong screen. */
        await h.goto(page, n.go, 800);
        const st = await page.evaluate(() => ({
          chars: document.querySelector("#view").textContent.trim().length,
          ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
        }));
        t.atLeast(st.chars, 150, "  " + n.go + " renders a screen when followed");
        t.eq(st.ov, 0, "  with no overflow");
        await h.goto(page, "/home", 400);
      }

      /* Never advise on noise. Ten answers is the floor for calling a module weak, so a
         save with nine must not produce a module recommendation. */
      const onNine = await page.evaluate(f => {
        EN.State.data.mistakes = [];
        EN.DATA.modules.forEach(m => EN.State.data.modules[m.id] = { seen: f - 1, correct: 0 });
        EN.Bank.activeTextIds().forEach(id => EN.State.data.texts[id] = { seen: 40, correct: 36 });
        EN.Screens.play.MODES.forEach(m => EN.State.data.modesPlayed[m.id] = 3);
        return EN.Screens.home.nextUp();
      }, EVIDENCE_FLOOR);
      t.ok(onNine.go.indexOf("/game/drill/module") < 0,
           "a module with " + (EVIDENCE_FLOOR - 1) + " answers is not called weak (got: " + onNine.title + ")");

      /* And the card is on the home screen at both widths. */
      for (const w of [390, 360]) {
        await page.setViewportSize({ width: w, height: 844 });
        await h.goto(page, "/home", 600);
        const c = await page.evaluate(() => {
          const n = document.querySelector("#view .next-up");
          if (!n) return null;
          const b = n.querySelector("button");
          return { text: n.textContent.replace(/\s+/g, " "),
                   btn: b ? b.getBoundingClientRect().width : 0,
                   ov: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        t.ok(!!c, w + "px — the card is on the home screen");
        t.ok(c && /Do this next/.test(c.text), "  labelled as a recommendation");
        t.atLeast(c ? c.btn : 0, 200, "  with a full-width action");
        t.eq(c ? c.ov : -1, 0, "  and no overflow");
      }

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
