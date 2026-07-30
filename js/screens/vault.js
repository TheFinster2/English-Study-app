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

    /* Filters. Text and concept, plus a due-only toggle. */
    view.appendChild(U.el("h2", { text: "Browse the Vault" }));
    const filters = U.el("div", { class: "vault-filters", style: "margin-bottom:10px" });
    filters.appendChild(chipBtn("All texts", !filter.text, () => { filter.text = null; UI.handleRoute(); }));
    EN.Bank.activeTexts().forEach(t =>
      filters.appendChild(chipBtn(t.title, filter.text === t.id, () => { filter.text = t.id; UI.handleRoute(); })));
    filters.appendChild(chipBtn(filter.dueOnly ? "✓ due only" : "due only", filter.dueOnly,
      () => { filter.dueOnly = !filter.dueOnly; UI.handleRoute(); }));
    view.appendChild(filters);

    let list = EN.Bank.filterQuotes({ texts: filter.text ? [filter.text] : null });
    if (filter.dueOnly) {
      const dueIds = new Set(due.map(q => q.id));
      list = list.filter(q => dueIds.has(q.id));
    }

    const wrap = U.el("div", { class: "vault-list" });
    list.slice(0, 200).forEach(q => {
      const st = S.data.srs[q.id];
      const box = st ? st.box : 0;
      const isDue = !st || U.daysBetween(st.due, U.dayKey()) >= 0;
      const row = U.el("button", { class: "vault-row", type: "button" }, [
        U.el("span", { class: "vault-box" + (isDue ? " vault-due" : ""), data: { box: String(box) },
                       text: box ? String(box) : "·" }),
        U.el("span", { class: "vault-row-q", html: U.highlight(q.text, q.span) }),
        U.el("span", { class: "tiny muted vault-locus", title: q.locus || "", text: q.locus || "" })
      ]);
      row.addEventListener("click", () => UI.go("/vault/card/" + q.id));
      wrap.appendChild(row);
    });
    if (!list.length) wrap.appendChild(U.el("div", { class: "empty" }, [
      U.el("div", { class: "empty-ico", text: "🗝️" }),
      U.el("p", { text: filter.dueOnly ? "Nothing due with that filter." : "No quotes match that filter." })
    ]));
    view.appendChild(wrap);
    if (list.length > 200) view.appendChild(U.el("p", { class: "tiny muted",
      text: "Showing the first 200 of " + list.length + ". Narrow it with a text filter." }));
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
          U.el("span", { class: "chip", text: q.textTitle }),
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
          U.el("div", { class: "tiny muted", text: (q.speaker || "") + " · " + (q.locus || "") }),
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
