/* BOOT — route table, settings restore, service worker, and the save-on-background pact.
   ============================================================================
   Four things in here are bug fixes rather than plumbing, and each one cost somebody a
   day in the reference app:

     §9.3  `hadController` is read BEFORE the service worker is registered. Register
           first and the browser may have set navigator.serviceWorker.controller by the
           time you look, so a first-ever install reads as an update and the student is
           told to reload an app they just opened.

     §9.4  State.flush() on `visibilitychange` and `pagehide`. A debounced write loses
           the last 400 ms of a session, and on iOS the tab is frozen without ever firing
           `beforeunload` — so a level-up on the last question of a run vanished.

     E2/E7 The update prompt is *sequenced*: only offer a reload when a new worker has
           actually reached `installed` with an existing controller, and reload exactly
           once on `controllerchange`, guarded by a flag, or the page reloads in a loop.

     H3    --topbar-h is measured and republished, because the sticky sub-headers in the
           CSS offset against it and the bar's height changes with the safe-area inset.
   ============================================================================ */
window.EN = window.EN || {};

/** Bumped with every deploy. sw.js keeps its own version — they need not match, but a
    release should move both, and tests/update.js checks the sw.js constant changed. */
EN.BUILD = "1.0.0";

(function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /* ── 1. state before anything reads it ────────────────────── */
  S.load();

  const set = S.data.settings;
  EN.Sound.setEnabled(set.sound !== false);
  EN.Sound.setVolume(typeof set.volume === "number" ? set.volume : 0.7);
  /* The in-app toggle and the OS preference are both honoured; either one turns motion
     off, and neither can turn it back on against the other. */
  const prefersStill = window.matchMedia &&
                       window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  EN.FX.setReduced(set.motion === false || prefersStill);
  document.documentElement.dataset.theme = S.data.profile.theme || "marginalia";

  /* ── 2. routes ────────────────────────────────────────────── */
  UI.route("home", EN.Screens.home);
  UI.route("play", EN.Screens.play.screen);
  UI.route("game", EN.Screens.play.dispatch);
  UI.route("vault", EN.Screens.vault.screen);
  UI.route("reference", EN.Screens.reference);
  UI.route("progress", EN.Screens.progress);
  UI.route("shop", EN.Screens.shop);
  UI.route("arcade", EN.Arcade.screen);
  UI.route("draft", EN.Screens.draft.screen);
  UI.route("texts", EN.Screens.texts.screen);
  UI.route("settings", EN.Screens.misc.settings);
  UI.route("achievements", EN.Screens.misc.achievements);
  UI.route("boss", EN.Games.boss.start);

  /* ── 3. header controls ───────────────────────────────────── */
  U.$("#avatar-btn").addEventListener("click", () => EN.Screens.misc.profileSheet());
  U.$("#settings-btn").addEventListener("click", () => UI.go("/settings"));
  U.$("#coin-pill").addEventListener("click", () => UI.go("/shop"));
  U.$("#streak-pill").addEventListener("click", () => UI.go("/progress"));

  /* ── 4. the topbar height, republished (H3) ───────────────── */
  const topbar = U.$("#topbar");
  function measureTopbar() {
    const h = Math.round(topbar.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty("--topbar-h", h + "px");
  }
  measureTopbar();
  if (window.ResizeObserver) new ResizeObserver(measureTopbar).observe(topbar);
  else window.addEventListener("resize", measureTopbar);
  /* Orientation changes settle after the event fires, so measure again on the next frame. */
  window.addEventListener("orientationchange", () => requestAnimationFrame(measureTopbar));

  /* ── 5. never lose the last few seconds (§9.4) ───────────── */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") S.flush();
  });
  /* pagehide fires where beforeunload does not, which on iOS Safari is most of the time. */
  window.addEventListener("pagehide", () => S.flush());
  window.addEventListener("beforeunload", () => S.flush());

  /* Keyboard play: the number keys and A–D pick a choice, Enter advances. Bound here
     rather than per-game so every mode gets it for free; each game renders its choices
     as .choice buttons and its advance button as .js-next. */
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    if (e.key === "Enter") {
      const next = U.$(".js-next");
      if (next && !next.disabled) { e.preventDefault(); next.click(); }
      return;
    }
    if (e.key === "Escape") { UI.closeModal(); return; }

    const idx = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key)
              : "abcd".indexOf(e.key.toLowerCase());
    if (idx < 0) return;
    const choices = U.$$(".choice:not([disabled])");
    if (choices[idx]) { e.preventDefault(); choices[idx].click(); }
  });

  /* ── 6. streak and daily rollover, then paint ─────────────── */
  S.touchStreak();
  S.weeklyQuests();          // rolls the week over and snapshots the baseline if due
  S.dailySpec();             // rolls the daily over if due
  S.checkAchievements();     // catches anything an older build could not award

  UI.init();
  UI.applyTheme(S.data.profile.theme || "marginalia");

  /* Boot screen away once the first route has painted. */
  requestAnimationFrame(() => {
    const boot = U.$("#boot");
    if (boot) { boot.classList.add("gone"); setTimeout(() => boot.remove(), 600); }
    EN.Screens.misc.maybeOnboard();
  });

  /* ── 7. the service worker (§9.3, E2/E3/E5/E7) ────────────── */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    /* READ THIS BEFORE REGISTERING. See the header comment. */
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      /* Only a controller arriving where one already existed is an update; the first
         install also fires this, and reloading then is a wasted round trip at best. */
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(reg => {
        function offer(worker) {
          if (!worker || !hadController) return;
          UI.toast({
            icon: "↻", ms: 9000,
            text: "<b>Update ready.</b> Tap Reload in Settings, or reopen the app."
          });
          /* Take the update immediately — the student never sees a half-old shell. The
             controllerchange handler above does the single reload. */
          worker.postMessage({ type: "SKIP_WAITING" });
        }

        if (reg.waiting) offer(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          if (!w) return;
          w.addEventListener("statechange", () => {
            if (w.state === "installed") offer(w);
          });
        });
        /* One check per launch. More than that is bandwidth for nothing on a phone. */
        setTimeout(() => reg.update().catch(() => {}), 4000);
      }).catch(err => console.warn("Service worker did not register:", err));
    });
  }

  /* ── 8. Layer C, if the student has already opted in ──────── */
  /* Never on first load, never automatically. Only warm the runtime when the model is
     already in its cache bucket, so this costs no network in any case. */
  if (set.layerC && EN.Mark.available()) {
    EN.Mark.isDownloaded().then(has => { if (has) EN.Mark.load(); });
  }

  /* A missing hash lands on home rather than a blank screen — matters when the app is
     opened from a home-screen shortcut that dropped the fragment. */
  if (!location.hash) location.replace(location.href.split("#")[0] + "#/home");
})();
