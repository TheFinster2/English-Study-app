/* QUOTE MATCH — concentration over four pairing types.
   quote↔technique, quote↔character, technique↔effect, concept↔quote.
   Net-scored: a mismatch costs, so flipping every card in sequence is not a strategy. */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.quotematch = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  const KINDS = [
    { id:"quote-technique", name:"Quote → technique" },
    { id:"quote-character", name:"Quote → speaker" },
    { id:"technique-effect", name:"Technique → what it does" },
    { id:"concept-quote",    name:"Concept → quote" }
  ];

  /** Build `n` pairs of the given kind, or fewer if the bank cannot supply them. */
  function buildPairs(kind, n, texts) {
    const quotes = EN.Bank.filterQuotes({ texts });
    const out = [];
    const used = new Set();

    if (kind === "quote-technique") {
      const seenTech = new Set();
      for (const q of U.shuffle(quotes)) {
        const t = (q.techniques || []).find(x => !seenTech.has(x) && EN.Bank.technique(x));
        if (!t) continue;
        seenTech.add(t);
        out.push({ a: { text: shorten(q.text), title: q.textTitle },
                   b: { text: EN.Bank.techniqueName(t) }, key: q.id });
        if (out.length >= n) break;
      }
    } else if (kind === "quote-character") {
      for (const q of U.shuffle(quotes)) {
        if (!q.speaker || used.has(q.speaker) || /narrator|stage direction|model sentence/i.test(q.speaker)) continue;
        used.add(q.speaker);
        out.push({ a: { text: shorten(q.text), title: q.textTitle },
                   b: { text: q.speaker }, key: q.id });
        if (out.length >= n) break;
      }
    } else if (kind === "technique-effect") {
      for (const t of U.sample(EN.Bank.techniques(), n * 3)) {
        if (!t.effect) continue;
        out.push({ a: { text: t.name }, b: { text: firstSentence(t.effect) }, key: t.id });
        if (out.length >= n) break;
      }
    } else {
      for (const cn of U.shuffle(EN.DATA.concepts)) {
        const q = quotes.find(x => (x.concepts || []).includes(cn.id) && !used.has(x.id));
        if (!q) continue;
        used.add(q.id);
        out.push({ a: { text: cn.icon + " " + cn.name }, b: { text: shorten(q.text), title: q.textTitle }, key: cn.id });
        if (out.length >= n) break;
      }
    }
    return out;
  }

  const shorten = s => (s.length > 96 ? s.slice(0, 93).replace(/\s\S*$/, "") + "…" : s);
  const firstSentence = s => { const m = s.match(/^[^.]{20,110}\./); return m ? m[0] : shorten(s); };

  function start(root, cfg) {
    const c = Object.assign({ modeId: "quotematch", title: "🃏 Quote Match",
                              pairs: 6, kind: null, texts: null }, cfg);
    const kind = KINDS.find(k => k.id === c.kind) || U.pick(KINDS);
    let pairs = buildPairs(kind.id, c.pairs, c.texts);
    if (pairs.length < 3) pairs = buildPairs("technique-effect", c.pairs, null);
    if (pairs.length < 3) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🃏" }),
        U.el("p", { text: "Not enough tagged content to build a board yet." })
      ]));
      return;
    }

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    const cards = U.shuffle(pairs.flatMap((p, i) => ([
      { side: "a", pair: i, face: p.a },
      { side: "b", pair: i, face: p.b }
    ])));

    let flipped = [], matched = 0, right = 0, wrong = 0, moves = 0;
    let seconds = 0, timerId = null, finished = false, busy = false;

    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const kindChip = UI.chip(kind.name);
    const moveChip = UI.chip("0 moves");
    const timeChip = U.el("span", { class: "timer-ring", "aria-live": "off", role: "timer", text: "0:00" });
    [kindChip, moveChip, timeChip].forEach(n => shell.meta.appendChild(n));

    const grid = U.el("div", { class: "mgrid" });
    shell.body.appendChild(grid);

    timerId = setInterval(() => { seconds++; timeChip.textContent = U.fmtTime(seconds); }, 1000);
    UI.onLeave(() => clearInterval(timerId));

    const nodes = cards.map((cd, i) => {
      const front = U.el("div", { class: "mface mface-front" }, [
        U.el("div", {}, [
          U.el("div", { text: cd.face.text }),
          cd.face.title ? U.el("div", { class: "tiny muted", style: "margin-top:4px", text: cd.face.title }) : null
        ])
      ]);
      const btn = U.el("button", { class: "mcard", type: "button", "aria-label": "card " + (i + 1) }, [
        U.el("div", { class: "mcard-inner" }, [
          U.el("div", { class: "mface mface-back", text: cd.side === "a" ? "❝" : "🔍" }),
          front
        ])
      ]);
      btn.addEventListener("click", () => flip(i, btn));
      grid.appendChild(btn);
      return btn;
    });

    function flip(i, btn) {
      if (busy || finished) return;
      if (btn.classList.contains("flip") || btn.classList.contains("done")) return;
      btn.classList.add("flip");
      EN.Sound.flip();
      flipped.push({ i, btn });
      if (flipped.length < 2) return;

      busy = true;
      moves++;
      moveChip.textContent = moves + " move" + (moves === 1 ? "" : "s");
      const [x, y] = flipped;
      const ok = cards[x.i].pair === cards[y.i].pair && cards[x.i].side !== cards[y.i].side;

      setTimeout(() => {
        if (ok) {
          right++; matched++;
          [x, y].forEach(f => { f.btn.classList.add("done"); f.btn.classList.remove("flip"); f.btn.classList.add("flip"); });
          EN.Sound.match();
          S.bump("quotesMatched", 0);
        } else {
          wrong++;
          [x, y].forEach(f => f.btn.classList.add("miss"));
          EN.Sound.mismatch();
          setTimeout(() => [x, y].forEach(f => {
            f.btn.classList.remove("flip", "miss");
          }), 520);
        }
        flipped = [];
        busy = false;
        if (matched === pairs.length) setTimeout(finish, 600);
      }, ok ? 260 : 700);
    }

    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(timerId);
      S.bump("quotesMatched");
      S.progressDaily("quotematch", 1);
      EN.Sound.gridClear();

      /* Net scoring (§9.6). A board with n pairs is 2n cards, so brute-force flipping
         solves it eventually — and pays almost nothing, because every mismatch subtracts.
         The time bonus needs 70% net accuracy before it exists at all. */
      const net = Math.max(0, right - wrong);
      const accuracy = moves ? right / moves : 0;
      const perfect = wrong === 0;
      if (perfect) { S.bump("perfectRuns"); EN.Sound.perfect(); }

      const parSeconds = pairs.length * 9;
      const timeBonus = accuracy >= 0.7 ? Math.max(0, Math.round((parSeconds - seconds) * 0.8)) : 0;
      const newBest = S.recordScore(c.modeId + ":" + kind.id, Math.max(0, 999 - seconds));

      const got = UI.award({
        xp: net * 7 + timeBonus, bonus: S.streakBonus(), accuracy,
        coins: net * 2 + (perfect ? 12 : 0)
      });

      UI.results({
        title: "Board cleared",
        correct: right, total: moves, xp: got.xp, coins: got.coins, newBest,
        scoreLabel: "Matches", extraStats: [
          ["Misses", wrong], ["Time", U.fmtTime(seconds)],
          ["Time bonus", timeBonus ? "+" + timeBonus : "none"]
        ],
        note: accuracy < 0.7 ? "No time bonus below 70% — flipping everything is not a strategy." : null,
        gate: false, review: false,
        onAgain: () => UI.handleRoute()
      });
    }
  }

  return { start, KINDS, buildPairs };
})();
