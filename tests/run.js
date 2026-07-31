#!/usr/bin/env node
/* THE TEST RUNNER.
   ============================================================================
     node tests/run.js            every suite
     node tests/run.js validate   one suite
     node tests/run.js --list     what there is

   No framework, because adding one would be the first dependency in a project whose
   whole premise is not having any. A suite is a file in tests/suites/ exporting
   `{ name, needsBrowser?, run(t) }`, where `t` is the tiny assertion object below.

   Suites that drive Chromium are skipped with a clear message when Playwright is absent,
   rather than failing — the data suites are the ones that must run anywhere, and a
   contributor without a browser should still be able to check the bank.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SUITE_DIR = path.join(__dirname, "suites");

/* ── the assertion object ─────────────────────────────────────
   `ok`/`eq` record and continue; a suite reports everything wrong in one run rather than
   stopping at the first problem, because "the bank has 14 broken questions" is a more
   useful message than "question 3 is broken". */
function makeT(name) {
  const fails = [], notes = [];
  let checks = 0;
  return {
    name,
    ok(cond, msg) {
      checks++;
      if (!cond) fails.push(msg);
      return !!cond;
    },
    eq(got, want, msg) {
      checks++;
      const same = JSON.stringify(got) === JSON.stringify(want);
      if (!same) fails.push(msg + " — got " + JSON.stringify(got) + ", wanted " + JSON.stringify(want));
      return same;
    },
    /** An assertion with a number attached, so the report shows the measurement. */
    atMost(got, limit, msg) {
      checks++;
      if (!(got <= limit)) fails.push(msg + " — " + fmt(got) + " > " + fmt(limit));
      return got <= limit;
    },
    atLeast(got, limit, msg) {
      checks++;
      if (!(got >= limit)) fails.push(msg + " — " + fmt(got) + " < " + fmt(limit));
      return got >= limit;
    },
    note(msg) { notes.push(msg); },
    get result() { return { name, checks, fails, notes }; }
  };
}

const fmt = n => typeof n === "number" && !Number.isInteger(n) ? n.toFixed(3) : String(n);

/* ── discovery ────────────────────────────────────────────────
   By pattern, never a list — the same rule the app uses for its data banks, and for the
   same reason: a list is one forgotten line away from silently not running a suite. */
function suites() {
  if (!fs.existsSync(SUITE_DIR)) return [];
  return fs.readdirSync(SUITE_DIR).filter(f => f.endsWith(".js")).sort()
    .map(f => Object.assign({ file: f }, require(path.join(SUITE_DIR, f))));
}

function hasPlaywright() {
  try { require.resolve("playwright"); return true; } catch (e) { return false; }
}

const GREEN = "\x1b[32m", RED = "\x1b[31m", DIM = "\x1b[2m", YEL = "\x1b[33m", OFF = "\x1b[0m";

async function main() {
  const args = process.argv.slice(2);
  const all = suites();
  if (args.includes("--list")) {
    all.forEach(s => console.log("  " + s.name.padEnd(14) + (s.needsBrowser ? "(browser) " : "          ") + (s.about || "")));
    return 0;
  }
  const wanted = args.filter(a => !a.startsWith("--"));
  const chosen = wanted.length ? all.filter(s => wanted.includes(s.name)) : all;
  if (!chosen.length) {
    console.error("No suite matched " + wanted.join(", ") + ". Try --list.");
    return 2;
  }

  const browser = hasPlaywright();
  const results = [];
  for (const s of chosen) {
    if (s.needsBrowser && !browser) {
      console.log(YEL + "skip" + OFF + "  " + s.name + DIM + "  (needs playwright: npm i -D playwright)" + OFF);
      results.push({ name: s.name, skipped: true });
      continue;
    }
    const t = makeT(s.name);
    const started = Date.now();
    try {
      await s.run(t, { ROOT });
    } catch (err) {
      t.ok(false, "suite threw: " + (err && err.stack ? err.stack.split("\n").slice(0, 3).join(" | ") : err));
    }
    const r = t.result;
    r.ms = Date.now() - started;
    results.push(r);
    const bad = r.fails.length;
    console.log((bad ? RED + "FAIL" + OFF : GREEN + "pass" + OFF) + "  " + r.name.padEnd(14) +
                DIM + r.checks + " checks, " + (r.ms / 1000).toFixed(1) + "s" + OFF);
    r.notes.forEach(n => console.log("      " + DIM + n + OFF));
    r.fails.forEach(f => console.log("      " + RED + "✗ " + OFF + f));
  }

  const failed = results.filter(r => r.fails && r.fails.length);
  const skipped = results.filter(r => r.skipped);
  console.log("");
  console.log(failed.length
    ? RED + failed.length + " of " + (results.length - skipped.length) + " suites failed." + OFF
    : GREEN + "All " + (results.length - skipped.length) + " suites passed." + OFF +
      (skipped.length ? DIM + "  (" + skipped.length + " skipped)" + OFF : ""));
  return failed.length ? 1 : 0;
}

main().then(code => process.exit(code), err => { console.error(err); process.exit(2); });
