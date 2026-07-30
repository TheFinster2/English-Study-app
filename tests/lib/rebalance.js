/* Length-rank rebalancer for a question bank.
   ============================================================================
   Trims the trailing subordinate clause off over-long distractors until the key's
   length rank hits a target. It only ever REMOVES a clause it can cut at a comma
   boundary, so the distractor stays a grammatical sentence and a plausible wrong
   answer — this reverses padding rather than inventing content.

   Why a tool rather than more hand-editing: three banks in this app have each needed a
   remediation pass, and the failure alternates. Writing the analytical clause only into
   the key gives 50-70% longest-option scoring; over-correcting gives 46% shortest.
   Neither is acceptable and both are mechanical, so the fix should be too.
   ============================================================================ */

/** Cut the last trailing clause off a sentence, at a comma or em-dash boundary. */
function trimClause(s) {
  const m = s.match(/^(.*),\s+(which|since|and|so|where|whose|but|because|as|though|when|whereas|the|his|her|its|their|it|they|each|both|one|nothing|every)\b[^,]*$/);
  if (m && m[1].length > 40) return m[1];
  /* An em-dash gloss is the other clause boundary this prose uses constantly, and it is
     the one that lets a KEY be shortened — keys are often a claim plus a dash plus its
     own justification, and the justification is already in the `why`. */
  const d = s.lastIndexOf(" — ");
  if (d > 30) return s.slice(0, d);
  // No clean clause boundary: fall back to the last comma if enough text survives.
  const i = s.lastIndexOf(", ");
  if (i > 45) return s.slice(0, i);
  return null;
}

/**
 * Push the key's length rank toward `targetRank` (1 = longest) for one question.
 *
 * Two directions, both by trimming:
 *   rank too HIGH (key too short) → trim the distractors that are longer than it
 *   rank too LOW  (key too long)  → trim the KEY
 *
 * Trimming the key is a quality improvement as often as not: the clause being removed
 * is usually one that duplicates what the `why` already explains, and a key reads
 * better as a claim than as a claim plus its own justification.
 *
 * Mutates nothing; returns { choices, changed, rank }.
 */
function rebalanceOne(q, targetRank) {
  const choices = q.choices.slice();
  const keyLen = () => choices[q.a].length;
  const rankNow = () => choices.filter((c, i) => i !== q.a && c.length > keyLen()).length + 1;
  let changed = 0;

  for (let guard = 0; guard < 14; guard++) {
    const rank = rankNow();
    if (rank === targetRank) break;

    let idx, next;
    if (rank > targetRank) {
      // Key is too short: shorten the longest distractor still above it.
      let pick = -1, best = -1;
      choices.forEach((c, i) => { if (i !== q.a && c.length > keyLen() && c.length > best) { best = c.length; pick = i; } });
      if (pick < 0) break;
      idx = pick;
    } else {
      // Key is too long: shorten the key until enough distractors overtake it.
      idx = q.a;
    }
    next = trimClause(choices[idx]);
    if (!next) break;

    /* A single cut can move the key two ranks at once, which is how earlier passes
       oscillated between over- and under-correction. Try the cut, and revert it if it
       lands further from the target than it started. */
    const before = choices[idx];
    choices[idx] = next;
    const after = rankNow();
    if (Math.abs(after - targetRank) >= Math.abs(rank - targetRank)) {
      choices[idx] = before;
      break;
    }
    changed++;
  }
  return { choices, changed, rank: rankNow() };
}

/** Assign each question in a bank a target rank so the distribution is uniform. */
function targets(bank) {
  // Deterministic: cycle 1,2,3,4 through the bank in id order.
  const ids = bank.map(q => q.id).slice().sort();
  const t = {};
  ids.forEach((id, i) => { t[id] = (i % 4) + 1; });
  return t;
}

module.exports = { trimClause, rebalanceOne, targets };
