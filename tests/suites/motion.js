/* MOTION — whose preference wins, and does the student ever find out.
   ============================================================================
   Reported twice, as "I can only see the Letter Crush animations for about a frame".

   The cause was not a duration. `prefers-reduced-motion: reduce` on the device was an
   absolute veto: it set the JS `reduced` flag, which collapses every arcade phase to 16ms
   and skips the effect layer entirely, AND flagged the document so the CSS keyframes were
   suppressed. Measured, a whole Letter Crush move resolved in 41ms against 1206ms with
   motion allowed — one frame of a tile popping, exactly as described.

   Two things made it undiagnosable from inside the app. The veto could not be lifted from
   Settings, and the Motion row was a boolean switch that rendered from `settings.motion`,
   which defaulted to true — so it read ON the entire time the app was running with every
   animation off.

   So `settings.motion` is three-valued now and this suite holds the three things that
   must stay true: auto follows the device, an explicit choice beats the device in BOTH
   directions, and Settings states the effective state rather than the stored one.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

const FIND_MOVE = require("fs").readFileSync(
  require("path").join(__dirname, "arcade.js"), "utf8")
  .match(/const FIND_MOVE = `([\s\S]*?)`;/)[1];

/* Honoured reduced motion resolves a whole cascade in well under this; the animated case
   measures around 1200ms, so the two are not close and the gap is what is asserted. */
const FROZEN_MS = 300;
/* And an animating one has to be clearly longer than a blink. */
const ANIMATED_MS = 500;

/** Buy arcade time, open Letter Crush, make one legal move, report how long it took. */
async function timeAMove(page, h) {
  await page.evaluate(() => {
    EN.State.data.coins = 9000;
    EN.Arcade.buy("lettercrush", "t30");
  });
  await h.goto(page, "/arcade/lettercrush", 1100);
  const mv = await page.evaluate(FIND_MOVE);
  if (!mv) return null;
  return page.evaluate(async ([a, b, c, d]) => {
    const board = document.querySelector(".crush-board");
    const at = (r, cc) => Array.from(board.querySelectorAll(".crush-cell")).find(n =>
      +n.style.getPropertyValue("--r") === r && +n.style.getPropertyValue("--c") === cc);
    at(a, b).click();
    at(c, d).click();
    /* Sample every frame and report how long the board is resolving, plus how long a
       tile is visibly popping — the phase the student said they could not see. */
    const t0 = performance.now();
    let busyLast = -1, popFirst = -1, popLast = -1;
    await new Promise(done => {
      (function tick() {
        const t = performance.now() - t0;
        if (board.hasAttribute("data-busy")) busyLast = t;
        if (board.querySelector(".crush-cell.popping")) {
          if (popFirst < 0) popFirst = t;
          popLast = t;
        }
        if (t < 2400) requestAnimationFrame(tick); else done();
      })();
    });
    return { busy: Math.round(Math.max(0, busyLast)),
             pop: Math.round(popFirst < 0 ? 0 : popLast - popFirst) };
  }, mv.mv);
}

module.exports = {
  name: "motion",
  needsBrowser: true,
  about: "a device asking for less motion is honoured, and can be overridden",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      /* ── 1. the setting resolves correctly against the device ── */
      const page = await h.open("/settings");
      await page.waitForTimeout(500);

      /* applyMotion is the single place the two inputs are combined, and it takes the
         device preference as an argument, so the matrix below is exhaustive rather than
         a sample reachable by reloading under emulated media. */
      const resolve = (setting, reduce) => page.evaluate(([s, r]) => {
        const out = EN.FX.applyMotion(s, r);
        return { off: out.off, overriding: out.overriding,
                 css: document.documentElement.dataset.motion };
      }, [setting, reduce]);

      const MATRIX = [
        ["auto", false, false, "auto on a normal device animates"],
        ["auto", true,  true,  "auto on a reduce-motion device does not"],
        ["on",   false, false, "'always on' animates"],
        ["on",   true,  false, "'always on' beats the device — the whole point of the fix"],
        ["off",  false, true,  "'off' does not animate"],
        ["off",  true,  true,  "'off' stays off on a reduce-motion device too"]
      ];
      for (const [setting, reduce, expectOff, label] of MATRIX) {
        const r = await resolve(setting, reduce);
        t.eq(r.off, expectOff, label);
        t.eq(r.css, expectOff ? "off" : "on", "  and the CSS flag agrees, so keyframes match the JS");
      }
      t.ok((await resolve("on", true)).overriding,
           "overriding the device is reported, so Settings can say so");

      /* ── 2. legacy saves migrate without changing what the student sees ── */
      const migrated = await page.evaluate(() => {
        const K = "closereading.save.v1";
        const out = {};
        [true, false, "auto", "on", "off", "nonsense"].forEach(v => {
          const raw = JSON.parse(localStorage.getItem(K));
          raw.settings.motion = v;
          localStorage.setItem(K, JSON.stringify(raw));
          out[String(v)] = EN.State.load().settings.motion;
        });
        return out;
      });
      /* true was the old DEFAULT, so it means "never chosen" and must become auto — not
         "on", which would switch animations on for someone who set Reduce Motion on
         purpose. And the new values must survive: the first version of this migration
         mapped true to auto on every load and threw away "always on" each reopen. */
      t.eq(migrated["true"], "auto", "a legacy motion:true becomes auto, not an opt-in");
      t.eq(migrated["false"], "off", "a legacy motion:false stays off");
      t.eq(migrated["on"], "on", "and the migration does not fire on a save it already converted");
      t.eq(migrated["off"], "off", "  in either direction");
      t.eq(migrated["nonsense"], "auto", "an unrecognised value falls back to auto");
      await page.close();

      /* ── 3. Settings reports the EFFECTIVE state, not the stored one ── */
      const sp = await h.open("/settings");
      await sp.emulateMedia({ reducedMotion: "reduce" });
      await sp.reload({ waitUntil: "load" });
      await sp.waitForTimeout(700);
      const rowText = () => sp.evaluate(() => {
        const row = Array.from(document.querySelectorAll("#view .srow"))
          .find(n => /Motion and particles/.test(n.textContent));
        return row ? row.textContent.replace(/\s+/g, " ") : null;
      });
      const shown = await rowText();
      t.ok(!!shown, "Settings has a motion row on a reduce-motion device");
      t.ok(/Currently OFF/.test(shown || ""),
           "and it says animations are OFF rather than showing a switch set to on");
      t.ok(/Reduce Motion/.test(shown || ""),
           "and names the device setting as the cause, which the app cannot change");
      t.ok(/Always on/.test(shown || ""), "and offers the override in the same place");

      const picked = await sp.evaluate(() => {
        Array.from(document.querySelectorAll("#view .chip-btn"))
          .find(b => b.textContent === "Always on").click();
        return null;
      });
      t.eq(picked, null, "the override is a control, not a note");
      await sp.waitForTimeout(500);
      const after = await sp.evaluate(() => ({
        setting: EN.State.data.settings.motion,
        reduced: EN.FX.isReduced(),
        css: document.documentElement.dataset.motion
      }));
      t.eq(after.setting, "on", "choosing it stores an explicit opt-in");
      t.eq(after.reduced, false, "and the app starts animating immediately");
      t.eq(after.css, "on", "  including the CSS keyframes");

      /* It has to survive a reload, which is where the first attempt failed. */
      await sp.reload({ waitUntil: "load" });
      await sp.waitForTimeout(700);
      const persisted = await sp.evaluate(() => ({
        setting: EN.State.data.settings.motion, reduced: EN.FX.isReduced()
      }));
      t.eq(persisted.setting, "on", "and survives a reload");
      t.eq(persisted.reduced, false, "  still animating");

      /* ── 4. the thing that was actually reported ── */
      const animated = await timeAMove(sp, h);
      t.ok(!!animated, "Letter Crush opens with a legal move on a reduce-motion device");
      t.atLeast(animated ? animated.busy : 0, ANIMATED_MS,
                "with 'always on', a move takes time to resolve (" +
                (animated ? animated.busy : 0) + "ms)");
      t.atLeast(animated ? animated.pop : 0, 150,
                "  and a tile is visibly popping for longer than a blink (" +
                (animated ? animated.pop : 0) + "ms)");
      await sp.close();

      /* And the honoured case still genuinely skips the work — this is an accessibility
         setting, not a slider, so "auto" on such a device must stay instant. */
      const rp = await h.open("/settings");
      await rp.emulateMedia({ reducedMotion: "reduce" });
      await rp.reload({ waitUntil: "load" });
      await rp.waitForTimeout(700);
      t.eq(await rp.evaluate(() => EN.State.data.settings.motion), "auto",
           "a fresh save on a reduce-motion device is on auto");
      const frozen = await timeAMove(rp, h);
      t.ok(frozen && frozen.busy < FROZEN_MS,
           "and auto still resolves instantly, honouring the device (" +
           (frozen ? frozen.busy : "?") + "ms)");
      t.eq(rp.errors.slice(0, 3), [], "console and page errors");
      await rp.close();
    } finally {
      await h.close();
    }
  }
};
