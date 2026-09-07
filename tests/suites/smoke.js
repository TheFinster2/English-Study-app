/* SMOKE — every route renders, at both phone widths, with nothing off screen.
   ============================================================================
   The two failures this catches have both actually happened in this app:

     • horizontal overflow. Grid items default to min-width:auto and refuse to shrink
       below their max-content width, so ONE long unbreakable string — a locus like
       "Devotions upon Emergent Occasions, Meditation XVII" — pushed the whole document
       74px past a 360px viewport. Nothing throws; the page just scrolls sideways.

     • a primary action under the floating nav bar. Enabled, reported on screen by any
       naive check, and untappable, because the nav is centred and covers the middle of
       the row. That one reads as the button being broken.

   360px is not decoration: it is the narrowest phone the app claims to support, and
   every overflow bug so far has been invisible at 390 and obvious at 360.
   ============================================================================ */
"use strict";
const { harness, ROUTES } = require("../lib/browser");

module.exports = {
  name: "smoke",
  needsBrowser: true,
  about: "every route renders at 390px and 360px with no overflow",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      for (const width of [390, 360]) {
        const page = await h.open("/home", { width });
        for (const route of ROUTES) {
          await h.goto(page, route);
          const r = await page.evaluate(() => {
            const doc = document.documentElement;
            const cw = doc.clientWidth;
            const wide = [];
            document.querySelectorAll("#view *").forEach(n => {
              const b = n.getBoundingClientRect();
              if (b.right > cw + 1.5 || b.left < -1.5) {
                wide.push(n.tagName.toLowerCase() + "." + String(n.className || "").slice(0, 28) +
                          " → " + Math.round(b.right));
              }
            });
            return {
              overflow: doc.scrollWidth - cw,
              wide: wide.slice(0, 3),
              empty: document.getElementById("view").childNodes.length === 0,
              /* A screen with no heading and no empty-state is almost always a half-render. */
              titled: !!document.querySelector("#view h1, #view .gtitle, #view .empty")
            };
          });
          t.eq(r.overflow <= 1, true, width + "px " + route + ": document is not wider than the viewport" +
               (r.overflow > 1 ? " (+" + r.overflow + "px: " + r.wide.join(", ") + ")" : ""));
          t.ok(!r.empty, width + "px " + route + ": rendered something");
          t.ok(r.titled, width + "px " + route + ": has a heading or an empty state");
        }
        t.eq(page.errors.slice(0, 4), [], width + "px: console and page errors across all routes");
        await page.close();
      }

      /* ── the nav-bar overlap ──────────────────────────────────
         Fill each interactive mode the way a student would, then ask whether the enabled
         primary action is on screen AND clear of the nav. */
      for (const width of [390, 360]) {
        const page = await h.open("/home", { width });
        const MODES = ["cloze", "marking", "essay", "sayit", "thesis", "rewrite", "bandgrid", "paper"];
        for (const mode of MODES) {
          await h.goto(page, "/game/" + mode, 620);
          /* SETUP uses in-page DOM clicks rather than Playwright's, deliberately.
             Playwright's actionability wait times out on these boards — the view has an
             entry animation and the sticky bar re-layouts as cells fill — and a setup step
             that silently gives up leaves the real assertion below checking nothing, which
             is worse than no test. The assertion itself still uses a real click, so
             "can this actually be pressed" is still honestly tested. */
          await page.evaluate(() => {
            const tap = sel => {
              for (let i = 0; i < 14; i++) {
                const el = document.querySelector(sel);
                if (!el) return;
                el.click();
              }
            };
            tap(".ea-card:not([disabled])");
            tap(".md-band:not(.chosen)");
            tap(".md-desc:not(.ticked)");
            /* One cell per row, so the grid is complete. */
            document.querySelectorAll(".bg-table tbody tr").forEach(tr => {
              const cell = tr.querySelector(".bg-cell:not(.picked)");
              if (cell && !tr.querySelector(".bg-cell.picked")) cell.click();
            });
            document.querySelectorAll("input.cloze-blank").forEach(i => {
              i.value = "word";
              i.dispatchEvent(new Event("input", { bubbles: true }));
            });
            const ta = document.querySelector("textarea");
            if (ta) {
              ta.value = "Orwell positions the reader to reconsider the claim, because the " +
                         "structure withholds the ground on which an objection would stand.";
              ta.dispatchEvent(new Event("input", { bubbles: true }));
            }
          });
          await page.waitForTimeout(300);

          const r = await page.evaluate(() => {
            const btn = document.querySelector(".js-submit:not([disabled]), .js-next:not([disabled])");
            if (!btn) return { none: true };
            const b = btn.getBoundingClientRect();
            const nav = document.querySelector(".navbar").getBoundingClientRect();
            return {
              label: btn.textContent.trim().slice(0, 22),
              onScreen: b.top >= 0 && b.bottom <= window.innerHeight,
              behindNav: b.top < nav.bottom && b.bottom > nav.top &&
                         b.left < nav.right && b.right > nav.left,
              top: Math.round(b.top), vh: window.innerHeight
            };
          });
          /* A mode that ends up with nothing to press means the fill above failed, which
             is a hole in this suite rather than a pass. Fail it. */
          t.ok(!r.none, width + "px " + mode + ": an action was reachable after filling the board");
          if (r.none) continue;
          t.ok(r.onScreen, width + "px " + mode + ": «" + r.label + "» is on screen" +
               (r.onScreen ? "" : " (y=" + r.top + " of " + r.vh + ")"));
          t.ok(!r.behindNav, width + "px " + mode + ": «" + r.label + "» is not under the nav bar");
          /* And it must genuinely be pressable — a real click, with Playwright's own
             actionability checks, which is the thing a student's thumb is doing. */
          let pressed = true;
          try { await page.click(".js-submit:not([disabled]), .js-next:not([disabled])", { timeout: 2500 }); }
          catch (e) { pressed = false; }
          t.ok(pressed, width + "px " + mode + ": «" + r.label + "» can actually be clicked");
        }
        await page.close();
      }
    } finally {
      await h.close();
    }
  }
};
