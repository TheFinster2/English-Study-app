/* Re-stamp the build fingerprint after bumping the version.
   Run: node tests/stamp.js
   The `offline` suite fails when the shell's contents have changed but the version has not,
   because a cache-first service worker serves the OLD app forever in that case. This is the
   other half of that check: bump EN.BUILD and sw.js's CACHE, then run this. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const { fingerprint, versions } = require("./lib/fingerprint");

const v = versions(ROOT);
if (v.build !== v.cache) {
  console.error("EN.BUILD is " + v.build + " but sw.js's cache is " + v.cache +
                " — make them match first.");
  process.exit(1);
}
const fp = fingerprint(ROOT);
fs.writeFileSync(path.join(ROOT, "tests/build-fingerprint.json"),
  JSON.stringify({ version: v.build, hash: fp.hash, files: fp.count }, null, 2) + "\n");
console.log("stamped " + v.build + " — " + fp.count + " shell files, hash " + fp.hash);
