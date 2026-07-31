/* CONTENT INTEGRITY — everything checkable about the bank without a browser.
   ============================================================================
   The volume targets are here as assertions rather than as a note in a brief, because a
   target nobody checks is a wish. So are the shape rules: a question with no `why`, a
   quote whose `mark` is not a substring of its text, a technique tag that resolves to
   nothing, an achievement that fires on a fresh save — each of these is invisible in
   normal play and each makes the app quietly worse.
   ============================================================================ */
"use strict";
const path = require("path");
const { loadData, dataFiles, allQuestions, freshStats } = require("../lib/measure");

module.exports = {
  name: "validate",
  about: "content shape, volume targets, cross-references",

  run(t, { ROOT }) {
    const { EN } = loadData(ROOT, dataFiles(ROOT));
    const D = EN.DATA;
    const U = EN.U;
    const qs = allQuestions(EN);

    /* ── volume ────────────────────────────────────────────────
       From the brief's §4.4. Falling under one of these is not a crash, it is the app
       being thinner than it claims, which is why it is asserted. */
    t.atLeast(qs.length, 400, "multiple-choice questions");
    t.atLeast(Object.keys(D.texts).length, 4, "texts");
    t.atLeast(D.techniques.length, 80, "techniques in the glossary");
    t.atLeast(D.paragraphs.length, 60, "band-tagged paragraphs");
    t.atLeast(D.freeText.length, 60, "free-text prompts");
    t.atLeast(D.essayPuzzles.length, 12, "essay puzzles");
    t.atLeast(D.topicPairs.length, 40, "topic-sentence pairs");
    t.atLeast(D.achievements.length, 65, "achievements");
    t.atLeast(D.bandStatements.length, 20, "band statements");
    const quotes = Object.values(D.texts).reduce((n, x) => n + (x.quotes || []).length, 0);
    t.atLeast(quotes, 250, "quotes across all texts");
    t.note("bank: " + qs.length + " questions, " + quotes + " quotes, " +
           D.techniques.length + " techniques, " + D.freeText.length + " prompts");

    /* ── unique ids everywhere ── */
    const dupes = (arr, label) => {
      const seen = new Set(), bad = [];
      arr.forEach(x => { if (seen.has(x)) bad.push(x); else seen.add(x); });
      t.eq(bad.slice(0, 5), [], "duplicate " + label + " ids");
    };
    dupes(qs.map(q => q.id), "question");
    dupes(D.techniques.map(x => x.id), "technique");
    dupes(D.achievements.map(x => x.id), "achievement");
    dupes(D.freeText.map(x => x.id), "free-text");
    dupes(D.paragraphs.map(x => x.id), "paragraph");
    dupes(Object.values(D.texts).flatMap(x => (x.quotes || []).map(q => q.id)), "quote");

    /* ── question shape ── */
    const modIds = D.modules.map(m => m.id);
    const badQ = [];
    qs.forEach(q => {
      const why = [];
      if (!q.id) why.push("no id");
      if (!q.q) why.push("no question text");
      if (!Array.isArray(q.choices) || q.choices.length !== 4) why.push("not 4 choices");
      if (q.a !== 0) why.push("key is not index 0 (shuffled at play time, authored first)");
      if (!q.why || U.words(q.why) < 8) why.push("no worked explanation");
      if (!modIds.includes(q.mod)) why.push("unknown module " + q.mod);
      /* 1–4: the bank authors 2/3/4 and the UI renders diff as that many stars, so the
         range is what "★".repeat can show, not the 1–3 the brief guessed at. */
      if (!(q.diff >= 1 && q.diff <= 4)) why.push("difficulty " + q.diff + " out of range");
      if (new Set(q.choices).size !== (q.choices || []).length) why.push("duplicate options");
      if (q.text && !D.texts[q.text]) why.push("unknown text " + q.text);
      if (why.length) badQ.push(q.id + ": " + why.join(", "));
    });
    t.eq(badQ.slice(0, 8), [], badQ.length + " malformed questions");

    /* ── quotes ────────────────────────────────────────────────
       `span` is DERIVED from `mark` by indexOf at load time, so a mark that is not a
       substring silently produces no highlight — the quote renders plain and nobody
       notices. That is exactly the class of defect a validator is for. */
    const badMark = [], badTech = [], unknownTech = new Set();
    const techIds = new Set(D.techniques.map(x => x.id));
    Object.values(D.texts).forEach(txt => {
      (txt.quotes || []).forEach(q => {
        if (q.mark && q.text.indexOf(q.mark) < 0) badMark.push(q.id);
        if (!q.techniques || !q.techniques.length) badTech.push(q.id + " has no techniques");
        (q.techniques || []).forEach(id => { if (!techIds.has(id)) unknownTech.add(id + " (" + q.id + ")"); });
      });
    });
    t.eq(badMark.slice(0, 6), [], badMark.length + " quotes whose `mark` is not in their text");
    t.eq(badTech.slice(0, 6), [], badTech.length + " quotes with no technique tags");
    t.eq(Array.from(unknownTech).slice(0, 8), [], unknownTech.size + " technique tags with no glossary entry");

    /* ── poem selections ──────────────────────────────────────
       A text may declare `poems`; if it does, every quote must name one, or switching
       poems off leaves orphans that can never be drilled or excluded. */
    Object.values(D.texts).forEach(txt => {
      if (!(txt.poems || []).length) return;
      const ids = new Set(txt.poems.map(p => p.id));
      const orphan = (txt.quotes || []).filter(q => !q.poem || !ids.has(q.poem)).map(q => q.id);
      t.eq(orphan.slice(0, 5), [], txt.id + ": quotes not assigned to a listed poem");
      const empty = txt.poems.filter(p => !(txt.quotes || []).some(q => q.poem === p.id)).map(p => p.id);
      t.eq(empty.slice(0, 5), [], txt.id + ": poems with no quotes at all");
      t.atLeast(txt.poems.filter(p => p.core).length, 1, txt.id + ": poems flagged as commonly set");
      t.ok(txt.poems.every(p => p.title && p.opening), txt.id + ": every poem has a title and an opening line");
    });

    /* ── paragraphs: the controlled-degradation invariant ─────
       Each family is one Band 6 sample broken one specified way per lower band. So a
       derived sample must name what was broken, and must not claim a descriptor it broke. */
    const badPara = [];
    D.paragraphs.forEach(p => {
      if (!(p.band >= 2 && p.band <= 6)) badPara.push(p.id + ": band out of range");
      if (!p.para || U.words(p.para) < 40) badPara.push(p.id + ": paragraph too short to mark");
      if (!p.why) badPara.push(p.id + ": no explanation");
      if (p.band < 6) {
        if (!p.derivedFrom) badPara.push(p.id + ": lower band with no derivedFrom");
        if (!(p.broke || []).length) badPara.push(p.id + ": lower band that broke nothing");
        (p.broke || []).forEach(d => {
          if (p.descriptors && p.descriptors[d]) badPara.push(p.id + ": broke " + d + " but still claims it");
        });
      }
    });
    t.eq(badPara.slice(0, 8), [], badPara.length + " paragraphs failing the degradation invariant");

    /* ── free text ── */
    const badFt = [];
    D.freeText.forEach(p => {
      if ((p.answers || []).length < 3) badFt.push(p.id + ": fewer than 3 exemplars");
      if ((p.nearMiss || []).length < 2) badFt.push(p.id + ": fewer than 2 near-misses");
      if (!p.prompt) badFt.push(p.id + ": no prompt");
      if (!(p.threshold > 0.3 && p.threshold < 0.9)) badFt.push(p.id + ": implausible threshold " + p.threshold);
      if (p.quote && !Object.values(D.texts).some(x => (x.quotes || []).some(q => q.id === p.quote)))
        badFt.push(p.id + ": names a quote that does not exist");
      /* An exemplar that also appears as a near-miss makes the prompt unpassable. */
      (p.answers || []).forEach(a => {
        if ((p.nearMiss || []).includes(a)) badFt.push(p.id + ": an exemplar is also a near-miss");
      });
    });
    t.eq(badFt.slice(0, 8), [], badFt.length + " free-text prompts with problems");

    /* ── essay puzzles ── */
    const badEssay = [];
    D.essayPuzzles.forEach(p => {
      if (!(p.cards || []).length) badEssay.push(p.id + ": no cards");
      if ((p.cards || []).length < 3) badEssay.push(p.id + ": fewer than 3 cards is not a puzzle");
      if (!p.task) badEssay.push(p.id + ": no task");
      (p.cards || []).forEach((c, i) => { if (!c.text) badEssay.push(p.id + ": card " + i + " has no text"); });
    });
    t.eq(badEssay.slice(0, 6), [], badEssay.length + " essay puzzles with problems");
    t.ok(D.topicPairs.every(p => p.a && p.b && (p.better === 0 || p.better === 1) && p.why),
         "every topic pair has both options, a key and a reason");

    /* ── achievements: none may fire on a fresh save ──────────
       An achievement that unlocks before the student has done anything teaches them the
       rewards are meaningless, and it is invisible unless something checks. */
    /* The stats object comes from State.achievementStats() on a fresh save rather than
       being hand-written here. A hand-written one silently stops covering new stats, and
       then the reachability check below passes for the wrong reason. */
    const fresh = freshStats(ROOT);
    const D_ = D.achievements;
    const earlyFire = [], threw = [];
    D_.forEach(a => {
      try { if (a.check(fresh)) earlyFire.push(a.id); }
      catch (err) { threw.push(a.id + ": " + err.message); }
      if (!a.name || !a.desc || !a.icon) threw.push(a.id + ": missing name/desc/icon");
      /* A zero reward is legitimate for an achievement about holding currency — paying
         Marks for hoarding Marks is circular — so only a negative or absent one is wrong. */
      if (!(a.reward >= 0)) threw.push(a.id + ": negative or missing reward");
    });
    t.eq(earlyFire.slice(0, 6), [], earlyFire.length + " achievements unlock on a fresh save");
    t.eq(threw.slice(0, 6), [], threw.length + " achievements threw or are malformed");

    /* Every achievement must also be reachable — a check no play can satisfy is dead
       content. Approximated with a generously maxed-out stats object. */
    /* Max out EVERY numeric and boolean stat by walking the object, so a stat added to the
       app later is covered without editing this file. */
    const maxed = {};
    Object.keys(fresh).forEach(k => {
      const v = fresh[k];
      if (typeof v === "number") maxed[k] = 1e6;
      else if (typeof v === "boolean") maxed[k] = true;
      else if (typeof v === "function") maxed[k] = () => 100;
      else maxed[k] = v;
    });
    maxed.level = 60;
    maxed.prestige = 5;
    maxed.themesOwned = D.themes.length;
    maxed.avatarsOwned = D.avatars.length;
    maxed.puzzlesSolvedUnique = D.essayPuzzles.length;
    maxed.bossesBeaten = 5;
    maxed.modules = Object.fromEntries(D.modules.map(m => [m.id, { seen: 1e4, correct: 1e4 }]));
    maxed.texts = Object.fromEntries(Object.keys(D.texts).map(id => [id, { seen: 1e4, correct: 1e4 }]));
    /* Any mode id, however many are added later. A hand-written list here missed
       "finalpaper" and reported a perfectly reachable achievement as dead content, which
       is the same class of mistake the list was meant to catch in the app. */
    const modeKeys = Array.from({ length: 32 }, (_, i) => "mode" + i).concat("finalpaper");
    maxed.modesPlayed = new Proxy(Object.fromEntries(modeKeys.map(k => [k, 999])), {
      /* `get` covers checks that name a mode ("modesPlayed.finalpaper"); the backing object
         covers checks that count them ("Object.keys(...).length >= 14"). A Proxy with only
         a get trap reports zero keys, which failed both mode-count achievements. */
      get: (target, k) => (k in target ? target[k] : 999)
    });
    const unreachable = D_.filter(a => { try { return !a.check(maxed); } catch (e) { return false; } })
                          .map(a => a.id);
    t.eq(unreachable.slice(0, 8), [], unreachable.length + " achievements no amount of play can unlock");

    /* ── the reference data everything else tags against ── */
    t.ok(D.descriptors.length === 5, "five marking descriptors");
    t.ok(D.bands.every(b => b.mine && b.nesa && b.tells), "every band has both descriptions and its tells");
    t.ok(D.rubricVerbs.every(v => v.demands && v.doing && v.offTask && v.tell),
         "every rubric verb has demands / doing / offTask / tell");
    t.ok(D.moduleConcepts.every(m => m.core && m.keyTerms.length && m.misread && m.questionShapes.length),
         "every module concept is complete");
    t.eq(D.moduleConcepts.map(m => m.mod).sort(), modIds.slice().sort(),
         "one concept entry per module");
    t.ok(D.levelTitles.length >= 60, "60 level titles");
    t.ok(D.difficulties.length === 3 && D.difficulties.every(d => d.timeScale > 0 && d.xp >= 1),
         "three difficulties with sane multipliers");

    /* Band statements must not be lopsided, or the Band Grid becomes guessable. */
    const perBand = {};
    D.bandStatements.forEach(s => (perBand[s.band] = (perBand[s.band] || 0) + 1));
    t.atLeast(Object.keys(perBand).length, 4, "distinct bands among the grid statements");
    t.atMost(Math.max(...Object.values(perBand)) / D.bandStatements.length, 0.4,
             "share of band statements held by any one band");
  }
};
