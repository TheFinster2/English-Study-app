/* CLOZE CRUNCH — the Quote Vault's testing mode, and the app's procedural generator.
   ============================================================================
   English's answer to chemistry's numeric problem generator: infinite, deterministic,
   and it drills the thing HSC students most reliably lose marks for.

   Difficulty contract (§9.10), asserted in tests/validate.js:
     • deletion rate rises with the card's Leitner box: 0.18 → 0.50
     • only CONTENT words are ever deleted; articles and prepositions never are
     • words inside the quote's `span` are deleted before any word outside it
     • gaps are seeded from quote id + box, so a card at a given box always produces the
       same gaps — re-randomising means re-learning a new puzzle instead of consolidating
       one quote

   This is the only Vault mode that pays. Self-rated recall ("did you remember it? yes")
   is unmarkable and farmable; a typed answer is neither (§9.8). Layer B does the
   forgiving, so a typo costs nothing.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.cloze = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /* Deletion rate per Leitner box. A quote gets harder to recall as it becomes more
     familiar, which is the point of putting the generator behind the SRS. */
  const RATE_BY_BOX = [0.18, 0.18, 0.26, 0.34, 0.42, 0.50];

  function rateFor(box) { return RATE_BY_BOX[U.clamp(box, 1, 5)]; }

  function start(root, cfg) {
    const c = Object.assign({ modeId: "cloze", title: "🕳️ Cloze Crunch",
                              count: 8, dueOnly: false, texts: null, quotes: null }, cfg);

    let pool = c.quotes || (c.dueOnly ? S.dueCards() : EN.Bank.quotes());
    if (c.texts && c.texts.length) pool = pool.filter(q => c.texts.includes(q.textId));
    // Prefer quotes long enough to make a real puzzle.
    pool = pool.filter(q => U.words(q.text) >= 6);

    if (!pool.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🗝️" }),
        U.el("p", { text: c.dueOnly ? "Nothing is due in the Vault today. Come back tomorrow, or run it without the due filter."
                                    : "No quotes available for that selection." }),
        U.el("button", { class: "btn btn-ghost btn-sm", text: "← Back to the Vault",
                         on: { click: () => UI.go("/vault") } })
      ]));
      return;
    }

    const items = U.sample(pool, Math.min(c.count, pool.length)).map(q => {
      const box = S.cardState(q.id).box;
      return { quote: q, box, cloze: U.cloze(q, { rate: rateFor(box), seed: box }) };
    }).filter(it => it.cloze.blanks.length);

    if (!items.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🕳️" }),
        U.el("p", { text: "Those quotes are too short to make a cloze from." })
      ]));
      return;
    }

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    let idx = 0, solved = 0, blanksRight = 0, blanksTotal = 0, paidCards = 0;
    let xp = 0, coins = 0, penalty = 0, perfectCards = 0, finished = false;
    let shownAt = 0, minRead = 800;

    /* Revealing a letter is a latching crutch, charged once and never refunded. */
    const letterHint = UI.crutch("Letters revealed", 0.25);

    const shell = UI.gameShell(c.title, { confirmExit: true, backTo: "/vault" });
    root.appendChild(shell.root);
    const scoreChip = UI.chip("0 XP"), progChip = UI.chip("1 / " + items.length);
    shell.meta.appendChild(progChip); shell.meta.appendChild(scoreChip);
    const stage = U.el("div");
    shell.body.appendChild(stage);

    UI.onLeave(() => document.removeEventListener("keydown", onKey));
    document.addEventListener("keydown", onKey);
    function onKey(e) {
      if (e.key !== "Enter") return;
      const btn = U.$(".js-submit", stage) || U.$(".js-next", stage);
      if (btn) { e.preventDefault(); btn.click(); }
    }

    function render() {
      stage.innerHTML = "";
      const it = items[idx];
      progChip.textContent = (idx + 1) + " / " + items.length;

      const card = U.el("div", { class: "qcard" });
      card.appendChild(U.el("div", { class: "qtag" }, [
        /* The WORK, not the volume: "Holy Sonnet 7" rather than "The Metaphysical Poetry
           of John Donne", which is what a student would cite and is also what fits. */
        U.el("span", { class: "chip", text: U.cite(it.quote).work }),
        U.el("span", { class: "chip", text: it.quote.composer || "" }),
        U.el("span", { class: "chip", text: U.cite(it.quote).locus }),
        U.el("span", { class: "chip", text: "Box " + it.box }),
        U.el("span", { class: "chip", text: it.cloze.blanks.length + " gap" + (it.cloze.blanks.length === 1 ? "" : "s") })
      ]));

      /* Render the display string, replacing each ␣{n} marker with an input. The marker
         form comes from U.cloze so the generator stays independent of the UI. */
      const line = U.el("div", { class: "cloze-text" });
      const inputs = [];
      const parts = it.cloze.display.split(/␣\{(\d+)\}/);
      parts.forEach((part, i) => {
        if (i % 2 === 0) {
          if (part) line.appendChild(document.createTextNode(part));
        } else {
          const b = it.cloze.blanks[Number(part)];
          const input = U.el("input", {
            class: "cloze-blank", type: "text", autocomplete: "off",
            autocapitalize: "off", spellcheck: "false",
            "aria-label": "gap " + (Number(part) + 1),
            size: Math.max(6, b.word.length)
          });
          input.addEventListener("input", () => EN.Sound.type());
          inputs.push({ input, blank: b });
          line.appendChild(input);
        }
      });
      card.appendChild(line);
      card.appendChild(U.el("div", { class: "input-hint",
        text: U.citeLine(it.quote) }));

      const submit = U.el("button", { class: "btn btn-primary js-submit", text: "Check" });
      const hintBtn = U.el("button", { class: "pu", type: "button", title: "Reveals the first letter of every gap" }, [
        U.el("span", { text: "🔤" }), U.el("span", { text: "First letters" }),
        U.el("span", { class: "pu-n", text: "−25% XP" })
      ]);
      hintBtn.addEventListener("click", () => {
        letterHint.use();
        hintBtn.disabled = true;
        EN.Sound.puHint();
        inputs.forEach(({ input, blank }) => { if (!input.value) input.value = blank.word[0]; });
        inputs[0] && inputs[0].input.focus();
      });
      card.appendChild(U.el("div", { class: "row", style: "margin-top:16px" },
        [submit, U.el("div", { class: "spacer" }), hintBtn]));
      stage.appendChild(card);
      inputs[0] && inputs[0].input.focus();
      shownAt = performance.now();
      /* A cloze IS the quote, so this is a genuine read rather than a scan — but it is
         still only a gate against tapping, so it uses the rush floor and its 9s cap
         rather than the clock-sizing estimate. */
      minRead = UI.rushFloor({ read: it.quote.text });

      submit.addEventListener("click", () => check(it, inputs, card, submit, hintBtn));
    }

    function check(it, inputs, card, submit, hintBtn) {
      submit.disabled = true;
      hintBtn.disabled = true;
      let right = 0;

      inputs.forEach(({ input, blank }) => {
        input.disabled = true;
        /* Layer B: a single word against an authored alternates list, at 0.85. This is
           exactly the scope §0.1 permits — spellcheck, not marking. */
        const res = EN.Mark.fuzzy(input.value, blank.alts);
        blanksTotal++;
        if (res.ok) {
          right++; blanksRight++;
          input.classList.add(res.ratio === 1 ? "ok" : "near");
          if (res.ratio < 1) input.insertAdjacentElement("afterend",
            U.el("span", { class: "cloze-answer", text: "(" + blank.word + ")" }));
        } else {
          input.classList.add("no");
          input.insertAdjacentElement("afterend",
            U.el("span", { class: "cloze-answer", text: blank.word }));
        }
      });

      const all = right === inputs.length;
      const tooFast = performance.now() - shownAt < minRead;

      /* Pays only once per day, and only if the card was genuinely due (§9.8). A quote
         you have already been paid for today still gives feedback, and nothing else. */
      const eligible = S.cardXpEligible(it.quote.id) && !tooFast;
      if (all) {
        solved++; perfectCards += 1;
        S.bump("clozeSolved");
        EN.Sound.correct();
        if (eligible) {
          paidCards++;
          S.markCardXp(it.quote.id);
          const gain = 8 + it.box * 4;
          xp += gain; coins += 3;
          EN.FX.rise(window.innerWidth / 2, window.innerHeight * 0.45);
        }
        S.reviewCard(it.quote.id, true);
        S.progressDaily("cloze", 1);
      } else {
        S.bump("clozeSolved", 0);
        penalty += 5;
        S.reviewCard(it.quote.id, false);
        EN.Sound.wrong();
        if (right) EN.Sound.close();
      }
      scoreChip.textContent = Math.max(0, xp - penalty) + " XP";

      const fb = U.el("div", { class: "feedback " + (all ? "ok" : "no") }, [
        U.el("div", {}, [
          U.el("b", { text: all ? "Word perfect. " : right + " of " + inputs.length + " right. " }),
          U.el("span", { text: all
            ? (eligible ? "Card moves to box " + Math.min(5, it.box + 1) + "."
                        : tooFast ? "Too fast to have read that — no XP for this one."
                                  : "Already paid for this card today, so no XP — the review still counts.")
            : "Back to box 1. The load-bearing words are the ones worth drilling." })
        ]),
        it.quote.effect ? U.el("div", { class: "tiny muted", style: "margin-top:8px", text: it.quote.effect }) : null
      ]);
      const isLast = idx >= items.length - 1;
      const next = U.el("button", { class: "btn btn-primary js-next",
        text: isLast ? "See results" : "Next quote →",
        on: { click: () => { if (isLast) return finish(); idx++; EN.Sound.page(); render(); } } });
      fb.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [next]));
      UI.announce(fb);
      card.appendChild(fb);
      next.focus();
    }

    function finish() {
      if (finished) return;
      finished = true;
      document.removeEventListener("keydown", onKey);
      if (perfectCards === items.length && items.length >= 4) {
        S.bump("clozePerfect", items.length); S.bump("perfectRuns"); EN.Sound.perfect();
      }
      const newBest = S.recordScore(c.modeId, solved);

      /* Accuracy reported to award() is PAID CARDS over deck size, never the number the
         student felt good about (§9.8). A run of already-paid cards therefore earns no
         completion bonus, which is what stops the Vault being an infinite loop. */
      const got = UI.award({
        xp: Math.max(0, xp - penalty),
        bonus: S.streakBonus(),
        accuracy: items.length ? paidCards / items.length : 0,
        coins, crutchCost: UI.crutchCost([letterHint])
      });

      UI.results({
        title: "Cloze run complete",
        correct: solved, total: items.length, xp: got.xp, coins: got.coins, newBest,
        scoreLabel: "Quotes", extraStats: [
          ["Gaps", blanksRight + "/" + blanksTotal],
          ["Paid", paidCards + "/" + items.length],
          letterHint.used() ? ["Letters", "used"] : ["Vault", "updated"]
        ],
        note: paidCards < items.length
          ? "A quote pays once a day and only when it is due. The others still moved in the Vault."
          : null,
        onAgain: () => UI.handleRoute()
      });
    }

    render();
  }

  return { start, rateFor, RATE_BY_BOX };
})();
