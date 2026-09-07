/* BAND GRID — fill a grid against the clock: which band does each statement describe?
   ============================================================================
   Five options per cell rather than two, so chance is 20% rather than 50% — but the
   §9.6/C4 problems still apply and both fixes are here:

     • the drawn mix is CONSTRAINED, not trusted to the RNG. A grid that came up mostly
       one band would make "tap the same column all the way down" a legitimately perfect
       score, which is exactly how a solubility grid in the reference app paid 363 XP for
       sixteen identical taps.
     • scoring is NET — max(0, right − wrong) — and the time bonus needs 65% before it
       exists, so a guessed grid is worth close to nothing.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.bandgrid = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;
  const BANDS = [6, 5, 4, 3, 2];

  /** Draw `rows` statements with no band holding more than `maxShare` of them. */
  function drawRows(rows) {
    const pool = EN.DATA.bandStatements;
    const maxShare = 0.45;
    const cap = Math.max(2, Math.ceil(rows * maxShare));
    for (let attempt = 0; attempt < 40; attempt++) {
      const picked = U.sample(pool, rows);
      const counts = {};
      picked.forEach(p => (counts[p.band] = (counts[p.band] || 0) + 1));
      const worst = Math.max(...Object.values(counts));
      const distinct = Object.keys(counts).length;
      if (worst <= cap && distinct >= 3) return picked;
    }
    /* Fall back to a deliberately balanced draw rather than shipping a trivial board. */
    const byBand = {};
    pool.forEach(p => (byBand[p.band] || (byBand[p.band] = [])).push(p));
    const out = [];
    let i = 0;
    while (out.length < rows && i < rows * 5) {
      const b = BANDS[i % BANDS.length]; i++;
      const bucket = (byBand[b] || []).filter(p => !out.includes(p));
      if (bucket.length) out.push(U.pick(bucket));
    }
    return out;
  }

  function start(root, cfg) {
    const c = Object.assign({ modeId: "bandgrid", title: "⏱️ Band Grid", rows: 8 }, cfg);
    const rows = drawRows(Math.min(c.rows, EN.DATA.bandStatements.length));
    if (rows.length < 4) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "⏱️" }),
        U.el("p", { text: "Not enough band statements to build a grid." })
      ]));
      return;
    }

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    /* The clock is budgeted against the actual reading load, not a flat number, so
       Nightmare removes thinking time rather than reading time. */
    const allText = rows.map(r => r.text).join(" ");
    let timeLeft = UI.timeBudget(20 + rows.length * 9, allText);
    let timerId = null, finished = false, submitted = false;
    const picks = new Array(rows.length).fill(null);

    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const filledChip = UI.chip("0 / " + rows.length);
    const timeChip = U.el("span", { class: "timer-ring", "aria-live": "off", role: "timer", text: U.fmtTime(timeLeft) });
    shell.meta.appendChild(filledChip); shell.meta.appendChild(timeChip);

    shell.body.appendChild(U.el("p", { class: "muted",
      text: "Which band does each statement describe? Net scored — a wrong cell cancels a right one." }));

    const wrap = U.el("div", { class: "bg-wrap" });
    const table = U.el("table", { class: "bg-table" });
    const thead = U.el("thead", {}, [U.el("tr", {}, [U.el("th", { text: "" })]
      .concat(BANDS.map(b => U.el("th", { text: "Band " + b }))))]);
    const tbody = U.el("tbody");
    table.appendChild(thead); table.appendChild(tbody);
    wrap.appendChild(table);
    shell.body.appendChild(wrap);

    const cells = rows.map((r, ri) => {
      const tr = U.el("tr");
      tr.appendChild(U.el("td", { class: "bg-stmt", text: r.text }));
      const rowBtns = BANDS.map(b => {
        const td = U.el("td");
        const btn = U.el("button", { class: "bg-cell", type: "button", text: String(b) });
        btn.addEventListener("click", () => {
          if (submitted) return;
          picks[ri] = b;
          rowBtns.forEach(x => x.classList.remove("picked"));
          btn.classList.add("picked");
          EN.Sound.cellSet();
          filledChip.textContent = picks.filter(Boolean).length + " / " + rows.length;
          const ready = !picks.some(p => p === null);
          submit.disabled = !ready;
          submitBar.classList.toggle("stuck", ready);
        });
        td.appendChild(btn);
        tr.appendChild(td);
        return btn;
      });
      tbody.appendChild(tr);
      return rowBtns;
    });

    /* Sticky once the grid is complete. Eight statement rows plus a five-column header is
       taller than a phone, so this sat at y=874 in an 844px viewport — measured, not
       guessed. Same treatment as the Essay Architect and the Marking Desk. */
    const submitBar = U.el("div", { class: "bg-actions" });
    const submit = U.el("button", { class: "btn btn-primary btn-block js-submit", text: "Submit grid", disabled: true });
    submitBar.appendChild(submit);
    shell.body.appendChild(submitBar);
    submit.addEventListener("click", () => score(false));

    timerId = setInterval(() => {
      timeLeft--;
      timeChip.textContent = U.fmtTime(Math.max(0, timeLeft));
      timeChip.classList.toggle("low", timeLeft <= 10);
      if (timeLeft <= 5 && timeLeft > 0) EN.Sound.tickUrgent();
      if (timeLeft <= 0) { EN.Sound.timeout(); score(true); }
    }, 1000);
    UI.onLeave(() => clearInterval(timerId));

    function score(ranOut) {
      if (submitted) return;
      submitted = true;
      clearInterval(timerId);
      submitBar.remove();

      let right = 0, wrong = 0, blank = 0;
      rows.forEach((r, ri) => {
        const pick = picks[ri];
        cells[ri].forEach(b => (b.disabled = true));
        if (pick === null) { blank++; return; }
        const bi = BANDS.indexOf(pick);
        if (pick === r.band) { right++; cells[ri][bi].classList.add("right"); }
        else {
          wrong++;
          cells[ri][bi].classList.add("wrongc");
          cells[ri][BANDS.indexOf(r.band)].classList.add("right");
        }
      });

      // Net score, floored at zero (§9.6).
      const net = Math.max(0, right - wrong);
      const answered = right + wrong;
      const accuracy = answered ? right / answered : 0;
      const perfect = wrong === 0 && blank === 0;
      if (perfect) { S.bump("perfectGrids"); S.bump("perfectRuns"); EN.Sound.perfect(); }
      else EN.Sound.gridClear();
      S.bump("gridsCleared");
      S.progressDaily("bandgrid", 1);
      rows.forEach((r, ri) => S.recordAnswer(null, picks[ri] === r.band, null, null, "Bands"));

      // No time bonus below 65% — a fast wrong grid must not outscore a slow right one.
      const timeBonus = accuracy >= 0.65 ? Math.max(0, Math.round(timeLeft * 1.2)) : 0;
      const newBest = S.recordScore(c.modeId, net);
      const got = UI.award({
        xp: net * 9 + timeBonus, bonus: S.streakBonus(), accuracy,
        coins: net * 2 + (perfect ? 15 : 0)
      });

      UI.results({
        title: ranOut ? "Time" : "Grid submitted",
        correct: right, total: rows.length, xp: got.xp, coins: got.coins, newBest,
        scoreLabel: "Right", extraStats: [
          ["Wrong", wrong], ["Net", net],
          ["Time bonus", timeBonus ? "+" + timeBonus : "none"]
        ],
        note: accuracy < 0.65 ? "No time bonus below 65%. Net scoring means a wrong cell cancels a right one."
                              : "Net scored: " + right + " right − " + wrong + " wrong.",
        gate: true, gateLabel: "See your grid ↑",
        onAgain: () => UI.handleRoute()
      });
    }
  }

  return { start, drawRows, BANDS };
})();
