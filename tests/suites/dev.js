/* DEV — the testing menu, and the two promises it makes.
   ============================================================================
   Reaching level 60 honestly is about 1.42 million XP, and half the app is gated behind
   levels, Marks, a filled Vault, a mistake list or a week of history. So there is a screen
   that puts each of those states one tap away.

   A menu of buttons that quietly do nothing is worse than no menu, so this suite presses
   every one of them and reads the save rather than the screen. Two of them had already
   lied when it was written: "9 of every power-up" called grantPowerup, which ACCUMULATES,
   so on top of the two a new save starts with it produced ten of two of them; and the
   probe could not tell whether "Everything due" worked at all, because a fresh save has no
   Leitner state and every card is already due — it has to be checked after mastering them.

   The two promises:

     • It is not reachable by accident. Nothing in the navigation links it, and Settings
       only opens it after five deliberate taps on the version number. Not a secret —
       anything shipped to a browser can be found — but not stumble-upon-able either.

     • It stamps the save. The economy of this app is built on numbers being earned, so a
       level or an achievement that came from here has to stay distinguishable from one that
       did not, on this screen and in Settings.
   ============================================================================ */
"use strict";
const { harness, ROUTES } = require("../lib/browser");

/* label → a probe that returns the thing the button claims to change. Pressed in order;
   each expectation is checked against the value before it, so "did it move" is the test
   rather than a hard-coded figure. */
const ACTIONS = [
  ["Lv 60",                    "() => EN.State.data.level",                                      60],
  ["Lv 5",                     "() => EN.State.data.level",                                       5],
  ["+50,000",                  "() => EN.State.data.coins",                                  "up"],
  ["Zero",                     "() => EN.State.data.coins",                                     0],
  ["Every theme",              "() => EN.State.data.owned.themes.length",                    "up"],
  ["Every avatar",             "() => EN.State.data.owned.avatars.length",                   "up"],
  ["9 of every power-up",      "() => Object.values(EN.State.data.inventory).join(',')",  "9,9,9,9,9,9,9"],
  ["All bosses beaten",        "() => Object.keys(EN.State.data.bossesBeaten).length",           5],
  ["Every achievement",        "() => Object.keys(EN.State.data.achievements).length",       "up"],
  ["Lock it all back",         "() => Object.keys(EN.State.data.bossesBeaten).length",           0],
  ["30 min each",              "() => EN.Arcade.remaining('lettercrush')",                   1800],
  ["No time",                  "() => EN.Arcade.remaining('lettercrush')",                      0],
  ["Master everything",        "() => EN.State.dueCards().length",                              0],
  ["Everything due",           "() => EN.State.dueCards().length",                           "up"],
  ["Make 5 leeches",           "() => EN.State.leeches().length",                               5],
  ["Forget it all",            "() => Object.keys(EN.State.data.srs).length",                   0],
  ["Seed a lopsided profile",  "() => Object.keys(EN.State.data.topics).length",             "up"],
  ["Seed 12 mistakes",         "() => EN.State.data.mistakes.length",                          12],
  ["Clear answer history",     "() => EN.State.data.mistakes.length",                           0],
  ["30-day streak",            "() => EN.State.data.streak.count",                             30]
];

module.exports = {
  name: "dev",
  needsBrowser: true,
  about: "the dev menu does what its buttons say, stamps the save, and is not linked",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/dev");
      await page.waitForTimeout(800);

      /* ── it opens, at both widths ── */
      for (const w of [390, 360]) {
        await page.setViewportSize({ width: w, height: 844 });
        await h.goto(page, "/dev", 800);
        const open = await page.evaluate(() => ({
          heading: (document.querySelector("#view h1") || {}).textContent || "",
          sections: document.querySelectorAll("#view h2").length,
          chips: document.querySelectorAll("#view .chip-btn").length,
          ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
        }));
        t.ok(/Dev menu/i.test(open.heading), w + "px — the dev menu renders");
        t.atLeast(open.sections, 7, "  with its sections");
        t.atLeast(open.chips, 40, "  and its actions");
        t.eq(open.ov, 0, "  and no horizontal overflow");
      }

      /* ── nothing links it ── */
      const hidden = await page.evaluate(() => {
        const nav = document.querySelector("#nav, .navbar, nav");
        const navText = nav ? nav.textContent : "";
        const links = Array.from(document.querySelectorAll("a[href]"))
          .map(a => a.getAttribute("href")).filter(x => /dev/i.test(x));
        return { inNav: /dev/i.test(navText), links };
      });
      t.ok(!hidden.inNav, "the navigation does not mention it");
      t.eq(hidden.links, [], "and nothing links to it");

      /* ── every button does what it says ── */
      await page.setViewportSize({ width: 390, height: 844 });
      await h.goto(page, "/dev", 800);
      for (const [label, probeSrc, expect] of ACTIONS) {
        const before = await page.evaluate("(" + probeSrc + ")()");
        const found = await page.evaluate(l => {
          const b = Array.from(document.querySelectorAll("#view .chip-btn"))
            .find(x => x.textContent.trim() === l);
          if (!b) return false;
          b.click();
          return true;
        }, label);
        t.ok(found, "“" + label + "” is on the screen");
        if (!found) continue;
        await page.waitForTimeout(300);
        const after = await page.evaluate("(" + probeSrc + ")()");
        if (expect === "up") {
          t.ok(after > before,
               "  and moves it up (" + before + " → " + after + ")");
        } else {
          t.eq(after, expect, "  and sets it to " + JSON.stringify(expect));
        }
      }

      /* ── it stamps, and persists ── */
      const stamped = await page.evaluate(() => {
        const raw = JSON.parse(localStorage.getItem("closereading.save.v1"));
        return { memory: EN.State.data.dev, disk: raw.dev,
                 warned: !!document.querySelector("#view .notice-bad") };
      });
      t.ok(stamped.memory && stamped.memory.touched > 0, "the save is stamped as modified");
      t.atLeast(stamped.memory.actions, ACTIONS.length - 2, "  counting the actions taken");
      t.ok(stamped.disk && stamped.disk.touched > 0, "  and the stamp is on disk, not just in memory");
      t.ok(stamped.warned, "  and the screen says so");

      await h.goto(page, "/settings", 800);
      const inSettings = await page.evaluate(() => {
        const n = document.querySelector("#view .notice-bad");
        return n ? n.textContent.replace(/\s+/g, " ") : null;
      });
      t.ok(!!inSettings, "Settings says so too");
      t.ok(inSettings && /dev tools/i.test(inSettings), "  naming the dev tools as the cause");
      t.ok(inSettings && /not evidence/i.test(inSettings),
           "  and that the numbers in it prove nothing");

      /* ── the gesture ── */
      const taps = await page.evaluate(async n => {
        location.hash = "#/settings";
        await new Promise(r => setTimeout(r, 400));
        const row = Array.from(document.querySelectorAll("#view .kv"))
          .find(x => /Version/.test(x.textContent));
        if (!row) return "no version row";
        for (let i = 0; i < n; i++) { row.click(); await new Promise(r => setTimeout(r, 50)); }
        await new Promise(r => setTimeout(r, 300));
        return location.hash;
      }, 4);
      t.ok(!/dev/.test(taps), "four taps on the version does not open it (" + taps + ")");

      const five = await page.evaluate(async () => {
        location.hash = "#/settings";
        await new Promise(r => setTimeout(r, 400));
        const row = Array.from(document.querySelectorAll("#view .kv"))
          .find(x => /Version/.test(x.textContent));
        for (let i = 0; i < 5; i++) { row.click(); await new Promise(r => setTimeout(r, 50)); }
        await new Promise(r => setTimeout(r, 300));
        return location.hash;
      });
      t.ok(/dev/.test(five), "five taps opens it (" + five + ")");

      /* ── the snapshot lives under its own key, so a wipe cannot take it ── */
      const snap = await page.evaluate(async () => {
        location.hash = "#/dev";
        await new Promise(r => setTimeout(r, 500));
        EN.State.data.coins = 4242;
        EN.State.flush();
        Array.from(document.querySelectorAll("#view button"))
          .find(b => /Take a snapshot/i.test(b.textContent)).click();
        await new Promise(r => setTimeout(r, 400));
        const stored = localStorage.getItem("closereading.devsnapshot");
        /* Wipe the save the way the danger button does, and see whether it survives. */
        EN.State.reset();
        return { stored: !!stored,
                 coinsInSnapshot: stored ? JSON.parse(stored).coins : null,
                 survivedWipe: !!localStorage.getItem("closereading.devsnapshot") };
      });
      t.ok(snap.stored, "a snapshot is stored");
      t.eq(snap.coinsInSnapshot, 4242, "  holding the save as it was");
      t.ok(snap.survivedWipe, "  under its own key, so wiping the save does not take it");

      /* ── the jump chips point at routes that exist ── */
      const jumps = await page.evaluate(async () => {
        location.hash = "#/dev";
        await new Promise(r => setTimeout(r, 600));
        const heads = Array.from(document.querySelectorAll("#view h2"));
        const jump = heads.find(x => /Jump to/i.test(x.textContent));
        if (!jump) return [];
        return Array.from(jump.nextElementSibling.querySelectorAll(".chip-btn"))
          .map(b => b.textContent.trim());
      });
      t.atLeast(jumps.length, 20, "the jump list covers the app");
      const known = new Set(ROUTES);
      const unlisted = jumps.filter(r => !known.has(r) && !/^\/(boss|texts|shop|achievements)$/.test(r));
      t.eq(unlisted, [], "and every route it offers is one the smoke sweep also walks");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
