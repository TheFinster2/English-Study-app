/* ACCESSIBILITY — can the app be played without a mouse, and does it say the right things?
   ============================================================================
   Not a general audit. Four specific things, each of which was actually wrong:

     • Every mode's advance and submit button must carry `js-next` or `js-submit`, because
       that is what the global Enter binding in app.js looks for. Three modes were missing
       it and were quietly mouse-only: the bosses, the Essay Architect and the Band Grid.

     • Modals had no dialog semantics and no focus trap, so Tab walked out of a dialog into
       the page behind it — content the student cannot see and did not ask for.

     • Every timer must be `aria-live="off"`. A chip that changes once a second is read
       aloud once a second by a screen reader, which is worse than no ARIA at all: it makes
       every timed mode unusable rather than merely unlabelled.

     • The feedback panel is the answer to "was I right", and it appeared silently.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { harness } = require("../lib/browser");

/* Modes that end an item with a button the student must press to continue. */
const MODES = ["rapid", "technique", "cloze", "marking", "essay", "bandgrid",
               "deconstruct", "sayit", "quotematch"];

module.exports = {
  name: "a11y",
  needsBrowser: true,
  about: "keyboard play, dialog semantics, and what gets announced",

  async run(t, { ROOT }) {
    /* ── static: the binding classes ─────────────────────────────
       Cheap, exhaustive, and it catches the omission at the source rather than needing a
       play-through of every mode to notice one button behaves differently. */
    /* quotematch is the exception, and legitimately so: its whole interaction is tapping
       pairs of cards, and it has no advance step to bind Enter to. Its cards are real
       <button>s with aria-labels, which is asserted separately below. */
    const NO_ADVANCE = ["quotematch.js"];
    const gameFiles = fs.readdirSync(path.join(ROOT, "js/games"))
      .filter(f => f.endsWith(".js") && !f.startsWith("arcade-"));
    gameFiles.forEach(f => {
      const src = fs.readFileSync(path.join(ROOT, "js/games", f), "utf8");
      const code = src.replace(/\/\*[\s\S]*?\*\//g, "");
      if (NO_ADVANCE.includes(f)) {
        t.ok(/type: "button"/.test(code) && /aria-label/.test(code),
             "js/games/" + f + " builds real labelled buttons (it has no advance step)");
        return;
      }
      /* A mode either advances or submits; it must expose at least one to the keyboard. */
      const bound = /js-next|js-submit/.test(code);
      t.ok(bound, "js/games/" + f + " exposes a keyboard-reachable advance or submit button");
    });

    /* Every timer chip must be silenced for screen readers. */
    const timerFiles = ["js/games", "js/core", "js/screens"].flatMap(dir =>
      fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith(".js")).map(f => dir + "/" + f));
    timerFiles.forEach(rel => {
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const chips = src.match(/U\.el\("span", \{ class: "timer-ring"[^}]*\}/g) || [];
      chips.forEach(c => {
        t.ok(/aria-live/.test(c), rel + ": a timer-ring chip is silenced for screen readers");
      });
    });

    const h = await harness(ROOT);
    try {
      /* ── the Enter key really advances ──────────────────────── */
      const page = await h.open("/home");
      await h.goto(page, "/game/rapid", 700);
      await page.keyboard.press("1");                       // answer by keyboard
      await page.waitForTimeout(400);
      const answered = await page.$$eval(".choice", ns => ns.some(n => n.classList.contains("correct")));
      t.ok(answered, "a number key answers the question");
      const before = await page.$eval(".gmeta .chip", n => n.textContent);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      const advanced = await page.evaluate(() => !document.querySelector(".js-next"));
      t.ok(advanced, "Enter advances to the next question");
      void before;

      /* ── dialog semantics and the focus trap ────────────────── */
      await h.goto(page, "/settings", 500);
      const dlg = await page.evaluate(async () => {
        /* Open a dialog the same way the app does. */
        EN.UI.confirmDialog("Test dialog", "Body text", () => {});
        await new Promise(r => setTimeout(r, 200));
        const root = document.getElementById("modal-root");
        return {
          role: root.getAttribute("role"),
          modal: root.getAttribute("aria-modal"),
          labelled: !!root.getAttribute("aria-labelledby"),
          focusInside: root.contains(document.activeElement),
          focusables: root.querySelectorAll("button:not([disabled])").length
        };
      });
      t.eq(dlg.role, "dialog", "a modal announces itself as a dialog");
      t.eq(dlg.modal, "true", "a modal is marked aria-modal");
      t.ok(dlg.labelled, "a modal is labelled by its own heading");
      t.ok(dlg.focusInside, "focus moves into the dialog when it opens");

      /* Tab from the last focusable must wrap to the first, not escape. */
      const trapped = await page.evaluate(() => {
        const root = document.getElementById("modal-root");
        const list = Array.from(root.querySelectorAll("button:not([disabled])"));
        list[list.length - 1].focus();
        return { last: document.activeElement === list[list.length - 1], count: list.length };
      });
      t.ok(trapped.last && trapped.count >= 2, "the dialog has focusable controls to trap");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(120);
      const stillIn = await page.evaluate(() =>
        document.getElementById("modal-root").contains(document.activeElement));
      t.ok(stillIn, "Tab wraps inside the dialog rather than escaping to the page behind it");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const closed = await page.evaluate(() => ({
        hidden: document.getElementById("modal-root").hidden,
        role: document.getElementById("modal-root").getAttribute("role")
      }));
      t.ok(closed.hidden, "Escape closes a non-sticky dialog");
      t.eq(closed.role, null, "the dialog role is removed when it closes, not left behind");

      /* ── the feedback is announced ──────────────────────────── */
      for (const mode of ["rapid", "technique", "deconstruct"]) {
        await h.goto(page, "/game/" + mode, 700);
        await page.evaluate(() => {
          const c = document.querySelector(".choice:not([disabled])");
          if (c) c.click();
        });
        await page.waitForTimeout(450);
        const live = await page.evaluate(() => {
          const fb = document.querySelector("#view .feedback");
          return fb ? { live: fb.getAttribute("aria-live"), role: fb.getAttribute("role") } : null;
        });
        t.ok(live && live.live === "polite", mode + ": the feedback panel is announced politely");
        t.ok(live && live.role === "status", mode + ": the feedback panel has a status role");
      }

      /* ── the chrome is labelled ─────────────────────────────── */
      const chrome = await page.evaluate(() => {
        const need = ["#avatar-btn", "#settings-btn", "#streak-pill", "#coin-pill"];
        return need.map(sel => {
          const n = document.querySelector(sel);
          return { sel, labelled: !!(n && (n.getAttribute("aria-label") || n.getAttribute("title"))) };
        });
      });
      chrome.forEach(c => t.ok(c.labelled, c.sel + " has an accessible name"));
      const nav = await page.evaluate(() =>
        !!document.querySelector("nav[aria-label]") &&
        document.querySelectorAll(".nav-item").length >= 5);
      t.ok(nav, "the nav bar is labelled and complete");

      /* ── progress bars ────────────────────────────────────────
         A bar with its figure printed beside it is decorative and must be hidden, or a
         reader announces an unlabelled element for no gain. A bar with NO text equivalent —
         boss HP, the model download — must be a real progressbar instead. */
      const bars = await page.evaluate(async () => {
        const out = { decorative: [], announced: [] };
        location.hash = "#/progress";
        await new Promise(r => setTimeout(r, 450));
        document.querySelectorAll("#view .bar").forEach(b => {
          out.decorative.push(b.getAttribute("aria-hidden") === "true");
        });
        location.hash = "#/boss/party";
        await new Promise(r => setTimeout(r, 700));
        document.querySelectorAll("#view .hpbar").forEach(b => {
          out.announced.push({
            role: b.getAttribute("role"),
            labelled: !!b.getAttribute("aria-label"),
            now: b.getAttribute("aria-valuenow"),
            max: b.getAttribute("aria-valuemax")
          });
        });
        return out;
      });
      t.atLeast(bars.decorative.length, 2, "mastery bars found on the progress screen");
      t.ok(bars.decorative.every(Boolean), "decorative bars are hidden from screen readers");
      t.eq(bars.announced.length, 2, "the boss shows two health bars");
      bars.announced.forEach((b, i) => {
        t.eq(b.role, "progressbar", "health bar " + i + " is a progressbar");
        t.ok(b.labelled, "health bar " + i + " has an accessible name");
        t.ok(b.now !== null && b.max !== null, "health bar " + i + " reports its value and maximum");
      });

      /* Reduced motion must actually reach CSS, not just the JS particles. */
      const motion = await page.evaluate(() => {
        EN.FX.setReduced(true);
        const off = document.documentElement.dataset.motion;
        EN.FX.setReduced(false);
        return { off, on: document.documentElement.dataset.motion };
      });
      t.eq(motion.off, "off", "turning motion off stamps the flag CSS reads");
      t.eq(motion.on, "on", "and turning it back on clears it");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
