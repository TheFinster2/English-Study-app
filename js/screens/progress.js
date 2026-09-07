/* Progress: mastery per module and per text, the XP heatmap, achievements, prestige. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.progress = function (view) {
  const U = EN.U, S = EN.State, UI = EN.UI;
  const d = S.data;

  view.appendChild(U.el("h1", { text: "📈 Progress" }));

  view.appendChild(U.el("div", { class: "grid g4" }, [
    tile(d.level, "Level"),
    tile(d.lifetimeXp.toLocaleString(), "Lifetime XP"),
    tile(d.streak.longest, "Longest streak"),
    tile(Object.keys(d.achievements).length + "/" + EN.DATA.achievements.length, "Achievements")
  ]));

  /* ── the diagnosis ────────────────────────────────────────────
     The screen was a wall of true numbers that added up to no instruction. Mastery per
     module tells a student which book to reread; mastery per SKILL tells them what kind of
     thinking to practise, and it is the same answer whichever text they are sitting. So the
     weakest skill with enough evidence behind it gets stated in a sentence, with the number
     it came from and a drill aimed at it.

     Ten answers before a skill can be called weak. Below that the figure is noise, and a
     diagnosis built on noise is worse than none — the student believes it. */
  const EVIDENCE = 10;
  const skills = EN.Bank.statsByTopic();
  const judged = skills.filter(t => t.seen >= EVIDENCE).sort((a, b) => a.accuracy - b.accuracy);
  if (judged.length >= 2) {
    const weak = judged[0], strong = judged[judged.length - 1];
    view.appendChild(U.el("h2", { text: "Where the marks are going" }));
    view.appendChild(U.el("div", { class: "card next-up" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "next-ico", text: "🩺" }),
        U.el("div", { style: "flex:1; min-width:0" }, [
          U.el("b", { style: "font-size:15px",
            text: weak.name + " is your weakest skill" }),
          U.el("div", { class: "tiny muted", style: "margin-top:6px; line-height:1.6",
            text: weak.correct + "/" + weak.seen + " correct (" + weak.accuracy + "%), against " +
                  strong.accuracy + "% on " + strong.name + ". A skill is the same skill in " +
                  "every text you study, so this is worth more than any single book." })
        ])
      ]),
      U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:12px",
        text: "Drill " + weak.name + " →",
        on: { click: () => UI.go(weak.route) } })
    ]));
  }

  /* ── by skill ── */
  view.appendChild(U.el("h2", { text: "By skill" }));
  view.appendChild(U.el("p", { class: "tiny muted",
    text: "What kind of question it was, not which text it came from. Grey means you have " +
          "not answered enough of them yet to say anything." }));
  const sk = U.el("div", { class: "card" });
  skills.slice().sort((a, b) => b.seen - a.seen).forEach(t => {
    const thin = t.seen < EVIDENCE;
    const tier = S.masteryTier(t.mastery);
    const row = U.el("button", { class: "mastery-item mastery-pick", type: "button" }, [
      U.el("div", { class: "mastery-badge", text: thin ? "·" : tier.icon }),
      U.el("div", { class: "mastery-body" }, [
        U.el("div", { class: "mastery-name", text: t.name }),
        U.el("div", { class: "bar", "aria-hidden": "true" },
          [U.el("i", { style: "width:" + (thin ? 0 : t.mastery) + "%" })]),
        U.el("div", { class: "tiny muted", style: "margin-top:4px",
          text: thin ? (t.seen ? t.seen + " answered — too few to judge" : "not attempted yet")
                     : t.correct + "/" + t.seen + " correct · " + t.accuracy + "% raw · " + tier.name })
      ]),
      U.el("div", { class: "mastery-pct", text: thin ? "—" : t.mastery + "%" })
    ]);
    row.addEventListener("click", () => UI.go(t.route));
    sk.appendChild(row);
  });
  view.appendChild(sk);

  /* Per-module AND per-text mastery, because a student can be strong on the Common
     Module and lost in Module B, and the adaptive draw weights both. */
  view.appendChild(U.el("h2", { text: "By module" }));
  const mods = U.el("div", { class: "card" });
  EN.Bank.statsByModule().forEach(m => {
    const tier = S.masteryTier(m.mastery);
    mods.appendChild(U.el("div", { class: "mastery-item" }, [
      U.el("div", { class: "mastery-badge", text: tier.icon }),
      U.el("div", { class: "mastery-body" }, [
        U.el("div", { class: "mastery-name", text: m.code + " — " + m.short }),
        U.el("div", { class: "bar", "aria-hidden": "true" }, [U.el("i", { style: "width:" + m.mastery + "%" })]),
        U.el("div", { class: "tiny muted", style: "margin-top:4px",
          text: m.correct + "/" + m.seen + " correct · " + m.accuracy + "% raw · " + tier.name })
      ]),
      U.el("div", { class: "mastery-pct", text: m.mastery + "%" })
    ]));
  });
  view.appendChild(mods);

  view.appendChild(U.el("h2", { text: "By text" }));
  const texts = U.el("div", { class: "card" });
  EN.Bank.statsByText().forEach(t => {
    const tier = S.masteryTier(t.mastery);
    texts.appendChild(U.el("div", { class: "mastery-item" }, [
      U.el("div", { class: "mastery-badge", text: tier.icon }),
      U.el("div", { class: "mastery-body" }, [
        U.el("div", { class: "mastery-name", text: t.title }),
        U.el("div", { class: "bar", "aria-hidden": "true" }, [U.el("i", { style: "width:" + t.mastery + "%" })]),
        U.el("div", { class: "tiny muted", style: "margin-top:4px",
          text: t.correct + "/" + t.seen + " correct · " + t.quotes + " quotes · " + tier.name })
      ]),
      U.el("div", { class: "mastery-pct", text: t.mastery + "%" })
    ]));
  });
  view.appendChild(texts);

  /* Mastery is confidence-weighted, so say so — an unexplained 40% after a perfect run
     looks like a bug. */
  view.appendChild(U.el("p", { class: "tiny muted",
    text: "Mastery is accuracy weighted by how much you have seen (accuracy × min(1, seen/25)), so a perfect three-question run does not read as mastered." }));

  view.appendChild(U.el("h2", { text: "Last 12 weeks" }));
  const heat = U.el("div", { class: "heat" });
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const xp = d.history[U.dayKey(dt)] || 0;
    const lv = xp === 0 ? 0 : xp < 200 ? 1 : xp < 600 ? 2 : xp < 1500 ? 3 : 4;
    heat.appendChild(U.el("div", { class: "heat-day", data: { lv: String(lv) },
                                   title: U.dayKey(dt) + " — " + xp + " XP" }));
  }
  view.appendChild(U.el("div", { class: "card" }, [heat]));

  view.appendChild(U.el("h2", { text: "Best scores" }));
  const scores = Object.entries(d.scores);
  view.appendChild(U.el("div", { class: "card" }, scores.length
    ? scores.map(([k, v]) => U.el("div", { class: "srow" }, [
        U.el("div", { class: "srow-body" }, [U.el("div", { style: "font-size:13.5px", text: k })]),
        U.el("span", { class: "chip", text: String(v) })
      ]))
    : [U.el("p", { class: "muted", text: "No runs yet." })]));

  if (d.mistakes.length) {
    view.appendChild(U.el("h2", { text: "Your mistakes", }));
    view.appendChild(U.el("p", { class: "muted",
      text: d.mistakes.length + " questions you have got wrong. The adaptive draw weights them ×3.5, and Mistake Rehab uses only these." }));
    const list = U.el("div");
    d.mistakes.slice(0, 12).forEach(m => {
      const q = EN.Bank.byId(m.id);
      if (!q) return;
      list.appendChild(U.el("div", { class: "wrongq" }, [
        U.el("div", { class: "q", text: q.q }),
        U.el("div", { class: "a", text: "→ " + q.choices[q.a] }),
        U.el("div", { class: "tiny muted", style: "margin-top:4px", text: "missed ×" + m.misses })
      ]));
    });
    view.appendChild(list);
    view.appendChild(U.el("button", { class: "btn btn-primary btn-block", text: "🩹 Rehabilitate them",
                                      on: { click: () => UI.go("/game/rehab") } }));
  }

  view.appendChild(U.el("h2", { text: "Achievements", html: null }));
  view.appendChild(U.el("button", { class: "btn btn-ghost btn-block",
    text: "🏅 All " + EN.DATA.achievements.length + " achievements →",
    on: { click: () => UI.go("/achievements") } }));

  /* Prestige. Resets level and XP, keeps every unlock, statistic and Vault box, and
     grants a permanent +12% XP that stacks. */
  if (S.canPrestige()) {
    view.appendChild(U.el("h2", { text: "Ascension" }));
    view.appendChild(U.el("div", { class: "card" }, [
      U.el("p", { text: "Level 60. Ascending resets your level and XP and keeps everything else — every unlock, achievement, Vault box and statistic — plus a permanent +12% XP that stacks with each ascension." }),
      U.el("div", { class: "row" }, [
        U.el("span", { class: "chip on", text: "Ascensions: " + (d.prestige || 0) }),
        U.el("div", { class: "spacer" }),
        U.el("button", { class: "btn btn-primary", text: "Ascend",
          on: { click: () => UI.confirmDialog("Ascend?",
            "Level and XP reset to 1. Everything else stays, and you gain a permanent <b>+12% XP</b>.",
            () => { if (S.doPrestige()) { EN.Sound.prestige(); EN.FX.confetti(180); UI.handleRoute(); } }, "Ascend") } })
      ])
    ]));
  } else {
    view.appendChild(U.el("p", { class: "tiny muted", style: "margin-top:18px",
      text: "Ascension unlocks at level 60. XP needed for the next level: " +
            (S.xpNeeded(d.level) - d.xpIntoLevel).toLocaleString() + "." }));
  }

  function tile(n, label) {
    return U.el("div", { class: "card stat-tile" }, [
      U.el("div", { class: "stat-num", text: String(n) }),
      U.el("div", { class: "stat-lbl", text: label })
    ]);
  }
};
