/* The question card and the quiz engine.
   Powers Rapid Fire, Module Drill, Mistake Rehab, Survival, the daily challenge and the
   MCQ half of the boss fights. */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

/* ── shared question card ──────────────────────────────────── */
EN.QuizCore = (function () {
  const U = EN.U;
  const KEYS = ["A", "B", "C", "D", "E", "F"];

  /** Render a question's stem: a quote block with a highlight, or plain prose. */
  function stemNode(q) {
    if (!q.stem) return null;
    /* `mark` is the highlighted substring, resolved to offsets here rather than stored,
       so an edit to the stem can never leave the highlight pointing at the wrong words. */
    const span = q.mark ? (() => {
      const at = q.stem.indexOf(q.mark);
      return at >= 0 ? [at, at + q.mark.length] : null;
    })() : (q.highlight || null);

    const looksLikeQuote = /^[“"']/.test(q.stem.trim());
    if (looksLikeQuote) {
      // Split "“quote” — attribution" so the attribution becomes a figcaption.
      const m = q.stem.match(/^(.*?[”"'])\s+—\s+(.*)$/s);
      const body = m ? m[1] : q.stem;
      const cite = m ? m[2] : "";
      const bodySpan = span && m ? adjust(span, q.stem, body) : span;
      return U.el("figure", { class: "bq" }, [
        U.el("blockquote", { html: U.highlight(body, bodySpan) }),
        cite ? U.el("figcaption", { text: cite }) : null
      ]);
    }
    return U.el("div", { class: "qstem prose" }, [U.el("p", { html: U.highlight(q.stem, span) })]);
  }

  /** Keep a span valid when the stem is split for display. */
  function adjust(span, full, part) {
    if (!span) return null;
    const at = full.indexOf(part);
    if (at < 0) return null;
    const a = span[0] - at, b = span[1] - at;
    return (a >= 0 && b <= part.length) ? [a, b] : null;
  }

  /**
   * Build a question card.
   * opts: { onAnswer(index, isCorrect, buttonEl), showTags, index, total, hideTechnique }
   * → { node, reveal(chosen), buttons, disable, fiftyFifty, readWords }
   */
  function buildCard(q, opts) {
    const o = opts || {};
    const tags = U.el("div", { class: "qtag" }, [
      o.total ? U.el("span", { class: "chip", text: `Q${o.index + 1} / ${o.total}` }) : null,
      U.el("span", { class: "chip", text: EN.Bank.moduleName(q.mod) }),
      q.text ? U.el("span", { class: "chip", text: (EN.Bank.text(q.text) || {}).title || q.text }) : null,
      U.el("span", { class: "chip", text: q.topic }),
      U.el("span", { class: "chip", text: "★".repeat(q.diff || 1) })
    ]);

    const buttons = [];
    const choiceWrap = U.el("div", { class: "choices" });

    q.choices.forEach((text, i) => {
      const btn = U.el("button", { class: "choice", type: "button" }, [
        U.el("span", { class: "choice-key", text: KEYS[i] }),
        U.el("span", { text: text })
      ]);
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        o.onAnswer && o.onAnswer(i, i === q.a, btn);
      });
      buttons.push(btn);
      choiceWrap.appendChild(btn);
    });

    const node = U.el("div", { class: "qcard" }, [
      o.showTags === false ? null : tags,
      stemNode(q),
      U.el("div", { class: "qtext", text: q.q }),
      choiceWrap
    ]);

    /* Everything visible before the student answers, which is what UI.readTimeFor
       measures. A two-line quote and a 180-word paragraph are not the same read. */
    const readWords = [q.stem || "", q.q].concat(q.choices).join(" ");

    function disable() { buttons.forEach(b => (b.disabled = true)); }

    function reveal(chosen) {
      disable();
      buttons.forEach((b, i) => {
        if (i === q.a) b.classList.add("correct");
        else if (i === chosen) b.classList.add("wrong");
      });
      const ok = chosen === q.a;
      const fb = U.el("div", { class: "feedback " + (ok ? "ok" : "no") }, [
        U.el("span", {}, [
          U.el("b", { text: ok ? "Correct. " : "Not quite. " }),
          U.el("span", { text: q.why })
        ])
      ]);
      node.appendChild(fb);
      return fb;
    }

    /** 50/50: dim two wrong options. */
    function fiftyFifty() {
      const wrong = buttons.map((b, i) => i).filter(i => i !== q.a && !buttons[i].disabled);
      U.shuffle(wrong).slice(0, Math.min(2, wrong.length)).forEach(i => {
        buttons[i].disabled = true;
        buttons[i].classList.add("dimmed");
      });
    }

    return { node, reveal, disable, buttons, fiftyFifty, readWords };
  }

  return { buildCard, stemNode, KEYS };
})();

/* ── the quiz mode ─────────────────────────────────────────── */
EN.Games.quiz = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /**
   * cfg: { modeId, title, questions | mods | texts | topics, count, totalTime, lives,
   *        adaptive, dailyMode, backTo }
   */
  function start(root, cfg) {
    const c = Object.assign({
      modeId: "quiz", title: "Quiz", count: 12, totalTime: 0, lives: 0, adaptive: true
    }, cfg);

    const questions = c.questions && c.questions.length
      ? c.questions
      : EN.Bank.draw(c.count, { mods: c.mods, texts: c.texts, topics: c.topics, adaptive: c.adaptive });

    if (!questions.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🫙" }),
        U.el("p", { text: "No questions available for that selection." })
      ]));
      return;
    }

    S.markMode(c.modeId);
    S.touchStreak();
    const diffMode = S.difficulty();
    EN.Sound.gameStart();

    let idx = 0, correct = 0, streak = 0, bestStreak = 0;
    let xpEarned = 0, coinsEarned = 0, lives = c.lives, doubled = false;
    let penalty = 0, shownAt = 0, rushed = 0, minRead = UI.READ_BASE_MS;
    let timeLeft = 0, timerId = null, finished = false;

    const shell = UI.gameShell(c.title, { confirmExit: true, backTo: c.backTo });
    root.appendChild(shell.root);

    /* Difficulty shortens the SLACK over reading time, never the reading time itself.
       The clock is budgeted against the average stem in the drawn set rather than a flat
       percentage, so a paragraph-length mode stays readable on Nightmare. */
    if (c.totalTime) {
      const sample = questions.slice(0, 6).map(q => (q.stem || "") + " " + q.q).join(" ");
      timeLeft = UI.timeBudget(c.totalTime, sample);
    }

    const scoreChip  = UI.chip("0 XP");
    const streakChip = UI.chip("Streak 0");
    const livesChip  = c.lives ? UI.chip("❤️".repeat(lives)) : null;
    const timerChip  = c.totalTime ? U.el("span", { class: "timer-ring", text: U.fmtTime(timeLeft) }) : null;
    [scoreChip, streakChip, livesChip, timerChip].forEach(n => n && shell.meta.appendChild(n));

    const stage = U.el("div");
    const puBar = buildPowerupBar();
    shell.body.appendChild(stage);
    shell.body.appendChild(puBar.node);

    let card = null;

    if (c.totalTime) {
      timerId = setInterval(() => {
        timeLeft--;
        timerChip.textContent = U.fmtTime(Math.max(0, timeLeft));
        timerChip.classList.toggle("low", timeLeft <= 10);
        if (timeLeft <= 10 && timeLeft > 5) EN.Sound.tick();
        if (timeLeft <= 5 && timeLeft > 0) EN.Sound.tickUrgent();
        if (timeLeft <= 0) { EN.Sound.timeout(); finish("Time"); }
      }, 1000);
    }
    UI.onLeave(() => { clearInterval(timerId); document.removeEventListener("keydown", onKey); });
    document.addEventListener("keydown", onKey);

    function onKey(e) {
      if (!card || finished) return;
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const n = "1234".indexOf(e.key);
      if (n >= 0 && card.buttons[n] && !card.buttons[n].disabled) card.buttons[n].click();
      if (e.key === "Enter") {
        const next = U.$(".js-next", stage);
        if (next) next.click();
      }
    }

    const multiplier = () => Math.min(3, 1 + Math.floor(streak / 5) * 0.5);

    function renderQuestion() {
      stage.innerHTML = "";
      const q = questions[idx];
      card = EN.QuizCore.buildCard(q, {
        index: idx, total: c.totalTime ? 0 : questions.length,
        onAnswer: (chosen, isCorrect, btn) => answer(q, chosen, isCorrect, btn)
      });
      stage.appendChild(card.node);
      shownAt = performance.now();
      minRead = UI.readTimeFor(card.readWords);
      puBar.refresh();
    }

    function answer(q, chosen, isCorrect, btn) {
      const fb = card.reveal(chosen);
      S.recordAnswer(q.mod, isCorrect, q.id, q.text);
      if (q.topic === "Techniques" && isCorrect) S.bump("techniquesNamed");

      // Answering faster than this question could be read earns nothing.
      const tooFast = performance.now() - shownAt < minRead;

      if (isCorrect) {
        correct++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        S.noteStreak(bestStreak);
        const base = 10 * (q.diff || 1);
        const gain = tooFast ? 0 : Math.round(base * multiplier() * (doubled ? 2 : 1));
        if (tooFast) rushed++;
        xpEarned += gain;
        coinsEarned += tooFast ? 0 : 2 + (q.diff || 1);
        EN.Sound.correct();
        if (tooFast) UI.toast({ icon: "⏱️", kind: "bad",
          text: "Too fast to have read that — no XP for it." });
        if (streak > 1 && streak % 5 === 0) {
          EN.Sound.multiplier(Math.floor(streak / 5));
          UI.toast({ icon: "⚡", kind: "xp", text: `<b>${streak} streak.</b> ×${multiplier()} XP` });
          streakChip.classList.add("combo-flash");
          setTimeout(() => streakChip.classList.remove("combo-flash"), 420);
        }
        const r = btn.getBoundingClientRect();
        EN.FX.pop(r.right - 22, r.top + r.height / 2);
        if (gain) EN.FX.floatText(r.right - 58, r.top - 4, "+" + gain);
        if (c.dailyMode) S.progressDaily(c.dailyMode, 1);
      } else {
        if (streak >= 5) EN.Sound.comboBreak();
        streak = 0;
        // A wrong answer costs XP, so guessing through a run nets nothing.
        penalty += 6 * (q.diff || 1);
        if (lives > 0) {
          lives--;
          livesChip.textContent = "❤️".repeat(lives) || "💀";
        }
        EN.Sound.wrong();
        EN.FX.shake();
      }

      scoreChip.textContent = Math.max(0, xpEarned - penalty) + " XP";
      streakChip.textContent = "Streak " + streak;

      const isLast = !c.totalTime && idx >= questions.length - 1;
      const outOfLives = c.lives && lives <= 0;
      const nextBtn = U.el("button", {
        class: "btn btn-primary js-next",
        text: outOfLives || isLast ? "See results" : "Next question →",
        on: { click: () => {
          if (outOfLives || isLast) return finish(outOfLives ? "Out of lives" : null);
          idx++;
          if (idx >= questions.length) {
            // Timed modes top up the pool rather than ending early.
            questions.push(...EN.Bank.draw(10, { mods: c.mods, texts: c.texts, topics: c.topics, adaptive: c.adaptive }));
          }
          EN.Sound.page();
          renderQuestion();
        } }
      });
      fb.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [nextBtn]));
      nextBtn.focus();
    }

    function buildPowerupBar() {
      const node = U.el("div", { class: "powerups" });
      const banned = diffMode.ban || [];
      const defs = EN.DATA.shop.powerups
        .filter(p => p.id !== "freeze" || c.totalTime)
        .filter(p => !banned.includes(p.id));
      const btns = {};

      defs.forEach(p => {
        const count = U.el("span", { class: "pu-n", text: "×0" });
        const b = U.el("button", { class: "pu", type: "button", title: p.desc }, [
          U.el("span", { text: p.icon }), U.el("span", { text: p.name }), count
        ]);
        b.addEventListener("click", () => use(p.id, b));
        btns[p.id] = { b, count };
        node.appendChild(b);
      });

      function refresh() {
        defs.forEach(p => {
          const n = S.data.inventory[p.id] || 0;
          btns[p.id].count.textContent = "×" + n;
          btns[p.id].b.disabled = n <= 0 || (p.id === "adrenaline" && doubled);
        });
      }

      function use(id, btn) {
        if (!S.usePowerup(id)) return;
        const q = questions[idx];
        if (id === "fifty") {
          EN.Sound.puFifty(); card && card.fiftyFifty();
          UI.toast({ icon: "✂️", text: "Two wrong options removed." });
        }
        if (id === "skip") {
          EN.Sound.puSkip();
          UI.toast({ icon: "⏭️", text: "Skipped — streak preserved." });
          idx++;
          if (idx >= questions.length) return finish();
          renderQuestion();
          return;
        }
        if (id === "freeze") {
          EN.Sound.puFreeze();
          timeLeft += 20;
          timerChip.textContent = U.fmtTime(timeLeft);
          UI.toast({ icon: "🧊", text: "+20 seconds." });
        }
        if (id === "reread") {
          EN.Sound.puReread();
          if (q.mark) UI.toast({ icon: "👁️", ms: 6000,
            text: "<b>Second read:</b> the words doing the work are “" + U.escapeHtml(q.mark) + "”." });
          else UI.toast({ icon: "👁️", ms: 5000,
            text: "<b>Second read:</b> nothing is highlighted in this one — read the question's verb again." });
        }
        if (id === "hint") {
          EN.Sound.puHint();
          UI.toast({ icon: "💡", ms: 6000,
            text: "<b>Hint:</b> this is a " + U.escapeHtml(q.topic) + " question in " +
                  U.escapeHtml(EN.Bank.moduleLabel(q.mod)) + "." });
        }
        if (id === "insight") {
          EN.Sound.puInsight();
          // Insight names the *category* of the right answer, never the option.
          const t = (q.mark && EN.Bank.filterQuotes({ includeInactive: true })
                      .find(x => x.text.indexOf(q.mark) >= 0));
          const tech = t && (t.techniques || [])[0];
          const g = tech && EN.Bank.technique(tech);
          UI.toast({ icon: "🔍", ms: 8000, text: g
            ? "<b>Insight:</b> the strongest reading turns on something in the <i>" +
              U.escapeHtml((EN.DATA.techniqueCategories.find(cc => cc.id === g.cat) || {}).name || g.cat) +
              "</i> category."
            : "<b>Insight:</b> the right answer names a mechanism, not an effect. Look for the option with a 'so' or a 'because' in it." });
        }
        if (id === "adrenaline") {
          EN.Sound.puAdrenaline();
          doubled = true;
          UI.toast({ icon: "⚡", kind: "xp", text: "<b>Adrenaline.</b> Double XP for this run." });
        }
        refresh();
        EN.FX.burstAt(btn, { count: 12, speed: 3.5, size: 3, shape: "circle" });
      }

      return { node, refresh };
    }

    function finish(reason) {
      if (finished) return;
      finished = true;
      clearInterval(timerId);
      document.removeEventListener("keydown", onKey);

      // Timed modes end mid-pool, so score against what was actually shown.
      const seen = c.totalTime ? Math.max(1, idx + 1) : Math.min(questions.length, idx + 1);
      const perfect = correct === seen && seen >= 5;
      if (perfect) { S.bump("perfectRuns"); EN.Sound.perfect(); }
      if (perfect && diffMode.id === "hard") S.bump("hardWins");
      if (perfect && diffMode.id === "nightmare") S.bump("nightmareWins");

      const accuracy = seen ? correct / seen : 0;
      const netXp = Math.max(0, xpEarned - penalty);
      const newBest = S.recordScore(c.modeId, correct);

      const got = UI.award({
        xp: netXp, bonus: S.streakBonus(), accuracy,
        coins: coinsEarned + (perfect ? 30 : 0)
      });

      UI.results({
        title: reason ? reason : "Run complete",
        correct, total: seen, xp: got.xp, coins: got.coins, newBest,
        extraStats: [
          ["Best streak", bestStreak],
          ["Wrong", "−" + penalty + " XP"],
          rushed ? ["Rushed", rushed] : ["Multiplier", "×" + multiplier()]
        ],
        onAgain: () => UI.handleRoute()
      });
    }

    renderQuestion();
  }

  return { start };
})();
