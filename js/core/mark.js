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

  const DEFAULT_THRESHOLD = 0.62;
  /** How far below threshold still counts as "close" rather than "not yet". */
  const CLOSE_BAND = 0.10;

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
               feedback: "Nothing typed yet.", exemplars: answers };
    }

    /* ── Layer B ── */
    if (s.layer === "B") {
      const alts = answers.concat([].concat(s.alts || []));
      const f = fuzzy(raw, alts);
      return {
        verdict: f.ok ? "nailed" : "notYet",
        score: f.ratio, layer: "B", flags: f.reason === "scope" ? ["scope"] : [],
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

    /* The contrastive rule. An answer nearer a wrong reading than a right one is
       marked wrong regardless of how well it scores in absolute terms — this is what
       stops a confident inversion of the right answer from passing. */
    if (worstAt >= 0 && worst >= best - 0.02) {
      flags.push("nearMiss");
      return { verdict: "notYet", score: best, layer: "C", flags,
               feedback: "That lands closer to a misreading than to the point. Compare it with these:",
               exemplars: answers, matched: nearMiss[worstAt] };
    }

    /* The deterministic backstop, applied on top of the exemplar closest to the
       student's answer. Flagged regardless of cosine, per §6.5.4. */
    if (reversed(raw, closest)) {
      flags.push("reversed");
      return { verdict: "notYet", score: best, layer: "C", flags,
               feedback: "The pieces are right but the direction looks inverted — check which term you've put above which.",
               exemplars: answers };
    }
    if (negationMismatch(raw, closest)) flags.push("negation");

    let verdict = best >= threshold ? "nailed"
                : best >= threshold - CLOSE_BAND ? "close"
                : "notYet";

    /* A negation asymmetry with an otherwise passing score is exactly the shape of an
       accidental inversion, so it costs the top verdict but not the whole answer. */
    if (verdict === "nailed" && flags.includes("negation")) verdict = "close";

    return {
      verdict, score: best, layer: "C", flags,
      feedback: verdict === "nailed" ? "That's the move. Here's how others put it:"
              : verdict === "close"  ? "You're circling it. Look at what these do differently:"
                                     : "Not yet — read these and try again tomorrow:",
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
    MODEL_CACHE, MODEL_FILES, MODEL_BYTES, FUZZY_THRESHOLD, DEFAULT_THRESHOLD, CLOSE_BAND
  };
})();
