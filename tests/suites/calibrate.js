/* CALIBRATE — run the whole labelled set and report where the app disagrees with a marker.
   ============================================================================
   `marking` checks that the stack works on a couple of prompts. This checks it across the
   whole calibration set and, more usefully, PRINTS the disagreements — because the point of
   a calibration run is to tell you which threshold to move, not merely whether today's
   numbers pass.

   Why the tolerances are loose: a label is a judgement about a response, not a prediction
   of a mark out of four. Demanding "good ⇒ exactly 4" would fail on honest authoring
   variation and teach whoever runs it to ignore the output. What must hold is the ordering,
   and the two outcomes a student actually notices — a good answer scored as a failure, or a
   wrong answer given full marks.
   ============================================================================ */
"use strict";
const CASES = require("../data/calibration");
const { harness } = require("../lib/browser");

/* The mark a label must not fall outside. Wide on purpose; see the header. */
const BAND = {
  good:   { min: 2, max: 4 },
  decent: { min: 1, max: 4 },
  /* max 3, not 2: a fluent on-topic answer that names the technique and uses an analytical
     verb legitimately earns Detail and Effect even when it says nothing. The rubric is
     measuring what it claims to measure, and the embedding cannot tell "clever structure"
     from "self-sealing structure" — that is a stated limitation, not a number to hide by
     moving a threshold until the test goes quiet. Full marks it cannot reach: the contrast
     gate holds the fourth back. */
  thin:   { min: 0, max: 3 },
  wrong:  { min: 0, max: 2 }
};
const ORDER = ["good", "decent", "thin", "wrong"];

module.exports = {
  name: "calibrate",
  needsBrowser: true,
  about: "run the labelled set; report where the app and a marker disagree",

  async run(t, { ROOT }) {
    t.atLeast(CASES.length, 40, "labelled responses in the calibration set");
    const labels = {};
    CASES.forEach(c => (labels[c[1]] = (labels[c[1]] || 0) + 1));
    ORDER.forEach(l => t.atLeast(labels[l] || 0, 5, "responses labelled '" + l + "'"));

    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");

      /* Every prompt named must exist, or the case is silently testing nothing. */
      const unknown = await page.evaluate(ids => {
        const have = new Set(EN.DATA.freeText.map(p => p.id));
        return Array.from(new Set(ids)).filter(id => !have.has(id));
      }, CASES.map(c => c[0]));
      t.eq(unknown, [], "calibration prompt ids that are not in the bank");

      const loaded = await page.evaluate(async () => {
        if (!EN.Mark.available()) return false;
        try { return await EN.Mark.load(); } catch (e) { return false; }
      });
      if (!loaded) {
        t.note("Layer C did not load here, so nothing was calibrated. The set and its " +
               "prompt references were still validated.");
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
          out.push({ pid, label, total: r.total, verdict: r.verdict, cos: r.score,
                     flags: (r.flags || []).join(","),
                     marks: (r.marks || []).map(m => m.id[0] + m.got).join(" "),
                     text });
        }
        return out;
      }, CASES);

      /* ── the ordering ── */
      const mean = l => {
        const set = rows.filter(r => r.label === l);
        return set.length ? set.reduce((n, r) => n + r.total, 0) / set.length : 0;
      };
      const means = ORDER.map(mean);
      t.note("mean mark — " + ORDER.map((l, i) => l + " " + means[i].toFixed(2)).join(" · ") + " (out of 4)");
      t.ok(means[0] > means[1], "good outscores decent");
      t.ok(means[1] > means[2], "decent outscores thin");
      t.ok(means[0] > means[3] + 1.5, "good clearly outscores wrong");

      /* ── the two outcomes a student notices ── */
      const scrapped = rows.filter(r => r.label === "good" && r.total <= 1);
      const falsePass = rows.filter(r => (r.label === "wrong" || r.label === "thin") && r.total >= 4);
      scrapped.forEach(r => t.note("  SCRAPPED  " + r.pid + " [" + r.marks + " cos " +
                                   r.cos.toFixed(2) + "] " + r.text.slice(0, 58)));
      falsePass.forEach(r => t.note("  FALSE PASS " + r.pid + " [" + r.marks + " cos " +
                                    r.cos.toFixed(2) + "] " + r.text.slice(0, 58)));
      t.eq(scrapped.length, 0, "good answers scored as failures");
      t.eq(falsePass.length, 0, "wrong or thin answers given full marks");

      /* ── the band, per label ── */
      const outside = rows.filter(r => {
        const b = BAND[r.label];
        return r.total < b.min || r.total > b.max;
      });
      outside.forEach(r => t.note("  OUT OF BAND " + r.label + " → " + r.total + "/4  " +
                                  r.pid + " [" + r.marks + "] " + r.text.slice(0, 50)));
      t.atMost(outside.length / rows.length, 0.1,
               "share of responses outside the mark band for their label");

      /* ── per prompt, so one badly-thresholded prompt cannot hide ── */
      const byPrompt = {};
      rows.forEach(r => (byPrompt[r.pid] || (byPrompt[r.pid] = [])).push(r));
      Object.keys(byPrompt).sort().forEach(pid => {
        const set = byPrompt[pid];
        const g = set.filter(r => r.label === "good");
        const w = set.filter(r => r.label === "wrong");
        if (!g.length || !w.length) return;
        const gm = g.reduce((n, r) => n + r.total, 0) / g.length;
        const wm = w.reduce((n, r) => n + r.total, 0) / w.length;
        t.ok(gm > wm, pid + ": good answers outscore wrong ones (" +
             gm.toFixed(1) + " vs " + wm.toFixed(1) + ")");
        t.note("  " + pid + "  good " + gm.toFixed(1) + " · wrong " + wm.toFixed(1) +
               "  cos " + Math.min.apply(null, g.map(r => r.cos)).toFixed(2) + "–" +
               Math.max.apply(null, g.map(r => r.cos)).toFixed(2) + " on good");
      });

      /* The cosine range on GOOD answers is the number to look at when re-tuning a
         threshold: any prompt whose threshold sits above its own good answers is
         mis-calibrated, and that is what the old 0.62 was doing everywhere. */
      const tooHigh = await page.evaluate(rowsIn => {
        const out = [];
        const byId = {};
        rowsIn.forEach(r => (byId[r.pid] || (byId[r.pid] = [])).push(r));
        Object.keys(byId).forEach(pid => {
          const p = EN.DATA.freeText.find(x => x.id === pid);
          const good = byId[pid].filter(r => r.label === "good");
          if (!good.length) return;
          const worst = Math.min.apply(null, good.map(r => r.cos));
          if (p.threshold > worst) out.push({ pid, threshold: p.threshold, worstGood: worst });
        });
        return out;
      }, rows);
      tooHigh.forEach(x => t.note("  THRESHOLD HIGH " + x.pid + ": " + x.threshold +
                                  " above its weakest good answer at " + x.worstGood.toFixed(3)));
      t.atMost(tooHigh.length / Object.keys(byPrompt).length, 0.5,
               "share of prompts whose threshold sits above their own good answers");

      t.eq(page.errors.filter(e => !/onnx|wasm|model/i.test(e)).slice(0, 3), [], "console errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
