/* PLAY — click through every mode and a boss, and check nothing throws or ejects you.
   ============================================================================
   Two reported bugs were of this shape and neither would have been caught by a route
   render check:

     • a clock that kept running through the feedback panel, so a run could end while the
       student was reading the explanation of the answer they had just given, dropping them
       into a results modal mid-sentence. It reads as being thrown out of the app.
     • a banner button that navigated to Settings, which destroyed the run in progress.

   So the assertion is not "did it render" but "am I still where I chose to be". Any route
   change the test did not ask for is a failure, and so is any thrown error along the way.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

const MODES = ["rapid", "technique", "cloze", "marking", "essay", "quotematch",
               "bandgrid", "deconstruct", "survival", "sayit", "thesis", "rewrite",
               "drill/all", "rehab"];

/* In priority order — the advance button first so a run progresses rather than the test
   re-answering the same card forever. */
const CONTROLS = [".js-next:not([disabled])", ".js-submit:not([disabled])",
                  ".choice:not([disabled])", ".mcard:not([disabled])",
                  ".ea-card:not([disabled])", ".md-band:not(.chosen)",
                  ".bg-cell:not(.picked)", "#view .btn-primary:not([disabled])"];

module.exports = {
  name: "play",
  needsBrowser: true,
  about: "play every mode; nothing throws, nothing ejects you",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      for (const mode of MODES) {
        const page = await h.open("/home");
        const root = "#/game/" + mode.split("/")[0];
        /* Mistake Rehab draws from questions the student has got wrong, so on a fresh save
           it correctly shows an empty state whose button leads back to /play. Seed one. */
        if (mode === "rehab") {
          await page.evaluate(() => {
            const q = EN.Bank.all()[0];
            for (let i = 0; i < 6; i++) {
              const x = EN.Bank.all()[i];
              EN.State.recordAnswer(x.mod, false, x.id, x.text);
            }
            EN.State.save();
            void q;
          });
        }
        await h.goto(page, "/game/" + mode, 700);

        let clicks = 0, ejected = null, results = false;
        for (let i = 0; i < 60; i++) {
          const state = await page.evaluate(() => ({
            hash: location.hash,
            /* The RESULTS modal specifically. "Any modal is open" also matches the Layer C
               download dialog, which made three modes look finished after two clicks. */
            modal: !!document.querySelector("#modal-root .results-modal"),
            otherModal: !document.getElementById("modal-root").hidden &&
                        !document.querySelector("#modal-root .results-modal"),
            empty: document.getElementById("view").childNodes.length === 0
          }));
          if (state.empty) { ejected = "blank screen after " + clicks + " clicks"; break; }
          if (!state.hash.startsWith(root)) {
            ejected = "route left to " + state.hash + " after " + clicks + " clicks";
            break;
          }
          if (state.modal) { results = true; break; }      // reached the results — a clean end
          /* Any other dialog belongs to the mode; dismiss it and carry on rather than
             treating it as the end of the run. */
          if (state.otherModal) {
            await page.evaluate(() => {
              const b = document.querySelector("#modal-root .btn-ghost, #modal-root .btn-primary");
              if (b) b.click();
            });
            await page.waitForTimeout(200);
            continue;
          }

          /* Fill any text field before pressing anything, so a submit has something
             to submit. */
          await page.evaluate(() => {
            document.querySelectorAll("input.cloze-blank").forEach(n => {
              if (n.value) return;
              n.value = "word";
              n.dispatchEvent(new Event("input", { bubbles: true }));
            });
            const ta = document.querySelector("textarea:not([disabled])");
            if (ta && !ta.value) {
              ta.value = "Orwell positions the reader to reconsider the claim, because the " +
                         "structure withholds the ground on which an objection would stand.";
              ta.dispatchEvent(new Event("input", { bubbles: true }));
            }
          });

          const hit = await page.evaluate(sels => {
            for (const s of sels) {
              const el = document.querySelector(s);
              if (el) { el.click(); return s; }
            }
            return null;
          }, CONTROLS);
          if (!hit) break;
          clicks++;
          await page.waitForTimeout(190);
        }

        t.ok(!ejected, mode + ": stayed in the mode" + (ejected ? " — " + ejected : ""));
        t.atLeast(clicks, 3, mode + ": was playable for at least a few steps");
        t.eq(page.errors.slice(0, 3), [], mode + ": no thrown or console errors while playing");
        t.note("  " + mode.padEnd(12) + clicks + " clicks" + (results ? ", reached results" : ""));
        await page.close();
      }

      /* ── the clock must stop while the feedback is up ─────────
         Rapid Fire's did not, which is the "I answered and got kicked" bug. Measured
         rather than inspected: read the timer, answer, wait, read it again. */
      {
        const page = await h.open("/home");
        await h.goto(page, "/game/rapid", 800);
        const read = () => page.$eval(".timer-ring", n => n.textContent.replace(/[^\d:]/g, ""));
        const secs = s => { const [m, x] = s.split(":"); return (+m) * 60 + (+x); };
        const t0 = await read();
        await page.waitForTimeout(2300);
        const t1 = await read();
        t.ok(secs(t0) > secs(t1), "the clock runs while the question is on screen");

        await page.click(".choice:not([disabled])");
        await page.waitForTimeout(300);
        const t2 = await read();
        await page.waitForTimeout(3500);
        const t3 = await read();
        t.eq(t2, t3, "the clock is frozen while the feedback panel is up");
        t.ok(await page.$eval(".timer-ring", n => n.classList.contains("paused")),
             "the frozen clock says so, rather than looking broken");

        await page.click(".js-next:not([disabled])");
        await page.waitForTimeout(2300);
        const t4 = await read();
        t.ok(secs(t4) < secs(t3), "the clock resumes on Next");
        t.note("  clock " + t0 + " → " + t1 + " (running) → held at " + t3 + " → " + t4 + " (resumed)");
        await page.close();
      }

      /* ── a boss duel, including the Party's rewrite round ─────
         The Party used to move the key to a different option, so answering truthfully was
         marked wrong. Play it correctly by looking the key up in the bank, and assert that
         the true answer is the one that scores — including on a falsified round. */
      {
        const page = await h.open("/home");
        await h.goto(page, "/boss/party", 900);
        let rounds = 0, sawRewrite = false, truthPunished = false, ejected = null;

        for (let i = 0; i < 14; i++) {
          const state = await page.evaluate(() => {
            const banner = document.querySelector("#view .feedback.no");
            const btns = Array.from(document.querySelectorAll(".choice"));
            const labels = btns.map(b => Array.from(b.childNodes).slice(1).map(n => n.textContent).join("").trim());
            const q = EN.Bank.all().find(x => x.choices.length === labels.length &&
              x.choices.every(c => labels.some(l => l.startsWith(c.slice(0, 30)))));
            return {
              hash: location.hash,
              modal: !document.getElementById("modal-root").hidden,
              isRewrite: !!banner && /record has been corrected/i.test(banner.textContent),
              claim: (document.querySelector(".party-claim-text") || {}).textContent || null,
              trueIdx: q ? labels.findIndex(l => l.startsWith(q.choices[q.a].slice(0, 30))) : -1,
              live: btns.filter(b => !b.disabled).length
            };
          });
          if (state.modal) break;
          if (!state.hash.startsWith("#/boss")) { ejected = state.hash; break; }
          if (!state.live) {
            const next = await page.$(".js-next:not([disabled])");
            if (!next) break;
            await next.click();
            await page.waitForTimeout(420);
            continue;
          }
          if (state.trueIdx < 0) break;                    // could not resolve the key

          /* Past the rush floor, so a correct answer actually lands as a hit. */
          await page.waitForTimeout(4600);
          await page.evaluate(i => document.querySelectorAll(".choice")[i].click(), state.trueIdx);
          await page.waitForTimeout(520);
          const marked = await page.evaluate(i => {
            const b = document.querySelectorAll(".choice")[i];
            return { wrong: b.classList.contains("wrong"), right: b.classList.contains("correct") };
          }, state.trueIdx);
          if (state.isRewrite) {
            sawRewrite = true;
            t.ok(!!state.claim, "the Party names the answer it claims you gave");
            if (marked.wrong || !marked.right) truthPunished = true;
          }
          if (marked.wrong) truthPunished = truthPunished || state.isRewrite;
          rounds++;
        }
        t.ok(!ejected, "boss: stayed in the duel" + (ejected ? " — left to " + ejected : ""));
        t.atLeast(rounds, 3, "boss: rounds played");
        t.ok(sawRewrite, "boss: the Party's rewrite gimmick actually fires within a duel");
        t.ok(!truthPunished, "boss: the genuinely correct answer is rewarded on a falsified round");
        t.eq(page.errors.slice(0, 3), [], "boss: no thrown or console errors");
        t.note("  party " + rounds + " rounds, rewrite round seen: " + sawRewrite);
        await page.close();
      }
    } finally {
      await h.close();
    }
  }
};
