/* CALIBRATION SET — hand-labelled responses to real prompts.
   ============================================================================
   The thresholds in js/data/freetext.js were never calibrated: all 62 prompts shipped
   with the same copied number, and when it was finally measured it turned out to be
   punishing the students who wrote best. This file is the evidence base so that never
   happens silently again.

   Labels are a MARKER'S judgement of the response, not a prediction of what the app will
   say. That distinction is the whole point — the suite compares the two and reports where
   they disagree, which is how you find out a threshold is wrong instead of assuming it.

     good     what you would want; makes the point and says what the choice does
     decent   the point is there but thinly — no technique named, or no effect stated
     thin     on topic, says nothing analytical; the "it makes it more interesting" answer
     wrong    a misreading, an inversion, or plot recount

   The expected mark band per label is deliberately WIDE. A rubric out of four cannot be
   predicted to the mark from a label, and a suite that demanded it would fail on honest
   authoring differences rather than on regressions. What must hold is the ordering and the
   two failures a student notices: a good answer scored as a failure, or a wrong answer
   given full marks.

   Adding to this file is the cheapest useful contribution to the app. Write a response you
   would give, label it honestly, and run `node tests/run.js calibrate`.
   ============================================================================ */
"use strict";

/* [promptId, label, response] */
module.exports = [

  /* ── ft-001 · Common Module · language and power ─────────── */
  ["ft-001", "good", "Orwell positions the slogans as the mechanism of control, since restricting the available words restricts what dissent can even be phrased in."],
  ["ft-001", "good", "By shrinking the vocabulary, the Party forecloses the sentences a rebel would need, so language becomes the instrument of power."],
  ["ft-001", "good", "The slogans construct thought rather than describing it: Orwell suggests that a mind with no word for freedom cannot formulate the wish."],
  ["ft-001", "decent", "The slogans show that whoever controls language controls thought."],
  ["ft-001", "decent", "Orwell suggests power works through language rather than only through force."],
  ["ft-001", "decent", "Language is what the Party uses to keep control of what people think."],
  ["ft-001", "thin", "The slogans are memorable and repeated a lot."],
  ["ft-001", "thin", "This shows how powerful the Party is in the novel."],
  ["ft-001", "wrong", "Language cannot really change what people privately believe."],
  ["ft-001", "wrong", "Winston works at the Ministry of Truth and rewrites old newspapers."],
  ["ft-001", "wrong", "Controlling what can be thought lets the Party control the available language."],

  /* ── ft-002 · Common Module · the chiastic slogan ────────── */
  ["ft-002", "good", "The chiasmus closes the loop, so Orwell leaves a reader no vantage point outside the sentence from which to test it."],
  ["ft-002", "good", "Because the terms swap places, the structure forecloses disagreement — every position a reader could argue from is already inside the claim."],
  ["ft-002", "good", "The inversion makes the claim self-sealing: Orwell constructs a sentence that accounts for its own refutation in advance."],
  ["ft-002", "decent", "The inverted structure makes the claim impossible to argue with."],
  ["ft-002", "decent", "It creates a circular effect that traps the reader."],
  ["ft-002", "thin", "The repetition makes it rhythmic and easy to memorise."],
  ["ft-002", "thin", "The structure is clever and makes the slogan stand out."],
  ["ft-002", "wrong", "The inversion shows the future controls the past, not the other way round."],
  ["ft-002", "wrong", "It is a paradox, which means it contradicts itself and cannot be true."],

  /* ── ft-003 · Common Module · synecdoche ─────────────────── */
  ["ft-003", "good", "Substituting the boot for the man removes the person doing it, so Orwell leaves a mechanism where an encounter should be."],
  ["ft-003", "good", "The part standing for the whole strips out agency: there is no one to hold responsible, only an apparatus."],
  ["ft-003", "decent", "It takes away the individual people and leaves just the violence."],
  ["ft-003", "decent", "Orwell removes the human being so the cruelty seems impersonal."],
  ["ft-003", "thin", "Synecdoche is used here to describe the people in the novel."],
  ["ft-003", "thin", "It makes the image more powerful and easier to picture."],
  ["ft-003", "wrong", "It makes the violence more vivid, so the reader can picture the suffering clearly."],
  ["ft-003", "wrong", "The whole is used to stand for the part, which exaggerates the individual."],

  /* ── ft-018 · Module A · the passive in the Hymn ─────────── */
  ["ft-018", "good", "The passive concedes that he will not make the music but be made into it, so Donne surrenders selfhood as material rather than offering it as a gift."],
  ["ft-018", "good", "Being 'made' rather than making relocates agency to God, so the speaker admits he is the instrument and not the player."],
  ["ft-018", "decent", "The passive shows he gives up control and lets God act on him."],
  ["ft-018", "decent", "He becomes the thing that is used rather than the one using it."],
  ["ft-018", "thin", "The passive voice makes the line sound calm and accepting."],
  ["ft-018", "wrong", "It shows the physical helplessness that serious illness imposes on the body."],
  ["ft-018", "wrong", "He is making music for God, which shows his devotion is active."],

  /* ── ft-031 · Module B · where the rebellion fails ───────── */
  ["ft-031", "good", "Shakespeare locates the failure in character rather than in cause — Hotspur's nerve, not any flaw in the Percy claim."],
  ["ft-031", "good", "The play puts the collapse in temperament: the rebellion is defeated by its own men's impatience before its argument is ever tested."],
  ["ft-031", "decent", "It fails because of the people leading it rather than the cause itself."],
  ["ft-031", "decent", "Hotspur's personality is what brings the rebellion down."],
  ["ft-031", "thin", "The rebellion fails at the battle of Shrewsbury near the end."],
  ["ft-031", "wrong", "In the strategic incompetence of the rebel leadership at the battle of Shrewsbury."],
  ["ft-031", "wrong", "The play shows the Percy claim was legally weak, which is why it fails."],

  /* ── ft-050 · Module C · the missing concession ───────────── */
  ["ft-050", "good", "It forfeits credibility: naming the strongest version of the other side is what separates persuasion from assertion."],
  ["ft-050", "good", "Without the concession the piece never demonstrates it has understood the objection, so it can only assert rather than persuade."],
  ["ft-050", "decent", "It loses credibility because it looks like it is ignoring the other side."],
  ["ft-050", "decent", "The reader stops trusting a writer who will not admit anything."],
  ["ft-050", "thin", "It makes the piece less balanced and a bit one-sided."],
  ["ft-050", "wrong", "It loses marks for structure, since the standard persuasive form requires a counter-argument."],
  ["ft-050", "wrong", "Nothing — leaving out the concession makes the argument stronger and more focused."]
];
