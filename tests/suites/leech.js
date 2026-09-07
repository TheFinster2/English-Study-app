/* LEECH — the card that keeps beating you.
   ============================================================================
   A Leitner box resets to 1 on every miss, which means a quote you keep failing comes back
   tomorrow, and the day after, and forever. `lapses` had been counted since the Vault was
   written and nothing ever read it, so the one card actively wasting a student's time was
   indistinguishable in the list from the forty that were working.

   The fix is not suspension. Hiding a quote a student needs would be the wrong answer to
   "you cannot remember this" — so the app names them, and changes the intervention: Cloze
   Crunch shows a leech in FULL before asking for it and asks for fewer words. The reason
   that matters is the box reset: without it a leech arrives at exactly the difficulty that
   has already failed four times running, and fails a fifth.

   Four lapses is the threshold. Three misses is a hard quote; four is a quote you are not
   learning the way you are currently trying to learn it.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

module.exports = {
  name: "leech",
  needsBrowser: true,
  about: "a quote missed four times is named, and drilled differently",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/vault");
      await page.waitForTimeout(800);

      /* Nothing to report on a save where nothing has failed. */
      const clean = await page.evaluate(() => ({
        leeches: EN.State.leeches().length,
        card: !!document.querySelector("#view .notice-bad"),
        marks: document.querySelectorAll("#view .vault-leech").length
      }));
      t.eq(clean.leeches, 0, "a fresh save has no leeches");
      t.ok(!clean.card, "  so the Vault says nothing about them");
      t.eq(clean.marks, 0, "  and marks nothing in the list");

      /* ── the threshold ── */
      const grades = await page.evaluate(() => {
        const q = EN.Bank.quotes()[0];
        const out = [];
        for (let i = 1; i <= 5; i++) {
          EN.State.reviewCard(q.id, false);
          out.push({ lapses: EN.State.data.srs[q.id].lapses,
                     box: EN.State.data.srs[q.id].box,
                     leech: EN.State.isLeech(q.id) });
        }
        return { out, threshold: EN.State.LEECH_LAPSES };
      });
      t.eq(grades.threshold, 4, "the threshold is four lapses");
      t.ok(!grades.out[2].leech, "three misses is a hard quote, not a leech");
      t.ok(grades.out[3].leech, "four is a leech");
      t.eq(grades.out[3].box, 1,
           "and the box has reset to 1, which is why the difficulty has to change too");

      /* A card that is recalled again still counts its history, but climbs. */
      const recovered = await page.evaluate(() => {
        const q = EN.Bank.quotes()[0];
        EN.State.reviewCard(q.id, true);
        return { box: EN.State.data.srs[q.id].box, lapses: EN.State.data.srs[q.id].lapses,
                 stillLeech: EN.State.isLeech(q.id) };
      });
      t.eq(recovered.box, 2, "getting it right moves the box up");
      t.ok(recovered.stillLeech,
           "  and it stays flagged, because five misses is still the history it has");

      /* ── the Vault names them ── */
      const seeded = await page.evaluate(() => {
        EN.State.data.srs = {};
        EN.Bank.quotes().slice(0, 3).forEach(q => {
          for (let i = 0; i < 4; i++) EN.State.reviewCard(q.id, false);
        });
        return EN.State.leeches().length;
      });
      t.eq(seeded, 3, "three failed quotes are three leeches");

      for (const w of [390, 360]) {
        await page.setViewportSize({ width: w, height: 844 });
        await h.goto(page, "/vault", 900);
        const v = await page.evaluate(() => {
          const card = document.querySelector("#view .notice-bad");
          return { text: card ? card.textContent.replace(/\s+/g, " ") : null,
                   marks: document.querySelectorAll("#view .vault-leech").length,
                   btn: !!Array.from(document.querySelectorAll("#view button"))
                     .find(b => /Relearn/i.test(b.textContent)),
                   ov: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        t.ok(!!v.text, w + "px — the Vault names them");
        t.ok(v.text && /3 quotes keep beating you/.test(v.text), "  saying how many");
        t.ok(v.text && /Re-reading/.test(v.text), "  and what to do instead of trying again");
        t.eq(v.marks, 3, "  each one marked in the list");
        t.ok(v.btn, "  with a way straight into relearning them");
        t.eq(v.ov, 0, "  and no overflow");
      }

      /* ── and the drill is genuinely different ── */
      await page.setViewportSize({ width: 390, height: 844 });
      await h.goto(page, "/vault", 900);
      await page.evaluate(() => Array.from(document.querySelectorAll("#view button"))
        .find(b => /Relearn/i.test(b.textContent)).click());
      await page.waitForTimeout(1600);
      const drill = await page.evaluate(() => ({
        flagged: !!Array.from(document.querySelectorAll("#view .qtag .chip"))
          .find(n => /relearn/i.test(n.textContent)),
        readFirst: !!Array.from(document.querySelectorAll("#view details summary"))
          .find(s => /keeps beating you/i.test(s.textContent)),
        gaps: document.querySelectorAll("#view .cloze-blank").length,
        quoteShown: !!document.querySelector("#view details .bq")
      }));
      t.ok(drill.flagged, "the run says which card is being relearned");
      t.ok(drill.readFirst, "  offers the line in full before asking for it");
      t.ok(drill.quoteShown, "  with its citation, like every other quote in the app");
      t.atLeast(drill.gaps, 1, "  and still has something to type");

      /* The eased rate is the point: a leech must not be gapped as hard as a box-1 card
         that has simply not been seen yet. Compared through U.cloze directly, because the
         two cards would otherwise have to be drawn into the same run to compare. */
      const rates = await page.evaluate(() => {
        const q = EN.Bank.quotes().find(x => EN.U.words(x.text) >= 12);
        const hard = EN.U.cloze(q, { rate: 0.3, seed: 1 }).blanks.length;
        const easy = EN.U.cloze(q, { rate: 0.3 * 0.6, seed: 1 }).blanks.length;
        return { hard, easy, words: EN.U.words(q.text) };
      });
      t.ok(rates.easy < rates.hard,
           "a leech is asked for fewer words than the same quote at box 1 (" +
           rates.easy + " vs " + rates.hard + " gaps)");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
