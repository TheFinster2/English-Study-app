/* THE QUOTE VAULT — promoted to a top-level nav slot, because for HSC English quote
   recall is the highest-leverage thing in the whole app.
   ============================================================================
   Two modes, and only one of them pays:
     Cloze Crunch  — typed, marked by Layer B, pays once per card per day when due
     Browse        — self-rated, pays NOTHING, because "did you remember it? yes" is
                     unmarkable and an infinite loop (§9.8)
   The browse mode still advances the Leitner box, so it is useful; it just cannot be
   converted into XP. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.vault = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;
  let filter = { text: null, concept: null, dueOnly: false };

  function screen(view, args) {
    if (args && args[0] === "card") return card(view, args[1]);

    view.appendChild(U.el("h1", { text: "🗝️ The Quote Vault" }));
    const due = S.dueCards();
    view.appendChild(U.el("p", { class: "muted",
      text: "Five-box spaced repetition over " + EN.Bank.quotes().length + " quotes from your texts. " +
            due.length + " due today." }));

    view.appendChild(U.el("div", { class: "grid g2", style: "margin-bottom:14px" }, [
      U.el("button", { class: "game-card flagship", type: "button", style: "--gc:var(--warn)" }, [
        U.el("div", { class: "game-ico", text: "🕳️" }),
        U.el("div", { class: "game-name", text: "Cloze Crunch" }),
        U.el("div", { class: "game-desc", text: "Type the missing words back in. This is the mode that pays — once per card per day, and only when it is due." }),
        U.el("div", { class: "game-foot" }, [U.el("span", { text: due.length + " due · earns XP" })])
      ]),
      U.el("button", { class: "game-card", type: "button", style: "--gc:var(--ink-faint)" }, [
        U.el("div", { class: "game-ico", text: "👀" }),
        U.el("div", { class: "game-name", text: "Browse and self-rate" }),
        U.el("div", { class: "game-desc", text: "Read, flip, rate your recall. Moves cards in the Vault and pays nothing — a self-rated answer is not markable." }),
        U.el("div", { class: "game-foot" }, [U.el("span", { text: "no XP" })])
      ])
    ]));
    view.lastChild.children[0].addEventListener("click", () => UI.go("/game/cloze"));
    view.lastChild.children[1].addEventListener("click", () => browse(view));

    /* ── the ones that keep beating you ──────────────────────────
       A Leitner box resets to 1 on every miss, so a card you keep failing comes back
       tomorrow and the day after and forever, indistinguishable in the list from the forty
       that are working. `lapses` was already counted and nothing read it. */
    const stuck = S.leeches();
    if (stuck.length) {
      view.appendChild(U.el("div", { class: "card notice-bad", style: "margin-bottom:14px" }, [
        U.el("div", { class: "row" }, [
          U.el("span", { style: "font-size:22px", text: "🩹" }),
          U.el("div", { style: "flex:1; min-width:0" }, [
            U.el("b", { text: stuck.length + " quote" + (stuck.length === 1 ? "" : "s") +
                              " keep beating you" }),
            U.el("div", { class: "tiny muted", style: "margin-top:4px; line-height:1.6",
              text: "Missed " + S.LEECH_LAPSES + " times or more. Re-reading one is worth " +
                    "more than another attempt at recalling it, so Cloze Crunch shows these " +
                    "in full first and asks for fewer words." })
          ])
        ]),
        U.el("div", { class: "grid", style: "margin-top:10px" },
          stuck.slice(0, 3).map(x => U.el("div", { class: "lc-ex" }, [
            U.el("div", { style: "font-style:italic", text: U.cite(x.q).work + " — " +
              (x.q.text.length > 70 ? x.q.text.slice(0, 67) + "…" : x.q.text) }),
            U.el("div", { class: "tiny muted", style: "margin-top:4px",
              text: "missed ×" + x.c.lapses })
          ]))),
        U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:12px",
          text: "🩹 Relearn " + (stuck.length === 1 ? "it" : "them") + " →",
          on: { click: () => {
            view.innerHTML = "";
            EN.Games.cloze.start(view, { count: Math.min(8, stuck.length),
                                         quotes: stuck.map(x => x.q) });
          } } })
      ]));
    }

    /* Filters. Text and concept, plus a due-only toggle. */
    view.appendChild(U.el("h2", { text: "Browse the Vault" }));

    /* Three hundred quotes behind three chips and a 200-row cap meant the only way to
       reach a particular line was to remember roughly where it sat in the list. The box
       searches the line itself, its speaker, its locus, its techniques and its concepts —
       "compass" and "conceit" and "Act 2" are all things a student half-remembers. */
    const box = U.el("input", { class: "tin vault-search", type: "search", autocomplete: "off",
      "aria-label": "Search your quotes", placeholder: "Search your quotes…" });
    view.appendChild(box);

    const filters = U.el("div", { class: "vault-filters", style: "margin-bottom:10px" });
    filters.appendChild(chipBtn("All texts", !filter.text, () => { filter.text = null; UI.handleRoute(); }));
    EN.Bank.activeTexts().forEach(t =>
      filters.appendChild(chipBtn(t.title, filter.text === t.id, () => { filter.text = t.id; UI.handleRoute(); })));
    filters.appendChild(chipBtn(filter.dueOnly ? "✓ due only" : "due only", filter.dueOnly,
      () => { filter.dueOnly = !filter.dueOnly; UI.handleRoute(); }));
    view.appendChild(filters);

    /* The concept row was declared in `filter` and never rendered, so the field existed
       and did nothing. Only concepts actually present in the student's pool appear, most
       common first — a filter that returns nothing is worse than an absent one. */
    const base = EN.Bank.filterQuotes({ texts: filter.text ? [filter.text] : null });
    const counts = {};
    base.forEach(q => (q.concepts || []).forEach(c => (counts[c] = (counts[c] || 0) + 1)));
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 10);
    if (filter.concept && !counts[filter.concept]) filter.concept = null;
    if (top.length) {
      const crow = U.el("div", { class: "vault-filters", style: "margin-bottom:10px" });
      crow.appendChild(chipBtn("Any concept", !filter.concept,
        () => { filter.concept = null; UI.handleRoute(); }));
      top.forEach(id => {
        const c = EN.DATA.concepts.find(x => x.id === id);
        crow.appendChild(chipBtn((c ? c.icon + " " + c.name : id) + " " + counts[id],
          filter.concept === id, () => { filter.concept = id; UI.handleRoute(); }));
      });
      view.appendChild(crow);
    }

    let list = base;
    if (filter.concept) list = list.filter(q => (q.concepts || []).includes(filter.concept));
    if (filter.dueOnly) {
      const dueIds = new Set(due.map(q => q.id));
      list = list.filter(q => dueIds.has(q.id));
    }

    const wrap = U.el("div", { class: "vault-list" });
    const foot = U.el("p", { class: "tiny muted" });
    view.appendChild(wrap);
    view.appendChild(foot);

    /* Only the list is repainted as the student types, so the caret stays where it is and
       the page does not jump back to the top on every keystroke. */
    let debounce = null;
    box.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(paint, 110); });
    box.addEventListener("keydown", e => { if (e.key === "Escape") { box.value = ""; paint(); } });
    UI.onLeave(() => clearTimeout(debounce));
    paint();

    function paint() {
      const shown = matching(list, box.value);
      wrap.innerHTML = "";
      foot.textContent = "";
      shown.slice(0, 200).forEach(q => wrap.appendChild(rowFor(q)));
      if (!shown.length) {
        wrap.appendChild(U.el("div", { class: "empty" }, [
          U.el("div", { class: "empty-ico", text: "🗝️" }),
          U.el("p", { text: box.value.trim() ? "No quote of yours matches “" + box.value.trim() + "”."
                          : filter.dueOnly ? "Nothing due with that filter."
                                           : "No quotes match that filter." })
        ]));
      } else if (shown.length > 200) {
        foot.textContent = "Showing the first 200 of " + shown.length + ". Narrow it with a filter or the search box.";
      } else if (box.value.trim()) {
        foot.textContent = shown.length + " of " + list.length + " — Esc to clear.";
      }
    }

    function rowFor(q) {
      const st = S.data.srs[q.id];
      const bx = st ? st.box : 0;
      const isDue = !st || U.daysBetween(st.due, U.dayKey()) >= 0;
      const row = U.el("button", { class: "vault-row", type: "button" }, [
        U.el("span", { class: "vault-box" + (isDue ? " vault-due" : "") +
                              (S.isLeech(q.id) ? " vault-leech" : ""),
                       data: { box: String(bx) },
                       title: S.isLeech(q.id) ? "Missed " + st.lapses + " times" : "",
                       text: S.isLeech(q.id) ? "🩹" : (bx ? String(bx) : "·") }),
        U.el("span", { class: "vault-row-q", html: U.highlight(q.text, q.span) }),
        /* The work as well as the locus: a row reading only "Part 2, Ch. 7" does not say
           which book, and the Vault mixes every text the student studies. */
        U.el("span", { class: "tiny muted vault-locus", title: U.citeLine(q) }, [
          U.el("b", { text: U.cite(q).work }),
          U.el("span", { text: q.locus || "" })
        ])
      ]);
      row.addEventListener("click", () => UI.go("/vault/card/" + q.id));
      return row;
    }
  }

  /* ── searching the pool ────────────────────────────────────
     Deliberately plain substring matching over a normalised haystack, not the fuzzy
     marker: a student searching their own quotes wants the ones containing the word they
     typed, and a near-miss here is noise rather than generosity. */
  const norm = s => String(s || "").toLowerCase()
    .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();

  const HAY = new Map();
  function hay(q) {
    if (HAY.has(q.id)) return HAY.get(q.id);
    /* Padded, and matched as a word PREFIX below. Bare substring matching found "act"
       inside "practice", so a search for "act 2" returned a third of the Vault. */
    const s = " " + norm([q.text, q.speaker, q.locus, q.textTitle,
                    (q.techniques || []).map(EN.Bank.techniqueName).join(" "),
                    (q.concepts || []).map(id =>
                      (EN.DATA.concepts.find(c => c.id === id) || {}).name || id).join(" "),
                    q.effect].join(" ")) + " ";
    HAY.set(q.id, s);
    return s;
  }

  function matching(list, query) {
    const tokens = norm(query).split(" ").filter(Boolean);
    if (!tokens.length) return list;
    return list.filter(q => {
      const h = hay(q);
      return tokens.every(tk => h.indexOf(" " + tk) >= 0);
    });
  }

  function chipBtn(label, on, fn) {
    const b = U.el("button", { class: "chip chip-btn" + (on ? " on" : ""), type: "button", text: label });
    b.addEventListener("click", fn);
    return b;
  }

  /* A single quote, in full, with everything the app knows about it. */
  function card(view, id) {
    const q = EN.Bank.quoteById(id);
    if (!q) return UI.go("/vault");
    const shell = UI.gameShell("🗝️ " + q.textTitle, { backTo: "/vault" });
    view.appendChild(shell.root);
    const st = S.cardState(q.id);

    shell.body.appendChild(U.el("div", { class: "vcard" }, [
      U.el("div", { class: "vcard-head" }, [
        U.el("span", { class: "chip", text: q.locus || "" }),
        q.speaker ? U.el("span", { class: "chip", text: q.speaker }) : null,
        U.el("span", { class: "chip", text: "Box " + st.box }),
        U.el("span", { class: "chip", text: "due " + st.due })
      ]),
      U.quoteBlock(q),
      q.effect ? U.el("div", { class: "vcard-effect", text: q.effect }) : null,
      U.el("div", { class: "row", style: "margin-top:14px" },
        (q.techniques || []).map(t => U.el("span", { class: "chip", text: EN.Bank.techniqueName(t) }))),
      U.el("div", { class: "row", style: "margin-top:6px" },
        (q.concepts || []).map(cn => {
          const c = EN.DATA.concepts.find(x => x.id === cn);
          return U.el("span", { class: "chip", text: (c ? c.icon + " " + c.name : cn) });
        })),
      U.el("div", { class: "leitner", style: "margin-top:16px" },
        [1, 2, 3, 4, 5].map(n => U.el("div", { class: "lbox" + (n === st.box ? " on" : ""), text: String(n) })))
    ]));

    /* A quote is only useful in an essay with its citation attached, and retyping a locus
       from a phone screen is how a wrong line reference gets into a draft. */
    shell.body.appendChild(U.el("div", { class: "row", style: "margin-bottom:10px" }, [
      U.el("button", { class: "btn btn-ghost btn-sm", text: "📋 Copy with citation",
        on: { click: () => UI.copy('"' + q.text + '" (' + U.citeLine(q) + ')',
                                   "Quote and citation copied.") } })
    ]));

    shell.body.appendChild(U.el("div", { class: "row" }, [
      U.el("button", { class: "btn btn-primary", text: "🕳️ Drill this quote",
        on: { click: () => { view.innerHTML = ""; EN.Games.cloze.start(view, { count: 1, quotes: [q] }); } } }),
      U.el("div", { class: "spacer" }),
      U.el("button", { class: "btn btn-ghost btn-sm", text: "← Vault", on: { click: () => UI.go("/vault") } })
    ]));
  }

  /* Self-rated browsing. Advances the Leitner box, awards nothing, and says so. */
  function browse(view) {
    view.innerHTML = "";
    const pool = S.dueCards().length ? S.dueCards() : EN.Bank.quotes();
    const deck = U.sample(pool, Math.min(15, pool.length));
    let i = 0, flipped = false;

    const shell = UI.gameShell("👀 Browse the Vault", { backTo: "/vault" });
    view.appendChild(shell.root);
    const progChip = UI.chip("1 / " + deck.length);
    shell.meta.appendChild(progChip);
    shell.body.appendChild(U.el("div", { class: "feedback" }, [
      U.el("b", { text: "This mode earns nothing. " }),
      U.el("span", { text: "Self-rated recall cannot be marked, so it cannot pay — but it does move cards in the Vault. Cloze Crunch is the one that pays." })
    ]));
    const stage = U.el("div");
    shell.body.appendChild(stage);

    function render() {
      stage.innerHTML = "";
      const q = deck[i];
      progChip.textContent = (i + 1) + " / " + deck.length;
      const st = S.cardState(q.id);
      flipped = false;

      const body = U.el("div", { class: "vcard-body" }, [
        U.el("div", { class: "prose", style: "font-style:italic; font-size:18px", text: q.text })
      ]);
      const box = U.el("div", { class: "vcard" }, [
        U.el("div", { class: "vcard-head" }, [
          U.el("span", { class: "chip", text: U.cite(q).work }),
          U.el("span", { class: "chip", text: q.composer || "" }),
          U.el("span", { class: "chip", text: "Box " + st.box })
        ]),
        body
      ]);
      stage.appendChild(box);

      const reveal = U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:12px",
                                      text: "Show the locus, technique and effect" });
      reveal.addEventListener("click", () => {
        if (flipped) return;
        flipped = true;
        EN.Sound.flip();
        reveal.remove();
        body.appendChild(U.el("div", { class: "vcard-effect" }, [
          U.el("div", { class: "tiny muted", text: U.citeLine(q) }),
          U.el("div", { style: "margin-top:8px", text: q.effect || "" }),
          U.el("div", { class: "row", style: "margin-top:10px" },
            (q.techniques || []).map(t => U.el("span", { class: "chip", text: EN.Bank.techniqueName(t) })))
        ]));
        rate.hidden = false;
      });
      stage.appendChild(reveal);

      const rate = U.el("div", { class: "row", hidden: true, style: "margin-top:12px" }, [
        U.el("button", { class: "btn btn-ghost", text: "✗ Not yet",
          on: { click: () => { S.reviewCard(q.id, false); EN.Sound.notYet(); next(); } } }),
        U.el("div", { class: "spacer" }),
        U.el("button", { class: "btn btn-primary", text: "✓ Had it",
          on: { click: () => { S.reviewCard(q.id, true); EN.Sound.ink(); next(); } } })
      ]);
      stage.appendChild(rate);
    }

    function next() {
      i++;
      if (i >= deck.length) {
        stage.innerHTML = "";
        stage.appendChild(U.el("div", { class: "empty" }, [
          U.el("div", { class: "empty-ico", text: "🗝️" }),
          U.el("p", { text: "Deck finished. The Vault has been updated — and, as advertised, you earned nothing." }),
          U.el("button", { class: "btn btn-primary btn-sm", text: "🕳️ Now drill them for XP",
                           on: { click: () => UI.go("/game/cloze") } })
        ]));
        return;
      }
      EN.Sound.page();
      render();
    }

    render();
  }

  return { screen };
})();
