/* THE DEV MENU — for testing the app, not for playing it.
   ============================================================================
   Reaching level 60 honestly is about 1.42 million XP, and half the app is gated behind
   levels, Marks, a filled Vault, a mistake list or a week of history. Testing any of that
   by playing it is not testing, so this screen puts every one of those states one tap away.

   Two things it is careful about.

   It is NOT linked from the navigation. The route works if you type it, and Settings opens
   it if you tap the version number five times — the deliberate-gesture pattern, because a
   button on the Settings screen is a button a student finds. It is not a secret: anything
   shipped to a browser can be found, and pretending otherwise would be worse than saying
   so. What it is is un-stumble-upon-able.

   And it STAMPS the save. Every action sets `dev.touched`, and both this screen and Settings
   say so afterwards, because the whole economy of this app is built on numbers being earned:
   an achievement, a high score or a level that came from here has to be distinguishable from
   one that did not, or the app starts lying to its own author. There is a snapshot button at
   the top for the same reason — testing should not cost a real save.
   ============================================================================ */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.dev = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  const SNAP_KEY = "closereading.devsnapshot";

  /** Every action goes through here: stamp, persist, re-render, say what happened. */
  function act(label, fn) {
    fn();
    const d = S.data.dev || (S.data.dev = { touched: 0, actions: 0 });
    d.touched = Date.now();
    d.actions++;
    S.checkAchievements();
    S.save();
    S.flush();
    UI.toast({ icon: "🛠", kind: "good", text: label });
    UI.handleRoute();
  }

  function screen(view) {
    view.appendChild(U.el("h1", { text: "🛠 Dev menu" }));
    view.appendChild(U.el("p", { class: "muted",
      text: "For testing states that would take weeks to reach honestly. Everything here " +
            "stamps the save, so a level or an achievement from this screen stays " +
            "distinguishable from one that was earned." }));

    /* ── the safety net, first ── */
    const hasSnap = !!readSnap();
    view.appendChild(U.el("div", { class: "card" }, [
      U.el("b", { text: "Snapshot" }),
      U.el("div", { class: "tiny muted", style: "margin:6px 0 10px",
        text: hasSnap ? "A snapshot is stored. Restoring it replaces the current save."
                      : "Take one before you start poking, and testing costs you nothing." }),
      U.el("div", { class: "row", style: "flex-wrap:wrap" }, [
        U.el("button", { class: "btn btn-primary btn-sm", text: "📸 Take a snapshot",
          on: { click: takeSnap } }),
        hasSnap ? U.el("button", { class: "btn btn-ghost btn-sm", text: "↩ Restore it",
          on: { click: restoreSnap } }) : null,
        hasSnap ? U.el("button", { class: "btn btn-ghost btn-sm", text: "🗑 Forget it",
          on: { click: () => { try { localStorage.removeItem(SNAP_KEY); } catch (e) {}
                               UI.handleRoute(); } } }) : null
      ])
    ]));

    if (S.data.dev && S.data.dev.touched) {
      view.appendChild(U.el("div", { class: "notice notice-bad", style: "margin-top:12px" }, [
        U.el("b", { text: "This save has been modified. " }),
        U.el("span", { text: S.data.dev.actions + " dev action" +
          (S.data.dev.actions === 1 ? "" : "s") + ", last " +
          new Date(S.data.dev.touched).toLocaleString() + ". Its levels, Marks, high scores " +
          "and achievements are not evidence of anything." })
      ]));
    }

    /* ── level and XP ── */
    section(view, "Level and XP", [
      row("Level", S.data.level + " / " + S.MAX_LEVEL + "  ·  " + S.levelTitle(S.data.level)),
      numberRow("Set level to", S.data.level, 1, S.MAX_LEVEL, n =>
        act("Level " + n, () => { S.data.level = n; S.data.xpIntoLevel = 0; })),
      chips([["Lv 1", 1], ["Lv 5", 5], ["Lv 15", 15], ["Lv 30", 30], ["Lv 60", S.MAX_LEVEL]],
        (label, n) => act(label, () => { S.data.level = n; S.data.xpIntoLevel = 0; })),
      row("Lifetime XP", (S.data.lifetimeXp || 0).toLocaleString()),
      chips([["+1k XP", 1000], ["+10k", 10000], ["+100k", 100000]],
        (label, n) => act(label + " added", () => S.addXP(n))),
      chips([["Ascend now", 1]], () => act("Ascended", () => {
        S.data.level = S.MAX_LEVEL;
        S.doPrestige();
      }))
    ]);

    /* ── Marks ── */
    section(view, "Marks", [
      row("Balance", (S.data.coins || 0).toLocaleString() + " ✒️"),
      numberRow("Set Marks to", S.data.coins, 0, 999999, n =>
        act(n + " Marks", () => { S.data.coins = n; })),
      chips([["+500", 500], ["+5,000", 5000], ["+50,000", 50000], ["Zero", -1]],
        (label, n) => act("Marks: " + label, () => {
          if (n < 0) S.data.coins = 0; else S.addCoins(n, true);
        }))
    ]);

    /* ── unlocks ── */
    section(view, "Unlocks", [
      row("Themes", S.data.owned.themes.length + " / " + EN.DATA.themes.length),
      row("Avatars", S.data.owned.avatars.length + " / " + EN.DATA.avatars.length),
      row("Bosses beaten", Object.keys(S.data.bossesBeaten).length + " / 5"),
      row("Achievements", Object.keys(S.data.achievements).length + " / " + EN.DATA.achievements.length),
      chips([["Every theme", "themes"], ["Every avatar", "avatars"],
             ["9 of every power-up", "powerups"], ["All bosses beaten", "bosses"],
             ["Every achievement", "achievements"]],
        (label, what) => act(label, () => {
          if (what === "themes") S.data.owned.themes = EN.DATA.themes.map(t => t.id);
          if (what === "avatars") S.data.owned.avatars = EN.DATA.avatars.map(a => a.em);
          /* Set to nine, not add nine: grantPowerup accumulates, so "9 of every" on top
             of the two a new save starts with produced ten of two of them. */
          if (what === "powerups") EN.DATA.shop.powerups.forEach(p => (S.data.inventory[p.id] = 9));
          if (what === "bosses") ["party", "double", "critic", "blankpage", "examiner"]
            .forEach(id => S.data.bossesBeaten[id] = Date.now());
          if (what === "achievements") EN.DATA.achievements
            .forEach(a => S.data.achievements[a.id] = Date.now());
        })),
      chips([["Lock it all back", "lock"]], () => act("Unlocks cleared", () => {
        S.data.owned = { themes: ["marginalia"], avatars: ["🖋️", "📖"] };
        S.data.bossesBeaten = {};
        S.data.achievements = {};
        S.data.inventory = { fifty: 1, skip: 1, freeze: 0, reread: 0, hint: 0,
                             insight: 0, adrenaline: 0 };
      }))
    ]);

    /* ── arcade ── */
    section(view, "The Arcade", (EN.DATA.arcade || []).map(g =>
      row(g.icon + " " + g.name, U.fmtTime(EN.Arcade.remaining(g.id)))
    ).concat([
      chips([["30 min each", 1800], ["2 hours each", 7200], ["No time", 0]],
        (label, secs) => act("Arcade: " + label, () => {
          (EN.DATA.arcade || []).forEach(g => {
            S.data.arcade.tickets[g.id] = secs;
          });
        })),
      chips([["Clear high scores", "scores"]], () => act("Arcade scores cleared",
        () => { S.data.arcade.scores = {}; }))
    ]));

    /* ── the Vault ── */
    const totalQuotes = EN.Bank.quotes().length;
    section(view, "The Quote Vault", [
      row("Quotes in play", String(totalQuotes)),
      row("Due today", String(S.dueCards().length)),
      row("Mastered (box 5)", String(Object.values(S.data.srs).filter(c => c.box >= 5).length)),
      row("Leeches", String(S.leeches().length)),
      chips([["Everything due", "due"], ["Master everything", "master"],
             ["Make 5 leeches", "leech"], ["Forget it all", "clear"]],
        (label, what) => act("Vault: " + label, () => {
          const qs = EN.Bank.quotes();
          if (what === "clear") { S.data.srs = {}; return; }
          if (what === "due") {
            qs.forEach(q => { const c = S.cardState(q.id); c.due = "2000-01-01"; });
            return;
          }
          if (what === "master") {
            qs.forEach(q => {
              const c = S.cardState(q.id);
              c.box = 5; c.reps = 9;
              const d = new Date(); d.setDate(d.getDate() + 16);
              c.due = U.dayKey(d);
            });
            return;
          }
          /* Through reviewCard, so the box reset that MAKES a leech happens for real
             rather than being written straight into the save. */
          qs.slice(0, 5).forEach(q => {
            for (let i = 0; i < S.LEECH_LAPSES; i++) S.reviewCard(q.id, false);
          });
        }))
    ]);

    /* ── answers, skills and mistakes ── */
    const skills = EN.Bank.statsByTopic();
    section(view, "Answers, skills and mistakes", [
      row("Answered", String(S.data.stats.answered || 0)),
      row("Accuracy", S.overallAccuracy() + "%"),
      row("Mistakes waiting", String((S.data.mistakes || []).length)),
      row("Skills with data", String(skills.filter(t => t.seen > 0).length) + " / " + skills.length),
      chips([["Seed a lopsided profile", "profile"], ["Seed 12 mistakes", "mistakes"],
             ["Clear answer history", "clear"]],
        (label, what) => act(label, () => {
          if (what === "clear") {
            S.data.stats.answered = 0; S.data.stats.correct = 0;
            S.data.modules = {}; S.data.texts = {}; S.data.topics = {};
            S.data.mistakes = [];
            return;
          }
          if (what === "mistakes") {
            S.data.mistakes = EN.Bank.all().slice(0, 12)
              .map(q => ({ id: q.id, misses: 1 + (q.id.length % 3), ts: Date.now() }));
            return;
          }
          /* Lopsided on purpose: a flat profile gives the Progress diagnosis nothing to
             say, and saying nothing is the case that is already easy to reach. */
          const all = EN.Bank.allTopics();
          all.forEach((name, i) => {
            const seen = 12 + i * 4;
            const rate = 0.3 + (i / Math.max(1, all.length - 1)) * 0.6;
            S.data.topics[name] = { seen, correct: Math.round(seen * rate) };
          });
          EN.DATA.modules.forEach((m, i) =>
            S.data.modules[m.id] = { seen: 30, correct: 30 - i * 5 });
          EN.Bank.activeTextIds().forEach((id, i) =>
            S.data.texts[id] = { seen: 25, correct: 22 - i * 4 });
          S.data.stats.answered = 200;
          S.data.stats.correct = 130;
        }))
    ]);

    /* ── the clock-driven things ── */
    const day = S.daily();
    section(view, "Daily, weekly and streak", [
      row("Today's challenge", day.spec.mode + " — " + day.progress + " / " + day.spec.target +
                               (day.claimed ? " (claimed)" : "")),
      row("Streak", S.data.streak.count + " day" + (S.data.streak.count === 1 ? "" : "s") +
                    "  ·  longest " + S.data.streak.longest),
      chips([["Finish today's challenge", "daily"], ["Finish every quest", "quests"],
             ["Roll the day over", "rollday"], ["Roll the week over", "rollweek"],
             ["30-day streak", "streak"]],
        (label, what) => act(label, () => {
          if (what === "daily") { const d = S.daily(); d.progress = d.spec.target; d.claimed = false; }
          if (what === "quests") {
            /* The quest board is derived by diffing cumulative stats against a baseline
               snapshot, so completing it means moving the baseline, not the progress. */
            const w = S.weekly();
            if (w && w.baseline) Object.keys(w.baseline).forEach(k => {
              if (typeof w.baseline[k] === "number") w.baseline[k] = 0;
            });
          }
          if (what === "rollday") { S.data.daily.day = "2000-01-01"; S.data.streak.last = "2000-01-01"; }
          if (what === "rollweek") { S.data.weekly.week = "2000-W01"; }
          if (what === "streak") { S.data.streak.count = 30; S.data.streak.longest = 30; }
        }))
    ]);

    /* ── layer C ── */
    section(view, "Sentence marking (Layer C)", [
      row("Available here", EN.Mark.available() ? "yes" : "no — " + (EN.Mark.blockedReason() || "?")),
      row("Opted in", S.data.settings.layerC ? "yes" : "no"),
      chips([["Load the model now", "load"], ["Forget today's scored prompts", "forget"]],
        (label, what) => {
          if (what === "forget") return act(label, () => {
            S.data.freeText = { day: U.dayKey(), scored: {}, hashes: {} };
          });
          UI.toast({ icon: "⏳", text: "Loading the marker…" });
          EN.Mark.load().then(ok => UI.toast({
            icon: ok ? "✅" : "⚠", kind: ok ? "good" : "bad",
            text: ok ? "Marker ready." : "Marker would not load here." }));
        })
    ]);

    /* ── jump anywhere ── */
    const ROUTES = ["/home", "/play", "/vault", "/progress", "/shop", "/arcade", "/draft",
                    "/texts", "/reference", "/settings", "/achievements", "/boss",
                    "/game/paper", "/game/rapid", "/game/technique", "/game/cloze",
                    "/game/marking", "/game/essay", "/game/quotematch", "/game/bandgrid",
                    "/game/deconstruct", "/game/sayit", "/game/thesis", "/game/rewrite",
                    "/game/survival", "/game/rehab", "/game/drill/all"];
    view.appendChild(U.el("h2", { text: "Jump to" }));
    const jump = U.el("div", { class: "row", style: "flex-wrap:wrap" });
    ROUTES.forEach(r => {
      const b = U.el("button", { class: "chip chip-btn", type: "button", text: r });
      b.addEventListener("click", () => UI.go(r));
      jump.appendChild(b);
    });
    view.appendChild(jump);

    view.appendChild(U.el("div", { class: "row", style: "margin-top:20px" }, [
      U.el("button", { class: "btn btn-ghost btn-sm", text: "← Settings",
        on: { click: () => UI.go("/settings") } }),
      U.el("div", { class: "spacer" }),
      U.el("button", { class: "btn btn-danger btn-sm", text: "Wipe the save",
        on: { click: () => UI.confirmDialog("Wipe everything?",
          "Every level, Mark, quote box, draft and achievement. If you took a snapshot it " +
          "survives this, because it lives under its own key.",
          () => { S.reset(); location.reload(); }, "Wipe") } })
    ]));
  }

  /* ── the snapshot ──
     Its own localStorage key, so wiping the save does not take it with it. */
  function readSnap() {
    try { return localStorage.getItem(SNAP_KEY); } catch (e) { return null; }
  }
  function takeSnap() {
    try {
      localStorage.setItem(SNAP_KEY, JSON.stringify(S.data));
      UI.toast({ icon: "📸", kind: "good", text: "Snapshot taken." });
      UI.handleRoute();
    } catch (e) {
      UI.toast({ icon: "⚠", kind: "bad", text: "Could not store a snapshot — storage is full." });
    }
  }
  function restoreSnap() {
    const raw = readSnap();
    if (!raw) return;
    UI.confirmDialog("Restore the snapshot?",
      "The current save is replaced by the one you stored. This cannot be undone.",
      () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (e) { /* handled below */ }
        if (!parsed) {
          return UI.toast({ icon: "⚠", kind: "bad", text: "That snapshot will not parse." });
        }
        /* replaceSave latches the save file and the caller reloads — the same contract
           Settings' import uses, so there is one way a save gets replaced. */
        if (S.replaceSave(parsed)) location.reload();
        else UI.toast({ icon: "⚠", kind: "bad", text: "Could not write the save." });
      }, "Restore");
  }

  /* ── little builders ── */
  function section(view, title, children) {
    view.appendChild(U.el("h2", { text: title }));
    view.appendChild(U.el("div", { class: "card" }, children));
  }
  function row(label, value) {
    return U.el("div", { class: "kv" }, [
      U.el("span", { text: label }), U.el("b", { text: String(value) })
    ]);
  }
  function chips(pairs, onPick) {
    const wrap = U.el("div", { class: "row", style: "flex-wrap:wrap; margin-top:10px" });
    pairs.forEach(([label, value]) => {
      const b = U.el("button", { class: "chip chip-btn", type: "button", text: label });
      b.addEventListener("click", () => onPick(label, value));
      wrap.appendChild(b);
    });
    return wrap;
  }
  function numberRow(label, value, min, max, onSet) {
    const input = U.el("input", { class: "tin", type: "number", value: String(value),
                                  min: String(min), max: String(max),
                                  style: "max-width:120px" });
    const go = U.el("button", { class: "btn btn-ghost btn-sm", text: "Set" });
    go.addEventListener("click", () => {
      const n = U.clamp(Math.round(Number(input.value) || 0), min, max);
      onSet(n);
    });
    return U.el("div", { class: "row", style: "margin-top:10px" }, [
      U.el("span", { class: "tiny muted", style: "flex:1; min-width:0", text: label }),
      input, go
    ]);
  }

  return screen;
})();
