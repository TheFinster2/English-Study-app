/* ESSAY ARCHITECT — assemble a paragraph or an essay skeleton from shuffled cards.
   ============================================================================
   Authored answer-first: the correct prose was written continuous and then split, so
   there is exactly one valid ordering (validate.js verifies this independently).

   Two anti-farm details from the addendum:

   C1 — no per-item score floor. A flailing player does eventually place every card, so
        a floor plus "items solved / items total" accuracy pays them the whole run. XP
        here is scaled by EFFICIENCY: ideal placements over placements actually spent,
        wasted attempts included.

   C2 — Reset carries its cost across. The reset button is needed, because a wrong early
        placement can strand you. But if it cleared the wasted counter, the cheapest
        strategy would be "try everything, note what worked, reset, do it cleanly for
        full marks". So the wasted attempts and the moves already spent are charged to
        the puzzle before the board clears.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.essay = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  function start(root, cfg) {
    const c = Object.assign({ modeId: "essay", title: "🧱 Essay Architect",
                              count: 3, kind: null, mod: null }, cfg);

    let pool = EN.Bank.puzzles();
    const activeIds = EN.Bank.activeTextIds();
    pool = pool.filter(p => !p.text || activeIds.includes(p.text));
    if (c.kind) pool = pool.filter(p => p.kind === c.kind);
    if (c.mod) pool = pool.filter(p => p.mod === c.mod);
    if (!pool.length) pool = EN.Bank.puzzles();

    const items = U.sample(pool, Math.min(c.count, pool.length));
    if (!items.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🧱" }),
        U.el("p", { text: "No puzzles available for that selection." })
      ]));
      return;
    }

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    let idx = 0, solved = 0, xp = 0, coins = 0, finished = false;
    let totalIdeal = 0, totalSpent = 0;

    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const progChip = UI.chip("1 / " + items.length);
    const effChip = UI.chip("Efficiency —");
    const scoreChip = UI.chip("0 XP");
    [progChip, effChip, scoreChip].forEach(n => shell.meta.appendChild(n));
    const stage = U.el("div");
    shell.body.appendChild(stage);

    function render() {
      stage.innerHTML = "";
      const p = items[idx];
      progChip.textContent = (idx + 1) + " / " + items.length;

      /* `cards` are stored in correct order; shuffle for play. Seeded from the puzzle id
         so a given puzzle deals the same way each time — the student is learning an
         ordering, not a new shuffle. */
      const rng = U.seededRandom(U.hash(p.id));
      const dealt = U.seededShuffle(p.cards.map((card, i) => ({ card, correct: i })), rng);

      const placed = [];          // indices into `dealt`
      let wasted = 0;             // wrong placements, carried across resets
      let carried = 0;            // moves charged by a previous reset
      let done = false;
      const ideal = p.cards.length;

      const track = U.el("div", { class: "ea-track" });
      const pool = U.el("div", { class: "ea-pool" });
      const poolBtns = [];

      const head = U.el("div", { class: "grid" }, [
        U.el("div", { class: "qtag" }, [
          U.el("span", { class: "chip", text: p.kind === "essay" ? "Essay skeleton" : "Paragraph" }),
          U.el("span", { class: "chip", text: EN.Bank.moduleLabel(p.mod) }),
          p.text ? U.el("span", { class: "chip", text: (EN.Bank.text(p.text) || {}).title || p.text }) : null,
          U.el("span", { class: "chip", text: "★".repeat(p.diff || 1) })
        ]),
        U.el("h3", { text: p.title }),
        U.el("p", { class: "muted", text: p.task })
      ]);

      stage.appendChild(head);
      stage.appendChild(track);
      const poolHead = U.el("h2", { class: "ea-pool-head", text: "Cards" });
      stage.appendChild(poolHead);
      stage.appendChild(pool);

      /* Sticky, because it was not reachable. Placing the last card is the moment the
         student needs this button, and that is exactly the moment the page is at its
         longest — track full, pool still rendered — so "Check the order" sat below the
         fold behind the nav bar with nothing on screen suggesting it existed. It now pins
         above the nav bar whenever the puzzle is complete. */
      const controls = U.el("div", { class: "row ea-actions", style: "margin-top:12px" });
      const resetBtn = U.el("button", { class: "btn btn-ghost btn-sm", text: "↺ Reset this puzzle" });
      const submitBtn = U.el("button", { class: "btn btn-primary js-submit", text: "Check the order", disabled: true });
      controls.appendChild(resetBtn);
      controls.appendChild(U.el("div", { class: "spacer" }));
      controls.appendChild(submitBtn);
      stage.appendChild(controls);

      dealt.forEach((d, i) => {
        const b = U.el("button", { class: "ea-card", type: "button", text: d.card.text });
        b.addEventListener("click", () => {
          if (done || b.disabled) return;
          place(i);
        });
        poolBtns.push(b);
        pool.appendChild(b);
      });

      function drawTrack() {
        track.innerHTML = "";
        if (!placed.length) {
          track.appendChild(U.el("div", { class: "ea-empty",
            text: "Tap cards below to build the " + (p.kind === "essay" ? "skeleton" : "paragraph") + " in order." }));
        }
        placed.forEach((di, slot) => {
          const d = dealt[di];
          /* The grade is rendered HERE rather than stamped on afterwards. It used to be
             applied to the rows and then drawTrack() was called, which starts by emptying
             the track — so the classes were wiped in the same tick and the student clicked
             "Check the order" and watched nothing happen. */
          const grade = !done ? "" : d.correct === slot ? " right" : " wrongslot";
          const row = U.el("div", { class: "ea-slot" + grade }, [
            U.el("div", { class: "ea-slot-role", text: roleName(d.card.role) }),
            U.el("div", { class: "ea-slot-text", text: d.card.text }),
            done ? null : U.el("button", { class: "ea-slot-x", type: "button", text: "✕",
              title: "Take this card back",
              on: { click: () => { unplace(slot); } } })
          ]);
          track.appendChild(row);
        });
        const ready = placed.length === dealt.length && !done;
        submitBtn.disabled = !ready;
        controls.classList.toggle("stuck", ready);
        /* The pool collapses as it empties rather than holding a column of greyed-out
           cards, which is what pushed the button off screen in the first place. */
        const spent = placed.length === dealt.length;
        pool.classList.toggle("spent", spent);
        poolHead.classList.toggle("spent", spent);
      }

      function place(i) {
        placed.push(i);
        poolBtns[i].disabled = true;
        EN.Sound.cellSet();
        drawTrack();
      }
      function unplace(slot) {
        const i = placed.splice(slot, 1)[0];
        poolBtns[i].disabled = false;
        /* Taking a card back is a wasted move. Without this, the mode is free to brute
           force: place, check, take back, repeat. */
        wasted++;
        EN.Sound.erase();
        drawTrack();
        updateEff();
      }

      function movesSpent() { return carried + placed.length + wasted; }
      function updateEff() {
        const eff = movesSpent() ? Math.min(1, ideal / movesSpent()) : 1;
        effChip.textContent = "Efficiency " + Math.round(eff * 100) + "%";
      }

      resetBtn.addEventListener("click", () => {
        if (done) return;
        /* C2 — carry the cost across. The moves already taken AND the wasted attempts are
           charged to the puzzle before the board clears, so a reset is a real decision
           rather than a free undo. */
        carried = movesSpent();
        wasted = 0;
        placed.length = 0;
        poolBtns.forEach(b => (b.disabled = false));
        EN.Sound.erase();
        UI.toast({ icon: "↺", text: "Board cleared — the " + carried + " moves you already spent still count." });
        drawTrack();
        updateEff();
      });

      submitBtn.addEventListener("click", () => {
        if (done) return;
        done = true;
        submitBtn.remove();
        resetBtn.disabled = true;

        let rightPlaces = 0;
        placed.forEach((di, slot) => {
          if (dealt[di].correct === slot) rightPlaces++;
          else wasted++;
        });
        const allRight = rightPlaces === dealt.length;
        drawTrack();   // `done` is true now, so this is the pass that paints the grade

        const spent = Math.max(ideal, movesSpent());
        const efficiency = Math.min(1, ideal / spent);
        totalIdeal += ideal; totalSpent += spent;
        updateEff();

        /* No per-item floor (C1). A flailing run reaches the answer eventually and its
           efficiency is terrible, so the payout is too. */
        const gain = allRight ? Math.round(34 * efficiency) : Math.round(10 * efficiency * (rightPlaces / dealt.length));
        xp += gain;
        coins += allRight ? Math.round(5 * efficiency) : 0;
        scoreChip.textContent = xp + " XP";

        if (allRight) {
          solved++;
          S.bump("essaysAssembled");
          S.data.puzzlesSolved[p.id] = Date.now();
          S.save();
          S.progressDaily("essay", 1);
          EN.Sound.gridClear();
          EN.FX.marked(window.innerWidth / 2, window.innerHeight * 0.35);
        } else {
          EN.Sound.wrong();
        }
        S.recordAnswer(p.mod, allRight, null, p.text);

        stage.appendChild(U.el("div", { class: "feedback " + (allRight ? "ok" : "no"), style: "margin-top:14px" }, [
          U.el("div", {}, [
            U.el("b", { text: allRight ? "That is the order. " : rightPlaces + " of " + dealt.length + " in the right place. " }),
            U.el("span", { text: p.why })
          ]),
          U.el("div", { class: "tiny muted", style: "margin-top:8px",
            text: "Efficiency " + Math.round(efficiency * 100) + "% — " + ideal + " placements needed, " + spent + " spent." })
        ]));

        const isLast = idx >= items.length - 1;
        stage.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [
          U.el("button", { class: "btn btn-primary", text: isLast ? "See results" : "Next puzzle →",
            on: { click: () => { if (isLast) return finish(); idx++; EN.Sound.page(); render(); window.scrollTo({ top: 0 }); } } })
        ]));
      });

      drawTrack();
      updateEff();
    }

    function roleName(id) {
      const r = EN.DATA.paragraphRoles.find(x => x.id === id);
      return r ? r.name : id;
    }

    function finish() {
      if (finished) return;
      finished = true;
      const newBest = S.recordScore(c.modeId, solved);
      if (solved === items.length && items.length >= 2) { S.bump("perfectRuns"); EN.Sound.perfect(); }

      /* The completion bonus is gated on EFFICIENCY, not on items solved. "Got there in
         the end" must not score as full accuracy (C1). */
      const efficiency = totalSpent ? Math.min(1, totalIdeal / totalSpent) : 0;
      const got = UI.award({ xp, bonus: S.streakBonus(), accuracy: efficiency, coins });

      UI.results({
        title: "Assembly complete",
        correct: solved, total: items.length, xp: got.xp, coins: got.coins, newBest,
        scoreLabel: "Solved",
        extraStats: [["Efficiency", Math.round(efficiency * 100) + "%"],
                     ["Placements", totalSpent + "/" + totalIdeal]],
        note: "The bonus is scaled by efficiency, not by whether you got there — taking cards back and resetting both cost.",
        onAgain: () => UI.handleRoute()
      });
    }

    render();
  }

  return { start };
})();
