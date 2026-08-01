/* STORAGE — what happens when the save cannot be written.
   ============================================================================
   The worst failure in the app, and it used to be handled with a console.warn. Once
   localStorage refuses a write, every later write fails too: the student keeps playing,
   keeps earning, and loses all of it — and the one place the problem was reported is the
   one place they will never look.

   Two things this suite pinned down that guesswork had wrong:

     • A full disk does NOT break every write. Replacing the save key with a same-sized
       value succeeds even when storage is exhausted, because the old value is freed first.
       The failure is the save GROWING — which is exactly what happens when a draft is
       written, and the Draft Desk holds essay-length text. A first version of this test
       filled storage, bumped XP, saw the write succeed, and would have passed a completely
       broken app.

     • Filling with big chunks is not filling. A 256 KB write failing says nothing about
       whether a 2 KB save still fits, so the fill shrinks its chunk size until even a
       hundred-odd bytes are refused.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

module.exports = {
  name: "storage",
  needsBrowser: true,
  about: "a full disk is detected, announced, and recovered from",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");

      const healthy = await page.evaluate(() => ({
        failing: EN.State.storageFailing(),
        bytes: EN.State.saveSize()
      }));
      t.eq(healthy.failing, null, "a healthy save reports no storage failure");
      t.atLeast(healthy.bytes, 200, "the save reports a plausible size");
      t.note("  fresh save: " + Math.round(healthy.bytes / 1024) + " KB");

      /* ── fill the disk ── */
      const filled = await page.evaluate(() => {
        let n = 0, err = null;
        for (const size of [256 * 1024, 16 * 1024, 1024, 128]) {
          const chunk = "x".repeat(size);
          try { for (let i = 0; i < 4000; i++) localStorage.setItem("__fill" + (n++), chunk); }
          catch (e) { err = e.name; }
        }
        return { keys: n, err };
      });
      t.ok(!!filled.err, "the test could actually exhaust storage (" + filled.err + ")");

      /* ── grow the save, which is the case that fails ── */
      const after = await page.evaluate(() => {
        EN.State.data.xp += 100;
        EN.State.saveDraft({ id: "__big", title: "Essay", body: "word ".repeat(60000),
                             prompt: "", clock: "off", created: 1, updated: 1, elapsed: 0 });
        EN.State.flush();
        return {
          failing: EN.State.storageFailing(),
          toast: (document.querySelector("#toasts .toast") || {}).textContent || ""
        };
      });
      t.ok(!!after.failing, "a refused write is detected rather than swallowed");
      t.ok(/not being saved/i.test(after.toast),
           "the student is told, in words, that progress is not being saved");
      t.ok(/export/i.test(after.toast), "and told what to do about it");

      /* Only once — a toast on every debounced write would be its own disaster. */
      const repeat = await page.evaluate(() => {
        document.querySelectorAll("#toasts .toast").forEach(n => n.remove());
        for (let i = 0; i < 5; i++) { EN.State.data.xp += 1; EN.State.flush(); }
        return document.querySelectorAll("#toasts .toast").length;
      });
      t.eq(repeat, 0, "the warning is not repeated on every subsequent failed write");

      /* ── Settings says so, loudly ── */
      await h.goto(page, "/settings", 600);
      const shown = await page.evaluate(() => {
        const bad = document.querySelector("#view .notice-bad");
        return bad ? bad.textContent.replace(/\s+/g, " ") : null;
      });
      t.ok(!!shown, "Settings shows the failure in the loud style, not as a stat line");
      t.ok(shown && /drafts/i.test(shown), "and names drafts, the only part worth deleting");

      /* ── free the space and recover ── */
      const recovered = await page.evaluate(() => {
        Object.keys(localStorage).filter(k => k.startsWith("__fill"))
          .forEach(k => localStorage.removeItem(k));
        EN.State.deleteDraft("__big");
        EN.State.flush();
        const raw = localStorage.getItem("closereading.save.v1");
        return { failing: EN.State.storageFailing(),
                 xp: raw ? JSON.parse(raw).xp : null };
      });
      t.eq(recovered.failing, null, "the flag clears once a write succeeds again");
      t.atLeast(recovered.xp || 0, 100, "the progress earned during the outage is written once there is room");

      /* And Settings goes back to reporting a size rather than a warning. */
      await h.goto(page, "/settings", 600);
      const calm = await page.evaluate(() => ({
        bad: !!document.querySelector("#view .notice-bad"),
        size: Array.from(document.querySelectorAll("#view .kv"))
          .map(n => n.textContent).find(x => /Save size/.test(x)) || null
      }));
      t.ok(!calm.bad, "the warning goes away once storage is healthy");
      t.ok(!!calm.size, "and Settings reports the save size normally");
      t.note("  " + (calm.size || "").replace(/\s+/g, " "));

      /* ── the Draft Desk, which is where this actually bites ──
         Everywhere else a lost write costs XP, which is a number. Here it costs an essay,
         and this is also the screen most likely to CAUSE the failure, because a draft is
         the biggest thing the save ever grows by. Its chip used to say "saved" over text
         that only existed in the tab. */
      await h.goto(page, "/draft/new", 700);
      await page.fill("#view textarea.draft-area", "The poem withholds its subject until the volta.");
      await page.waitForTimeout(1400);
      const chipOf = () => page.evaluate(() => ({
        text: Array.from(document.querySelectorAll("#view .chip")).map(n => n.textContent)
          .find(x => /saved|NOT/i.test(x)) || null,
        bad: !!document.querySelector("#view .chip.bad"),
        notices: document.querySelectorAll("#view .notice-bad").length
      }));
      const calmDesk = await chipOf();
      t.eq(calmDesk.text, "saved", "with room to spare the desk reports a saved draft");
      t.eq(await page.evaluate(() =>
        (JSON.parse(localStorage.getItem("closereading.save.v1")).drafts || []).length), 1,
        "and the draft really is on disk");

      await page.evaluate(() => {
        let n = 0;
        for (const size of [256 * 1024, 16 * 1024, 1024, 128]) {
          const chunk = "x".repeat(size);
          try { for (let i = 0; i < 4000; i++) localStorage.setItem("__fill" + (n++), chunk); }
          catch (e) { /* expected */ }
        }
      });
      await page.fill("#view textarea.draft-area", "word ".repeat(40000));
      await page.waitForTimeout(1600);
      const fullDesk = await chipOf();
      t.eq(fullDesk.text, "NOT SAVED", "a refused write is never reported as a save");
      t.ok(fullDesk.bad, "and it is styled as a failure, not as a status");
      t.eq(fullDesk.notices, 1, "the desk explains it in place, once");
      t.ok(await page.evaluate(() => !!Array.from(document.querySelectorAll("#view .notice-bad button"))
        .find(b => /export/i.test(b.textContent))),
        "and offers Export, which is the one route out that needs no storage");

      /* Typing on must not stack a warning per keystroke. */
      await page.fill("#view textarea.draft-area", "word ".repeat(40001));
      await page.waitForTimeout(1400);
      t.eq((await chipOf()).notices, 1, "and does not stack a warning per keystroke");

      await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("__fill"))
        .forEach(k => localStorage.removeItem(k)));
      await page.fill("#view textarea.draft-area", "Short again.");
      await page.waitForTimeout(1400);
      t.eq((await chipOf()).text, "saved", "and goes back to saving once there is room");
      t.eq(await page.evaluate(() =>
        JSON.parse(localStorage.getItem("closereading.save.v1")).drafts[0].body), "Short again.",
        "with the text the student actually has on screen");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
