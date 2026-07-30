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

/** Cut the last ", which…" / ", since…" / ", and…" clause off a sentence. */
function trimClause(s) {
  const m = s.match(/^(.*),\s+(which|since|and|so|where|whose|but|because|as|though|when|whereas|the|his|her|its|their|it|they|each|both|one|nothing|every)\b[^,]*$/);
  if (m && m[1].length > 40) return m[1];
  // No clean clause boundary: fall back to the last comma if enough text survives.
  const i = s.lastIndexOf(", ");
  if (i > 45) return s.slice(0, i);
  return null;
}

/**
 * Push the key's length rank toward `targetRank` (1 = longest) for one question.
 * Mutates nothing; returns { choices, changed }.
 */
function rebalanceOne(q, targetRank) {
  const choices = q.choices.slice();
  const keyLen = () => choices[q.a].length;
  const rankNow = () => choices.filter((c, i) => i !== q.a && c.length > keyLen()).length + 1;
  let changed = 0;
  // Trim the longest distractor repeatedly until we are at or below the target rank.
  for (let guard = 0; guard < 12 && rankNow() > targetRank; guard++) {
    let pick = -1, best = -1;
    choices.forEach((c, i) => { if (i !== q.a && c.length > keyLen() && c.length > best) { best = c.length; pick = i; } });
    if (pick < 0) break;
    const t = trimClause(choices[pick]);
    if (!t) break;
    choices[pick] = t;
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
