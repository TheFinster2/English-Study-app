/* THE ARCADE — pay to play, earns nothing.
   ============================================================================
   Playtime is rented with Marks in 5/15/30-minute tickets. The games award NO XP, NO
   currency and NO achievements — only a high score.

   That is enforced STRUCTURALLY: nothing in this file and nothing in js/games/arcade-*.js
   calls UI.award(). It is not a promise in a comment, it is the absence of a call, and
   tests/arcade.js proves XP, level and Marks are untouched by playing. An endless runner
   paying even 1 XP per second beats studying, and the reference app nearly shipped one.

   The clock runs only while an arcade game is on screen — `tick()` is driven by the game
   loop, not by a wall-clock interval, so backgrounding the tab or navigating away does
   not burn the ticket the student paid for.
   ============================================================================ */
window.EN = window.EN || {};

EN.Arcade = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  const games = () => EN.DATA.arcade;
  const game = id => EN.DATA.arcade.find(g => g.id === id);

  /** Seconds of playtime remaining for a game. */
  function remaining(id) {
    return Math.max(0, Math.floor((S.data.arcade.tickets[id] || 0)));
  }

  /** Buy a ticket. Returns false and denies audibly if the student cannot afford it. */
  function buy(id, ticketId) {
    const t = EN.DATA.shop.tickets.find(x => x.id === ticketId);
    if (!t) return false;
    if (!S.spendCoins(t.price)) {
      EN.Sound.denied();
      UI.toast({ icon: "✒️", kind: "bad", text: "Not enough Marks for that ticket." });
      return false;
    }
    S.data.arcade.tickets[id] = (S.data.arcade.tickets[id] || 0) + t.minutes * 60;
    S.emit();
    EN.Sound.purchase();
    UI.toast({ icon: "🎟️", kind: "good", text: "<b>" + t.label + "</b> on " + game(id).name + "." });
    return true;
  }

  /** Burn `sec` seconds of playtime. Called by the running game, never by a timer. */
  function tick(id, sec) {
    const left = (S.data.arcade.tickets[id] || 0) - sec;
    S.data.arcade.tickets[id] = Math.max(0, left);
    S.save();
    return S.data.arcade.tickets[id];
  }

  /** Record a high score. NOTE: no XP, no coins, no achievement check. */
  function score(id, value) {
    const prev = S.data.arcade.scores[id] || 0;
    const best = value > prev;
    if (best) S.data.arcade.scores[id] = value;
    S.data.arcade.played[id] = (S.data.arcade.played[id] || 0) + 1;
    S.save();
    if (best) { EN.Sound.rankUp(); UI.toast({ icon: "🏆", text: "<b>New high score:</b> " + value }); }
    return best;
  }

  const best = id => S.data.arcade.scores[id] || 0;

  /* ── the arcade screen ────────────────────────────────────── */
  function screen(view, args) {
    const id = args && args[0];
    if (id) return play(view, id);

    view.appendChild(U.el("h1", { text: "🕹️ The Arcade" }));
    view.appendChild(U.el("p", { class: "muted",
      text: "Rent time with Marks. These earn no XP, no Marks and no achievements — only a high score. That is the point: a game that paid would be a better farm than studying." }));

    const grid = U.el("div", { class: "grid g2" });
    games().forEach(g => {
      const left = remaining(g.id);
      const card = U.el("div", { class: "card arcade-booth" }, [
        U.el("div", { class: "arcade-hero" }, [
          U.el("div", { class: "arcade-hero-ico", style: "--gc:" + g.colour, text: g.icon }),
          U.el("div", {}, [
            U.el("div", { class: "game-name", text: g.name }),
            U.el("div", { class: "tiny muted", text: g.desc })
          ])
        ]),
        U.el("div", { class: "tiny muted", text: g.blurb }),
        U.el("div", { class: "row", style: "margin-top:12px" }, [
          U.el("span", { class: "chip" + (left > 0 ? " on" : ""),
                         text: left > 0 ? "⏳ " + U.fmtTime(left) + " left" : "no time" }),
          U.el("span", { class: "chip", text: "🏆 " + best(g.id) }),
          U.el("div", { class: "spacer" }),
          left > 0 ? U.el("button", { class: "btn btn-primary btn-sm", text: "Play",
                                      on: { click: () => UI.go("/arcade/" + g.id) } }) : null
        ]),
        U.el("div", { class: "row", style: "margin-top:10px" },
          EN.DATA.shop.tickets.map(t => U.el("button", {
            class: "btn btn-ghost btn-sm",
            text: t.label + " · " + t.price + " ✒️",
            on: { click: () => { if (buy(g.id, t.id)) UI.handleRoute(); } }
          })))
      ]);
      grid.appendChild(card);
    });
    view.appendChild(grid);
  }

  function play(view, id) {
    const g = game(id);
    if (!g) return UI.go("/arcade");
    if (remaining(id) <= 0) {
      UI.toast({ icon: "🎟️", kind: "bad", text: "Buy some time first." });
      return UI.go("/arcade");
    }
    const impl = { lettercrush: EN.Games.lettercrush,
                   marginrunner: EN.Games.marginrunner,
                   wordtower: EN.Games.wordtower }[id];
    if (!impl) return UI.go("/arcade");
    impl.start(view, { arcadeId: id, name: g.name, icon: g.icon, colour: g.colour });
  }

  /** Shared chrome for an arcade game: title, remaining time, score, and a clock that
      only advances while the game is actually running. */
  function shell(root, cfg) {
    const s = UI.gameShell(cfg.icon + " " + cfg.name, { backTo: "/arcade" });
    root.appendChild(s.root);
    const timeChip = U.el("span", { class: "timer-ring", text: U.fmtTime(remaining(cfg.arcadeId)) });
    const scoreChip = UI.chip("0");
    const bestChip = UI.chip("🏆 " + best(cfg.arcadeId));
    [scoreChip, bestChip, timeChip].forEach(n => s.meta.appendChild(n));

    let last = performance.now();
    let dead = false;

    /* Advance the ticket by real elapsed time, but only from inside the game's own loop.
       A wall-clock setInterval would keep charging while the tab was in the background. */
    function clock() {
      if (dead) return remaining(cfg.arcadeId);
      const now = performance.now();
      const dt = (now - last) / 1000;
      if (dt >= 1) {
        last = now;
        const left = tick(cfg.arcadeId, Math.floor(dt));
        timeChip.textContent = U.fmtTime(left);
        timeChip.classList.toggle("low", left <= 20);
        if (left <= 0) { dead = true; cfg.onTimeUp && cfg.onTimeUp(); }
        return left;
      }
      return remaining(cfg.arcadeId);
    }

    return {
      body: s.body, meta: s.meta, clock,
      setScore(v) { scoreChip.textContent = String(v); },
      stop() { dead = true; },
      isDead() { return dead; }
    };
  }

  /** Game over panel. Records a high score and NOTHING else. */
  function over(host, cfg, value) {
    host.stop();
    const isBest = score(cfg.arcadeId, value);
    EN.Sound.lose();
    const box = U.el("div", { class: "modal-center" }, [
      U.el("div", { class: "modal-big", text: cfg.icon }),
      U.el("h2", { text: "Game over" }),
      U.el("div", { class: "result-grid" }, [
        U.el("div", { class: "result-cell" }, [
          U.el("div", { class: "result-num", text: String(value) }),
          U.el("div", { class: "result-lbl", text: "Score" })
        ]),
        U.el("div", { class: "result-cell" }, [
          U.el("div", { class: "result-num", text: String(best(cfg.arcadeId)) }),
          U.el("div", { class: "result-lbl", text: "Best" })
        ]),
        U.el("div", { class: "result-cell" }, [
          U.el("div", { class: "result-num", text: U.fmtTime(remaining(cfg.arcadeId)) }),
          U.el("div", { class: "result-lbl", text: "Time left" })
        ])
      ]),
      isBest ? U.el("div", { class: "chip on", text: "🏆 New high score" }) : null,
      U.el("p", { class: "tiny muted", text: "No XP and no Marks — the arcade never pays. Back to the Vault when you're ready." }),
      U.el("div", { class: "row", style: "margin-top:8px" }, [
        U.el("button", { class: "btn btn-ghost btn-sm", text: "Leave the arcade",
                         on: { click: () => { UI.closeModal(); UI.go("/arcade"); } } }),
        U.el("div", { class: "spacer" }),
        remaining(cfg.arcadeId) > 0
          ? U.el("button", { class: "btn btn-primary", text: "Again",
                             on: { click: () => { UI.closeModal(); UI.handleRoute(); } } })
          : null
      ])
    ]);
    UI.modal(box, { sticky: true });
  }

  return { screen, games, game, remaining, buy, tick, score, best, shell, over };
})();
