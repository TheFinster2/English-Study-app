/* THE DRAFT DESK — somewhere to write. Earns nothing.
   ============================================================================
   §0.5. A student who has just drilled forty techniques wants to write a paragraph, and
   this app cannot mark a paragraph — Layer C marks a sentence against exemplars, and an
   essay is not a sentence. So the desk gives what an app can honestly give: a prompt
   bank, a word count, an exam clock, autosave, and export to a file the student can hand
   to the person who *can* mark it.

   It gives NO XP, NO Marks and NO marking, and that is enforced structurally: nothing in
   this file calls UI.award(), and `State.saveDraft` (state.js) calls neither addXP nor
   addCoins. tests/suites/economy.js greps this file for the call, comments stripped.

   The one thing the desk does touch is `stats.draftWords`, which two collection
   achievements read — and that is recomputed as the sum over *kept drafts*, never
   incremented, so padding one draft to 4,000 words unlocks nothing that keeping the
   draft would not have unlocked anyway (§9.11: a "free" mode must not become the optimal
   strategy, and the only way to make that true is for the free mode to pay nothing).
   ============================================================================ */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.draft = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /* Real exam allocations, so the clock means something. */
  const CLOCKS = [
    { id: "off",   label: "No clock",  min: 0 },
    { id: "short",  label: "Short answer · 15 min", min: 15 },
    { id: "para",   label: "One paragraph · 20 min", min: 20 },
    { id: "essay",  label: "Essay · 40 min",  min: 40 },
    { id: "paper2", label: "Paper 2 section · 40 min", min: 40 }
  ];

  const now = () => Date.now();
  const newId = () => "d" + now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

  /* ── router entry ─────────────────────────────────────────── */
  function screen(view, args) {
    const id = args && args[0];
    if (id === "new") return editor(view, blank());
    if (id) {
      const d = (S.data.drafts || []).find(x => x.id === id);
      if (!d) return UI.go("/draft");
      return editor(view, d);
    }
    return list(view);
  }

  function blank() {
    return { id: newId(), title: "", body: "", prompt: "", clock: "off",
             created: now(), updated: now(), elapsed: 0 };
  }

  /* ── the desk ─────────────────────────────────────────────── */
  function list(view) {
    view.appendChild(U.el("h1", { text: "📄 The Draft Desk" }));
    view.appendChild(U.el("p", { class: "muted",
      text: "Somewhere to write, with a word count and an exam clock. No marks, no XP, no Marks, nobody reading over your shoulder. This app trains the moves and marks your sentences; your teacher marks the essay." }));

    view.appendChild(U.el("button", { class: "btn btn-primary btn-block", text: "＋ New draft",
                                      on: { click: () => UI.go("/draft/new") } }));

    const drafts = (S.data.drafts || []).slice().sort((a, b) => b.updated - a.updated);

    if (!drafts.length) {
      view.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "📄" }),
        U.el("p", { text: "Nothing on the desk yet. Take a question from the bank below, set the clock, and write." })
      ]));
    } else {
      const total = drafts.reduce((n, d) => n + U.words(d.body), 0);
      view.appendChild(U.el("div", { class: "grid g3", style: "margin-top:14px" }, [
        tile(drafts.length, "Drafts"),
        tile(total, "Words kept"),
        tile(U.fmtTime(drafts.reduce((n, d) => n + (d.elapsed || 0), 0)), "Time at the desk")
      ]));

      const wrap = U.el("div", { class: "draft-list", style: "margin-top:14px" });
      drafts.forEach(d => {
        const w = U.words(d.body);
        const card = U.el("div", { class: "draft-row" }, [
          U.el("div", { class: "draft-row-body" }, [
            U.el("div", { style: "font-weight:700", text: d.title || "Untitled draft" }),
            d.prompt ? U.el("div", { class: "tiny muted", text: d.prompt }) : null,
            U.el("div", { class: "tiny muted",
              text: w + " word" + (w === 1 ? "" : "s") +
                    (d.elapsed ? " · " + U.fmtTime(d.elapsed) + " written" : "") +
                    " · " + ago(d.updated) })
          ]),
          U.el("div", { class: "row", style: "flex:none" }, [
            U.el("button", { class: "btn btn-ghost btn-sm", text: "Export",
                             on: { click: () => exportOne(d) } }),
            U.el("button", { class: "btn btn-ghost btn-sm", text: "🗑",
                             on: { click: () => {
                               UI.confirmDialog("Delete this draft?",
                                 "<b>" + U.escapeHtml(d.title || "Untitled draft") + "</b> — " + w +
                                 " words. This cannot be undone, and it is not in your export unless you have exported already.",
                                 () => { S.deleteDraft(d.id); EN.Sound.erase(); UI.handleRoute(); }, "Delete");
                             } } }),
            U.el("button", { class: "btn btn-primary btn-sm", text: "Open",
                             on: { click: () => UI.go("/draft/" + d.id) } })
          ])
        ]);
        wrap.appendChild(card);
      });
      view.appendChild(wrap);

      view.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:10px",
        text: "⬇ Export all drafts as one file", on: { click: () => exportAll(drafts) } }));
    }

    /* ── the prompt bank ── */
    view.appendChild(U.el("h2", { text: "Question bank" }));
    view.appendChild(U.el("p", { class: "tiny muted",
      text: "Real question shapes for your modules. Tap one to start a draft with it at the top." }));
    const bank = U.el("div", { class: "grid" });
    EN.DATA.moduleConcepts.forEach(mc => {
      const mod = EN.DATA.modules.find(m => m.id === mc.mod);
      const box = U.el("div", { class: "card" }, [
        U.el("div", { class: "row" }, [
          U.el("span", { style: "font-size:18px", text: mod ? mod.icon : "📘" }),
          U.el("b", { text: mc.title })
        ])
      ]);
      mc.questionShapes.forEach(q => {
        const b = U.el("button", { class: "btn btn-ghost btn-block draft-qbtn", style: "margin-top:8px",
                                   text: q });
        b.addEventListener("click", () => {
          const d = blank();
          d.prompt = q;
          d.title = (mod ? mod.code : mc.mod) + " — " + q.slice(0, 40).replace(/\s+\S*$/, "") + "…";
          d.clock = "essay";
          S.saveDraft(d);
          UI.go("/draft/" + d.id);
        });
        box.appendChild(b);
      });
      bank.appendChild(box);
    });
    view.appendChild(bank);

    function tile(n, label) {
      return U.el("div", { class: "card stat-tile" }, [
        U.el("div", { class: "stat-num", text: String(n) }),
        U.el("div", { class: "stat-lbl", text: label })
      ]);
    }
  }

  /* ── the editor ───────────────────────────────────────────── */
  function editor(view, draft) {
    const shell = UI.gameShell("📄 " + (draft.title || "Draft"), { backTo: "/draft" });
    view.appendChild(shell.root);

    const wordChip = UI.chip("0 words");
    const clockChip = U.el("span", { class: "timer-ring", "aria-live": "off", role: "timer", text: "0:00" });
    const savedChip = UI.chip("saved");
    [wordChip, clockChip, savedChip].forEach(n => shell.meta.appendChild(n));

    /* No award() call in this file, so there is nothing to gate — but say so out loud,
       because a student who has been trained by fourteen paying modes will assume
       otherwise and write for the score rather than for the writing (§0.4). */
    shell.body.appendChild(U.el("div", { class: "notice" }, [
      U.el("b", { text: "This is unmarked. " }),
      U.el("span", { text: "Nothing here is scored and nothing here pays — no XP, no Marks, no verdict. Write, export it, and give it to your teacher." })
    ]));

    const titleIn = U.el("input", { class: "tin", type: "text", placeholder: "Title this draft",
                                    value: draft.title || "" });
    shell.body.appendChild(titleIn);

    if (draft.prompt) {
      shell.body.appendChild(U.el("div", { class: "reader" }, [
        U.el("div", { class: "tiny muted", text: "Question" }),
        U.el("div", { class: "prose", style: "font-size:16px" }, [U.el("p", { text: draft.prompt })])
      ]));
    } else {
      const promptIn = U.el("input", { class: "tin", type: "text",
        placeholder: "Paste or type the question (optional)", value: "" });
      promptIn.addEventListener("input", () => { draft.prompt = promptIn.value; queue(); });
      shell.body.appendChild(promptIn);
    }

    const area = U.el("textarea", { class: "tin draft-area", rows: "18",
      placeholder: "Write here. Autosaves as you go." });
    area.value = draft.body || "";
    shell.body.appendChild(area);

    /* ── word count and paragraph count ── */
    const counts = U.el("div", { class: "draft-meta" });
    shell.body.appendChild(counts);

    /* ── the clock ──
       Counts UP by default, or down from an exam allocation. It advances only while this
       screen is mounted; UI.onLeave clears it, so leaving does not keep accruing. */
    const clockSel = U.el("select", { class: "tin" });
    CLOCKS.forEach(c => clockSel.appendChild(
      U.el("option", { value: c.id, text: c.label, selected: c.id === draft.clock ? "selected" : null })));
    clockSel.value = draft.clock || "off";

    let running = false, tickId = null, sessionSec = 0;
    const startBtn = U.el("button", { class: "btn btn-primary btn-sm", text: "▶ Start clock" });

    shell.body.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "row" }, [
        U.el("div", { style: "flex:1; min-width:0" }, [clockSel]),
        startBtn
      ]),
      U.el("div", { class: "tiny muted", style: "margin-top:8px",
        text: "The clock is a rehearsal, not a rule. It stops when you leave this screen." })
    ]));

    function budgetSec() {
      const c = CLOCKS.find(x => x.id === clockSel.value);
      return c ? c.min * 60 : 0;
    }

    function paintClock() {
      const budget = budgetSec();
      if (!budget) {
        clockChip.textContent = U.fmtTime(sessionSec);
        clockChip.classList.remove("low");
        return;
      }
      const left = budget - sessionSec;
      clockChip.textContent = (left < 0 ? "−" : "") + U.fmtTime(Math.abs(left));
      clockChip.classList.toggle("low", left <= 120);
    }

    function setRunning(on) {
      running = on;
      startBtn.textContent = on ? "⏸ Pause clock" : "▶ Start clock";
      startBtn.classList.toggle("btn-primary", !on);
      startBtn.classList.toggle("btn-ghost", on);
      if (tickId) { clearInterval(tickId); tickId = null; }
      if (!on) return;
      let overRun = false;
      tickId = setInterval(() => {
        sessionSec++;
        draft.elapsed = (draft.elapsed || 0) + 1;
        paintClock();
        const budget = budgetSec();
        if (budget && !overRun && sessionSec >= budget) {
          overRun = true;
          EN.Sound.carriage();
          UI.toast({ icon: "⏰", text: "<b>Pens down.</b> Keep writing if you want — nothing here is marked." });
        }
        if (sessionSec % 20 === 0) queue();
      }, 1000);
    }
    startBtn.addEventListener("click", () => setRunning(!running));
    clockSel.addEventListener("change", () => {
      draft.clock = clockSel.value;
      sessionSec = 0;
      paintClock();
      queue();
    });

    /* ── autosave ──
       The same debounce-plus-flush shape as the save file itself (§9.4): a debounced
       write while typing, an unconditional write on leaving, so a mid-sentence exit does
       not lose the sentence. */
    let saveTimer = null, dirty = false;
    function queue() {
      dirty = true;
      savedChip.textContent = "unsaved…";
      savedChip.classList.remove("good");
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(commit, 900);
    }
    function commit() {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      if (!dirty) return;
      draft.title = titleIn.value.trim();
      draft.body = area.value;
      draft.updated = now();
      /* saveDraft touches stats.draftWords and calls State.save(). It does NOT award. */
      S.saveDraft(draft);
      /* This is the one screen where a refused write costs the student something they
         cannot get back, and it is also the screen most likely to cause one: an essay is
         the biggest thing the save ever grows by. So the chip reports what actually
         happened rather than what was attempted, `dirty` stays set so a later write
         catches up, and Export is offered — it needs no storage at all. */
      if (S.flush() === false) { failSave(); return; }
      dirty = false;
      savedChip.textContent = "saved";
      savedChip.classList.remove("bad");
      savedChip.classList.add("good");
    }

    let warnedUnsaved = false;
    function failSave() {
      savedChip.textContent = "NOT SAVED";
      savedChip.classList.remove("good");
      savedChip.classList.add("bad");
      if (warnedUnsaved) return;
      warnedUnsaved = true;
      shell.body.insertBefore(U.el("div", { class: "notice notice-bad" }, [
        U.el("b", { text: "This draft is not being saved. " }),
        U.el("span", { text: "The device's storage for the app is full, so it only exists " +
                             "in this tab — closing it loses the writing. Export it now, then " +
                             "delete a few old drafts from the Draft Desk." }),
        U.el("button", { class: "btn btn-primary btn-sm", style: "margin-top:10px",
          text: "⬇ Export this draft now",
          on: { click: () => { draft.body = area.value; draft.title = titleIn.value.trim();
                               exportOne(draft); } } })
      ]), shell.body.firstChild);
      EN.Sound.error();
    }

    function paintCounts() {
      const text = area.value;
      const w = U.words(text);
      const paras = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
      const sentences = text.split(/[.!?]+(?:\s|$)/).map(s => s.trim()).filter(Boolean);
      wordChip.textContent = w + " word" + (w === 1 ? "" : "s");
      counts.innerHTML = "";
      [[w, "words"], [paras.length, "paragraphs"], [sentences.length, "sentences"],
       [w && sentences.length ? Math.round(w / sentences.length) : 0, "words / sentence"],
       [Math.max(0, text.length), "characters"]]
        .forEach(([n, l]) => counts.appendChild(U.el("span", { class: "chip", text: n + " " + l })));
    }

    /* The clock stays manual on purpose — auto-starting it on the first keystroke turns
       "somewhere to write" into another timed mode. */
    area.addEventListener("input", () => { paintCounts(); queue(); });
    titleIn.addEventListener("input", queue);

    shell.body.appendChild(U.el("div", { class: "row", style: "margin-top:14px" }, [
      U.el("button", { class: "btn btn-ghost btn-sm", text: "⬇ Export",
                       on: { click: () => { commit(); exportOne(draft); } } }),
      U.el("button", { class: "btn btn-ghost btn-sm", text: "Copy",
                       on: { click: () => copyOut(draft, area.value) } }),
      U.el("div", { class: "spacer" }),
      U.el("button", { class: "btn btn-primary btn-sm", text: "Save & close",
                       on: { click: () => { dirty = true; commit(); EN.Sound.bookClose(); UI.go("/draft"); } } })
    ]));

    /* Two exits to cover: navigating inside the app, and backgrounding or closing the
       tab. onLeave holds exactly one cleanup, so both are handled in the one function. */
    const onHide = () => { if (document.visibilityState === "hidden") commit(); };
    document.addEventListener("visibilitychange", onHide);
    UI.onLeave(() => {
      if (tickId) clearInterval(tickId);
      document.removeEventListener("visibilitychange", onHide);
      commit();
    });

    paintCounts();
    paintClock();
    savedChip.classList.add("good");
    area.focus();
  }

  /* ── export ───────────────────────────────────────────────── */
  function plain(d) {
    const w = U.words(d.body);
    return [
      d.title || "Untitled draft",
      d.prompt ? "\nQuestion: " + d.prompt : "",
      "\n" + new Date(d.updated).toLocaleString() + " · " + w + " words" +
        (d.elapsed ? " · " + U.fmtTime(d.elapsed) + " at the desk" : ""),
      "\n" + "-".repeat(60) + "\n",
      d.body || "",
      "\n"
    ].join("");
  }

  function download(name, text) {
    /* A Blob object URL, revoked immediately after the click — no network, works from
       file:// as well as https://. */
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = U.el("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  const slug = s => (s || "draft").toLowerCase().replace(/[^a-z0-9]+/g, "-")
                     .replace(/^-|-$/g, "").slice(0, 40) || "draft";

  function exportOne(d) {
    download("closereading-" + slug(d.title) + ".txt", plain(d));
    EN.Sound.page();
    UI.toast({ icon: "⬇", kind: "good", text: "Draft exported." });
  }

  function exportAll(drafts) {
    const body = drafts.map(plain).join("\n\n" + "=".repeat(60) + "\n\n");
    download("closereading-drafts.txt",
      "Close Reading — Draft Desk\n" + drafts.length + " drafts, " +
      drafts.reduce((n, d) => n + U.words(d.body), 0) + " words\n\n" +
      "=".repeat(60) + "\n\n" + body);
    EN.Sound.page();
    UI.toast({ icon: "⬇", kind: "good", text: drafts.length + " drafts exported." });
  }

  function copyOut(d, body) {
    /* UI.copy owns the clipboard fallback now — this screen wrote it first and the Vault
       needed the same thing, so there is one copy of it in ui.js rather than two. */
    UI.copy(plain(Object.assign({}, d, { body })), "Copied to the clipboard.");
  }

  function ago(ts) {
    const mins = Math.floor((now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    const days = Math.floor(hrs / 24);
    return days === 1 ? "yesterday" : days + " days ago";
  }

  return { screen, CLOCKS, plain };
})();
