/* Small DOM + text helpers. Everything hangs off window.EN. */
window.EN = window.EN || {};

EN.U = (function () {
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Create an element. `attrs.html` sets innerHTML, `attrs.on` binds listeners. */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k === "on") for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
        else if (k === "data") for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
        else if (v === true) node.setAttribute(k, "");
        else node.setAttribute(k, v);
      }
    }
    for (const c of [].concat(children || [])) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Take up to n random items without repeats. */
  const sample = (arr, n) => shuffle(arr).slice(0, n);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ── text rendering primitives (§6.3) ──────────────────────
     Every one of these escapes first and inserts markup second. Quotes are full of
     apostrophes, em dashes and the occasional angle bracket, and a study app with an
     XSS hole is still an XSS hole. */

  /**
   * Wrap a character range of `text` in <mark>. `span` is [start, end) in the
   * ORIGINAL string's coordinates, which is why the escape happens per-piece:
   * escaping first would shift every index right of an apostrophe.
   */
  function highlight(text, span) {
    const s = String(text);
    if (!span || span.length !== 2) return escapeHtml(s);
    const a = clamp(span[0], 0, s.length);
    const b = clamp(span[1], a, s.length);
    return escapeHtml(s.slice(0, a)) +
           "<mark>" + escapeHtml(s.slice(a, b)) + "</mark>" +
           escapeHtml(s.slice(b));
  }

  /**
   * Where a quote comes from, in the parts a citation is made of.
   *
   * Quotes used to be captioned "speaker · locus" and nothing else, so a line could appear
   * in a game reading "Part 2, Ch. 7 — Winston" with no indication of which book it was
   * from. Every quote in the bank has a locus, a speaker and a composer, so there was never
   * a reason not to say.
   *
   * `work` is the POEM rather than the volume where there is one: Donne ships as a
   * 54-poem selection called "The Metaphysical Poetry of John Donne", and the work a
   * student cites is "The Sun Rising". The poem's title is usually the start of the
   * authored locus, so it is stripped from the locus when promoted, or the citation reads
   * "The Sun Rising — The Sun Rising, ll. 1–3".
   */
  /** Is this "speaker" a voice note rather than somebody to attribute a line to?
      Shared, because Quote Match's quote→speaker round must not offer "speaker" as one of
      the answers either — all 93 Donne quotes carry it. */
  const GENERIC_SPEAKER = /^(speaker|narrator|stage direction|model sentence|persona|voice|chorus)$/i;
  const genericSpeaker = s2 => GENERIC_SPEAKER.test(String(s2 || "").trim());

  function cite(q) {
    const t = (window.EN && EN.DATA && EN.DATA.texts) ? EN.DATA.texts[q.textId] : null;
    let work = q.textTitle || (t && t.title) || "";
    let locus = q.locus || "";
    if (q.poem && t && t.poems) {
      const pm = t.poems.find(p => p.id === q.poem);
      if (pm && pm.title) {
        work = pm.title;
        if (locus.indexOf(pm.title + ", ") === 0) locus = locus.slice(pm.title.length + 2);
        else if (locus === pm.title) locus = "";
      }
    }
    /* A bare voice note is not somebody to attribute a line to. All 93 Donne quotes carry
       the literal speaker "speaker", which as a citation reads "ll. 1–2 — speaker". The
       qualified ones are kept, because "narrator (Winston's thought)" tells a student it is
       free indirect discourse, which is exactly the sort of thing they should cite. */
    const speaker = genericSpeaker(q.speaker) ? "" : (q.speaker || "");
    return { work, composer: q.composer || (t && t.composer) || "", locus, speaker,
             collection: (t && t.poems && t.poems.length) ? (q.textTitle || t.title) : "" };
  }

  /**
   * The same thing as one line, for exports and the clipboard.
   * `opts.speaker === false` leaves the speaker out — Quote Match's quote→speaker round
   * asks you to name the speaker, and a citation that includes it prints the answer on the
   * card. Attribution must not become a giveaway.
   */
  function citeLine(q, opts) {
    const c = cite(q);
    const head = [c.work, c.composer].filter(Boolean).join(", ");
    const showSpeaker = !opts || opts.speaker !== false;
    const tail = [c.locus, showSpeaker ? c.speaker : ""].filter(Boolean).join(" — ");
    return [head, tail].filter(Boolean).join(", ");
  }

  /**
   * Render a quote as a block quote with its full attribution, optionally highlighting
   * `span`. Pass `work:false` where the page heading already names the work — a quote
   * sheet for one text does not need its title under all sixty quotes.
   */
  function quoteBlock(q, opts) {
    const o = opts || {};
    const span = o.span === null ? null : (o.span || q.span);
    const c = cite(q);
    const lines = [];
    if (o.work !== false && (c.work || c.composer)) {
      lines.push(el("span", { class: "bq-work",
        text: [c.work, c.composer].filter(Boolean).join(" · ") }));
    }
    const tail = [c.locus, c.speaker].filter(Boolean).join(" — ");
    if (tail) lines.push(el("span", { class: "bq-loc", text: tail }));
    return el("figure", { class: "bq" + (o.small ? " bq-sm" : "") }, [
      el("blockquote", { html: highlight(q.text, span) }),
      lines.length ? el("figcaption", {}, lines) : null
    ]);
  }

  /**
   * Line-numbered verse for poetry and drama extracts, because in a Donne sonnet or
   * a Shakespeare speech the line number IS the locus and students cite it.
   * `lines` is an array of strings; `from` is the real first line number.
   */
  function verse(lines, opts) {
    const o = opts || {};
    const from = o.from || 1;
    const markLine = o.markLine;              // 0-based index to emphasise
    return el("div", { class: "verse" }, lines.map((line, i) =>
      el("div", { class: "vline" + (markLine === i ? " on" : "") }, [
        el("span", { class: "vnum", text: String(from + i) }),
        el("span", { class: "vtext", html: o.span && markLine === i ? highlight(line, o.span) : escapeHtml(line) })
      ])
    ));
  }

  const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;

  /* ── normalisation, for Layer B (§6.5.6) ───────────────────
     Never used on sentences — see §0.1. Single words and short names only. */

  /* British ⇄ American, plus the handful of spellings HSC students actually vary on.
     Applied both ways by normalising everything to the -ise/-our British forms, which
     is what NESA marking uses. */
  const SPELLING = [
    [/([a-z])ization\b/g, "$1isation"], [/([a-z])izing\b/g, "$1ising"],
    [/([a-z])ized\b/g, "$1ised"],       [/([a-z])izes\b/g, "$1ises"],
    [/([a-z])ize\b/g, "$1ise"],
    [/\bcolor/g, "colour"], [/\bhonor/g, "honour"], [/\bbehavior/g, "behaviour"],
    [/\bfavor/g, "favour"], [/\bhumor/g, "humour"], [/\brumor/g, "rumour"],
    [/\bcenter/g, "centre"], [/\btheater/g, "theatre"], [/\bmeter\b/g, "metre"],
    [/\bdefense/g, "defence"], [/\boffense/g, "offence"], [/\bpretense/g, "pretence"],
    [/\bpracticing/g, "practising"], [/\bpracticed/g, "practised"],
    [/\banalyze/g, "analyse"], [/\bcatalog\b/g, "catalogue"], [/\bdialog\b/g, "dialogue"],
    [/\bjudgment/g, "judgement"], [/\bfulfill/g, "fulfil"], [/\bskillful/g, "skilful"],
    [/\bmarvelous/g, "marvellous"], [/\btraveled/g, "travelled"], [/\btraveling/g, "travelling"]
  ];

  /** Lowercase, strip diacritics and punctuation, collapse whitespace, unify spellings. */
  function normalise(s) {
    let t = String(s)
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      // Smart quotes and dashes first, so they don't survive as stray characters.
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„]/g, '"')
      .replace(/[‐-―]/g, "-")
      .replace(/[^a-z0-9'\- ]+/g, " ")
      .replace(/[\-']/g, "")
      .replace(/\s+/g, " ")
      .trim();
    for (const [re, to] of SPELLING) t = t.replace(re, to);
    return t;
  }

  /** Classic Levenshtein distance, two-row variant. */
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = new Array(b.length + 1);
    let cur  = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[b.length];
  }

  /** 1 for identical, 0 for nothing in common. */
  function similarity(a, b) {
    const x = normalise(a), y = normalise(b);
    if (!x && !y) return 1;
    const longest = Math.max(x.length, y.length);
    return longest ? 1 - levenshtein(x, y) / longest : 0;
  }

  /* ── dates ─────────────────────────────────────────────────── */

  /** Local date key (YYYY-MM-DD) — deliberately local, not UTC, so streaks match the user's day. */
  function dayKey(d) {
    const t = d || new Date();
    const p = n => String(n).padStart(2, "0");
    return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
  }

  function daysBetween(aKey, bKey) {
    const a = new Date(aKey + "T00:00:00");
    const b = new Date(bKey + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  /** Deterministic hash → used to pick a stable "daily" challenge from a date key. */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  /** Seeded PRNG so the daily challenge is identical all day. */
  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function seededShuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  /* ── U.cloze — the procedural quote-recall generator (§6.4) ──
     English's answer to chemistry's numeric problem generator: infinite, deterministic,
     and it drills the thing HSC students most reliably drop marks for. */

  /* Never deleted. Blanking "the" teaches nothing and reads as a bug. */
  const FUNCTION_WORDS = new Set(("a an the and or but nor for yet so of to in on at by with from as " +
    "is are was were be been being am do does did have has had will would shall should may might " +
    "must can could this that these those it its his her their our your my me him them us we you i " +
    "not no if then than there here when while what which who whom whose how why all any both each " +
    "into onto upon out up down over under again very too also just only even more most such").split(" "));

  /** Split a quote into tokens, keeping each word's character offsets. */
  function tokenise(text) {
    const out = [];
    const re = /[A-Za-z’']+/g;
    let m;
    while ((m = re.exec(text)) !== null) out.push({ word: m[0], at: m.index, end: m.index + m[0].length });
    return out;
  }

  /* Obvious inflections and spelling variants are accepted so the student isn't punished
     for typing "realise" or a plural. Layer B does the rest of the forgiving (§6.5.6). */
  function inflections(word) {
    const w = word.toLowerCase();
    const alts = new Set([w]);
    if (w.endsWith("s")) alts.add(w.slice(0, -1));
    else alts.add(w + "s");
    if (w.endsWith("ise")) alts.add(w.slice(0, -3) + "ize");
    if (w.endsWith("ize")) alts.add(w.slice(0, -3) + "ise");
    if (w.endsWith("y")) alts.add(w.slice(0, -1) + "ies");
    if (w.endsWith("ed")) alts.add(w.slice(0, -2));
    if (w.endsWith("’")) alts.add(w.replace(/’/g, "'"));
    alts.add(w.replace(/’/g, "'"));
    return Array.from(alts);
  }

  /**
   * Delete words from a quote, biased towards the load-bearing ones.
   *
   * Which words are load-bearing is decided FIRST — those inside the quote's `span`,
   * then the longest content words — and the gaps are chosen from that set (§9.9). The
   * alternative, deleting at random and hoping the gap means something, produces
   * puzzles that test whether you remember an adverb.
   *
   * Seeded from the quote id and the Leitner box, so a given card at a given box always
   * produces the SAME gaps. Re-randomising every visit means re-learning a new puzzle
   * each time instead of consolidating one quote.
   *
   * Difficulty contract (§9.10): `rate` is the fraction of *content* words deleted,
   * clamped to [1, ceil(content × 0.6)] blanks; function words are never chosen; the
   * words inside `span` are always chosen before any word outside it.
   *
   * → { display, blanks:[{ i, word, alts, at, end }], contentCount }
   */
  function cloze(quote, opts) {
    const o = opts || {};
    const text = String(quote.text || quote);
    const toks = tokenise(text);
    const span = quote.span;

    const inSpan = t => span && t.at >= span[0] && t.end <= span[1];
    const isContent = t => !FUNCTION_WORDS.has(t.word.toLowerCase()) && t.word.length > 2;

    const content = toks.filter(isContent);
    if (!content.length) return { display: text, blanks: [], contentCount: 0 };

    const rate = clamp(o.rate === undefined ? 0.3 : o.rate, 0.05, 0.6);
    const want = clamp(Math.round(content.length * rate), 1, Math.ceil(content.length * 0.6));

    const rng = seededRandom(hash((quote.id || text) + "|" + (o.seed === undefined ? 0 : o.seed)));

    /* Rank once, then take the top `want`. Span words first, then longer words before
       shorter ones, with a small seeded jitter so two equally-weighted words don't
       always resolve the same way. */
    const ranked = seededShuffle(content, rng)
      .map(t => ({ t, w: (inSpan(t) ? 100 : 0) + t.word.length + rng() * 3 }))
      .sort((a, b) => b.w - a.w)
      .slice(0, want)
      .map(x => x.t)
      .sort((a, b) => a.at - b.at);

    let display = "";
    let cursor = 0;
    const blanks = ranked.map((t, i) => {
      display += text.slice(cursor, t.at) + "␣".repeat(1) + "{" + i + "}";
      cursor = t.end;
      return { i, word: t.word, alts: inflections(t.word).concat(quote.alts && quote.alts[t.word] || []),
               at: t.at, end: t.end, inSpan: !!inSpan(t) };
    });
    display += text.slice(cursor);

    return { display, blanks, contentCount: content.length };
  }

  return { $, $$, el, clamp, randInt, pick, shuffle, sample, escapeHtml,
           highlight, quoteBlock, cite, citeLine, genericSpeaker, verse, words,
           normalise, levenshtein, similarity, tokenise, cloze, FUNCTION_WORDS,
           dayKey, daysBetween, hash, seededRandom, seededShuffle, fmtTime, pct };
})();
