/* SKILLS — the axis a student can actually act on.
   ============================================================================
   Progress tracked mastery per module and per text. Both are true and neither is
   instruction: "Module B 61%" tells a student which book to reread, and there is nothing
   they can do about that on a Tuesday night. "Form and structure 38%" tells them what kind
   of thinking to practise, and it is the same answer whichever text they are sitting.

   So answers now carry their TOPIC, and the eight bank topics are joined by three that come
   from modes rather than multiple choice — Bands, Essay structure, Question analysis — so
   the breakdown covers the Marking Desk and the Essay Architect too, which is where a
   student's marks actually come from.

   Two things this suite exists to hold:

     • A skill with no MCQ pool must not be "drilled". `filter({topic})` returns nothing for
       Bands, `draw` falls back to the whole bank, and the run would open under the title
       "🎯 Bands" while asking about anything at all. Those three route to the mode that
       trains them instead.

     • Ten answers before a skill is called weak. A diagnosis built on four answers is a
       horoscope, and worse than none, because the student follows it.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

const EVIDENCE = 10;

module.exports = {
  name: "skills",
  needsBrowser: true,
  about: "answers are tracked by skill, and every skill leads somewhere that trains it",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/home");
      await page.waitForTimeout(500);

      /* ── the axis exists and covers the bank ── */
      const cover = await page.evaluate(() => {
        const topics = EN.Bank.allTopics();
        const inBank = {};
        EN.Bank.all().forEach(q => { if (q.topic) inBank[q.topic] = (inBank[q.topic] || 0) + 1; });
        return { topics, inBank,
                 unlisted: Object.keys(inBank).filter(k => topics.indexOf(k) < 0),
                 total: EN.Bank.all().length,
                 covered: Object.values(inBank).reduce((a, b) => a + b, 0) };
      });
      t.atLeast(cover.topics.length, 8, "there is a list of skills");
      t.eq(cover.unlisted, [], "every topic the bank uses is in that list");
      t.eq(cover.covered, cover.total, "and every question in the bank carries one");

      /* ── an answer records its skill ── */
      const rec = await page.evaluate(() => {
        EN.State.data.topics = {};
        EN.State.recordAnswer("common", true, null, "1984", "Techniques");
        EN.State.recordAnswer("common", false, null, "1984", "Techniques");
        EN.State.recordAnswer("common", true, null, "1984", "Context");
        return { techniques: EN.State.data.topics["Techniques"],
                 context: EN.State.data.topics["Context"],
                 mastery: EN.State.topicMastery("Techniques") };
      });
      t.eq(rec.techniques, { seen: 2, correct: 1 }, "an answer is counted against its skill");
      t.eq(rec.context, { seen: 1, correct: 1 }, "  and only against its own");
      t.ok(rec.mastery > 0 && rec.mastery < 50,
           "  confidence-weighted, so two answers is not mastery (" + rec.mastery + "%)");

      /* Every mode contributes one, or the breakdown is only about multiple choice. */
      const wired = await page.evaluate(async () => {
        const fs = {};
        const src = await Promise.all(["quiz", "boss", "technique", "bandgrid", "markingdesk",
                                       "essayarch", "deconstruct"]
          .map(async n => [n, await (await fetch("js/games/" + n + ".js")).text()]));
        src.forEach(([n, text]) => {
          const m = /recordAnswer\([^)]*\)/.exec(text.replace(/\/\*[\s\S]*?\*\//g, ""));
          fs[n] = m ? m[0].split(",").length >= 5 : false;
        });
        return fs;
      });
      Object.keys(wired).forEach(n =>
        t.ok(wired[n], n + ".js passes a skill to recordAnswer"));

      /* ── typed answers feed the skill axis, and ONLY the skill axis ──
         recordAnswer also moves stats.answered, module mastery and text mastery, and a
         four-mark rubric is not the same event as a right-or-wrong multiple choice. So
         Layer C and the Section Paper go through recordSkill, which touches `topics` and
         nothing else — otherwise the breakdown was silent about every typed mode in the
         app, which is most of what a student's marks rest on. */
      const typed = await page.evaluate(() => {
        EN.State.data.topics = {};
        EN.State.data.stats.answered = 0;
        EN.State.data.modules = {};
        EN.State.data.texts = {};
        EN.State.recordSkill("Short answers", true);
        EN.State.recordSkill("Short answers", false);
        EN.State.recordSkill("Thesis statements", true);
        return { topics: EN.State.data.topics,
                 answered: EN.State.data.stats.answered,
                 modules: Object.keys(EN.State.data.modules).length,
                 texts: Object.keys(EN.State.data.texts).length };
      });
      t.eq(typed.topics["Short answers"], { seen: 2, correct: 1 },
           "a typed answer is recorded against its skill");
      t.eq(typed.answered, 0, "  and does not move the multiple-choice answer count");
      t.eq(typed.modules, 0, "  nor module mastery");
      t.eq(typed.texts, 0, "  nor text mastery");

      const typedWired = await page.evaluate(async () => {
        const out = {};
        for (const n of ["layerc", "paper"]) {
          const text = await (await fetch("js/games/" + n + ".js")).text();
          out[n] = /recordSkill\(/.test(text.replace(/\/\*[\s\S]*?\*\//g, ""));
        }
        return out;
      });
      t.ok(typedWired.layerc, "layerc.js records a skill for whichever mode is running");
      t.ok(typedWired.paper, "paper.js records one for every marked answer");

      /* ── every skill leads somewhere that trains it ── */
      const routes = await page.evaluate(() => {
        EN.Bank.allTopics().forEach(x =>
          EN.State.data.topics[x] = { seen: 20, correct: 9 });
        return EN.Bank.statsByTopic().map(s =>
          ({ name: s.name, route: s.route, inBank: s.inBank }));
      });
      t.atLeast(routes.length, 14, "the breakdown lists every skill once played");

      for (const r of routes) {
        await h.goto(page, r.route, 1600);
        const st = await page.evaluate(() => ({
          chars: document.querySelector("#view").textContent.trim().length,
          ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
        }));
        t.atLeast(st.chars, 300, r.name + " → " + r.route + " renders a screen");
        t.eq(st.ov, 0, "  with no overflow");
        /* The load-bearing one: a skill with no MCQ pool must not open a drill. */
        if (r.inBank === 0) {
          t.ok(r.route.indexOf("/game/drill/") < 0,
               "  and " + r.name + " has no MCQ pool, so it is not drilled");
        }
      }

      /* ── a topic drill really is restricted to that topic ── */
      const drilled = await page.evaluate(() => {
        const topic = "Form and structure";
        const drawn = EN.Bank.draw(15, { topic, adaptive: false });
        return { n: drawn.length, offTopic: drawn.filter(q => q.topic !== topic).length };
      });
      t.atLeast(drilled.n, 10, "a skill drill draws a full run");
      t.eq(drilled.offTopic, 0, "  containing nothing from another skill");

      /* ── the evidence floor ── */
      await h.goto(page, "/progress", 900);
      const thin = await page.evaluate(f => {
        EN.State.data.topics = { "Techniques": { seen: f - 1, correct: 0 },
                                 "Context": { seen: f - 1, correct: f - 1 } };
        EN.UI.handleRoute();
        return { diagnosed: !!document.querySelector("#view .next-up"),
                 rows: document.querySelectorAll("#view .mastery-pick").length };
      }, EVIDENCE);
      t.ok(!thin.diagnosed,
           "a skill with " + (EVIDENCE - 1) + " answers is not diagnosed as weak");
      t.atLeast(thin.rows, 2, "  though it is still listed, marked as too few to judge");

      const fat = await page.evaluate(() => {
        EN.State.data.topics = { "Techniques": { seen: 40, correct: 8 },
                                 "Context": { seen: 40, correct: 36 } };
        EN.UI.handleRoute();
        const card = document.querySelector("#view .next-up");
        return card ? card.textContent.replace(/\s+/g, " ") : null;
      });
      t.ok(!!fat, "with evidence behind it, the weakest skill is named");
      t.ok(fat && fat.indexOf("Techniques") >= 0, "  and it is the weak one, not the strong one");
      t.ok(fat && /8\/40/.test(fat), "  stated with the numbers it came from");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
