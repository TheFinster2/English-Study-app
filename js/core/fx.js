/* Canvas particle effects and floating XP numbers.
   Lighter than the reference app's: confetti here is ink and paper rather than glitter,
   and `setReduced` flags the <html> element so CSS animations honour the in-app Motion
   toggle too — not just the JS particles. */
window.EN = window.EN || {};

EN.FX = (function () {
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let parts = [];
  let raf = null;
  /* Does the DEVICE ask for less motion? Kept separate from whether the app is currently
     animating, because the two answers differ whenever the student overrides the device,
     and Settings has to be able to say which is which. */
  const prefersStill = () => !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  let reduced = prefersStill();

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  if (canvas) { resize(); window.addEventListener("resize", resize); }

  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter(p => p.life > 0);

    for (const p of parts) {
      p.life--;
      p.vy += p.g;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;

      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / p.fade);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "ring") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === "line") {
        /* A pen stroke. Used for the "marked" effects, where a shower of squares would
           read as a slot machine rather than as annotation. */
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(p.size, 0);
        ctx.stroke();
      } else {
        // Paper: a rectangle wider than it is tall, so it flutters rather than falls.
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      }
      ctx.restore();
    }

    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }

  function start() { if (!raf && parts.length) raf = requestAnimationFrame(loop); }

  function themeColors() {
    const cs = getComputedStyle(document.documentElement);
    const grab = n => (cs.getPropertyValue(n) || "").trim() || "#c8b48a";
    return [grab("--glow-a"), grab("--glow-b"), grab("--good"), grab("--warn"), grab("--ink")];
  }

  function burst(x, y, opts) {
    if (!ctx || reduced) return;
    const o = opts || {};
    const n = o.count || 30;
    const colors = o.colors || themeColors();
    for (let i = 0; i < n; i++) {
      const angle = o.angle !== undefined ? o.angle + (Math.random() - 0.5) * (o.spread || 1.2)
                                          : Math.random() * Math.PI * 2;
      const speed = (o.speed || 5) * (0.4 + Math.random());
      parts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (o.lift || 0),
        g: o.gravity === undefined ? 0.2 : o.gravity,
        drag: o.drag || 0.985,
        size: (o.size || 4) * (0.5 + Math.random()),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: (o.life || 60) * (0.6 + Math.random() * 0.7),
        fade: 28,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.28,
        shape: o.shape || "paper"
      });
    }
    start();
  }

  return {
    /* Flagged on <html> as well, so the in-app Motion toggle reaches CSS. Turning
       motion off previously silenced only the JS particles while every CSS animation
       kept running, including the full-screen background drift, which is the most
       expensive one in the app. */
    setReduced(v) {
      reduced = !!v;
      try { document.documentElement.dataset.motion = reduced ? "off" : "on"; } catch (e) { /* ignore */ }
    },
    isReduced() { return reduced; },
    prefersStill,

    /**
     * Resolve the three-valued Motion setting against the device, and apply it.
     *
     * "auto" follows the device. "on" and "off" are the student saying otherwise, and
     * they WIN — including over the device. The device preference used to be an absolute
     * veto no in-app setting could lift, which meant a student whose phone had Reduce
     * Motion on had no way to see the arcade animate and nothing on screen explaining
     * why; the Motion switch read ON the whole time.
     */
    applyMotion(setting, deviceAsksForStill) {
      /* The device preference is a parameter with a default rather than a closure read,
         so the whole six-cell matrix of (setting × device) can be exercised without
         reloading the page under six different emulated media states. */
      const still = deviceAsksForStill === undefined ? prefersStill() : !!deviceAsksForStill;
      const on = setting === "on";
      const off = setting === "off" || (!on && still);
      this.setReduced(off);
      return { off, overriding: on && still };
    },

    /** Small pop at a screen point — correct answers. */
    pop(x, y) { burst(x, y, { count: 14, speed: 4, size: 3.5, life: 42, shape: "circle" }); },

    /** A short shower of pen strokes — used where "annotated" is the right feeling. */
    marked(x, y) { burst(x, y, { count: 12, speed: 3.4, size: 5, life: 34, gravity: 0.08, shape: "line" }); },

    /** Falling paper. The app's celebration. */
    confetti(strength) {
      if (reduced) return;
      const n = strength || 80;
      const w = window.innerWidth;
      const colors = themeColors();
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * w,
          y: -20 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 2.4,
          vy: 1.6 + Math.random() * 2.4,
          g: 0.07, drag: 0.994,
          size: 6 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 160 + Math.random() * 90, fade: 46,
          rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.22,
          shape: Math.random() > 0.35 ? "paper" : "circle"
        });
      }
      start();
    },

    /** Rising rings — a quote committing to the Vault. */
    rise(x, y) {
      if (reduced) return;
      for (let i = 0; i < 20; i++) {
        parts.push({
          x: x + (Math.random() - 0.5) * 80,
          y: y + Math.random() * 26,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -0.9 - Math.random() * 1.9,
          g: -0.008, drag: 0.995,
          size: 2 + Math.random() * 5,
          color: themeColors()[Math.floor(Math.random() * 3)],
          life: 84 + Math.random() * 56, fade: 36,
          rot: 0, spin: 0, shape: "ring"
        });
      }
      start();
    },

    /** Directional spark shower — boss hits. */
    sparks(x, y, dir) {
      burst(x, y, { count: 22, angle: dir, spread: 1.6, speed: 7.5, size: 2.6,
                    life: 36, gravity: 0.33, shape: "circle" });
    },

    /** Floating "+25 XP" text at a screen position. */
    floatText(x, y, text, color) {
      const node = EN.U.el("div", { class: "float-xp", text });
      node.style.left = x + "px";
      node.style.top = y + "px";
      if (color) node.style.color = color;
      document.body.appendChild(node);
      setTimeout(() => node.remove(), 1150);
    },

    /** Shake the main view — wrong answers and damage. */
    shake() {
      if (reduced) return;
      const v = document.getElementById("view");
      if (!v) return;
      v.classList.remove("screen-shake");
      void v.offsetWidth;
      v.classList.add("screen-shake");
      setTimeout(() => v.classList.remove("screen-shake"), 420);
    },

    /** Burst centred on an element. */
    burstAt(node, opts) {
      if (!node) return;
      const r = node.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, opts);
    }
  };
})();
