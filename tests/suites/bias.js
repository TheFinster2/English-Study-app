/* ANSWER BIAS — can the bank be beaten without reading the question?
   ============================================================================
   This is the suite that cost the most to get right, and the one most likely to rot,
   because every batch of new questions reintroduces the defect. The failure mode is not
   subtle once measured and completely invisible otherwise: an author writing the key
   knows the answer, so the key gets the qualifying clause, and "pick the longest option"
   becomes a strategy. First measurement of the Common-Module bank was 69.7% longest-key
   against a 25% chance baseline.

   Two things it took a while to learn, both encoded here:

     1. THE METRIC IS THE RANK DISTRIBUTION, not the endpoints. Extending distractors to
        fix a longest-key tell drove the bank to 1.6% longest — and 79% at rank two, so
        the strategy simply became "pick the second longest". Only a roughly flat spread
        across all four ranks means there is no length strategy at all.

     2. IT MUST BE CHECKED PER FILE. An overall figure inside the limit hides one module
        that is badly skewed, and a student drilling that module is the one being taught
        the shortcut.
   ============================================================================ */
"use strict";
const { loadData, dataFiles, allQuestions } = require("../lib/measure");
const { byLength, byShortest, byJargon, lengthRanks } = require("../lib/bias");

/* Percentages, matching what tests/lib/bias.js reports. Chance is 25%. These allow real
   slack — content written by a human will never be perfectly flat — while staying far
   below the level at which a strategy pays. */
const LIMIT_OVERALL = 32;
const LIMIT_PER_FILE = 38;
const LIMIT_RANK = 36;
const RANK_FLOOR = 12;

module.exports = {
  name: "bias",
  about: "answer-length, rank and jargon tells across the question bank",

  run(t, { ROOT }) {
    const { EN } = loadData(ROOT, dataFiles(ROOT));
    const qs = allQuestions(EN);
    t.atLeast(qs.length, 400, "questions to measure");

    /* ── the endpoints ── */
    const longest = byLength(qs).pct;
    const shortest = byShortest(qs).pct;
    const jargon = byJargon(qs).pct;
    t.atMost(longest, LIMIT_OVERALL, "share of keys that are the longest option");
    t.atMost(shortest, LIMIT_OVERALL, "share of keys that are the shortest option");
    t.atMost(jargon, LIMIT_OVERALL, "share of keys that are the most jargon-heavy option");
    t.note("longest " + pc(longest) + " · shortest " + pc(shortest) + " · jargon " + pc(jargon) +
           "  (chance 25%)");

    /* ── the distribution, which is the real test ── */
    const ranks = lengthRanks(qs).pcts;
    t.note("key length rank 1|2|3|4: " + ranks.map(pc).join(" | "));
    ranks.forEach((share, i) => {
      t.atMost(share, LIMIT_RANK, "share of keys at length rank " + (i + 1));
    });
    /* No rank may be starved either — a rank at 8% is a tell in reverse, since it tells
       the student which option NOT to pick. */
    ranks.forEach((share, i) => {
      t.atLeast(share, RANK_FLOOR, "share of keys at length rank " + (i + 1) + " (too rare is also a tell)");
    });

    /* ── per file ── */
    const byFile = {};
    Object.keys(EN.DATA).filter(k => /^q[A-Z0-9]/.test(k) && Array.isArray(EN.DATA[k]))
      .forEach(k => { byFile[k] = EN.DATA[k]; });
    Object.keys(byFile).sort().forEach(k => {
      const set = byFile[k];
      if (set.length < 20) return;                    // too small for the figure to mean much
      const l = byLength(set).pct, s = byShortest(set).pct;
      t.atMost(l, LIMIT_PER_FILE, k + ": longest-option keys");
      t.atMost(s, LIMIT_PER_FILE, k + ": shortest-option keys");
      t.note("  " + k.padEnd(14) + set.length + " questions · longest " + pc(l) + " · shortest " + pc(s));
    });

    /* ── the position tell ──────────────────────────────────────
       Every key is authored at index 0 and shuffled at play time, so authored position
       cannot leak — but assert it, because an author "fixing" a question by moving the
       right answer would silently break the shuffle contract. */
    t.ok(qs.every(q => q.a === 0), "every key is authored at index 0 (shuffled at play time)");

    /* ── the all-of-the-above family ────────────────────────────
       Options that hedge ("both", "all of these", "none of the above") are guessable and
       almost always the key when present. */
    const hedges = /^(both|all|none|any) (of )?(the )?(above|these|them)\b/i;
    const hedged = qs.filter(q => q.choices.some(c => hedges.test(c.trim()))).map(q => q.id);
    t.eq(hedged.slice(0, 5), [], hedged.length + " questions with an all-of-the-above style option");

    /* ── absolutes in distractors ───────────────────────────────
       "always", "never", "only" in a distractor and not in the key is a classic tell:
       students learn to reject the absolute without reading it. */
      const tell = qs.filter(q => {
      const abs = c => /\b(always|never|entirely|exclusively|nothing but|only ever)\b/i.test(c);
      const keyAbs = abs(q.choices[q.a]);
      const distAbs = q.choices.filter((c, i) => i !== q.a).some(abs);
      return distAbs && !keyAbs;
    });
    t.atMost((tell.length / qs.length) * 100, 12,
             "share of questions where only a distractor uses an absolute (%)");
    t.note(tell.length + " questions put an absolute in a distractor but not the key");
  }
};

const pc = x => x.toFixed(1) + "%";
