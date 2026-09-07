/* CITE — every quote on screen says where it came from.
   ============================================================================
   Quotes used to be captioned "speaker · locus" and nothing else, so a line could appear in
   a game reading "Part 2, Ch. 7 — Winston" with no indication of which book it was from.
   Every quote in the bank already had a locus, a speaker and a composer, so there was never
   a reason not to say — the gap was entirely in the rendering.

   Three things this suite pins down, all of which were wrong on the first pass:

     • The WORK is the poem, not the volume. Donne ships as a 54-poem selection called "The
       Metaphysical Poetry of John Donne" and the thing a student cites is "The Sun Rising".
       The poem title is usually the opening of the authored locus, so promoting it without
       stripping it produced "The Sun Rising — The Sun Rising, ll. 1–3".

     • A bare voice note is not an attribution. All 93 Donne quotes carry the literal
       speaker "speaker", which rendered as "ll. 1–2 — speaker". The qualified ones are kept,
       because "narrator (Winston's thought)" is exactly the sort of thing worth citing.

     • Attribution must not become a giveaway. Adding the citation to Quote Match printed the
       speaker on the card in the round whose question IS "who says this".
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

module.exports = {
  name: "cite",
  needsBrowser: true,
  about: "every quote on screen says which work, composer and locus it came from",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");
      await page.waitForTimeout(500);

      /* ── the data supports a citation at all ── */
      const data = await page.evaluate(() => {
        const qs = EN.Bank.allQuotes();
        const bad = { noLocus: 0, noComposer: 0, noWork: 0 };
        qs.forEach(q => {
          const c = EN.U.cite(q);
          if (!c.locus) bad.noLocus++;
          if (!c.composer) bad.noComposer++;
          if (!c.work) bad.noWork++;
        });
        return { total: qs.length, bad };
      });
      t.atLeast(data.total, 300, "the bank has quotes to attribute");
      t.eq(data.bad.noWork, 0, "every quote resolves to a work");
      t.eq(data.bad.noComposer, 0, "every quote resolves to a composer");
      t.eq(data.bad.noLocus, 0, "every quote resolves to a locus");

      /* ── the poem is the work, and it is not printed twice ── */
      const poems = await page.evaluate(() => {
        const qs = EN.Bank.allQuotes().filter(q => q.poem);
        const out = { n: qs.length, volumeAsWork: 0, doubled: 0, sample: null };
        qs.forEach(q => {
          const c = EN.U.cite(q);
          if (c.work === q.textTitle) out.volumeAsWork++;
          if (c.locus && c.work && c.locus.indexOf(c.work) === 0) out.doubled++;
          if (!out.sample) out.sample = EN.U.citeLine(q);
        });
        return out;
      });
      t.atLeast(poems.n, 90, "the poem selection contributes most of its quotes");
      t.eq(poems.volumeAsWork, 0, "a poem cites the poem, not the volume it ships in");
      t.eq(poems.doubled, 0, "and the poem title is not repeated inside its own locus");
      t.note("  " + poems.sample);

      /* ── a bare voice note is dropped, a qualified one kept ── */
      const speakers = await page.evaluate(() => ({
        bare: EN.U.genericSpeaker("speaker") && EN.U.genericSpeaker("Narrator") &&
              EN.U.genericSpeaker(" stage direction "),
        real: !EN.U.genericSpeaker("Falstaff") &&
              !EN.U.genericSpeaker("narrator (Winston's thought)"),
        leaked: EN.Bank.allQuotes().filter(q => /^speaker$/i.test((q.speaker || "").trim()))
          .filter(q => /speaker/i.test(EN.U.citeLine(q))).length
      }));
      t.ok(speakers.bare, "a bare voice note counts as generic");
      t.ok(speakers.real, "a named speaker and a qualified narrator do not");
      t.eq(speakers.leaked, 0, "and no citation ends with the word “speaker”");

      /* ── it is visible on screen, in every place a quote appears ── */
      /* Only about half the Layer C prompts carry a quote, and the mode draws at random,
         so asking "does /game/sayit show a citation" passed or failed on the draw. The
         run is seeded with prompts that DO have quotes instead — the question is whether
         a quote on screen is attributed, not whether one turned up. */
      const PLACES = [
        ["/reference/texts/donne", ".bq", null],
        ["/reference/texts/1984", ".bq", null],
        ["/game/technique", ".bq", null],
        ["/game/sayit", ".bq", "sayit"]
      ];
      for (const [route, sel, seed] of PLACES) {
        await h.goto(page, route, 1500);
        if (seed === "sayit") {
          await page.evaluate(() => {
            const withQuote = EN.Bank.freeText()
              .filter(p => p.mode === "sayit" && p.quote).slice(0, 3);
            const v = document.querySelector("#view");
            v.innerHTML = "";
            EN.Games.layerc.start(v, { modeId: "sayit", title: "💬 Say It In One",
                                       mode: "sayit", count: withQuote.length,
                                       prompts: withQuote });
          });
          await page.waitForTimeout(900);
        }
        const seen = await page.evaluate(s => {
          const first = document.querySelector("#view " + s);
          if (!first) return null;
          const cap = first.querySelector("figcaption");
          return { caption: cap ? cap.textContent.replace(/\s+/g, " ") : "",
                   work: !!first.querySelector(".bq-work"),
                   loc: !!first.querySelector(".bq-loc"),
                   ov: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        }, sel);
        t.ok(!!seen, route + " shows a quote");
        if (!seen) continue;
        t.ok(seen.work, "  with the work and composer on it");
        t.ok(seen.loc, "  and the locus");
        t.eq(seen.ov, 0, "  and no overflow");
      }

      /* The Vault mixes every text the student studies, so a row saying only "Part 2,
         Ch. 7" does not say which book. */
      await h.goto(page, "/vault", 1000);
      const row = await page.evaluate(() => {
        const r = document.querySelector("#view .vault-row .vault-locus");
        return r ? { text: r.textContent.replace(/\s+/g, " "), tip: r.title,
                     ov: document.documentElement.scrollWidth - document.documentElement.clientWidth }
                 : null;
      });
      t.ok(!!row, "the Vault lists quotes");
      t.ok(row && row.text.length > 6, "  each row naming its work as well as its locus");
      t.ok(row && row.tip.indexOf(",") > 0, "  with the full citation available on the row");
      t.eq(row ? row.ov : -1, 0, "  and no overflow at the default width");

      /* Copying a quote for an essay has to bring the citation with it. */
      await page.evaluate(() => document.querySelector("#view .vault-row").click());
      await page.waitForTimeout(700);
      const card = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("#view button"))
          .find(b => /Copy with citation/i.test(b.textContent));
        return { work: !!document.querySelector("#view .bq-work"),
                 copy: !!btn };
      });
      t.ok(card.work, "a Vault card names the work");
      t.ok(card.copy, "and offers the quote with its citation for an essay");

      /* ── and the citation is not a giveaway ── */
      /* The round is asked for by name rather than waited for: the kind is one of four
         picked at random, so looping until it appeared failed the suite one run in twenty
         for a reason that had nothing to do with citations. */
      await h.goto(page, "/game/quotematch", 900);
      const round = await page.evaluate(() => {
        const view = document.querySelector("#view");
        view.innerHTML = "";
        EN.Games.quotematch.start(view, { kind: "quote-character", pairs: 6 });
        return {
          kind: (document.querySelector(".gmeta .chip") || {}).textContent || "",
          /* A card whose whole face is a bare voice note would be a nonsense answer. */
          generic: Array.from(document.querySelectorAll("#view .mface-front"))
            .map(f => f.textContent.trim()).filter(x => EN.U.genericSpeaker(x)).length,
          /* Precisely: no card's own citation may contain its own answer, checked
             against the REAL pairing rather than by guessing which card matches which.
             Counting " — " instead was a false positive — two authored loci contain an em
             dash of their own — and checking the whole quote pool was also wrong, because
             the round already refuses the quotes whose speaker is their own composer. */
          leaks: EN.Games.quotematch.buildPairs("quote-character", 8, null)
            .filter(pr => pr.a.title && pr.b.text &&
                          pr.a.title.indexOf(pr.b.text) >= 0).length,
          builtPairs: EN.Games.quotematch.buildPairs("quote-character", 8, null).length,
          cites: document.querySelectorAll("#view .mface-front .tiny").length
        };
      });
      t.eq(round.kind, "Quote → speaker", "the quote→speaker round can be asked for by name");
      t.atLeast(round.cites, 3, "  and its quote cards carry a citation");
      t.eq(round.generic, 0, "  never offering a bare voice note as an answer");
      t.atLeast(round.builtPairs, 4, "  the round can be built from the bank");
      t.eq(round.leaks, 0, "  and no card's citation contains its own answer");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
