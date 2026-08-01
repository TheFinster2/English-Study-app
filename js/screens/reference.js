/* The reference screens: technique glossary, rubric verbs, band descriptors, module
   concepts, essay architecture, and a per-text quote sheet.
   Half the app works for any student regardless of texts, and this is where that half
   is readable rather than only drillable.

   Everything a tab renders is built by a named card function below, because the search
   at the top of the screen renders the SAME cards. A student who searches "zeugma"
   should get the glossary entry itself, not a link to somewhere it might be — the
   answer, in place, is the whole point of a reference. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.reference = (function () {
  const U = EN.U, UI = EN.UI;

  /* ── card builders, shared by the tabs and by search ──────── */

  function techCard(t) {
    const c = EN.DATA.techniqueCategories.find(x => x.id === t.cat);
    return U.el("div", { class: "tech-item" }, [
      U.el("div", { class: "tech-head" }, [
        U.el("span", { class: "tech-name", text: t.name }),
        U.el("span", { class: "chip", text: c ? c.icon + " " + c.name : t.cat })
      ]),
      U.el("div", { class: "tech-def", text: t.def }),
      U.el("div", { class: "tech-effect", text: t.effect }),
      (t.examples || []).length ? U.el("div", { class: "tech-ex", text: t.examples.join("  ·  ") }) : null,
      (t.alts || []).length ? U.el("div", { class: "tiny muted", style: "margin-top:6px",
        text: "Also accepted: " + t.alts.join(", ") }) : null
    ]);
  }

  function bandCard(b) {
    return U.el("div", { class: "band-item" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "band-n", text: String(b.band) }),
        U.el("span", { class: "band-cut", text: b.cut })
      ]),
      U.el("div", { class: "prose", style: "font-size:15px" }, [U.el("p", { text: b.mine })]),
      U.el("div", { class: "tiny muted", style: "margin-bottom:8px", text: "NESA: " + b.nesa }),
      U.el("div", { class: "row" }, b.tells.map(t => U.el("span", { class: "chip", text: t })))
    ]);
  }

  function descriptorCard(d) {
    return U.el("div", { class: "card" }, [
      U.el("div", { class: "tech-name", text: d.icon + " " + d.name }),
      U.el("div", { class: "tech-def", text: d.test }),
      U.el("div", { class: "verb-off", text: "Absent when: " + d.absent })
    ]);
  }

  function verbCard(rv) {
    return U.el("div", { class: "verb-item" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "verb-name", text: rv.verb }),
        (rv.alts || []).length ? U.el("span", { class: "chip", text: rv.alts.join(" / ") }) : null
      ]),
      U.el("div", { class: "tech-def", style: "margin-top:6px", text: rv.demands }),
      U.el("div", { class: "tech-effect", text: "What to do: " + rv.doing }),
      U.el("div", { class: "verb-off", text: "Off-task looks like: " + rv.offTask }),
      U.el("div", { class: "verb-tell", text: rv.tell })
    ]);
  }

  function conceptCard(m) {
    return U.el("div", { class: "card" }, [
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
    ]);
  }

  function roleCard(r) {
    return U.el("div", { class: "card" }, [
      U.el("div", { class: "tech-name", text: r.icon + " " + r.name }),
      U.el("div", { class: "tiny muted", text: r.where }),
      U.el("div", { class: "tech-def", style: "margin-top:8px", text: r.job }),
      U.el("div", { class: "tech-effect", text: "Test: " + r.test }),
      U.el("div", { class: "verb-off", text: "Fails as: " + r.fail })
    ]);
  }

  function quoteCard(q, opts) {
    const o = opts || {};
    return U.el("div", { class: "card" }, [
      o.where ? U.el("div", { class: "tiny muted", style: "margin-bottom:6px", text: q.textTitle }) : null,
      U.quoteBlock(q),
      U.el("div", { class: "row", style: "margin-top:10px" },
        (q.techniques || []).map(x => U.el("span", { class: "chip", text: EN.Bank.techniqueName(x) }))),
      q.effect ? U.el("div", { class: "tech-effect", style: "margin-top:8px", text: q.effect }) : null
    ]);
  }

  /* ── the search index ──────────────────────────────────────────
     Built once per load and thrown away with the page. Everything the reference can show
     goes in it — including every quote in every shipped text, active or not, because a
     student looking up a line does not care which module slot it currently occupies. */

  const norm = s => String(s || "").toLowerCase()
    .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();

  let INDEX = null;
  function index() {
    if (INDEX) return INDEX;
    const out = [];
    const add = (kind, order, title, sub, keys, body, node, poemKey) => out.push({
      kind, order, title, sub, node, poemKey,
      keyN: [title].concat(keys || []).map(norm).filter(Boolean),
      bodyN: norm([title].concat(keys || [], [sub, body]).join(" "))
    });

    EN.Bank.techniques().forEach(t => {
      const c = EN.DATA.techniqueCategories.find(x => x.id === t.cat);
      add("Techniques", 1, t.name, c ? c.name : t.cat,
          (t.alts || []).concat([t.id.replace(/-/g, " ")]),
          [t.def, t.effect, (t.examples || []).join(" ")].join(" "),
          () => techCard(t));
    });
    (EN.DATA.rubricVerbs || []).forEach(rv =>
      add("Rubric verbs", 2, rv.verb, "what the question is asking you to do", rv.alts,
          [rv.demands, rv.doing, rv.offTask, rv.tell].join(" "), () => verbCard(rv)));
    (EN.DATA.moduleConcepts || []).forEach(m =>
      add("Module concepts", 3, m.title, "module concept", m.keyTerms,
          [m.core, m.misread, m.goodMove, (m.questionShapes || []).join(" ")].join(" "),
          () => conceptCard(m)));
    /* Concepts carry no prose of their own — they are tags. What is worth saying about
       one is how much of the bank is tagged with it and where, so that is the card. */
    (EN.DATA.concepts || []).forEach(c => {
      const tagged = EN.Bank.allQuotes().filter(q => (q.concepts || []).includes(c.id));
      if (!tagged.length) return;
      const byText = {};
      tagged.forEach(q => (byText[q.textTitle] = (byText[q.textTitle] || 0) + 1));
      add("Module concepts", 3, c.name, tagged.length + " quotes tagged",
          [c.id.replace(/-/g, " ")], "",
          () => U.el("div", { class: "card" }, [
            U.el("div", { class: "tech-name", text: (c.icon ? c.icon + " " : "") + c.name }),
            U.el("div", { class: "tiny muted", style: "margin-top:4px",
              text: tagged.length + " quote" + (tagged.length === 1 ? "" : "s") + " in the bank carry this concept." }),
            U.el("div", { class: "row", style: "margin-top:8px" }, Object.keys(byText).sort()
              .map(k => U.el("span", { class: "chip", text: k + " · " + byText[k] })))
          ]));
    });
    (EN.DATA.bands || []).forEach(b =>
      add("Bands", 4, "Band " + b.band, b.cut, b.tells,
          [b.mine, b.nesa].join(" "), () => bandCard(b)));
    (EN.DATA.descriptors || []).forEach(d =>
      add("Bands", 4, d.name, "marking descriptor", null,
          [d.test, d.absent].join(" "), () => descriptorCard(d)));
    (EN.DATA.paragraphRoles || []).forEach(r =>
      add("Essay architecture", 5, r.name, r.where, null,
          [r.job, r.test, r.fail].join(" "), () => roleCard(r)));

    EN.Bank.allTexts().forEach(t => {
      add("Texts", 6, t.title, [t.composer, t.year, t.form].filter(Boolean).join(" · "),
          [t.composer], t.blurb || "", () => textResult(t));
      /* Individual poems, because Donne is fifty-four of them and "The Sun Rising" is a
         thing a student looks up by name — the parent text is called "Selected Poems". */
      (t.poems || []).forEach(pm =>
        add("Poems", 6, pm.title, [pm.group, t.composer].filter(Boolean).join(" · "),
            [pm.opening, pm.group], pm.opening || "", () => poemCard(t, pm),
            t.id + ":" + pm.id));
      (t.characters || []).forEach(ch =>
        add("Characters", 7, ch.name, ch.role + " · " + t.title, null, ch.note,
            () => U.el("div", { class: "card" }, [
              U.el("div", { class: "tech-name", text: ch.name }),
              U.el("div", { class: "tiny muted", text: ch.role + " · " + t.title }),
              U.el("div", { class: "tech-def", style: "margin-top:6px", text: ch.note })
            ])));
    });

    /* Quotes last: they are the biggest group and the least likely to be what a one-word
       lookup wanted, but the most valuable when a student half-remembers a line. */
    EN.Bank.allQuotes().forEach(q =>
      add("Quotes", 8, q.text, [q.textTitle, q.speaker, q.locus].filter(Boolean).join(" · "),
          (q.techniques || []).map(EN.Bank.techniqueName)
            .concat((q.concepts || []).map(id => (EN.DATA.concepts.find(c => c.id === id) || {}).name || id))
            .concat([q.textTitle, q.speaker, q.locus].filter(Boolean)),
          q.effect || "",
          () => quoteCard(q, { where: true }),
          q.poem ? q.textId + ":" + q.poem : null));

    INDEX = out;
    return out;
  }

  /* A poem is a heading over a set of quotes, plus whether the student has it switched on
     — which is the thing they most often want to know when they look one up. */
  function poemCard(t, pm) {
    const qs = (t.quotes || []).filter(q => q.poem === pm.id);
    const on = EN.State.poemEnabled(t.id, pm.id);
    const card = U.el("div", { class: "card" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { class: "tech-name", text: pm.title }),
        U.el("div", { class: "spacer" }),
        U.el("span", { class: "chip" + (on ? " on" : ""), text: on ? "in play" : "switched off" })
      ]),
      U.el("div", { class: "tiny muted", style: "margin-top:4px",
        text: [pm.group, t.title, qs.length + " quote" + (qs.length === 1 ? "" : "s")]
          .filter(Boolean).join(" · ") }),
      pm.opening ? U.el("div", { class: "lc-ex", style: "margin-top:8px", text: pm.opening }) : null
    ]);
    /* Every quote, not a sample: search drops a poem's quotes from the Quotes group
       because this card already shows them, so this card has to actually show them. */
    qs.forEach(raw => {
      const q = EN.Bank.quoteById(raw.id) || raw;
      card.appendChild(U.el("div", { style: "margin-top:10px" }, [U.quoteBlock(q)]));
    });
    if (!qs.length) {
      card.appendChild(U.el("div", { class: "tiny muted", style: "margin-top:8px",
        text: "No quotes tagged to this poem yet." }));
    }
    return card;
  }

  function textResult(t) {
    const card = U.el("button", { class: "game-card", type: "button" }, [
      U.el("div", { class: "game-name", text: t.title }),
      U.el("div", { class: "game-desc", text: t.blurb || "" }),
      U.el("div", { class: "game-foot" }, [
        U.el("span", { text: (t.composer || "") + " · " + (t.quotes || []).length + " quotes" }),
        U.el("span", { class: "chip", text: "quote sheet →" })
      ])
    ]);
    card.addEventListener("click", () => UI.go("/reference/texts/" + t.id));
    return card;
  }

  /* A title hit beats a synonym hit beats a body hit, and every word of the query has to
     land somewhere — "modal verb" must not match every entry containing "verb". */
  function score(e, tokens) {
    let total = 0;
    for (const q of tokens) {
      let best = 0;
      for (const k of e.keyN) {
        if (k === q) { best = Math.max(best, 100); break; }
        if (k.startsWith(q + " ") || k === q) best = Math.max(best, 70);
        else if (k.indexOf(q) === 0) best = Math.max(best, 55);
        else if (k.indexOf(" " + q) >= 0) best = Math.max(best, 40);
        else if (k.indexOf(q) >= 0) best = Math.max(best, 25);
      }
      /* Word prefix, not bare substring: "act" is inside "practice", and a body match is
         already the weakest signal without also being the loosest. */
      if (!best && (" " + e.bodyN).indexOf(" " + q) >= 0) best = 8;
      if (!best) return 0;
      total += best;
    }
    return total / tokens.length;
  }

  const PER_GROUP = 8;

  function search(q) {
    const tokens = norm(q).split(" ").filter(Boolean);
    if (!tokens.length) return null;
    const hits = [];
    for (const e of index()) {
      const s = score(e, tokens);
      if (s > 0) hits.push({ e, s });
    }
    hits.sort((a, b) => b.s - a.s || a.e.order - b.e.order || a.e.title.length - b.e.title.length);

    /* A matched poem already prints its own quotes, so listing them again under Quotes is
       the same three lines twice on a 390px screen. */
    const poemHits = new Set(hits.filter(h => h.e.kind === "Poems").map(h => h.e.poemKey));
    const kept = poemHits.size
      ? hits.filter(h => !(h.e.kind === "Quotes" && poemHits.has(h.e.poemKey)))
      : hits;

    const groups = new Map();
    for (const h of kept) {
      if (!groups.has(h.e.kind)) groups.set(h.e.kind, { kind: h.e.kind, order: h.e.order, best: 0, hits: [] });
      const g = groups.get(h.e.kind);
      g.hits.push(h);
      if (h.s > g.best) g.best = h.s;
    }
    /* Groups lead with the one holding the best hit, not with a fixed running order.
       Searching "power" put Techniques first purely because techniques are listed first,
       and buried the concept named Power — the only exact match on the page. */
    return { total: kept.length,
             groups: Array.from(groups.values())
               .sort((a, b) => b.best - a.best || a.order - b.order) };
  }

  /* ── the screen ───────────────────────────────────────────── */

  function screen(view, argv) {
    const args = argv || [];
    const tab = args[0] || "techniques";

    view.appendChild(U.el("h1", { text: "📚 Reference" }));

    /* The search box lives above the tabs, not inside one, because the thing a student is
       looking up is exactly the thing they do not know the category of. */
    const box = U.el("input", { class: "tin ref-search", type: "search", autocomplete: "off",
      "aria-label": "Search the reference",
      placeholder: "Search techniques, verbs, quotes, bands…" });
    view.appendChild(box);

    const nav = U.el("div", { class: "ref-nav" });
    [["techniques", "🖼️ Techniques"], ["rubric", "⚖️ Bands & verbs"],
     ["concepts", "🎯 Modules"], ["essay", "🧱 Essay architecture"],
     ["texts", "📖 Quote sheets"]].forEach(([id, label]) => {
      const b = U.el("button", { class: "chip chip-btn" + (tab === id ? " on" : ""), type: "button", text: label });
      b.addEventListener("click", () => UI.go("/reference/" + id));
      nav.appendChild(b);
    });
    view.appendChild(nav);

    /* Two panes, one shown at a time. Re-rendering only the results pane means the input
       keeps focus and the caret keeps its place while the student types. */
    const results = U.el("div", { class: "ref-results", hidden: "hidden" });
    const pane = U.el("div");
    view.appendChild(results);
    view.appendChild(pane);

    if (tab === "techniques") techniques(pane, args[1]);
    else if (tab === "rubric") rubric(pane);
    else if (tab === "concepts") concepts(pane);
    else if (tab === "essay") essay(pane);
    else texts(pane, args[1]);

    let debounce = null;
    box.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(run, 110);
    });
    box.addEventListener("keydown", e => { if (e.key === "Escape") { box.value = ""; run(); } });
    UI.onLeave(() => clearTimeout(debounce));

    function run() {
      const found = search(box.value);
      if (!found) {
        results.hidden = true;
        results.innerHTML = "";
        pane.hidden = false;
        nav.hidden = false;
        return;
      }
      pane.hidden = true;
      nav.hidden = true;
      results.hidden = false;
      results.innerHTML = "";
      /* The count is the live region: a search box whose results simply appear tells a
         screen reader nothing, and "did that find anything" is the only question. */
      if (!found.total) {
        results.appendChild(UI.announce(U.el("div", { class: "empty" }, [
          U.el("div", { class: "empty-ico", text: "🔎" }),
          U.el("p", { text: "Nothing in the reference matches “" + box.value.trim() + "”." })
        ])));
        return;
      }
      results.appendChild(UI.announce(U.el("p", { class: "tiny muted",
        text: found.total + " match" + (found.total === 1 ? "" : "es") + " — Esc to clear." })));
      found.groups.forEach(g => {
        const shown = g.hits.slice(0, PER_GROUP);
        results.appendChild(U.el("div", { class: "row", style: "margin:16px 0 8px" }, [
          U.el("h2", { style: "margin:0", text: g.kind }),
          U.el("div", { class: "spacer" }),
          U.el("span", { class: "chip", text: String(g.hits.length) })
        ]));
        const grid = U.el("div", { class: "grid" });
        shown.forEach(h => grid.appendChild(h.e.node()));
        results.appendChild(grid);
        if (g.hits.length > shown.length) {
          results.appendChild(U.el("p", { class: "tiny muted",
            text: "+ " + (g.hits.length - shown.length) + " more in " + g.kind.toLowerCase() +
                  " — narrow the search to see them." }));
        }
      });
    }
  }

  /* ── the tabs ─────────────────────────────────────────────── */

  function techniques(v, cat) {
    v.appendChild(U.el("p", { class: "muted",
      text: EN.Bank.techniques().length + " techniques, each with what it DOES to a reader — which is the half students leave out and the half marks are awarded for." }));
    const cats = U.el("div", { class: "ref-nav" });
    cats.appendChild(catChip("All", !cat, "/reference/techniques"));
    EN.DATA.techniqueCategories.forEach(c =>
      cats.appendChild(catChip(c.icon + " " + c.name, cat === c.id, "/reference/techniques/" + c.id)));
    v.appendChild(cats);

    const grid = U.el("div", { class: "grid" });
    EN.Bank.techniques().filter(t => !cat || t.cat === cat).forEach(t => grid.appendChild(techCard(t)));
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
    v.appendChild(U.el("div", { class: "grid" }, EN.DATA.bands.map(bandCard)));

    v.appendChild(U.el("h2", { text: "The five descriptors" }));
    v.appendChild(U.el("p", { class: "muted",
      text: "What the Marking Desk ticks against. Each is present or absent — which is what makes the ticks exactly markable while the band stays a judgement with a tolerance." }));
    v.appendChild(U.el("div", { class: "grid g2" }, EN.DATA.descriptors.map(descriptorCard)));

    v.appendChild(U.el("h2", { text: "Rubric verbs" }));
    v.appendChild(U.el("p", { class: "muted",
      text: "The commonest way strong students lose marks: answering a different question from the one asked, very well." }));
    v.appendChild(U.el("div", { class: "grid" }, EN.DATA.rubricVerbs.map(verbCard)));
  }

  function concepts(v) {
    v.appendChild(U.el("p", { class: "muted",
      text: "What each module is actually asking about — and the misreading students arrive with, which is where most of the marks go missing." }));
    v.appendChild(U.el("div", { class: "grid" }, EN.DATA.moduleConcepts.map(conceptCard)));
  }

  function essay(v) {
    v.appendChild(U.el("p", { class: "muted",
      text: "Each role has a job, a test for whether it has done it, and the failure students actually produce." }));
    v.appendChild(U.el("div", { class: "grid g2" }, EN.DATA.paragraphRoles.map(roleCard)));

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
    v.appendChild(pairs);
  }

  function texts(v, id) {
    const active = EN.Bank.activeTexts();
    if (!id) {
      v.appendChild(U.el("p", { class: "muted", text: "A quote sheet per text, with locus, speaker, techniques and effect." }));
      const g = U.el("div", { class: "grid g2" });
      EN.Bank.allTexts().forEach(t => {
        const card = U.el("button", { class: "game-card", type: "button" }, [
          U.el("div", { class: "game-name", text: t.title }),
          U.el("div", { class: "game-desc", text: t.blurb || "" }),
          U.el("div", { class: "game-foot" }, [
            U.el("span", { text: (t.composer || "") + " · " + (t.quotes || []).length + " quotes" }),
            active.includes(t) ? U.el("span", { class: "chip on lock-tag", text: "yours" })
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

    v.appendChild(U.el("h2", { text: "Quote sheet" }));
    const qg = U.el("div", { class: "grid" });
    (t.quotes || []).forEach(raw => qg.appendChild(quoteCard(EN.Bank.quoteById(raw.id) || raw)));
    v.appendChild(qg);
  }

  /* Exposed so the poem picker and the tests can reach the same index. */
  screen.search = search;
  screen.dropIndex = () => { INDEX = null; };
  return screen;
})();
