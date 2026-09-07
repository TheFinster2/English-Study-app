/* Content aggregation, text filtering and the adaptive draw. */
window.EN = window.EN || {};

EN.Bank = (function () {
  const U = EN.U;

  /* Every EN.DATA key named like a question bank is picked up automatically.
     DISCOVERED, never listed: the bank is spread over a dozen files, and an explicit
     list is one forgotten line away from silently dropping a few hundred questions.
     The reference app lost 87 flashcards exactly this way — a data file that sorted
     alphabetically BEFORE the file declaring the array appended to nothing. Every
     aggregate in here is discovered by pattern, and validate.js asserts the totals. */
  function discover(pattern, looksRight) {
    const D = EN.DATA;
    return Object.keys(D)
      .filter(k => pattern.test(k) && Array.isArray(D[k]) && D[k].length && looksRight(D[k][0]))
      .sort()
      .reduce((acc, k) => acc.concat(D[k]), []);
  }

  let ALL = null, INDEX = null;
  function all() {
    if (!ALL) {
      ALL = discover(/^q[A-Z0-9]/, x => Array.isArray(x.choices));
      INDEX = new Map(ALL.map(q => [q.id, q]));
    }
    return ALL;
  }
  const byId = id => { all(); return INDEX.get(id); };

  const MODULES = () => EN.DATA.modules;
  const moduleName  = id => (EN.DATA.modules.find(m => m.id === id) || {}).short || id;
  const moduleLabel = id => (EN.DATA.modules.find(m => m.id === id) || {}).code  || id;

  /* ── texts ────────────────────────────────────────────────── */

  /** The text ids in the student's manifest, flattened. Module A contributes two.
      Read through State so the in-app picker works; EN.DATA.activeTexts is the default
      it falls back to. */
  function activeTextIds() {
    const a = EN.State.activeTexts();
    return [a.common].concat(a.moduleA || [], [a.moduleB, a.moduleC])
      .filter(Boolean)
      .filter(id => EN.DATA.texts[id]);
  }

  const activeTexts = () => activeTextIds().map(id => EN.DATA.texts[id]);
  const text = id => EN.DATA.texts[id];
  const allTexts = () => Object.keys(EN.DATA.texts).sort().map(id => EN.DATA.texts[id]);

  /** Which module slot a text currently occupies, or null if it is not active. */
  function slotOf(textId) {
    const a = EN.State.activeTexts();
    if (a.common === textId) return "common";
    if ((a.moduleA || []).includes(textId)) return "moduleA";
    if (a.moduleB === textId) return "moduleB";
    if (a.moduleC === textId) return "moduleC";
    return null;
  }

  /* ── quotes ───────────────────────────────────────────────────
     Flattened out of the text files, with `span` DERIVED from `mark` rather than
     authored as a pair of offsets. Hand-counted offsets drift silently the first time
     a quote gets a comma edited, and a highlight in the wrong place is worse than no
     highlight — so it is recomputed here every load and asserted by the validator. */
  let QUOTES = null;
  function quotes() {
    if (!QUOTES) {
      QUOTES = [];
      for (const id of activeTextIds()) {
        const t = EN.DATA.texts[id];
        /* A poem the student is not studying contributes nothing to the Vault, the
           adaptive draw or any game — Donne is fifty-four poems and no course does all
           of them, so an unfiltered pool would drill quotes they have never read. */
        for (const q of (t.quotes || [])) {
          if (EN.State.poemEnabled(t.id, q.poem)) QUOTES.push(withSpan(q, t));
        }
      }
    }
    return QUOTES;
  }

  /** Every quote in every shipped text, active or not — for the reference screens. */
  let ALL_QUOTES = null;
  function allQuotes() {
    if (!ALL_QUOTES) {
      ALL_QUOTES = [];
      for (const t of allTexts()) for (const q of (t.quotes || [])) ALL_QUOTES.push(withSpan(q, t));
    }
    return ALL_QUOTES;
  }

  function withSpan(q, t) {
    const out = Object.assign({}, q, { textId: t.id, textTitle: t.title, composer: t.composer, mod: slotOf(t.id) || (t.modules || [])[0] });
    if (q.span) { out.span = q.span; return out; }
    if (q.mark) {
      const at = q.text.indexOf(q.mark);
      out.span = at >= 0 ? [at, at + q.mark.length] : null;
    } else out.span = null;
    return out;
  }

  let QUOTE_INDEX = null;

  /** Drop every memoised pool. Called whenever the manifest or poem selection changes —
      without it the picker appears to do nothing until the next reload. */
  function invalidate() {
    QUOTES = null;
    ALL_QUOTES = null;
    QUOTE_INDEX = null;
  }

  function quoteById(id) {
    if (!QUOTE_INDEX) QUOTE_INDEX = new Map(allQuotes().map(q => [q.id, q]));
    return QUOTE_INDEX.get(id);
  }

  /** Quotes filtered by text, module, technique or concept. */
  function filterQuotes(opts) {
    const o = opts || {};
    let pool = o.includeInactive ? allQuotes() : quotes();
    if (o.texts && o.texts.length) pool = pool.filter(q => o.texts.includes(q.textId));
    if (o.mods && o.mods.length) pool = pool.filter(q => o.mods.includes(q.mod));
    if (o.technique) pool = pool.filter(q => (q.techniques || []).includes(o.technique));
    if (o.concept) pool = pool.filter(q => (q.concepts || []).includes(o.concept));
    if (o.withSpan) pool = pool.filter(q => q.span);
    return pool;
  }

  /* ── techniques ───────────────────────────────────────────── */
  const techniques = () => EN.DATA.techniques;
  let TECH_INDEX = null;
  function technique(id) {
    if (!TECH_INDEX) TECH_INDEX = new Map(EN.DATA.techniques.map(t => [t.id, t]));
    return TECH_INDEX.get(id);
  }
  const techniqueName = id => (technique(id) || {}).name || id;

  /** Every accepted spelling for a technique, for Layer B. */
  function techniqueAlts(id) {
    const t = technique(id);
    if (!t) return [id];
    return [t.name, t.id.replace(/-/g, " ")].concat(t.alts || []);
  }

  /* ── other discovered banks ───────────────────────────────── */
  let PARAS = null, FREE = null, PUZZLES = null, PAIRS = null;
  const paragraphs = () => PARAS || (PARAS = discover(/^paragraphs/, x => x.band !== undefined && x.para));
  const freeText   = () => FREE  || (FREE  = discover(/^freeText/,   x => Array.isArray(x.answers)));
  const puzzles    = () => PUZZLES || (PUZZLES = discover(/^essayPuzzles/, x => Array.isArray(x.cards)));
  const topicPairs = () => PAIRS || (PAIRS = discover(/^topicPairs/, x => x.better !== undefined));

  const paragraphById = id => paragraphs().find(p => p.id === id);

  /** Marking Desk samples restricted to the student's texts (plus text-agnostic ones). */
  function activeParagraphs() {
    const ids = activeTextIds();
    return paragraphs().filter(p => !p.text || ids.includes(p.text));
  }

  /** Layer C prompts restricted to the student's texts. */
  function activeFreeText() {
    const ids = activeTextIds();
    return freeText().filter(p => !p.text || ids.includes(p.text));
  }

  /* ── question filtering and the adaptive draw ──────────────── */

  function filter(opts) {
    const o = opts || {};
    let pool = all();
    /* Default: only questions about texts the student actually studies. A question
       about a text they have never opened is worse than no question. */
    if (o.anyText !== true) {
      const ids = activeTextIds();
      pool = pool.filter(q => !q.text || ids.includes(q.text));
    }
    if (o.mods && o.mods.length) pool = pool.filter(q => o.mods.includes(q.mod));
    if (o.texts && o.texts.length) pool = pool.filter(q => o.texts.includes(q.text));
    if (o.topic) pool = pool.filter(q => q.topic === o.topic);
    if (o.topics && o.topics.length) pool = pool.filter(q => o.topics.includes(q.topic));
    if (o.maxDiff) pool = pool.filter(q => q.diff <= o.maxDiff);
    if (o.minDiff) pool = pool.filter(q => q.diff >= o.minDiff);
    if (o.exclude && o.exclude.length) pool = pool.filter(q => !o.exclude.includes(q.id));
    return pool;
  }

  const TOPICS = ["Techniques", "Context", "Module concepts", "Rubric verbs",
                  "Form and structure", "Characters", "Quotes", "Craft"];

  /** Weight a question: mistakes first, then weak modules AND weak texts. */
  function weightFor(q, mistakeIds, moduleAcc, textAcc) {
    let w = 1;
    if (mistakeIds.has(q.id)) w += 3.5;
    const ma = moduleAcc[q.mod];
    if (ma !== undefined && ma < 0.7) w += (0.7 - ma) * 4;
    const ta = q.text && textAcc[q.text];
    if (ta !== undefined && ta < 0.7) w += (0.7 - ta) * 4;
    return w;
  }

  /**
   * Draw n questions with choices shuffled and `a` remapped.
   * opts: { mods, texts, topic, maxDiff, minDiff, adaptive (default true),
   *         shuffleChoices (default true), exclude }
   */
  function draw(n, opts) {
    const o = opts || {};
    let pool = filter(o);
    if (!pool.length) pool = filter(Object.assign({}, o, { mods: null, texts: null, topic: null, topics: null }));
    if (!pool.length) pool = all();

    let chosen;
    if (o.adaptive === false) {
      chosen = U.sample(pool, n);
    } else {
      const st = EN.State.data;
      const mistakeIds = new Set((st.mistakes || []).map(m => m.id));
      const moduleAcc = {}, textAcc = {};
      for (const [k, v] of Object.entries(st.modules || {})) if (v.seen >= 4) moduleAcc[k] = v.correct / v.seen;
      for (const [k, v] of Object.entries(st.texts || {}))   if (v.seen >= 4) textAcc[k]   = v.correct / v.seen;
      const bag = pool.map(q => ({ q, w: weightFor(q, mistakeIds, moduleAcc, textAcc) * (0.5 + Math.random()) }));
      bag.sort((a, b) => b.w - a.w);
      chosen = U.shuffle(bag.slice(0, n).map(x => x.q));
    }
    return chosen.map(q => o.shuffleChoices === false ? clone(q) : shuffleChoices(q));
  }

  const clone = q => Object.assign({}, q, { choices: q.choices.slice() });

  /** Shuffle the options so the answer isn't always in slot A. */
  function shuffleChoices(q) {
    const pairs = q.choices.map((t, i) => ({ t, correct: i === q.a }));
    const mixed = U.shuffle(pairs);
    return Object.assign({}, q, {
      choices: mixed.map(p => p.t),
      a: mixed.findIndex(p => p.correct)
    });
  }

  function mistakeQuestions() {
    return (EN.State.data.mistakes || []).map(m => byId(m.id)).filter(Boolean).map(shuffleChoices);
  }

  /* ── stats ────────────────────────────────────────────────── */
  function statsByModule() {
    const st = EN.State.data;
    return EN.DATA.modules.map(m => {
      const rec = st.modules[m.id] || { seen: 0, correct: 0 };
      return { id: m.id, name: m.name, short: m.short, code: m.code, icon: m.icon,
               seen: rec.seen, correct: rec.correct,
               total: all().filter(q => q.mod === m.id).length,
               mastery: EN.State.mastery(m.id),
               accuracy: U.pct(rec.correct, rec.seen) };
    });
  }

  /* The skill axis. Bank topics plus the ones the non-MCQ modes contribute, because a
     breakdown that covered only multiple choice would say nothing about the Marking Desk
     or the Essay Architect — which is where a student's marks actually come from. */
  /* These three come from modes rather than from multiple choice, so there is no MCQ pool
     to drill: aiming /game/drill at one would filter to nothing, fall back to the whole
     bank, and run under a title claiming to be about bands. Each points at the mode that
     actually trains it instead. */
  const EXTRA_TOPICS = ["Bands", "Essay structure", "Question analysis"];
  const TOPIC_MODE = { "Bands": "/game/bandgrid",
                       "Essay structure": "/game/essay",
                       "Question analysis": "/game/deconstruct" };

  /** Where "practise this skill" should send a student. */
  const topicRoute = name =>
    TOPIC_MODE[name] || ("/game/drill/" + topicSlug(name));
  const topicSlug = t => "topic-" + String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  function topicFromSlug(slug) {
    return allTopics().find(t => topicSlug(t) === slug) || null;
  }
  const allTopics = () => TOPICS.concat(EXTRA_TOPICS);

  function statsByTopic() {
    const st = EN.State.data;
    return allTopics().map(name => {
      const rec = (st.topics || {})[name] || { seen: 0, correct: 0 };
      return { name, slug: topicSlug(name), route: topicRoute(name),
               seen: rec.seen, correct: rec.correct,
               inBank: all().filter(q => q.topic === name).length,
               mastery: EN.State.topicMastery(name),
               accuracy: U.pct(rec.correct, rec.seen) };
    }).filter(t => t.inBank > 0 || t.seen > 0);
  }

  function statsByText() {
    const st = EN.State.data;
    return activeTexts().map(t => {
      const rec = st.texts[t.id] || { seen: 0, correct: 0 };
      return { id: t.id, title: t.title, composer: t.composer, slot: slotOf(t.id),
               seen: rec.seen, correct: rec.correct,
               total: all().filter(q => q.text === t.id).length,
               quotes: (t.quotes || []).length,
               mastery: EN.State.textMastery(t.id),
               accuracy: U.pct(rec.correct, rec.seen) };
    });
  }

  return { all, byId, discover, invalidate,
           MODULES, moduleName, moduleLabel,
           activeTexts, activeTextIds, allTexts, text, slotOf,
           quotes, allQuotes, quoteById, filterQuotes,
           techniques, technique, techniqueName, techniqueAlts,
           TOPICS, allTopics, topicSlug, topicFromSlug, topicRoute, statsByTopic,
           paragraphs, activeParagraphs, paragraphById,
           freeText, activeFreeText, puzzles, topicPairs,
           filter, draw, shuffleChoices, mistakeQuestions,
           statsByModule, statsByText };
})();
