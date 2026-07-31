/* UI shell: hash router, header sync, toasts, modals, and the reward pipeline that
   every game funnels XP / Marks / achievements through. */
window.EN = window.EN || {};

EN.UI = (function () {
  const U = EN.U;
  const S = EN.State;
  const routes = {};
  let currentCleanup = null;
  let trapHandler = null, lastFocus = null;

  /** Runs below this accuracy earn no completion bonus at all. */
  const MIN_BONUS_ACCURACY = 0.5;

  /* ── how long reading actually takes ─────────────────────────
     Chemistry could use a flat 1,200 ms floor because its stems were one line. English
     cannot: a technique question with a two-line quote and a Marking Desk sample of 180
     words are not the same read, and a single constant is wrong in both directions —
     too low and the mode is farmable, too high and an honest fast reader is punished
     for being quick.

     ~800 ms of orientation plus 240 ms per word ≈ 250 wpm, which is brisk but real for
     a student who already knows the text. Capped, because nobody is made to stare at a
     paragraph for a minute before the app will believe them. Tuned against
     tests/honest.js, which is the only way to know the floor hasn't started punishing
     normal play. */
  const READ_BASE_MS = 800;
  const READ_PER_WORD_MS = 240;
  const READ_CAP_MS = 25000;

  /** Minimum plausible reading time for a piece of text, in ms. */
  function readTimeFor(text) {
    const n = Array.isArray(text) ? text.reduce((a, t) => a + U.words(t || ""), 0)
                                  : U.words(text || "");
    return Math.min(READ_CAP_MS, READ_BASE_MS + n * READ_PER_WORD_MS);
  }

  /* ── the anti-farm floor, which is NOT the same number ────────
     readTimeFor above was doing two jobs with opposite requirements, and that was the
     bug behind "I get no XP for rushing even though I read the question".

     Job one is sizing a CLOCK. There it should be generous: give a student long enough
     to read a 180-word paragraph carefully, and let Nightmare cut only the slack above
     it. Too small is the failure.

     Job two is catching somebody TAPPING WITHOUT READING. There it should be tight: the
     question is "could a human possibly have taken this in", not "did they read it at a
     careful pace". Too large is the failure — and too large is what shipped.

     Measured on the real bank: at 240 ms/word over the stem, the quote AND all four
     options, a median Common-Module boss round needed 23.1 seconds before an answer
     scored, against a 26-second clock. That is a 2.9-second window in which XP existed
     at all. Answer at twenty seconds having genuinely read it: nothing. Worse on Hard
     and Nightmare, where the clock shrinks toward the floor and the window closes to
     about 1.6 seconds. Rapid Fire was worse still — 120 seconds for 24 questions is
     ~5 seconds each, so essentially every answer in the mode was scoring zero.

     So the floor is now its own function with its own numbers:

       • 55 ms/word (~1,100 wpm) on the stem and quote — a skim, not a read. This is a
         lower bound on the physically possible, which is what an anti-farm gate needs.
       • 25 ms/word on the OPTIONS, because you scan them and stop at the one you want.
         Charging full reading rate for three distractors you never finished is the
         single biggest source of the old over-estimate.
       • capped at 9 seconds outright, and additionally at 45% of the mode's clock where
         there is one — so a timed mode can never be built in which XP is unreachable.
         That cap is the structural guarantee; the rest is calibration. */
  const RUSH_BASE_MS = 600;
  const RUSH_READ_MS = 55;
  const RUSH_SCAN_MS = 25;
  const RUSH_CAP_MS = 9000;
  const RUSH_CLOCK_SHARE = 0.45;

  /**
   * The floor below which an answer is treated as unread and pays nothing.
   *
   * spec = { read, scan } — `read` is prose the student must take in (stem, quote,
   * paragraph); `scan` is the option list. A bare string is treated as all `read`.
   * `clockSeconds` is the mode's clock for this item, if it has one.
   */
  function rushFloor(spec, clockSeconds) {
    const s = typeof spec === "string" || Array.isArray(spec) ? { read: spec } : (spec || {});
    const count = t => Array.isArray(t) ? t.reduce((a, x) => a + U.words(x || ""), 0)
                                        : U.words(t || "");
    let ms = RUSH_BASE_MS + count(s.read) * RUSH_READ_MS + count(s.scan) * RUSH_SCAN_MS;
    ms = Math.min(ms, RUSH_CAP_MS);
    if (clockSeconds > 0) ms = Math.min(ms, clockSeconds * 1000 * RUSH_CLOCK_SHARE);
    return Math.round(ms);
  }

  /**
   * A visible countdown of the rush floor.
   *
   * The floor being invisible was half the complaint. A student answers, gets told
   * "rushed, no XP", and has no way to know what would have counted or how close they
   * were — so the rule reads as the app being arbitrary rather than as a rule. This
   * returns a node that shows the remaining time and then swaps itself for a confirmation
   * that the answer will now score. Purely informational; the gate is still in the game.
   */
  function rushHint(minReadMs) {
    const node = U.el("span", { class: "rush-hint" });
    if (!(minReadMs > 250)) { node.hidden = true; return { node, stop() {} }; }
    const started = performance.now();
    let raf = null, seen = false;
    function paint() {
      /* `seen` matters: the first paint runs before the caller has appended the node, so
         bailing on !isConnected killed the loop immediately and the hint rendered blank.
         Only a node that WAS in the document and no longer is means the screen has gone. */
      if (node.isConnected) seen = true;
      else if (seen) return stop();
      const left = minReadMs - (performance.now() - started);
      if (left <= 0) {
        node.classList.add("ready");
        node.textContent = "✓ counts";
        return stop();
      }
      node.textContent = "⏱ " + (left / 1000).toFixed(1) + "s";
      raf = requestAnimationFrame(paint);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
    paint();
    return { node, stop };
  }

  /**
   * A clock for a timed mode, in seconds.
   *
   * Difficulty shortens the *slack* over reading time, never the reading time itself.
   * A flat −45% on a paragraph-length stem is not "hard", it is unreadable — so
   * Nightmare takes the thinking time away and leaves the reading intact.
   */
  function timeBudget(baseSeconds, text) {
    const floor = readTimeFor(text) / 1000;
    const scale = S.difficulty().timeScale;
    if (baseSeconds <= floor) return Math.max(1, Math.round(baseSeconds));
    return Math.max(1, Math.round(floor + (baseSeconds - floor) * scale));
  }

  /* ── routing ─────────────────────────────────────────────── */
  function route(name, fn) { routes[name] = fn; }

  function go(path) {
    if (location.hash === "#" + path) handleRoute();
    else location.hash = path;
  }

  function parseHash() {
    const raw = (location.hash || "#/home").replace(/^#/, "");
    const parts = raw.split("/").filter(Boolean);
    return { name: parts[0] || "home", args: parts.slice(1) };
  }

  function handleRoute() {
    const { name, args } = parseHash();
    const fn = routes[name] || routes.home;

    /* The only thing stopping setInterval timers and requestAnimationFrame loops
       leaking between modes. */
    if (typeof currentCleanup === "function") {
      try { currentCleanup(); } catch (e) { /* ignore */ }
    }
    currentCleanup = null;

    // Floating buttons belong to the screen being left.
    U.$$(".results-reopen").forEach(n => n.remove());

    const view = U.$("#view");
    if (view.childNodes.length) EN.Sound.nav();
    view.innerHTML = "";
    const result = fn(view, args);
    if (typeof result === "function") currentCleanup = result;

    const navKey = ({ play: "play", game: "play", boss: "play",
                      reference: "vault", draft: "vault", texts: "vault" })[name] || name;
    U.$$(".nav-item").forEach(a => a.classList.toggle("on", a.dataset.nav === navKey));

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    view.focus({ preventScroll: true });
  }

  /**
   * Mark a node as something a screen reader should announce when it changes.
   *
   * Used for the feedback panel and the verdict box: they are the answer to "was I right",
   * and they appear silently. `polite` rather than `assertive` so it waits for the reader
   * to finish the sentence it is on instead of interrupting.
   */
  function announce(node) {
    if (!node) return node;
    node.setAttribute("aria-live", "polite");
    node.setAttribute("role", "status");
    return node;
  }

  /** Register a cleanup for the current screen (timers, listeners). */
  function onLeave(fn) { currentCleanup = fn; }

  /* ── header ──────────────────────────────────────────────── */
  function syncHeader() {
    const d = S.data;
    const need = S.xpNeeded(d.level);
    U.$("#avatar-emoji").textContent = d.profile.avatar;
    U.$("#lvl-badge").textContent = "Lv " + d.level;
    U.$("#lvl-title").textContent = S.levelTitle(d.level);
    U.$("#lvl-xp").textContent = `${d.xpIntoLevel} / ${need} XP`;
    U.$("#xpbar-fill").style.width = U.clamp((d.xpIntoLevel / need) * 100, 0, 100) + "%";

    const coinEl = U.$("#coin-count");
    if (coinEl.textContent !== String(d.coins)) {
      coinEl.textContent = d.coins;
      pulse(U.$("#coin-pill"));
    }
    U.$("#streak-count").textContent = d.streak.count;
    U.$("#streak-pill").classList.toggle("hot", d.streak.count >= 3);
  }

  function pulse(node) {
    if (!node) return;
    node.classList.remove("bump");
    void node.offsetWidth;
    node.classList.add("bump");
  }

  function applyTheme(id) {
    document.documentElement.dataset.theme = id;
    S.data.profile.theme = id;
    S.save();
  }

  /* ── toasts ──────────────────────────────────────────────── */
  function toast(opts) {
    const o = typeof opts === "string" ? { text: opts } : opts;
    const node = U.el("div", { class: "toast " + (o.kind || "") }, [
      U.el("span", { class: "toast-ico", text: o.icon || "📖" }),
      U.el("span", { html: o.text })
    ]);
    U.$("#toasts").appendChild(node);
    setTimeout(() => {
      node.classList.add("out");
      setTimeout(() => node.remove(), 320);
    }, o.ms || 2600);
  }

  /* ── modals ──────────────────────────────────────────────── */
  let escHandler = null;

  /**
   * Open a modal.
   *
   * Given real dialog semantics rather than being a styled div: without role="dialog" and
   * aria-modal a screen reader keeps reading the page behind it, and without the focus
   * trap Tab walks out of the dialog into content the student cannot see. Focus is
   * returned to whatever opened it on close, which is what makes keyboard play survive a
   * results screen.
   */
  function modal(content, opts) {
    const o = opts || {};
    const root = U.$("#modal-root");
    closeModal();
    root.hidden = false;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");

    const box = U.el("div", { class: "modal" + (o.center ? " modal-center" : "") });
    if (typeof content === "string") box.innerHTML = content;
    else box.appendChild(content);
    root.appendChild(box);

    /* Label the dialog by its own heading where it has one. */
    const heading = box.querySelector("h2, h3");
    if (heading) {
      heading.id = heading.id || "modal-title";
      root.setAttribute("aria-labelledby", heading.id);
    } else root.removeAttribute("aria-labelledby");

    lastFocus = document.activeElement;
    const focusables = () => Array.from(box.querySelectorAll(
      "button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])"));
    const first = focusables()[0];
    if (first) first.focus();

    /* The trap. Tab and Shift-Tab wrap inside the dialog rather than escaping it. */
    trapHandler = e => {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const at = list.indexOf(document.activeElement);
      if (e.shiftKey && (at <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && at === list.length - 1) { e.preventDefault(); list[0].focus(); }
    };
    document.addEventListener("keydown", trapHandler);

    if (!o.sticky) {
      root.onclick = e => { if (e.target === root) closeModal(); };
      escHandler = e => { if (e.key === "Escape") closeModal(); };
      document.addEventListener("keydown", escHandler);
    }
    return { box, close: closeModal };
  }

  function closeModal() {
    const root = U.$("#modal-root");
    root.hidden = true;
    root.innerHTML = "";
    root.onclick = null;
    root.removeAttribute("role");
    root.removeAttribute("aria-modal");
    root.removeAttribute("aria-labelledby");
    if (escHandler) {
      document.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
    if (trapHandler) {
      document.removeEventListener("keydown", trapHandler);
      trapHandler = null;
    }
    /* Put focus back where it was, but only if that element is still on the page — after
       a results modal the whole screen has usually been replaced. */
    if (lastFocus && lastFocus.isConnected && typeof lastFocus.focus === "function") {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    lastFocus = null;
  }

  function confirmDialog(title, body, onYes, yesLabel) {
    modal(U.el("div", {}, [
      U.el("h2", { text: title }),
      U.el("p", { html: body }),
      U.el("div", { class: "row", style: "margin-top:16px" }, [
        U.el("button", { class: "btn btn-ghost", text: "Cancel", on: { click: closeModal } }),
        U.el("div", { class: "spacer" }),
        U.el("button", { class: "btn btn-primary", text: yesLabel || "Confirm",
                         on: { click: () => { closeModal(); onYes(); } } })
      ])
    ]));
  }

  /* ── the reward pipeline ─────────────────────────────────────
     Every game calls this instead of touching State directly, so level-ups,
     achievement unlocks, the difficulty multiplier and the anti-farm accuracy gate all
     happen in exactly one place. It is also what makes "the Draft Desk earns nothing"
     and "the arcade earns nothing" structural facts rather than promises: those two
     never call it.

     opts: { xp, bonus, coins, accuracy, at, silent, raw, crutches:[String] }  */
  function award(opts) {
    const o = opts || {};

    /* The completion bonus is gated on accuracy, so a run of pure guessing pays
       nothing. Without this you could mash any answer, finish the run and still collect
       the streak bonus — worth about 35,000 XP/hour of mindless tapping in the
       reference app before it was fixed. `xp` itself is already net of wrong-answer
       penalties, so it needs no further scaling.

       There is deliberately no floor anywhere in here. "You get at least 50 XP for
       finishing" is a farm. */
    let bonus = Math.max(0, o.bonus || 0);
    if (o.accuracy !== undefined) {
      const acc = U.clamp(o.accuracy, 0, 1);
      bonus = acc < MIN_BONUS_ACCURACY ? 0 : Math.round(bonus * acc);
    }

    /* Optional crutches cost a share of the run, latched on at first use and never
       refundable — see `crutch()`. Applied to the whole award so it cannot be dodged
       by leaning on a helper for the hard questions only. */
    const crutchCost = U.clamp((o.crutchCost || 0), 0, 0.8);

    const mult = o.raw ? 1 : S.xpMultiplier();
    const gross = Math.max(0, o.xp || 0) + bonus;
    const xp = Math.round(gross * mult * (1 - crutchCost));
    /* Marks stay scarcer than XP: payouts run at 60% so the shop keeps costing
       something. tests/economy.js prints the effort-per-purchase table. */
    const coins = Math.round((o.coins || 0) * (o.raw ? 1 : 0.6) * (1 - crutchCost));

    if (coins) S.addCoins(coins, true);
    const res = xp ? S.addXP(xp) : { levelsGained: 0 };
    if (!xp && coins) S.emit();
    res.xp = xp;
    res.coins = coins;
    res.multiplier = mult;
    res.crutchCost = crutchCost;

    if (o.at && xp && !o.silent) {
      const r = o.at.getBoundingClientRect();
      EN.FX.floatText(r.left + r.width / 2 - 20, r.top - 6, "+" + xp + " XP");
    }
    if (coins && !o.silent) EN.Sound.coin();

    if (res.levelsGained > 0) {
      EN.Sound.levelUp();
      EN.FX.confetti(110);
      toast({ icon: "🎉", kind: "xp", ms: 3600,
        text: `<b>Level ${res.newLevel}.</b> You are now a ${S.levelTitle(res.newLevel)} · +${30 * res.newLevel} ✒️` });
      if (res.newLevel >= S.MAX_LEVEL) {
        setTimeout(() => toast({ icon: "📜", kind: "good", ms: 5000,
          text: "<b>Level 60.</b> You can now Ascend from the Progress screen." }), 1200);
      }
    }

    S.checkAchievements().forEach((a, i) => {
      setTimeout(() => {
        EN.Sound.achievement();
        EN.FX.confetti(60);
        toast({ icon: a.icon, kind: "good", ms: 3800,
          text: `<b>${U.escapeHtml(a.name)}</b> unlocked${a.reward ? ` · +${a.reward} ✒️` : ""}` });
      }, 500 + i * 900);
    });

    syncHeader();
    return res;
  }

  /* ── latching crutches ──────────────────────────────────────
     An optional helper — a definition peek, a revealed letter, the detailed thesis
     checker — costs a share of the run. The cost is set the moment the helper is FIRST
     used and is never cleared, because setting it on the current state instead meant
     you could switch the helper off before submitting and get the cost refunded. A
     one-way door, and named on the results screen so the charge is visible.

     Returns { use(), used(), cost(), label } — pass `cost()` to award as crutchCost. */
  function crutch(label, costFraction) {
    let on = false;
    return {
      label,
      use() { on = true; return true; },
      used() { return on; },
      cost() { return on ? costFraction : 0; }
    };
  }

  /** Sum a set of crutches into one fraction for `award`. */
  function crutchCost(list) {
    return U.clamp((list || []).reduce((n, c) => n + (c && c.cost ? c.cost() : 0), 0), 0, 0.8);
  }

  /* ── shared game chrome ──────────────────────────────────── */
  /**
   * Standard header for a game screen.
   * → { root, body, meta } — playfield into `body`, status chips into `meta`.
   */
  function gameShell(title, opts) {
    const o = opts || {};
    const meta = U.el("div", { class: "gmeta" });
    const body = U.el("div", { class: "grid" });
    const back = U.el("button", {
      class: "btn btn-sm btn-ghost", text: "← Back",
      on: { click: () => {
        if (o.confirmExit) {
          confirmDialog("Leave this run?", "Your progress in this run will be lost.",
            () => go(o.backTo || "/play"), "Leave");
        } else go(o.backTo || "/play");
      } }
    });
    const root = U.el("div", { class: "gshell" }, [
      U.el("div", { class: "ghead" }, [back, U.el("div", { class: "gtitle", text: title }), meta]),
      body
    ]);
    return { root, body, meta };
  }

  /** Grade a run. → { rank, cls, blurb }. */
  function rank(accuracy, bonus) {
    const score = accuracy + (bonus || 0);
    if (score >= 97) return { rank: "S", cls: "rank-s", blurb: "Nothing to add. That's the standard." };
    if (score >= 88) return { rank: "A", cls: "rank-a", blurb: "Sharp. You're reading, not guessing." };
    if (score >= 75) return { rank: "B", cls: "rank-b", blurb: "Solid — the shaky ones are worth a second look." };
    if (score >= 60) return { rank: "C", cls: "rank-c", blurb: "Getting there. Go back over what you missed." };
    return { rank: "D", cls: "rank-d", blurb: "Rough one. Try the Quote Vault for this text first." };
  }

  /**
   * End-of-run summary.
   *
   * By default this is GATED behind a button rather than opening over the page, because
   * the explanations and model answers are still on screen underneath and they are the
   * part actually worth reading. Opening a modal over the worked solution the moment
   * the last answer lands means the only way back to it is quitting the run. Pass
   * `gate:false` for modes with nothing to read behind them, like a grid or a match.
   *
   * opts: { title, correct, total, xp, coins, extraStats, newBest, onAgain,
   *         gate, review, note }
   */
  function results(opts) {
    const o = opts;
    const acc = U.pct(o.correct, o.total);
    const r = o.rank || rank(acc, o.bonus);
    const perfect = o.total > 0 && o.correct === o.total;
    let celebrated = false;

    const cells = [
      [o.scoreLabel || "Correct", o.scoreText || `${o.correct}/${o.total}`],
      ["Accuracy", acc + "%"],
      ["XP", "+" + o.xp]
    ].concat(o.extraStats || []);

    const box = U.el("div", { class: "modal-center results-modal" }, [
      U.el("div", { class: "modal-big " + r.cls, text: r.rank }),
      U.el("h2", { text: o.title || "Run complete", style: "justify-content:center" }),
      U.el("p", { text: r.blurb }),
      o.newBest ? U.el("div", { class: "chip on", text: "🏅 New personal best" }) : null,
      U.el("div", { class: "result-grid" }, cells.map(([lbl, val]) =>
        U.el("div", { class: "result-cell" }, [
          U.el("div", { class: "result-num", text: String(val) }),
          U.el("div", { class: "result-lbl", text: lbl })
        ])
      )),
      o.coins ? U.el("p", { class: "muted", html: `Earned <b>${o.coins}</b> ✒️ Marks` }) : null,
      o.note ? U.el("p", { class: "tiny muted", html: o.note }) : null,
      o.review === false ? null : U.el("button", {
        class: "btn btn-ghost btn-sm btn-block", style: "margin-top:8px",
        text: o.reviewLabel || "👁 Review the working",
        on: { click: () => { closeModal(); showReopen(); } }
      }),
      U.el("div", { class: "row", style: "margin-top:8px" }, [
        U.el("button", { class: "btn btn-ghost btn-sm", text: "Back to games",
                         on: { click: () => { closeModal(); go("/play"); } } }),
        U.el("div", { class: "spacer" }),
        o.onAgain ? U.el("button", { class: "btn btn-primary", text: "Play again",
                         on: { click: () => { closeModal(); o.onAgain(); } } }) : null
      ])
    ]);

    /* While reviewing, one floating button is the whole way back. The run is already
       scored, so there is nothing to recompute; handleRoute clears strays. */
    function showReopen() {
      U.$$(".results-reopen").forEach(n => n.remove());
      const btn = U.el("button", {
        class: "results-reopen btn btn-primary", text: "Show results ↑",
        on: { click: () => { btn.remove(); open(); } }
      });
      document.body.appendChild(btn);
    }

    function open() {
      if (!celebrated) {
        celebrated = true;
        if (perfect) { EN.Sound.perfect(); EN.FX.confetti(140); }
        else if (acc >= 60) { EN.Sound.win(); EN.FX.confetti(70); }
        else EN.Sound.lose();
      }
      modal(box, { sticky: true });
    }

    if (o.gate === false) { open(); return; }

    /* Gated: a floating prompt the student taps when they've finished reading. */
    U.$$(".results-reopen").forEach(n => n.remove());
    const gateBtn = U.el("button", {
      class: "results-reopen btn btn-primary",
      text: o.gateLabel || "See your results ↑",
      on: { click: () => { gateBtn.remove(); open(); } }
    });
    document.body.appendChild(gateBtn);
    EN.Sound.rankUp();
  }

  /** Standard chip row used by games to show score / lives / timer. */
  function chip(text, cls) { return U.el("span", { class: "chip " + (cls || ""), text }); }

  /* ── boot ────────────────────────────────────────────────── */
  function init() {
    window.addEventListener("hashchange", handleRoute);
    S.onChange(syncHeader);
    syncHeader();
    handleRoute();
  }

  return { route, go, init, handleRoute, syncHeader, applyTheme, toast, modal, closeModal,
           confirmDialog, award, gameShell, results, rank, chip, onLeave, pulse,
           crutch, crutchCost, readTimeFor, rushFloor, rushHint, timeBudget, announce,
           MIN_BONUS_ACCURACY, READ_BASE_MS, READ_PER_WORD_MS, READ_CAP_MS };
})();
