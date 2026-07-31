/* THE LAYER C MODES — Say It In One, Thesis Forge, Rewrite Rescue.
   ============================================================================
   Everything typed here goes through Mark.check, so no mode invents its own marking and
   the farm guards apply uniformly.

   Four things this UI must never do:
     1. Show a cosine score. Not as a number, not as a percentage, and above all not as
        a band. The verdict is three words and then the exemplars. Similarity measures
        "this means roughly what a good answer means", and dressing that up as a mark out
        of 20 would be the one genuinely dishonest thing this app could do (§12).
     2. Pay more than a Layer A correct answer. Layer C must never be the fastest XP per
        minute in the app; the structural modes carry the economy (§9.8).
     3. Pay twice. One scored attempt per prompt per day, and the same normalised
        response pays once per day across the WHOLE bank — a generically strong sentence
        clears threshold on a surprising number of prompts.
     4. Break when the model is absent. "unavailable" is a first-class verdict: show the
        exemplars, award nothing, say why in plain words, and never show a broken screen.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.layerc = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  const VERDICT_WORD = {
    nailed: "Nailed it",
    close: "Close",
    notYet: "Not yet",
    unavailable: "Not marked"
  };

  /* Thesis Forge's deterministic checks. These run live as the student types and are
     Layer A — structural, not similarity — so they work with no model at all and on
     file://. This is the "the game tells you the truth as you build" feel that Balance
     Blitz had, and it is what makes the mode playable before the 23 MB download. */
  function thesisChecks(text, prompt) {
    const t = String(text || "");
    const words = U.words(t);
    const low = " " + U.normalise(t) + " ";
    const concepts = (EN.DATA.moduleConcepts.find(m => m.mod === (prompt.mod || "")) || {}).keyTerms || [];
    const plotVerbs = /\b(happens|shows|says|tells|goes|does|starts|ends|dies|meets|becomes|talks|thinks about)\b/;
    const conceptualVerbs = /\b(positions|constructs|represents|presents|argues|reframes|exposes|locates|forecloses|substitutes|refuses|withholds|enacts|complicates|reveals|demonstrates|converts|encodes|relocates)\b/;
    const textTitle = prompt.text && (EN.Bank.text(prompt.text) || {});
    const composer = textTitle && textTitle.composer ? U.normalise(textTitle.composer).split(" ").pop() : null;

    return [
      { id:"length", label:"One sentence, 12–45 words",
        met: words >= 12 && words <= 45 && (t.match(/[.!?]/g) || []).length <= 1 },
      { id:"position", label:"Takes a position (a conceptual verb, not a plot verb)",
        met: conceptualVerbs.test(low) && !plotVerbs.test(low) },
      { id:"concept", label:"Names the module concept",
        met: concepts.some(k => low.indexOf(U.normalise(k)) >= 0) },
      { id:"text", label:"References the text or its composer",
        met: !prompt.text || (composer ? low.indexOf(composer) >= 0 : true) ||
             (textTitle.title ? low.indexOf(U.normalise(textTitle.title).split(" ")[0]) >= 0 : false) },
      { id:"arguable", label:"Could be disagreed with (has a because / so / rather than)",
        met: /\b(because|so that|so |rather than|which is why|therefore|whereas|not\b.*but)\b/.test(low) }
    ];
  }

  function start(root, cfg) {
    const c = Object.assign({ modeId: "sayit", title: "💬 Say It In One",
                              mode: "sayit", count: 5 }, cfg);

    let pool = EN.Bank.activeFreeText().filter(p => p.mode === c.mode);
    if (!pool.length) pool = EN.Bank.freeText().filter(p => p.mode === c.mode);
    if (!pool.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "💬" }),
        U.el("p", { text: "No prompts available for that selection." })
      ]));
      return;
    }

    /* Prefer prompts that have not been scored today, so a returning student gets fresh
       ones rather than a run that cannot pay. */
    const ft = S.freeTextDay();
    const fresh = pool.filter(p => !ft.scored[p.id]);
    const items = U.sample(fresh.length >= c.count ? fresh : pool, Math.min(c.count, pool.length));

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    let idx = 0, nailed = 0, closeN = 0, xp = 0, coins = 0, paid = 0, finished = false;
    let marksGot = 0, marksMax = 0;
    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const progChip = UI.chip("1 / " + items.length);
    const scoreChip = UI.chip("0 XP");
    shell.meta.appendChild(progChip); shell.meta.appendChild(scoreChip);

    const stage = U.el("div");
    shell.body.appendChild(stage);

    /* Bring the model up in the background while the student reads the first prompt, so
       submitting does not wait on a cold load. Failure here is not an error. */
    let modelState = EN.Mark.available() ? "loading" : "blocked";
    const banner = U.el("div", { class: "grid" });
    shell.body.insertBefore(banner, stage);
    refreshBanner();
    if (EN.Mark.available()) {
      EN.Mark.isDownloaded().then(has => {
        if (!has) { modelState = "notDownloaded"; refreshBanner(); return; }
        EN.Mark.load().then(ok => { modelState = ok ? "ready" : "failed"; refreshBanner(); });
      });
    }

    function refreshBanner() {
      banner.innerHTML = "";
      if (modelState === "ready") return;
      if (modelState === "loading") {
        banner.appendChild(U.el("div", { class: "lc-verdict unavailable" }, [
          U.el("div", { class: "tiny", text: "Warming up the sentence marker…" })
        ]));
        return;
      }
      const why = modelState === "blocked" ? EN.Mark.blockedReason() : modelState;
      const msg = why === "file"
        ? "Sentence marking needs the app served over http — it works on your phone install and on the published site, just not by double-clicking the file. You can still write and compare against the model answers."
        : modelState === "notDownloaded"
          ? "Sentence marking is switched off. Enable it in Settings — 23 MB, one time, then it works offline forever."
          : "Sentence marking is unavailable on this device. You can still write and compare against the model answers.";
      banner.appendChild(U.el("div", { class: "lc-verdict unavailable" }, [
        U.el("div", { class: "lc-word", text: "Marking unavailable" }),
        U.el("p", { class: "tiny", text: msg }),
        modelState === "notDownloaded"
          ? U.el("button", { class: "btn btn-sm btn-primary", text: "Go to Settings",
                             on: { click: () => UI.go("/settings") } })
          : null
      ]));
    }

    function render() {
      stage.innerHTML = "";
      const p = items[idx];
      progChip.textContent = (idx + 1) + " / " + items.length;
      let submitted = false;

      const card = U.el("div", { class: "qcard" });
      card.appendChild(U.el("div", { class: "qtag" }, [
        U.el("span", { class: "chip", text: EN.Bank.moduleLabel(p.mod) }),
        p.text ? U.el("span", { class: "chip", text: (EN.Bank.text(p.text) || {}).title || p.text }) : null,
        U.el("span", { class: "chip", text: p.mode === "thesis" ? "Thesis" : p.mode === "rewrite" ? "Rewrite" : "One sentence" }),
        ft.scored[p.id] ? U.el("span", { class: "chip", text: "already scored today" }) : null
      ]));

      // A referenced quote is shown, because you cannot analyse what you cannot see.
      const quote = p.quote && EN.Bank.quoteById(p.quote);
      if (quote) card.appendChild(U.quoteBlock(quote));
      if (p.weak) card.appendChild(U.el("div", { class: "lc-ex", style: "border-left:3px solid var(--bad)" },
        [U.el("span", { text: p.weak })]));

      card.appendChild(U.el("div", { class: "qtext", text: p.prompt }));

      const ta = U.el("textarea", { class: "tin", rows: 3,
        placeholder: p.mode === "rewrite" ? "Your rewrite…" : "One sentence…",
        spellcheck: "true" });
      card.appendChild(ta);

      /* Thesis Forge's live structural feedback. The summary is free; this is the
         detailed version, and in Thesis mode it is the point of the mode rather than a
         crutch — the deterministic checks are what the student is learning to satisfy. */
      const live = U.el("div", { class: "lc-live" });
      if (p.mode === "thesis") card.appendChild(live);
      function refreshLive() {
        if (p.mode !== "thesis") return;
        live.innerHTML = "";
        thesisChecks(ta.value, p).forEach(ch => {
          live.appendChild(U.el("div", { class: "lc-check" + (ch.met ? " met" : "") }, [
            U.el("span", { class: "lc-check-box", text: ch.met ? "✓" : "" }),
            U.el("span", { text: ch.label })
          ]));
        });
      }
      refreshLive();

      const counter = U.el("div", { class: "input-hint", text: "0 words" });
      card.appendChild(counter);
      const submitBar = U.el("div", { class: "lc-actions" });
      ta.addEventListener("input", () => {
        counter.textContent = U.words(ta.value) + " words";
        EN.Sound.type();
        refreshLive();
        const ready = U.words(ta.value) >= 4 && !submitted;
        submit.disabled = !ready;
        submitBar.classList.toggle("stuck", ready);
      });

      /* Sticky once there is something to mark. At 360px this button landed underneath
         the floating nav bar — enabled, on screen, and untappable, because the nav is
         centred and covers the middle of the row. Same treatment as the Essay Architect
         and the Marking Desk. */
      const submit = U.el("button", { class: "btn btn-primary btn-block js-submit",
                                      text: "Mark my sentence", disabled: true });
      submitBar.appendChild(submit);
      card.appendChild(submitBar);
      stage.appendChild(card);
      ta.focus();

      submit.addEventListener("click", async () => {
        if (submitted) return;
        submitted = true;
        submit.disabled = true;
        submit.textContent = "Marking…";
        ta.disabled = true;

        /* Eligibility is checked BEFORE marking, so the student is told honestly that
           this attempt will not pay rather than discovering it afterwards. */
        const elig = S.freeTextEligible(p.id, ta.value);

        /* Rewrite Rescue gets its strongest near-miss free: the weak original. A rewrite
           that barely changed anything lands closer to it than to any exemplar, so the
           contrastive rule catches "changed three words" with no extra authoring. */
        const nearMiss = (p.nearMiss || []).concat(p.weak ? [p.weak] : []);

        /* techniques/quoteText/text feed the two DETERMINISTIC marks — "is the text
           actually in it" and "does it say what that does". Without them Mark.check
           gives the Detail mark rather than penalising a criterion the data cannot
           express, so passing them is what makes the mark meaningful. */
        const q = p.quote ? EN.Bank.quoteById(p.quote) : null;
        /* The only await in any game, so the only place a rejection can strand the
           student: the textarea is already disabled and the submit button already says
           "Marking…", so a throw here leaves a screen with no way forward and nothing
           said — which is indistinguishable from the app dying. "unavailable" is a
           first-class verdict precisely so there is something honest to fall back to. */
        let res;
        try {
          res = await EN.Mark.check(ta.value, {
            layer: "C", answers: p.answers, nearMiss,
            prompt: p.prompt, threshold: p.threshold, domain: p.domain,
            text: p.text, techniques: q ? q.techniques : null, quoteText: q ? q.text : null
          });
        } catch (err) {
          console.warn("Marking threw; falling back to unavailable.", err);
          res = { verdict: "unavailable", score: 0, layer: "C", flags: ["threw"],
                  total: 0, outOf: 4, exemplars: p.answers,
                  feedback: "Something went wrong marking that, so it has not been scored. Your answer is intact above and the model answers are below." };
        }
        if (!res.flags) res.flags = [];

        submitBar.remove();
        S.bump("sentencesMarked");
        if (res.verdict === "nailed") { nailed++; S.bump("sentencesNailed"); EN.Sound.nailed(); }
        else if (res.verdict === "close") { closeN++; EN.Sound.circling(); }
        else if (res.verdict === "unavailable") EN.Sound.unavailable();
        else EN.Sound.notYet();

        if (p.mode === "thesis") S.bump("thesesForged");
        if (p.mode === "rewrite" && res.verdict === "nailed") S.bump("rewritesNailed");

        /* Payout. Capped at or below a Layer A correct answer (10 × difficulty ≈ 20–40),
           and only on the day's first scored attempt at this prompt with a response the
           student has not already been paid for elsewhere. */
        let gain = 0;
        if (res.verdict !== "unavailable" && elig.ok) {
          S.markFreeText(p.id, ta.value);
          paid++;
          /* Per mark rather than per verdict, so three out of four is worth more than two
             and a decent answer is never worth nothing. Still capped at 18 — the ceiling
             is what keeps a similarity threshold from outpaying a determinate answer. */
          gain = [0, 4, 8, 13, 18][res.total || 0];
          marksGot += res.total || 0;
          marksMax += res.outOf || 4;
          xp += gain;
          coins += (res.total || 0) >= 4 ? 3 : (res.total || 0) === 3 ? 1 : 0;
          scoreChip.textContent = xp + " XP";
          if (gain) EN.FX.marked(window.innerWidth / 2, window.innerHeight * 0.4);
        }

        const box = U.el("div", { class: "lc-verdict " + res.verdict }, [
          U.el("div", { class: "lc-head" }, [
            U.el("div", { class: "lc-word", text: VERDICT_WORD[res.verdict] }),
            res.verdict !== "unavailable"
              ? U.el("div", { class: "lc-mark", title: "Three of these four marks are deterministic" }, [
                  U.el("b", { text: String(res.total) }),
                  U.el("span", { text: "/" + res.outOf })
                ]) : null
          ]),
          U.el("p", { text: res.feedback }),
          /* The criteria, itemised. This is the point of the mark: when a mark is lost the
             student is told which criterion and why, and for two of the three that reason
             is a fact about their words rather than a similarity score. */
          res.marks ? U.el("div", { class: "lc-criteria" },
            res.marks.map(m => U.el("div", { class: "lc-crit" + (m.got === m.max ? " full" : m.got ? " part" : "") }, [
              U.el("span", { class: "lc-crit-mark", text: m.got + "/" + m.max }),
              U.el("span", { class: "lc-crit-body" }, [
                U.el("b", { text: m.label }),
                U.el("div", { class: "tiny muted", text: m.why })
              ])
            ]))) : null,
          res.flags.includes("reversed")
            ? U.el("div", { class: "lc-flag", text: "⇄ Direction check — the terms look inverted." }) : null,
          res.flags.includes("negation")
            ? U.el("div", { class: "lc-flag", text: "± One of you negates and the other doesn't. Worth re-reading." }) : null,
          res.verdict !== "unavailable" && !elig.ok
            ? U.el("div", { class: "lc-flag", text: elig.why === "attempted"
                ? "🕐 Already scored this prompt today, so this attempt pays nothing — the feedback still stands."
                : "🕐 You have already been paid for this sentence today on another prompt." }) : null
        ]);

        // The exemplars are ALWAYS revealed. When the verdict is anything but "nailed",
        // they are the actual feedback, which is why they are never withheld.
        box.appendChild(U.el("div", { class: "tiny muted", style: "margin-top:12px",
          text: res.exemplars.length + " ways other people put it:" }));
        const ex = U.el("div", { class: "lc-exemplars" });
        res.exemplars.forEach(a => ex.appendChild(U.el("div", { class: "lc-ex", text: a })));
        box.appendChild(ex);

        if (p.mode === "thesis") {
          const met = thesisChecks(ta.value, p).filter(x => x.met).length;
          box.appendChild(U.el("div", { class: "tiny muted", style: "margin-top:10px",
            text: "Structural checks met: " + met + " of 5. Those are deterministic — they do not depend on the model." }));
        }

        stage.appendChild(box);
        box.scrollIntoView({ behavior: EN.FX.isReduced() ? "auto" : "smooth", block: "nearest" });

        const isLast = idx >= items.length - 1;
        stage.appendChild(U.el("div", { class: "row", style: "margin-top:14px" }, [
          U.el("button", { class: "btn btn-ghost btn-sm", text: "↻ Try this one again",
            on: { click: () => { EN.Sound.page(); render(); } } }),
          U.el("div", { class: "spacer" }),
          U.el("button", { class: "btn btn-primary", text: isLast ? "Finish" : "Next prompt →",
            on: { click: () => { if (isLast) return finish(); idx++; EN.Sound.page(); render(); window.scrollTo({ top: 0 }); } } })
        ]));
      });
    }

    function finish() {
      if (finished) return;
      finished = true;
      const newBest = S.recordScore(c.modeId, nailed);

      /* Accuracy is nailed-over-PAID, not nailed-over-attempted. A run of prompts already
         scored today therefore earns no completion bonus, which is what stops resubmission
         from being worth anything. */
      const got = UI.award({
        xp, bonus: Math.round(S.streakBonus() * 0.5),
        accuracy: paid ? nailed / paid : 0, coins
      });

      UI.results({
        title: c.title.replace(/^\S+\s/, "") + " complete",
        correct: nailed, total: items.length, xp: got.xp, coins: got.coins, newBest,
        scoreLabel: "Nailed",
        extraStats: [["Marks", marksMax ? marksGot + "/" + marksMax : "—"],
                     ["Close", closeN], ["Scored", paid + "/" + items.length]],
        note: "Sentence marking pays less than the structural modes on purpose — a similarity threshold is softer than a right answer.",
        gate: true, gateLabel: "See your results ↑",
        onAgain: () => UI.handleRoute()
      });
    }

    render();
  }

  return { start, thesisChecks, VERDICT_WORD };
})();
