/* NAME THAT TECHNIQUE — the single most drillable skill in the course.
   ============================================================================
   Two directions:
     forward  a quote with a highlighted span → which technique operates there
     reverse  a technique → which of four quotes demonstrates it

   §9.7b is the whole design constraint. A quote contains metaphor AND alliteration AND
   a triadic structure at once, so "which technique is used here?" has several right
   answers and a student who picks one of them and is marked wrong will stop trusting the
   app — correctly. So:

     • distractors are drawn ONLY from techniques absent from the quote's `techniques`
       array, which lists everything genuinely present, not just the one being asked
     • the question always names the highlighted span, so it has one defensible answer
     • the effect is quoted afterwards, so the student learns the reasoning rather than
       the label

   Distractors are also drawn from the SAME category where possible (sound against
   sound, syntax against syntax), because "alliteration vs enjambment vs metonymy vs
   soliloquy" is a category-recognition question wearing a technique question's clothes.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.technique = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /** Build one forward question from a quote. Returns null if it can't be made cleanly. */
  function forward(q) {
    const present = q.techniques || [];
    if (!present.length || !q.span) return null;

    // Ask about the FIRST tagged technique, which authoring puts in span-relevant order.
    const answer = present[0];
    const g = EN.Bank.technique(answer);
    if (!g) return null;

    /* Every technique genuinely in this quote is excluded, which is what makes the
       question well formed. Same category first, then anything else. */
    const pool = EN.Bank.techniques().filter(t => !present.includes(t.id) && t.id !== answer);
    const sameCat = U.shuffle(pool.filter(t => t.cat === g.cat));
    const other = U.shuffle(pool.filter(t => t.cat !== g.cat));
    const distractors = sameCat.slice(0, 2).concat(other).slice(0, 3);
    if (distractors.length < 3) return null;

    const options = U.shuffle([g].concat(distractors));
    return {
      kind: "forward", quote: q,
      prompt: "Which technique operates in the highlighted phrase?",
      options: options.map(t => ({ id: t.id, label: t.name, def: t.def })),
      answerIndex: options.findIndex(t => t.id === answer),
      effect: q.effect, techniqueId: answer
    };
  }

  /** Build one reverse question: a technique, and four quotes of which one uses it. */
  function reverse(pool) {
    const withTech = pool.filter(q => (q.techniques || []).length);
    if (withTech.length < 6) return null;
    const q = U.pick(withTech);
    const answer = U.pick(q.techniques);
    const g = EN.Bank.technique(answer);
    if (!g) return null;

    // Decoy quotes must NOT contain the technique being asked about.
    const decoys = U.shuffle(pool.filter(x => x.id !== q.id && !(x.techniques || []).includes(answer)))
      .slice(0, 3);
    if (decoys.length < 3) return null;

    const options = U.shuffle([q].concat(decoys));
    return {
      kind: "reverse", quote: q, technique: g,
      prompt: "Which of these uses " + g.name.toLowerCase() + "?",
      options: options.map(x => ({ id: x.id, quote: x })),
      answerIndex: options.findIndex(x => x.id === q.id),
      effect: q.effect, techniqueId: answer
    };
  }

  function start(root, cfg) {
    const c = Object.assign({ modeId: "technique", title: "🔍 Name That Technique",
                              count: 12, texts: null }, cfg);
    const pool = EN.Bank.filterQuotes({ texts: c.texts, withSpan: false });
    const spanned = pool.filter(q => q.span);

    /* Build the run up front so a puzzle that cannot be made cleanly is skipped here
       rather than mid-run. Roughly 2:1 forward to reverse. */
    const items = [];
    const seen = new Set();
    let guard = 0;
    while (items.length < c.count && guard++ < c.count * 12) {
      const wantForward = items.length % 3 !== 2;
      let it = null;
      if (wantForward && spanned.length) {
        const q = U.pick(spanned);
        if (!seen.has("f" + q.id)) { it = forward(q); if (it) seen.add("f" + q.id); }
      } else {
        it = reverse(pool);
        if (it && seen.has("r" + it.quote.id + it.techniqueId)) it = null;
        else if (it) seen.add("r" + it.quote.id + it.techniqueId);
      }
      if (it) items.push(it);
    }

    if (!items.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🔍" }),
        U.el("p", { text: "Not enough tagged quotes for this selection yet." })
      ]));
      return;
    }

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    let idx = 0, correct = 0, streak = 0, best = 0, xp = 0, coins = 0, penalty = 0;
    let shownAt = 0, minRead = 800, rushed = 0, finished = false;

    /* The definition peek is a latching crutch (addendum C3): the cost is set the moment
       it is first used and never cleared, so switching it off before submitting cannot
       refund it. Named on the results screen so the charge is visible. */
    const peek = UI.crutch("Definitions shown", 0.22);

    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const scoreChip = UI.chip("0 XP"), streakChip = UI.chip("Streak 0");
    shell.meta.appendChild(scoreChip); shell.meta.appendChild(streakChip);

    const stage = U.el("div");
    const peekBtn = U.el("button", { class: "pu", type: "button" }, [
      U.el("span", { text: "📖" }),
      U.el("span", { text: "Show definitions" }),
      U.el("span", { class: "pu-n", text: "−22% XP" })
    ]);
    peekBtn.addEventListener("click", () => {
      peek.use();
      peekBtn.disabled = true;
      peekBtn.querySelector("span:nth-child(2)").textContent = "Definitions on (charged)";
      EN.Sound.puInsight();
      render();
    });
    shell.body.appendChild(stage);
    shell.body.appendChild(U.el("div", { class: "powerups" }, [peekBtn]));

    UI.onLeave(() => document.removeEventListener("keydown", onKey));
    document.addEventListener("keydown", onKey);
    function onKey(e) {
      if (finished) return;
      const n = "1234".indexOf(e.key);
      const btns = U.$$(".choice", stage);
      if (n >= 0 && btns[n] && !btns[n].disabled) btns[n].click();
      if (e.key === "Enter") { const nx = U.$(".js-next", stage); if (nx) nx.click(); }
    }

    const multiplier = () => Math.min(3, 1 + Math.floor(streak / 5) * 0.5);

    function render() {
      stage.innerHTML = "";
      const it = items[idx];
      const card = U.el("div", { class: "qcard" });

      card.appendChild(U.el("div", { class: "qtag" }, [
        U.el("span", { class: "chip", text: `Q${idx + 1} / ${items.length}` }),
        U.el("span", { class: "chip", text: it.kind === "forward" ? "Quote → technique" : "Technique → quote" }),
        U.el("span", { class: "chip", text: it.quote.textTitle })
      ]));

      if (it.kind === "forward") {
        card.appendChild(U.quoteBlock(it.quote));
      } else {
        card.appendChild(U.el("div", { class: "reader", style: "margin-bottom:4px" }, [
          U.el("div", { class: "tech-name", text: it.technique.name }),
          peek.used() ? U.el("div", { class: "tech-def", text: it.technique.def }) : null
        ]));
      }
      card.appendChild(U.el("div", { class: "qtext", text: it.prompt }));

      const wrap = U.el("div", { class: "choices" });
      const btns = [];
      it.options.forEach((opt, i) => {
        const body = it.kind === "forward"
          ? U.el("span", {}, [
              U.el("b", { text: opt.label }),
              peek.used() ? U.el("span", { class: "tiny muted", text: " — " + opt.def }) : null
            ])
          : U.el("span", { class: "vault-row-q", html: U.highlight(opt.quote.text, opt.quote.span) });
        const b = U.el("button", { class: "choice", type: "button" }, [
          U.el("span", { class: "choice-key", text: EN.QuizCore.KEYS[i] }), body
        ]);
        b.addEventListener("click", () => answer(i, b));
        btns.push(b);
        wrap.appendChild(b);
      });
      card.appendChild(wrap);
      stage.appendChild(card);

      shownAt = performance.now();
      minRead = UI.readTimeFor(
        (it.kind === "forward" ? it.quote.text : it.options.map(o => o.quote.text).join(" ")) +
        " " + it.prompt);

      function answer(chosen, btn) {
        const ok = chosen === it.answerIndex;
        btns.forEach((b, i) => {
          b.disabled = true;
          if (i === it.answerIndex) b.classList.add("correct");
          else if (i === chosen) b.classList.add("wrong");
        });
        S.recordAnswer(it.quote.mod, ok, null, it.quote.textId);
        const tooFast = performance.now() - shownAt < minRead;

        if (ok) {
          correct++; streak++; best = Math.max(best, streak);
          S.noteStreak(best); S.bump("techniquesNamed");
          const gain = tooFast ? 0 : Math.round(14 * multiplier());
          if (tooFast) rushed++;
          xp += gain; coins += tooFast ? 0 : 3;
          EN.Sound.correct();
          if (tooFast) UI.toast({ icon: "⏱️", kind: "bad", text: "Too fast to have read that — no XP." });
          const r = btn.getBoundingClientRect();
          EN.FX.pop(r.right - 22, r.top + r.height / 2);
          if (gain) EN.FX.floatText(r.right - 56, r.top - 4, "+" + gain);
          S.progressDaily("technique", 1);
        } else {
          streak = 0; penalty += 8;
          EN.Sound.wrong(); EN.FX.shake();
        }
        scoreChip.textContent = Math.max(0, xp - penalty) + " XP";
        streakChip.textContent = "Streak " + streak;

        /* The reasoning, not the label. This is the whole pedagogical point of the mode:
           the effect explains WHY that technique in that span produces that reading. */
        const fb = U.el("div", { class: "feedback " + (ok ? "ok" : "no") }, [
          U.el("div", {}, [
            U.el("b", { text: ok ? "Correct — " : "Not quite — " }),
            U.el("b", { text: EN.Bank.techniqueName(it.techniqueId) }),
            U.el("span", { text: ". " + (it.effect || "") })
          ]),
          U.el("div", { class: "tiny muted", style: "margin-top:8px",
            text: "Also present in this quote: " +
                  (it.quote.techniques || []).slice(1).map(EN.Bank.techniqueName).join(", ") || "" })
        ]);
        const isLast = idx >= items.length - 1;
        const next = U.el("button", { class: "btn btn-primary js-next",
          text: isLast ? "See results" : "Next →",
          on: { click: () => { if (isLast) return finish(); idx++; EN.Sound.page(); render(); } } });
        fb.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [next]));
        card.appendChild(fb);
        next.focus();
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      document.removeEventListener("keydown", onKey);
      const perfect = correct === items.length && items.length >= 5;
      if (perfect) { S.bump("perfectRuns"); EN.Sound.perfect(); }
      const newBest = S.recordScore(c.modeId, correct);
      const got = UI.award({
        xp: Math.max(0, xp - penalty), bonus: S.streakBonus(),
        accuracy: correct / items.length, coins: coins + (perfect ? 25 : 0),
        crutchCost: UI.crutchCost([peek])
      });
      UI.results({
        title: "Technique run complete",
        correct, total: items.length, xp: got.xp, coins: got.coins, newBest,
        extraStats: [
          ["Best streak", best],
          ["Wrong", "−" + penalty + " XP"],
          peek.used() ? ["Definitions", "used"] : (rushed ? ["Rushed", rushed] : ["Multiplier", "×" + multiplier()])
        ],
        note: peek.used() ? "Definitions were shown, so this run paid 22% less." : null,
        onAgain: () => UI.handleRoute()
      });
    }

    render();
  }

  return { start, forward, reverse };
})();
