/* THE SECTION PAPER — four short answers, one clock, no feedback until the end.
   ============================================================================
   The app had fourteen modes and not one of them rehearsed the thing Paper 1 Section I
   actually tests. Say It In One marks each sentence the moment you submit it, which is the
   right shape for learning a move and the wrong shape for sitting an exam: in an exam you
   budget one block of time across several questions, you cannot see whether the last answer
   landed before committing to the next, and nobody tells you anything until it is over.

   Those three constraints are the whole mode:

     • ONE clock for the section, not one per question. Four minutes a question, spent
       however the student likes. Running out submits what is there.
     • Free navigation. Answer in any order, go back, change your mind. Every answer is
       held until the paper is submitted.
     • NO marking until submit. Then everything is marked at once and reported together,
       which is also the only honest place to put it — a mark you can see before answering
       the next question is a hint.

   Marking is EN.Mark.check, the same Layer C path as every other typed answer, and the
   payout goes through State.freeTextEligible / markFreeText, so a paper cannot pay twice
   for a prompt Say It In One already paid for today. Nothing here invents its own marking
   and nothing here invents its own economy.

   That is what makes the mode safe to add rather than a new farm: the cap is per PROMPT per
   day, not per run, so the daily ceiling across the whole app is unchanged no matter which
   mode a student reaches a prompt through. And UI.results only DISPLAYS a payout — UI.award
   is what grants one. The first version of this file called the former and not the latter,
   and showed a student XP that never reached their save.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.paper = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /* Real Section I is about 45 minutes for 20 marks across four or five questions of
     rising value. This app marks every short answer out of the same four criteria, so it
     does not pretend to award 2s and 5s it cannot justify — four questions, four marks
     each, sixteen on the paper, and four minutes each to spend as you like. */
  const PER_QUESTION_SEC = 240;
  const DEFAULT_COUNT = 4;

  const VERDICT_WORD = { nailed: "Nailed it", close: "Circling it",
                         notYet: "Not yet", unavailable: "Not marked" };

  /** Four prompts that are not all about the same thing. */
  function pickPrompts(count, textId) {
    let pool = EN.Bank.activeFreeText().filter(p => p.mode === "sayit");
    if (textId) {
      const own = pool.filter(p => p.text === textId);
      if (own.length >= count) pool = own;
    }
    /* One per domain where possible: four questions on the same conceit is a drill, not a
       section. Falls back to filling from whatever is left rather than returning short. */
    const byDomain = new Map();
    U.shuffle(pool).forEach(p => {
      const k = p.domain || p.id;
      if (!byDomain.has(k)) byDomain.set(k, p);
    });
    const spread = U.shuffle(Array.from(byDomain.values()));
    const out = spread.slice(0, count);
    if (out.length < count) {
      const have = new Set(out.map(p => p.id));
      out.push(...U.shuffle(pool).filter(p => !have.has(p.id)).slice(0, count - out.length));
    }
    return out;
  }

  function start(root, cfg) {
    /* `seconds` overrides the section length. A real knob rather than a test hook: the
       pace of a section is the thing a student might want to vary, and the suite needs a
       three-second paper to check that running out submits what is there. */
    const c = Object.assign({ count: DEFAULT_COUNT, text: null, timed: true,
                              seconds: null, prompts: null }, cfg);
    /* An explicit set is allowed so a caller can build a paper on one text or one module
       rather than a spread — and so the suite can sit the same questions twice. */
    const prompts = (c.prompts && c.prompts.length) ? c.prompts.slice(0, c.count)
                                                    : pickPrompts(c.count, c.text);

    const shell = UI.gameShell("📄 Section I", { confirmExit: true });
    root.appendChild(shell.root);

    if (prompts.length < 2) {
      shell.body.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "📄" }),
        U.el("p", { text: "Not enough short-answer prompts for your texts to build a section." })
      ]));
      return;
    }

    const answers = prompts.map(() => "");
    let idx = 0, submitted = false;
    let secondsLeft = c.seconds || prompts.length * PER_QUESTION_SEC;
    let elapsed = 0, tickId = null;
    /* Declared up here rather than beside render(): function declarations hoist and `let`
       does not, so render() running during setup hit the temporal dead zone. */
    let area = null;

    const markChip = UI.chip("— / " + prompts.length * 4);
    const doneChip = UI.chip("0 / " + prompts.length + " answered");
    const clockChip = U.el("span", { class: "timer-ring", "aria-live": "off", role: "timer",
                                     text: U.fmtTime(secondsLeft) });
    [doneChip, markChip].forEach(n => shell.meta.appendChild(n));
    if (c.timed) shell.meta.appendChild(clockChip);

    shell.body.appendChild(U.el("div", { class: "notice" }, [
      U.el("b", { text: "One clock for the whole section. " }),
      U.el("span", { text: "Four questions, four marks each. Answer them in any order and " +
        "change your mind as often as you like — nothing is marked until you submit the " +
        "paper, and then all of it is marked at once." })
    ]));

    const marker = UI.markerBanner();
    shell.body.appendChild(marker.node);

    /* The question strip: which question you are on, which are answered, and a way to any
       of them. In an exam the ability to leave one and come back is half the skill. */
    const strip = U.el("div", { class: "paper-strip" });
    shell.body.appendChild(strip);

    const stage = U.el("div");
    shell.body.appendChild(stage);

    /* Sticky from the first question, not once the paper is complete: Next is pressed on
       every question and Submit is available at any point, so both have to stay reachable.
       Without it the nav and the submit sat under the floating bottom bar — the same bug
       four other modes had already been fixed for. */
    const bar = U.el("div", { class: "paper-actions stuck-bar" });
    shell.body.appendChild(bar);
    /* Scrollable room BELOW the bar. Without it the page ends at the bar, so the bottom of
       the textarea stays under it however far you scroll — sticky content needs somewhere
       for the thing it covers to move to. */
    shell.body.appendChild(U.el("div", { style: "height:96px", "aria-hidden": "true" }));

    if (c.timed) {
      tickId = setInterval(() => {
        secondsLeft--;
        elapsed++;
        clockChip.textContent = U.fmtTime(Math.max(0, secondsLeft));
        clockChip.classList.toggle("low", secondsLeft <= 60);
        if (secondsLeft <= 0) { clearInterval(tickId); tickId = null; finish(true); }
      }, 1000);
    } else {
      tickId = setInterval(() => { elapsed++; }, 1000);
    }
    UI.onLeave(() => { if (tickId) clearInterval(tickId); });

    S.markMode("paper");
    S.touchStreak();
    EN.Sound.gameStart();
    paintStrip();
    render();

    function answeredCount() { return answers.filter(a => a.trim()).length; }

    function paintBar() {
      bar.innerHTML = "";
      bar.appendChild(U.el("button", { class: "btn btn-ghost btn-sm", "aria-label": "Previous question",
        text: "←", disabled: idx === 0 ? "disabled" : null,
        on: { click: () => { keep(); idx--; paintStrip(); render(); } } }));
      bar.appendChild(U.el("button", { class: "btn btn-primary btn-sm js-next",
        text: idx === prompts.length - 1 ? "Question 1 →" : "Next →",
        on: { click: () => { keep(); idx = (idx + 1) % prompts.length; paintStrip(); render(); } } }));
      bar.appendChild(U.el("button", { class: "btn btn-ghost btn-sm js-submit",
        text: "Submit", on: { click: () => confirmSubmit() } }));
    }

    function paintStrip() {
      strip.innerHTML = "";
      prompts.forEach((p, i) => {
        const b = U.el("button", {
          class: "paper-pip" + (i === idx ? " on" : "") + (answers[i].trim() ? " done" : ""),
          type: "button", "aria-label": "Question " + (i + 1) +
            (answers[i].trim() ? ", answered" : ", blank"), text: String(i + 1) });
        b.addEventListener("click", () => { keep(); idx = i; paintStrip(); render(); });
        strip.appendChild(b);
      });
      doneChip.textContent = answeredCount() + " / " + prompts.length + " answered";
    }

    function keep() { if (area) answers[idx] = area.value; }

    function render() {
      if (submitted) return;
      stage.innerHTML = "";
      const p = prompts[idx];

      const card = U.el("div", { class: "qcard" });
      card.appendChild(U.el("div", { class: "qtag" }, [
        U.el("span", { class: "chip", text: "Question " + (idx + 1) + " of " + prompts.length }),
        U.el("span", { class: "chip", text: "4 marks" }),
        U.el("span", { class: "chip", text: EN.Bank.moduleLabel(p.mod) })
      ]));
      card.appendChild(U.el("div", { class: "prose", style: "font-size:17px", text: p.prompt }));

      /* The quote the question is about, with its citation, exactly as every other screen
         shows one. */
      const q = p.quote ? EN.Bank.quoteById(p.quote) : null;
      if (q) card.appendChild(U.quoteBlock(q));
      stage.appendChild(card);

      area = U.el("textarea", { class: "tin", rows: "5",
        "aria-label": "Your answer to question " + (idx + 1),
        placeholder: "One sentence. Name the move, say what it does." });
      area.value = answers[idx];
      area.addEventListener("input", () => {
        answers[idx] = area.value;
        paintStrip();
      });
      stage.appendChild(area);

      paintBar();
      area.focus();
    }

    function confirmSubmit() {
      keep();
      const blank = prompts.length - answeredCount();
      if (!blank) return finish(false);
      UI.confirmDialog("Submit with " + blank + " unanswered?",
        "A blank answer scores nothing, and once the paper is submitted you cannot go back " +
        "to it. The model answers will be shown either way.",
        () => finish(false), "Submit");
    }

    /* ── marking ──
       Every answer at once, sequentially, because the model is one worker and firing four
       embeddings at it in parallel just queues them somewhere less visible. */
    async function finish(ranOut) {
      if (submitted) return;
      submitted = true;
      keep();
      if (tickId) { clearInterval(tickId); tickId = null; }
      bar.remove();
      strip.remove();
      /* The banner is advice about answering. On the report it is noise, and if the model
         came up late it is also stale. */
      marker.node.remove();

      stage.innerHTML = "";
      const status = UI.announce(U.el("p", { class: "muted", text: "Marking the paper…" }));
      stage.appendChild(status);
      if (ranOut) EN.Sound.carriage();

      const results = [];
      for (let i = 0; i < prompts.length; i++) {
        const p = prompts[i], given = answers[i].trim();
        status.textContent = "Marking question " + (i + 1) + " of " + prompts.length + "…";
        if (!given) { results.push({ p, given, blank: true, total: 0, outOf: 4 }); continue; }
        const q = p.quote ? EN.Bank.quoteById(p.quote) : null;
        let res;
        try {
          res = await EN.Mark.check(given, {
            layer: "C", answers: p.answers,
            nearMiss: (p.nearMiss || []).concat(p.weak ? [p.weak] : []),
            prompt: p.prompt, threshold: p.threshold, domain: p.domain,
            text: p.text, techniques: q ? q.techniques : null, quoteText: q ? q.text : null
          });
        } catch (err) {
          /* The same first-class fallback Say It In One uses. A throw here would otherwise
             strand a submitted paper with nothing on screen, which is the worst moment in
             the mode to show nothing. */
          console.warn("Paper marking threw; falling back to unavailable.", err);
          res = { verdict: "unavailable", total: 0, outOf: 4, flags: ["threw"], marks: [],
                  exemplars: p.answers,
                  feedback: "Something went wrong marking that, so it has not been scored." };
        }
        results.push(Object.assign({ p, given, blank: false }, res));
      }

      report(results, ranOut);
    }

    function report(results, ranOut) {
      const marked = results.filter(r => !r.blank && r.verdict !== "unavailable");
      const got = marked.reduce((n, r) => n + (r.total || 0), 0);
      const outOf = results.length * 4;
      markChip.textContent = got + " / " + outOf;

      /* Payout, on the same terms as every other typed answer: the day's first scored
         attempt at each prompt, and never for a response already paid for elsewhere. */
      let xp = 0, coins = 0, paid = 0;
      results.forEach(r => {
        if (r.blank || r.verdict === "unavailable") return;
        /* Counted because it was MARKED, not because it was paid. These two bumps sat
           inside the payout gate, so an answer to a prompt already scored today was marked,
           reported and then not counted — Say It In One bumps them unconditionally and the
           two modes have to agree, or the statistic means something different depending on
           which screen you were on. */
        S.bump("sentencesMarked");
        if (r.verdict === "nailed") S.bump("sentencesNailed");
        S.recordSkill("Short answers", (r.total || 0) >= 3);

        const elig = S.freeTextEligible(r.p.id, r.given);
        if (!elig.ok) { r.notPaid = elig.why; return; }
        S.markFreeText(r.p.id, r.given);
        paid++;
        xp += [0, 4, 8, 13, 18][r.total || 0];
        coins += (r.total || 0) >= 4 ? 3 : (r.total || 0) === 3 ? 1 : 0;
      });

      stage.innerHTML = "";
      stage.appendChild(U.el("div", { class: "paper-total" }, [
        U.el("div", { class: "paper-total-num", text: got + " / " + outOf }),
        U.el("div", { class: "paper-total-lbl",
          text: ranOut ? "Time ran out — marked as it stood" : "Section I" }),
        U.el("div", { class: "tiny muted", style: "margin-top:6px",
          text: U.fmtTime(elapsed) + " spent · " + results.filter(r => !r.blank).length +
                " of " + results.length + " answered" })
      ]));

      /* Every question, in order, with the mark, the criteria, what the student wrote and
         what a good answer looks like. This is the part worth reading, so it is not behind
         a modal — the results box is a button underneath it. */
      results.forEach((r, i) => {
        const box = U.el("div", { class: "lc-verdict " + (r.blank ? "notYet" : r.verdict) });
        box.appendChild(U.el("div", { class: "lc-head" }, [
          U.el("div", { class: "lc-word",
            text: "Q" + (i + 1) + " — " + (r.blank ? "Left blank" : VERDICT_WORD[r.verdict]) }),
          r.blank || r.verdict === "unavailable" ? null
            : U.el("div", { class: "lc-mark" }, [
                U.el("b", { text: String(r.total) }),
                U.el("span", { class: "tiny", text: "/" + r.outOf })
              ])
        ]));
        box.appendChild(U.el("div", { class: "tiny muted", style: "margin-bottom:8px", text: r.p.prompt }));

        if (!r.blank) {
          box.appendChild(U.el("div", { class: "lc-ex", style: "font-style:italic", text: r.given }));
          if (r.notPaid) {
            box.appendChild(U.el("div", { class: "tiny muted", style: "margin-top:6px",
              text: r.notPaid === "attempted"
                ? "Marked, but not paid — you have already been paid for this question today."
                : "Marked, but not paid — this answer has already been paid for elsewhere today." }));
          }
          (r.marks || []).forEach(m => {
            box.appendChild(U.el("div", { class: "lc-crit " + (m.got >= m.max ? "full" : m.got ? "part" : "") }, [
              U.el("div", { class: "lc-crit-mark", text: m.got + "/" + m.max }),
              U.el("div", { class: "lc-crit-body" }, [
                U.el("b", { text: m.label }),
                U.el("div", { class: "tiny muted", text: m.why || "" })
              ])
            ]));
          });
          if (r.feedback) box.appendChild(U.el("p", { class: "tiny", text: r.feedback }));
        }

        box.appendChild(U.el("details", { style: "margin-top:10px" }, [
          U.el("summary", { class: "tiny", style: "cursor:pointer", text: "Model answers" }),
          U.el("div", { class: "lc-exemplars" },
            (r.exemplars || r.p.answers || []).map(a => U.el("div", { class: "lc-ex", text: a })))
        ]));
        stage.appendChild(box);
      });

      /* UI.results DISPLAYS a payout; UI.award GRANTS one. Calling only the first showed
         the student XP and Marks that were never added to their save — caught by reading
         what Say It In One does, which is the mode this one borrows its economy from.
         Accuracy is nailed-over-PAID, so a paper of prompts already scored today earns no
         completion bonus and resubmitting is worth nothing. */
      const nailed = results.filter(r => !r.blank && r.verdict === "nailed" && !r.notPaid).length;
      const granted = UI.award({
        xp, coins, bonus: Math.round(S.streakBonus() * 0.5),
        accuracy: paid ? nailed / paid : 0
      });

      const acc = marked.length ? got / (marked.length * 4) : 0;
      UI.results({
        title: "📄 Section I",
        correct: got, total: outOf,
        xp: granted.xp, coins: granted.coins,
        scoreLabel: "Marks",
        gate: true, gateLabel: "See your result ↑",
        review: true,
        note: paid < results.filter(r => !r.blank).length
          ? "Some answers were marked but not paid — a prompt pays once a day."
          : null,
        extraStats: [["Answered", results.filter(r => !r.blank).length + " / " + results.length],
                     ["Time", U.fmtTime(elapsed)]],
        rank: UI.rank(Math.round(acc * 100)),
        onAgain: () => UI.go("/game/paper")
      });
    }
  }

  return { start, pickPrompts, PER_QUESTION_SEC };
})();
