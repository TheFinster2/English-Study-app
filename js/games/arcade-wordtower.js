/* WORD TOWER 2048 — 4×4 merge up a ladder of words. The ladder is a joke about literary
   hierarchy. Earns nothing but a high score: no UI.award() call in this file. */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.wordtower = (function () {
  const U = EN.U;
  const LADDER = ["LETTER","WORD","PHRASE","CLAUSE","LINE","STANZA","PARAGRAPH",
                  "CHAPTER","BOOK","OEUVRE","CANON"];
  const COLOURS = ["#8d8478","#a08ab8","#8ab4d8","#7fc98a","#c8b48a","#e0b04a",
                   "#e08a4a","#e0574a","#c9418a","#8a41c9","#e8c96a"];

  function start(root, cfg) {
    const host = EN.Arcade.shell(root, Object.assign({}, cfg, { onTimeUp: () => end() }));
    host.body.appendChild(U.el("p", { class: "tiny muted",
      text: "Swipe or use the arrow keys. Two of the same word merge into the next rung. Reach CANON." }));

    let g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let score = 0, ended = false, merged = {};

    const board = U.el("div", { class: "merge-board" });
    host.body.appendChild(board);
    const pad = U.el("div", { class: "merge-pad" }, [
      U.el("div", { class: "row" }, [U.el("button", { class: "btn btn-sm", text: "↑", on: { click: () => move(0, -1) } })]),
      U.el("div", { class: "row" }, [
        U.el("button", { class: "btn btn-sm", text: "←", on: { click: () => move(-1, 0) } }),
        U.el("button", { class: "btn btn-sm", text: "↓", on: { click: () => move(0, 1) } }),
        U.el("button", { class: "btn btn-sm", text: "→", on: { click: () => move(1, 0) } })
      ])
    ]);
    host.body.appendChild(pad);

    function spawn() {
      const empty = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!g[r][c]) empty.push([r, c]);
      if (!empty.length) return false;
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      g[r][c] = Math.random() < 0.85 ? 1 : 2;
      return true;
    }

    function draw() {
      board.innerHTML = "";
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const v = g[r][c];
        const tile = U.el("div", { class: "merge-tile" + (v ? "" : " empty") + (merged[r + ":" + c] ? " merged" : "") });
        if (v) {
          tile.style.background = COLOURS[Math.min(v - 1, COLOURS.length - 1)];
          tile.appendChild(U.el("div", { class: "merge-word", text: LADDER[Math.min(v - 1, LADDER.length - 1)] }));
        }
        board.appendChild(tile);
      }
      merged = {};
    }

    function move(dx, dy) {
      if (ended) return;
      host.clock();
      if (host.isDead()) return end();
      const before = JSON.stringify(g);
      const order = [0, 1, 2, 3];
      const rows = dy > 0 ? order.slice().reverse() : order;
      const cols = dx > 0 ? order.slice().reverse() : order;
      let gained = 0;

      for (const r of rows) for (const c of cols) {
        if (!g[r][c]) continue;
        let cr = r, cc = c;
        for (;;) {
          const nr = cr + dy, nc = cc + dx;
          if (nr < 0 || nr > 3 || nc < 0 || nc > 3) break;
          if (!g[nr][nc]) { g[nr][nc] = g[cr][cc]; g[cr][cc] = 0; cr = nr; cc = nc; continue; }
          if (g[nr][nc] === g[cr][cc] && !merged[nr + ":" + nc]) {
            g[nr][nc]++; g[cr][cc] = 0;
            merged[nr + ":" + nc] = true;
            gained += Math.pow(2, g[nr][nc]) * 3;
          }
          break;
        }
      }
      if (JSON.stringify(g) === before) { EN.Sound.mismatch(); return; }
      score += gained;
      host.setScore(score);
      if (gained) EN.Sound.match(); else EN.Sound.tap();
      spawn();
      draw();
      if (!canMove()) setTimeout(end, 400);
    }

    function canMove() {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (!g[r][c]) return true;
        if (c < 3 && g[r][c] === g[r][c + 1]) return true;
        if (r < 3 && g[r][c] === g[r + 1][c]) return true;
      }
      return false;
    }

    function onKey(e) {
      const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (map[e.key]) { e.preventDefault(); move.apply(null, map[e.key]); }
    }
    document.addEventListener("keydown", onKey);

    let sx = 0, sy = 0;
    board.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
    board.addEventListener("pointerup", e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
      else move(0, dy > 0 ? 1 : -1);
    });

    function end() {
      if (ended) return;
      ended = true;
      document.removeEventListener("keydown", onKey);
      EN.Arcade.over(host, cfg, score);
    }

    EN.UI.onLeave(() => { ended = true; document.removeEventListener("keydown", onKey); });
    spawn(); spawn(); draw();
    host.clock();
  }

  return { start };
})();
