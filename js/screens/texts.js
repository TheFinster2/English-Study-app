/* YOUR TEXTS — pick the four (or five) texts the whole app drills, and which poems.
   ============================================================================
   Originally this was a one-file edit in js/data/texts.js, which is fine for the person
   who wrote the file and useless for the student holding the phone. Everything now reads
   through State.activeTexts(), so this screen is the manifest.

   The poem layer exists because Donne is not a text, it is a selection: fifty-four poems,
   and no two courses cut them the same way. Drilling quotes from poems a student has
   never been set is worse than drilling nothing — it teaches them the app does not know
   what they study. So a text may declare `poems`, and this screen switches them on and
   off individually.

   Every write calls Bank.invalidate(), because the quote pool is memoised and the picker
   would otherwise appear to do nothing until a reload.
   ============================================================================ */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.texts = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  function screen(view, args) {
    if (args && args[0] === "poems" && args[1]) return poems(view, args[1]);
    if (args && args[0]) return slotPicker(view, args[0]);
    return overview(view);
  }

  /* ── the four slots ───────────────────────────────────────── */
  function overview(view) {
    const active = S.activeTexts();
    view.appendChild(U.el("h1", { text: "📚 Your texts" }));
    view.appendChild(U.el("p", { class: "muted",
      text: "Pick what your class actually studies. Every question, every quote in the Vault, every Marking Desk paragraph and the whole adaptive draw follow this — so it is worth getting right before you start." }));

    const grid = U.el("div", { class: "grid" });
    EN.DATA.modules.forEach(m => {
      const ids = [].concat(active[m.id] || []).filter(Boolean);
      const chosen = ids.map(id => EN.Bank.text(id)).filter(Boolean);
      const card = U.el("div", { class: "card" }, [
        U.el("div", { class: "row" }, [
          U.el("span", { style: "font-size:20px", text: m.icon }),
          U.el("div", { style: "flex:1; min-width:0" }, [
            U.el("b", { text: m.code }),
            U.el("div", { class: "tiny muted", text: m.name + (m.pair ? " — a pair" : "") })
          ]),
          U.el("button", { class: "btn btn-ghost btn-sm", text: chosen.length ? "Change" : "Choose",
                           on: { click: () => UI.go("/texts/" + m.id) } })
        ])
      ]);

      if (!chosen.length) {
        card.appendChild(U.el("div", { class: "tiny muted", style: "margin-top:8px",
          text: "Nothing set — this module is drilling nothing text-specific." }));
      }
      chosen.forEach(t => {
        const on = S.enabledPoems(t.id);
        const total = (t.poems || []).length;
        const row = U.el("div", { class: "text-slot", style: "margin-top:8px" }, [
          U.el("div", { class: "text-slot-body" }, [
            U.el("div", { class: "text-slot-title", text: t.title }),
            U.el("div", { class: "text-slot-sub",
              text: (t.composer || "") + " · " + countQuotes(t.id) + " quotes in play" +
                    (total ? " · " + (on ? on.length : total) + " of " + total + " poems" : "") })
          ]),
          total ? U.el("button", { class: "btn btn-ghost btn-sm", text: "Poems",
                                   on: { click: () => UI.go("/texts/poems/" + t.id) } }) : null
        ]);
        card.appendChild(row);
      });
      grid.appendChild(card);
    });
    view.appendChild(grid);

    view.appendChild(U.el("div", { class: "notice", style: "margin-top:14px" }, [
      U.el("b", { text: "Module C is a skills module. " }),
      U.el("span", { text: "There is no prescribed text to drill — the ‘Craft’ entry holds model sentences rather than a set work, and the writing modes are text-agnostic either way." })
    ]));

    if (S.data.manifest) {
      view.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:12px",
        text: "Back to the shipped default", on: { click: () => {
          UI.confirmDialog("Use the default texts?",
            "Resets all four slots to what the app ships with. Your progress, Vault boxes and statistics are untouched — this only changes what gets drilled.",
            () => {
              S.data.manifest = null;
              S.save();
              EN.Bank.invalidate();
              UI.toast({ icon: "📚", kind: "good", text: "Back to the default four." });
              UI.handleRoute();
            }, "Reset");
        } } }));
    }
  }

  const countQuotes = id => EN.Bank.filterQuotes({ texts: [id] }).length;

  /* ── choosing a text for one slot ─────────────────────────── */
  function slotPicker(view, mod) {
    const m = EN.DATA.modules.find(x => x.id === mod);
    if (!m) return UI.go("/texts");
    const shell = UI.gameShell(m.icon + " " + m.code, { backTo: "/texts" });
    view.appendChild(shell.root);

    const active = S.activeTexts();
    let picked = [].concat(active[mod] || []).filter(Boolean);

    shell.body.appendChild(U.el("p", { class: "muted",
      text: m.pair
        ? "Module A is a conversation, so pick two — the earlier text and the one answering it. Tap to add or remove."
        : "Pick the text your class studies. Tap to select." }));
    shell.body.appendChild(U.el("p", { class: "tiny muted",
      text: m.name + " — " + m.concept }));

    const list = U.el("div", { class: "grid", style: "margin-top:12px" });
    shell.body.appendChild(list);

    /* Texts that name this module first, then everything else, because a student
       occasionally studies a work outside the slot the app expected. */
    const all = EN.Bank.allTexts();
    const fits = all.filter(t => (t.modules || []).includes(mod));
    const rest = all.filter(t => !(t.modules || []).includes(mod));

    const save = U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:14px" });
    const hint = U.el("p", { class: "tiny muted", style: "text-align:center" });

    function paint() {
      list.innerHTML = "";
      section("Written for " + m.code, fits);
      if (rest.length) section("Other texts in the app", rest);
      const need = m.pair ? 2 : 1;
      save.textContent = picked.length ? "Save" : "Clear this module";
      save.disabled = m.pair && picked.length === 1;
      hint.textContent = m.pair
        ? picked.length === 2 ? "" : picked.length + " of 2 chosen — Module A needs both halves of the pair."
        : "";
    }

    function section(title, texts) {
      if (!texts.length) return;
      list.appendChild(U.el("h3", { text: title, style: "margin-top:6px" }));
      texts.forEach(t => {
        const on = picked.includes(t.id);
        const n = (t.quotes || []).length;
        const b = U.el("button", { class: "srow-pick" + (on ? " on" : ""), type: "button" }, [
          U.el("span", { class: "srow-body" }, [
            U.el("b", { text: t.title }),
            U.el("div", { class: "tiny muted",
              text: (t.composer || "") + (t.year ? ", " + t.year : "") + " · " + n + " quotes" +
                    ((t.poems || []).length ? " across " + t.poems.length + " poems" : "") }),
            t.blurb ? U.el("div", { class: "tiny muted", style: "margin-top:4px", text: t.blurb }) : null
          ]),
          on ? U.el("span", { class: "chip on", text: "✓" }) : null
        ]);
        b.addEventListener("click", () => {
          if (m.pair) {
            if (on) picked = picked.filter(x => x !== t.id);
            else if (picked.length < 2) picked.push(t.id);
            else picked = [picked[1], t.id];   // oldest out, so a third tap still works
          } else picked = on ? [] : [t.id];
          EN.Sound.select();
          paint();
        });
        list.appendChild(b);
      });
    }

    save.addEventListener("click", () => {
      S.setSlot(mod, m.pair ? picked : picked[0] || null);
      EN.Sound.ink();
      UI.toast({ icon: m.icon, kind: "good",
        text: picked.length ? "<b>" + m.code + "</b> set." : "<b>" + m.code + "</b> cleared." });
      UI.go("/texts");
    });

    shell.body.appendChild(save);
    shell.body.appendChild(hint);
    paint();
  }

  /* ── choosing poems within a text ─────────────────────────── */
  function poems(view, textId) {
    const t = EN.Bank.text(textId);
    if (!t || !(t.poems || []).length) return UI.go("/texts");

    const shell = UI.gameShell("📜 " + t.title, { backTo: "/texts" });
    view.appendChild(shell.root);

    let on = new Set(S.enabledPoems(textId) || t.poems.map(p => p.id));
    const counts = {};
    (t.quotes || []).forEach(q => { if (q.poem) counts[q.poem] = (counts[q.poem] || 0) + 1; });

    shell.body.appendChild(U.el("p", { class: "muted",
      text: "Switch on the poems your class is studying. The rest stay in the app — they are just not drilled, and they do not enter your Vault." }));

    const tally = U.el("div", { class: "chip on" });
    const bar = U.el("div", { class: "row", style: "flex-wrap:wrap" }, [
      tally,
      U.el("button", { class: "btn btn-ghost btn-sm", text: "All",
                       on: { click: () => { t.poems.forEach(p => on.add(p.id)); repaint(); } } }),
      U.el("button", { class: "btn btn-ghost btn-sm", text: "None",
                       on: { click: () => { on.clear(); repaint(); } } }),
      U.el("button", { class: "btn btn-ghost btn-sm", text: "The usual set",
                       on: { click: () => { on = new Set(t.poems.filter(p => p.core).map(p => p.id)); repaint(); } } })
    ]);
    shell.body.appendChild(bar);

    const body = U.el("div", { class: "grid", style: "margin-top:6px" });
    shell.body.appendChild(body);

    /* Groups in the order the data file declares them, not alphabetically — "Holy
       Sonnets" before "Songs and Sonnets" is the order a course teaches them in. */
    const groups = [];
    t.poems.forEach(p => {
      const g = p.group || "Poems";
      let bucket = groups.find(x => x.name === g);
      if (!bucket) groups.push(bucket = { name: g, items: [] });
      bucket.items.push(p);
    });

    function repaint() {
      body.innerHTML = "";
      const quotesOn = t.poems.reduce((n, p) => n + (on.has(p.id) ? (counts[p.id] || 0) : 0), 0);
      tally.textContent = on.size + " of " + t.poems.length + " poems · " + quotesOn + " quotes";

      groups.forEach(g => {
        const allOn = g.items.every(p => on.has(p.id));
        const head = U.el("div", { class: "row", style: "margin-top:10px" }, [
          U.el("h3", { text: g.name, style: "margin:0" }),
          U.el("div", { class: "spacer" }),
          U.el("button", { class: "btn btn-ghost btn-sm", text: allOn ? "Clear group" : "Whole group",
            on: { click: () => {
              g.items.forEach(p => allOn ? on.delete(p.id) : on.add(p.id));
              repaint();
            } } })
        ]);
        body.appendChild(head);

        g.items.forEach(p => {
          const isOn = on.has(p.id);
          const row = U.el("button", { class: "srow-pick poem-row" + (isOn ? " on" : ""), type: "button" }, [
            U.el("span", { class: "srow-body" }, [
              U.el("b", { text: p.title }),
              U.el("div", { class: "tiny muted poem-open", text: "“" + p.opening + "”" }),
              U.el("div", { class: "tiny muted",
                text: (counts[p.id] || 0) + " quote" + ((counts[p.id] || 0) === 1 ? "" : "s") +
                      (p.core ? " · commonly set" : "") })
            ]),
            U.el("span", { class: "switch" + (isOn ? " on" : "") })
          ]);
          row.addEventListener("click", () => {
            if (isOn) on.delete(p.id); else on.add(p.id);
            EN.Sound.stroke();
            repaint();
          });
          body.appendChild(row);
        });
      });
    }
    repaint();

    shell.body.appendChild(U.el("div", { class: "row", style: "margin-top:16px" }, [
      U.el("button", { class: "btn btn-ghost btn-sm", text: "Cancel", on: { click: () => UI.go("/texts") } }),
      U.el("div", { class: "spacer" }),
      U.el("button", { class: "btn btn-primary", text: "Save selection", on: { click: () => {
        if (!on.size) {
          return UI.toast({ icon: "⚠", kind: "bad",
            text: "Pick at least one poem, or this text drills nothing." });
        }
        S.setPoems(textId, Array.from(on));
        EN.Sound.ink();
        UI.toast({ icon: "📜", kind: "good", text: on.size + " poems in play." });
        UI.go("/texts");
      } } })
    ]));
  }

  return { screen };
})();
