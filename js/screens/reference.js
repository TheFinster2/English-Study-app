/* The reference screens: technique glossary, rubric verbs, band descriptors, module
   concepts, essay architecture, and a per-text quote sheet.
   Half the app works for any student regardless of texts, and this is where that half
   is readable rather than only drillable. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.reference = function (view, args) {
  const U = EN.U, UI = EN.UI;
  const tab = (args && args[0]) || "techniques";

  view.appendChild(U.el("h1", { text: "📚 Reference" }));
  const nav = U.el("div", { class: "ref-nav" });
  [["techniques", "🖼️ Techniques"], ["rubric", "⚖️ Bands & verbs"],
   ["concepts", "🎯 Modules"], ["essay", "🧱 Essay architecture"],
   ["texts", "📖 Quote sheets"]].forEach(([id, label]) => {
    const b = U.el("button", { class: "chip chip-btn" + (tab === id ? " on" : ""), type: "button", text: label });
    b.addEventListener("click", () => UI.go("/reference/" + id));
    nav.appendChild(b);
  });
  view.appendChild(nav);

  if (tab === "techniques") return techniques(view, args[1]);
  if (tab === "rubric") return rubric(view);
  if (tab === "concepts") return concepts(view);
  if (tab === "essay") return essay(view);
  return texts(view, args[1]);

  function techniques(v, cat) {
    v.appendChild(U.el("p", { class: "muted",
      text: EN.Bank.techniques().length + " techniques, each with what it DOES to a reader — which is the half students leave out and the half marks are awarded for." }));
    const cats = U.el("div", { class: "ref-nav" });
    cats.appendChild(catChip("All", !cat, "/reference/techniques"));
    EN.DATA.techniqueCategories.forEach(c =>
      cats.appendChild(catChip(c.icon + " " + c.name, cat === c.id, "/reference/techniques/" + c.id)));
    v.appendChild(cats);

    const list = EN.Bank.techniques().filter(t => !cat || t.cat === cat);
    const grid = U.el("div", { class: "grid" });
    list.forEach(t => {
      const c = EN.DATA.techniqueCategories.find(x => x.id === t.cat);
      grid.appendChild(U.el("div", { class: "tech-item" }, [
        U.el("div", { class: "tech-head" }, [
          U.el("span", { class: "tech-name", text: t.name }),
          U.el("span", { class: "chip", text: c ? c.icon + " " + c.name : t.cat })
        ]),
        U.el("div", { class: "tech-def", text: t.def }),
        U.el("div", { class: "tech-effect", text: t.effect }),
        (t.examples || []).length ? U.el("div", { class: "tech-ex", text: t.examples.join("  ·  ") }) : null,
        (t.alts || []).length ? U.el("div", { class: "tiny muted", style: "margin-top:6px",
          text: "Also accepted: " + t.alts.join(", ") }) : null
      ]));
    });
    v.appendChild(grid);
  }

  function catChip(label, on, href) {
    const b = U.el("button", { class: "chip chip-btn" + (on ? " on" : ""), type: "button", text: label });
    b.addEventListener("click", () => UI.go(href));
    return b;
  }

  function rubric(v) {
    v.appendChild(U.el("h2", { text: "Band descriptors" }));
    v.appendChild(U.el("p", { class: "muted",
      text: "Paraphrased in plain language, with the official emphasis noted. A teaching tool, not a substitute for the marking guidelines your teacher works from." }));
    const g = U.el("div", { class: "grid" });
    EN.DATA.bands.forEach(b => g.appendChild(U.el("div", { class: "band-item" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "band-n", text: String(b.band) }),
        U.el("span", { class: "band-cut", text: b.cut })
      ]),
      U.el("div", { class: "prose", style: "font-size:15px" }, [U.el("p", { text: b.mine })]),
      U.el("div", { class: "tiny muted", style: "margin-bottom:8px", text: "NESA: " + b.nesa }),
      U.el("div", { class: "row" }, b.tells.map(t => U.el("span", { class: "chip", text: t })))
    ])));
    v.appendChild(g);

    v.appendChild(U.el("h2", { text: "The five descriptors" }));
    v.appendChild(U.el("p", { class: "muted",
      text: "What the Marking Desk ticks against. Each is present or absent — which is what makes the ticks exactly markable while the band stays a judgement with a tolerance." }));
    const dg = U.el("div", { class: "grid g2" });
    EN.DATA.descriptors.forEach(d => dg.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "tech-name", text: d.icon + " " + d.name }),
      U.el("div", { class: "tech-def", text: d.test }),
      U.el("div", { class: "verb-off", text: "Absent when: " + d.absent })
    ])));
    v.appendChild(dg);

    v.appendChild(U.el("h2", { text: "Rubric verbs" }));
    v.appendChild(U.el("p", { class: "muted",
      text: "The commonest way strong students lose marks: answering a different question from the one asked, very well." }));
    const vg = U.el("div", { class: "grid" });
    EN.DATA.rubricVerbs.forEach(rv => vg.appendChild(U.el("div", { class: "verb-item" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "verb-name", text: rv.verb }),
        (rv.alts || []).length ? U.el("span", { class: "chip", text: rv.alts.join(" / ") }) : null
      ]),
      U.el("div", { class: "tech-def", style: "margin-top:6px", text: rv.demands }),
      U.el("div", { class: "tech-effect", text: "What to do: " + rv.doing }),
      U.el("div", { class: "verb-off", text: "Off-task looks like: " + rv.offTask }),
      U.el("div", { class: "verb-tell", text: rv.tell })
    ])));
    v.appendChild(vg);
  }

  function concepts(v) {
    v.appendChild(U.el("p", { class: "muted",
      text: "What each module is actually asking about — and the misreading students arrive with, which is where most of the marks go missing." }));
    const g = U.el("div", { class: "grid" });
    EN.DATA.moduleConcepts.forEach(m => g.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { style: "font-size:22px", text: m.icon }),
        U.el("span", { class: "tech-name", text: m.title })
      ]),
      U.el("div", { class: "tech-def", style: "margin-top:8px", text: m.core }),
      U.el("div", { class: "row", style: "margin:8px 0" },
        m.keyTerms.map(t => U.el("span", { class: "chip", text: t }))),
      U.el("div", { class: "verb-off", text: "⚠ " + m.misread }),
      U.el("div", { class: "tech-effect", style: "margin-top:8px", text: "Good move: " + m.goodMove }),
      U.el("details", { style: "margin-top:10px" }, [
        U.el("summary", { class: "tiny", style: "cursor:pointer", text: "Question shapes" }),
        U.el("div", { class: "grid", style: "margin-top:8px" },
          m.questionShapes.map(q => U.el("div", { class: "tiny muted", text: "· " + q })))
      ])
    ])));
    v.appendChild(g);
  }

  function essay(v) {
    v.appendChild(U.el("p", { class: "muted",
      text: "Each role has a job, a test for whether it has done it, and the failure students actually produce." }));
    const g = U.el("div", { class: "grid g2" });
    EN.DATA.paragraphRoles.forEach(r => g.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "tech-name", text: r.icon + " " + r.name }),
      U.el("div", { class: "tiny muted", text: r.where }),
      U.el("div", { class: "tech-def", style: "margin-top:8px", text: r.job }),
      U.el("div", { class: "tech-effect", text: "Test: " + r.test }),
      U.el("div", { class: "verb-off", text: "Fails as: " + r.fail })
    ])));
    v.appendChild(g);

    v.appendChild(U.el("h2", { text: "Topic sentence pairs" }));
    v.appendChild(U.el("p", { class: "muted",
      text: "One of each pair makes a claim; the other announces a subject. The test is whether a competent reader could disagree with it." }));
    const pairs = U.el("div", { class: "grid" });
    EN.Bank.topicPairs().slice(0, 12).forEach(p => {
      const better = p.better === 0 ? p.a : p.b;
      const worse = p.better === 0 ? p.b : p.a;
      pairs.appendChild(U.el("div", { class: "card" }, [
        U.el("div", { class: "lc-ex", style: "border-left:3px solid var(--good)", text: better }),
        U.el("div", { class: "lc-ex", style: "border-left:3px solid var(--bad); margin-top:6px", text: worse }),
        U.el("div", { class: "tiny muted", style: "margin-top:8px", text: p.why })
      ]));
    });
    view.appendChild(pairs);
  }

  function texts(v, id) {
    const list = EN.Bank.activeTexts();
    if (!id) {
      v.appendChild(U.el("p", { class: "muted", text: "A quote sheet per text, with locus, speaker, techniques and effect." }));
      const g = U.el("div", { class: "grid g2" });
      EN.Bank.allTexts().forEach(t => {
        const active = list.includes(t);
        const card = U.el("button", { class: "game-card", type: "button" }, [
          U.el("div", { class: "game-name", text: t.title }),
          U.el("div", { class: "game-desc", text: t.blurb || "" }),
          U.el("div", { class: "game-foot" }, [
            U.el("span", { text: (t.composer || "") + " · " + (t.quotes || []).length + " quotes" }),
            active ? U.el("span", { class: "chip on lock-tag", text: "yours" })
                   : U.el("span", { class: "chip lock-tag", text: "shipped" })
          ])
        ]);
        card.addEventListener("click", () => UI.go("/reference/texts/" + t.id));
        g.appendChild(card);
      });
      v.appendChild(g);
      return;
    }

    const t = EN.Bank.text(id);
    if (!t) return UI.go("/reference/texts");
    v.appendChild(U.el("h2", { text: t.title }));
    v.appendChild(U.el("p", { class: "muted",
      text: (t.composer || "") + (t.year ? ", " + t.year : "") + " · " + (t.form || "") }));
    if (t.blurb) v.appendChild(U.el("div", { class: "reader" }, [U.el("div", { class: "prose" }, [U.el("p", { text: t.blurb })])]));

    if ((t.extracts || []).length) {
      v.appendChild(U.el("h2", { text: "Extracts" }));
      const g = U.el("div", { class: "grid" });
      t.extracts.forEach(x => g.appendChild(U.el("div", { class: "card" }, [
        U.el("div", { class: "row" }, [U.el("b", { text: x.title }), U.el("span", { class: "chip", text: "from l. " + x.from })]),
        x.note ? U.el("div", { class: "tiny muted", style: "margin:6px 0", text: x.note }) : null,
        U.verse(x.lines, { from: x.from })
      ])));
      v.appendChild(g);
    }

    if ((t.context || []).length) {
      v.appendChild(U.el("h2", { text: "Context" }));
      const g = U.el("div", { class: "grid" });
      t.context.forEach(c => g.appendChild(U.el("div", { class: "card" }, [
        U.el("div", { class: "tech-def", text: c.fact }),
        U.el("div", { class: "tech-effect", text: c.why })
      ])));
      v.appendChild(g);
    }

    if ((t.structure || []).length) {
      v.appendChild(U.el("h2", { text: "Form and structure" }));
      const g = U.el("div", { class: "grid" });
      t.structure.forEach(s => g.appendChild(U.el("div", { class: "card" }, [
        U.el("div", { class: "tech-name", text: s.feature }),
        U.el("div", { class: "tech-def", text: s.detail }),
        U.el("div", { class: "tech-effect", text: s.why })
      ])));
      v.appendChild(g);
    }

    if ((t.resonances || []).length) {
      v.appendChild(U.el("h2", { text: "Resonances and dissonances" }));
      v.appendChild(U.el("p", { class: "muted",
        text: "Module A is examined on the relationship, not on two texts in sequence. This is that relationship, as content in its own right." }));
      const g = U.el("div", { class: "grid" });
      t.resonances.forEach(r => g.appendChild(U.el("div", { class: "card" }, [
        U.el("div", { class: "tech-name", text: r.axis }),
        U.el("div", { class: "lc-ex", style: "margin-top:8px", text: "Donne: " + r.donne }),
        U.el("div", { class: "lc-ex", style: "margin-top:6px", text: "W;t: " + r.wit }),
        U.el("div", { class: "tech-effect", style: "margin-top:8px", text: r.reading })
      ])));
      v.appendChild(g);
    }

    if ((t.characters || []).length) {
      v.appendChild(U.el("h2", { text: "Characters" }));
      const g = U.el("div", { class: "grid g2" });
      t.characters.forEach(ch => g.appendChild(U.el("div", { class: "card" }, [
        U.el("div", { class: "tech-name", text: ch.name }),
        U.el("div", { class: "tiny muted", text: ch.role }),
        U.el("div", { class: "tech-def", style: "margin-top:6px", text: ch.note })
      ])));
      v.appendChild(g);
    }

    v.appendChild(U.el("h2", { text: "Quote sheet", }));
    const qg = U.el("div", { class: "grid" });
    (t.quotes || []).forEach(raw => {
      const q = EN.Bank.quoteById(raw.id) || raw;
      qg.appendChild(U.el("div", { class: "card" }, [
        U.quoteBlock(q),
        U.el("div", { class: "row", style: "margin-top:10px" },
          (q.techniques || []).map(x => U.el("span", { class: "chip", text: EN.Bank.techniqueName(x) }))),
        q.effect ? U.el("div", { class: "tech-effect", style: "margin-top:8px", text: q.effect }) : null
      ]));
    });
    v.appendChild(qg);
  }
};
