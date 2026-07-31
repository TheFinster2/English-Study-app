/* ============================================================================
   THE MARKING STACK — every typed answer in the app goes through here.

   Three layers, in increasing order of softness:

     A  Structural   `===` on a determinate answer. Choices, orderings, matches.
                     The backbone; most of the app.
     B  Fuzzy string Normalised Levenshtein at 0.85, on SINGLE WORDS AND SHORT
                     NAMES ONLY. This is spellcheck, not marking.
     C  Embeddings   Bundled MiniLM, cosine similarity, entirely in-browser.
                     Short analytical claims only — one or two sentences.

   Two rules the rest of the app depends on:

   1. Layer B is never given a sentence. Levenshtein and Jaccard measure surface
      form, so on prose they reward reusing the model answer's words — which is
      exactly the word-for-word marking this app exists not to do. Two excellent
      analytical sentences can share no vocabulary at all. Sentences go to Layer C
      or to a structural mode; there is no third path.

   2. `"unavailable"` is a first-class verdict, not an error. Layer C cannot run
      from file:// (WASM and workers are CORS-blocked there) and cannot run before
      the model has been downloaded. Callers show the exemplars, award nothing, and
      say so plainly.

   No network request is ever made. The runtime and the weights are vendored into
   the repo; transformers.js is explicitly configured not to phone home, and
   tests/offline.js fails the build if anything reaches outward.
   ============================================================================ */
window.EN = window.EN || {};

EN.Mark = (function () {
  const U = EN.U;

  /* ── Layer A: structural ─────────────────────────────────────
     Here for completeness, so that "all marking lives in mark.js" is literally
     true and a game mode never grows its own private comparison. */

  const exact = (a, b) => a === b;

  /** Compare two orderings element-wise. Used by the Essay Architect. */
  function ordering(got, want) {
    if (!Array.isArray(got) || !Array.isArray(want) || got.length !== want.length) {
      return { ok: false, rightPlaces: 0, total: want ? want.length : 0 };
    }
    let right = 0;
    for (let i = 0; i < want.length; i++) if (got[i] === want[i]) right++;
    return { ok: right === want.length, rightPlaces: right, total: want.length };
  }

  /* ── Layer B: fuzzy, precisely scoped (§6.5.6) ───────────────── */

  const FUZZY_THRESHOLD = 0.85;
  /* A hard ceiling on input length, because the whole failure mode this layer has to
     avoid is being handed prose. Six words covers every legitimate customer —
     a cloze blank, "free indirect discourse", "Sonnets from the Portuguese". */
  const FUZZY_MAX_WORDS = 6;

  /**
   * Accept a short answer that is spelled slightly wrong.
   * `alts` is the authored list of acceptable forms.
   * → { ok, matched, ratio, reason }
   */
  function fuzzy(input, alts) {
    const raw = String(input == null ? "" : input);
    const norm = U.normalise(raw);
    if (!norm) return { ok: false, matched: null, ratio: 0, reason: "empty" };

    if (U.words(norm) > FUZZY_MAX_WORDS) {
      /* Loud on purpose. Reaching this branch means a caller is trying to mark prose
         with string distance, which is the mistake this layer is scoped to avoid. */
      console.warn("Mark.fuzzy was given a sentence. Sentences go to Layer C.", raw);
      return { ok: false, matched: null, ratio: 0, reason: "scope" };
    }

    let best = { ok: false, matched: null, ratio: 0, reason: "no" };
    for (const alt of [].concat(alts || [])) {
      const ratio = U.similarity(norm, alt);
      if (ratio > best.ratio) best = { ok: ratio >= FUZZY_THRESHOLD, matched: alt, ratio, reason: "levenshtein" };
      if (best.ratio === 1) break;
    }
    return best;
  }

  /* ── Layer C: sentence embeddings ─────────────────────────────
     transformers.js + all-MiniLM-L6-v2 (int8, 384-dim), both vendored. */

  const MODEL_DIR   = "minilm";
  const MODEL_FILES = [
    "models/minilm/config.json",
    "models/minilm/tokenizer.json",
    "models/minilm/tokenizer_config.json",
    "models/minilm/special_tokens_map.json",
    "models/minilm/onnx/model_quantized.onnx"
  ];
  /* Its own bucket, versioned separately from the app cache. An app-version bump must
     not cost the student another 23 MB — see sw.js, which excludes this from the
     activate-time sweep, and §6.5.5. */
  const MODEL_CACHE = "closereading-model-v1";
  const MODEL_BYTES = 24406000;      // measured total, for the progress bar

  let extractor = null;              // the loaded pipeline
  let loading = null;                // in-flight load promise
  let progress = { state: "idle", received: 0, total: MODEL_BYTES, file: null, error: null };
  const cache = new Map();           // text → Float32Array, per session

  /** Why Layer C can't run here, or null if it can. */
  function blockedReason() {
    if (location.protocol === "file:") return "file";
    if (typeof WebAssembly === "undefined") return "wasm";
    if (!window.fetch || !window.caches) return "platform";
    return null;
  }

  const available = () => blockedReason() === null;
  const ready = () => extractor !== null;
  const downloadProgress = () => Object.assign({}, progress);

  /** Has the model already been fetched into its cache bucket? */
  async function isDownloaded() {
    if (!available()) return false;
    try {
      const c = await caches.open(MODEL_CACHE);
      for (const f of MODEL_FILES) if (!(await c.match(rel(f)))) return false;
      return true;
    } catch (e) { return false; }
  }

  /* Resolved against the document's base, so the app works from a GitHub Pages subpath
     and from a home-screen install without any server config. `baseURI` rather than
     `location.href` because the hash router changes the latter and a <base> should win. */
  const rel = path => new URL(path, document.baseURI).toString();

  /**
   * Fetch the model into its cache bucket, reporting real progress.
   * Files already present are skipped, so an interrupted download resumes rather
   * than starting the 23 MB again.
   */
  async function downloadModel(onProgress) {
    if (!available()) {
      progress = { state: "blocked", received: 0, total: MODEL_BYTES, file: null, error: blockedReason() };
      return false;
    }
    if (progress.state === "downloading") return false;

    const c = await caches.open(MODEL_CACHE);
    progress = { state: "downloading", received: 0, total: MODEL_BYTES, file: null, error: null };
    const tick = () => onProgress && onProgress(downloadProgress());
    tick();

    try {
      for (const f of MODEL_FILES) {
        const url = rel(f);
        const already = await c.match(url);
        if (already) {
          const buf = await already.clone().arrayBuffer();
          progress.received += buf.byteLength;
          tick();
          continue;
        }
        progress.file = f.split("/").pop();
        tick();

        const res = await fetch(url, { cache: "reload" });
        if (!res.ok) throw new Error(f + " → HTTP " + res.status);

        /* Streamed so the bar moves during the 23 MB file rather than jumping at the
           end. The body is reassembled and cached as one response. */
        const chunks = [];
        const reader = res.clone().body && res.clone().body.getReader();
        if (reader) {
          const r = res.body.getReader();
          for (;;) {
            const { done, value } = await r.read();
            if (done) break;
            chunks.push(value);
            progress.received += value.byteLength;
            tick();
          }
          const blob = new Blob(chunks);
          await c.put(url, new Response(blob, { headers: res.headers }));
        } else {
          const buf = await res.arrayBuffer();
          progress.received += buf.byteLength;
          await c.put(url, new Response(buf, { headers: res.headers }));
          tick();
        }
      }
      progress.state = "done";
      progress.received = Math.max(progress.received, MODEL_BYTES);
      progress.file = null;
      tick();
      return true;
    } catch (err) {
      /* Leave whatever completed in the bucket — that is what makes the retry a resume. */
      progress.state = "error";
      progress.error = String(err && err.message || err);
      tick();
      return false;
    }
  }

  let runtime = null;

  /**
   * Load the vendored runtime — from disk, never a CDN.
   *
   * This is the app's single ES-module import, and it is deliberate. transformers.js
   * ships as ESM only, and a dynamic import() is CORS-blocked on file:// — which is
   * precisely the degradation Layer C already has by design (§6.5.2), since its WASM
   * backend cannot run there either. Every other script in the app stays a classic
   * tag so that double-clicking index.html still works.
   */
  function loadRuntime() {
    if (runtime) return Promise.resolve(runtime);
    /* Absolute URL: a bare relative specifier in a classic script would resolve
       against the document rather than predictably, and this has to be right from a
       Pages subpath too. */
    return import(rel("vendor/transformers/transformers.min.js"))
      .then(mod => (runtime = mod));
  }

  /**
   * Bring Layer C up. Idempotent; concurrent callers share one load.
   * Resolves to true when `embed` will work, false otherwise — it never throws,
   * because every caller's fallback is the same: show the exemplars, pay nothing.
   */
  function load() {
    if (extractor) return Promise.resolve(true);
    if (loading) return loading;
    if (!available()) return Promise.resolve(false);

    loading = (async () => {
      try {
        const T = await loadRuntime();
        const env = T.env;

        /* THE critical configuration. transformers.js defaults to fetching from the
           HuggingFace CDN, which would break the no-network promise in the most
           embarrassing way possible: silently, online only, and never in an offline
           test. tests/offline.js asserts zero outbound requests after load. */
        env.allowRemoteModels = false;
        env.allowLocalModels  = true;
        env.localModelPath    = rel("models/");
        env.useBrowserCache   = true;
        env.backends.onnx.wasm.wasmPaths = rel("vendor/transformers/");
        /* Single-threaded: threads need SharedArrayBuffer, which needs COOP/COEP
           headers, which GitHub Pages does not send. SIMD is universally available
           and is the only .wasm binary vendored. */
        env.backends.onnx.wasm.numThreads = 1;
        env.backends.onnx.wasm.simd = true;
        if (env.backends.onnx.wasm.proxy !== undefined) env.backends.onnx.wasm.proxy = false;

        progress.state = "loading";
        extractor = await T.pipeline("feature-extraction", MODEL_DIR, { quantized: true });
        progress.state = "ready";
        return true;
      } catch (err) {
        progress.state = "error";
        progress.error = String(err && err.message || err);
        console.warn("Layer C unavailable:", err);
        extractor = null;
        return false;
      } finally {
        loading = null;
      }
    })();
    return loading;
  }

  /** Embed one string → Float32Array(384), mean-pooled and L2-normalised. */
  async function embed(text) {
    const key = U.normalise(text);
    if (cache.has(key)) return cache.get(key);
    if (!extractor && !(await load())) return null;
    const out = await extractor(text, { pooling: "mean", normalize: true });
    const vec = Float32Array.from(out.data);
    cache.set(key, vec);
    return vec;
  }

  /** Cosine similarity. Inputs are already unit vectors, so this is a dot product. */
  function cosine(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom ? dot / denom : 0;
  }

  /* ── the negation / direction backstop (§6.5.4) ───────────────
     Embeddings are famously weak here. "Hotspur values honour above pragmatism" and
     "Hotspur values pragmatism above honour" score ~0.95 against each other and are
     opposite claims. Marked on cosine alone, the app would confidently accept the
     inverse of the right answer, which is worse than not marking at all.

     Authored `nearMiss` entries do most of the work. This is the cheap deterministic
     catch for the specific case of a straight reversal, which is the failure that
     embarrasses you most and is also the easiest to detect. */

  /* Words that make a sentence's term order load-bearing. Without one of these,
     two shared terms appearing in a different order usually means nothing. */
  const DIRECTIONAL = /\b(above|over|before|ahead|rather|instead|more|less|greater|beyond|against|than|priorit\w*|prefer\w*|subordinat\w*|outweigh\w*|trumps?|supersed\w*|at the expense of|in place of)\b/;
  /* A CAUSAL version of this check was written, measured and deleted. The idea was sound
     — DIRECTIONAL only catches comparative inversions ("X above Y" for "Y above X"), and
     the commonest student error is causal, swapping what produces what. A clean inversion
     of an exemplar scores 0.979 cosine and sails straight through.

     But word order does not carry causal direction in English once voice changes. "power
     works through language" and "language as the instrument through which power reproduces
     itself" say the SAME thing in opposite orders, and every guard tried (same clause, no
     comma between, tight spans) still flagged it. On the labelled set the causal rule
     caught one real inversion and marked one good answer wrong, which is the wrong trade:
     an inversion that names no technique and states no effect already caps at 2/4 through
     the rubric, whereas a good answer marked wrong is the complaint this work exists to
     fix. Left as a comment so the next person measures before re-adding it. */
  const NEGATORS = /\b(not|never|no|none|nothing|cannot|can't|isn't|aren't|doesn't|don't|without|fails? to|refus\w+|denies|deny|lacks?|rejects?|un\w+able)\b/;

  function contentTokens(s) {
    return U.normalise(s).split(" ").filter(w => w.length > 2 && !U.FUNCTION_WORDS.has(w));
  }

  /**
   * True when `student` and `model` share at least two salient terms whose relative
   * order is inverted, with a directional marker sitting between them on at least one
   * side. Twenty-ish lines, and it catches the whole reversal class.
   */
  function reversed(student, model) {
    const sN = U.normalise(student), mN = U.normalise(model);
    const s = contentTokens(student), m = contentTokens(model);
    if (s.length < 2 || m.length < 2) return false;

    const shared = s.filter(w => m.includes(w));
    const uniq = Array.from(new Set(shared));
    if (uniq.length < 2) return false;

    const between = (hay, a, b) => {
      const i = hay.indexOf(a), j = hay.indexOf(b);
      if (i < 0 || j < 0) return "";
      return hay.slice(Math.min(i, j), Math.max(i, j));
    };

    for (let x = 0; x < uniq.length; x++) {
      for (let y = x + 1; y < uniq.length; y++) {
        const a = uniq[x], b = uniq[y];
        const si = s.indexOf(a), sj = s.indexOf(b);
        const mi = m.indexOf(a), mj = m.indexOf(b);
        if (si === sj || mi === mj) continue;
        const inverted = (si < sj) !== (mi < mj);
        if (!inverted) continue;
        if (DIRECTIONAL.test(between(sN, a, b)) || DIRECTIONAL.test(between(mN, a, b))) return true;
      }
    }
    return false;
  }

  /** One side negates and the other doesn't — a weaker signal than a reversal. */
  function negationMismatch(student, model) {
    return NEGATORS.test(U.normalise(student)) !== NEGATORS.test(U.normalise(model));
  }

  /* ── the one public entry point ───────────────────────────────
     Every game mode calls this and nothing else, which is what makes the anti-farm
     rules in §9 apply uniformly and keeps a cosine score from ever being rendered
     as a mark. */

  const DEFAULT_THRESHOLD = 0.38;
  /** How far below threshold still counts as "close" rather than "not yet". */
  const CLOSE_BAND = 0.14;

  /* ── how the mark is built ────────────────────────────────────
     The original rule was: cosine over threshold or nothing, with any near-miss within
     0.02 of the best exemplar vetoing the answer outright. Two things were wrong with
     that, and both showed up as "I gave a decent answer and it was scrapped".

     One: near-misses are TOPICALLY IDENTICAL to the exemplars by construction — they are
     the same idea read badly. So a good answer sits close to both, and a 0.02 margin
     rejected answers for being about the right subject. The veto now needs the wrong
     reading to be clearly nearer (NEAR_MISS_MARGIN), and a strongly-scoring answer
     survives it as "close" rather than being thrown away.

     Two: a single pass/fail on one number is neither honest nor useful. A student who
     made the point but never said what the technique does has done something different
     from one who wrote nothing, and telling them apart is the whole job. So the result
     carries a mark out of four, built from four NAMED criteria — and three of them are
     deterministic, so when a mark is lost the app can say exactly why and be right.

       Point    0–2   does it answer the question?      ← the embedding, the only fuzzy part
       Detail   0–1   is the text actually in it?       ← technique named, or the words quoted
       Effect   0–1   does it say what that DOES?       ← an analytical verb, not a plot verb

     This is not a cosine dressed up as a mark. Two of the four marks cannot move without
     the student's words changing in a way you could point at, and the criteria are the
     ones a marker would use. What is never shown is the similarity number itself (§12).  */

  /* A near-miss must beat the best exemplar by this much before it costs anything.
     MEASURED, not guessed: at the original 0.02 it fired on four of eight hand-labelled
     good answers, because a good answer and a bad reading of the same idea share their
     whole vocabulary. Even at this margin it still fires on some good answers — MiniLM is
     384 dimensions and cannot always tell them apart — so it now costs ONE MARK rather
     than the answer. That is the difference between "you have drifted" and "start again". */
  const NEAR_MISS_MARGIN = 0.045;
  const MAX_MARK = 4;

  /* FULL MARKS need the best exemplar to beat the nearest wrong reading by this much.
     This is the fix for the real problem the calibration set exposed, which no threshold
     alone can solve: on 49 hand-labelled responses, good answers span 0.396–0.906 cosine
     and wrong ones span 0.113–0.979. The distributions OVERLAP — 384 dimensions cannot
     separate "made the point" from "misread it" on absolute similarity, and pretending
     otherwise is how a threshold ends up punishing whoever writes best.

     So the threshold is set low enough that no good answer is scrapped, and the fourth mark
     is gated on the CONTRAST instead. A wrong answer sits close to its own near-miss by
     construction, because a near-miss IS the misreading; a good answer does not. Measured:
     the old arrangement scrapped four good answers and let none through; this one scraps
     none and lets one thin answer reach full marks, which is the better trade because a
     false pass still shows the student every model answer. */
  const FULL_MARK_GATE = 0.06;

  /* Thresholds are lower than they look because cosine punishes length. A longer, more
     sophisticated answer scores BELOW a short blunt one that reuses the exemplar's shape
     — on the hand-labelled set the four best answers averaged 0.61 while two merely
     adequate one-clause answers hit 0.64 and 0.75. Marking on absolute cosine therefore
     penalises exactly the students who write best, which is why Point is worth two of
     four marks and not all four, and why the other two are deterministic. */

  /* Verbs that assert an effect on a reader, as opposed to recounting the plot. Shared
     with the Thesis Forge checks — an analytical sentence almost always contains one. */
  const EFFECT_VERBS = /\b(position|positions|positioned|construct|constructs|constructed|represent|represents|present|presents|argue|argues|invite|invites|force|forces|forced|expose|exposes|reveal|reveals|suggest|suggests|imply|implies|create|creates|convey|conveys|emphasise|emphasises|emphasize|emphasizes|undercut|undercuts|undermine|undermines|reframe|reframes|withhold|withholds|refuse|refuses|deny|denies|foreclose|forecloses|locate|locates|relocate|relocates|convert|converts|enact|enacts|complicate|complicates|destabilise|destabilises|unsettle|unsettles|make|makes|leave|leaves|allow|allows|prevent|prevents|demonstrate|demonstrates|signal|signals|frame|frames|cast|casts|render|renders|elevate|elevates|diminish|diminishes|collapse|collapses|equate|equates|subordinate|subordinates|strip|strips|remove|removes|admit|admits|concede|concedes|surrender|surrenders|forfeit|forfeits|trap|traps|seal|seals|close|closes|reduce|reduces|flatten|flattens|substitute|substitutes|replace|replaces)\b/;
  const PLOT_ONLY = /\b(happens|then he|then she|goes to|talks to|meets|dies at the end|the story is about|this quote is when|is about when|is the part where)\b/;

  /**
   * Score the two deterministic criteria. Pure Layer A — no model, works on file://.
   * `spec.quote` / `spec.techniques` / `spec.text` supply what "the text is in it" means;
   * with none of them present Detail is given, because there is nothing to check against
   * and marking a student down for a criterion the data cannot express would be a lie.
   */
  function craftMarks(response, spec) {
    const s = spec || {};
    const raw = String(response || "");
    const low = " " + U.normalise(raw) + " ";
    const out = [];

    /* Detail: a technique by name, three consecutive words of the quote, or the
       composer / title. Any one is enough — this is a check for contact with the text,
       not a checklist. */
    let detail = null;
    const names = [];
    (s.techniques || []).forEach(id => {
      if (EN.Bank && EN.Bank.techniqueAlts) names.push.apply(names, EN.Bank.techniqueAlts(id));
      else names.push(String(id).replace(/-/g, " "));
    });
    if (names.some(n => n && low.indexOf(" " + U.normalise(n) + " ") >= 0)) detail = "technique";

    if (!detail && s.quoteText) {
      const qw = U.normalise(s.quoteText).split(" ").filter(w => w.length > 2);
      for (let i = 0; i + 2 < qw.length; i++) {
        if (low.indexOf(" " + qw.slice(i, i + 3).join(" ") + " ") >= 0) { detail = "quoted"; break; }
      }
    }
    if (!detail && s.text && EN.Bank && EN.Bank.text) {
      const t = EN.Bank.text(s.text) || {};
      const surname = t.composer ? U.normalise(t.composer).split(" ").pop() : null;
      const firstTitle = t.title ? U.normalise(t.title).split(" ").filter(w => w.length > 3)[0] : null;
      if ((surname && low.indexOf(" " + surname) >= 0) ||
          (firstTitle && low.indexOf(" " + firstTitle) >= 0)) detail = "named";
    }
    const checkable = !!(names.length || s.quoteText || s.text);
    out.push({
      id: "detail", label: "Anchored in the text", max: 1,
      got: checkable ? (detail ? 1 : 0) : 1,
      why: !checkable ? "Nothing to anchor to on this prompt, so this mark is given."
         : detail === "technique" ? "You named the technique."
         : detail === "quoted" ? "You quoted the words."
         : detail === "named" ? "You named the text or its composer."
         : "Name the technique, or quote three words of it. An analysis with no text in it is a general remark."
    });

    /* Effect: does the sentence claim the text DOES something? */
    const hasEffect = EFFECT_VERBS.test(low) && !PLOT_ONLY.test(low);
    out.push({
      id: "effect", label: "Says what it does", max: 1, got: hasEffect ? 1 : 0,
      why: hasEffect ? "You said what the choice does, not just what it is."
         : PLOT_ONLY.test(low)
           ? "This retells rather than analyses. Say what the choice does to a reader."
           : "Add the effect — what does this position, force, expose or withhold?"
    });
    return out;
  }

  /** Assemble the mark out of four from the embedding score plus the craft marks. */
  function buildMarks(response, spec, best, threshold) {
    const point = best >= threshold ? 2
                : best >= threshold - CLOSE_BAND ? 1
                : 0;
    const marks = [{
      id: "point", label: "Answers the question", max: 2, got: point,
      why: point === 2 ? "You made the point the question asked for."
         : point === 1 ? "You are near the point but not on it — compare the model answers."
                       : "This is not yet answering what was asked. Read the model answers."
    }].concat(craftMarks(response, spec));
    return capped(marks);
  }

  /**
   * Total the marks, with Point acting as a gate.
   *
   * A marker does not give 2/4 to a fluent, well-anchored answer to a different question,
   * and neither should this: naming the technique and stating an effect are worth nothing
   * if the claim itself is wrong. So a Point of 0 caps the total at 1. Without the cap a
   * response that named any technique in the quote and used any analytical verb scored
   * "close" while saying something untrue — measured on a deliberately thin answer.
   */
  function capped(marks, contrast) {
    const point = (marks.find(m => m.id === "point") || { got: 0 }).got;
    const raw = marks.reduce((n, m) => n + m.got, 0);
    let total = point === 0 ? Math.min(raw, 1) : raw;
    /* The fourth mark is the one that says "nothing missing", so it needs the clearest
       evidence: not just a score over the line, but a score clearly nearer a right reading
       than a wrong one. `contrast` is best − worst; absent (Layer B, or no near-misses
       authored) the gate cannot apply and does not. */
    let gatedByContrast = false;
    if (total >= MAX_MARK && typeof contrast === "number" && !(contrast >= FULL_MARK_GATE)) {
      total = MAX_MARK - 1;
      gatedByContrast = true;
    }
    return { marks, total, outOf: MAX_MARK,
             gated: point === 0 && raw > 1, gatedByContrast };
  }

  /**
   * Mark a typed response.
   *
   * spec = {
   *   layer:     "B" | "C"
   *   answers:   [String]          exemplars — 3–5 genuinely different valid answers
   *   nearMiss:  [String]          semantically close but WRONG (§6.5.4)
   *   prompt:    String            added to nearMiss automatically (§9.8)
   *   threshold: Number            per-prompt, from tests/calibrate.js
   *   domain:    String            grouping label, for calibration reporting
   * }
   *
   * → { verdict, score, layer, feedback, exemplars, flags }
   *   verdict = "nailed" | "close" | "notYet" | "unavailable"
   *
   * `score` is diagnostic only. It is never shown to the student, never rendered as a
   * percentage, and never mapped to a band — it measures "this means roughly what a
   * good answer means", and dressing that up as a mark out of 20 would be the one
   * genuinely dishonest thing this app could do (§12).
   */
  async function check(response, spec) {
    const s = spec || {};
    const answers = [].concat(s.answers || []).filter(Boolean);
    const raw = String(response == null ? "" : response).trim();

    if (!raw) {
      return { verdict: "notYet", score: 0, layer: s.layer || "C", flags: ["empty"],
               total: 0, outOf: MAX_MARK,
               feedback: "Nothing typed yet.", exemplars: answers };
    }

    /* ── Layer B ── */
    if (s.layer === "B") {
      const alts = answers.concat([].concat(s.alts || []));
      const f = fuzzy(raw, alts);
      return {
        verdict: f.ok ? "nailed" : "notYet",
        score: f.ratio, layer: "B", flags: f.reason === "scope" ? ["scope"] : [],
        total: f.ok ? 1 : 0, outOf: 1,
        feedback: f.ok
          ? (f.ratio < 1 ? "Right — spelling was a little off." : "Exactly right.")
          : "Not the word.",
        matched: f.matched, exemplars: answers
      };
    }

    /* ── Layer C ── */
    if (!available()) {
      return { verdict: "unavailable", score: 0, layer: "C", flags: ["blocked:" + blockedReason()],
               feedback: unavailableMessage(), exemplars: answers };
    }
    if (!extractor && !(await load())) {
      return { verdict: "unavailable", score: 0, layer: "C", flags: ["notLoaded"],
               feedback: "Sentence marking isn't switched on yet — enable it in Settings.",
               exemplars: answers };
    }

    /* Prompts and their exemplars are semantically close to each other by construction,
       so pasting the prompt back at the app clears threshold on a lot of questions.
       Adding the prompt to nearMiss at runtime closes the whole attack class in one
       line (§9.8). */
    const nearMiss = [].concat(s.nearMiss || []).concat(s.prompt ? [s.prompt] : []).filter(Boolean);

    const vec = await embed(raw);
    if (!vec) {
      return { verdict: "unavailable", score: 0, layer: "C", flags: ["embedFailed"],
               feedback: unavailableMessage(), exemplars: answers };
    }

    const aVecs = await Promise.all(answers.map(embed));
    const nVecs = await Promise.all(nearMiss.map(embed));

    let best = 0, bestAt = -1;
    aVecs.forEach((v, i) => { const c = cosine(vec, v); if (c > best) { best = c; bestAt = i; } });
    let worst = 0, worstAt = -1;
    nVecs.forEach((v, i) => { const c = cosine(vec, v); if (c > worst) { worst = c; worstAt = i; } });

    const threshold = s.threshold === undefined ? DEFAULT_THRESHOLD : s.threshold;
    const flags = [];
    const closest = bestAt >= 0 ? answers[bestAt] : answers[0] || "";

    /* best − worst: how much clearer the right reading is than the nearest wrong one.
       Gates the fourth mark; see FULL_MARK_GATE. */
    const contrast = worstAt >= 0 ? best - worst : Infinity;
    const scored = capped(buildMarks(raw, s, best, threshold).marks, contrast);
    let { marks, total } = scored;
    let note = null;

    /* The contrastive rule, with a real margin. A near-miss is the SAME IDEA read badly,
       so it sits close to the exemplars by design — requiring only that it tie was
       rejecting answers for being about the right subject. It now has to be clearly
       nearer, and an answer that is itself strong keeps its Point mark and loses the
       benefit of the doubt instead of the whole response. */
    if (worstAt >= 0 && worst >= best + NEAR_MISS_MARGIN) {
      flags.push("nearMiss");
      /* If the answer cleared the bar against a model answer on its own merits, a wrong
         reading scoring incidentally higher is 384-dimensional noise, not evidence. Say so
         and cost nothing. The protection against a genuine inversion is the DETERMINISTIC
         backstop below, which does not depend on the embedding at all. */
      if (best >= threshold) {
        note = "Marked right — but parts of this read like a common misreading, so check yours against the model answers.";
      } else {
      marks = marks.map(m => m.id === "point"
        ? Object.assign({}, m, { got: Math.max(0, m.got - 1),
            why: m.got >= 2 ? "Close, but this drifts toward a common misreading of the same idea."
                            : "This lands nearer a misreading than the point. Compare it with the model answers." })
        : m);
      ({ marks, total } = capped(marks, contrast));
      if (total <= 1) note = "That lands closer to a misreading than to the point.";
      }
    }

    /* The deterministic backstops, applied on top of the exemplar closest to the
       student's answer. Flagged regardless of cosine, per §6.5.4. A reversal is a real
       error and costs the Point marks — but the Detail and Effect marks are honestly
       earned and are not confiscated, because the student did name the technique. */
    if (reversed(raw, closest)) {
      flags.push("reversed");
      /* Costs both Point marks only if the answer did not clear the bar on its own merits.
         The check is a word-order heuristic, not proof: "Being 'made' rather than making
         relocates agency to God" was zeroed against an exemplar reading "not going to make
         music but to be made into it" — both say the same thing, and both contain a
         contrast construction, so the shared terms appear in opposite surface order. A
         heuristic that confidently destroys a good answer is worse than one that costs it a
         mark, so above threshold it costs one and says why. */
      const strong = best >= threshold;
      marks = marks.map(m => m.id === "point"
        ? Object.assign({}, m, { got: strong ? Math.max(0, m.got - 1) : 0,
            why: strong
              ? "Check the direction — the terms appear in the opposite order to the model answers, which is usually a sign of an inversion."
              : "The pieces are right but the direction is inverted — check which term you have put above which." })
        : m);
      ({ marks, total } = capped(marks, contrast));
      if (!strong) note = "The pieces are right but the direction looks inverted.";
    } else if (negationMismatch(raw, closest)) {
      flags.push("negation");
      /* A negation asymmetry with an otherwise passing score is the shape of an accidental
         inversion, so it costs a mark rather than the answer. */
      marks = marks.map(m => m.id === "point" && m.got === 2
        ? Object.assign({}, m, { got: 1,
            why: "One of you is negating and the other isn't — check whether you meant the opposite." })
        : m);
      ({ marks, total } = capped(marks, contrast));
    }

    /* The verdict is now a summary of the mark, not a separate judgement. Three of four
       is a good answer with one thing missing, and it says so. */
    const pointGot = (marks.find(m => m.id === "point") || { got: 0 }).got;
    const verdict = total >= 4 ? "nailed" : (pointGot >= 1 && total >= 2) ? "close" : "notYet";
    const missing = marks.filter(m => m.got < m.max);
    /* Three out of four has two different causes and they need different sentences. Either
       a criterion is short — say which — or every criterion was met and the contrast gate
       held the last mark back, in which case nothing is missing and claiming otherwise
       would be a lie (and, before this, a crash on missing[0]). */
    const threeBecauseGated = scored.gatedByContrast || !missing.length;

    return {
      verdict, score: best, layer: "C", flags,
      marks, total, outOf: MAX_MARK, gatedByContrast: !!scored.gatedByContrast,
      feedback: note ? note
              : total === 4 ? "Full marks. Here's how others put it:"
              : total === 3 && threeBecauseGated
                ? "Three out of four. Every criterion is met, but this still reads close to a " +
                  "common misreading — compare it with the model answers."
              : total === 3 ? "Three out of four — one thing short: " + missing[0].label.toLowerCase() + "."
              : total === 2 ? "Halfway. You're circling it — look at what these do differently:"
              : total === 1 ? "One mark. Read these and see what they do that yours doesn't:"
                            : "Not yet. Read these and try again tomorrow:",
      exemplars: answers
    };
  }

  function unavailableMessage() {
    const why = blockedReason();
    if (why === "file")
      return "Sentence marking needs the app served over http — it works on your phone install " +
             "and on the published site, just not by double-clicking the file. Everything else " +
             "here works fine either way. Model answers below.";
    return "Sentence marking isn't available on this device. Model answers below.";
  }

  return {
    check, fuzzy, exact, ordering,
    embed, cosine, load, ready, available, blockedReason,
    downloadModel, downloadProgress, isDownloaded,
    reversed, negationMismatch,
    craftMarks, buildMarks, capped,
    MODEL_CACHE, MODEL_FILES, MODEL_BYTES, FUZZY_THRESHOLD, DEFAULT_THRESHOLD, CLOSE_BAND,
    MAX_MARK, NEAR_MISS_MARGIN, EFFECT_VERBS
  };
})();
