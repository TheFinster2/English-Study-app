/* GLOSSARY — the terms an explanation uses, offered where it uses them.
   ============================================================================
   Two in every five questions in the bank explain themselves with a technical term —
   "chiasmus reverses the terms across the pivot", "the register drops" — and a student who
   does not know the term learns nothing from the sentence written to teach them. The
   glossary was a screen away, and leaving a run to reach it means losing the run.

   The two things that must hold are coverage and restraint. Coverage, because a feature
   that fires on a handful of questions is not worth the code. Restraint, because the
   obvious implementation matches technique ALIASES as well as names, and the aliases
   include "so" and "because" — which appear in three quarters of the explanations in the
   bank and would put a wall of chips under every answer. That version was written, the
   measurement said 218 of 403 questions matched with "causal conjunction" hit 74 times,
   and it is why only canonical names of five characters or more are matched.

   And the panel must never navigate. Leaving a run to look at a definition is precisely
   the failure this replaces.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

module.exports = {
  name: "glossary",
  needsBrowser: true,
  about: "the terms an explanation uses are explained where it uses them",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");
      await page.waitForTimeout(400);

      /* ── coverage and restraint, measured over the whole bank ── */
      const cov = await page.evaluate(() => {
        const qs = EN.Bank.all();
        let hit = 0, chips = 0, max = 0;
        qs.forEach(q => {
          const ids = EN.UI.techniquesIn([q.q, q.why, q.choices[q.a]].join(" "));
          if (ids.length) { hit++; chips += ids.length; max = Math.max(max, ids.length); }
        });
        return { of: qs.length, hit, avg: chips / Math.max(1, hit), max };
      });
      t.atLeast(cov.hit / cov.of, 0.25, "at least a quarter of questions name a term (" +
                cov.hit + " of " + cov.of + ")");
      t.ok(cov.avg < 2.5, "and a panel gets a couple of chips, not a wall (avg " +
           cov.avg.toFixed(2) + ")");
      t.ok(cov.max <= 4, "capped at four (max " + cov.max + ")");
      t.note("  " + cov.hit + "/" + cov.of + " questions · " + cov.avg.toFixed(2) +
             " chips each · max " + cov.max);

      /* The alias trap, asserted directly rather than trusted to the comment above. */
      const trap = await page.evaluate(() => ({
        because: EN.UI.techniquesIn("This works because the sentence says so."),
        real: EN.UI.techniquesIn("Chiasmus reverses the terms across the pivot."),
        empty: EN.UI.techniquesIn("Nothing technical is going on in this sentence at all.")
      }));
      t.eq(trap.because, [], "a plain 'because … so' sentence matches nothing");
      t.eq(trap.real, ["chiasmus"], "a sentence naming chiasmus matches chiasmus");
      t.eq(trap.empty, [], "and an ordinary sentence matches nothing");

      /* ── it works in a real run, in the two modes that carry it ── */
      for (const [route, label] of [["/game/drill/all", "a drill"],
                                    ["/game/technique", "Name That Technique"]]) {
        await h.goto(page, route, 900);
        let chips = null;
        for (let i = 0; i < 30 && !chips; i++) {
          chips = await page.evaluate(() => {
            const row = document.querySelector("#view .feedback .gloss-row");
            return row ? Array.from(row.querySelectorAll(".chip-btn")).map(b => b.textContent) : null;
          });
          if (chips && chips.length) break;
          chips = null;
          await page.evaluate(() => {
            const n = document.querySelector("#view .js-next:not([disabled])");
            if (n) return n.click();
            const c = document.querySelector("#view .choice:not([disabled]), #view .chip-btn:not([disabled])");
            c && c.click();
          });
          await page.waitForTimeout(600);
        }
        t.ok(!!(chips && chips.length), label + " reaches a question with a term in it");
        if (!chips) continue;

        const before = await page.evaluate(() => location.hash);
        const open = await page.evaluate(() => {
          document.querySelector("#view .gloss-row .chip-btn").click();
          const b = document.querySelector("#view .gloss-body");
          return { hidden: b.hidden, len: b.textContent.trim().length,
                   on: !!document.querySelector("#view .gloss-row .chip-btn.on"),
                   hash: location.hash,
                   ov: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        t.ok(!open.hidden && open.len > 30, "  tapping a chip shows the definition");
        t.ok(open.on, "  and marks the chip as the open one");
        t.eq(open.hash, before, "  without navigating away from the run");
        t.eq(open.ov, 0, "  and without overflowing");

        const shut = await page.evaluate(() => {
          document.querySelector("#view .gloss-row .chip-btn").click();
          return document.querySelector("#view .gloss-body").hidden;
        });
        t.ok(shut, "  and tapping it again closes it");

        /* The run must still be playable afterwards — this is a panel inside a live game. */
        const moved = await page.evaluate(() => {
          const n = document.querySelector("#view .js-next:not([disabled])");
          if (!n) return "no next button";
          n.click();
          return null;
        });
        t.eq(moved, null, "  and the Next button still works underneath it");
      }

      /* Nothing here may pay. The glossary is reading, and reading is free. */
      const paid = await page.evaluate(() => {
        const d = EN.State.data;
        return { xp: d.xp, coins: d.coins };
      });
      await page.evaluate(() => {
        const c = document.querySelector("#view .gloss-row .chip-btn");
        if (c) { c.click(); c.click(); c.click(); }
      });
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => ({ xp: EN.State.data.xp, coins: EN.State.data.coins }));
      t.eq(after.xp, paid.xp, "opening the glossary awards no XP");
      t.eq(after.coins, paid.coins, "and no Marks");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
