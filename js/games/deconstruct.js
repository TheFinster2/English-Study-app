/* QUESTION DECONSTRUCTION — procedurally assemble essay questions, then ask what is
   actually being demanded.
   ============================================================================
   §9.9 applied to a generator: the rubric verb and the intended demand are picked FIRST,
   and the question wording is generated around them. Generating a question and then
   deciding what it asks produces questions with two defensible answers.

   Difficulty contract (§9.10), asserted in tests/validate.js:
     diff 1  — one rubric element in play (the verb), three distractor verbs
     diff 2  — verb + module concept
     diff 3  — verb + concept + the off-task trap
   Every generated item names exactly one correct answer, and the distractors come from
   the same closed sets as the key, so no distractor can accidentally also be right.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.deconstruct = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  const DIRECTIVES = [
    "in your response, refer to your prescribed text",
    "support your response with detailed reference to the text",
    "in your answer, refer to at least two of the text's techniques",
    "make detailed reference to your prescribed text and ONE related text"
  ];

  /**
   * Generate one item.
   * The verb, concept and asked-about element are chosen before the wording exists.
   */
  function generate(diff, rng) {
    const pick = arr => arr[Math.floor(rng() * arr.length)];

    // 1. Decide the answer.
    const verb = pick(EN.DATA.rubricVerbs);
    const modConcept = pick(EN.DATA.moduleConcepts);
    const concept = pick(modConcept.keyTerms);
    const directive = pick(DIRECTIVES);
    const asked = diff >= 3 ? pick(["verb", "concept", "offtask"])
                : diff === 2 ? pick(["verb", "concept"])
                : "verb";

    // 2. Generate the wording around it.
    const question = capitalise(verb.verb) + " the way the composer represents " +
                     concept + " in your prescribed text. " + capitalise(directive) + ".";

    if (asked === "verb") {
      const others = U.seededShuffle(EN.DATA.rubricVerbs.filter(v => v.id !== verb.id), rng).slice(0, 3);
      const options = U.seededShuffle([verb].concat(others), rng);
      return {
        diff, question, elements: diff,
        prompt: "Which rubric verb governs this question?",
        options: options.map(v => ({ label: v.verb, sub: v.demands })),
        answerIndex: options.findIndex(v => v.id === verb.id),
        why: verb.verb + " demands: " + verb.demands + " " + verb.tell,
        verb, concept, asked
      };
    }

    if (asked === "concept") {
      /* Distractor concepts come from OTHER modules, so none of them can plausibly be
         the one this question names. */
      const otherTerms = EN.DATA.moduleConcepts
        .filter(m => m.mod !== modConcept.mod)
        .flatMap(m => m.keyTerms);
      const others = U.seededShuffle(otherTerms.filter(t => t !== concept), rng).slice(0, 3);
      const options = U.seededShuffle([concept].concat(others), rng);
      return {
        diff, question, elements: diff,
        prompt: "Which module concept is this question asking about?",
        options: options.map(t => ({ label: t })),
        answerIndex: options.indexOf(concept),
        why: "The question names '" + concept + "', which belongs to " + modConcept.title +
             ". " + modConcept.misread,
        verb, concept, asked
      };
    }

    // asked === "offtask": what would a response that ignored the verb look like?
    const others = U.seededShuffle(EN.DATA.rubricVerbs.filter(v => v.id !== verb.id), rng)
      .slice(0, 3).map(v => v.offTask);
    const options = U.seededShuffle([verb.offTask].concat(others), rng);
    return {
      diff, question, elements: diff,
      prompt: "What would an off-task response to this question look like?",
      options: options.map(t => ({ label: t })),
      answerIndex: options.indexOf(verb.offTask),
      why: "Because the verb is '" + verb.verb + "': " + verb.demands + " " + verb.tell,
      verb, concept, asked
    };
  }

  const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);

  function start(root, cfg) {
    const c = Object.assign({ modeId: "deconstruct", title: "🎯 Question Deconstruction",
                              count: 8, diff: 0 }, cfg);
    /* Seeded from the day plus a session nonce, so a run is reproducible for debugging
       while not being identical every time the student replays. */
    const rng = U.seededRandom(U.hash(U.dayKey() + ":" + Math.floor(Date.now() / 60000)));
    const items = [];
    for (let i = 0; i < c.count; i++) {
      const diff = c.diff || (i < 2 ? 1 : i < 5 ? 2 : 3);
      items.push(generate(diff, rng));
    }

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    let idx = 0, correct = 0, xp = 0, coins = 0, penalty = 0, finished = false;
    let shownAt = 0, minRead = 800, rushed = 0;

    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const progChip = UI.chip("1 / " + items.length), scoreChip = UI.chip("0 XP");
    shell.meta.appendChild(progChip); shell.meta.appendChild(scoreChip);
    const stage = U.el("div");
    shell.body.appendChild(stage);

    function render() {
      stage.innerHTML = "";
      const it = items[idx];
      progChip.textContent = (idx + 1) + " / " + items.length;

      const card = U.el("div", { class: "qcard" }, [
        U.el("div", { class: "qtag" }, [
          U.el("span", { class: "chip", text: "Generated question" }),
          U.el("span", { class: "chip", text: "★".repeat(it.diff) }),
          U.el("span", { class: "chip", text: it.elements + " element" + (it.elements === 1 ? "" : "s") })
        ]),
        U.el("div", { class: "reader", style: "margin-bottom:14px" }, [
          U.el("div", { class: "prose", style: "font-size:16px" }, [U.el("p", { text: it.question })])
        ]),
        U.el("div", { class: "qtext", text: it.prompt })
      ]);

      const wrap = U.el("div", { class: "choices" });
      const btns = [];
      it.options.forEach((opt, i) => {
        const b = U.el("button", { class: "choice", type: "button" }, [
          U.el("span", { class: "choice-key", text: EN.QuizCore.KEYS[i] }),
          U.el("span", {}, [
            U.el("b", { text: opt.label }),
            opt.sub ? U.el("span", { class: "tiny muted", text: " — " + opt.sub }) : null
          ])
        ]);
        b.addEventListener("click", () => answer(i, b));
        btns.push(b);
        wrap.appendChild(b);
      });
      card.appendChild(wrap);
      stage.appendChild(card);
      shownAt = performance.now();
      minRead = UI.readTimeFor(it.question + " " + it.prompt + " " + it.options.map(o => o.label).join(" "));

      function answer(chosen, btn) {
        const ok = chosen === it.answerIndex;
        btns.forEach((b, i) => {
          b.disabled = true;
          if (i === it.answerIndex) b.classList.add("correct");
          else if (i === chosen) b.classList.add("wrong");
        });
        const tooFast = performance.now() - shownAt < minRead;
        S.recordAnswer(null, ok, null, null);
        S.bump("deconstructions");

        if (ok) {
          correct++;
          const gain = tooFast ? 0 : 10 + it.diff * 3;
          if (tooFast) rushed++;
          xp += gain; coins += tooFast ? 0 : 2;
          EN.Sound.correct();
          const r = btn.getBoundingClientRect();
          EN.FX.pop(r.right - 22, r.top + r.height / 2);
          if (gain) EN.FX.floatText(r.right - 54, r.top - 4, "+" + gain);
          S.progressDaily("deconstruct", 1);
        } else {
          penalty += 7;
          EN.Sound.wrong(); EN.FX.shake();
        }
        scoreChip.textContent = Math.max(0, xp - penalty) + " XP";

        const fb = U.el("div", { class: "feedback " + (ok ? "ok" : "no") }, [
          U.el("div", {}, [U.el("b", { text: ok ? "Correct. " : "Not quite. " }), U.el("span", { text: it.why })]),
          U.el("div", { class: "tiny muted", style: "margin-top:8px",
            text: "Verb: " + it.verb.verb + " · Concept: " + it.concept })
        ]);
        const isLast = idx >= items.length - 1;
        const next = U.el("button", { class: "btn btn-primary js-next",
          text: isLast ? "See results" : "Next question →",
          on: { click: () => { if (isLast) return finish(); idx++; EN.Sound.page(); render(); } } });
        fb.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [next]));
        card.appendChild(fb);
        next.focus();
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      const perfect = correct === items.length;
      if (perfect) { S.bump("perfectRuns"); EN.Sound.perfect(); }
      const newBest = S.recordScore(c.modeId, correct);
      const got = UI.award({ xp: Math.max(0, xp - penalty), bonus: S.streakBonus(),
                             accuracy: correct / items.length, coins });
      UI.results({
        title: "Deconstruction complete",
        correct, total: items.length, xp: got.xp, coins: got.coins, newBest,
        extraStats: [["Wrong", "−" + penalty + " XP"], ["Rushed", rushed]],
        onAgain: () => UI.handleRoute()
      });
    }

    render();
  }

  return { start, generate, DIRECTIVES };
})();
