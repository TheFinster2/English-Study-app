/* The Play screen: every mode, and the router's dispatch into them. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.play = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /* ⭐ marks the modes where English is genuinely better than the reference app's
     equivalent. They lead the list. */
  const MODES = [
    { id:"marking", name:"The Marking Desk", icon:"📝", colour:"var(--accent)", flagship:true, level:1,
      desc:"You are the marker. Read a paragraph, assign a band, tick the descriptors, then see the real judgement.",
      foot:"5 paragraphs · no clock" },
    { id:"thesis", name:"Thesis Forge", icon:"✍️", colour:"var(--good)", flagship:true, level:1,
      desc:"Type a thesis and watch five structural checks light up as you build it. Then it's marked against real exemplars.",
      foot:"5 prompts · live feedback" },
    { id:"technique", name:"Name That Technique", icon:"🔍", colour:"var(--info)", flagship:true, level:1,
      desc:"A quote with a highlighted phrase — which technique operates there? And the reverse.",
      foot:"12 questions · no clock" },
    { id:"cloze", name:"Cloze Crunch", icon:"🕳️", colour:"var(--warn)", flagship:true, level:1,
      desc:"Type the missing words back into a quote you're learning. Gaps get wider as the card gets more familiar.",
      foot:"8 quotes · from the Vault" },
    { id:"sayit", name:"Say It In One", icon:"💬", colour:"var(--good)", flagship:true, level:2,
      desc:"State a technique's effect in one sentence, in your own words. Marked by the embedding model.",
      foot:"5 prompts · needs http" },
    { id:"essay", name:"Essay Architect", icon:"🧱", colour:"var(--accent)", flagship:true, level:2,
      desc:"Assemble a paragraph or a whole essay skeleton from shuffled cards. Scored on efficiency.",
      foot:"3 puzzles · no clock" },
    { id:"rapid", name:"Rapid Fire", icon:"⚡", colour:"var(--warn)", level:1,
      desc:"Two minutes, endless questions, streak multiplier to ×3.",
      foot:"2 min · timed" },
    { id:"drill", name:"Module Drill", icon:"🎯", colour:"var(--info)", level:1,
      desc:"Fifteen adaptive questions from one module or one text. No clock.",
      foot:"15 questions · pick a module" },
    { id:"quotematch", name:"Quote Match", icon:"🃏", colour:"var(--accent)", level:2,
      desc:"Concentration. Quote to technique, quote to speaker, technique to effect, concept to quote.",
      foot:"6 pairs · net scored" },
    { id:"bandgrid", name:"Band Grid", icon:"⏱️", colour:"var(--bad)", level:3,
      desc:"Which band does each statement describe? Against the clock, net scored.",
      foot:"8 rows · timed" },
    { id:"rewrite", name:"Rewrite Rescue", icon:"🔧", colour:"var(--good)", level:4,
      desc:"A weak sentence — plot summary, floating quote, technique unanalysed. Rewrite it.",
      foot:"5 prompts · needs http" },
    { id:"deconstruct", name:"Question Deconstruction", icon:"🎯", colour:"var(--info)", level:3,
      desc:"Generated essay questions. Which verb governs it, which concept, what would be off-task?",
      foot:"8 questions · generated" },
    { id:"survival", name:"Survival", icon:"💀", colour:"var(--bad)", level:5,
      desc:"One life, tightening clock, escalating difficulty. See how far you get.",
      foot:"1 life · endless" },
    { id:"rehab", name:"Mistake Rehab", icon:"🩹", colour:"var(--warn)", level:2,
      desc:"Only the questions you have previously got wrong.",
      foot:"your mistakes · no clock" }
  ];

  function screen(view) {
    view.appendChild(U.el("h1", { text: "Play" }));

    /* The daily challenge, and the streak, sit at the top because they are the reason to
       open the app rather than the reason to stay in it. */
    const d = S.daily();
    const spec = d.spec;
    const mode = MODES.find(m => m.id === spec.mode) ||
                 { name: spec.mode, icon: "🎲" };
    view.appendChild(U.el("div", { class: "card", style: "margin-bottom:14px" }, [
      U.el("div", { class: "daily" }, [
        U.el("div", { class: "daily-ico", text: d.claimed ? "✅" : mode.icon }),
        U.el("div", { class: "daily-body" }, [
          U.el("div", { class: "row", style: "gap:6px" }, [
            U.el("b", { text: "Today's challenge" }),
            U.el("span", { class: "chip", text: mode.name })
          ]),
          U.el("div", { class: "tiny muted", style: "margin:6px 0",
            text: d.claimed ? "Claimed. Back tomorrow."
                            : d.progress + " / " + spec.target + " — worth " + spec.xp + " XP and " + spec.reward + " ✒️" }),
          U.el("div", { class: "bar", "aria-hidden": "true" }, [U.el("i", { style: "width:" + U.pct(d.progress, spec.target) + "%" })])
        ]),
        d.progress >= spec.target && !d.claimed
          ? U.el("button", { class: "btn btn-primary btn-sm", text: "Claim",
              on: { click: () => { if (S.claimDaily()) { EN.Sound.daily(); EN.FX.confetti(90); UI.handleRoute(); } } } })
          : U.el("button", { class: "btn btn-ghost btn-sm", text: "Go",
              on: { click: () => UI.go("/game/" + spec.mode) } })
      ])
    ]));

    view.appendChild(U.el("h2", { text: "Modes" }));
    const grid = U.el("div", { class: "grid g2" });
    MODES.forEach(m => {
      const locked = S.data.level < m.level;
      const played = S.data.modesPlayed[m.id] || 0;
      const card = U.el("button", {
        class: "game-card" + (locked ? " locked" : "") + (m.flagship ? " flagship" : ""),
        type: "button", style: "--gc:" + m.colour
      }, [
        U.el("div", { class: "game-ico", text: m.icon }),
        U.el("div", { class: "game-name", text: m.name }),
        U.el("div", { class: "game-desc", text: m.desc }),
        U.el("div", { class: "game-foot" }, [
          U.el("span", { text: m.foot }),
          locked ? U.el("span", { class: "chip lock-tag", text: "🔒 Lv " + m.level })
                 : played ? U.el("span", { class: "chip lock-tag", text: "×" + played }) : null
        ])
      ]);
      if (!locked) card.addEventListener("click", () => UI.go("/game/" + m.id));
      else card.addEventListener("click", () => {
        EN.Sound.denied();
        UI.toast({ icon: "🔒", kind: "bad", text: "Unlocks at level " + m.level + "." });
      });
      grid.appendChild(card);
    });
    view.appendChild(grid);

    view.appendChild(U.el("h2", { text: "Bosses" }));
    const beaten = Object.keys(S.data.bossesBeaten).length;
    const bossCard = U.el("button", { class: "game-card flagship", type: "button", style: "--gc:var(--bad)" }, [
      U.el("div", { class: "game-ico", text: "⚔️" }),
      U.el("div", { class: "game-name", text: "Module Bosses" }),
      U.el("div", { class: "game-desc",
        text: "Five HP duels with a gimmick each: an editor who rewrites your answers, a pair that must both be right, a critic who hides the labels." }),
      U.el("div", { class: "game-foot" }, [
        U.el("span", { text: beaten + " / 5 beaten" }),
        EN.Games.boss.allBeaten() ? U.el("span", { class: "chip on lock-tag", text: "Final Paper open" }) : null
      ])
    ]);
    bossCard.addEventListener("click", () => UI.go("/boss"));
    view.appendChild(bossCard);

    view.appendChild(U.el("h2", { text: "Earns nothing" }));
    const noEarn = U.el("div", { class: "grid g2" }, [
      pill("📄", "Draft Desk", "Somewhere to write. Word count, a timer, export to file. No marks, no score, no one reading over your shoulder.", "/draft"),
      pill("🕹️", "The Arcade", "Three games rented with Marks. No XP and no Marks — a game that paid would be a better farm than studying.", "/arcade")
    ]);
    view.appendChild(noEarn);
  }

  function pill(icon, name, desc, href) {
    const c = U.el("button", { class: "game-card", type: "button", style: "--gc:var(--ink-faint)" }, [
      U.el("div", { class: "game-ico", text: icon }),
      U.el("div", { class: "game-name", text: name }),
      U.el("div", { class: "game-desc", text: desc }),
      U.el("div", { class: "game-foot" }, [U.el("span", { text: "no XP, no Marks" })])
    ]);
    c.addEventListener("click", () => UI.go(href));
    return c;
  }

  /* ── module / text pickers ────────────────────────────────── */
  function pickModule(view, title, onPick) {
    const shell = UI.gameShell(title, { backTo: "/play" });
    view.appendChild(shell.root);
    shell.body.appendChild(U.el("p", { class: "muted", text: "Pick a module, or a single text." }));
    const grid = U.el("div", { class: "grid g2" });
    EN.DATA.modules.forEach(m => {
      const st = S.mastery(m.id);
      const b = U.el("button", { class: "game-card", type: "button" }, [
        U.el("div", { class: "game-ico", text: m.icon }),
        U.el("div", { class: "game-name", text: m.code }),
        U.el("div", { class: "game-desc", text: m.name + " — " + m.concept }),
        U.el("div", { class: "game-foot" }, [U.el("span", { text: st + "% mastery" })])
      ]);
      b.addEventListener("click", () => onPick({ mods: [m.id] }));
      grid.appendChild(b);
    });
    shell.body.appendChild(grid);

    shell.body.appendChild(U.el("h2", { text: "Or one text" }));
    const tgrid = U.el("div", { class: "grid g3" });
    EN.Bank.activeTexts().forEach(t => {
      const b = U.el("button", { class: "game-card", type: "button" }, [
        U.el("div", { class: "game-name", text: t.title }),
        U.el("div", { class: "game-desc", text: t.composer + (t.year ? ", " + t.year : "") }),
        U.el("div", { class: "game-foot" }, [U.el("span", { text: S.textMastery(t.id) + "% mastery" })])
      ]);
      b.addEventListener("click", () => onPick({ texts: [t.id] }));
      tgrid.appendChild(b);
    });
    shell.body.appendChild(tgrid);

    shell.body.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:12px",
      text: "Everything, mixed", on: { click: () => onPick({}) } }));
  }

  /* ── dispatch ─────────────────────────────────────────────── */
  function dispatch(view, args) {
    const id = args[0];
    const G = EN.Games;

    switch (id) {
      case "rapid":
        return G.quiz.start(view, { modeId: "rapid", title: "⚡ Rapid Fire",
                                    totalTime: 120, count: 24, dailyMode: "rapid" });
      case "drill":
        if (args[1]) {
          const sel = args[1] === "all" ? {} :
                      EN.DATA.modules.some(m => m.id === args[1]) ? { mods: [args[1]] } : { texts: [args[1]] };
          return G.quiz.start(view, Object.assign({ modeId: "drill", title: "🎯 Module Drill", count: 15 }, sel));
        }
        return pickModule(view, "🎯 Module Drill", sel =>
          UI.go("/game/drill/" + (sel.mods ? sel.mods[0] : sel.texts ? sel.texts[0] : "all")));
      case "survival":
        return G.quiz.start(view, { modeId: "survival", title: "💀 Survival",
                                    count: 40, lives: 1, totalTime: 0 });
      case "rehab": {
        const qs = EN.Bank.mistakeQuestions();
        if (!qs.length) {
          view.appendChild(U.el("div", { class: "empty" }, [
            U.el("div", { class: "empty-ico", text: "🩹" }),
            U.el("p", { text: "Nothing to rehabilitate — you have not got anything wrong yet." }),
            U.el("button", { class: "btn btn-primary btn-sm", text: "Go and make some mistakes",
                             on: { click: () => UI.go("/play") } })
          ]));
          return;
        }
        return G.quiz.start(view, { modeId: "rehab", title: "🩹 Mistake Rehab",
                                    questions: qs.slice(0, 15), adaptive: false });
      }
      case "technique":
        return G.technique.start(view, {});
      case "cloze":
        return G.cloze.start(view, { count: 8 });
      case "marking":
        return G.marking.start(view, { count: 5 });
      case "essay":
        return G.essay.start(view, { count: 3 });
      case "quotematch":
        return G.quotematch.start(view, { pairs: 6 });
      case "bandgrid":
        return G.bandgrid.start(view, { rows: 8 });
      case "deconstruct":
        return G.deconstruct.start(view, { count: 8 });
      case "sayit":
        return G.layerc.start(view, { modeId: "sayit", title: "💬 Say It In One", mode: "sayit", count: 5 });
      case "thesis":
        return G.layerc.start(view, { modeId: "thesis", title: "✍️ Thesis Forge", mode: "thesis", count: 4 });
      case "rewrite":
        return G.layerc.start(view, { modeId: "rewrite", title: "🔧 Rewrite Rescue", mode: "rewrite", count: 4 });
      default:
        return screen(view);
    }
  }

  return { screen, dispatch, MODES };
})();
