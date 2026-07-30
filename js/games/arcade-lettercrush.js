/* LETTER CRUSH — 8×8 match-3 on letter tiles. Earns nothing but a high score.
   No UI.award() call anywhere in this file, which is what makes that structural. */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.lettercrush = (function () {
  const U = EN.U;
  const N = 8;
  /* Weighted so vowels are common enough to make runs, using Scrabble-ish frequencies. */
  const TILES = [
    { ch:"A", c:"#e0b04a" }, { ch:"E", c:"#7fc98a" }, { ch:"I", c:"#8ab4d8" },
    { ch:"O", c:"#e0574a" }, { ch:"T", c:"#c8b48a" }, { ch:"S", c:"#a08ab8" }
  ];

  function start(root, cfg) {
    const host = EN.Arcade.shell(root, Object.assign({}, cfg, { onTimeUp: () => end() }));
    let grid = [], score = 0, combo = 0, sel = null, busy = false, ended = false;

    const board = U.el("div", { class: "crush-board" });
    host.body.appendChild(U.el("p", { class: "tiny muted",
      text: "Swap adjacent tiles to make a run of three or more. Runs of four leave a charged tile that clears its row." }));
    host.body.appendChild(board);

    const rnd = () => Math.floor(Math.random() * TILES.length);
    function fill() {
      grid = [];
      for (let r = 0; r < N; r++) { grid.push([]); for (let c = 0; c < N; c++) grid[r].push({ t: rnd(), charged: false }); }
      // Re-roll until the opening board has no free matches.
      let guard = 0;
      while (findRuns().length && guard++ < 60) {
        for (const [r, c] of findRuns().flat()) grid[r][c] = { t: rnd(), charged: false };
      }
    }

    function findRuns() {
      const runs = [];
      for (let r = 0; r < N; r++) {
        let run = [[r, 0]];
        for (let c = 1; c <= N; c++) {
          if (c < N && grid[r][c] && grid[r][c - 1] && grid[r][c].t === grid[r][c - 1].t) run.push([r, c]);
          else { if (run.length >= 3) runs.push(run.slice()); run = c < N ? [[r, c]] : []; }
        }
      }
      for (let c = 0; c < N; c++) {
        let run = [[0, c]];
        for (let r = 1; r <= N; r++) {
          if (r < N && grid[r][c] && grid[r - 1][c] && grid[r][c].t === grid[r - 1][c].t) run.push([r, c]);
          else { if (run.length >= 3) runs.push(run.slice()); run = r < N ? [[r, c]] : []; }
        }
      }
      return runs;
    }

    function draw(dropped) {
      board.innerHTML = "";
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const cell = grid[r][c];
        const t = TILES[cell.t];
        const b = U.el("button", {
          class: "crush-cell" + (sel && sel[0] === r && sel[1] === c ? " sel" : "") +
                 (cell.charged ? " charged" : "") + (dropped && dropped[r + ":" + c] ? " dropping" : ""),
          type: "button", "aria-label": t.ch
        }, [U.el("span", { class: cell.charged ? "crush-power" : "", text: cell.charged ? "★" : t.ch })]);
        b.style.background = t.c;
        if (dropped && dropped[r + ":" + c]) b.style.setProperty("--d", dropped[r + ":" + c]);
        b.addEventListener("click", () => tap(r, c));
        board.appendChild(b);
      }
    }

    function tap(r, c) {
      if (busy || ended) return;
      host.clock();
      if (!sel) { sel = [r, c]; EN.Sound.tap(); return draw(); }
      const [sr, sc] = sel;
      if (sr === r && sc === c) { sel = null; return draw(); }
      if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) { sel = [r, c]; EN.Sound.tap(); return draw(); }
      swap(sr, sc, r, c);
      const runs = findRuns();
      if (!runs.length && !grid[r][c].charged && !grid[sr][sc].charged) {
        swap(sr, sc, r, c);
        EN.Sound.mismatch();
        sel = null;
        return draw();
      }
      sel = null;
      busy = true;
      combo = 0;
      if (grid[r][c].charged || grid[sr][sc].charged) {
        const row = grid[r][c].charged ? r : sr;
        clearCells(Array.from({ length: N }, (_, i) => [row, i]));
      }
      resolve();
    }

    function swap(a, b, c, d) { const t = grid[a][b]; grid[a][b] = grid[c][d]; grid[c][d] = t; }

    function clearCells(cells) {
      cells.forEach(([r, c]) => { if (grid[r][c]) grid[r][c] = null; });
    }

    function resolve() {
      const runs = findRuns();
      if (!runs.length) { busy = false; host.clock(); return draw(); }
      combo++;
      let gained = 0;
      runs.forEach(run => {
        gained += run.length * 10 * combo;
        const four = run.length >= 4;
        clearCells(run);
        if (four) { const [r, c] = run[Math.floor(run.length / 2)]; grid[r][c] = { t: rnd(), charged: true }; }
      });
      score += gained;
      host.setScore(score);
      EN.Sound.match();
      if (combo > 1) EN.Sound.combo(combo);
      const pop = U.el("div", { class: "crush-pop", text: "+" + gained });
      pop.style.left = "50%"; pop.style.top = "40%";
      board.appendChild(pop);
      setTimeout(() => pop.remove(), 760);

      // Gravity, then refill from the top.
      const dropped = {};
      for (let c = 0; c < N; c++) {
        const col = [];
        for (let r = N - 1; r >= 0; r--) if (grid[r][c]) col.push(grid[r][c]);
        for (let r = N - 1; r >= 0; r--) {
          const from = N - 1 - r;
          if (from < col.length) { if (grid[r][c] !== col[from]) dropped[r + ":" + c] = 1; grid[r][c] = col[from]; }
          else { grid[r][c] = { t: rnd(), charged: false }; dropped[r + ":" + c] = 1 + (N - 1 - r) * 0.3; }
        }
      }
      draw(dropped);
      setTimeout(resolve, 240);
    }

    function end() {
      if (ended) return;
      ended = true;
      EN.Arcade.over(host, cfg, score);
    }

    EN.UI.onLeave(() => { ended = true; });
    fill();
    draw();
    host.clock();
  }

  return { start };
})();
