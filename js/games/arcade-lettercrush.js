/* LETTER CRUSH — match-3 on letter tiles, with word orders. Earns nothing but a score.
   ============================================================================
   No UI.award() call anywhere in this file, and none in js/core/arcade.js. That is what
   makes "the arcade pays nothing" structural rather than a promise, and tests/suites/
   economy.js asserts the absence of the call as well as the behaviour.

   Because it cannot pay, it has to be worth playing for its own sake. Four things do that
   work, and the first is not a feature but a rewrite:

   1. THE TILES PERSIST. The old version rebuilt the whole board with innerHTML on every
      change, which meant nothing could animate — tiles teleported, swaps were invisible,
      and a cascade looked like the board flickering. Each tile is now one DOM node that
      lives until it is cleared, positioned by --r/--c custom properties with a CSS
      transition, so swapping, falling and popping are all free. Feel is most of match-3.

   2. SWIPE, as well as tap. Tap-then-tap is fine for a keyboard and terrible for a thumb.

   3. SPECIALS WITH SHAPES, the thing that gives match-3 its depth: four in a row leaves a
      Line that clears along the run's own axis, five leaves an Inkblot that takes every
      tile of one letter, and an L or T leaves a Blast. Swapping two specials together
      combines them, which is where the big scores come from.

   4. WORD ORDERS. The tiles are A E I R S T — the six letters that spell the most real
      words between them — and there is always a word to fill: SATIRE, ARTIST, STRAIT.
      Clearing a letter the word still needs fills a slot. This is the one part that could
      only exist in an English app, and it turns a formless board into a chase.

   The clock is still driven by host.clock() from inside the loop, never a wall-clock
   interval, so backgrounding the tab cannot burn the ticket the student paid for.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.lettercrush = (function () {
  const U = EN.U;
  const N = 8;

  /* A E I R S T: three vowels keeps runs frequent enough to feel generous, and between
     them these six letters spell more English words than any other set of six. */
  const TILES = [
    { ch: "A", c: "#e0b04a" }, { ch: "E", c: "#7fc98a" }, { ch: "I", c: "#8ab4d8" },
    { ch: "R", c: "#e0574a" }, { ch: "S", c: "#a08ab8" }, { ch: "T", c: "#c8b48a" }
  ];
  const IDX = {};
  TILES.forEach((t, i) => (IDX[t.ch] = i));

  /* Every word here is spellable from those six letters. `lit` marks the ones that are
     also English-classroom words, which get a line of their own on completion — the only
     teaching this mode does, and it is a joke rather than a lesson. */
  const WORDS = [
    { w: "STAR" }, { w: "ARTS" }, { w: "RATS" }, { w: "TIER" }, { w: "TIRE" },
    { w: "RISE" }, { w: "SIRE" }, { w: "AIRS" }, { w: "SEAT" }, { w: "EAST" },
    { w: "TEAR" }, { w: "RATE" }, { w: "STIR" }, { w: "SITE" }, { w: "TIES" },
    { w: "STARE" }, { w: "TEARS" }, { w: "RATES" }, { w: "ARISE" }, { w: "RAISE" },
    { w: "STAIR" }, { w: "ASTIR" }, { w: "IRATE" }, { w: "SITAR" }, { w: "TIARA" },
    { w: "SATIRE", lit: "Satire. The examiners love it." },
    { w: "ARTIST", lit: "Artist. Steady on." },
    { w: "TRAITS", lit: "Traits — character, not plot." },
    { w: "STRAIT", lit: "Strait, not straight. Homophone." },
    { w: "SIESTA" }, { w: "ARTISTE" }, { w: "AIRIEST" }
  ];

  /* Cascade names. Escalating callouts are the cheapest fun in the genre. */
  const CALLOUTS = ["", "", "Nice", "Sharp", "Fluent", "Eloquent", "Virtuoso", "Unmarkable"];

  /* ── TIMING ────────────────────────────────────────────────────
     Every one of these must be LONGER than the CSS animation it waits for, and the first
     version got that backwards: the pop keyframe ran for 200ms and gravity fired at 190ms,
     the beam ran for 420ms and the whole clear finished in about 360ms. The effects were
     not merely quick, they were being cut off part-way and replaced by the next phase — so
     the fix is not only bigger numbers, it is ordering.

     Paired with the durations in css/styles.css under "Letter Crush". If you change one,
     change both: the comment there names this table. */
  const T = {
    swap:    300,   // tile slide           — CSS .24s
    revert:  380,   // illegal swap, there and back
    pop:     360,   // tiles bursting       — CSS .3s
    fall:    420,   // gravity + refill     — CSS .34s
    beat:    120,   // a pause between cascade steps, so a chain reads as steps
    special: 640,   // dwell while a beam or shockwave plays before its tiles go — CSS .52s
    ink:     900,   // the Inkblot crosses the whole board — CSS .8s
    shuffle: 520
  };
  /* Reduced motion collapses all of it, but never to zero: a couple of frames of gap keeps
     the resolve loop from re-entering synchronously. See `wait` inside start(). */

  function start(root, cfg) {
    const host = EN.Arcade.shell(root, Object.assign({}, cfg, { onTimeUp: () => end() }));
    const reduced = EN.FX.isReduced();
    /** A phase length, or a couple of frames when motion is off. */
    const wait = key => (reduced ? 16 : T[key]);

    let grid = [];               // grid[r][c] = cell | null
    let score = 0, cascade = 0, sel = null, busy = false, ended = false;
    let order = null, filled = 0, wordsDone = 0, bestCascade = 0;
    let idleTimer = null, hintCells = null;

    host.body.appendChild(U.el("p", { class: "tiny muted",
      text: "Swipe or tap two neighbours. Four in a line leaves ↔, five leaves ✦, an L or T leaves ✹ — and swapping two specials together is the big one." }));

    /* ── the word order ── */
    const orderRow = U.el("div", { class: "crush-order" });
    host.body.appendChild(orderRow);

    const board = U.el("div", { class: "crush-board" });
    host.body.appendChild(board);
    const callout = U.el("div", { class: "crush-callout", hidden: true });
    board.appendChild(callout);

    /* ── model ─────────────────────────────────────────────────── */
    const rnd = () => Math.floor(Math.random() * TILES.length);

    function makeCell(t, kind, axis) {
      const cell = { t, kind: kind || null, axis: axis || null, node: null };
      const face = U.el("span", { class: "crush-face" });
      const node = U.el("button", { class: "crush-cell", type: "button" }, [face]);
      cell.node = node;
      cell.face = face;
      board.appendChild(node);
      paintCell(cell);
      return cell;
    }

    function paintCell(cell) {
      const t = TILES[cell.t];
      cell.node.style.background = t.c;
      cell.node.className = "crush-cell" + (cell.kind ? " sp sp-" + cell.kind : "");
      cell.face.textContent = cell.kind === "line" ? (cell.axis === "row" ? "↔" : "↕")
                            : cell.kind === "blast" ? "✹"
                            : cell.kind === "ink" ? "✦"
                            : t.ch;
      cell.node.setAttribute("aria-label",
        t.ch + (cell.kind ? " " + cell.kind : "") + " tile");
    }

    /**
     * Set the resolving flag, and mirror it onto the board.
     *
     * Two reasons it is on the DOM and not just in a closure. The board takes no input
     * while a cascade resolves and previously said nothing about it — a tap during the
     * fall was silently dropped, which reads as the game missing your input. Now the CSS
     * dims it slightly and refuses pointer events, so it looks deliberate. It also gives
     * tests/suites/arcade.js something to wait on: polling for "no tiles popping" was
     * false-idle between phases, and the suite reported the game as broken when it was
     * merely mid-fall.
     */
    function setBusy(v) {
      busy = v;
      if (v) board.dataset.busy = "1"; else delete board.dataset.busy;
    }

    /** Position a tile. The transition on --r/--c is what animates every movement. */
    function place(cell, r, c, instant) {
      if (!cell) return;
      cell.node.style.setProperty("--r", r);
      cell.node.style.setProperty("--c", c);
      cell.node.classList.toggle("noanim", !!instant);
      if (instant) requestAnimationFrame(() => cell.node.classList.remove("noanim"));
      cell.node.onclick = () => tap(r, c);
      cell.r = r; cell.c = c;
    }

    function repaintPositions(instant) {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) place(grid[r][c], r, c, instant);
    }

    function fill() {
      board.querySelectorAll(".crush-cell").forEach(n => n.remove());
      grid = [];
      for (let r = 0; r < N; r++) {
        grid.push([]);
        for (let c = 0; c < N; c++) grid[r].push(makeCell(rnd()));
      }
      /* Re-roll the opening board until it has no free matches, and until it HAS a move —
         a board that starts dead is the worst possible first impression. */
      let guard = 0;
      while ((findRuns().length || !anyMove()) && guard++ < 200) {
        const runs = findRuns();
        const targets = runs.length ? runs.flatMap(x => x.cells) : [[0, 0], [3, 4], [6, 2]];
        targets.forEach(([r, c]) => { grid[r][c].t = rnd(); paintCell(grid[r][c]); });
      }
      repaintPositions(true);
    }

    /**
     * Every run of three or more, as { cells, axis }.
     * Kept separate from the special-awarding logic so an L or T can be detected by
     * intersecting a horizontal run with a vertical one, which is what earns a Blast.
     */
    function findRuns() {
      const runs = [];
      const scan = (axis, outer, inner, at) => {
        for (let a = 0; a < outer; a++) {
          let run = [];
          for (let b = 0; b <= inner; b++) {
            const cur = b < inner ? at(a, b) : null;
            const prev = run.length ? at(a, b - 1) : null;
            if (cur && prev && cur.t === prev.t) run.push(axis === "row" ? [a, b] : [b, a]);
            else {
              if (run.length >= 3) runs.push({ cells: run.slice(), axis });
              run = cur ? [axis === "row" ? [a, b] : [b, a]] : [];
            }
          }
        }
      };
      scan("row", N, N, (r, c) => grid[r][c]);
      scan("col", N, N, (c, r) => grid[r][c]);
      return runs;
    }

    /** Is there any swap that would make a run? Used to shuffle rather than strand. */
    function anyMove() {
      const trySwap = (r1, c1, r2, c2) => {
        const a = grid[r1][c1], b = grid[r2][c2];
        if (!a || !b) return false;
        grid[r1][c1] = b; grid[r2][c2] = a;
        const ok = findRuns().length > 0;
        grid[r1][c1] = a; grid[r2][c2] = b;
        return ok;
      };
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (grid[r][c] && grid[r][c].kind) return true;      // a special is always a move
        if (c + 1 < N && trySwap(r, c, r, c + 1)) { hintCells = [[r, c], [r, c + 1]]; return true; }
        if (r + 1 < N && trySwap(r, c, r + 1, c)) { hintCells = [[r, c], [r + 1, c]]; return true; }
      }
      hintCells = null;
      return false;
    }

    /* ── input: tap pairs, or swipe ─────────────────────────────── */
    function tap(r, c) {
      if (busy || ended) return;
      host.clock();
      clearHint();
      if (!sel) { sel = [r, c]; mark(); EN.Sound.tap(); return; }
      const [sr, sc] = sel;
      if (sr === r && sc === c) { sel = null; return mark(); }
      if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) { sel = [r, c]; mark(); EN.Sound.tap(); return; }
      sel = null; mark();
      attempt(sr, sc, r, c);
    }

    function mark() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (grid[r][c]) grid[r][c].node.classList.toggle("sel", !!sel && sel[0] === r && sel[1] === c);
      }
    }

    /* One pointer gesture: press a tile, move a third of a tile in a direction, swap. */
    let down = null;
    board.addEventListener("pointerdown", e => {
      if (busy || ended) return;
      const cellNode = e.target.closest(".crush-cell");
      if (!cellNode) return;
      const found = findByNode(cellNode);
      if (!found) return;
      down = { r: found.r, c: found.c, x: e.clientX, y: e.clientY };
    });
    board.addEventListener("pointerup", e => {
      if (!down || busy || ended) { down = null; return; }
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      const step = board.getBoundingClientRect().width / N * 0.35;
      const { r, c } = down;
      down = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < step) return;   // a tap; the click handler has it
      const [dr, dc] = Math.abs(dx) > Math.abs(dy)
        ? [0, dx > 0 ? 1 : -1] : [dy > 0 ? 1 : -1, 0];
      const r2 = r + dr, c2 = c + dc;
      if (r2 < 0 || c2 < 0 || r2 >= N || c2 >= N) return;
      sel = null; mark();
      host.clock();
      clearHint();
      attempt(r, c, r2, c2);
    });
    board.addEventListener("pointercancel", () => { down = null; });

    function findByNode(node) {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (grid[r][c] && grid[r][c].node === node) return { r, c };
      }
      return null;
    }

    /* ── a move ─────────────────────────────────────────────────── */
    function attempt(r1, c1, r2, c2) {
      const a = grid[r1][c1], b = grid[r2][c2];
      if (!a || !b) return;
      swap(r1, c1, r2, c2);
      place(a, r2, c2); place(b, r1, c1);

      const combo = a.kind && b.kind;
      const runs = findRuns();
      if (!runs.length && !a.kind && !b.kind) {
        /* Illegal: put them back, and say so with a wobble rather than nothing. */
        setBusy(true);
        EN.Sound.mismatch();
        a.node.classList.add("nudge"); b.node.classList.add("nudge");
        setTimeout(() => {
          swap(r1, c1, r2, c2);
          place(a, r1, c1); place(b, r2, c2);
          a.node.classList.remove("nudge"); b.node.classList.remove("nudge");
          setBusy(false);
        }, wait("revert"));
        return;
      }

      setBusy(true);
      cascade = 0;
      const pre = [];
      if (combo) pre.push(...fireCombo(a, b, r2, c2));
      else {
        if (a.kind) pre.push(...fireSpecial(a, r2, c2));
        if (b.kind) pre.push(...fireSpecial(b, r1, c1));
      }
      /* A special that just went off gets its effect time BEFORE its tiles disappear —
         this is the line that made the beam visible. An Inkblot crosses the whole board, so
         it gets longer still. */
      const firedInk = (a.kind === "ink" || b.kind === "ink");
      const dwell = pre.length ? (firedInk ? "ink" : "special") : "swap";
      setTimeout(() => resolve(pre), wait(dwell));
    }

    function swap(r1, c1, r2, c2) {
      const t = grid[r1][c1]; grid[r1][c1] = grid[r2][c2]; grid[r2][c2] = t;
    }

    /* ── specials ───────────────────────────────────────────────── */

    /** The cells a special takes when it goes off. */
    function fireSpecial(cell, r, c) {
      const out = [];
      if (cell.kind === "line") {
        if (cell.axis === "row") for (let i = 0; i < N; i++) out.push([r, i]);
        else for (let i = 0; i < N; i++) out.push([i, c]);
        fx("beam", r, c, cell.axis === "row" ? "row" : "col");
        EN.Sound.crit();
      } else if (cell.kind === "blast") {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && cc >= 0 && rr < N && cc < N) out.push([rr, cc]);
        }
        fx("wave", r, c);
        EN.Sound.crit();
      } else if (cell.kind === "ink") {
        const want = cell.t;
        for (let rr = 0; rr < N; rr++) for (let cc = 0; cc < N; cc++) {
          if (grid[rr][cc] && grid[rr][cc].t === want) out.push([rr, cc]);
        }
        fx("ripple", r, c);
        EN.Sound.rareDrop();
      }
      flash();
      return out;
    }

    /** Two specials swapped together. This is where the board really goes. */
    function fireCombo(a, b, r, c) {
      const out = [];
      const kinds = [a.kind, b.kind].sort().join("+");
      if (kinds === "line+line") {
        for (let i = 0; i < N; i++) { out.push([r, i]); out.push([i, c]); }
      } else if (kinds === "blast+blast") {
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && cc >= 0 && rr < N && cc < N) out.push([rr, cc]);
        }
      } else if (kinds === "blast+line") {
        for (let i = 0; i < N; i++) {
          for (let d = -1; d <= 1; d++) {
            if (r + d >= 0 && r + d < N) out.push([r + d, i]);
            if (c + d >= 0 && c + d < N) out.push([i, c + d]);
          }
        }
      } else if (kinds.indexOf("ink") >= 0) {
        /* An Inkblot with anything takes the whole board's worth of one letter, and the
           other special's shape on top. Deliberately absurd; it is the payoff move. */
        const other = a.kind === "ink" ? b : a;
        const want = other.t;
        for (let rr = 0; rr < N; rr++) for (let cc = 0; cc < N; cc++) {
          if (grid[rr][cc] && (grid[rr][cc].t === want || grid[rr][cc].t === a.t)) out.push([rr, cc]);
        }
      }
      if (kinds === "line+line") { fx("beam", r, c, "row"); fx("beam", r, c, "col"); }
      else if (kinds.indexOf("ink") >= 0) fx("ripple", r, c);
      else fx("wave", r, c);
      EN.Sound.rareDrop();
      flash(true);
      shake(kinds.indexOf("ink") >= 0 ? 2 : 1);
      say("Combination");
      return out;
    }

    /* ── the resolve loop ───────────────────────────────────────── */
    function resolve(forced) {
      if (ended) return;
      const runs = findRuns();
      const extra = forced || [];
      if (!runs.length && !extra.length) {
        setBusy(false);
        host.clock();
        if (!anyMove()) return shuffle();
        armHint();
        return;
      }
      cascade++;
      if (cascade > bestCascade) bestCascade = cascade;

      /* Which cells clear, and where a special is left behind. A cell in both a
         horizontal and a vertical run is an L or a T, which is worth a Blast. */
      const doomed = new Map();
      const key = (r, c) => r + ":" + c;
      const add = (r, c) => { if (grid[r][c]) doomed.set(key(r, c), [r, c]); };
      extra.forEach(([r, c]) => add(r, c));

      const rowMembers = new Set(), colMembers = new Set();
      runs.forEach(run => {
        run.cells.forEach(([r, c]) => {
          add(r, c);
          (run.axis === "row" ? rowMembers : colMembers).add(key(r, c));
        });
      });

      const spawn = [];
      runs.forEach(run => {
        const inBoth = run.cells.find(([r, c]) => rowMembers.has(key(r, c)) && colMembers.has(key(r, c)));
        const mid = run.cells[Math.floor(run.cells.length / 2)];
        const t = grid[run.cells[0][0]][run.cells[0][1]].t;
        if (inBoth) spawn.push({ at: inBoth, t, kind: "blast" });
        else if (run.cells.length >= 5) spawn.push({ at: mid, t, kind: "ink" });
        else if (run.cells.length === 4) spawn.push({ at: mid, t, kind: "line", axis: run.axis });
      });
      /* One special per cell, and a special must not be immediately destroyed by the very
         run that created it. */
      const spawnAt = new Map();
      spawn.forEach(s => { if (!spawnAt.has(key(s.at[0], s.at[1]))) spawnAt.set(key(s.at[0], s.at[1]), s); });
      spawnAt.forEach((s, k) => doomed.delete(k));

      /* Chained specials: a special caught in a clear goes off too. */
      let guard = 0;
      for (;;) {
        const chain = [];
        doomed.forEach(([r, c]) => {
          const cell = grid[r][c];
          if (cell && cell.kind && !cell.fired) { cell.fired = true; chain.push([cell, r, c]); }
        });
        if (!chain.length || guard++ > 6) break;
        chain.forEach(([cell, r, c]) => fireSpecial(cell, r, c).forEach(([rr, cc]) => add(rr, cc)));
        spawnAt.forEach((s, k) => doomed.delete(k));
      }

      /* ── score, word order, sound ── */
      const list = Array.from(doomed.values());
      const gained = Math.round(list.length * 18 * Math.min(cascade, 8) *
                                (1 + spawnAt.size * 0.35));
      score += gained;
      host.setScore(score);
      creditOrder(list);

      if (cascade >= 2) { EN.Sound.combo(cascade); say(CALLOUTS[Math.min(cascade, CALLOUTS.length - 1)]); }
      else EN.Sound.match();
      /* The board itself reacts once a cascade is genuinely large. Held back to 3 so it
         stays an event rather than a tic. */
      if (cascade >= 3) shake(cascade >= 5 ? 2 : 1);

      /* Float the number where it happened, not in the middle of the board. */
      const mid = list[Math.floor(list.length / 2)];
      floatScore(mid[0], mid[1], "+" + gained);

      /* ── pop, then gravity ── */
      list.forEach(([r, c]) => {
        const cell = grid[r][c];
        if (!cell) return;
        cell.node.classList.add("popping");
        const n = cell.node;
        setTimeout(() => n.remove(), wait("pop"));
        grid[r][c] = null;
      });

      spawnAt.forEach(s => {
        const [r, c] = s.at;
        if (grid[r][c]) { grid[r][c].node.remove(); }
        grid[r][c] = makeCell(s.t, s.kind, s.axis);
        place(grid[r][c], r, c, true);
        grid[r][c].node.classList.add("born");
      });

      setTimeout(() => {
        if (ended) return;
        gravity();
        /* A beat after the fall, so a five-step cascade reads as five things happening
           rather than one long blur. */
        setTimeout(() => resolve(null), wait("fall") + (reduced ? 0 : T.beat));
      }, wait("pop"));
    }

    /** Drop what is left, then refill from above the board so new tiles fall in. */
    function gravity() {
      for (let c = 0; c < N; c++) {
        const stack = [];
        for (let r = N - 1; r >= 0; r--) if (grid[r][c]) stack.push(grid[r][c]);
        let above = 0;
        for (let r = N - 1; r >= 0; r--) {
          const i = N - 1 - r;
          if (i < stack.length) grid[r][c] = stack[i];
          else {
            const cell = makeCell(rnd());
            place(cell, -1 - above++, c, true);       // start off the top edge
            grid[r][c] = cell;
          }
          /* Squash on landing, so a column dropping reads as weight rather than as a
             list re-indexing. Removed on animationend so it can fire again next cascade. */
          const landed = grid[r][c];
          if (landed && !reduced) {
            landed.node.classList.remove("land");
            void landed.node.offsetWidth;
            landed.node.classList.add("land");
          }
        }
      }
      repaintPositions(false);
    }

    /* ── word orders ────────────────────────────────────────────── */
    function newOrder() {
      const pick = WORDS[Math.floor(Math.random() * WORDS.length)];
      order = { word: pick.w, lit: pick.lit, need: pick.w.split(""),
                got: pick.w.split("").map(() => false) };
      filled = 0;
      drawOrder();
    }

    function drawOrder() {
      orderRow.innerHTML = "";
      orderRow.appendChild(U.el("span", { class: "tiny muted", text: "Spell" }));
      const wrap = U.el("div", { class: "crush-word" });
      order.need.forEach((ch, i) => {
        const got = order.got[i];
        wrap.appendChild(U.el("span", {
          class: "crush-slot" + (got ? " got" : ""),
          style: got ? "background:" + TILES[IDX[ch]].c : "",
          text: ch
        }));
      });
      orderRow.appendChild(wrap);
      orderRow.appendChild(U.el("span", { class: "chip", text: "📖 " + wordsDone }));
    }

    /**
     * Cleared tiles fill the word.
     *
     * Per SLOT, not in sequence. The first version only advanced when the cleared letter
     * happened to be the next one needed, so clearing three T's for TOAST filled one slot
     * and a whole game filled about one letter a minute — technically a chase, actually a
     * crawl. Now every cleared tile fills the leftmost slot still wanting that letter, so
     * a run of three T's completes both T's of TOAST at once and you can see which letters
     * you are hunting rather than just the next one.
     */
    function creditOrder(list) {
      if (!order) return;
      let moved = 0;
      for (const [r, c] of list) {
        const cell = grid[r][c];
        if (!cell) continue;
        const ch = TILES[cell.t].ch;
        const at = order.need.findIndex((want, i) => want === ch && !order.got[i]);
        if (at >= 0) { order.got[at] = true; moved++; }
      }
      if (!moved) return;
      filled = order.got.filter(Boolean).length;
      if (filled >= order.need.length) return completeOrder();
      drawOrder();
      /* A quiet tick per letter, so filling a slot is felt and not only seen. */
      EN.Sound.cellSet();
    }

    function completeOrder() {
      wordsDone++;
      const bonus = 400 + order.word.length * 120;
      score += bonus;
      host.setScore(score);
      EN.Sound.rankUp();
      say(order.word);
      if (order.lit) {
        EN.UI.toast({ icon: "📖", text: "<b>" + order.word + ".</b> " + order.lit.split(". ").slice(1).join(". ") });
      }
      floatScore(3, 4, "+" + bonus + " " + order.word);
      if (!reduced) EN.FX.confetti(28);

      /* The reward is a free special dropped somewhere useful, not time or currency —
         the arcade must not hand out anything the rest of the app trades in. */
      const r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
      if (grid[r][c]) {
        grid[r][c].node.remove();
        grid[r][c] = makeCell(rnd(), wordsDone % 3 === 0 ? "ink" : "blast");
        place(grid[r][c], r, c, true);
        grid[r][c].node.classList.add("born");
      }
      newOrder();
    }

    /* ── juice ──────────────────────────────────────────────────── */
    function floatScore(r, c, text) {
      const pop = U.el("div", { class: "crush-pop", text: text });
      pop.style.left = ((c + 0.5) / N * 100) + "%";
      pop.style.top = ((r + 0.5) / N * 100) + "%";
      board.appendChild(pop);
      setTimeout(() => pop.remove(), 1250);
    }

    function say(text) {
      if (!text) return;
      callout.textContent = text;
      callout.hidden = false;
      callout.classList.remove("show");
      void callout.offsetWidth;
      callout.classList.add("show");
    }

    /**
     * A one-shot effect layer over the board: a beam along a row or column, a shockwave
     * ring, or a colour ripple. Spawned, animated by CSS, removed on animationend.
     *
     * Without these a special fired and eight tiles simply vanished — the mechanic was
     * there and none of the impact was. This is the difference between "the row cleared"
     * and "something swept the row".
     */
    function fx(kind, r, c, axis) {
      if (reduced) return;
      const n = U.el("div", { class: "crush-fx fx-" + kind + (axis ? " fx-" + axis : "") });
      const pc = v => (v / N * 100) + "%";
      if (kind === "beam") {
        if (axis === "row") { n.style.top = pc(r); n.style.left = "0"; }
        else { n.style.left = pc(c); n.style.top = "0"; }
      } else {
        /* Centred on the tile, so the ring grows out of where it went off. */
        n.style.left = pc(c + 0.5); n.style.top = pc(r + 0.5);
      }
      board.appendChild(n);
      n.addEventListener("animationend", () => n.remove());
      setTimeout(() => n.remove(), 1600);           // belt and braces if the event is missed
    }

    /** Nudge the whole board. Level 1 for a special, 2 for a combo or a deep cascade. */
    function shake(level) {
      if (reduced) return;
      board.classList.remove("shake", "shake-2");
      void board.offsetWidth;
      board.classList.add(level >= 2 ? "shake-2" : "shake");
    }

    function flash(big) {
      if (reduced) return;
      board.classList.remove("flash", "flash-big");
      void board.offsetWidth;
      board.classList.add(big ? "flash-big" : "flash");
    }

    /* ── hint and shuffle ───────────────────────────────────────── */
    function armHint() {
      clearHint();
      idleTimer = setTimeout(() => {
        if (busy || ended || !hintCells) return;
        hintCells.forEach(([r, c]) => grid[r][c] && grid[r][c].node.classList.add("hint"));
      }, 5000);
    }
    function clearHint() {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      board.querySelectorAll(".crush-cell.hint").forEach(n => n.classList.remove("hint"));
    }

    /** No moves left is a dead board, which is a bug from the player's side. Reshuffle. */
    function shuffle() {
      setBusy(true);
      EN.UI.toast({ icon: "🔀", text: "No moves — reshuffling." });
      EN.Sound.erase();
      let guard = 0;
      do {
        const flat = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) flat.push(grid[r][c]);
        U.shuffle(flat);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) grid[r][c] = flat[r * N + c];
      } while ((findRuns().length || !anyMove()) && guard++ < 80);
      repaintPositions(false);
      setTimeout(() => { setBusy(false); host.clock(); armHint(); }, wait("shuffle"));
    }

    /* ── end ────────────────────────────────────────────────────── */
    function end() {
      if (ended) return;
      ended = true;
      clearHint();
      EN.Arcade.over(host, cfg, score, [
        ["Words spelled", wordsDone],
        ["Best cascade", "×" + bestCascade]
      ]);
    }

    EN.UI.onLeave(() => { ended = true; clearHint(); });
    newOrder();
    fill();
    armHint();
    host.clock();
  }

  return { start, TILES, WORDS };
})();
