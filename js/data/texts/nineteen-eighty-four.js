/* Nineteen Eighty-Four — Common Module, Texts and Human Experiences.
   ============================================================================
   Extracts only, always attributed: a line or a sentence, never a passage long enough
   to stop being plainly a quotation.

   On `mark` rather than a literal `span`: the highlighted range is authored as the
   substring it applies to, and bank.js derives the character offsets from it. Hand-
   counting offsets is a guaranteed source of silent drift the first time a quote gets
   a comma edited — the offsets are a DERIVED value, so they are recomputed rather than
   trusted (addendum D5). validate.js asserts every `mark` actually occurs in its quote.

   On `techniques`: this lists EVERY technique genuinely present, not just the one being
   asked about. That is what lets validate.js prove no distractor in a "name the
   technique" question is also a right answer — the single most important content check
   in this app (§9.7b).
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["1984"] = {
  id: "1984",
  title: "Nineteen Eighty-Four",
  composer: "George Orwell",
  year: 1949,
  form: "prose fiction",
  modules: ["common"],
  blurb: "Winston Smith rewrites the past for a living and is destroyed for wanting a " +
         "private mind. Orwell's interest is less the boot than the machinery that makes " +
         "the boot feel inevitable.",

  /* Context facts, each MCQ-able and each with a `why` that explains why it matters to
     a reading rather than just asserting the date. */
  context: [
    { fact: "Published June 1949, four years after the defeat of Nazi Germany and two years into the Cold War.",
      why: "The novel is not a prophecy about 1984 but a satire of 1948 — the Ministry of Truth is the BBC wartime propaganda department Orwell worked in, renamed." },
    { fact: "Orwell worked for the BBC Eastern Service 1941–43, writing propaganda for broadcast to India.",
      why: "Winston's job — producing plausible falsehoods for a state he half-believes in — is drawn from the inside, which is why the novel treats complicity as ordinary rather than monstrous." },
    { fact: "Orwell fought with the POUM militia in the Spanish Civil War and was hunted by Soviet-aligned communists.",
      why: "His target is totalitarianism as a method, not the political right specifically. The Party has no ideology beyond power, which is the point of O'Brien's 'we are not interested in the good of others'." },
    { fact: "Newspeak's principles are set out in an Appendix written in the past tense.",
      why: "The Appendix narrates Newspeak as a failed historical project, which means the Party fell — the novel's bleakest page is also its only hopeful one." },
    { fact: "The Two Minutes Hate, Hate Week and the changing of the enemy from Eurasia to Eastasia mid-rally are drawn from Stalinist show trials and the Nazi–Soviet Pact.",
      why: "Orwell's claim is that populations do not need to be deceived slowly; they can be redirected mid-sentence, and will remember having always believed the new thing." },
    { fact: "Orwell was dying of tuberculosis on Jura while writing it, and finished the typescript himself.",
      why: "Worth knowing and worth not over-reading: the novel's bodily disgust and exhaustion are real, but 'he was ill so it's bleak' is biography standing in for analysis." },
    { fact: "The novel's original working title was 'The Last Man in Europe'.",
      why: "It names the Common Module concern exactly — what remains of an individual human experience when the collective has claimed everything." },
    { fact: "Goldstein's book, 'The Theory and Practice of Oligarchical Collectivism', is quoted at length and is probably written by the Party.",
      why: "The one document that explains the world is itself a forgery, so the novel denies the reader the position of understanding it offers Winston." },
    { fact: "'Doublethink' names the capacity to hold two contradictory beliefs simultaneously and accept both.",
      why: "It relocates the horror from external coercion to internal collaboration — the Party does not need to watch you if you will do the watching." },
    { fact: "The proles are 85% of the population and are essentially unsupervised.",
      why: "Winston's 'if there is hope, it lies in the proles' is both the novel's political thesis and a hope the novel refuses to endorse — they are free because they are irrelevant." },
    { fact: "Room 101 contains 'the worst thing in the world', which differs for every person.",
      why: "The Party's final technology is not pain but personalisation: it needs to know you individually in order to make you betray yourself specifically." },
    { fact: "The novel ends with Winston loving Big Brother, not dying.",
      why: "A martyr would be a story the Party cannot allow. Conversion, not execution, is the logical endpoint of a regime that wants the inside of your head." }
  ],

  characters: [
    { name: "Winston Smith", role: "protagonist",
      note: "Thirty-nine, varicose ulcer, employed to destroy the evidence of what he remembers. Not a hero — his rebellion is nostalgic, sexual and largely verbal, which is Orwell's point about how little the Party needs to fear.",
      concepts: ["individual", "memory", "resistance"] },
    { name: "Julia", role: "co-conspirator",
      note: "Rebels bodily and without theory: 'I'm not interested in the next generation.' She is better at survival than Winston and is broken exactly as thoroughly, which refutes the idea that his intellectualism is what dooms him.",
      concepts: ["desire", "collective", "resistance"] },
    { name: "O'Brien", role: "antagonist / interrogator",
      note: "Inner Party. Courteous, genuinely learned, and the novel's most articulate character. He does not lie to Winston in the Ministry of Love, which is far worse than if he did.",
      concepts: ["power", "truth"] },
    { name: "Big Brother", role: "figurehead",
      note: "Never appears and may not exist. A face on a poster is more durable than a man, because a man can die.",
      concepts: ["power", "surveillance"] },
    { name: "Mr Charrington", role: "shopkeeper / Thought Police",
      note: "Sells Winston the diary, the coral paperweight and the room. Every object of private life Winston acquires is issued to him by the state.",
      concepts: ["surveillance", "memory"] },
    { name: "Parsons", role: "neighbour",
      note: "Denounced by his own daughter and proud of it. The Party's ideal citizen is not a fanatic but a cheerful fool.",
      concepts: ["collective", "complicity"] },
    { name: "Syme", role: "colleague, Newspeak lexicographer",
      note: "Understands Newspeak's purpose too well and is vaporised for it. Intelligence is a liability; Parsons survives.",
      concepts: ["language", "power"] },
    { name: "Emmanuel Goldstein", role: "designated enemy",
      note: "The Party's most useful asset. An opposition it controls is better than no opposition at all.",
      concepts: ["power", "truth"] }
  ],

  /* Form and structure facts — these are what Common Module questions about *how the
     text is constructed* draw on, and they are the half of the module students skip. */
  structure: [
    { feature: "Tripartite structure", detail: "Part One diagnoses the world, Part Two builds a private life inside it, Part Three dismantles both.",
      why: "The symmetry is punitive: everything established in Part Two is destroyed item by item in Part Three, in roughly the order it was acquired." },
    { feature: "Third-person limited, closely focalised on Winston", detail: "The reader knows only what Winston knows and is misled exactly where he is.",
      why: "The reader's trust in Charrington, Goldstein's book and O'Brien is Winston's trust. The form implicates you in the plot's credulity." },
    { feature: "The Appendix", detail: "'The Principles of Newspeak' is placed after the narrative and written in the past tense by an unnamed later historian.",
      why: "It is a paratext that contradicts the ending: the narrative closes on total defeat, the Appendix on a fallen regime studied at leisure." },
    { feature: "Embedded document", detail: "Goldstein's book is quoted for pages, interrupting the plot entirely.",
      why: "The interruption is structural argument — the theory arrives, is absorbed, and changes nothing, because understanding is not the same as being able to act." },
    { feature: "Diary as counter-form", detail: "Winston's diary entries are dated, first-person and addressed to an imagined future reader.",
      why: "It is the only place the novel lets a private first person speak, and it is written in a book bought from the Thought Police." },
    { feature: "Cyclical closure", detail: "The novel opens with a clock striking thirteen and closes with a bullet Winston welcomes.",
      why: "The circle is the argument: nothing accumulated, nothing carried forward, and the last sentence of the narrative is an act of love toward the thing that destroyed him." },
    { feature: "The songs", detail: "'Oranges and lemons' and the prole washerwoman's sentimental ballad recur across all three parts.",
      why: "Both are fragments of a culture nobody can date — evidence that a past existed, in the only form that survived: something people hum without knowing why." }
  ],

  quotes: [
    { id:"1984-q01", text:"It was a bright cold day in April, and the clocks were striking thirteen.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"striking thirteen",
      techniques:["juxtaposition","symbolism","in-medias-res","motif"],
      effect:"The first clause could open any English novel; 'thirteen' cancels it. Orwell establishes the world's method in one sentence — the familiar left almost entirely intact, with one adjustment that makes it uninhabitable.",
      concepts:["control","alienation","time"] },

    { id:"1984-q02", text:"BIG BROTHER IS WATCHING YOU.",
      locus:"Part 1, Ch. 1", speaker:"poster caption", mark:"YOU",
      techniques:["capitalisation","second-person","direct-address","personification"],
      effect:"The second person does the work: a caption on a wall addressed to no-one in particular is addressed to each reader individually, which is exactly the trick surveillance plays.",
      concepts:["surveillance","power"] },

    { id:"1984-q03", text:"WAR IS PEACE. FREEDOM IS SLAVERY. IGNORANCE IS STRENGTH.",
      locus:"Part 1, Ch. 1", speaker:"Party slogans", mark:"FREEDOM IS SLAVERY",
      techniques:["paradox","tricolon","antithesis","capitalisation","asyndeton"],
      effect:"Three flat copulas assert identity between opposites. The grammar is unarguable — 'is' admits no degree — so the sentences train the reader in doublethink by being unanswerable rather than by being persuasive.",
      concepts:["language","truth","control"] },

    { id:"1984-q04", text:"Who controls the past controls the future: who controls the present controls the past.",
      locus:"Part 1, Ch. 3", speaker:"Party slogan", mark:"who controls the present controls the past",
      techniques:["chiasmus","paradox","antithesis","repetition","aphorism"],
      effect:"The clause order inverts across the colon so the sentence closes the loop it describes. Its form is its argument: there is no point outside the circle from which to check it.",
      concepts:["power","truth","memory"] },

    { id:"1984-q05", text:"Freedom is the freedom to say that two plus two make four. If that is granted, all else follows.",
      locus:"Part 1, Ch. 7", speaker:"Winston (diary)", mark:"two plus two make four",
      techniques:["understatement","aphorism","conditional","first-person"],
      effect:"Winston stakes political liberty on arithmetic because it is the smallest claim he can imagine defending. That the novel later takes even this from him is why the line reads as a hostage note rather than a manifesto.",
      concepts:["truth","resistance","language"] },

    { id:"1984-q06", text:"Sanity is not statistical.",
      locus:"Part 2, Ch. 9", speaker:"Winston (thought)", mark:"not statistical",
      techniques:["aphorism","short-sentence","litotes","antithesis"],
      effect:"Four words set the individual against the collective and stake everything on the possibility that one person can be right against everyone. Room 101 is the Party's reply.",
      concepts:["individual","collective","truth"] },

    { id:"1984-q07", text:"If you want a picture of the future, imagine a boot stamping on a human face — for ever.",
      locus:"Part 3, Ch. 3", speaker:"O'Brien", mark:"for ever",
      techniques:["imagery","synecdoche","dash","second-person","hyperbole"],
      effect:"'A boot' and 'a human face' are both synecdoche, which strips the image of any particular person and makes it a mechanism. The dash before 'for ever' turns a picture into a sentence of unlimited duration.",
      concepts:["power","cruelty","future"] },

    { id:"1984-q08", text:"We are not interested in the good of others; we are interested solely in power.",
      locus:"Part 3, Ch. 3", speaker:"O'Brien", mark:"solely in power",
      techniques:["antithesis","semicolon","first-person-plural","parallelism"],
      effect:"The semicolon balances the two clauses as equal alternatives and O'Brien picks the second without embarrassment. Orwell's claim is that totalitarianism needs no hypocrisy once it stops needing to be believed in.",
      concepts:["power","truth"] },

    { id:"1984-q09", text:"Power is not a means; it is an end.",
      locus:"Part 3, Ch. 3", speaker:"O'Brien", mark:"it is an end",
      techniques:["antithesis","semicolon","aphorism","short-sentence"],
      effect:"Every political theory the reader might bring to the novel is a means-to-an-end theory, and this sentence closes them all off at once. What remains is unfalsifiable and therefore unopposable.",
      concepts:["power"] },

    { id:"1984-q10", text:"How does one man assert his power over another, Winston?",
      locus:"Part 3, Ch. 3", speaker:"O'Brien", mark:"How does one man assert his power over another",
      techniques:["rhetorical-question","direct-address","hypophora","socratic-method"],
      effect:"O'Brien asks and then answers himself, which is the form of a lesson rather than a debate. Naming Winston at the end of the question makes the pedagogy intimate — this is instruction, not interrogation.",
      concepts:["power","cruelty"] },

    { id:"1984-q11", text:"Nothing was your own except the few cubic centimetres inside your skull.",
      locus:"Part 1, Ch. 2", speaker:"narrator (Winston's thought)", mark:"few cubic centimetres",
      techniques:["understatement","synecdoche","second-person","imagery"],
      effect:"The measurement is deliberately clinical: privacy has been reduced to a volume. Part Three's business is entering it.",
      concepts:["individual","surveillance","interiority"] },

    { id:"1984-q12", text:"Thoughtcrime does not entail death: thoughtcrime IS death.",
      locus:"Part 1, Ch. 2", speaker:"Winston (diary)", mark:"IS death",
      techniques:["antithesis","colon","capitalisation","paradox","repetition"],
      effect:"The colon replaces a causal relation with an equivalence — no gap between the thought and the punishment, so nothing to negotiate in. The capitalised 'IS' borrows the Party's own slogan grammar.",
      concepts:["language","control","truth"] },

    { id:"1984-q13", text:"Under the spreading chestnut tree / I sold you and you sold me.",
      locus:"Part 1, Ch. 7 (and Part 3)", speaker:"song, Chestnut Tree Café", mark:"I sold you and you sold me",
      techniques:["motif","rhyme","chiasmus","foreshadowing","allusion"],
      effect:"A jingle Winston hears long before it applies to him. The mirrored clause makes betrayal reciprocal and therefore ordinary — nobody is the villain, which is worse.",
      concepts:["betrayal","complicity"] },

    { id:"1984-q14", text:"He loved Big Brother.",
      locus:"Part 3, Ch. 6", speaker:"narrator", mark:"loved",
      techniques:["short-sentence","irony","anticlimax","free-indirect-discourse"],
      effect:"Four words, no qualification, and the verb is 'loved' rather than 'obeyed' or 'feared'. The novel refuses the reader the consolation of a defiant last thought.",
      concepts:["power","individual","defeat"] },

    { id:"1984-q15", text:"Reality is not external. Reality exists in the human mind, and nowhere else.",
      locus:"Part 3, Ch. 2", speaker:"O'Brien", mark:"and nowhere else",
      techniques:["antithesis","short-sentence","parallelism","paradox"],
      effect:"O'Brien uses an idealist philosophical position for a political end. The trap is that the sentence is arguable in a seminar and lethal in a cell — the novel shows an idea's meaning depending entirely on who can enforce it.",
      concepts:["truth","power","language"] },

    { id:"1984-q16", text:"Two and two make five.",
      locus:"Part 3, Ch. 4", speaker:"Winston (written in the dust)", mark:"five",
      techniques:["symbolism","motif","short-sentence","irony"],
      effect:"The arithmetic Winston earlier called freedom itself, now written voluntarily and idly. The conversion is complete not when he says it under torture but when he says it while bored.",
      concepts:["truth","defeat","language"] },

    { id:"1984-q17", text:"Do it to Julia! Do it to Julia! Not me! Julia! I don't care what you do to her.",
      locus:"Part 3, Ch. 5", speaker:"Winston", mark:"Do it to Julia!",
      techniques:["repetition","exclamation","sentence-fragment","climax","anaphora"],
      effect:"The syntax collapses into fragments as the self does. Room 101 does not extract information — it extracts the sentence that makes Winston unable to respect himself again.",
      concepts:["betrayal","individual","cruelty"] },

    { id:"1984-q18", text:"If you can feel that staying human is worth while, even when it can't have any result whatever, you've beaten them.",
      locus:"Part 2, Ch. 7", speaker:"Winston", mark:"even when it can't have any result whatever",
      techniques:["conditional","second-person","irony","foreshadowing"],
      effect:"Winston's most moving formulation of resistance, and the novel's cruellest piece of set-up: Part Three exists to demonstrate that feeling it is not something he can choose to keep.",
      concepts:["resistance","individual","hope"] },

    { id:"1984-q19", text:"Perhaps one did not want to be loved so much as to be understood.",
      locus:"Part 1, Ch. 8", speaker:"narrator (Winston's thought)", mark:"understood",
      techniques:["free-indirect-discourse","antithesis","modality","low-modality"],
      effect:"'Perhaps' and 'one' hedge the thought into deniability even inside his own head, which is what a lifetime of self-censorship does to syntax. It is also the wish O'Brien exploits.",
      concepts:["interiority","isolation","desire"] },

    { id:"1984-q20", text:"Confession is not betrayal. What you say or do doesn't matter: only feelings matter.",
      locus:"Part 2, Ch. 7", speaker:"Julia", mark:"only feelings matter",
      techniques:["antithesis","aphorism","colon","juxtaposition"],
      effect:"Julia's pragmatism draws a line the Party will step over: it does not want her actions or her words, it wants the feelings she has just declared untouchable.",
      concepts:["betrayal","resistance","interiority"] },

    { id:"1984-q21", text:"I'm not interested in the next generation, dear. I'm interested in us.",
      locus:"Part 2, Ch. 7", speaker:"Julia", mark:"I'm interested in us",
      techniques:["antithesis","colloquialism","first-person"],
      effect:"Julia rejects the whole grammar of political sacrifice. Set against Winston's imagined future reader, her presentism is not shallowness but the only rebellion available to someone who does not believe in history.",
      concepts:["desire","resistance","individual"] },

    { id:"1984-q22", text:"If there is hope, it lies in the proles.",
      locus:"Part 1, Ch. 7", speaker:"Winston (diary)", mark:"lies in the proles",
      techniques:["conditional","aphorism","irony","foreshadowing"],
      effect:"The conditional 'if' is doing more work than the hope. Winston writes it as a proposition to be tested, and the novel tests it: the proles are free precisely because their freedom threatens nothing.",
      concepts:["collective","hope","class"] },

    { id:"1984-q23", text:"The proles are not human beings.",
      locus:"Part 1, Ch. 7", speaker:"Party doctrine (as reported)", mark:"not human beings",
      techniques:["dehumanisation","irony","short-sentence","juxtaposition"],
      effect:"Placed within pages of Winston's hope in them, the doctrine exposes his position as still half-Party: he needs them to be human for his theory and has been taught they are not.",
      concepts:["class","collective","complicity"] },

    { id:"1984-q24", text:"They were the last of a race of giants, singing over their tubs.",
      locus:"Part 2, Ch. 10", speaker:"narrator (Winston's thought)", mark:"race of giants",
      techniques:["hyperbole","allusion","imagery","juxtaposition","free-indirect-discourse"],
      effect:"The mythic register collides with a washtub. Winston's admiration for the proles is real and also a kind of tourism — he can only see them as legend, never as neighbours.",
      concepts:["class","collective","hope"] },

    { id:"1984-q25", text:"Every record has been destroyed or falsified, every book rewritten, every picture has been repainted.",
      locus:"Part 1, Ch. 7", speaker:"Winston (thought)", mark:"every book rewritten",
      techniques:["anaphora","accumulation","passive-voice","tricolon","polysyndeton"],
      effect:"The passives leave no agent, so the erasure reads as weather rather than policy. Winston, who performs the erasing daily, cannot find a subject for the sentence.",
      concepts:["memory","truth","complicity"] },

    { id:"1984-q26", text:"He who controls the past, ran the Party slogan, controls the future.",
      locus:"Part 1, Ch. 3", speaker:"narrator quoting slogan", mark:"ran the Party slogan",
      techniques:["parenthesis","embedded-clause","irony","allusion"],
      effect:"The interruption is the technique. The narration cannot state the idea without flagging its source mid-clause, which shows how thoroughly Party language has colonised even the sentences that describe it.",
      concepts:["language","power","memory"] },

    { id:"1984-q27", text:"It's a beautiful thing, the destruction of words.",
      locus:"Part 1, Ch. 5", speaker:"Syme", mark:"beautiful",
      techniques:["oxymoron","irony","aesthetic-diction"],
      effect:"Syme's aesthetic pleasure in his work is the most frightening thing in the chapter. Newspeak is not imposed by philistines; it is built lovingly by a man who understands language.",
      concepts:["language","control","complicity"] },

    { id:"1984-q28", text:"In the end we shall make thoughtcrime literally impossible, because there will be no words in which to express it.",
      locus:"Part 1, Ch. 5", speaker:"Syme", mark:"no words in which to express it",
      techniques:["causal-conjunction","high-modality","prolepsis","hyperbole"],
      effect:"'Shall' claims certainty about a linguistic theory that the Appendix quietly reports failed. Syme states the Party's boldest claim and is vaporised before he can see it tested.",
      concepts:["language","control","truth"] },

    { id:"1984-q29", text:"Orthodoxy means not thinking — not needing to think. Orthodoxy is unconsciousness.",
      locus:"Part 1, Ch. 5", speaker:"Syme", mark:"not needing to think",
      techniques:["epanorthosis","dash","antithesis","repetition","aphorism"],
      effect:"The self-correction after the dash sharpens the claim from absence to relief. Orthodoxy is not a burden the citizen carries but a burden removed, which is why it holds.",
      concepts:["control","collective","complicity"] },

    { id:"1984-q30", text:"Doublethink means the power of holding two contradictory beliefs in one's mind simultaneously, and accepting both of them.",
      locus:"Part 2, Ch. 9 (Goldstein's book)", speaker:"Goldstein's book", mark:"accepting both of them",
      techniques:["academic-register","paradox","nominalisation"],
      effect:"The final clause is the whole difficulty: not confusion, not hypocrisy, but acceptance. It relocates the regime's machinery inside the citizen, where no rebellion can reach it.",
      concepts:["truth","control","interiority"] },

    { id:"1984-q31", text:"The Ministry of Truth, which concerned itself with news, entertainment, education and the fine arts.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"Ministry of Truth",
      techniques:["irony","listing","asyndeton","juxtaposition","satire"],
      effect:"The list is flat and administrative, which is the joke: propaganda has no separate department because every department is one. Naming it 'Truth' is not concealment but a demonstration of who gets to define words.",
      concepts:["language","power","truth"] },

    { id:"1984-q32", text:"The Ministry of Love was the really frightening one. There were no windows in it at all.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"no windows in it at all",
      techniques:["irony","understatement","short-sentence","symbolism","juxtaposition"],
      effect:"Orwell withholds the interior and gives one architectural detail instead. The windowlessness does the work of a page of description because it is a fact the reader can verify from the street.",
      concepts:["surveillance","cruelty","power"] },

    { id:"1984-q33", text:"You had to live — did live, from habit that became instinct — in the assumption that every sound you made was overheard.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"from habit that became instinct",
      techniques:["parenthesis","dash","second-person","epanorthosis","free-indirect-discourse"],
      effect:"The parenthetical correction — 'did live' — catches the sentence downgrading the effort of obedience into reflex. Surveillance's real achievement is becoming unremarkable.",
      concepts:["surveillance","control","complicity"] },

    { id:"1984-q34", text:"The telescreen received and transmitted simultaneously.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"received and transmitted simultaneously",
      techniques:["symbolism","technical-diction","short-sentence","juxtaposition"],
      effect:"One neutral sentence collapses the distinction between broadcast and surveillance. Orwell's technology is frightening because it is described in a manual's voice.",
      concepts:["surveillance","control"] },

    { id:"1984-q35", text:"Always eyes watching you and the voice enveloping you. Asleep or awake, working or eating, indoors or out of doors.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"Asleep or awake, working or eating, indoors or out of doors",
      techniques:["tricolon","antithesis","sentence-fragment","accumulation","polysyndeton"],
      effect:"Three paired opposites exhaust the possibilities of a life between them, and the verbless fragment denies the sentence anywhere to end. The syntax enacts inescapability.",
      concepts:["surveillance","control","alienation"] },

    { id:"1984-q36", text:"The horrible thing about the Two Minutes Hate was not that one was obliged to act a part, but that it was impossible to avoid joining in.",
      locus:"Part 1, Ch. 1", speaker:"narrator (Winston's thought)", mark:"impossible to avoid joining in",
      techniques:["antithesis","free-indirect-discourse","litotes","paradox"],
      effect:"Winston distinguishes coercion from contagion and identifies the worse one. The Party does not need his consent if it can borrow his body for two minutes.",
      concepts:["collective","complicity","individual"] },

    { id:"1984-q37", text:"A terrible ecstasy of fear and vindictiveness.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"ecstasy",
      techniques:["oxymoron","religious-diction","imagery","zeugma"],
      effect:"'Ecstasy' imports the vocabulary of religious rapture into a political rally. Orwell's argument is that the Party does not suppress the need for transcendence, it supplies it.",
      concepts:["collective","control","desire"] },

    { id:"1984-q38", text:"The paperweight was the room he was in, and the coral was Julia's life and his own, fixed in a sort of eternity at the heart of the crystal.",
      locus:"Part 2, Ch. 4", speaker:"narrator (Winston's thought)", mark:"fixed in a sort of eternity",
      techniques:["symbolism","extended-metaphor","imagery","free-indirect-discourse"],
      effect:"Winston builds the paperweight into an image of preserved private life. Its smashing in Part Three is not a coincidence but the novel's habit: every symbol Winston constructs is later broken in front of him.",
      concepts:["memory","desire","interiority"] },

    { id:"1984-q39", text:"We shall meet in the place where there is no darkness.",
      locus:"Part 2, Ch. 2 / Part 3", speaker:"O'Brien (in Winston's dream)", mark:"no darkness",
      techniques:["euphemism","irony","foreshadowing","litotes","allusion"],
      effect:"Winston hears a promise of understanding; the reader later learns it means the perpetually lit cells of the Ministry of Love. The line is fulfilled exactly and means the opposite of what it offered.",
      concepts:["truth","cruelty","hope"] },

    { id:"1984-q40", text:"We are the dead.",
      locus:"Part 2, Ch. 10", speaker:"Winston, then Julia, then the telescreen", mark:"We are the dead",
      techniques:["repetition","short-sentence","dramatic-irony","motif","foreshadowing"],
      effect:"A lovers' formula that the telescreen repeats back at them as an arrest. The Party's cruellest habit is not censorship but quotation.",
      concepts:["surveillance","betrayal","defeat"] },

    { id:"1984-q41", text:"Down with Big Brother, down with Big Brother, down with Big Brother.",
      locus:"Part 1, Ch. 1", speaker:"Winston (diary)", mark:"down with Big Brother",
      techniques:["repetition","anaphora","asyndeton","climax"],
      effect:"Half a page of the same phrase, written involuntarily. Winston's first act of rebellion has no content beyond its own repetition, which is Orwell's measure of how little room is left for thought.",
      concepts:["resistance","individual","language"] },

    { id:"1984-q42", text:"To the future or to the past, to a time when thought is free.",
      locus:"Part 1, Ch. 2", speaker:"Winston (diary)", mark:"to the past",
      techniques:["apostrophe","antithesis","direct-address","irony"],
      effect:"Winston toasts a reader in either direction because he cannot tell which way freedom lies. The novel answers with the Appendix — a future historian — long after Winston has stopped mattering.",
      concepts:["memory","hope","time"] },

    { id:"1984-q43", text:"Being in a minority, even a minority of one, did not make you mad.",
      locus:"Part 2, Ch. 9", speaker:"narrator (Winston's thought)", mark:"a minority of one",
      techniques:["litotes","free-indirect-discourse","antithesis","hyperbole"],
      effect:"The double negative is a man reassuring himself. Reduced to arithmetic — one against everyone — the claim is either heroic or delusional, and the novel deliberately refuses to say which.",
      concepts:["individual","truth","collective"] },

    { id:"1984-q44", text:"He had won the victory over himself.",
      locus:"Part 3, Ch. 6", speaker:"narrator", mark:"victory over himself",
      techniques:["irony","paradox","short-sentence","free-indirect-discourse"],
      effect:"Party grammar has entered the narration itself. Someone else's sentence now describes Winston's defeat as an achievement — the closest the novel comes to showing conversion from inside.",
      concepts:["defeat","language","individual"] },

    { id:"1984-q45", text:"The past was erased, the erasure was forgotten, the lie became truth.",
      locus:"Part 1, Ch. 4", speaker:"narrator", mark:"the erasure was forgotten",
      techniques:["tricolon","asyndeton","passive-voice","climax","parallelism"],
      effect:"Three clauses of equal weight, no conjunction, so the process reads as automatic. The middle clause is the load-bearing one: forgetting the forgetting is what makes the lie durable.",
      concepts:["memory","truth","control"] },

    { id:"1984-q46", text:"Winston sank his arms to his sides and slowly refilled his lungs with air.",
      locus:"Part 1, Ch. 3", speaker:"narrator", mark:"slowly refilled his lungs",
      techniques:["bathos","physical-imagery","anticlimax","juxtaposition"],
      effect:"After the Physical Jerks, the body's small recovery is all the interiority Orwell allows. The novel keeps returning to breath, ulcer, cough and cold as the last things the Party has not renamed.",
      concepts:["body","control","individual"] },

    { id:"1984-q47", text:"Nothing is your own, except your body, and even that is not for long.",
      locus:"Part 3 (paraphrasing the Party's logic)", speaker:"narrator (Winston's thought)", mark:"even that is not for long",
      techniques:["antithesis","understatement","second-person","foreshadowing"],
      effect:"The one exception Winston had held onto is withdrawn in a subordinate clause, almost casually. Orwell's bleakest revisions always arrive as afterthoughts.",
      concepts:["body","individual","cruelty"] },

    { id:"1984-q48", text:"He was a lonely ghost uttering a truth that nobody would ever hear.",
      locus:"Part 1, Ch. 2", speaker:"narrator (Winston's thought)", mark:"lonely ghost",
      techniques:["metaphor","imagery","free-indirect-discourse","pathos"],
      effect:"The metaphor kills him off two hundred pages early. Winston's self-image as already dead is a form of pre-emptive surrender the Party never has to arrange.",
      concepts:["isolation","individual","defeat"] },

    { id:"1984-q49", text:"But it was all right, everything was all right, the struggle was finished.",
      locus:"Part 3, Ch. 6", speaker:"narrator (Winston's thought)", mark:"everything was all right",
      techniques:["repetition","free-indirect-discourse","irony","asyndeton","bathos"],
      effect:"The reassurance is Winston's and the reader cannot share it. Free indirect discourse lets Orwell write relief and horror in the same clause without a narrator stepping in to sort them out.",
      concepts:["defeat","language","interiority"] },

    { id:"1984-q50", text:"Newspeak was designed not to extend but to diminish the range of thought.",
      locus:"Appendix", speaker:"unnamed later historian", mark:"not to extend but to diminish",
      techniques:["antithesis","passive-voice","academic-register","tense-shift"],
      effect:"The past tense is the point. An Appendix that describes Newspeak historically implies a reader for whom the Party is over, which contradicts the narrative's ending on the novel's very last pages.",
      concepts:["language","memory","hope"] },

    { id:"1984-q51", text:"Winston's diary began: April 4th, 1984. He did not know with any certainty that this was 1984.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"He did not know with any certainty",
      techniques:["juxtaposition","irony","dramatic-irony","understatement"],
      effect:"The novel's title arrives already unreliable. Dating an entry is Winston's first assertion of a private record and his first admission that he cannot verify it.",
      concepts:["memory","truth","time"] },

    { id:"1984-q52", text:"The old man's memory was nothing but a rubbish-heap of details.",
      locus:"Part 1, Ch. 8", speaker:"narrator (Winston's thought)", mark:"rubbish-heap of details",
      techniques:["metaphor","imagery","free-indirect-discourse","bathos"],
      effect:"Winston goes to the proles for history and finds anecdote. The scene refuses the easy consolation that ordinary memory can substitute for records — forgetting does not need a Ministry.",
      concepts:["memory","class","truth"] },

    { id:"1984-q53", text:"Under the window, a monstrous woman, solid as a Norman pillar.",
      locus:"Part 2, Ch. 10", speaker:"narrator (Winston's thought)", mark:"solid as a Norman pillar",
      techniques:["simile","architectural-imagery","allusion","juxtaposition"],
      effect:"The simile reaches back nine centuries for something the Party has not rewritten. Winston's hope in the proles is always expressed in the language of endurance rather than of action.",
      concepts:["class","hope","memory"] },

    { id:"1984-q54", text:"Julia! Julia! Julia, my love! Julia!",
      locus:"Part 3, Ch. 4", speaker:"Winston (in sleep)", mark:"my love",
      techniques:["apostrophe","repetition","exclamation","sentence-fragment"],
      effect:"Involuntary and therefore genuine, and the reason Room 101 is still required. The Party cannot be satisfied by anything Winston says while awake.",
      concepts:["desire","interiority","resistance"] },

    { id:"1984-q55", text:"They can't get inside you.",
      locus:"Part 2, Ch. 7", speaker:"Julia", mark:"inside you",
      techniques:["short-sentence","colloquialism","dramatic-irony","foreshadowing"],
      effect:"Julia's flat certainty is the exact claim Part Three sets out to disprove, phrased in the plainest words in the novel so the reader remembers it when it fails.",
      concepts:["interiority","resistance","betrayal"] },

    { id:"1984-q56", text:"What happens to you here is for ever.",
      locus:"Part 3, Ch. 2", speaker:"O'Brien", mark:"for ever",
      techniques:["high-modality","second-person","short-sentence","motif"],
      effect:"'For ever' recurs across O'Brien's speeches as a substitute for argument. Repetition, not logic, is how the Ministry of Love establishes that there is no outside to appeal to.",
      concepts:["cruelty","power","time"] },

    { id:"1984-q57", text:"Stones are hard, water is wet, objects unsupported fall towards the earth's centre.",
      locus:"Part 3, Ch. 2", speaker:"Winston (thought)", mark:"objects unsupported fall towards the earth's centre",
      techniques:["tricolon","asyndeton","climax","technical-diction","parallelism"],
      effect:"Winston lists what he takes to be unarguable, escalating from the tactile to the physical law. The escalation is his mistake: he assumes a hierarchy of certainty, and O'Brien demolishes it from the top.",
      concepts:["truth","resistance","individual"] },

    { id:"1984-q58", text:"There will be no curiosity, no enjoyment of the process of life. All competing pleasures will be destroyed.",
      locus:"Part 3, Ch. 3", speaker:"O'Brien", mark:"no enjoyment of the process of life",
      techniques:["anaphora","high-modality","prolepsis","accumulation","antithesis"],
      effect:"The repeated 'no' builds a future by subtraction. O'Brien's utopia is defined entirely by what it removes, which is Orwell's point about a politics whose only content is power.",
      concepts:["power","desire","future"] },

    { id:"1984-q59", text:"He had the sensation of stepping into the dampness of a grave.",
      locus:"Part 1, Ch. 1", speaker:"narrator", mark:"dampness of a grave",
      techniques:["simile","tactile-imagery","foreshadowing","motif"],
      effect:"Winston enters the alcove to begin his diary and the sentence buries him. Orwell's foreshadowing is rarely subtle, and its bluntness makes the plot feel less like suspense than like sentence being carried out.",
      concepts:["defeat","interiority","time"] },

    { id:"1984-q60", text:"Tragedy, he perceived, belonged to the ancient time, to a time when there was still privacy, love and friendship.",
      locus:"Part 1, Ch. 3", speaker:"narrator (Winston's thought)", mark:"belonged to the ancient time",
      techniques:["free-indirect-discourse","tricolon","nostalgia","antithesis","allusion"],
      effect:"Winston argues that tragedy requires something to lose, and the Party has removed the preconditions for it. The novel then proceeds to be one — which is the strongest claim it makes for the persistence of the private self.",
      concepts:["individual","memory","desire"] }
  ]
};
