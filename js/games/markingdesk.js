/* THE MARKING DESK — you are the marker.
   ============================================================================
   Read a paragraph, assign a band, tick which rubric descriptors it meets, then see the
   real judgement and the reasoning. It is the best-evidenced way to learn to write, and
   it is exactly the shape of the reference app's most-praised mode: make a judgement
   call, reveal the truth, score the gap within a tolerance.

   SCORING (§9.6). With five bands, guessing the modal band scores far above zero, so:
     • band is scored by DISTANCE — exact full, ±1 partial, ±2 or worse nothing
     • descriptors are scored NET: max(0, right − wrong) out of five
     • the completion bonus requires the descriptor ticks to agree, not just the band
   Guessing Band 4 every time therefore collects the ±1 partial on some samples and
   nothing else, which tests/exploit.js measures directly.

   The results screen is GATED behind a button (addendum H1). Opening a modal over the
   revealed judgement would cover the only place the marking is explained, which is the
   whole point of the exercise — and before this fix the only way back to it was quitting
   the run and throwing it away.
   ============================================================================ */
window.EN = window.EN || {};
EN.Games = EN.Games || {};

EN.Games.marking = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI;

  /* Band distance → share of the band score. ±2 pays nothing, because two bands out is
     not a near miss, it is a different reading of the paragraph. */
  const BAND_CREDIT = [1, 0.45, 0, 0, 0];

  function start(root, cfg) {
    const c = Object.assign({ modeId: "marking", title: "📝 The Marking Desk",
                              count: 5, module: null }, cfg);

    let pool = EN.Bank.activeParagraphs();
    if (c.module) pool = pool.filter(p => p.module === c.module);
    if (pool.length < 2) pool = EN.Bank.paragraphs();

    /* Draw across bands rather than uniformly at random, so a run cannot be five Band 4
       samples — which would make "always guess 4" a legitimately perfect strategy. */
    const byBand = {};
    pool.forEach(p => (byBand[p.band] || (byBand[p.band] = [])).push(p));
    const bands = Object.keys(byBand).sort();
    const items = [];
    let bi = 0, guard = 0;
    while (items.length < Math.min(c.count, pool.length) && guard++ < 200) {
      const b = bands[bi % bands.length]; bi++;
      const bucket = byBand[b].filter(p => !items.includes(p));
      if (bucket.length) items.push(U.pick(bucket));
    }
    if (!items.length) {
      root.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "📝" }),
        U.el("p", { text: "No sample paragraphs available for that selection." })
      ]));
      return;
    }
    U.shuffle(items).forEach((p, i) => (items[i] = p));

    S.markMode(c.modeId);
    S.touchStreak();
    EN.Sound.gameStart();

    let idx = 0, exact = 0, near = 0, perfect = 0;
    let descRight = 0, descWrong = 0, descTotal = 0;
    let xp = 0, coins = 0, finished = false;
    let shownAt = 0, minRead = 2000;

    /* Showing the band descriptors is a crutch: it turns a judgement into a lookup.
       Latched on first use, charged at 25%, and named on the results screen. */
    const showBands = UI.crutch("Band descriptors shown", 0.25);

    const shell = UI.gameShell(c.title, { confirmExit: true });
    root.appendChild(shell.root);
    const progChip = UI.chip("1 / " + items.length);
    const scoreChip = UI.chip("0 XP");
    shell.meta.appendChild(progChip); shell.meta.appendChild(scoreChip);

    const stage = U.el("div");
    shell.body.appendChild(stage);

    function render() {
      stage.innerHTML = "";
      const p = items[idx];
      progChip.textContent = (idx + 1) + " / " + items.length;

      let chosenBand = null;
      const ticked = new Set();
      let revealed = false;

      const wrap = U.el("div", { class: "grid" });

      /* ── the sample ── */
      wrap.appendChild(U.el("div", { class: "md-sample" }, [
        U.el("div", { class: "qtag" }, [
          U.el("span", { class: "chip", text: EN.Bank.moduleLabel(p.module) }),
          p.text ? U.el("span", { class: "chip", text: (EN.Bank.text(p.text) || {}).title || p.text }) : null,
          U.el("span", { class: "chip", text: U.words(p.para) + " words" })
        ]),
        U.el("div", { class: "md-para", text: p.para })
      ]));

      /* ── band descriptors, behind the crutch ── */
      const bandsPanel = U.el("div", { class: "grid" });
      function renderBandsPanel() {
        bandsPanel.innerHTML = "";
        if (!showBands.used()) {
          const btn = U.el("button", { class: "pu", type: "button" }, [
            U.el("span", { text: "📋" }), U.el("span", { text: "Show band descriptors" }),
            U.el("span", { class: "pu-n", text: "−25% XP" })
          ]);
          btn.addEventListener("click", () => { showBands.use(); EN.Sound.puInsight(); renderBandsPanel(); });
          bandsPanel.appendChild(U.el("div", { class: "powerups" }, [btn]));
        } else {
          EN.DATA.bands.forEach(b => bandsPanel.appendChild(
            U.el("div", { class: "card", style: "padding:11px 13px" }, [
              U.el("div", { class: "row", style: "gap:8px" }, [
                U.el("span", { class: "chip on", text: b.name }),
                U.el("span", { class: "tiny", text: b.cut })
              ]),
              U.el("div", { class: "tiny muted", style: "margin-top:6px", text: b.mine })
            ])));
        }
      }
      renderBandsPanel();
      wrap.appendChild(bandsPanel);

      /* ── the band choice ── */
      wrap.appendChild(U.el("h2", { text: "1. What band is it?" }));
      const bandRow = U.el("div", { class: "md-bands" });
      const bandBtns = {};
      [6, 5, 4, 3, 2].forEach(n => {
        const b = U.el("button", { class: "md-band", type: "button" }, [
          U.el("div", { class: "md-band-n", text: String(n) }),
          U.el("div", { class: "md-band-l", text: "Band" })
        ]);
        b.addEventListener("click", () => {
          if (revealed) return;
          chosenBand = n;
          Object.values(bandBtns).forEach(x => x.classList.remove("chosen"));
          b.classList.add("chosen");
          EN.Sound.cellSet();
          sync();
        });
        bandBtns[n] = b;
        bandRow.appendChild(b);
      });
      wrap.appendChild(bandRow);

      /* ── the descriptor ticks ── */
      wrap.appendChild(U.el("h2", { text: "2. Which descriptors does it meet?" }));
      const descWrap = U.el("div", { class: "md-desc-list" });
      const descBtns = {};
      EN.DATA.descriptors.forEach(d => {
        const tick = U.el("div", { class: "md-tick", text: "" });
        const b = U.el("button", { class: "md-desc", type: "button" }, [
          tick,
          U.el("div", { class: "md-desc-body" }, [
            U.el("div", { class: "md-desc-name", text: d.icon + " " + d.name }),
            U.el("div", { class: "md-desc-short", text: d.short })
          ])
        ]);
        b.addEventListener("click", () => {
          if (revealed) return;
          if (ticked.has(d.id)) { ticked.delete(d.id); b.classList.remove("ticked"); tick.textContent = ""; }
          else { ticked.add(d.id); b.classList.add("ticked"); tick.textContent = "✓"; EN.Sound.stroke(); }
          sync();
        });
        descBtns[d.id] = { b, tick };
        descWrap.appendChild(b);
      });
      wrap.appendChild(descWrap);

      /* Sticky once it can be pressed, for the same reason as the Essay Architect: this
         screen is a 130-word paragraph, a band row and five descriptor buttons, so on a
         phone "Mark it" is well below the fold at the moment it becomes usable. */
      const submitBar = U.el("div", { class: "md-actions" });
      const submit = U.el("button", { class: "btn btn-primary btn-block js-submit",
                                      text: "Mark it", disabled: true });
      submitBar.appendChild(submit);
      wrap.appendChild(submitBar);
      stage.appendChild(wrap);

      shownAt = performance.now();
      // Reading a 130-word paragraph carefully is the whole task, so the floor is real.
      /* 130 words of Band-4 prose is a real read, and this mode has no clock, so the
         floor is the honest 9-second cap rather than a fraction of anything. */
      minRead = UI.rushFloor({ read: p.para });

      function sync() {
        const ready = chosenBand !== null && !revealed;
        submit.disabled = !ready;
        submitBar.classList.toggle("stuck", ready);
      }

      submit.addEventListener("click", () => {
        if (chosenBand === null || revealed) return;
        revealed = true;
        submitBar.remove();

        const tooFast = performance.now() - shownAt < minRead;
        const distance = Math.abs(chosenBand - p.band);
        const bandCredit = BAND_CREDIT[Math.min(4, distance)];

        // Band feedback.
        Object.entries(bandBtns).forEach(([n, b]) => {
          b.disabled = true;
          if (Number(n) === p.band) b.classList.add("actual");
          if (Number(n) === chosenBand && chosenBand !== p.band) b.classList.add("wrongband");
        });

        /* Descriptor ticks are a set comparison, scored net. Right means the tick state
           matches the sample's authored descriptors; wrong means it does not. */
        let right = 0, wrong = 0;
        EN.DATA.descriptors.forEach(d => {
          const should = !!p.descriptors[d.id];
          const did = ticked.has(d.id);
          const { b, tick } = descBtns[d.id];
          b.disabled = true;
          if (should === did) { right++; b.classList.add("right"); }
          else { wrong++; b.classList.add("wrongtick"); }
          if (should && !did) tick.textContent = "✓";
          if (!should && did) tick.textContent = "✗";
        });
        descRight += right; descWrong += wrong; descTotal += EN.DATA.descriptors.length;
        const descNet = Math.max(0, right - wrong);
        const descShare = descNet / EN.DATA.descriptors.length;

        if (distance === 0) { exact++; S.bump("bandsExact"); EN.Sound.bandExact(); }
        else if (distance === 1) { near++; EN.Sound.bandNear(); }
        else EN.Sound.bandMiss();
        if (distance === 0 && wrong === 0) { perfect++; S.bump("perfectMarkings"); }
        S.bump("paragraphsMarked");
        S.recordAnswer(p.module, distance === 0, null, p.text, "Bands");
        S.progressDaily("marking", 1);

        const gain = tooFast ? 0 : Math.round(30 * (0.55 * bandCredit + 0.45 * descShare));
        xp += gain;
        coins += tooFast ? 0 : Math.round(4 * bandCredit + 3 * descShare);
        scoreChip.textContent = xp + " XP";
        if (gain) EN.FX.marked(window.innerWidth / 2, window.innerHeight * 0.4);

        /* ── the real judgement, and the reasoning ── */
        const parent = p.derivedFrom && EN.Bank.paragraphById(p.derivedFrom);
        const verdict = U.el("div", { class: "md-verdict" }, [
          U.el("div", { class: "lc-word",
            text: distance === 0 ? "Band " + p.band + " — exactly right"
                : distance === 1 ? "Band " + p.band + " — one band out"
                : "Band " + p.band + " — " + distance + " bands out" }),
          U.el("p", { text: p.why }),
          p.broke && p.broke.length ? U.el("div", { class: "md-broke",
            text: "✂ This sample was made by breaking a Band " + (parent ? parent.band : p.band + 1) +
                  " exemplar: " + p.broke.map(brokeLabel).join(", ") }) : null,
          parent ? U.el("details", { style: "margin-top:12px" }, [
            U.el("summary", { class: "tiny", style: "cursor:pointer", text: "Show the exemplar it was broken from" }),
            U.el("div", { class: "md-para", style: "margin-top:10px", text: parent.para }),
            U.el("div", { class: "tiny muted", style: "margin-top:8px", text: parent.why })
          ]) : null,
          tooFast ? U.el("div", { class: "lc-flag", text: "⏱️ Marked faster than that paragraph can be read — no XP for it." }) : null
        ]);
        UI.announce(verdict);
        stage.appendChild(verdict);
        verdict.scrollIntoView({ behavior: EN.FX.isReduced() ? "auto" : "smooth", block: "nearest" });
        EN.Sound.reveal();

        const isLast = idx >= items.length - 1;
        stage.appendChild(U.el("div", { class: "row", style: "margin-top:14px" }, [
          U.el("button", { class: "btn btn-primary",
            text: isLast ? "Finish" : "Next paragraph →",
            on: { click: () => { if (isLast) return finish(); idx++; EN.Sound.page(); render(); window.scrollTo({ top: 0 }); } } })
        ]));
      });
    }

    function brokeLabel(id) {
      const d = EN.DATA.descriptors.find(x => x.id === id);
      return d ? d.name.toLowerCase() + " removed" : id;
    }

    function finish() {
      if (finished) return;
      finished = true;
      const newBest = S.recordScore(c.modeId, exact);
      if (perfect === items.length && items.length >= 3) { S.bump("perfectRuns"); EN.Sound.perfect(); }

      /* The bonus needs the DESCRIPTORS to agree, not just the band (§9.6). Band accuracy
         alone would let "always guess 4" collect a completion bonus off the ±1 credit. */
      const descAccuracy = descTotal ? Math.max(0, descRight - descWrong) / descTotal : 0;
      const bandAccuracy = items.length ? (exact + near * 0.45) / items.length : 0;

      const got = UI.award({
        xp, bonus: S.streakBonus(),
        accuracy: Math.min(bandAccuracy, descAccuracy),
        coins, crutchCost: UI.crutchCost([showBands])
      });

      UI.results({
        title: "Marking session complete",
        correct: exact, total: items.length, xp: got.xp, coins: got.coins, newBest,
        scoreLabel: "Bands exact",
        extraStats: [
          ["±1 band", near],
          ["Descriptors", descRight + "/" + descTotal],
          showBands.used() ? ["Descriptors shown", "yes"] : ["Perfect", perfect]
        ],
        note: "The bonus needs your ticks to agree as well as your band — guessing the middle band gets you the near-miss credit and nothing else.",
        /* Gated, and review is on, because the judgements are still on the page and they
           are the part worth reading. */
        gate: true, gateLabel: "See how you marked ↑",
        onAgain: () => UI.handleRoute()
      });
    }

    render();
  }

  return { start, BAND_CREDIT };
})();
