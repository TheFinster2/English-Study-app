/* The home screen — where the student lands. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.home = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

/* ── what to do next ──────────────────────────────────────────
   Fourteen modes, four texts, five modules, a Vault, a mistake list and a weekly quest
   board. All of it is on the home screen and none of it answered the question a student
   actually opens a study app with, which is "what should I do right now".

   So: exactly one recommendation, from a fixed ladder, with the numbers it was derived
   from stated on the card. The numbers matter more than the recommendation — "your
   weakest module" is a horoscope; "22/51 correct on Module B, your weakest" is a reason,
   and a student who disagrees with it can see why and go elsewhere.

   The ladder is ordered by what decays. Due cards first because a spacing interval missed
   is a card relearned; mistakes next because they are already known to be wrong; only then
   the slower business of a weak module or an untouched text. */
  function nextUp() {
    const d = S.data;

    const due = S.dueCards().length;
    if (due) {
      /* An untouched Vault reports every card as due, which reads as a backlog the student
         has somehow already fallen behind on rather than as a thing they have not started.
         Say which it is, and say that a sitting is eight cards, because "220 due" on a
         phone at 9pm is a reason to close the app. */
      const started = Object.keys(S.data.srs || {}).length;
      return {
        icon: "🗝️", tag: "earns XP",
        title: started ? due + " quote" + (due === 1 ? "" : "s") + " due in the Vault"
                       : "Open the Vault — " + due + " quotes, none seen yet",
        why: (started ? "Spaced repetition only works if you meet the interval. "
                      : "Nothing is behind; you simply have not started. ") +
             "Cloze Crunch takes eight at a time, and it is the mode that pays — a typed " +
             "answer is markable, a self-rated one is not.",
        cta: started ? "Drill them" : "Start", go: "/game/cloze"
      };
    }

    const mistakes = (d.mistakes || []).length;
    if (mistakes >= 6) return {
      icon: "🩹", tag: "weighted ×3.5",
      title: "Rehabilitate " + mistakes + " mistakes",
      why: "These are questions you have already got wrong. The adaptive draw weights them, " +
           "but Mistake Rehab uses nothing else.",
      cta: "Rehab", go: "/game/rehab"
    };

    /* Ten answers before calling a module weak. Below that the figure is noise, and a
       recommendation built on noise is worse than none — the student follows it. */
    const mods = EN.Bank.statsByModule().filter(m => m.seen >= 10)
      .sort((a, b) => a.mastery - b.mastery);
    if (mods.length && mods[0].mastery < 55) {
      const m = mods[0];
      return {
        icon: "🎯", tag: m.mastery + "% mastery",
        title: "Drill " + m.code + " — " + m.short,
        why: m.correct + "/" + m.seen + " correct, your weakest module. Mastery is accuracy " +
             "weighted by how much you have seen, so it climbs with both.",
        cta: "Drill it", go: "/game/drill/" + m.id
      };
    }

    const cold = EN.Bank.statsByText().filter(t => t.seen < 6).sort((a, b) => a.seen - b.seen)[0];
    if (cold) return {
      icon: "📖", tag: cold.total + " questions",
      title: "Start on " + cold.title,
      why: cold.seen ? "Only " + cold.seen + " questions answered on it so far — the thinnest " +
                       "of your texts, and the exam does not care which one you liked."
                     : "You have not answered a single question on this one yet.",
      cta: "Drill it", go: "/game/drill/" + cold.id
    };

    const unplayed = (EN.Screens.play.MODES || [])
      .filter(m => d.level >= m.level && !(d.modesPlayed[m.id] || 0));
    if (unplayed.length) {
      const m = unplayed[0];
      return { icon: m.icon, tag: "never played",
               title: "Try " + m.name, why: m.desc, cta: "Play it", go: "/game/" + m.id };
    }

    const weakText = EN.Bank.statsByText().filter(t => t.seen >= 10)
      .sort((a, b) => a.mastery - b.mastery)[0];
    if (weakText && weakText.mastery < 60) return {
      icon: "📖", tag: weakText.mastery + "% mastery",
      title: "Drill " + weakText.title,
      why: weakText.correct + "/" + weakText.seen + " correct — your weakest text, and the " +
           "one most likely to be the text you get asked about. A drill draws fifteen " +
           "questions from it alone.",
      cta: "Drill it", go: "/game/drill/" + weakText.id
    };

    /* Nothing is behind, so the challenge is the honest answer rather than an invented
       weakness. It also happens to be the best-paying thing on the board. */
    const day = S.daily();
    const mode = (EN.Screens.play.MODES || []).find(m => m.id === day.spec.mode);
    if (!day.claimed) return {
      icon: "📝", tag: day.spec.xp + " XP · " + day.spec.reward + " ✒️",
      title: "Today's challenge: " + (mode ? mode.name : day.spec.mode),
      why: "Nothing is overdue and nothing is lagging, so take the best-paying thing on the " +
           "board. " + day.progress + " of " + day.spec.target + " done.",
      cta: "Go", go: "/game/" + day.spec.mode
    };

    return {
      icon: "✅", tag: "all clear",
      title: "Nothing is behind",
      why: "No quotes due, no mistake backlog, no module lagging, and today's challenge is " +
           "claimed. Pick whatever you feel like — or go and write something.",
      cta: "The Draft Desk", go: "/draft"
    };
  }

  function nextCard() {
    const n = nextUp();
    return U.el("div", { class: "card next-up", style: "margin-top:14px" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "next-ico", text: n.icon }),
        U.el("div", { style: "flex:1; min-width:0" }, [
          U.el("div", { class: "tiny muted", text: "Do this next" }),
          U.el("b", { style: "font-size:15px", text: n.title })
        ]),
        n.tag ? U.el("span", { class: "chip", text: n.tag }) : null
      ]),
      U.el("div", { class: "tiny muted", style: "margin-top:8px; line-height:1.6", text: n.why }),
      U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:12px",
                       text: n.cta + " →", on: { click: () => UI.go(n.go) } })
    ]);
  }

function screen(view) {
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

  /* This replaced a card that only appeared when quotes were due. That one was right
     about the most urgent case and silent about every other, so on the days it mattered
     least it said nothing at all. */
  view.appendChild(nextCard());

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
        U.el("div", { class: "bar", "aria-hidden": "true" }, [U.el("i", { style: "width:" + m.mastery + "%" })])
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
      e.claimed ? null : U.el("div", { class: "bar", "aria-hidden": "true", style: "margin-top:8px" },
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
}

  /* Exposed so the suite can drive the ladder from a save rather than by playing. */
  screen.nextUp = nextUp;
  return screen;
})();
