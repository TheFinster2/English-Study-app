/* MARKING — does the marking stack agree with a marker?
   ============================================================================
   The complaint that produced this suite was "I gave a decent answer and it was scrapped".
   Three causes, all measurable, and all of them the kind of thing that silently comes back
   the next time a threshold is touched:

     • the near-miss veto rejecting answers for being about the right subject, because a
       near-miss is the same idea read badly and therefore sits close to a good answer;
     • cosine punishing length, so the strongest answers scored below blunt short ones;
     • pass/fail on one number, which cannot distinguish "made the point but didn't say
       what it does" from "wrote nothing useful".

   So the assertion is ORDERING, not absolute scores. A labelled set of responses must come
   out monotonically: good above decent above thin above wrong, with no good answer scored
   as a failure and no wrong answer scored as full marks. Ordering survives a model swap;
   a hard-coded cosine would not.

   Layer C needs the 23 MB model, so if it will not load the suite checks the deterministic
   half — Layer B, the craft marks, the reversal backstop — and says so rather than
   passing silently.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

/* Hand-labelled against two real prompts. Labels are a teacher's judgement, not a score. */
const CASES = [
  ["ft-001", "good", "Orwell positions the slogans as the mechanism of control, since restricting the available words restricts what dissent can even be phrased in."],
  ["ft-001", "good", "By shrinking the vocabulary, the Party forecloses the sentences a rebel would need, so language becomes the instrument of power."],
  ["ft-001", "decent", "The slogans show that whoever controls language controls thought."],
  ["ft-001", "decent", "Orwell suggests power works through language rather than only through force."],
  ["ft-001", "thin", "The slogans are memorable and repeated a lot."],
  ["ft-001", "wrong", "Language cannot really change what people privately believe."],
  ["ft-001", "wrong", "Winston works at the Ministry of Truth and rewrites old newspapers."],
  ["ft-002", "good", "The chiasmus closes the loop, so Orwell leaves a reader no vantage point outside the sentence from which to test it."],
  ["ft-002", "good", "Because the terms swap places, the structure forecloses disagreement — every position a reader could argue from is already inside the claim."],
  ["ft-002", "decent", "The inverted structure makes the claim impossible to argue with."],
  ["ft-002", "decent", "It creates a circular effect that traps the reader."],
  ["ft-002", "thin", "The repetition makes it rhythmic and easy to memorise."],
  ["ft-002", "wrong", "The inversion shows the future controls the past, not the other way round."]
];

module.exports = {
  name: "marking",
  needsBrowser: true,
  about: "the marking stack ranks answers the way a marker would",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");

      /* ── Layer B: spellcheck, and never prose ──────────────── */
      const b = await page.evaluate(async () => {
        const check = (r, alts) => EN.Mark.check(r, { layer: "B", answers: alts });
        return {
          exact: (await check("anaphora", ["anaphora"])).verdict,
          typo: (await check("anaphoraa", ["anaphora"])).verdict,
          wrong: (await check("metaphor", ["anaphora"])).verdict,
          /* Handed a sentence, Layer B must refuse rather than score surface overlap. */
          prose: (await check("the repetition at the start of each clause builds pressure on the reader",
                              ["anaphora"])).flags,
          threshold: EN.Mark.FUZZY_THRESHOLD
        };
      });
      t.eq(b.exact, "nailed", "Layer B accepts the exact word");
      t.eq(b.typo, "nailed", "Layer B forgives a one-letter slip");
      t.eq(b.wrong, "notYet", "Layer B rejects a different word");
      t.ok(b.prose.includes("scope"), "Layer B refuses a sentence instead of scoring it");
      t.eq(b.threshold, 0.85, "the fuzzy threshold is 0.85");

      /* ── the deterministic craft marks ─────────────────────── */
      const craft = await page.evaluate(() => {
        const spec = { techniques: ["chiasmus"], text: "1984",
                       quoteText: "Who controls the past controls the future" };
        const get = (r, id) => {
          const m = EN.Mark.craftMarks(r, spec).find(x => x.id === id);
          return m ? m.got : null;
        };
        return {
          namesTechnique: get("The chiasmus positions the reader inside the claim", "detail"),
          quotesText: get("'controls the past controls the future' forecloses objection", "detail"),
          namesText: get("Orwell forecloses objection with the structure", "detail"),
          anchorless: get("This is a really clever bit of writing that works well", "detail"),
          hasEffect: get("The structure positions the reader to accept it", "effect"),
          retells: get("This is the part where Winston reads the book", "effect"),
          /* No anchorable data at all: the mark is given, not withheld, because marking a
             student down for a criterion the data cannot express would be a lie. */
          uncheckable: EN.Mark.craftMarks("anything at all", {}).find(x => x.id === "detail").got
        };
      });
      t.eq(craft.namesTechnique, 1, "naming the technique earns the anchoring mark");
      t.eq(craft.quotesText, 1, "quoting the words earns the anchoring mark");
      t.eq(craft.namesText, 1, "naming the composer earns the anchoring mark");
      t.eq(craft.anchorless, 0, "an answer with no contact with the text does not");
      t.eq(craft.hasEffect, 1, "an analytical verb earns the effect mark");
      t.eq(craft.retells, 0, "retelling the plot does not");
      t.eq(craft.uncheckable, 1, "with nothing to anchor to, the mark is given rather than withheld");

      /* Point gates the total: a fluent, well-anchored answer to a different question
         must not reach a passing mark. */
      const gate = await page.evaluate(() => {
        const marks = [{ id: "point", got: 0, max: 2 }, { id: "detail", got: 1, max: 1 },
                       { id: "effect", got: 1, max: 1 }];
        return EN.Mark.capped(marks);
      });
      t.atMost(gate.total, 1, "a wrong claim caps at one mark however well anchored");

      /* ── the reversal backstop, which needs no model ───────── */
      const rev = await page.evaluate(() => ({
        inverted: EN.Mark.reversed("Form is prioritised above meaning here",
                                   "Meaning is prioritised above form here"),
        same: EN.Mark.reversed("Meaning is prioritised above form here",
                               "Meaning matters more than form in this poem"),
        negation: EN.Mark.negationMismatch("The poem does not resolve the tension",
                                           "The poem resolves the tension")
      }));
      t.eq(rev.inverted, true, "a comparative inversion is caught deterministically");
      t.eq(rev.same, false, "a paraphrase in the same direction is not flagged");
      t.eq(rev.negation, true, "a negation asymmetry is flagged");

      /* ── Layer C, if the model will run here ───────────────── */
      const loaded = await page.evaluate(async () => {
        if (!EN.Mark.available()) return false;
        try { return await EN.Mark.load(); } catch (e) { return false; }
      });
      if (!loaded) {
        t.note("Layer C did not load here — the deterministic half was checked, the " +
               "embedding half was not. Run with the model present for the full suite.");
        t.eq(page.errors.filter(e => !/model|onnx|wasm/i.test(e)).slice(0, 3), [], "console errors");
        await page.close();
        return;
      }

      const rows = await page.evaluate(async cases => {
        const out = [];
        for (const [pid, label, text] of cases) {
          const p = EN.DATA.freeText.find(x => x.id === pid);
          const q = p.quote ? EN.Bank.quoteById(p.quote) : null;
          const r = await EN.Mark.check(text, {
            layer: "C", answers: p.answers, nearMiss: p.nearMiss, prompt: p.prompt,
            threshold: p.threshold, domain: p.domain, text: p.text,
            techniques: q ? q.techniques : null, quoteText: q ? q.text : null
          });
          out.push({ label, total: r.total, verdict: r.verdict, cos: r.score,
                     flags: r.flags, text: text.slice(0, 46) });
        }
        return out;
      }, CASES);

      const mean = l => {
        const set = rows.filter(r => r.label === l);
        return set.reduce((n, r) => n + r.total, 0) / set.length;
      };
      const good = mean("good"), decent = mean("decent"), thin = mean("thin"), wrong = mean("wrong");
      t.note("mean mark — good " + good.toFixed(2) + " · decent " + decent.toFixed(2) +
             " · thin " + thin.toFixed(2) + " · wrong " + wrong.toFixed(2) + " (out of 4)");

      /* The ordering, which is the actual contract. */
      t.ok(good > decent, "good answers outscore merely decent ones");
      t.ok(decent > thin, "decent answers outscore thin ones");
      t.ok(good > wrong + 1.5, "good answers clearly outscore wrong ones");

      /* And the two failures a student would actually notice. */
      const scrapped = rows.filter(r => r.label === "good" && r.total <= 1);
      t.eq(scrapped.map(r => r.text), [], scrapped.length + " good answers scored as failures");
      const falsePass = rows.filter(r => (r.label === "wrong" || r.label === "thin") && r.total >= 4);
      t.eq(falsePass.map(r => r.text), [], falsePass.length + " wrong or thin answers given full marks");

      /* Every result must carry a mark, and must never expose the similarity number as
         one — the score is diagnostic only. */
      t.ok(rows.every(r => r.total >= 0 && r.total <= 4), "every mark is within 0–4");
      t.ok(rows.every(r => r.verdict !== "unavailable"), "the model answered every case");

      /* A clean inversion of an exemplar must not be full marks even at high cosine. */
      const invert = await page.evaluate(async () => {
        const p = EN.DATA.freeText.find(x => x.id === "ft-001");
        const r = await EN.Mark.check(
          "Controlling what can be thought lets the Party control the available language.",
          { layer: "C", answers: p.answers, nearMiss: p.nearMiss, prompt: p.prompt,
            threshold: p.threshold });
        return { total: r.total, cos: r.score };
      });
      t.atMost(invert.total, 3, "an inversion of an exemplar does not reach full marks" +
               " (cosine " + invert.cos.toFixed(3) + ")");

      t.eq(page.errors.filter(e => !/onnx|wasm|model/i.test(e)).slice(0, 3), [], "console errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
