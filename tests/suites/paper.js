/* PAPER — Section I: four short answers, one clock, nothing marked until you submit.
   ============================================================================
   The app had fourteen modes and none of them rehearsed the shape of Paper 1 Section I.
   Say It In One marks each sentence the moment it is submitted, which is right for learning
   a move and wrong for sitting an exam: in an exam you budget one block of time across
   several questions, you cannot see whether the last answer landed before committing to the
   next, and nobody tells you anything until it is over.

   Those three constraints are the mode, so they are what this suite holds — plus the two
   things that were actually wrong when it was written:

     • UI.results DISPLAYS a payout; UI.award GRANTS one. The first version called the
       former and not the latter, so the report showed XP and Marks that never reached the
       save. The suite reads the ledger rather than the screen.

     • `let area` was declared beside render() while render() ran during setup, so the
       textarea never appeared — a paper with no way to answer it. Function declarations
       hoist and `let` does not.

   And the property that makes the mode safe to add rather than a new farm: the payout cap
   is per PROMPT per day, not per run, so reaching a prompt through a paper instead of Say
   It In One changes nothing about the daily ceiling.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

/* Fill every question with the first model answer for the prompt actually on screen, read
   back off the DOM — the mode picks its prompts at random and exposes nothing. */
const FILL = `(() => {
  const pips = Array.from(document.querySelectorAll("#view .paper-pip"));
  let matched = 0;
  pips.forEach(pip => {
    pip.click();
    const shown = document.querySelector("#view .qcard .prose").textContent.trim();
    const entry = EN.Bank.freeText().find(x => x.prompt.trim() === shown);
    if (entry) matched++;
    const a = document.querySelector("#view textarea");
    a.value = entry ? entry.answers[0] : "An answer that will not match anything.";
    a.dispatchEvent(new Event("input", { bubbles: true }));
  });
  return { questions: pips.length, matched };
})`;

module.exports = {
  name: "paper",
  needsBrowser: true,
  about: "a section runs on one clock, marks nothing until submitted, and pays what it shows",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");
      await page.waitForTimeout(500);
      const ready = await page.evaluate(async () => {
        EN.State.data.level = 40;
        if (!EN.Mark.available()) return false;
        try { return await EN.Mark.load(); } catch (e) { return false; }
      });

      /* ── it opens as a section, not as a question ── */
      for (const w of [390, 360]) {
        await page.setViewportSize({ width: w, height: 844 });
        await h.goto(page, "/game/paper", 1500);
        const open = await page.evaluate(() => ({
          pips: document.querySelectorAll("#view .paper-pip").length,
          clocks: document.querySelectorAll(".gmeta .timer-ring").length,
          area: !!document.querySelector("#view textarea"),
          submit: !!document.querySelector("#view .js-submit"),
          next: !!document.querySelector("#view .js-next"),
          marked: document.querySelectorAll("#view .lc-crit").length,
          total: !!document.querySelector("#view .paper-total"),
          ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
        }));
        t.eq(open.pips, 4, w + "px — four questions, reachable in any order");
        t.eq(open.clocks, 1, "  and exactly one clock for all of them");
        t.ok(open.area, "  with somewhere to write");
        t.ok(open.submit, "  a way to submit the paper at any point");
        t.ok(open.next, "  and a keyboard-reachable Next");
        t.eq(open.marked, 0, "  nothing marked yet");
        t.ok(!open.total, "  and no total yet");
        t.eq(open.ov, 0, "  no horizontal overflow");
      }

      /* ── answers survive navigation, which is the point of the strip ── */
      await page.setViewportSize({ width: 390, height: 844 });
      await h.goto(page, "/game/paper", 1500);
      const nav = await page.evaluate(() => {
        const pips = () => Array.from(document.querySelectorAll("#view .paper-pip"));
        const type = s => { const a = document.querySelector("#view textarea");
                            a.value = s; a.dispatchEvent(new Event("input", { bubbles: true })); };
        type("FIRST");
        pips()[2].click(); type("THIRD");
        pips()[0].click();
        const first = document.querySelector("#view textarea").value;
        pips()[2].click();
        const third = document.querySelector("#view textarea").value;
        return { first, third,
                 done: pips().filter(x => x.classList.contains("done")).length,
                 chip: Array.from(document.querySelectorAll(".gmeta .chip"))
                   .map(n => n.textContent).join(" | ") };
      });
      t.eq(nav.first, "FIRST", "an answer is still there when you come back to it");
      t.eq(nav.third, "THIRD", "  and so is the other one");
      t.eq(nav.done, 2, "the strip shows which questions are answered");
      t.ok(/2 \/ 4 answered/.test(nav.chip), "  and so does the header");

      /* Marking has not happened, however much has been typed. */
      t.eq(await page.evaluate(() => document.querySelectorAll("#view .lc-crit, #view .lc-mark").length),
           0, "and still nothing is marked before the paper is submitted");

      /* ── submitting with blanks warns first ── */
      await page.evaluate(() => document.querySelector("#view .js-submit").click());
      await page.waitForTimeout(400);
      const warn = await page.evaluate(() => {
        const m = document.querySelector(".modal, .modal-center");
        return m ? m.textContent.replace(/\s+/g, " ") : null;
      });
      t.ok(warn && /unanswered/i.test(warn), "submitting with blanks asks first");
      /* Scoped to the dialog. The paper's own sticky bar also has a button reading
         "Submit", it is still in the DOM behind the modal, and an unscoped search found it
         first — which reopened the dialog instead of confirming it and left the paper
         unsubmitted about one run in four. */
      const confirmed = await page.evaluate(() => {
        const dlg = document.querySelector(".modal, .modal-center");
        const b = dlg && Array.from(dlg.querySelectorAll("button"))
          .find(x => x.textContent.trim() === "Submit");
        if (!b) return false;
        b.click();
        return true;
      });
      t.ok(confirmed, "  and the dialog's own Submit is what confirms it");
      await page.waitForTimeout(ready ? 9000 : 1500);
      const blanks = await page.evaluate(() => ({
        total: (document.querySelector("#view .paper-total-num") || {}).textContent || "",
        blank: Array.from(document.querySelectorAll("#view .lc-verdict .lc-word"))
          .filter(n => /Left blank/.test(n.textContent)).length
      }));
      t.ok(/\/ 16$/.test(blanks.total), "the paper totals out of sixteen (" + blanks.total + ")");
      t.eq(blanks.blank, 2, "and a blank answer is reported as blank, not as wrong");

      if (!ready) {
        t.note("Layer C did not load here — the section shape was checked, the marking " +
               "and the payout were not.");
        t.eq(page.errors.filter(e => !/model|onnx|wasm/i.test(e)).slice(0, 3), [], "console errors");
        await page.close();
        return;
      }

      /* ── it pays what it shows ── */
      await h.goto(page, "/game/paper", 1500);
      const before = await page.evaluate(() => ({
        xp: EN.State.data.lifetimeXp, marked: EN.State.data.stats.sentencesMarked || 0 }));
      const fill = await page.evaluate(FILL + "()");
      t.eq(fill.questions, 4, "every question can be filled in");
      t.eq(fill.matched, 4, "  and each one was found in the prompt bank");
      await page.evaluate(() => document.querySelector("#view .js-submit").click());
      await page.waitForTimeout(11000);
      const paid = await page.evaluate(() => ({
        xp: EN.State.data.lifetimeXp, marked: EN.State.data.stats.sentencesMarked || 0,
        total: (document.querySelector("#view .paper-total-num") || {}).textContent || "",
        crits: document.querySelectorAll("#view .lc-crit").length,
        models: document.querySelectorAll("#view details").length,
        gate: !!Array.from(document.querySelectorAll("button")).find(b => /See your result/.test(b.textContent))
      }));
      t.atLeast(paid.xp - before.xp, 1,
                "a marked paper actually moves the ledger (+" + (paid.xp - before.xp) + " XP)");
      t.atLeast(paid.marked - before.marked, 4, "and counts four marked sentences");
      t.atLeast(paid.crits, 8, "the report shows the criteria behind each mark");
      t.atLeast(paid.models, 4, "and the model answers for every question");
      t.ok(paid.gate, "with the result box behind a button, so the working stays readable");
      t.note("  model answers scored " + paid.total);

      /* ── and it cannot pay for the same prompt twice in a day ── */
      const again = await page.evaluate(async () => {
        /* Force the same prompts by asking for the ones just scored. */
        const scored = Object.keys(EN.State.data.freeText.scored);
        const view = document.querySelector("#view");
        view.innerHTML = "";
        const pool = EN.Bank.freeText().filter(p => scored.indexOf(p.id) >= 0).slice(0, 4);
        EN.Games.paper.start(view, { count: pool.length, prompts: pool });
        return { scored: scored.length, pool: pool.length };
      });
      t.atLeast(again.scored, 4, "the day's scored prompts are recorded");

      const beforeTwice = await page.evaluate(() => EN.State.data.lifetimeXp);
      await page.waitForTimeout(600);
      await page.evaluate(FILL + "()");
      await page.evaluate(() => document.querySelector("#view .js-submit").click());
      await page.waitForTimeout(11000);
      const twice = await page.evaluate(() => ({
        xp: EN.State.data.lifetimeXp,
        notPaid: Array.from(document.querySelectorAll("#view .lc-verdict"))
          .filter(n => /not paid/i.test(n.textContent)).length
      }));
      t.atLeast(twice.notPaid, 1, "a prompt already scored today is marked but not paid again");
      t.ok(twice.xp - beforeTwice <= 8,
           "  so resitting the same questions is worth almost nothing (+" +
           (twice.xp - beforeTwice) + " XP)");

      /* ── running out of time submits what is there ── */
      await h.goto(page, "/game/paper", 900);
      const timeout = await page.evaluate(async () => {
        const view = document.querySelector("#view");
        view.innerHTML = "";
        EN.Games.paper.start(view, { count: 2, timed: true, seconds: 3 });
        const a = document.querySelector("#view textarea");
        a.value = "Something, at least.";
        a.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise(r => setTimeout(r, 5000));
        return { submitted: !!document.querySelector("#view .paper-total"),
                 lbl: (document.querySelector("#view .paper-total-lbl") || {}).textContent || "",
                 strip: document.querySelectorAll("#view .paper-pip").length };
      });
      await page.waitForTimeout(9000);
      t.ok(timeout.submitted || await page.evaluate(() => !!document.querySelector("#view .paper-total")),
           "the clock running out submits the paper");
      const ranOut = await page.evaluate(() =>
        (document.querySelector("#view .paper-total-lbl") || {}).textContent || "");
      t.ok(/ran out/i.test(ranOut), "  and says so rather than pretending it was finished");
      t.eq(await page.evaluate(() => document.querySelectorAll("#view .paper-pip").length), 0,
           "  with no way back into a submitted paper");

      t.eq(page.errors.filter(e => !/model|onnx|wasm/i.test(e)).slice(0, 3), [],
           "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
