/* The home screen — where the student lands. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.home = function (view) {
  const U = EN.U, S = EN.State, UI = EN.UI;
  const d = S.data;

  const hour = new Date().getHours();
  const greet = hour < 5 ? "Still up" : hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  view.appendChild(U.el("div", { class: "hero" }, [
    U.el("h1", { text: greet + ", " + d.profile.name }),
    U.el("p", { text: d.streak.count > 0
      ? "Day " + d.streak.count + " of your streak. " + S.levelTitle(d.level) + ", level " + d.level + "."
      : "New day. " + S.levelTitle(d.level) + ", level " + d.level + "." }),
    U.el("div", { class: "row" }, [
      U.el("button", { class: "btn btn-primary", text: "▶ Play", on: { click: () => UI.go("/play") } }),
      U.el("button", { class: "btn btn-ghost", text: "🗝️ The Vault", on: { click: () => UI.go("/vault") } })
    ])
  ]));

  /* Stats. `overallAccuracy` is the confidence-weighted figure, not raw. */
  const due = S.dueCards().length;
  view.appendChild(U.el("div", { class: "grid g4", style: "margin-top:14px" }, [
    tile(d.stats.answered, "Answered"),
    tile(S.overallAccuracy() + "%", "Accuracy"),
    tile(due, "Quotes due"),
    tile(d.stats.quotesMastered, "Mastered")
  ]));

  if (due > 0) {
    view.appendChild(U.el("div", { class: "card", style: "margin-top:14px" }, [
      U.el("div", { class: "daily" }, [
        U.el("div", { class: "daily-ico", text: "🗝️" }),
        U.el("div", { class: "daily-body" }, [
          U.el("b", { text: due + " quote" + (due === 1 ? "" : "s") + " due in the Vault" }),
          U.el("div", { class: "tiny muted",
            text: "Cloze Crunch is the mode that pays — a typed answer is markable, a self-rated one is not." })
        ]),
        U.el("button", { class: "btn btn-primary btn-sm", text: "Drill them",
                         on: { click: () => UI.go("/game/cloze") } })
      ])
    ]));
  }

  /* This student's four texts. The manifest is the app's whole architecture, so it is
     visible on the home screen rather than buried in settings. */
  view.appendChild(U.el("div", { class: "row", style: "margin:26px 0 12px" }, [
    U.el("h2", { text: "Your texts", style: "margin:0" }),
    U.el("div", { class: "spacer" }),
    U.el("button", { class: "btn btn-ghost btn-sm", text: "Change",
                     on: { click: () => UI.go("/texts") } })
  ]));
  const slots = U.el("div", { class: "card" });
  EN.DATA.modules.forEach(m => {
    const a = S.activeTexts()[m.id];
    const ids = [].concat(a || []);
    ids.filter(Boolean).forEach(id => {
      const t = EN.Bank.text(id);
      if (!t) return;
      const acc = S.textMastery(id);
      slots.appendChild(U.el("div", { class: "text-slot" }, [
        U.el("div", { class: "text-slot-ico", text: m.icon }),
        U.el("div", { class: "text-slot-body" }, [
          U.el("div", { class: "text-slot-title", text: t.title }),
          U.el("div", { class: "text-slot-sub",
            text: m.code + " · " + (t.composer || "") + " · " + (t.quotes || []).length + " quotes" })
        ]),
        U.el("span", { class: "chip" + (acc >= 65 ? " on" : ""), text: acc + "%" })
      ]));
    });
  });
  if (!slots.childNodes.length) {
    slots.appendChild(U.el("div", { class: "tiny muted",
      text: "No texts chosen yet — pick what your class studies and the whole app follows." }));
  }
  view.appendChild(slots);

  view.appendChild(U.el("h2", { text: "Mastery" }));
  const mast = U.el("div", { class: "card" });
  EN.Bank.statsByModule().forEach(m => {
    const tier = S.masteryTier(m.mastery);
    mast.appendChild(U.el("div", { class: "mastery-item" }, [
      U.el("div", { class: "mastery-badge", text: tier.icon }),
      U.el("div", { class: "mastery-body" }, [
        U.el("div", { class: "mastery-name", text: m.code + " — " + m.short }),
        U.el("div", { class: "bar" }, [U.el("i", { style: "width:" + m.mastery + "%" })])
      ]),
      U.el("div", { class: "mastery-pct", text: m.mastery + "%" })
    ]));
  });
  view.appendChild(mast);

  /* Weekly quests. Progress is derived by diffing cumulative stats against a snapshot
     taken at week rollover, so no per-event plumbing exists anywhere. */
  view.appendChild(U.el("h2", { text: "This week", html: null }));
  const quests = U.el("div", { class: "grid" });
  S.weeklyQuests().forEach(e => {
    quests.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { style: "font-size:20px", text: e.quest.icon }),
        U.el("div", { style: "flex:1; min-width:0" }, [
          U.el("div", { style: "font-weight:700; font-size:13.5px", text: e.quest.name }),
          U.el("div", { class: "tiny muted", text: e.quest.desc })
        ]),
        e.claimed ? U.el("span", { class: "chip good", text: "✓ claimed" })
          : e.complete ? U.el("button", { class: "btn btn-primary btn-sm", text: "Claim",
              on: { click: () => { if (S.claimQuest(e.quest.id)) { EN.Sound.quest(); EN.FX.confetti(80); UI.handleRoute(); } } } })
          : U.el("span", { class: "chip", text: e.done + " / " + e.target })
      ]),
      e.claimed ? null : U.el("div", { class: "bar", style: "margin-top:8px" },
        [U.el("i", { style: "width:" + U.pct(e.done, e.target) + "%" })])
    ]));
  });
  view.appendChild(quests);

  function tile(n, label) {
    return U.el("div", { class: "card stat-tile" }, [
      U.el("div", { class: "stat-num", text: String(n) }),
      U.el("div", { class: "stat-lbl", text: label })
    ]);
  }
};
