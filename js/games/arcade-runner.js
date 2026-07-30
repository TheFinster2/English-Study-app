/* MARGIN RUNNER — an endless canvas runner down the margin of a page.
   Earns nothing but a high score: no UI.award() call in this file. */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.marginrunner = (function () {
  const U = EN.U;
  const W = 800, H = 300, GROUND = H - 46;

  function start(root, cfg) {
    const host = EN.Arcade.shell(root, Object.assign({}, cfg, { onTimeUp: () => end() }));
    host.body.appendChild(U.el("p", { class: "tiny muted",
      text: "Jump the footnotes and duck the marginalia. Tap the pads, or use Space and ↓." }));

    const canvas = U.el("canvas", { class: "runner-canvas", width: W, height: H });
    host.body.appendChild(U.el("div", { class: "runner-wrap" }, [canvas]));
    const ctx = canvas.getContext("2d");

    const pad = U.el("div", { class: "run-pad" }, [
      U.el("button", { class: "btn run-btn", type: "button" }, [
        U.el("span", { class: "run-btn-ico", text: "⬆" }), U.el("span", { text: "Jump" })]),
      U.el("button", { class: "btn run-btn", type: "button" }, [
        U.el("span", { class: "run-btn-ico", text: "⬇" }), U.el("span", { text: "Duck" })])
    ]);
    host.body.appendChild(pad);

    let y = GROUND, vy = 0, ducking = false, obstacles = [], score = 0, speed = 5.4;
    let raf = null, ended = false, frame = 0;
    const cs = getComputedStyle(document.documentElement);
    const col = n => (cs.getPropertyValue(n) || "").trim() || "#c8b48a";

    function jump() { if (ended) return; if (y >= GROUND - 1) { vy = -12.4; EN.Sound.tap(); } }
    function duck(on) { ducking = on; }

    pad.children[0].addEventListener("pointerdown", e => { e.preventDefault(); jump(); });
    pad.children[1].addEventListener("pointerdown", e => { e.preventDefault(); duck(true); });
    pad.children[1].addEventListener("pointerup", () => duck(false));
    pad.children[1].addEventListener("pointerleave", () => duck(false));
    canvas.addEventListener("pointerdown", e => { e.preventDefault(); jump(); });

    function onKey(e) {
      if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); jump(); }
      if (e.key === "ArrowDown") { e.preventDefault(); duck(true); }
    }
    function onKeyUp(e) { if (e.key === "ArrowDown") duck(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKeyUp);

    function spawn() {
      const high = Math.random() < 0.32;
      obstacles.push(high
        ? { x: W + 20, y: GROUND - 74, w: 46, h: 22, kind: "high" }
        : { x: W + 20, y: GROUND - 30, w: 20 + Math.random() * 18, h: 30, kind: "low" });
    }

    function loop() {
      if (ended) return;
      frame++;
      if (frame % 45 === 0) host.clock();
      if (host.isDead()) return end();

      // physics
      vy += 0.66;
      y = Math.min(GROUND, y + vy);
      if (y >= GROUND) vy = 0;

      speed = 5.4 + Math.min(6, score / 900);
      obstacles.forEach(o => (o.x -= speed));
      obstacles = obstacles.filter(o => o.x + o.w > -10);
      if (!obstacles.length || obstacles[obstacles.length - 1].x < W - 210 - Math.random() * 190) spawn();

      score += 1;
      host.setScore(score);

      // collision
      const px = 70, pw = 26;
      const ph = ducking ? 22 : 40;
      const py = y - ph;
      for (const o of obstacles) {
        if (px + pw > o.x && px < o.x + o.w && py + ph > o.y && py < o.y + o.h) return end();
      }

      // draw
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = col("--line");
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const ly = 40 + i * 34;
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
      }
      ctx.strokeStyle = col("--bad");
      ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(52, H); ctx.stroke();
      ctx.fillStyle = col("--ink");
      ctx.fillRect(0, GROUND, W, 3);
      ctx.fillStyle = col("--accent");
      ctx.fillRect(px, py, pw, ph);
      obstacles.forEach(o => {
        ctx.fillStyle = o.kind === "high" ? col("--info") : col("--warn");
        ctx.fillRect(o.x, o.y, o.w, o.h);
      });
      raf = requestAnimationFrame(loop);
    }

    function end() {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKeyUp);
      EN.Arcade.over(host, cfg, score);
    }

    EN.UI.onLeave(() => {
      ended = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKeyUp);
    });
    host.clock();
    loop();
  }

  return { start };
})();
