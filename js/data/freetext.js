/* LAYER C PROMPTS — free text marked by sentence embeddings.
   ============================================================================
   Authored answers-first (§9.9). Writing the prompt first produces prompts that admit
   readings the exemplars don't cover, and every one of those is a false rejection of a
   correct student — the most damaging error this app can make.

   Every prompt carries 3–5 GENUINELY DIFFERENT valid answers, not paraphrases of one.
   Taking the best cosine across all of them does more for accuracy than any amount of
   threshold tuning, because English questions really do have many right answers and a
   single exemplar encodes one person's phrasing as the truth.

   Every prompt also carries 2–3 `nearMiss` entries: semantically CLOSE and wrong.
   These are the inversions and misreadings you would otherwise write as MCQ
   distractors, pointed at the marker instead. They are what stops the app confidently
   accepting the opposite of the right answer, which embeddings will otherwise do —
   "Hotspur values honour above pragmatism" and its inversion score 0.974 against each
   other (measured, tests/embed-harness.js).

   mark.js adds the prompt itself to nearMiss at runtime, so pasting the question back
   is closed off without authoring anything (§9.8).

   `threshold` is set by tests/calibrate.js against ~120 hand-labelled responses, not
   guessed. Prompts left at DEFAULT use Mark.DEFAULT_THRESHOLD.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

/* ── A NOTE ON `threshold` ────────────────────────────────────────────────────
   0.38. These shipped at 0.62, went to 0.50 on a first measurement, and are here because
   the full calibration set (tests/data/calibration.js, 49 hand-labelled responses) showed
   the real shape of the problem:

     good answers    cosine 0.396 – 0.906
     wrong answers   cosine 0.113 – 0.979

   The distributions OVERLAP. 384 dimensions cannot separate "made the point" from
   "misread it" on absolute similarity, so no threshold exists that scraps no good answer
   and passes no wrong one. Pretending otherwise is what produced 0.62, where a good answer
   came back "not yet" for being longer and more careful than the model.

   So the threshold is set below the weakest good answer, and the FOURTH mark is gated on
   the contrast instead (Mark.FULL_MARK_GATE) — a wrong answer sits close to its own
   near-miss by construction, a good one does not. Measured: 0.50 with no gate scrapped
   four good answers; 0.38 with the gate scraps none and lets one thin answer reach full
   marks. That is the better trade, because a false pass still shows the student every
   model answer, while a good answer marked 1/4 teaches them not to trust the app.

   IF YOU CHANGE THIS, run `node tests/run.js calibrate` and read the disagreements. A
   per-prompt threshold overrides Mark.DEFAULT_THRESHOLD, which is how the last two
   retunings silently did nothing.
   ──────────────────────────────────────────────────────────────────────────── */
EN.DATA.freeText = [

  /* ═══ Say It In One — 1984 ═════════════════════════════════ */
  { id:"ft-001", mod:"common", text:"1984", mode:"sayit", domain:"common/language-power",
    prompt:"In one sentence, state what Orwell's Party slogans suggest about the relationship between language and power.",
    answers:[
      "Controlling the available language lets the Party control what can be thought.",
      "Orwell presents language as the instrument through which power reproduces itself.",
      "By narrowing which words exist, the Party narrows the range of possible dissent.",
      "Power operates by supplying the sentences in which opposition would have to be phrased."],
    nearMiss:[
      "The Party uses slogans because propaganda is memorable and easy to repeat.",
      "Language is controlled by the people rather than by the Party.",
      "Orwell shows that words cannot really change what people privately believe."],
    threshold:0.38 },

  { id:"ft-002", mod:"common", text:"1984", mode:"sayit", domain:"common/chiasmus",
    quote:"1984-q04",
    prompt:"The Party's slogan about the past is chiastic. In one sentence, state what that structure does to a reader.",
    answers:[
      "The inverted clauses close the loop, so there is no position outside the sentence from which to check it.",
      "Because the terms swap places, the claim contains every vantage point a reader might use to dispute it.",
      "The circular form makes the assertion unfalsifiable rather than merely persuasive.",
      "The structure leaves the reader nowhere to stand, since both halves already account for each other."],
    nearMiss:[
      "The repetition makes the slogan rhythmic and easy for citizens to memorise.",
      "The inversion shows that the future controls the past rather than the other way round.",
      "The structure emphasises the importance of history to the Party's programme."],
    threshold:0.38 },

  { id:"ft-003", mod:"common", text:"1984", mode:"sayit", domain:"common/synecdoche",
    quote:"1984-q07",
    prompt:"O'Brien's boot and face are both synecdoche. In one sentence, state what the substitution removes.",
    answers:[
      "It removes the particular people, leaving a mechanism rather than an encounter.",
      "Agency disappears from both sides, so oppression reads as a process nobody is performing.",
      "By naming only body parts, Orwell strips the image of anyone who could be reasoned with.",
      "The image has no participants, which is why it cannot be bargained with or shamed."],
    nearMiss:[
      "It makes the violence more vivid, so the reader can picture the suffering clearly.",
      "It shows that the soldier is more powerful than the prisoner beneath him.",
      "It generalises the image so the reader sees oppression as a recurring historical pattern."],
    threshold:0.38 },

  { id:"ft-004", mod:"common", text:"1984", mode:"sayit", domain:"common/appendix",
    prompt:"In one sentence, state why the Appendix's past tense contradicts the novel's ending.",
    answers:[
      "A historical account of Newspeak requires a later observer, so the Party must have fallen.",
      "The past tense implies a reader for whom the regime is finished, which the narrative denies.",
      "Describing Newspeak as something that was designed presupposes a world where it no longer operates.",
      "Someone is studying the Party at leisure, which is impossible if Part Three's world persists."],
    nearMiss:[
      "The Appendix confirms that Newspeak succeeded in eliminating thoughtcrime completely.",
      "The past tense shows that Winston's rebellion had already failed before the novel began.",
      "It explains the Party's language so readers can understand the slogans in the narrative."],
    threshold:0.38 },

  { id:"ft-005", mod:"common", text:"1984", mode:"sayit", domain:"common/fid",
    quote:"1984-q49",
    prompt:"In one sentence, state what free indirect discourse lets Orwell do at the novel's close that direct speech could not.",
    answers:[
      "It puts Winston's relief and the reader's horror in the same clause with no narrator to separate them.",
      "The sentence is simultaneously his consolation and Orwell's indictment, and nothing adjudicates between them.",
      "Because the words are unattributed, the reader cannot dismiss them as merely something Winston said.",
      "It reports a feeling from inside while refusing to endorse it from outside."],
    nearMiss:[
      "It shows that Winston is speaking aloud, so his conversion has become public.",
      "It creates distance so the reader can judge Winston's defeat objectively.",
      "It gives the narrator's own verdict on whether Winston's situation has improved."],
    threshold:0.38 },

  { id:"ft-006", mod:"common", text:"1984", mode:"sayit", domain:"common/anomaly",
    prompt:"In one sentence, state the anomaly in Winston's attitude to the proles.",
    answers:[
      "He needs them to be fully human for his hope to mean anything, and has absorbed the doctrine that they are not.",
      "Winston places his hope in a class he has been taught to regard as beneath humanity.",
      "His political hope and his inherited contempt for the proles occupy the same diary.",
      "He can only see them as legend, which is why he never manages to speak to one usefully."],
    nearMiss:[
      "Winston believes the proles will overthrow the Party, and the novel proves him right.",
      "He is contemptuous of the proles and never hopes for anything from them at all.",
      "The proles are more free than Winston because the Party does not watch them."],
    threshold:0.38 },

  { id:"ft-007", mod:"common", text:"1984", mode:"sayit", domain:"common/room101",
    prompt:"In one sentence, state what Room 101's individuation reveals about the Party's aims.",
    answers:[
      "The Party has to know you personally in order to make you betray yourself specifically.",
      "Its final technology is not pain but personalisation, tailored from a file.",
      "A universal torture would produce compliance, and the Party wants a particular sentence only you can say.",
      "Room 101 needs your individual attachments because generic terror cannot produce self-disgust."],
    nearMiss:[
      "It makes the torture unpredictable, so prisoners cannot prepare for what awaits them.",
      "It shows the Party is more interested in information than in obedience.",
      "Fear is cheaper to administer across a population than physical violence."],
    threshold:0.38 },

  { id:"ft-008", mod:"common", text:"1984", mode:"sayit", domain:"common/passive",
    quote:"1984-q25",
    prompt:"In one sentence, state what the passive voice does to Winston's account of the Party's falsifications.",
    answers:[
      "Deleting the agent makes the erasure read like weather rather than policy.",
      "There is no subject in the sentence, and Winston is the one doing the destroying.",
      "The passive removes anyone responsible, which is why the process seems to have no author.",
      "It describes an act he performs daily as something that simply happens."],
    nearMiss:[
      "The passive voice emphasises the enormous scale of the Party's falsification programme.",
      "It creates a formal documentary register suited to Winston's archival work.",
      "It shows that Winston refuses to take responsibility for what he has done."],
    threshold:0.38 },

  { id:"ft-009", mod:"common", text:"1984", mode:"sayit", domain:"common/doublethink",
    prompt:"In one sentence, state why doublethink is more frightening than external coercion.",
    answers:[
      "It relocates the regime inside the citizen, where no rebellion can reach it.",
      "A coerced person keeps a self that disagrees, and doublethink dissolves the disagreement.",
      "The Party does not need to watch you if you will do the watching yourself.",
      "Acceptance rather than deception means there is nothing left to expose or correct."],
    nearMiss:[
      "It saves the Party the cost of maintaining telescreens and Thought Police everywhere.",
      "It shows the population is complicit rather than oppressed, which absolves the Party.",
      "Doublethink is a form of confusion that makes citizens easier to mislead."],
    threshold:0.38 },

  { id:"ft-010", mod:"common", text:"1984", mode:"sayit", domain:"common/opening",
    quote:"1984-q01",
    prompt:"In one sentence, state why altering only the last two words of the novel's opening is more unsettling than an overtly strange setting.",
    answers:[
      "The world stays recognisably ours, so the reader has no distance to retreat into.",
      "A single adjustment to a familiar England leaves nowhere to file the book as fantasy.",
      "Because almost nothing has changed, the reader cannot treat the regime as somebody else's problem.",
      "The familiar sentence makes the one alteration feel like an intrusion rather than an invention."],
    nearMiss:[
      "It signals the novel's genre immediately so the reader sets aside expectations of realism.",
      "It contrasts the pleasant weather with the harshness of the regime that governs it.",
      "The clocks introduce the motif of time that structures Winston's working day."],
    threshold:0.38 },

  /* ═══ Say It In One — Donne ════════════════════════════════ */
  { id:"ft-011", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/apostrophe",
    quote:"donne-q01",
    prompt:"In one sentence, state why Donne addresses Death directly at the opening of Holy Sonnet 10.",
    answers:[
      "You cannot argue with mortality, and you can argue with a person.",
      "Personifying Death manufactures an opponent the sonnet can then demolish.",
      "Apostrophe gives the poem something to contend with rather than something to lament.",
      "Summoning Death in the vocative is a tactic, since the whole sonnet is a demolition."],
    nearMiss:[
      "It establishes a sombre tone appropriate to a devotional sonnet about dying.",
      "It shows the speaker is frightened of death and is trying to reassure himself.",
      "Personification was the conventional opening for a religious poem of the period."],
    threshold:0.38 },

  { id:"ft-012", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/conceit",
    quote:"donne-q14",
    prompt:"In one sentence, state what makes the compass a conceit rather than a decorative simile.",
    answers:[
      "It develops as a logical argument with a conclusion the last line states.",
      "The comparison is a proof defending a claim about union against the fact of separation.",
      "It arrives as a concession and reasons geometrically to a result, so it can be followed and refuted.",
      "The figure does argumentative work rather than illustrating something already established."],
    nearMiss:[
      "It is longer and more elaborate than an ordinary simile would be.",
      "It compares two very unlike things, which creates a striking visual image.",
      "It is characteristic of the metaphysical poets and their fondness for ingenuity."],
    threshold:0.38 },

  { id:"ft-013", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/spondee",
    quote:"donne-q04",
    prompt:"In one sentence, state the relationship between the metre of 'Batter my heart' and what the speaker is asking for.",
    answers:[
      "The broken iamb is the request itself, not an illustration of it.",
      "Two stresses force the reader's own mouth to deliver the violence being demanded.",
      "A poem asking to be battered cannot open smoothly, so the metrical assault enacts the plea.",
      "The spondee performs the force the speaker wants applied to him."],
    nearMiss:[
      "The irregular metre reflects the speaker's genuine spiritual distress and confusion.",
      "The rhythm imitates the fragmentation of the heart he is asking God to break.",
      "The metre is rough because Donne was careless about accent in his verse."],
    threshold:0.38 },

  { id:"ft-014", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/polyptoton",
    quote:"donne-q02",
    prompt:"In one sentence, state what the repetition of the root in 'Death, thou shalt die' achieves.",
    answers:[
      "The line performs the reversal it asserts, so grammar rather than argument carries the victory.",
      "The same word as subject and as fate makes the sentence turn on itself.",
      "The couplet wins by making the reversal happen inside the vocabulary rather than proving it.",
      "Noun becomes verb in four words, which is the defeat enacted rather than described."],
    nearMiss:[
      "It emphasises the word death through repetition, which increases the line's force.",
      "It creates a memorable closing cadence of the kind a sonnet's couplet requires.",
      "It shows that death will be defeated at the Last Judgement according to scripture."],
    threshold:0.38 },

  { id:"ft-015", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/volta",
    quote:"donne-q11",
    prompt:"In one sentence, state what the volta of Holy Sonnet 7 does to the octave.",
    answers:[
      "It retracts it — having demanded the apocalypse, the speaker asks for a postponement.",
      "The turn is a loss of nerve, and Donne leaves the withdrawn demand standing on the page.",
      "Eight lines of summons are cancelled, which makes the sonnet a record of a reversal.",
      "The sestet takes back what the octave commanded rather than resolving it."],
    nearMiss:[
      "It completes the octave by explaining why the trumpets should sound at this moment.",
      "It restricts the summons to the righteous rather than to all the dead.",
      "It resolves the sonnet's problem by turning from judgement to mercy."],
    threshold:0.38 },

  { id:"ft-016", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/syllogism",
    quote:"donne-q22",
    prompt:"In one sentence, state what 'The Flea' teaches a reader about arguments.",
    answers:[
      "An argument can be logically watertight and completely absurd, because validity says nothing about premises.",
      "Valid reasoning from a false premise produces a conclusion that cannot be resisted logically or accepted seriously.",
      "The poem demonstrates that following every step of a proof is not the same as agreeing with it.",
      "Form and truth come apart: the syllogism works and the premise does not."],
    nearMiss:[
      "It shows that seduction and logic use exactly the same techniques of persuasion.",
      "It proves that physical intimacy is as trivial as the speaker claims it is.",
      "It demonstrates that the beloved's objections rest on convention rather than principle."],
    threshold:0.38 },

  { id:"ft-017", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/aubade",
    quote:"donne-q18",
    prompt:"In one sentence, state what Donne achieves by insulting the sun rather than lamenting the dawn.",
    answers:[
      "Abuse denies the sun authority over lovers, where lament would concede it.",
      "It installs the poem's claim that the bedroom outranks the cosmos before any argument for it.",
      "Inverting the aubade's convention makes the private world the frame the universe is measured against.",
      "Insult refuses the genre's premise that time has jurisdiction over desire."],
    nearMiss:[
      "It characterises the speaker as irritable and therefore unreliable as a lover.",
      "It makes the poem comic, so its extravagant claims need not be taken seriously.",
      "It shows the speaker resents having to leave and get on with his day."],
    threshold:0.38 },

  { id:"ft-018", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/hymn",
    quote:"donne-q25",
    prompt:"In one sentence, state what the passive construction 'I shall be made thy music' concedes.",
    answers:[
      "He is not going to make music but to be made into it, so selfhood is surrendered as material.",
      "The speaker offers himself up as an instrument rather than as a performer.",
      "The passive dissolves the maker into the thing made, which is the opposite of Holy Sonnet 14's demands.",
      "Agency is given away, and the self becomes something played rather than something playing."],
    nearMiss:[
      "It shows the physical helplessness that serious illness imposes on the body.",
      "It signals the humility expected of devotional verse in the seventeenth century.",
      "It suggests he will join a heavenly choir and sing alongside the saints."],
    threshold:0.38 },

  /* ═══ Say It In One — W;t ══════════════════════════════════ */
  { id:"ft-019", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/insidious",
    quote:"wit-q04",
    prompt:"In one sentence, state what Vivian's correction of 'insidious' reveals about her.",
    answers:[
      "She meets catastrophe with philology because philology is all she has.",
      "Being right about a word is the only move available to her, and it is beside the point.",
      "She is told she is dying and discusses a Latin root, which is the play's whole diagnosis of her.",
      "Precision is her defence, and here it defends her against nothing that matters."],
    nearMiss:[
      "It demonstrates her intellectual superiority over the oncologist treating her.",
      "It shows she has not accepted the diagnosis and is arguing about terminology instead.",
      "It proves that literary training is more rigorous than medical training."],
    threshold:0.38 },

  { id:"ft-020", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/comma",
    quote:"wit-q06",
    prompt:"In one sentence, state why the play's title uses a semicolon.",
    answers:[
      "A semicolon walls the clause off where a comma would keep it continuous, and that difference is the play's argument.",
      "The mark names the editorial dispute the play turns on: how much separates life from life everlasting.",
      "It marks the wrong punctuation deliberately, since Ashford insists the comma is correct.",
      "The title is an act of textual criticism, staking everything on the size of a pause."],
    nearMiss:[
      "The semicolon divides the title as death divides life, which the structure repeats.",
      "It shows that Edson knew Donne's poetry well enough to notice the punctuation.",
      "A comma would have looked like a typographical error in the title of a play."],
    threshold:0.38 },

  { id:"ft-021", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/anagnorisis",
    quote:"wit-q10",
    prompt:"In one sentence, state what the passive voice of 'I have been found out' concedes.",
    answers:[
      "Something else did the finding out, and the recognition arrives in the vocabulary of academic exposure.",
      "She makes herself the object of a discovery rather than the author of an admission.",
      "The idiom belongs to a viva rather than a hospital, which is precisely what has been found out.",
      "Even her moment of self-knowledge is phrased in the professional language that caused it."],
    nearMiss:[
      "It shows she has lost the authority to narrate her own situation to the audience.",
      "It admits that her illness has progressed beyond the point where intelligence could help.",
      "It reveals that the medical staff have understood something she was concealing."],
    threshold:0.38 },

  { id:"ft-022", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/silence",
    quote:"wit-q40",
    prompt:"In one sentence, state why Edson ends a play made of words with a wordless stage direction.",
    answers:[
      "It is the strongest statement she could make about the limits of wit.",
      "After two hours of narration, an action she does not comment on is the one thing no speech could say.",
      "The final direction has no audience in it, so she is not performing for the first time.",
      "Giving the last word to something that is not a word is the play's argument completed formally."],
    nearMiss:[
      "It provides visual closure for an audience that has had no interval or scene break.",
      "It leaves the ending open so the audience can interpret it however they wish.",
      "The nakedness symbolises the vulnerability of a patient in a hospital gown."],
    threshold:0.38 },

  { id:"ft-023", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/mirroring",
    prompt:"In one sentence, state what Edson argues by staging Kelekian's grand rounds and Vivian's seminar identically.",
    answers:[
      "She is being treated as she taught, and the case is made structurally rather than stated.",
      "The mirroring puts her own method in front of her in a lab coat.",
      "Same blocking and same register means the audience sees the connection before anyone says it.",
      "Her humiliation is conducted in the manner she practised, which is why the play is not an attack on medicine."],
    nearMiss:[
      "It shows that medical and academic institutions are both cold and impersonal places.",
      "It establishes Kelekian as Vivian's intellectual equal and therefore a worthy antagonist.",
      "It invites the audience to laugh at the self-importance of both professions."],
    threshold:0.38 },

  { id:"ft-024", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/susie",
    quote:"wit-q23",
    prompt:"In one sentence, state why Edson gives the play's ethical victory to three letters rather than a speech.",
    answers:[
      "A procedural instrument beats rhetoric, and Susie wins using the institution's own machinery.",
      "The least educated character enforces a wish by knowing the paperwork, which is more honest than eloquence.",
      "A moving speech about dignity would have been sentimental, so Edson gives her an order on a chart.",
      "The victory is administrative, which is the only form of it the hospital could actually recognise."],
    nearMiss:[
      "Susie lacks the vocabulary for a longer argument, which the play treats as a strength.",
      "The abbreviation is faster than a sentence, which the medical emergency requires.",
      "It echoes the play's interest in how much meaning a very short mark can carry."],
    threshold:0.38 },

  { id:"ft-025", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/island",
    prompt:"In one sentence, state what W;t does with Donne's claim that no man is an island.",
    answers:[
      "It measures the claim against a life organised to disprove it, since Vivian has no visitors for eight months.",
      "The play puts a woman who can gloss the sentence in a ward where nobody comes.",
      "It shows the gap between what Vivian knows about the line and what she has done with it.",
      "The claim is not refuted but tested against a scholar who never applied it."],
    nearMiss:[
      "It proves the claim false, since Vivian dies essentially alone despite Donne's assertion.",
      "It confirms the claim through Susie, whose care shows that no patient is an island.",
      "It suggests scholarship can substitute for human connection if pursued seriously enough."],
    threshold:0.38 },

  /* ═══ Say It In One — Henry IV ═════════════════════════════ */
  { id:"ft-026", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/verse-shift",
    quote:"h4-q03",
    prompt:"In one sentence, state why Hal's shift into verse for 'I know you all' matters.",
    answers:[
      "He announces the betrayal in a register Falstaff cannot follow, so the form is the betrayal.",
      "Moving into verse puts the declaration in a language the man being watched has no access to.",
      "The switch is audible in performance, so the audience hears his real allegiance before understanding it.",
      "He leaves the prose of the scene in order to reclassify it as surveillance."],
    nearMiss:[
      "Verse marks him as a prince, which distinguishes him from his tavern companions.",
      "The change shows he is being sincere for the first time in the scene.",
      "Falstaff speaks prose because he is a commoner and Hal speaks verse because he is royal."],
    threshold:0.38 },

  { id:"ft-027", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/hotspur-foil",
    prompt:"In one sentence, state why Shakespeare's aging-down of Hotspur is strong evidence for the play's designed unity.",
    answers:[
      "The parallel is invented, so the doubling cannot be an accident of the source material.",
      "Making him Hal's contemporary is a deliberate manufacture the chronicles do not supply.",
      "Shakespeare altered history to create the foil, which proves the symmetry is a decision.",
      "The change is the one part of the rivalry that could not have been found in Holinshed."],
    nearMiss:[
      "It allows the two men to fight in single combat, which the play's climax requires.",
      "It makes the rebellion a conflict between generations, which runs through the tetralogy.",
      "It gives Hal a rival of comparable rank, which raises the stakes of the final act."],
    threshold:0.38 },

  { id:"ft-028", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/catechism",
    quote:"h4-q30",
    prompt:"In one sentence, state why the named weekday makes Falstaff's argument about honour so hard to answer.",
    answers:[
      "An abstraction is refuted by a corpse with a date attached, which nobody can argue with.",
      "The specificity turns a claim about honour into a demonstration involving an actual dead man.",
      "He argues like an empiricist, and a particular Wednesday is evidence rather than opinion.",
      "Naming the day makes the point checkable, so no general defence of honour can meet it."],
    nearMiss:[
      "It grounds the speech in the battle, which makes Falstaff's cynicism feel observed.",
      "The ordinariness of a Wednesday deflates the grandeur Hotspur has been pursuing.",
      "It shows Falstaff has been counting the dead, which makes him more attentive than he appears."],
    threshold:0.38 },

  { id:"ft-029", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/extempore",
    quote:"h4-q24",
    prompt:"In one sentence, state why 'I do, I will' is the hinge of the play.",
    answers:[
      "'I do' answers inside the game and 'I will' steps outside it, so the audience hears the rejection two plays early.",
      "The tense changes between two two-word clauses, which is where the whole tetralogy turns.",
      "A comic rehearsal contains the actual ending of the friendship, and the audience laughs at it.",
      "Hal changes speaker mid-sentence, moving from the King's line to his own future intention."],
    nearMiss:[
      "It is the shortest speech Hal makes, and the brevity makes the refusal unmistakable.",
      "It confirms the plan announced in the soliloquy, which the audience had hoped he would abandon.",
      "Falstaff has just made his best argument, and Hal refuses it without hesitating."],
    threshold:0.38 },

  { id:"ft-030", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/honour-triangle",
    prompt:"In one sentence, state what the play does with its three incompatible definitions of honour.",
    answers:[
      "It kills one, humiliates one and crowns one while letting all three arguments stay intelligent.",
      "The play declines to arbitrate, so a battle settles who is alive rather than who was right.",
      "None of the losing positions is refuted, which is why readers still disagree about the play.",
      "It stages an outcome without delivering a verdict on the argument."],
    nearMiss:[
      "It concludes that Hal's pragmatic version is the only one compatible with effective government.",
      "It arranges them from naive to sophisticated, with Falstaff's cynicism as its own position.",
      "It shows that honour is a meaningless word, which the catechism establishes conclusively."],
    threshold:0.38 },

  { id:"ft-031", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/worcester",
    quote:"h4-q44",
    prompt:"In one sentence, state where the play locates the rebellion's failure.",
    answers:[
      "In character rather than cause — one man's nerve, not a flaw in the Percy claim.",
      "Worcester talks himself out of a pardon, so the rebellion dies of temperament.",
      "The grievance is legitimate and the men carrying it are not, which is the play's preferred explanation.",
      "A cause fails on the people conducting it rather than on its merits."],
    nearMiss:[
      "In the strategic incompetence of the rebel leadership at the battle of Shrewsbury.",
      "In the King's superior forces, which no amount of courage could have overcome.",
      "In the illegitimacy of the Percy claim, which the play exposes as self-interest."],
    threshold:0.38 },

  { id:"ft-032", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/king-richard",
    quote:"h4-q26",
    prompt:"In one sentence, state what King Henry fails to notice about his own attack on Richard II.",
    answers:[
      "It is a description of how he took the crown, delivered as a warning to his heir.",
      "He condemns in Richard exactly the exposure that his own calculated scarcity exploited.",
      "The lecture is a manual for usurpation offered as advice against it.",
      "His account of Richard's failure is an account of his own method succeeding."],
    nearMiss:[
      "That the behaviour he condemns in Richard is the behaviour he condemns in Hal.",
      "That an audience who knows Richard II will find his moral authority compromised.",
      "That his son does not respect him because his own claim to the throne is weak."],
    threshold:0.38 },

  /* ═══ Thesis Forge ═════════════════════════════════════════ */
  { id:"ft-033", mod:"common", text:"1984", mode:"thesis", domain:"thesis/common-language",
    prompt:"Write a one-sentence thesis for: 'How does Nineteen Eighty-Four represent the relationship between language and individual thought?'",
    answers:[
      "Orwell presents language as the precondition of thought, so the Party's editing of vocabulary is an attack on the individual mind rather than on its expression.",
      "By making Newspeak a programme rather than a style, Orwell argues that the individual's capacity to dissent is a function of the words available to hold it in.",
      "The novel represents thought as language-dependent, which is why its most complete defeat is Winston writing 'two and two make five' while idle.",
      "Orwell locates the individual's last territory in language and then shows the Party occupying it, so interiority becomes a linguistic rather than a moral question."],
    nearMiss:[
      "Orwell uses many techniques to show that language is important in the novel.",
      "The novel shows that individual thought will always survive attempts to control language.",
      "Nineteen Eighty-Four explores the universal theme of freedom and the human condition."],
    threshold:0.60 },

  { id:"ft-034", mod:"common", text:"1984", mode:"thesis", domain:"thesis/common-collective",
    prompt:"Write a one-sentence thesis for: 'To what extent does Nineteen Eighty-Four present collective experience as a threat to the individual?'",
    answers:[
      "The novel's threat is not the crowd's hostility but its capacity to operate inside the individual, which the Two Minutes Hate demonstrates before any coercion occurs.",
      "Orwell presents the collective as dangerous precisely where it is involuntary, so Winston's inability to avoid joining in matters more than his eventual arrest.",
      "Collective experience threatens the individual only because the Party has removed the vocabulary in which a private position could be formulated against it.",
      "The novel largely presents the collective as a threat, though the proles complicate this by being free and irrelevant at once."],
    nearMiss:[
      "The collective is always a threat to the individual in dystopian fiction such as this novel.",
      "Winston is destroyed by the Party, which shows that individuals cannot resist collective power.",
      "The novel shows that collective experience is more important than individual experience."],
    threshold:0.60 },

  { id:"ft-035", mod:"moduleA", text:"wit", mode:"thesis", domain:"thesis/modulea-wit",
    prompt:"Write a one-sentence thesis for: 'How does W;t's reframing of Donne illuminate both texts?'",
    answers:[
      "Edson tests Donne's rhetoric under conditions his poems never specified, which reveals that the sonnets' confidence and their argument are separable.",
      "By giving a scholar of the Holy Sonnets the technique without the faith, W;t exposes what Donne's victories were actually resting on.",
      "The play does not refute Donne but relocates him, and in doing so shows that his consolations require a belief the rhetoric alone cannot supply.",
      "W;t illuminates Donne by demonstrating that a poem's logic can be run by someone who does not hold its premises, and illuminates itself by inheriting his precedent for thinking hard while dying."],
    nearMiss:[
      "W;t shows that Donne was wrong about death, which the play's ending proves.",
      "Both texts explore mortality, which creates a strong resonance between them.",
      "Edson appropriates Donne's poetry in order to make her play more intellectual."],
    threshold:0.60 },

  { id:"ft-036", mod:"moduleA", text:"donne", mode:"thesis", domain:"thesis/modulea-donne",
    prompt:"Write a one-sentence thesis for: 'Evaluate the significance of the dissonances between Donne's poetry and W;t.'",
    answers:[
      "The pairing's most significant dissonance is theological: Donne has a destination and Edson has a person in the room, so the play substitutes ethics for eschatology without pretending it is the same comfort.",
      "The dissonances matter because they are asymmetrical — Edson can borrow Donne's forms but not his faith, and the play is built out of that shortfall.",
      "What separates the texts is not period but warrant: Donne's arguments are underwritten by belief and Vivian's by technique, which is why hers fail.",
      "The dissonance between salvation and care is the pairing's most significant, since it changes what the later text is able to offer its protagonist."],
    nearMiss:[
      "The dissonances are significant because Donne wrote poetry and Edson wrote a play.",
      "The two texts are very different because they were written four hundred years apart.",
      "Donne is religious and Edson is secular, which is the main difference between them."],
    threshold:0.60 },

  { id:"ft-037", mod:"moduleB", text:"henry4", mode:"thesis", domain:"thesis/moduleb-integrity",
    prompt:"Write a one-sentence thesis for: 'To what extent does King Henry IV Part 1's textual integrity account for its enduring value?'",
    answers:[
      "The play endures because its integrity consists in refusal: three coherent accounts of honour are constructed and none is arbitrated, so every generation can find the text agreeing with it.",
      "Its unity is demonstrable rather than thematic — the comic play extempore contains the sequel's catastrophe — and that kind of construction rewards rereading in a way a settled argument would not.",
      "The play's value rests substantially on its integrity, since a manufactured symmetry it never resolves keeps its central question open to readers with incompatible convictions.",
      "Textual integrity accounts for much of its endurance, though the survival of Falstaff as a figure independent of the play complicates any purely structural explanation."],
    nearMiss:[
      "The play is a timeless masterpiece whose universal themes continue to resonate today.",
      "Shakespeare's language and characterisation are why the play has remained popular.",
      "The play endures because honour is a theme that will always interest audiences."],
    threshold:0.60 },

  { id:"ft-038", mod:"moduleB", text:"henry4", mode:"thesis", domain:"thesis/moduleb-hal",
    prompt:"Write a one-sentence thesis for: 'How does Shakespeare position the audience to judge Prince Hal?'",
    answers:[
      "Shakespeare grants Hal the play's only soliloquy and has him use it to announce a performance, which makes the audience's privileged access uncomfortable rather than sympathetic.",
      "By removing all suspense about Hal's trajectory in Act 1, the play converts the audience's task from prediction to judgement, and then withholds the terms.",
      "The audience is positioned as accomplices: they know the plan from the second scene, so every affectionate tavern exchange afterwards is one they watch as surveillance.",
      "Shakespeare makes Hal legible and unlikeable at once, so the question of whether political competence excuses coldness is left with the audience rather than answered."],
    nearMiss:[
      "Shakespeare shows that Hal is a good prince who has to make difficult decisions.",
      "The audience is positioned to admire Hal for his eventual reformation and courage.",
      "Hal is a complex character with both positive and negative qualities."],
    threshold:0.60 },

  { id:"ft-039", mod:"moduleC", mode:"thesis", domain:"thesis/modulec-reflection",
    prompt:"Write a one-sentence reflection claim accounting for a deliberate choice of sentence rhythm in your own writing.",
    answers:[
      "I set two identical constructions before the third so the variation would land as a joke rather than as a statement.",
      "The short sentence after three long ones works only because of what precedes it, which is why I cut the two intervening clauses.",
      "I varied sentence length to control the reader's pace, placing the shortest sentence where I wanted the argument to stop.",
      "Repetition establishes the rhythm precisely so the break can carry the paragraph's turn."],
    nearMiss:[
      "I used short sentences to create tension and make the writing more dramatic.",
      "I varied my sentence lengths to make the piece more interesting to read.",
      "My rhythm is effective because it keeps the reader engaged throughout."],
    threshold:0.60 },

  { id:"ft-040", mod:"moduleC", mode:"thesis", domain:"thesis/modulec-cut",
    prompt:"Write a one-sentence reflection claim about something you removed from your writing and why.",
    answers:[
      "I cut the sentence naming the argument outright, because describing the row turned the reader into a spectator rather than an inferrer.",
      "The two drafts that explained the silence were removed, since the reader's own inference was the effect I wanted.",
      "I deleted the closing moral because it converted an imaginative piece into a weak persuasive one.",
      "Removing the adjectives forced the nouns and verbs to do the work, which is what the passage needed."],
    nearMiss:[
      "I cut some parts of my piece because it was too long for the word limit.",
      "I removed a paragraph that did not fit with the rest of the writing.",
      "I edited my piece carefully to make sure every word was necessary."],
    threshold:0.60 },

  /* ═══ Rewrite Rescue ══════════════════════════════════════
     The weak original goes into nearMiss automatically, so 'barely changed it' is
     caught by the same contrastive rule that catches an inversion — no extra
     authoring, which is a neat use of the machinery. */

  { id:"ft-041", mod:"common", text:"1984", mode:"rewrite", domain:"rewrite/plot-summary",
    weak:"Orwell uses symbolism when Winston buys the paperweight from Mr Charrington's shop and then it gets smashed when he is arrested.",
    prompt:"This sentence names a technique and then retells the plot. Rewrite it so the symbol's meaning is analysed rather than narrated.",
    answers:[
      "Winston builds the paperweight into an image of preserved private life, so its smashing destroys an interpretation rather than an object.",
      "The paperweight is symbolic only because Winston makes it so, which is why the Party breaks it in front of him.",
      "Orwell has Winston construct the coral's meaning himself, so the object's destruction is a piece of literary criticism performed as torture.",
      "The symbol is Winston's own invention, and its shattering demonstrates that even his readings of things are the Party's to remove."],
    nearMiss:[
      "The paperweight symbolises Winston and Julia's relationship, which is destroyed when they are arrested.",
      "Orwell uses the paperweight as an important symbol throughout the second part of the novel."],
    threshold:0.60 },

  { id:"ft-042", mod:"common", text:"1984", mode:"rewrite", domain:"rewrite/floating-quote",
    weak:"Orwell shows the Party's power. 'Who controls the past controls the future.' This is a very powerful quote about control.",
    prompt:"This sentence leaves the quotation floating and calls it powerful. Rewrite it so the quotation is integrated and its structure analysed.",
    answers:[
      "The slogan's chiastic inversion — past for future, present for past — closes the loop it describes, leaving no vantage point from which to check it.",
      "By making each term occupy both positions, 'who controls the past controls the future' encloses every position from which it could be disputed.",
      "Orwell's chiasmus turns the claim into a circle, so the sentence's form is its own argument about historical control.",
      "The inverted clauses give the slogan no exterior, which is why Winston's rebellion has no ground to stand on."],
    nearMiss:[
      "The quote 'who controls the past controls the future' shows that the Party has a lot of power over history.",
      "This powerful quotation demonstrates Orwell's concern with the theme of control in the novel."],
    threshold:0.60 },

  { id:"ft-043", mod:"moduleA", text:"donne", mode:"rewrite", domain:"rewrite/technique-unanalysed",
    weak:"Donne uses a conceit in 'A Valediction: Forbidding Mourning'. He compares the lovers to a compass, which is a beautiful image.",
    prompt:"This sentence names the conceit and then admires it. Rewrite it so the conceit's argumentative function is explained.",
    answers:[
      "The compass arrives as a concession — if they be two — so the figure is defending a claim about union against the fact of separation.",
      "Donne's conceit is a proof rather than a picture: it reasons geometrically to a conclusion the final line states.",
      "The comparison does argumentative work, conceding the lovers' physical two-ness in order to demonstrate that two-ness is compatible with union.",
      "Because the conceit develops as a logical sequence with a result, it can be followed step by step and, in principle, refuted."],
    nearMiss:[
      "Donne uses the conceit of a compass to show how strong the lovers' connection is.",
      "The compass is an extended metaphor that Donne develops over three stanzas of the poem."],
    threshold:0.60 },

  { id:"ft-044", mod:"moduleA", text:"wit", mode:"rewrite", domain:"rewrite/theme-not-craft",
    weak:"W;t is about how doctors do not treat patients as people, which is a very important issue in modern healthcare.",
    prompt:"This sentence discusses the issue rather than the play. Rewrite it so a specific technique carries the claim.",
    answers:[
      "Edson repeats 'How are you feeling today?' across the play until a courtesy becomes an indictment, without a word of commentary.",
      "The play stages Kelekian's grand rounds with the same blocking as Vivian's seminar, so the critique is made structurally rather than stated.",
      "Jason's capitalised 'She's Research!' replaces a person with a category, which locates the failure in institutional language rather than in individual cruelty.",
      "By placing the formulaic question over a vomiting patient, Edson lets the register do the accusing."],
    nearMiss:[
      "Edson shows that doctors treat patients as research subjects rather than as people.",
      "The play criticises the medical profession for its lack of compassion towards the dying."],
    threshold:0.60 },

  { id:"ft-045", mod:"moduleB", text:"henry4", mode:"rewrite", domain:"rewrite/emphasis",
    weak:"Falstaff says 'honour is a mere scutcheon', which uses a metaphor to emphasise that he does not believe in honour.",
    prompt:"This sentence uses 'emphasise', which names no effect. Rewrite it so the metaphor's specific content does the work.",
    answers:[
      "A scutcheon is the painted shield carried at a funeral, so the metaphor says honour arrives exactly too late to be enjoyed.",
      "The image is funerary: honour is the decoration on the coffin of a man who can no longer use anything.",
      "By choosing an object from a burial procession, Falstaff makes honour something that only attaches to the dead.",
      "The scutcheon is not merely superficial but posthumous, which is the catechism's actual conclusion."],
    nearMiss:[
      "Falstaff uses the metaphor of a scutcheon to show that honour is empty and meaningless.",
      "The metaphor emphasises Falstaff's cynical attitude towards the aristocratic code of honour."],
    threshold:0.60 },

  { id:"ft-046", mod:"moduleB", text:"henry4", mode:"rewrite", domain:"rewrite/no-concept",
    weak:"Hal's soliloquy in Act 1 Scene 2 uses verse and shows that he is planning to change his behaviour later in the play.",
    prompt:"This sentence identifies a feature and stops. Rewrite it so the verse shift is connected to what it does.",
    answers:[
      "Hal moves from Eastcheap prose into verse to say 'I know you all', announcing the betrayal in a register Falstaff cannot follow.",
      "The switch into verse is the betrayal rather than a comment on it, since the language itself excludes the man being watched.",
      "By shifting register mid-scene, Hal reclassifies two hundred lines of banter as surveillance in a form the audience hears before it understands.",
      "The prose-to-verse boundary is audible in performance, which is why the play encodes its central political fact there."],
    nearMiss:[
      "Hal's use of verse shows that he is really a prince despite spending time in the tavern.",
      "The soliloquy is in verse, which reflects the seriousness of what Hal is saying about his future."],
    threshold:0.60 },

  { id:"ft-047", mod:"moduleC", mode:"rewrite", domain:"rewrite/reflection-vague",
    weak:"I used imagery in my piece to help the reader picture the setting and make the writing more vivid and engaging.",
    prompt:"This reflection names a category and an unspecific effect. Rewrite it so a quoted phrase and a specific sense carry the claim.",
    answers:[
      "'The neighbour's kelpie started up again' works through a concrete noun rather than an adjective, so the place arrives without being described.",
      "I chose tactile detail — 'the vinyl still warm where he had been sitting' — because touch cannot be experienced at a distance.",
      "The auditory image of 'somebody deciding not to knock' gives a sound a motive, which establishes the narrator's watchfulness without stating it.",
      "I replaced three adjectives with one specific noun, since specificity does the work intensity was failing at."],
    nearMiss:[
      "I used vivid imagery so that the reader could imagine the scene in detail.",
      "My use of descriptive language helps to create a strong sense of place in the piece."],
    threshold:0.60 },

  { id:"ft-048", mod:"moduleC", mode:"rewrite", domain:"rewrite/topic-sentence",
    weak:"Orwell uses symbolism in Nineteen Eighty-Four.",
    prompt:"This topic sentence announces a subject rather than making a claim. Rewrite it as something a competent reader could disagree with.",
    answers:[
      "Orwell's symbols are constructed by Winston and destroyed in front of him, so interpretation itself becomes a liability.",
      "The novel's objects acquire meaning only through Winston's readings of them, which is why the Party breaks the readings rather than the things.",
      "Symbolism in the novel is not a decorative layer but a trap: every meaning Winston builds is later demolished in his presence.",
      "Orwell uses symbolism against his protagonist, making the act of finding significance a form of exposure."],
    nearMiss:[
      "Orwell uses a lot of symbolism in Nineteen Eighty-Four to convey his themes to the reader.",
      "Symbolism is one of the most important techniques used throughout Nineteen Eighty-Four."],
    threshold:0.60 },

  /* ═══ Say It In One — text-agnostic craft ══════════════════ */
  { id:"ft-049", mod:"moduleC", mode:"sayit", domain:"craft/discursive",
    prompt:"In one sentence, state why signposting like 'firstly' damages a discursive piece.",
    answers:[
      "It announces that the destination was decided in advance, which converts exploration into a persuasive essay wearing hedges.",
      "A discursive piece is supposed to move by thinking, and headings replace movement with an outline.",
      "The form's whole value is being able to change its mind on the page, and signposts foreclose that.",
      "Numbered stages tell the reader nothing will be discovered, which is the opposite of what discursive writing offers."],
    nearMiss:[
      "Signposting makes the piece predictable, which reduces the reader's engagement with it.",
      "Numbered sections are inappropriate in continuous prose and look like an essay plan.",
      "Discursive writing should be personal, and signposting sounds too formal for the form."],
    threshold:0.38 },

  { id:"ft-050", mod:"moduleC", mode:"sayit", domain:"craft/concession",
    prompt:"In one sentence, state what a persuasive piece forfeits by omitting the concession.",
    answers:[
      "Credibility — naming the best version of the other side is what separates persuasion from assertion.",
      "A reader who can think of an unaddressed objection stops trusting the writer entirely.",
      "Without it the piece has never acknowledged difficulty, so there is no reason to believe it.",
      "It loses the move that buys the right to be believed, which no amount of evidence replaces."],
    nearMiss:[
      "It loses marks for structure, since the standard persuasive form requires a counter-argument.",
      "The reader becomes bored, since one-sided argument is monotonous over eight hundred words.",
      "It forfeits the chance to demonstrate a wider range of rhetorical techniques."],
    threshold:0.38 },

  { id:"ft-051", mod:"moduleC", mode:"sayit", domain:"craft/specificity",
    prompt:"In one sentence, state why 'the neighbour's kelpie started up again' outperforms 'a dog barked somewhere'.",
    answers:[
      "Concrete nouns supply place, relationship and history without recruiting a single adjective.",
      "Specificity outperforms intensity, because particulars carry information that vagueness cannot.",
      "'Somewhere' and 'a dog' are placeholders, where a named breed and a neighbour establish a whole situation.",
      "The specific version does the work adjectives are usually brought in to attempt."],
    nearMiss:[
      "It uses an Australian reference, which grounds the piece in a recognisable place.",
      "It shows the narrator is familiar with the location and its surroundings.",
      "It is more descriptive, which makes the writing more vivid for the reader."],
    threshold:0.38 },

  { id:"ft-052", mod:"moduleC", mode:"sayit", domain:"craft/twist",
    prompt:"In one sentence, state the structural objection to a twist ending.",
    answers:[
      "It retroactively cancels the reading the reader has been doing, so their investment is discarded.",
      "A twist replaces the story the reader built with a different one, which subtracts rather than adds.",
      "It discards the reader's work, where an ending that pays off something planted early rewards it.",
      "The reader has to throw away their interpretation, which feels like a trick rather than an arrival."],
    nearMiss:[
      "Twist endings are a cliché that markers will have seen many times before.",
      "They are difficult to execute convincingly in a piece of only eight hundred words.",
      "It leaves nothing for the reflection statement to account for afterwards."],
    threshold:0.38 },

  { id:"ft-053", mod:"moduleC", mode:"sayit", domain:"craft/reflection-cut",
    prompt:"In one sentence, state why naming what you cut is the strongest move available in a reflection statement.",
    answers:[
      "A deletion proves the choices were choices, where a list of techniques is compatible with having stumbled into them.",
      "Removing something is direct evidence of deliberation, which is exactly what the reflection is assessed on.",
      "What you left out cannot be an accident, so it demonstrates judgement rather than compliance.",
      "It shows a decision was made, which a list of features used does not."],
    nearMiss:[
      "It shows the student edited their work carefully, which markers reward.",
      "It demonstrates that the piece went through several drafts before submission.",
      "It gives the marker more information about the writing process."],
    threshold:0.38 },

  { id:"ft-054", mod:"moduleC", mode:"sayit", domain:"craft/selection",
    prompt:"In one sentence, state how voice is created in a first-person piece.",
    answers:[
      "By what the narrator notices, since selection is characterisation before anything is stated.",
      "Two narrators listing different objects in one room have already told you everything about themselves.",
      "Voice comes from choosing what is worth mentioning, not from ornate prose.",
      "What gets described, and what is passed over, does the work adjectives are usually asked to do."],
    nearMiss:[
      "By using distinctive vocabulary and sentence structures that suit the character.",
      "Through the narrator's opinions and comments on the events they describe.",
      "By writing in a consistent tone that reflects the narrator's personality."],
    threshold:0.38 },

  /* ═══ Say It In One — second pass, harder ══════════════════ */
  { id:"ft-055", mod:"common", text:"1984", mode:"sayit", domain:"common/dark-promise",
    quote:"1984-q39",
    prompt:"In one sentence, state what O'Brien's 'place where there is no darkness' demonstrates about the novel's language.",
    answers:[
      "The promise is kept exactly and means its opposite, so the Party's cruellest instrument is language that does not lie.",
      "Nothing about the sentence was false; only Winston's reading was, which removes even deception as a thing to expose.",
      "The perpetually lit cells fulfil the phrase precisely, so the novel's horror is accurate language rather than propaganda.",
      "Winston hears understanding and receives a lit room, and the words were never wrong."],
    nearMiss:[
      "O'Brien deceives Winston, which shows the Party cannot be trusted about anything.",
      "The phrase is ironic because the Ministry of Love is the darkest place in the novel.",
      "It foreshadows Winston's execution, which takes place in bright daylight at the end."],
    threshold:0.38 },

  { id:"ft-056", mod:"common", text:"1984", mode:"sayit", domain:"common/tragedy",
    quote:"1984-q60",
    prompt:"In one sentence, state what the novel argues by being a tragedy after Winston has declared tragedy impossible.",
    answers:[
      "The private self persisted after all, which is the strongest claim the novel makes for it.",
      "Winston says the preconditions for tragedy are gone, and the novel's existence disproves him.",
      "Privacy, love and friendship were still available to be destroyed, so the Party had real work to do.",
      "The contradiction concedes that something was lost, which a novel about total control could have denied."],
    nearMiss:[
      "Winston is mistaken about his era, which shows how thoroughly the Party has misinformed him.",
      "The novel is not a tragedy, since Winston survives and is released at the end.",
      "It shows that tragedy is a universal form that applies to every historical period."],
    threshold:0.38 },

  { id:"ft-057", mod:"moduleA", text:"donne", mode:"sayit", domain:"moduleA/corners",
    quote:"donne-q10",
    prompt:"In one sentence, state what Donne accomplishes by flagging the earth's corners as 'imagin'd'.",
    answers:[
      "The poem admits its scriptural image is a fiction and issues the command anyway.",
      "Faith proceeds in full knowledge of its own figurative machinery rather than pretending the figure is literal.",
      "Marking the impossibility means the speaker knows the image cannot hold and summons the angels regardless.",
      "The concession makes the poem's position neither literalism nor metaphor but something harder."],
    nearMiss:[
      "It shows Donne was familiar with contemporary astronomy and the new cosmology.",
      "It signals that the apocalypse is figurative rather than an expected literal event.",
      "It prepares the volta, where the speaker asks for the summons to be delayed."],
    threshold:0.38 },

  { id:"ft-058", mod:"moduleA", text:"wit", mode:"sayit", domain:"moduleA/ashford-ending",
    quote:"wit-q30",
    prompt:"In one sentence, state how Ashford's use of Horatio's line differs from every other use of literature in the play.",
    answers:[
      "It is not armour but the thing you say when there is nothing to say.",
      "Every earlier quotation is defensive, and this one arrives because her own words have run out.",
      "Literature is used here to accompany rather than to explain or to protect.",
      "The quotation does no analytical work, which is why it is the only one the play endorses."],
    nearMiss:[
      "It elevates Vivian's death by associating her with Shakespeare's tragic protagonist.",
      "It shows Ashford's learning is broader than Donne, unlike Vivian's narrow specialism.",
      "It supplies the religious consolation the Holy Sonnets promised and the hospital could not."],
    threshold:0.38 },

  { id:"ft-059", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/elegy-split",
    quote:"h4-q38",
    prompt:"In one sentence, state what Hal's two addresses over Hotspur's body reveal about him.",
    answers:[
      "He can separate the man from the cause, and Hotspur never could.",
      "Honouring 'great heart' and filing 'ill-weaved ambition' in two lines is the political faculty that just won the battle.",
      "The split shows a mind that holds admiration and judgement at once, which Hotspur's could not.",
      "He praises and dismisses in the same breath, which is exactly the capacity his rival lacked."],
    nearMiss:[
      "It shows his elegy is insincere, since he cannot mean both things about the same man.",
      "It demonstrates that Hal honours a defeated enemy as a victorious prince should.",
      "It reveals that Hal admired Hotspur's courage while condemning his rebellion."],
    threshold:0.38 },

  { id:"ft-060", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/glendower",
    quote:"h4-q17",
    prompt:"In one sentence, state the political cost of Hotspur's reply to Glendower.",
    answers:[
      "The rebellion loses Wales, so his intolerance of nonsense is a virtue that costs him an army.",
      "Being right out loud to an ally he needs is what leaves him outnumbered at Shrewsbury.",
      "The scene locates the rebellion's failure in temperament: he cannot let a boast pass.",
      "He wins the exchange and forfeits the alliance, which is the play's habitual way of complicating a strength."],
    nearMiss:[
      "It shows that the rebels cannot agree among themselves, which the map division suggests.",
      "It establishes Hotspur as the play's most sceptical intelligence and its most modern figure.",
      "Glendower is humiliated and therefore refuses to fight, which is his own failure of nerve."],
    threshold:0.38 },

  { id:"ft-061", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/factor",
    quote:"h4-q28",
    prompt:"In one sentence, state what Hal's calling Hotspur 'my factor' does to honour.",
    answers:[
      "It converts honour into an asset class, with Hotspur as an agent accumulating stock for collection.",
      "Every deed Hotspur performs is booked to a ledger somebody else will close.",
      "Honour becomes property that can be transferred, which makes the duel an acquisition.",
      "A factor trades on another's account, so Hotspur's life's work is reclassified as Hal's inventory."],
    nearMiss:[
      "It shows Hal regards Hotspur as an employee, which is dismissive of his achievements.",
      "It reveals Hal has been planning to kill Hotspur since the beginning of the play.",
      "It demonstrates Hal's fluency in the mercantile language he learned in the tavern."],
    threshold:0.38 },

  { id:"ft-062", mod:"moduleB", text:"henry4", mode:"sayit", domain:"moduleB/no-closure",
    prompt:"In one sentence, state why the play's lack of closure is a strength.",
    answers:[
      "A resolved plot would imply the battle had settled the argument about honour, and it has not.",
      "Refusing to tie off means the three positions stay open, which is why readers still disagree.",
      "The crusade is still deferred and two rebels are still at large, so nothing about legitimacy has changed.",
      "Ending unsettled keeps the play a question rather than converting it into a verdict."],
    nearMiss:[
      "It leaves room for Part 2, which Shakespeare had already begun planning.",
      "It reflects the historical record, in which the Percy rebellion continued for years.",
      "It denies the audience satisfaction, which suits the play's sceptical tone."],
    threshold:0.38 }
];
