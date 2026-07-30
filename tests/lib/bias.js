/* Answer-position bias measurement, shared by validate.js and the authoring loop.
   Two checks, because English needs both (§9.7a):

     longest — score by always picking the longest option. The reference chemistry app
               measured 63.9% this way before 156 questions were rewritten.
     jargon  — score by always picking the option with the most analytical vocabulary.
               This matters more in English than in any other subject: when options are
               written quickly, the sophisticated-sounding one is almost always the
               intended answer, and a student can beat chance without reading the text.

   Both are reported overall AND per topic, because a healthy 24% average can hide one
   topic sitting at 38% (addendum D1). */

const JARGON = ["juxtapos", "positions the", "destabilis", "problematis", "foreground",
  "interrogat", "subvert", "undercut", "enact", "reifie", "elide",
  "construct", "mediate", "conceptual", "structural", "syntax", "syntactic",
  "register", "mechanism", "epistem", "ontolog", "discursive", "rhetorical",
  "paradox", "ironic", "dialectic", "hermeneutic", "metatext", "intertext",
  "signifi", "textual", "modality", "aporia", "liminal", "reflexive",
  "positions", "compress", "collaps", "articulat", "grammatical", "formal"];

const jargonScore = s => JARGON.reduce((n, j) => n + (s.toLowerCase().includes(j) ? 1 : 0), 0);

/** Score a bank by a "pick the option with the highest metric" strategy.
    A tie is credited fractionally, since a guesser picking among tied maxima has
    exactly that chance of being right. `strictPct` counts only unique maxima. */
function biasBy(bank, metric) {
  let win = 0, strictWin = 0, ties = 0;
  const offenders = [];
  for (const q of bank) {
    const scores = q.choices.map(metric);
    const max = Math.max(...scores);
    const winners = scores.filter(s => s === max).length;
    if (scores[q.a] === max) {
      win += 1 / winners;
      if (winners === 1) { strictWin++; offenders.push(q.id); }
      else ties++;
    }
  }
  return { pct: bank.length ? (win / bank.length) * 100 : 0,
           strictPct: bank.length ? (strictWin / bank.length) * 100 : 0,
           ties, n: bank.length, offenders };
}

const byLength = bank => biasBy(bank, c => c.length);
const byJargon = bank => biasBy(bank, jargonScore);

/** Report bias per group so one bad topic can't hide behind a healthy average. */
function byGroup(bank, keyFn, fn) {
  const groups = {};
  for (const q of bank) {
    const k = keyFn(q);
    (groups[k] || (groups[k] = [])).push(q);
  }
  return Object.entries(groups)
    .map(([k, v]) => Object.assign({ group: k }, fn(v)))
    .sort((a, b) => b.pct - a.pct);
}

module.exports = { byLength, byJargon, byGroup, jargonScore, biasBy };

/**
 * Where the key sits when the four options are ranked by length, 1 = longest.
 *
 * Overshooting matters as much as the original defect: driving longest-option scoring
 * to near zero just replaces one tell with its mirror, and "always pick the shortest"
 * is exactly as cheap a strategy as "always pick the longest". A healthy bank has the
 * key's length rank close to uniform across all four positions.
 */
function lengthRanks(bank) {
  const counts = [0, 0, 0, 0];
  for (const q of bank) {
    const ls = q.choices.map(c => c.length);
    const keyLen = ls[q.a];
    // Rank with ties resolved to the midpoint, so a 4-way tie counts as rank 2.5.
    const longer = ls.filter(l => l > keyLen).length;
    const equal = ls.filter(l => l === keyLen).length;
    const rank = longer + (equal + 1) / 2;      // 1..4
    counts[Math.min(3, Math.max(0, Math.round(rank) - 1))]++;
  }
  const n = bank.length || 1;
  return { counts, pcts: counts.map(c => (c / n) * 100),
           /* Largest deviation from the 25% each position should hold. */
           worst: Math.max(...counts.map(c => Math.abs((c / n) * 100 - 25))) };
}

const byShortest = bank => biasBy(bank, c => -c.length);

module.exports.lengthRanks = lengthRanks;
module.exports.byShortest = byShortest;
