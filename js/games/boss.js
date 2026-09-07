/* MODULE BOSSES — five HP duels, each with a gimmick, then The Final Paper.
   ============================================================================
   The gimmicks are not cosmetic; each one attacks a different habit:

     The Party      rewrites one of your previously-correct answers as wrong and waits
                    for you to notice — the Common Module's whole subject, made playable
     The Double     questions arrive as a pair, one from each Module A text; answer both
                    or neither counts, which is the module's actual demand
     The Critic     hides the technique names, so you reason from the quote alone
     The Blank Page a timed assembly gauntlet in the Essay Architect rather than MCQ
     The Examiner   randomises which power-ups exist each turn, and the clock shortens
                    as its HP drops

   Beating one unlocks the next; all five unlock The Final Paper.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.boss = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  const BOSSES = [
    { id:"party", name:"The Party", icon:"👁️", mod:"common", hp:9, playerHp:5, perQ:26,
      gimmick:"rewrite",
      blurb:"Each round it edits one answer you already got right. Notice, and re-answer it.",
      quip:"We have always been at war with your previous answer." },
    { id:"double", name:"The Double", icon:"🔁", mod:"moduleA", hp:10, playerHp:5, perQ:34,
      gimmick:"pair",
      blurb:"Every question comes as a pair, one from each text. Both or neither counts.",
      quip:"You cannot answer one of us." },
    { id:"critic", name:"The Critic", icon:"🔬", mod:"moduleB", hp:10, playerHp:4, perQ:30,
      gimmick:"blind",
      blurb:"Technique names are hidden. Reason from the quote.",
      quip:"Name it without the label, or do not name it." },
    { id:"blankpage", name:"The Blank Page", icon:"📄", mod:"moduleC", hp:8, playerHp:4, perQ:0,
      gimmick:"assembly",
      blurb:"No multiple choice. Build paragraphs against a clock.",
      quip:"Nothing is written yet. That is the problem." },
    { id:"examiner", name:"The Examiner", icon:"🎩", mod:null, hp:12, playerHp:5, perQ:28,
      gimmick:"shifting",
      blurb:"Power-ups are randomised each turn and the clock tightens as its HP falls.",
      quip:"Read the question. Then read it again." }
  ];

  const unlocked = id => {
    const i = BOSSES.findIndex(b => b.id === id);
    if (i <= 0) return true;
    return !!S.data.bossesBeaten[BOSSES[i - 1].id];
  };
  const allBeaten = () => BOSSES.every(b => S.data.bossesBeaten[b.id]);

  function start(root, args) {
    const id = args && args[0];
    if (id === "final") return finalPaper(root);
    const boss = BOSSES.find(b => b.id === id);
    if (!boss) return chooser(root);
    if (!unlocked(boss.id)) {
      UI.toast({ icon: "🔒", kind: "bad", text: "Beat the previous boss first." });
      return chooser(root);
    }
    if (boss.gimmick === "assembly") return assemblyBoss(root, boss);
    return duel(root, boss);
  }

  function chooser(root) {
    const shell = UI.gameShell("⚔️ Module Bosses", { backTo: "/play" });
    root.appendChild(shell.root);
    shell.body.appendChild(U.el("p", { class: "muted",
      text: "Five HP duels, one per module plus a mixed one. Each has a gimmick that attacks a different habit. Beat one to unlock the next." }));
    const grid = U.el("div", { class: "grid g2" });
    BOSSES.forEach(b => {
      const open = unlocked(b.id), beaten = !!S.data.bossesBeaten[b.id];
      const card = U.el("button", { class: "game-card" + (open ? "" : " locked"), type: "button",
                                    style: "--gc:var(--bad)" }, [
        U.el("div", { class: "game-ico", text: b.icon }),
        U.el("div", { class: "game-name", text: b.name }),
        U.el("div", { class: "game-desc", text: b.blurb }),
        U.el("div", { class: "game-foot" }, [
          U.el("span", { text: b.mod ? EN.Bank.moduleLabel(b.mod) : "Mixed" }),
          U.el("span", { text: "· " + b.hp + " HP" }),
          beaten ? U.el("span", { class: "chip good lock-tag", text: "✓ beaten" })
                 : open ? null : U.el("span", { class: "chip lock-tag", text: "🔒 locked" })
        ])
      ]);
      if (open) card.addEventListener("click", () => UI.go("/boss/" + b.id));
      grid.appendChild(card);
    });
    shell.body.appendChild(grid);

    const final = U.el("button", { class: "game-card" + (allBeaten() ? " flagship" : " locked"), type: "button",
                                   style: "--gc:var(--warn)" }, [
      U.el("div", { class: "game-ico", text: "📜" }),
      U.el("div", { class: "game-name", text: "The Final Paper" }),
      U.el("div", { class: "game-desc", text: "A mixed 25-question gauntlet across all four modules. One life." }),
      U.el("div", { class: "game-foot" }, [
        U.el("span", { text: allBeaten() ? "Unlocked" : "Beat all five bosses first" })
      ])
    ]);
    if (allBeaten()) final.addEventListener("click", () => UI.go("/boss/final"));
    shell.body.appendChild(U.el("h2", { text: "The Final Paper" }));
    shell.body.appendChild(final);
  }

  /* ── the MCQ duel ─────────────────────────────────────────── */
  function duel(root, boss) {
    S.markMode("boss:" + boss.id);
    S.touchStreak();
    EN.Sound.bossIntro();

    const perPair = boss.gimmick === "pair" ? 2 : 1;
    const need = boss.hp * perPair + 8;
    const drawOpts = boss.mod ? { mods: [boss.mod] } : {};
    let queue = EN.Bank.draw(need, drawOpts);
    if (queue.length < 4) queue = EN.Bank.draw(need, {});

    /* The Double needs one question from each Module A text per round, so build the
       pairs explicitly rather than hoping the draw alternates. */
    let pairPool = null;
    if (boss.gimmick === "pair") {
      const [t1, t2] = EN.State.activeTexts().moduleA || [];
      const a = EN.Bank.draw(boss.hp + 4, { texts: [t1] });
      const b = EN.Bank.draw(boss.hp + 4, { texts: [t2] });
      if (a.length && b.length) {
        pairPool = [];
        for (let i = 0; i < Math.min(a.length, b.length); i++) pairPool.push([a[i], b[i]]);
      }
    }

    let bossHp = boss.hp, myHp = boss.playerHp, round = 0;
    let xp = 0, coins = 0, answered = 0, right = 0, finished = false;
    let timerId = null, timeLeft = 0, minRead = 800, shownAt = 0, rush = null;
    /* The Party's gimmick state: questions already answered correctly, one of which gets
       "rewritten" each round. */
    const answeredRight = [];
    let rewritten = null, lastRewrite = -99;

    const shell = UI.gameShell(boss.icon + " " + boss.name, { confirmExit: true, backTo: "/boss" });
    root.appendChild(shell.root);

    /* Real progressbar semantics, because unlike the mastery bars elsewhere these have NO
       text equivalent — HP is shown only as a bar, so without this a screen-reader user
       cannot tell whether they are winning. drawBars keeps aria-valuenow in step. */
    const bossBar = U.el("div", { class: "hpbar enemy", role: "progressbar",
                                  "aria-label": boss.name + " health",
                                  "aria-valuemin": "0", "aria-valuemax": String(boss.hp),
                                  "aria-valuenow": String(boss.hp) },
                         [U.el("i", { style: "width:100%" })]);
    const myBar = U.el("div", { class: "hpbar", role: "progressbar", "aria-label": "Your health",
                                "aria-valuemin": "0", "aria-valuemax": String(boss.playerHp),
                                "aria-valuenow": String(boss.playerHp) },
                       [U.el("i", { style: "width:100%" })]);
    const timeChip = U.el("span", { class: "timer-ring", "aria-live": "off", role: "timer", text: "" });
    shell.meta.appendChild(timeChip);
    shell.body.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "row", style: "margin-bottom:6px" }, [
        U.el("span", { style: "font-size:22px", text: boss.icon }),
        U.el("b", { text: boss.name }),
        U.el("div", { class: "spacer" }),
        U.el("span", { class: "tiny muted", text: boss.blurb })
      ]),
      bossBar,
      U.el("div", { class: "row", style: "margin-top:12px" }, [
        U.el("span", { text: "🖋️" }), U.el("span", { class: "tiny", text: "You" })
      ]),
      myBar
    ]));
    shell.body.appendChild(U.el("p", { class: "muted", style: "font-style:italic", text: "“" + boss.quip + "”" }));

    const stage = U.el("div");
    shell.body.appendChild(stage);
    UI.onLeave(() => { clearInterval(timerId); if (rush) rush.stop(); });

    function drawBars() {
      bossBar.firstChild.style.width = Math.max(0, (bossHp / boss.hp) * 100) + "%";
      myBar.firstChild.style.width = Math.max(0, (myHp / boss.playerHp) * 100) + "%";
      bossBar.setAttribute("aria-valuenow", String(Math.max(0, bossHp)));
      bossBar.setAttribute("aria-valuetext", Math.max(0, bossHp) + " of " + boss.hp + " left");
      myBar.setAttribute("aria-valuenow", String(Math.max(0, myHp)));
      myBar.setAttribute("aria-valuetext", Math.max(0, myHp) + " of " + boss.playerHp + " left");
      if (myHp === 1) EN.Sound.lowHealth();
    }

    function clockFor() {
      /* The Examiner's clock tightens as its HP falls. Everyone else gets a fixed
         allowance, still budgeted against reading time rather than a flat number. */
      const base = boss.gimmick === "shifting"
        ? boss.perQ * (0.6 + 0.4 * (bossHp / boss.hp))
        : boss.perQ;
      return base;
    }

    function nextRound() {
      stage.innerHTML = "";
      clearInterval(timerId);
      round++;

      /* The Party edits one previously-correct answer and waits. Answering it again is
         worth a hit; ignoring it costs you one. */
      /* ── The Party's gimmick, and how it must NOT work ─────────
         This used to shift `a` to a different option while leaving the four choices
         untouched. The correct answer was therefore silently redefined as a wrong one, so
         a student who picked the true answer — the one they had already been told was
         right — was marked wrong and took damage. Its own `why` text said "the answer you
         gave before is still the right one" while the scoring said the opposite, and
         there was no way to work out what it wanted, because what it wanted was false.

         The fantasy only works the other way round. The Party falsifies the RECORD, not
         the truth: it claims you answered something else, and the task is to hold to the
         real answer anyway. So the key stays true, the falsification is stated out loud,
         and the question is answerable by knowing the text — which is the entire point of
         having a boss about Orwell. */
      /* Trigger, retuned. It used to need `round % 2 === 0` AND two correct answers, so
         the earliest it could fire was round 4 — and The Party has 9 HP against 2 damage a
         hit, so a competent player wins in five rounds. The boss's signature gimmick was
         firing once, just before it died, or not at all. It now fires from the third round
         with a two-round cooldown. */
      if (boss.gimmick === "rewrite" && answeredRight.length >= 2 && !rewritten &&
          round >= 3 && round - lastRewrite >= 2) {
        lastRewrite = round;
        rewritten = answeredRight[Math.floor(Math.random() * answeredRight.length)];
        /* The Party's false claim: any option that is not the real answer. */
        const wrongIdx = (rewritten.a + 1 + Math.floor(Math.random() * (rewritten.choices.length - 1)))
                         % rewritten.choices.length;
        const fake = Object.assign({}, rewritten, {
          partyClaim: rewritten.choices[wrongIdx],
          why: "The record was falsified. The answer you gave the first time was correct then and is correct now — " +
               rewritten.why
        });
        renderQuestion([fake], true);
        return;
      }

      if (boss.gimmick === "pair" && pairPool && pairPool.length) {
        renderQuestion(pairPool.shift(), false);
        return;
      }
      if (!queue.length) queue = EN.Bank.draw(8, drawOpts);
      renderQuestion([queue.shift()], false);
    }

    function renderQuestion(qs, isRewrite) {
      const wrap = U.el("div", { class: "grid" });
      /* Name the falsification. The student has to be able to see WHAT was altered,
         otherwise the round is a guess dressed up as a theme. */
      if (isRewrite) wrap.appendChild(U.el("div", { class: "feedback no" }, [
        U.el("b", { text: "The record has been corrected. " }),
        U.el("span", { text: "You answered this before, and the Party has amended what you said." }),
        qs[0].partyClaim ? U.el("div", { class: "party-claim" }, [
          U.el("div", { class: "tiny muted", text: "The record now shows you answered:" }),
          U.el("div", { class: "party-claim-text", text: "“" + qs[0].partyClaim + "”" })
        ]) : null,
        U.el("div", { class: "tiny", style: "margin-top:8px",
          text: "You did not. Answer it truthfully again — the right answer has not changed." })
      ]));
      if (qs.length > 1) wrap.appendChild(U.el("div", { class: "feedback" }, [
        U.el("b", { text: "Both, or neither. " }),
        U.el("span", { text: "One question from each text of your pairing." })
      ]));

      const cards = qs.map((q, qi) => {
        const card = EN.QuizCore.buildCard(q, {
          showTags: true, index: qi, total: qs.length > 1 ? qs.length : 0,
          onAnswer: (chosen, ok, btn) => pick(qi, chosen, ok, btn)
        });
        /* The Critic hides technique names in the options, so the student reasons from
           the quote rather than recognising a label. */
        if (boss.gimmick === "blind") {
          card.buttons.forEach(b => {
            const label = b.lastChild;
            const txt = label.textContent;
            label.textContent = txt.replace(
              new RegExp("\\b(" + EN.Bank.techniques().map(t => t.name).join("|") + ")\\b", "gi"),
              m => "▮".repeat(Math.min(9, m.length)));
          });
        }
        wrap.appendChild(card.node);
        return card;
      });
      stage.appendChild(wrap);

      const chosen = new Array(qs.length).fill(null);
      const results = new Array(qs.length).fill(null);
      shownAt = performance.now();
      minRead = UI.rushFloor({ read: cards.map(c => c.readProse).join(" "),
                               scan: cards.map(c => c.scanWords).join(" ") }, clockFor());
      if (rush) rush.stop();
      rush = UI.rushHint(minRead);
      shell.meta.appendChild(rush.node);

      timeLeft = Math.round(UI.timeBudget(clockFor(), cards.map(c => c.readWords).join(" ")));
      timeChip.textContent = U.fmtTime(timeLeft);
      timerId = setInterval(() => {
        timeLeft--;
        timeChip.textContent = U.fmtTime(Math.max(0, timeLeft));
        timeChip.classList.toggle("low", timeLeft <= 8);
        if (timeLeft <= 3 && timeLeft > 0) EN.Sound.tickUrgent();
        if (timeLeft <= 0) { clearInterval(timerId); resolve(true); }
      }, 1000);

      function pick(qi, ci, ok, btn) {
        chosen[qi] = ci; results[qi] = ok;
        cards[qi].reveal(ci);
        if (chosen.every(x => x !== null)) { clearInterval(timerId); resolve(false); }
      }

      function resolve(ranOut) {
        if (rush) { rush.stop(); rush.node.remove(); }
        cards.forEach((c, i) => { if (chosen[i] === null) c.reveal(-1); });
        const tooFast = performance.now() - shownAt < minRead;
        // Pair boss: both or neither.
        const ok = !ranOut && results.every(r => r === true);

        qs.forEach((q, i) => {
          answered++;
          if (results[i]) right++;
          S.recordAnswer(q.mod, !!results[i], q.id, q.text, q.topic);
          if (results[i] && !isRewrite && answeredRight.length < 12) answeredRight.push(q);
        });
        if (isRewrite) rewritten = null;

        if (ok) {
          const dmg = tooFast ? 1 : 2;
          bossHp -= dmg;
          xp += tooFast ? 0 : 16;
          coins += tooFast ? 0 : 3;
          EN.Sound.crit();
          EN.FX.sparks(window.innerWidth * 0.6, window.innerHeight * 0.3, -0.6);
          if (tooFast) UI.toast({ icon: "⏱️", kind: "bad", text: "Rushed — glancing blow, no XP." });
        } else {
          myHp--;
          EN.Sound.playerHurt();
          EN.FX.shake();
        }
        drawBars();

        const done = bossHp <= 0 || myHp <= 0;
        stage.appendChild(U.el("div", { class: "row", style: "margin-top:14px" }, [
          /* js-next so the global Enter binding in app.js reaches it — every other mode
             has it and the bosses did not, which quietly made them mouse-only. */
          U.el("button", { class: "btn btn-primary js-next",
            text: done ? "See the outcome" : bossHp <= 2 ? "Finish it →" : "Next round →",
            on: { click: () => { if (done) return end(); EN.Sound.page(); nextRound(); window.scrollTo({ top: 0 }); } } })
        ]));
      }
    }

    function end() {
      if (finished) return;
      finished = true;
      clearInterval(timerId);
      const won = bossHp <= 0;
      const flawless = won && myHp === boss.playerHp;
      const clutch = won && myHp === 1;

      if (won) {
        S.data.bossesBeaten[boss.id] = Date.now();
        S.bump("bossWins");
        if (flawless) S.bump("flawlessBoss");
        if (clutch) S.bump("clutchWins");
        S.save();
        EN.Sound.bossDefeat();
        EN.FX.confetti(130);
      } else EN.Sound.lose();

      const got = UI.award({
        xp: won ? xp + 120 : xp, bonus: won ? S.streakBonus() : 0,
        accuracy: answered ? right / answered : 0,
        coins: coins + (won ? 90 : 0)
      });

      UI.results({
        title: won ? boss.name + " defeated" : boss.name + " wins",
        correct: right, total: answered, xp: got.xp, coins: got.coins,
        rank: won ? (flawless ? { rank: "S", cls: "rank-s", blurb: "Untouched. Nothing to add." }
                              : { rank: "A", cls: "rank-a", blurb: "Beaten. Next one is unlocked." })
                  : { rank: "D", cls: "rank-d", blurb: "It held. Drill the module and come back." },
        extraStats: [["Boss HP", Math.max(0, bossHp)], ["Your HP", Math.max(0, myHp)],
                     [flawless ? "Flawless" : clutch ? "Clutch" : "Rounds", flawless ? "yes" : clutch ? "yes" : round]],
        gate: true, gateLabel: won ? "See the outcome ↑" : "See what happened ↑",
        onAgain: () => UI.go("/boss/" + boss.id)
      });
    }

    drawBars();
    nextRound();
  }

  /* ── The Blank Page: an assembly gauntlet rather than MCQ ─── */
  function assemblyBoss(root, boss) {
    S.markMode("boss:" + boss.id);
    EN.Sound.bossIntro();
    const shell = UI.gameShell(boss.icon + " " + boss.name, { confirmExit: true, backTo: "/boss" });
    root.appendChild(shell.root);
    shell.body.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { style: "font-size:22px", text: boss.icon }),
        U.el("b", { text: boss.name }),
        U.el("div", { class: "spacer" }),
        U.el("span", { class: "tiny muted", text: boss.blurb })
      ]),
      U.el("p", { class: "muted", style: "font-style:italic; margin-top:10px", text: "“" + boss.quip + "”" }),
      U.el("p", { class: "tiny muted",
        text: "Four puzzles, no clock per card but an efficiency requirement: finish with 70% efficiency or better and it falls." })
    ]));
    const hostBtn = U.el("button", { class: "btn btn-primary btn-block", text: "Begin" });
    shell.body.appendChild(hostBtn);
    hostBtn.addEventListener("click", () => {
      /* Delegate to the Essay Architect and read the outcome from the recorded score.
         Rather than duplicating the assembly UI, the boss wraps it — which also means the
         efficiency anti-farm in essayarch.js applies here unchanged. */
      const before = S.data.stats.essaysAssembled || 0;
      root.innerHTML = "";
      EN.Games.essay.start(root, { modeId: "boss:blankpage", title: boss.icon + " " + boss.name, count: 4 });
      const check = setInterval(() => {
        if (!document.body.contains(root)) { clearInterval(check); return; }
        const gained = (S.data.stats.essaysAssembled || 0) - before;
        if (gained >= 4 && !S.data.bossesBeaten[boss.id]) {
          clearInterval(check);
          S.data.bossesBeaten[boss.id] = Date.now();
          S.bump("bossWins");
          S.save();
          EN.Sound.bossDefeat();
          EN.FX.confetti(130);
          UI.toast({ icon: "📄", kind: "good", ms: 5000,
            text: "<b>The Blank Page falls.</b> Four paragraphs assembled." });
          UI.award({ xp: 140, coins: 90, accuracy: 1 });
        }
      }, 1200);
      UI.onLeave(() => clearInterval(check));
    });
  }

  /* ── The Final Paper ──────────────────────────────────────── */
  function finalPaper(root) {
    if (!allBeaten()) {
      UI.toast({ icon: "🔒", kind: "bad", text: "Beat all five bosses first." });
      return chooser(root);
    }
    /* One life, 25 questions, every module. Uses the quiz engine so all the anti-farm
       gates apply without duplication. */
    const qs = EN.DATA.modules.flatMap(m => EN.Bank.draw(7, { mods: [m.id] })).slice(0, 25);
    EN.Games.quiz.start(root, {
      modeId: "finalpaper", title: "📜 The Final Paper",
      questions: U.shuffle(qs), lives: 1, backTo: "/boss"
    });
  }

  return { start, BOSSES, unlocked, allBeaten };
})();
