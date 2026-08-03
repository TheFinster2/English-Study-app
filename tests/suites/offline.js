/* OFFLINE — the service worker's promises, checked without a browser.
   ============================================================================
   A shell that loads a script the worker never cached works perfectly on the machine it
   was built on and fails on a train, which is the only place it matters. So this suite
   parses index.html and compares it with sw.js rather than trusting the list in either.

   The other promise it guards is the expensive one: `closereading-model-v1` holds 23 MB
   the student chose to download, and the activate handler sweeps stale caches by prefix.
   One careless prefix and shipping a typo'd stylesheet silently costs somebody 23 MB of
   mobile data.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "offline",
  about: "precache matches index.html; the model bucket is never swept",

  run(t, { ROOT }) {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");

    /* ── what the shell actually loads ── */
    const scripts = Array.from(html.matchAll(/<script\s+src="([^"]+)"/g)).map(m => m[1]);
    const styles = Array.from(html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)).map(m => m[1]);
    const icons = Array.from(html.matchAll(/<link[^>]+href="(assets\/[^"]+)"/g)).map(m => m[1]);
    const manifestRef = /href="(manifest\.webmanifest)"/.exec(html);
    const needed = scripts.concat(styles, icons, manifestRef ? [manifestRef[1]] : []);
    t.atLeast(scripts.length, 40, "scripts in index.html");

    /* Every one of them must exist on disk. A 404'd script is a blank screen. */
    const missing = needed.filter(f => !fs.existsSync(path.join(ROOT, f)));
    t.eq(missing, [], "files referenced by index.html that are not on disk");

    /* ── and what the worker caches ── */
    const listed = new Set(Array.from(sw.matchAll(/"([^"]+\.(?:js|css|html|webmanifest|svg|png))"/g)).map(m => m[1]));
    const uncached = needed.filter(f => !listed.has(f));
    t.eq(uncached, [], "files the shell loads but sw.js does not precache");

    /* The reverse too: a precache entry for a file that no longer exists fails the
       install for that entry and is dead weight in the list. */
    const ghosts = Array.from(listed).filter(f => !fs.existsSync(path.join(ROOT, f)));
    t.eq(ghosts, [], "precache entries with no file behind them");
    t.note(needed.length + " files loaded by the shell, " + listed.size + " precached");

    /* ── the model bucket ─────────────────────────────────────── */
    const cacheName = /const CACHE\s*=\s*"([^"]+)"/.exec(sw);
    const modelName = /const MODEL_CACHE\s*=\s*"([^"]+)"/.exec(sw);
    t.ok(cacheName, "sw.js declares a versioned CACHE constant");
    t.ok(modelName, "sw.js declares MODEL_CACHE");
    if (cacheName && modelName) {
      t.ok(cacheName[1] !== modelName[1], "the shell cache and the model cache are different buckets");
      /* The sweep is by prefix, so the model name must not be swept by it. */
      t.ok(sw.includes("k !== MODEL_CACHE") || sw.includes("MODEL_CACHE)") ,
           "the activate sweep excludes MODEL_CACHE explicitly");
      t.ok(!modelName[1].startsWith(cacheName[1]),
           "the model bucket name is not a prefix-match of the shell cache");

      /* mark.js must agree with sw.js about the bucket's name, or the worker serves
         nothing and the model is re-fetched every session. */
      const mark = fs.readFileSync(path.join(ROOT, "js/core/mark.js"), "utf8");
      const markCache = /const MODEL_CACHE\s*=\s*"([^"]+)"/.exec(mark);
      t.ok(markCache, "mark.js declares MODEL_CACHE");
      if (markCache) t.eq(markCache[1], modelName[1], "mark.js and sw.js name the same model bucket");
    }

    /* The 33 MB of model and runtime must NOT be in the precache list — that is the whole
       point of the opt-in download. */
    const heavy = Array.from(listed).filter(f => /^models\/|^vendor\//.test(f));
    t.eq(heavy, [], "model and runtime files are not precached with the shell");

    /* ── navigation fallback ──────────────────────────────────── */
    t.ok(/req\.mode\s*===\s*"navigate"/.test(sw),
         "the worker serves the cached shell for navigations (so #/vault works offline)");
    t.ok(/skipWaiting/.test(sw) && /SKIP_WAITING/.test(sw),
         "the worker waits for the app's signal rather than skipping on install");
    t.ok(!/self\.skipWaiting\(\)\s*;?\s*\n?\s*\}\)\(\)\);?\s*\n?\}\);?\s*$/m.test(
           sw.slice(0, sw.indexOf("activate"))),
         "install does not call skipWaiting unconditionally");

    /* ── the manifest ─────────────────────────────────────────── */
    const mf = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
    t.ok(mf.name && mf.short_name, "the manifest is named");
    t.ok(mf.start_url.includes("#/"), "start_url includes a hash route");
    t.ok(mf.display === "standalone", "installs standalone");
    t.ok(mf.icons.some(i => i.sizes === "512x512"), "a 512px icon");
    t.ok(mf.icons.some(i => (i.purpose || "").includes("maskable")), "a maskable icon");
    const iconMissing = mf.icons.map(i => i.src).filter(src => !fs.existsSync(path.join(ROOT, src)));
    t.eq(iconMissing, [], "manifest icons that are not on disk");

    /* Every path in the manifest and the shell must be relative, or a GitHub Pages
       subpath install breaks. */
    const absolute = mf.icons.map(i => i.src).concat([mf.start_url, mf.scope])
      .filter(p => p && p.startsWith("/"));
    t.eq(absolute, [], "absolute paths in the manifest (they break a Pages subpath)");
    const absShell = needed.filter(f => f.startsWith("/"));
    t.eq(absShell, [], "absolute src paths in index.html");

    /* ── the version moved ────────────────────────────────────────
       The build version in app.js and the cache name in sw.js must not drift apart. */
    const build = /EN\.BUILD\s*=\s*"([^"]+)"/.exec(fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8"));
    t.ok(build, "app.js declares EN.BUILD");
    if (build && cacheName) {
      t.note("build " + build[1] + " · shell cache " + cacheName[1]);
      t.ok(cacheName[1].includes(build[1]),
           "sw.js's cache name contains the build version (bump both together)");
    }

    /* ── and it moved when the shell CHANGED ──────────────────────
       This is the check that was missing, and its absence shipped seven deploys the app
       could never receive. The worker is cache-first on a fixed version string, so a device
       holding the old cache serves the ENTIRE old app forever — not a stale file here and
       there, all of it. Nothing in the suite noticed, because every check passed against the
       new source while every phone ran the old.

       So: hash the shell and store the hash beside the version. If the contents move and the
       version does not, this fails and says what to do. Regenerate with `node tests/stamp.js`
       after bumping both constants. */
    const { fingerprint } = require("../lib/fingerprint");
    const stampPath = path.join(ROOT, "tests/build-fingerprint.json");
    t.ok(fs.existsSync(stampPath), "the build fingerprint exists");
    if (fs.existsSync(stampPath) && build) {
      const stamp = JSON.parse(fs.readFileSync(stampPath, "utf8"));
      const now = fingerprint(ROOT);
      t.note("shell " + now.count + " files, hash " + now.hash +
             " (stamped " + stamp.version + " / " + stamp.hash + ")");
      if (stamp.hash === now.hash) {
        t.eq(stamp.version, build[1], "the fingerprint is stamped for this version");
      } else {
        t.ok(stamp.version !== build[1],
             "the shell changed, so the version must move too — bump EN.BUILD and sw.js's " +
             "CACHE, then run `node tests/stamp.js` (stamped " + stamp.version +
             ", now " + build[1] + ")");
      }
    }
  }
};
