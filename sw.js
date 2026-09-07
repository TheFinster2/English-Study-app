/* SERVICE WORKER — precache the shell, serve it offline, and never touch the model.
   ============================================================================
   The whole app is a fixed list of plain files, so the strategy is the simple one:
   precache everything on install, serve cache-first, and treat a version bump as a
   complete replacement. There is nothing to revalidate because nothing changes between
   deploys.

   Three rules this file exists to keep:

     1. `CACHE` must move on every deploy, and `PRECACHE` must list every file the app
        loads. tests/suites/offline.js walks index.html and asserts the two agree — a shell
        that loads a script the worker never cached works perfectly on the developer's
        machine and fails on a train, which is the only place it matters.

     2. THE MODEL BUCKET IS NOT OURS. `closereading-model-v1` is written by
        js/core/mark.js and holds 23 MB the student chose to download. The activate
        handler deletes stale caches by prefix and must never match it — shipping a
        typo'd stylesheet and silently costing somebody 23 MB of mobile data would be
        indefensible. tests/suites/offline.js asserts the sweep excludes the bucket.

     3. Navigation requests fall back to the cached index.html, because the app is a
        single document behind a hash router. Without this, opening a bookmark to
        #/vault offline gets the browser's dinosaur.
   ============================================================================ */

const CACHE = "closereading-v1.5.0";
const MODEL_CACHE = "closereading-model-v1";   // owned by mark.js — do not delete

/* Every file the app loads, in the order index.html loads them. Kept in sync by hand and
   checked by tests/suites/offline.js, which parses index.html rather than trusting it. */
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/styles.css",

  "js/core/util.js",
  "js/core/mark.js",
  "js/core/state.js",
  "js/core/audio.js",
  "js/core/fx.js",
  "js/core/ui.js",

  "js/data/meta.js",
  "js/data/techniques.js",
  "js/data/rubric.js",
  "js/data/concepts.js",
  "js/data/texts.js",
  "js/data/texts/nineteen-eighty-four.js",
  "js/data/texts/donne.js",
  "js/data/texts/wit.js",
  "js/data/texts/henry-iv.js",
  "js/data/texts/craft.js",
  "js/data/texts/the-crucible.js",
  "js/data/texts/hamlet.js",
  "js/data/texts/the-tempest.js",
  "js/data/texts/hag-seed.js",
  "js/data/questions-common.js",
  "js/data/questions-modulea.js",
  "js/data/questions-moduleb.js",
  "js/data/questions-modulec.js",
  "js/data/questions-core.js",
  "js/data/questions-starters.js",
  "js/data/paragraphs.js",
  "js/data/freetext.js",
  "js/data/essays.js",
  "js/data/shop.js",
  "js/data/achievements.js",

  "js/core/bank.js",
  "js/core/arcade.js",

  "js/games/quiz.js",
  "js/games/technique.js",
  "js/games/cloze.js",
  "js/games/markingdesk.js",
  "js/games/essayarch.js",
  "js/games/layerc.js",
  "js/games/paper.js",
  "js/games/quotematch.js",
  "js/games/bandgrid.js",
  "js/games/deconstruct.js",
  "js/games/boss.js",
  "js/games/arcade-lettercrush.js",
  "js/games/arcade-runner.js",
  "js/games/arcade-wordtower.js",

  "js/screens/home.js",
  "js/screens/play.js",
  "js/screens/vault.js",
  "js/screens/reference.js",
  "js/screens/progress.js",
  "js/screens/shop.js",
  "js/screens/draft.js",
  "js/screens/texts.js",
  "js/screens/misc.js",
  "js/screens/dev.js",
  "js/app.js",

  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/apple-touch-icon.png"
];

/* NOT precached, deliberately: vendor/transformers/* and models/minilm/* — 33 MB that
   only a student who opted into sentence marking should ever pay for. mark.js puts them
   in MODEL_CACHE on request, and the fetch handler below serves them from there. */

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    /* One at a time rather than cache.addAll, because addAll rejects the whole install
       if a single file 404s — and then the app has no worker at all, offline included,
       with no clue which file was missing. */
    await Promise.all(PRECACHE.map(async url => {
      try {
        await cache.add(new Request(url, { cache: "reload" }));
      } catch (err) {
        console.warn("[sw] could not precache", url, err);
      }
    }));
    /* No skipWaiting here — app.js decides when to take an update, so a student mid-run
       is not swapped underneath. It sends SKIP_WAITING when it is ready. */
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      if (k === CACHE || k === MODEL_CACHE) return null;
      /* Only ever delete this app's own shell caches. A name we do not recognise might
         belong to another app on the same origin — GitHub Pages puts every project of a
         user on one origin, which is exactly how one project's worker wiped another's. */
      if (!k.startsWith("closereading-") || k.startsWith("closereading-model")) return null;
      return caches.delete(k);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // nothing cross-origin is ever requested

  /* A hash route is one document. Serve the cached shell for any navigation, so
     #/vault works offline from a bookmark or a home-screen shortcut. */
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match("index.html");
      if (cached) return cached;
      try { return await fetch(req); }
      catch (err) { return new Response("Offline and the app shell isn't cached yet.",
                                        { status: 503, headers: { "Content-Type": "text/plain" } }); }
    })());
    return;
  }

  event.respondWith((async () => {
    /* The model files live in their own bucket, written by mark.js. Check it too, so a
       downloaded model works offline without the worker having to own it. */
    const fromShell = await caches.match(req, { cacheName: CACHE });
    if (fromShell) return fromShell;
    const fromModel = await caches.match(req, { cacheName: MODEL_CACHE });
    if (fromModel) return fromModel;

    try {
      const res = await fetch(req);
      /* Fill gaps as they appear — a file added between deploys, or one whose precache
         failed. Only same-origin, only 200s, never opaque responses. */
      if (res && res.status === 200 && res.type === "basic") {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      /* Offline with nothing cached. An empty 504 is the honest answer; app.js and
         mark.js both handle a failed fetch, and Layer C degrades rather than blocking. */
      return new Response("", { status: 504, statusText: "Offline" });
    }
  })());
});
