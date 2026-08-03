/* A hash over the app shell, so "the contents changed but the version did not" is a thing a
   test can notice. Shared by the `offline` suite and tests/stamp.js.

   Only the shell: the model in models/ and the runtime in vendor/ are tens of megabytes and
   never change between deploys, so hashing them would be slow and pointless. */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SKIP = /^(models|vendor|tests|node_modules|\.git)\//;

function shellFiles(ROOT) {
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const block = /const PRECACHE = \[([\s\S]*?)\];/.exec(sw);
  const listed = block ? Array.from(block[1].matchAll(/"([^"]+)"/g)).map(m => m[1]) : [];
  /* sw.js and the fingerprint's own inputs count too — a change to the worker is a change
     to the app even though the worker never lists itself. */
  const all = listed.concat(["sw.js", "index.html", "manifest.webmanifest"]);
  return Array.from(new Set(all))
    .filter(f => f && !SKIP.test(f) && f !== "./" && !f.startsWith("http"))
    .filter(f => fs.existsSync(path.join(ROOT, f)))
    .sort();
}

function fingerprint(ROOT) {
  const files = shellFiles(ROOT);
  const h = crypto.createHash("sha256");
  files.forEach(f => {
    h.update(f);
    h.update(fs.readFileSync(path.join(ROOT, f)));
  });
  return { hash: h.digest("hex").slice(0, 16), count: files.length, files };
}

function versions(ROOT) {
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const app = fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8");
  const cache = /const CACHE\s*=\s*"closereading-v([^"]+)"/.exec(sw);
  const build = /EN\.BUILD\s*=\s*"([^"]+)"/.exec(app);
  return { cache: cache && cache[1], build: build && build[1] };
}

module.exports = { fingerprint, versions, shellFiles };
