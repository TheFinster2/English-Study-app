/* THE TECHNIQUE GLOSSARY — the text-agnostic core.
   ============================================================================
   Works for any student regardless of what they study, which is why it is worth
   building first. Every entry carries:

     def      what it is, in one sentence
     effect   what it DOES to a reader — the half students leave out, and the half
              marks are actually awarded for
     examples worked, from real texts where possible
     alts     accepted spellings and synonyms, for Layer B (§6.5.6). "epistrophe" and
              "epiphora" are the same figure; a student should not lose a mark for
              knowing the other name for it.

   Name That Technique draws its distractors from here, and validate.js asserts that
   no distractor is also genuinely present in the quote being asked about (§9.7b).
   That check is only as good as this file, so `alts` and `cat` matter.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

EN.DATA.techniqueCategories = [
  { id: "language",   name: "Language and imagery",  icon: "🖼️" },
  { id: "sound",      name: "Sound and rhythm",      icon: "🔊" },
  { id: "syntax",     name: "Syntax and punctuation", icon: "✂️" },
  { id: "rhetoric",   name: "Rhetorical figures",    icon: "🗣️" },
  { id: "poetry",     name: "Poetic form",           icon: "📜" },
  { id: "drama",      name: "Dramatic form",         icon: "🎭" },
  { id: "prose",      name: "Prose and narrative",   icon: "📖" },
  { id: "film",       name: "Film and visual",       icon: "🎬" },
  { id: "register",   name: "Diction and register",  icon: "🎚️" }
];

EN.DATA.techniques = [

  /* ── language and imagery ─────────────────────────────────── */
  { id:"metaphor", name:"Metaphor", cat:"language", alts:["metaphorical"],
    def:"States that one thing IS another, without 'like' or 'as'.",
    effect:"Transfers the whole set of associations from one thing to the other, so the reader accepts a claim they were never asked to agree to.",
    examples:["'He was a lonely ghost' — 1984 kills Winston off two hundred pages early.",
              "'Life's but a walking shadow' — Macbeth."] },

  { id:"simile", name:"Simile", cat:"language", alts:["similie"],
    def:"Compares two things using 'like' or 'as'.",
    effect:"Keeps the two things separate, so the reader can see the join. Weaker than metaphor for assertion, better for precision.",
    examples:["'solid as a Norman pillar' — 1984, reaching nine centuries back for something unrewritten.",
              "'As stiff twin compasses are two' — Donne, 'A Valediction'."] },

  { id:"extended-metaphor", name:"Extended metaphor", cat:"language", alts:["sustained metaphor"],
    def:"One metaphor developed across several lines or a whole text.",
    effect:"Turns an image into a structure. The reader must keep tracking it, so the comparison starts doing the work of an argument.",
    examples:["The coral paperweight as preserved private life across 1984 Part 2."] },

  { id:"conceit", name:"Conceit", cat:"language", alts:["metaphysical conceit","concept"],
    def:"An elaborate, extended comparison sustained as a logical argument, characteristic of the metaphysical poets.",
    effect:"Because it is a proof rather than a decoration, it can be followed step by step — and refuted. The strain is meant to show.",
    examples:["The compass in Donne's 'A Valediction: Forbidding Mourning' — a proof with a conclusion.",
              "The flea as marriage bed in 'The Flea': valid logic, false premise."] },

  { id:"personification", name:"Personification", cat:"language", alts:["personify"],
    def:"Gives human qualities or actions to something non-human or abstract.",
    effect:"Makes an abstraction available to be argued with, praised or insulted. It is a tactical move as often as a descriptive one.",
    examples:["'Death, be not proud' — Donne gives Death a body so it can be told off.",
              "'time, that takes survey of all the world' — 1 Henry IV 5.4."] },

  { id:"symbolism", name:"Symbolism", cat:"language", alts:["symbol","symbolic"],
    def:"An object or action that stands for an idea beyond itself.",
    effect:"Lets a text carry meaning without stating it, and lets the writer destroy the meaning by destroying the object.",
    examples:["The coral paperweight in 1984, smashed in Part 3.",
              "Prospero's staff, broken and buried."] },

  { id:"motif", name:"Motif", cat:"language", alts:["recurring motif","leitmotif"],
    def:"An image, phrase or idea that recurs across a text.",
    effect:"Accumulates meaning through repetition, so its final appearance carries everything the earlier ones deposited.",
    examples:["'Soporific' in W;t — father, seminar, deathbed.",
              "'Under the spreading chestnut tree' in 1984."] },

  { id:"imagery", name:"Imagery", cat:"language", alts:["image","imagery generally"],
    def:"Language appealing to the senses.",
    effect:"Puts the reader in a body. Vague on its own as an analytical label — say WHICH sense and what it is doing.",
    examples:["'the dampness of a grave' — 1984, tactile and premonitory at once."] },

  { id:"visual-imagery", name:"Visual imagery", cat:"language", alts:["sight imagery"],
    def:"Imagery of what is seen — light, colour, shape.",
    effect:"Establishes the reader's position and, in drama and film, tells the audience where to look.",
    examples:["'bright hair about the bone' — Donne, 'The Relique'."] },

  { id:"tactile-imagery", name:"Tactile imagery", cat:"language", alts:["touch imagery","haptic imagery"],
    def:"Imagery of touch, texture and temperature.",
    effect:"The hardest sense to read at a distance, so it collapses the gap between reader and text.",
    examples:["'a cold quicksilver sweat' — Donne, 'The Apparition'."] },

  { id:"auditory-imagery", name:"Auditory imagery", cat:"language", alts:["aural imagery","sound imagery"],
    def:"Imagery of sound.",
    effect:"Creates a space larger than the frame — a sound implies a source the reader cannot see.",
    examples:["'The isle is full of noises' — The Tempest 3.2."] },

  { id:"olfactory-imagery", name:"Olfactory imagery", cat:"language", alts:["smell imagery"],
    def:"Imagery of smell.",
    effect:"The sense most tied to involuntary memory, so it is a shortcut into a character's past.",
    examples:["Victory Coffee and boiled cabbage in 1984 — the smell of a whole political system."] },

  { id:"synaesthesia", name:"Synaesthesia", cat:"language", alts:["synesthesia"],
    def:"Describes one sense in the terms of another.",
    effect:"Forces a reader to construct something impossible, which registers as intensity or as strangeness.",
    examples:["'a candy deal of courtesy' — Hotspur tastes a manner, 1 Henry IV 1.3."] },

  { id:"synecdoche", name:"Synecdoche", cat:"language", alts:["synecdoke"],
    def:"A part standing for the whole, or the whole for a part.",
    effect:"Strips away the particular person and leaves a function, which is how language makes people into mechanisms.",
    examples:["'a boot stamping on a human face' — 1984; both terms are synecdoche, and neither is anybody."] },

  { id:"metonymy", name:"Metonymy", cat:"language", alts:["metonym","metonomy"],
    def:"Substitutes something closely associated for the thing itself.",
    effect:"Reveals what a speaker thinks the thing essentially is. 'The crown' for kingship makes rule an object.",
    examples:["'Uneasy lies the head that wears a crown' — the crown for the office."] },

  { id:"hyperbole", name:"Hyperbole", cat:"language", alts:["hyperbolic","overstatement"],
    def:"Deliberate exaggeration, not meant to be believed literally.",
    effect:"Signals the size of a feeling rather than of a fact — and when a character does not notice they are exaggerating, it characterises them.",
    examples:["'She's all states, and all princes I' — Donne, 'The Sun Rising'.",
              "'Eleven buckram men grown out of two' — Falstaff's arithmetic."] },

  { id:"understatement", name:"Understatement", cat:"language", alts:["meiosis","undersell"],
    def:"Says less than the situation warrants.",
    effect:"Puts the reader to work supplying the missing intensity, which is usually more effective than being handed it.",
    examples:["'I think I die at the end' — W;t, Scene 1.",
              "'There were no windows in it at all' — the Ministry of Love."] },

  { id:"litotes", name:"Litotes", cat:"language", alts:["litote","double negative"],
    def:"Affirms something by denying its opposite: 'not unattractive'.",
    effect:"A hedged assertion. In a first-person narrator it often reads as someone reassuring themselves.",
    examples:["'Being in a minority... did not make you mad' — 1984, a man arguing with himself."] },

  { id:"diminution", name:"Diminution", cat:"language", alts:["diminishment","scaling down"],
    def:"Progressively reducing the scale of what is described.",
    effect:"The syntax shrinks with the subject, so a life or an argument visibly runs out of room.",
    examples:["'last mile... last pace... last inch... latest point' — Donne, Holy Sonnet 6."] },

  { id:"oxymoron", name:"Oxymoron", cat:"language", alts:["oxymoronic"],
    def:"Two contradictory terms placed side by side.",
    effect:"Holds an impossibility in two words. Unlike paradox it is compressed to a phrase, so it registers as a jolt rather than an argument.",
    examples:["'A terrible ecstasy' — 1984, religious rapture at a political rally.",
              "'It's a beautiful thing, the destruction of words' — Syme."] },

  { id:"paradox", name:"Paradox", cat:"language", alts:["paradoxical"],
    def:"A statement that seems self-contradictory but discloses a truth on reflection.",
    effect:"Stops the reader and makes them do the reconciling. In Donne it is frequently a real theological claim compressed until it looks impossible.",
    examples:["'Death, thou shalt die' — Holy Sonnet 10.",
              "'FREEDOM IS SLAVERY' — and the flat copula admits no degree."] },

  { id:"irony", name:"Irony", cat:"language", alts:["ironic","ironical"],
    def:"A gap between what is said and what is meant, or between expectation and outcome.",
    effect:"Creates two audiences — one that gets it and one that does not — and rewards the first with complicity.",
    examples:["'the Ministry of Truth, which concerned itself with news'.",
              "'I have always particularly liked that poem. In the abstract.' — W;t."] },

  { id:"dramatic-irony", name:"Dramatic irony", cat:"drama", alts:["tragic irony"],
    def:"The audience knows something a character does not.",
    effect:"Every subsequent line acquires a second meaning, and the audience's superior knowledge becomes uncomfortable rather than pleasant.",
    examples:["Hal's 'I know you all' means the audience watches every later tavern scene as surveillance.",
              "'They can't get inside you' — Julia, before Part 3."] },

  { id:"allusion", name:"Allusion", cat:"language", alts:["allude","reference"],
    def:"An indirect reference to another text, person or event.",
    effect:"Borrows authority or irony from elsewhere without spending words on it — and excludes readers who miss it, which is sometimes the point.",
    examples:["'Redeeming time' — Hal quotes Ephesians while planning to exploit his friends.",
              "'flights of angels sing thee to thy rest' — Ashford quotes Horatio in W;t."] },

  { id:"biblical-allusion", name:"Biblical allusion", cat:"language", alts:["scriptural allusion"],
    def:"Allusion specifically to scripture.",
    effect:"Imports a moral frame the text may then endorse or undercut. In a secular context it is usually being used against itself.",
    examples:["'Until an hour before the Devil fell' — Proctor argues against Salem from Salem's scripture."] },

  { id:"intertextuality", name:"Intertextuality", cat:"language", alts:["intertextual"],
    def:"One text explicitly in relationship with another.",
    effect:"The central Module A concern. The meaning sits in the gap between the texts, not in either one.",
    examples:["W;t's title, drawn from an editorial dispute over Donne's punctuation.",
              "Hag-Seed's inmates rewriting Caliban's ending."] },

  { id:"pun", name:"Pun", cat:"language", alts:["paronomasia","wordplay","word play"],
    def:"Exploits two meanings of one word, or two words that sound alike.",
    effect:"Makes language visibly untrustworthy. In Shakespeare it is rarely just a joke — it is usually the fastest way to say two things at once.",
    examples:["'I am not a double man' — Falstaff: ghost, two men, and duplicitous.",
              "'Per fretum febris' — strait and raging, in Donne's sickness hymn."] },

  { id:"polyptoton", name:"Polyptoton", cat:"rhetoric", alts:["poliptoton"],
    def:"Repeats a word in a different grammatical form.",
    effect:"The same root doing two jobs makes the line seem to turn on itself, which suits a reversal.",
    examples:["'Death, thou shalt die' — noun then verb inside four words."] },

  { id:"euphemism", name:"Euphemism", cat:"register", alts:["euphemistic"],
    def:"A milder word substituted for a harsh one.",
    effect:"Names the speaker's discomfort. In institutional language it is usually concealing an agent, which is why it is a political technique.",
    examples:["'One short sleep past' — death as a nap, Holy Sonnet 10.",
              "'do everything possible' — W;t, Susie on full code."] },

  { id:"dysphemism", name:"Dysphemism", cat:"register", alts:["dysphemistic"],
    def:"A deliberately harsher word than needed.",
    effect:"Refuses the comfort a euphemism offers, often to force a reader to look at something directly.",
    examples:["'Food for powder' — Falstaff's conscripts as ammunition."] },

  { id:"dehumanisation", name:"Dehumanisation", cat:"language", alts:["dehumanization","dehumanising"],
    def:"Language that removes a person's humanity, reducing them to a category, number or object.",
    effect:"Makes cruelty administratively possible. Its presence in a bureaucratic register is more chilling than in an insult.",
    examples:["'She's Research!' — W;t, Scene 17.",
              "'The proles are not human beings' — 1984."] },

  { id:"neologism", name:"Neologism", cat:"language", alts:["coinage","new word"],
    def:"A newly invented word.",
    effect:"Signals that existing language cannot cover the situation — or, in a dystopia, that the language has been redesigned.",
    examples:["'doublethink', 'thoughtcrime', 'unperson' — 1984.",
              "'vasty' — Glendower reaching for grandeur, 1 Henry IV 3.1."] },

  { id:"adynaton", name:"Adynaton", cat:"rhetoric", alts:["impossibility"],
    def:"Hyperbole taken to impossibility, often as a list of things that cannot be done.",
    effect:"The impossibility is the argument: whatever is added to the list is being classed as impossible too.",
    examples:["'Go and catch a falling star' — Donne, and a constant woman belongs on that list."] },

  { id:"memento-mori", name:"Memento mori", cat:"language", alts:["reminder of death"],
    def:"An image that reminds the viewer of mortality — a skull, a bone, a corpse.",
    effect:"Puts a physical object where an abstraction was, which is much harder for a character or reader to argue with.",
    examples:["'Alas, poor Yorick!' — a specific person's skull, not a symbol.",
              "'such grinning honour as Sir Walter hath' — Blunt's corpse refuting the catechism."] },

  { id:"microcosm", name:"Microcosm", cat:"language", alts:["microcosmic"],
    def:"A small thing standing for a much larger system.",
    effect:"Lets a writer apply the instruments of cosmology or politics to a room, a body or a family.",
    examples:["'I am a little world made cunningly' — Donne, Holy Sonnet 5."] },

  { id:"ambiguity", name:"Ambiguity", cat:"language", alts:["ambiguous","equivocation"],
    def:"Language that sustains more than one reading without resolving.",
    effect:"Deliberate ambiguity is not vagueness. It makes the reader hold both readings, which is often the text's actual claim.",
    examples:["'This thing of darkness I / Acknowledge mine' — servant, responsibility, or self."] },

  { id:"negation", name:"Negation", cat:"syntax", alts:["negative construction"],
    def:"Building a statement out of what is not the case.",
    effect:"Defines by subtraction. A future described entirely by removals tells you what its author values.",
    examples:["'There will be no curiosity, no enjoyment of the process of life' — O'Brien."] },

  { id:"generalisation", name:"Generalisation", cat:"rhetoric", alts:["universalising","universalisation"],
    def:"Expands a specific instance into a universal claim.",
    effect:"Persuasive and usually unearned. When a character does it, the text is often characterising the leap rather than endorsing it.",
    examples:["'Frailty, thy name is woman!' — one grievance made universal in four words."] },

  { id:"nostalgia", name:"Nostalgia", cat:"language", alts:["nostalgic"],
    def:"Longing for a past presented as better and largely unverifiable.",
    effect:"In 1984 it is a political position, since a past nobody can check is the Party's territory. It is also always a little suspect.",
    examples:["'Tragedy... belonged to the ancient time' — Winston, Part 1 Ch. 3."] },

  { id:"violence-imagery", name:"Violent imagery", cat:"language", alts:["violence","brutal imagery"],
    def:"Imagery of physical force, breakage or wounding.",
    effect:"Where it appears in a devotional or erotic context, the mismatch is the meaning — force is being used to describe something the speaker has no gentler vocabulary for.",
    examples:["'break, blow, burn' — Holy Sonnet 14 asks for siege."] },

  /* ── sound and rhythm ─────────────────────────────────────── */
  { id:"alliteration", name:"Alliteration", cat:"sound", alts:["aliteration"],
    def:"Repeated initial consonant sounds in nearby words.",
    effect:"Binds words together as a unit so the reader takes them as one idea. Never 'creates emphasis' — say what it binds.",
    examples:["'break, blow, burn' — Donne binds three verbs into one act.",
              "'bright hair about the bone' — the living wrapped round the dead."] },

  { id:"assonance", name:"Assonance", cat:"sound", alts:["vowel rhyme"],
    def:"Repeated vowel sounds in nearby words.",
    effect:"Slows a line and holds it together more loosely than rhyme, so it can bind without announcing itself.",
    examples:["'so shaken as we are, so wan with care' — the long vowels drag."] },

  { id:"consonance", name:"Consonance", cat:"sound", alts:["consonant repetition"],
    def:"Repeated consonant sounds anywhere in nearby words, not only initially.",
    effect:"Creates texture rather than emphasis. Hard consonants roughen a line; soft ones smooth it.",
    examples:["'roping icicles / Upon our houses' thatch' — Hotspur on inaction."] },

  { id:"sibilance", name:"Sibilance", cat:"sound", alts:["sibilant","hissing"],
    def:"Repeated s, sh and z sounds.",
    effect:"Whispers or hisses depending on context. Its usual work is to lower the volume of a line, which suits secrecy and dying.",
    examples:["'As virtuous men pass mildly away' — Donne makes a deathbed quiet."] },

  { id:"plosive", name:"Plosives", cat:"sound", alts:["plosive consonants","explosive consonants"],
    def:"Hard stopped consonants: b, p, d, t, k, g.",
    effect:"Interrupts the breath, so a line of them cannot be read smoothly. Physically forces the reader to perform the violence.",
    examples:["'Batter my heart' — two stresses and a plosive, and the iamb is gone."] },

  { id:"onomatopoeia", name:"Onomatopoeia", cat:"sound", alts:["onomatopeia","sound word"],
    def:"A word that imitates the sound it names.",
    effect:"Collapses the gap between word and thing, which is the closest language gets to direct representation.",
    examples:["The telescreen's 'sordid' hum; 'clang', 'hiss', 'murmur'."] },

  { id:"cacophony", name:"Cacophony", cat:"sound", alts:["cacophonous","harsh sound"],
    def:"A deliberately harsh, discordant arrangement of sounds.",
    effect:"Makes a line unpleasant to say, so the reader's mouth registers the content before the brain does.",
    examples:["'pestered with a popinjay' — Hotspur spitting."] },

  { id:"euphony", name:"Euphony", cat:"sound", alts:["euphonious","pleasing sound"],
    def:"A smooth, pleasing arrangement of sounds.",
    effect:"Ease can be used against the content: a beautiful line about something ugly is doing something a harsh one cannot.",
    examples:["'Sounds and sweet airs, that give delight and hurt not' — Caliban."] },

  { id:"rhyme", name:"Rhyme", cat:"sound", alts:["rhyming","rime"],
    def:"Matching sounds at the ends of words, usually line-final.",
    effect:"Closes a unit and makes it memorable. In blank verse an unexpected rhyme signals that something is being sealed.",
    examples:["Hal's soliloquy ends on a couplet, like a contract being signed."] },

  { id:"half-rhyme", name:"Half rhyme", cat:"sound", alts:["slant rhyme","near rhyme","imperfect rhyme"],
    def:"An approximate rhyme where the sounds do not fully match.",
    effect:"Promises closure and withholds it, so the reader hears the poem failing to settle.",
    examples:["Common in twentieth-century verse where full rhyme would sound complacent."] },

  { id:"internal-rhyme", name:"Internal rhyme", cat:"sound", alts:["mid-line rhyme"],
    def:"Rhyme occurring within a single line.",
    effect:"Tightens a line without ending it, which speeds the reading rather than stopping it.",
    examples:["'I sold you and you sold me' — 1984's chestnut tree jingle."] },

  { id:"iambic-pentameter", name:"Iambic pentameter", cat:"poetry", alts:["iambic","pentameter","blank verse"],
    def:"Five iambs per line: da-DUM × 5. Unrhymed, it is blank verse.",
    effect:"Close to the rhythm of English speech, so it reads as natural — which makes any departure from it audible and meaningful.",
    examples:["'So shaken as we are, so wan with care' — regular, and exhausted."] },

  { id:"trochaic-metre", name:"Trochaic metre", cat:"poetry", alts:["trochee","trochaic"],
    def:"A stressed syllable followed by an unstressed one: DUM-da.",
    effect:"Front-loads the stress, giving a driving or incantatory feel. Used against iambic norms it sounds like an interruption.",
    examples:["'Go and catch a falling star' — Donne opens on the stress."] },

  { id:"spondee", name:"Spondee", cat:"poetry", alts:["spondaic"],
    def:"Two consecutive stressed syllables.",
    effect:"Stops the line dead. Two stresses cannot be hurried, so the moment is forcibly slowed.",
    examples:["'Batter my heart' — the opening spondee breaks the iambic contract immediately."] },

  { id:"caesura", name:"Caesura", cat:"poetry", alts:["cesura","mid-line break"],
    def:"A pause within a line, often punctuated.",
    effect:"Splits a line into two halves that can be set against each other, so the break itself carries the meaning.",
    examples:["'And death shall be no more; Death, thou shalt die' — the whole argument of W;t sits in that mark."] },

  { id:"enjambment", name:"Enjambment", cat:"poetry", alts:["enjambement","run-on line"],
    def:"A sentence running over the end of a line without punctuation.",
    effect:"Creates two readings — the line alone, then the completed sentence. What sits at the break is emphasised twice.",
    examples:["'This thing of darkness I / Acknowledge mine' — 'I' hangs alone before the verb arrives."] },

  { id:"end-stop", name:"End-stopped line", cat:"poetry", alts:["end stopping","endstopped"],
    def:"A line ending with punctuation and a complete grammatical unit.",
    effect:"Makes each line self-contained and slows the poem. A run of them reads as measured or as stubborn.",
    examples:["Donne's Holy Sonnet 6, where each measurement gets its own closed clause."] },

  { id:"irregular-metre", name:"Irregular metre", cat:"poetry", alts:["metrical irregularity","broken metre"],
    def:"Deliberate departure from an established metrical pattern.",
    effect:"You can only hear it against a norm. Ben Jonson thought Donne deserved hanging for it — the roughness is the point.",
    examples:["'Busy old fool, unruly sun' — Donne's stanza has lines of five different lengths."] },

  { id:"monosyllables", name:"Monosyllabic diction", cat:"sound", alts:["monosyllabic","short words"],
    def:"A run of one-syllable words.",
    effect:"Nothing to hide behind. After elaborate syntax it reads as honesty or as exhaustion.",
    examples:["'I do, I will' — the hinge of 1 Henry IV in four words.",
              "'I'm scared' — W;t, after ninety minutes of subordinate clauses."] },

  { id:"silence", name:"Silence / pause", cat:"drama", alts:["pause","beat"],
    def:"A scripted absence of speech.",
    effect:"In a text made of words, a marked silence is the loudest available signal, and it cannot be paraphrased.",
    examples:["W;t's final stage direction — an action after two hours of talk."] },

  /* ── syntax and punctuation ───────────────────────────────── */
  { id:"juxtaposition", name:"Juxtaposition", cat:"syntax", alts:["juxtapose","placing side by side"],
    def:"Placing two things next to each other so the contrast does the work.",
    effect:"No connective is needed — proximity forces the comparison, and the reader makes the argument themselves.",
    examples:["'a bright cold day in April' next to 'striking thirteen'.",
              "Hal's elegy for Hotspur immediately followed by 'all this flesh'."] },

  { id:"antithesis", name:"Antithesis", cat:"syntax", alts:["antithetical","antithesus"],
    def:"Balanced grammatical structures holding opposed ideas.",
    effect:"The symmetry makes the opposition look like a law rather than an opinion. Very hard to argue with a well-built antithesis.",
    examples:["'Power is not a means; it is an end.'",
              "'Once I did the teaching, now I am taught.'"] },

  { id:"chiasmus", name:"Chiasmus", cat:"rhetoric", alts:["chiasmic","antimetabole","criss-cross"],
    def:"An inverted parallel: A-B, B-A.",
    effect:"The sentence closes the loop it describes, so its shape becomes its argument. There is no point outside the circle from which to check it.",
    examples:["'Who controls the past controls the future: who controls the present controls the past.'",
              "'I sold you and you sold me.'"] },

  { id:"parallelism", name:"Parallelism", cat:"syntax", alts:["parallel structure","parallel construction"],
    def:"Repeated grammatical structure across clauses.",
    effect:"Sets items up as equivalent, which is why breaking the pattern on the last item lands so hard.",
    examples:["'Every generation is told... and every generation is told this by someone holding a book.'"] },

  { id:"anaphora", name:"Anaphora", cat:"rhetoric", alts:["anafora","anaphoric"],
    def:"Repetition of the same word or phrase at the START of successive clauses.",
    effect:"Builds rhythm and momentum, and makes each new item feel inevitable rather than argued for.",
    examples:["'Every record has been destroyed... every book rewritten, every picture repainted.'",
              "'I saw Goody Osburn with the Devil! I saw Bridget Bishop...'"] },

  { id:"epistrophe", name:"Epistrophe", cat:"rhetoric", alts:["epiphora","antistrophe"],
    def:"Repetition of the same word or phrase at the END of successive clauses.",
    effect:"Drives toward a fixed point, so the repeated word acquires the weight of a conclusion.",
    examples:["'of the people, by the people, for the people'."] },

  { id:"tricolon", name:"Tricolon", cat:"rhetoric", alts:["rule of three","triadic structure","triad"],
    def:"Three parallel elements in sequence.",
    effect:"Three is the smallest number that reads as a pattern and as complete, which is why it feels authoritative.",
    examples:["'WAR IS PEACE. FREEDOM IS SLAVERY. IGNORANCE IS STRENGTH.'",
              "'Erudition. Interpretation. Complication.' — W;t."] },

  { id:"listing", name:"Listing", cat:"syntax", alts:["enumeration","catalogue","cataloguing"],
    def:"A series of items in sequence.",
    effect:"Suggests either abundance or exhaustion depending on length and rhythm. Where the list descends in dignity it is doing satire.",
    examples:["'slave to fate, chance, kings, and desperate men' — Death demoted by association."] },

  { id:"accumulation", name:"Accumulation", cat:"syntax", alts:["piling up","congeries"],
    def:"Heaping up words or clauses to build weight.",
    effect:"The quantity is the argument. A reader who cannot see the end of a sentence feels the inescapability of its subject.",
    examples:["'Asleep or awake, working or eating, indoors or out of doors.'"] },

  { id:"asyndeton", name:"Asyndeton", cat:"syntax", alts:["asyndetic","no conjunctions"],
    def:"Omits conjunctions between items.",
    effect:"Speeds the line and denies it a hierarchy — nothing is subordinated, so everything arrives at once.",
    examples:["'die all, die merrily' — no conjunction, no consequence.",
              "'Stones are hard, water is wet, objects unsupported fall.'"] },

  { id:"polysyndeton", name:"Polysyndeton", cat:"syntax", alts:["polysyndetic","many conjunctions"],
    def:"Repeats conjunctions between every item.",
    effect:"Slows the line and gives each item its own weight, which can read as biblical, childlike or relentless.",
    examples:["'and the voice enveloping you... and the telescreen... and the poster'."] },

  { id:"ellipsis", name:"Ellipsis", cat:"syntax", alts:["elipsis","omission","three dots"],
    def:"Omission of words the reader can supply, or the mark indicating it.",
    effect:"Leaves a hole the reader fills. In dialogue it registers as hesitation the speaker cannot control.",
    examples:["'You cannot imagine how time can be… so still.' — W;t."] },

  { id:"aposiopesis", name:"Aposiopesis", cat:"rhetoric", alts:["broken off sentence","trailing off"],
    def:"A sentence broken off unfinished.",
    effect:"The failure to finish is the content. Especially telling in a character who finishes everything else.",
    examples:["'I have been asked to be… to be… I don't know.' — W;t."] },

  { id:"repetition", name:"Repetition", cat:"rhetoric", alts:["repeat","reiteration"],
    def:"Saying the same word or phrase more than once.",
    effect:"Insists. Where the repeated phrase is involuntary it stops being rhetoric and becomes symptom.",
    examples:["'Do it to Julia! Do it to Julia!' — syntax collapsing with the self.",
              "'For ever' across O'Brien's speeches, as a substitute for argument."] },

  { id:"epanorthosis", name:"Epanorthosis", cat:"rhetoric", alts:["self-correction","correctio"],
    def:"Immediately correcting or sharpening what was just said.",
    effect:"Stages a mind in motion, and the corrected version arrives with the authority of a second thought.",
    examples:["'Orthodoxy means not thinking — not needing to think.'",
              "'You had to live — did live, from habit that became instinct —'."] },

  { id:"praeteritio", name:"Praeteritio", cat:"rhetoric", alts:["apophasis","occupatio","paralipsis"],
    def:"Naming something while claiming not to mention it.",
    effect:"Gets the content in and disowns responsibility for it, and the refusal draws more attention than the statement would.",
    examples:["'I could describe the funeral. I would rather describe the car park.'"] },

  { id:"parenthesis", name:"Parenthesis", cat:"syntax", alts:["parenthetical","aside in brackets"],
    def:"An interruption inserted into a sentence, marked by brackets, dashes or commas.",
    effect:"Two voices at once — the sentence and its own commentary. What goes inside is often the honest part.",
    examples:["'Nothing but a breath — a comma — separates life from life everlasting.'",
              "'Dull sublunary lovers' love / (Whose soul is sense)'."] },

  { id:"dash", name:"Dash", cat:"syntax", alts:["em dash","--"],
    def:"A punctuation mark marking interruption, afterthought or a sudden turn.",
    effect:"Faster and less formal than a colon. Before a final phrase it functions as a held breath.",
    examples:["'a boot stamping on a human face — for ever'."] },

  { id:"colon", name:"Colon", cat:"syntax", alts:[":"],
    def:"Introduces an explanation, list or equivalence.",
    effect:"Asserts that what follows IS what precedes. It replaces argument with identity, which is why it suits slogans.",
    examples:["'Thoughtcrime does not entail death: thoughtcrime IS death.'"] },

  { id:"semicolon", name:"Semicolon", cat:"syntax", alts:[";"],
    def:"Joins two independent clauses more closely than a full stop.",
    effect:"Balances two clauses as equals. W;t's title argues that the choice between this and a comma is a theological one.",
    examples:["'Power is not a means; it is an end.'"] },

  { id:"short-sentence", name:"Short sentence", cat:"syntax", alts:["brevity","terse sentence"],
    def:"A markedly brief sentence, usually after longer ones.",
    effect:"Only works by contrast. Placed after elaboration it reads as a verdict.",
    examples:["'He loved Big Brother.'",
              "'Sanity is not statistical.'"] },

  { id:"sentence-fragment", name:"Sentence fragment", cat:"syntax", alts:["fragment","incomplete sentence","minor sentence"],
    def:"A grammatically incomplete unit punctuated as a sentence.",
    effect:"Where the missing verb is the point — a state with no action available — the fragment is doing real work rather than being an error.",
    examples:["'Full dose. Excellent.' — W;t.",
              "'Then, nothing.'"] },

  { id:"periodic-sentence", name:"Periodic sentence", cat:"syntax", alts:["periodic construction","suspended sentence"],
    def:"Delays the main clause until the end.",
    effect:"Holds the reader in suspense inside the grammar, so the resolution lands with accumulated force.",
    examples:["'A scrupulous writer, in every sentence that he writes, will ask himself at least four questions.'"] },

  { id:"cumulative-sentence", name:"Cumulative sentence", cat:"syntax", alts:["loose sentence","trailing sentence"],
    def:"States the main clause first, then adds modifiers.",
    effect:"Reads as thinking out loud, gathering detail as it goes. The opposite rhythm to periodic.",
    examples:["Common in discursive writing, where the form is exploratory."] },

  { id:"sentence-length-variation", name:"Sentence length variation", cat:"syntax", alts:["varied sentence length","rhythm of sentences"],
    def:"Deliberate alternation of long and short sentences.",
    effect:"The most controllable rhythmic tool in prose and the least often used on purpose. A short sentence lands because of what preceded it.",
    examples:["'The bus was late. The bus was always late. The bus was, in a sense, the only thing I could rely on.'"] },

  { id:"inversion", name:"Inversion", cat:"syntax", alts:["anastrophe","reversed word order"],
    def:"Reversing normal word order.",
    effect:"Puts the emphasised element first, and in verse it can also serve the metre — check which before claiming the effect.",
    examples:["'Uneasy lies the head that wears a crown' — uncomfortable before we know what about."] },

  { id:"apposition", name:"Apposition", cat:"syntax", alts:["appositive","appositional"],
    def:"A noun phrase placed beside another to redefine it.",
    effect:"Renames without a verb, so the redefinition arrives as fact rather than as claim.",
    examples:["'sickness, death's herald, and champion' — two titles, one bureaucratic and one martial."] },

  { id:"zeugma", name:"Zeugma", cat:"rhetoric", alts:["syllepsis"],
    def:"One word governs two others in incongruous ways.",
    effect:"Forces a literal and a figurative sense to share a verb, so the join is visible and usually witty.",
    examples:["'an ecstasy of fear and vindictiveness' — one noun over two incompatible feelings."] },

  { id:"hendiadys", name:"Hendiadys", cat:"rhetoric", alts:["hendiadis"],
    def:"Expresses one idea with two nouns joined by 'and' where a noun and adjective would do.",
    effect:"Splits a single idea in two so neither half is quite adequate, which suits characters who cannot name their state.",
    examples:["'a rogue and peasant slave' — Hamlet."] },

  { id:"nominalisation", name:"Nominalisation", cat:"syntax", alts:["nominalization","noun-ification","abstraction"],
    def:"Turning a verb or adjective into an abstract noun: 'participate' → 'participation'.",
    effect:"Removes the agent and the action, which is why institutions love it. It makes things happen without anyone doing them.",
    examples:["'vile participation' — a bloodless word for drinking with commoners.",
              "'the acquisition of vocabulary' — W;t."] },

  { id:"passive-voice", name:"Passive voice", cat:"syntax", alts:["passive construction","passive"],
    def:"The subject receives the action; the agent may be omitted.",
    effect:"Deletes responsibility. In 1984 the erasure of the past reads like weather because Winston cannot find a subject for the sentence.",
    examples:["'Every record has been destroyed or falsified'.",
              "'I have been found out' — W;t."] },

  { id:"active-voice", name:"Active voice", cat:"syntax", alts:["active construction","active"],
    def:"The subject performs the action.",
    effect:"Assigns agency. Its effect is usually only visible where the surrounding text is passive.",
    examples:["'I speak my own sins' — Proctor, refusing the passive available to him."] },

  { id:"delayed-predicate", name:"Delayed predicate", cat:"syntax", alts:["postponed verb","suspended predicate"],
    def:"Postponing the verb or the key noun to the end of the sentence.",
    effect:"Makes the reader wait, so the withheld word arrives with the weight of the whole sentence behind it.",
    examples:["'He was, and I want to be precise about this, a coward.'"] },

  { id:"embedded-clause", name:"Embedded clause", cat:"syntax", alts:["subordinate clause","nested clause"],
    def:"A clause inserted inside another.",
    effect:"Interrupts, qualifies, or shows a mind unable to leave a statement alone. The interruption is often the analysis.",
    examples:["'He who controls the past, ran the Party slogan, controls the future.'"] },

  { id:"chain-structure", name:"Chain structure", cat:"syntax", alts:["chained clauses","gradatio","climax chain"],
    def:"Each clause subordinates to the next, forming a descending sequence.",
    effect:"Builds a hierarchy and then reveals it has nothing at the top.",
    examples:["'thought's the slave of life, and life time's fool'."] },

  { id:"capitalisation", name:"Capitalisation", cat:"syntax", alts:["capitalization","block capitals","caps"],
    def:"Non-standard use of capital letters.",
    effect:"Raises the volume typographically. Where it is institutional it reads as a voice with no body behind it.",
    examples:["'BIG BROTHER IS WATCHING YOU'.",
              "'She's Research!' — a person promoted to a category."] },

  { id:"exclamation", name:"Exclamation", cat:"syntax", alts:["exclamatory","exclamation mark"],
    def:"A sentence or mark expressing sudden emotion.",
    effect:"Cheap in bulk and effective when rationed. In W;t it is precisely what Ashford says death should NOT be acted out with.",
    examples:["'O monstrous! Eleven buckram men grown out of two!'"] },

  { id:"acronym", name:"Acronym / initialism", cat:"register", alts:["initialism","abbreviation"],
    def:"A phrase compressed into its initial letters.",
    effect:"Institutional shorthand. It saves breath and removes the content, so a decision about a person's death can be transacted in three letters.",
    examples:["'She's DNR!' — W;t, Scene 17: Susie wins the argument using the institution's own instrument."] },

  { id:"one-word-sentence", name:"One-word sentence", cat:"syntax", alts:["single word sentence"],
    def:"A single word punctuated as a complete sentence.",
    effect:"Maximum isolation. The word is given a whole sentence's worth of attention.",
    examples:["'Soporific.' — W;t, the first word Vivian ever loved."] },

  /* ── rhetorical figures ───────────────────────────────────── */
  { id:"rhetorical-question", name:"Rhetorical question", cat:"rhetoric", alts:["rhetorical q","erotema"],
    def:"A question asked for effect rather than for information.",
    effect:"Recruits the reader into supplying the answer, which makes them feel they arrived at it themselves.",
    examples:["'But who am I, that dare dispute with thee?' — Donne, retracting eight lines of dispute."] },

  { id:"hypophora", name:"Hypophora", cat:"rhetoric", alts:["anthypophora","question and answer"],
    def:"Asking a question and immediately answering it yourself.",
    effect:"The form of a lesson, not a debate. It closes off the alternatives before anyone can offer one.",
    examples:["'What is honour? A word.' — Falstaff's catechism, 5.1."] },

  { id:"apostrophe", name:"Apostrophe", cat:"rhetoric", alts:["invocation","direct address to absent"],
    def:"Addressing someone absent, dead, or an abstraction.",
    effect:"Summons an opponent who can then be argued with. Donne's habitual first move.",
    examples:["'Death, be not proud'.",
              "'O my America! my new-found-land'."] },

  { id:"direct-address", name:"Direct address", cat:"rhetoric", alts:["addressing the reader","addressing the audience"],
    def:"Speaking directly to the reader, audience or a named person.",
    effect:"Closes the distance and makes the recipient responsible for what follows.",
    examples:["'BIG BROTHER IS WATCHING YOU' — the second person is the whole trick.",
              "Vivian narrating W;t to the house."] },

  { id:"imperative", name:"Imperative", cat:"rhetoric", alts:["command","imperative mood"],
    def:"A command.",
    effect:"Assumes the authority to instruct. Where the speaker has none, the imperative is a plea wearing an order's clothes.",
    examples:["'Batter my heart' — a command issued upward.",
              "'Mark but this flea'."] },

  { id:"modality", name:"Modality", cat:"register", alts:["modal verbs","modal language"],
    def:"The degree of certainty or obligation in a verb: must, will, might, perhaps.",
    effect:"Measures how much a speaker is prepared to commit. Shifts in modality track shifts in confidence more reliably than tone does.",
    examples:["'Perhaps one did not want to be loved' — hedged inside his own head."] },

  { id:"high-modality", name:"High modality", cat:"register", alts:["strong modality","certainty"],
    def:"Language of certainty and obligation: must, will, shall, never.",
    effect:"Forecloses disagreement. Repeated without evidence it becomes the substitute for argument.",
    examples:["'What happens to you here is for ever.' — O'Brien.",
              "'It is not possible, it cannot be' — Worcester, persuading himself."] },

  { id:"low-modality", name:"Low modality", cat:"register", alts:["weak modality","hedging","tentative language"],
    def:"Language of possibility and hesitation: might, perhaps, seems, could.",
    effect:"Leaves room, invites the reader in — or records a speaker who has been trained not to assert anything.",
    examples:["'Perhaps one did not want to be loved so much as to be understood.'"] },

  { id:"inclusive-language", name:"Inclusive language", cat:"rhetoric", alts:["we language","collective pronouns"],
    def:"First-person plural pronouns that fold the audience into the speaker's position.",
    effect:"Manufactures agreement before it is offered. 'We' is the cheapest and most effective persuasive device in English.",
    examples:["'We are not interested in the good of others' — O'Brien's 'we' has no dissent in it."] },

  { id:"first-person", name:"First person", cat:"prose", alts:["I narrator","first-person narration"],
    def:"Narration or speech using 'I'.",
    effect:"Grants intimacy and forfeits reliability. Everything is filtered and the reader knows it.",
    examples:["Winston's diary — the only place 1984 lets a private first person speak."] },

  { id:"first-person-plural", name:"First person plural", cat:"rhetoric", alts:["we","royal we"],
    def:"'We' and 'us'.",
    effect:"Either solidarity or the royal we — and in a king's mouth the ambiguity between the man and the state is doing political work.",
    examples:["'So shaken as we are' — kingdom or man?"] },

  { id:"second-person", name:"Second person", cat:"rhetoric", alts:["you","second-person address"],
    def:"'You'.",
    effect:"Implicates the reader directly. In 1984 it converts general description into personal accusation.",
    examples:["'Nothing was your own except the few cubic centimetres inside your skull.'"] },

  { id:"pronoun-shift", name:"Pronoun shift", cat:"syntax", alts:["shifting pronouns","pronoun change"],
    def:"Changing pronoun mid-passage: I to we, you to one.",
    effect:"Marks a change in the speaker's relationship to what they are saying, usually toward or away from responsibility.",
    examples:["Winston sliding from 'I' to 'one' when the thought becomes dangerous."] },

  { id:"aphorism", name:"Aphorism", cat:"rhetoric", alts:["epigram","maxim","sententia"],
    def:"A short, pointed general statement.",
    effect:"Sounds like inherited wisdom, which lends it authority it may not have earned. Test whether the text endorses it.",
    examples:["'Sanity is not statistical.'",
              "'The better part of valour is discretion' — Falstaff quoting his own revision as authority."] },

  { id:"concession", name:"Concession", cat:"rhetoric", alts:["conceding","concessive"],
    def:"Granting a point to the other side before answering it.",
    effect:"Buys credibility. The move that separates persuasion from assertion, and the one student persuasive writing most often skips.",
    examples:["'Well, 'tis no matter; honour pricks me on' — Falstaff concedes the ground he is about to take."] },

  { id:"refutation", name:"Refutation", cat:"rhetoric", alts:["rebuttal","counter-argument"],
    def:"Directly answering an opposing argument.",
    effect:"Only works if the version refuted is the strong one. Refuting a weak version is a straw man and readers notice.",
    examples:["Falstaff's catechism refutes honour by asking who has it."] },

  { id:"false-dichotomy", name:"False dichotomy", cat:"rhetoric", alts:["false binary","either-or fallacy"],
    def:"Presenting two options as the only two.",
    effect:"An argument with two positions cannot be answered from anywhere else, which is why it is the standard rhetoric of coercion.",
    examples:["'either with this court or... against it, there be no road between' — Danforth."] },

  { id:"reductio", name:"Reductio ad absurdum", cat:"rhetoric", alts:["reductio","reduction to absurdity"],
    def:"Following an opponent's premise to an absurd conclusion.",
    effect:"Attacks the premise without ever denying it, which is harder to resist than contradiction.",
    examples:["Falstaff: honour belongs to 'he that died o' Wednesday'. Does he feel it? No."] },

  { id:"syllogism", name:"Syllogism", cat:"rhetoric", alts:["syllogistic","logical argument"],
    def:"Premise, premise, therefore.",
    effect:"Valid form guarantees nothing about truth. Donne's poems train you to notice an argument can be watertight and absurd.",
    examples:["'The Flea': our blood is mingled; that is no sin; therefore."] },

  { id:"socratic-method", name:"Socratic questioning", cat:"rhetoric", alts:["socratic","elenchus"],
    def:"Leading someone to a conclusion by successive questions.",
    effect:"Makes instruction feel like discovery, and makes the recipient complicit in the answer.",
    examples:["'How does one man assert his power over another, Winston?' — O'Brien asks, then answers."] },

  { id:"anecdote", name:"Anecdote", cat:"rhetoric", alts:["personal story","anecdotal evidence"],
    def:"A short personal story used to support a point.",
    effect:"Persuades by particularity rather than proof. The discursive form's main engine, and its main risk.",
    examples:["'My grandfather kept every receipt. I have come to think of this as a form of argument.'"] },

  { id:"invective", name:"Invective", cat:"register", alts:["abuse","vituperation","insult"],
    def:"Sustained abusive language.",
    effect:"Characterises the speaker more reliably than the target. Its inventiveness is usually the point.",
    examples:["'my sweet creature of bombast' — padding and inflated prose in one phrase."] },

  { id:"self-deprecation", name:"Self-deprecation", cat:"register", alts:["self deprecating","self-mockery"],
    def:"Making yourself the object of the joke.",
    effect:"Disarms an objection by making it first. A further rhetorical position, not an absence of one.",
    examples:["'I'm a scholar. Or I was when I had shoes, when I had eyebrows.'"] },

  { id:"satire", name:"Satire", cat:"rhetoric", alts:["satirical","satirise"],
    def:"Ridicule aimed at exposing a vice or folly, usually with a corrective intent.",
    effect:"Requires a shared standard between writer and reader. Where that standard is missing it reads as mere mockery.",
    examples:["The Ministry of Truth's remit listed flatly and administratively."] },

  { id:"bathos", name:"Bathos", cat:"rhetoric", alts:["anticlimax","deflation"],
    def:"A sudden drop from the elevated to the trivial.",
    effect:"Deflates. Where the drop is the speaker's own, it can be self-knowledge rather than a joke.",
    examples:["'slave to fate, chance, kings, and desperate men'.",
              "'Could not all this flesh / Keep in a little life?'"] },

  { id:"anticlimax", name:"Anticlimax", cat:"structure", alts:["deflated ending"],
    def:"A build-up that resolves into something trivial or flat.",
    effect:"Denies the reader the payoff the structure promised, which can be comic or devastating.",
    examples:["'He loved Big Brother.' — no defiant last thought."] },

  { id:"climax", name:"Climax", cat:"structure", alts:["climactic","culmination"],
    def:"The point of maximum intensity, or a rising sequence toward it.",
    effect:"Organises everything before it as preparation. Where a text puts its climax tells you what it thinks the story is about.",
    examples:["Room 101 — the play's business is not information but a sentence Winston cannot recover from."] },

  { id:"pathos", name:"Pathos", cat:"rhetoric", alts:["emotional appeal","appeal to emotion"],
    def:"Appeal to the audience's emotions.",
    effect:"Powerful and easily overplayed. Restraint usually produces more of it than intensity does.",
    examples:["Lady Percy's one long speech in 1 Henry IV 2.3."] },

  { id:"ethos", name:"Ethos", cat:"rhetoric", alts:["appeal to character","credibility"],
    def:"Appeal based on the speaker's credibility or character.",
    effect:"Often carried by register rather than by claim. Conceding a point is one of the cheapest ways to build it.",
    examples:["Kelekian's 'You must be very tough' — flattery as consent-gathering."] },

  { id:"logos", name:"Logos", cat:"rhetoric", alts:["appeal to logic","logical appeal"],
    def:"Appeal based on reasoning and evidence.",
    effect:"Persuades readers who distrust feeling — and can be counterfeited by the FORM of an argument without its substance.",
    examples:["'The Flea', where the logic is impeccable and the premise is not."] },

  { id:"hubris", name:"Hubris", cat:"drama", alts:["hybris","overweening pride"],
    def:"Excessive pride or self-confidence, especially before a fall.",
    effect:"A structural signal as much as a character trait: it tells the audience which way the play is going.",
    examples:["'The Holy Sonnets are mine.' — W;t, four words claiming ownership of poems about surrender."] },

  /* ── poetic form ──────────────────────────────────────────── */
  { id:"sonnet", name:"Sonnet", cat:"poetry", alts:["sonet"],
    def:"A fourteen-line poem in iambic pentameter, in one of several rhyme schemes.",
    effect:"The reader knows a turn is coming and roughly when, so the poem's handling of that expectation is itself meaningful.",
    examples:["Donne's Holy Sonnets use the Petrarchan shape and override the turn."] },

  { id:"petrarchan-sonnet", name:"Petrarchan sonnet", cat:"poetry", alts:["italian sonnet","petrachan sonnet"],
    def:"Octave (8) then sestet (6), turning at line 9.",
    effect:"Sets a problem and then answers it. Withholding the answer makes the poem's failure to resolve structural, not just thematic.",
    examples:["Holy Sonnet 7, whose volta retracts the octave entirely."] },

  { id:"shakespearean-sonnet", name:"Shakespearean sonnet", cat:"poetry", alts:["english sonnet","elizabethan sonnet"],
    def:"Three quatrains and a couplet, rhyming ABAB CDCD EFEF GG.",
    effect:"The final couplet can seal, undercut or contradict everything above it, which makes it a natural site for a reversal.",
    examples:["'Death, thou shalt die' functions as this kind of coup."] },

  { id:"volta", name:"Volta", cat:"poetry", alts:["turn","voulta"],
    def:"The turn in a sonnet, where the argument changes direction.",
    effect:"The formal hinge. Early, late or doubled voltas are all meaningful departures — say which and why.",
    examples:["'But let them sleep, Lord' — Donne's volta is a loss of nerve, honestly recorded."] },

  { id:"octave", name:"Octave", cat:"poetry", alts:["octet","eight lines"],
    def:"The first eight lines of a Petrarchan sonnet.",
    effect:"Establishes a situation or problem with enough space to develop it properly.",
    examples:["Holy Sonnet 10's octave demotes Death to a servant."] },

  { id:"sestet", name:"Sestet", cat:"poetry", alts:["six lines"],
    def:"The last six lines of a Petrarchan sonnet.",
    effect:"Where the answer is supposed to arrive. Its content should be read against what the octave asked for.",
    examples:["Holy Sonnet 14's sestet swaps siege for marriage law."] },

  { id:"quatrain", name:"Quatrain", cat:"poetry", alts:["four line stanza"],
    def:"A four-line stanza or unit.",
    effect:"Long enough for a complete thought, short enough to be one move in a sequence.",
    examples:["Holy Sonnet 14's opening quatrain is a single sustained demand."] },

  { id:"heroic-couplet", name:"Heroic couplet", cat:"poetry", alts:["rhyming couplet","couplet"],
    def:"Two rhyming lines of iambic pentameter.",
    effect:"Closes with an audible click. In blank verse it signals a decision, a curtain line, or a contract.",
    examples:["'Redeeming time when men think least I will' — Hal seals his soliloquy."] },

  { id:"stanza", name:"Stanza", cat:"poetry", alts:["verse paragraph","strophe"],
    def:"A grouped set of lines, separated by space.",
    effect:"The white space is structural. What a poem chooses to break between is as meaningful as what it says.",
    examples:["Donne's 'The Sun Rising' — three stanzas, three stages of one argument."] },

  { id:"refrain", name:"Refrain", cat:"poetry", alts:["chorus","repeated line"],
    def:"A line or phrase repeated at intervals.",
    effect:"Accumulates different meaning each time the context around it changes.",
    examples:["'Hi. How are you feeling today?' functions as one across W;t."] },

  { id:"aubade", name:"Aubade", cat:"poetry", alts:["dawn song","morning poem"],
    def:"A poem about lovers parting at dawn.",
    effect:"A genre with fixed expectations, so inverting it is legible as an argument about the genre.",
    examples:["'The Sun Rising' abuses the dawn instead of lamenting it."] },

  { id:"elegy", name:"Elegy", cat:"poetry", alts:["elegiac","lament"],
    def:"A poem of mourning.",
    effect:"Traditionally moves from grief through anger to consolation. A refused consolation is a real formal statement.",
    examples:["Hal's elegy over Hotspur, which is also his verdict on him."] },

  { id:"blazon", name:"Blazon", cat:"poetry", alts:["catalogue of parts","blason"],
    def:"An itemised description, part by part — originally of a beloved's body, in heraldic style.",
    effect:"Assembles a person out of components, which can be adoring or objectifying and is often both.",
    examples:["Vernon arming Hal piece by piece, 1 Henry IV 4.1."] },

  { id:"typology", name:"Typology", cat:"poetry", alts:["typological","figural reading"],
    def:"Reading an earlier event as prefiguring a later one, especially in scripture.",
    effect:"Collapses historical distance so two events can be argued between. A technical theological move and a habitual Donne one.",
    examples:["'Paradise and Calvary... stood in one place'."] },

  { id:"metapoetry", name:"Metapoetry", cat:"poetry", alts:["metapoetic","poem about poetry"],
    def:"A poem that comments on its own making.",
    effect:"Offers the poem itself as the evidence for its claim, which is a closed loop and often a very effective one.",
    examples:["'We'll build in sonnets pretty rooms' — 'stanza' is Italian for room."] },

  /* ── dramatic form ────────────────────────────────────────── */
  { id:"soliloquy", name:"Soliloquy", cat:"drama", alts:["soliloquay","alone on stage speech"],
    def:"A character alone on stage speaking their thoughts aloud.",
    effect:"The audience is granted privileged access. WHO gets one, and who doesn't, is a structural decision worth analysing.",
    examples:["Only Hal soliloquises in 1 Henry IV Part 1 — and he uses it to say he is acting."] },

  { id:"aside", name:"Aside", cat:"drama", alts:["asides"],
    def:"A remark heard by the audience but not by other characters on stage.",
    effect:"Creates instant complicity, and it makes the audience keep a secret.",
    examples:["Worcester's diagnosis of Hotspur, 1.3."] },

  { id:"monologue", name:"Monologue", cat:"drama", alts:["long speech"],
    def:"An extended speech to other characters present.",
    effect:"Unlike soliloquy it is performed for someone, so the question is always what the speaker wants from them.",
    examples:["Falstaff's catechism is delivered to a battlefield, not to himself."] },

  { id:"dramatic-monologue", name:"Dramatic monologue", cat:"poetry", alts:["dramatic monolgue"],
    def:"A poem spoken entirely by a persona to an implied listener.",
    effect:"The reader must reconstruct the situation and judge the speaker from their own words, usually against them.",
    examples:["Donne's 'The Apparition' sustains a murder charge for its whole length."] },

  { id:"stichomythia", name:"Stichomythia", cat:"drama", alts:["stichomythy","line-for-line exchange"],
    def:"Rapid alternating single lines of dialogue.",
    effect:"Speeds the scene and turns conversation into contest. Frequently used for antagonists who are evenly matched.",
    examples:["Glendower and Hotspur on calling spirits, 3.1."] },

  { id:"stage-direction", name:"Stage direction", cat:"drama", alts:["stage directions","didascalia"],
    def:"Authorial instruction about action, setting or delivery.",
    effect:"Not commentary but content, and the only voice in a play that is not a character's. Modern playwrights use it to make arguments.",
    examples:["W;t's final direction — the gown falls, and she walks away from the scene."] },

  { id:"metatheatre", name:"Metatheatre", cat:"drama", alts:["metatheatrical","play within a play","self-conscious theatre"],
    def:"Theatre that draws attention to its own theatricality.",
    effect:"Makes the audience aware they are an audience, so the play can argue about performance from inside one.",
    examples:["The play extempore in 2.4 rehearses 1 Henry IV's own ending as a game.",
              "Vivian announcing 'Then: curtain.'"] },

  { id:"foil", name:"Foil", cat:"drama", alts:["contrast character"],
    def:"A character constructed to contrast with another and expose their qualities.",
    effect:"Argument by comparison. Where the foil is manufactured — aged up or down from a source — the design is provable.",
    examples:["Hotspur, aged down from the chronicles to become Hal's contemporary."] },

  { id:"anagnorisis", name:"Anagnorisis", cat:"drama", alts:["recognition","anagnorosis","moment of recognition"],
    def:"The moment a character recognises the truth of their situation.",
    effect:"Converts a plot into a tragedy, because the audience watches someone arrive where the audience already was.",
    examples:["'I thought being extremely smart would take care of it. But I see that I have been found out.'"] },

  { id:"catharsis", name:"Catharsis", cat:"drama", alts:["katharsis","purgation"],
    def:"The audience's release of pity and fear at a tragedy's end.",
    effect:"A claim about the audience rather than the text, so use it carefully — assert the mechanism, not the feeling.",
    examples:["Contested in 1984 precisely because the ending withholds it."] },

  { id:"comic-relief", name:"Comic relief", cat:"drama", alts:["comic subplot"],
    def:"Comic material within a serious work.",
    effect:"Usually mislabelled. In 1 Henry IV the tavern is where the politics is glossed, not where the audience rests.",
    examples:["The Gadshill robbery mirrors the rebellion — men taking what is not theirs and falling out."] },

  { id:"prose-verse-shift", name:"Prose / verse shift", cat:"drama", alts:["verse-shift","prose","shift into verse","prose to verse"],
    def:"Moving between prose and verse within a play.",
    effect:"An index of register and power, audible in performance. In Shakespeare, who speaks which and when is political.",
    examples:["Hal switches into verse to say 'I know you all' — the form is the betrayal."] },

  { id:"tragic-hero", name:"Tragic hero", cat:"drama", alts:["tragic protagonist"],
    def:"A protagonist of stature whose fall follows from their own nature.",
    effect:"Makes the catastrophe structural rather than accidental. Test whether the text actually grants the stature.",
    examples:["Proctor; contested for Winston, who is deliberately unheroic."] },

  { id:"hamartia", name:"Hamartia", cat:"drama", alts:["tragic flaw","fatal flaw"],
    def:"The error or flaw that precipitates a tragic fall.",
    effect:"Better read as an error of judgement than a moral defect — 'flaw' invites a character-assassination reading.",
    examples:["Hotspur's intolerance of nonsense, which costs him Wales."] },

  { id:"chorus", name:"Chorus", cat:"drama", alts:["choric figure","prologue chorus"],
    def:"A figure or group commenting on the action from outside it.",
    effect:"Supplies a perspective no character holds, and tells the audience how to feel — or misleads them.",
    examples:["Miller's authorial interpolations in The Crucible do this in print."] },

  /* ── prose and narrative ──────────────────────────────────── */
  { id:"free-indirect-discourse", name:"Free indirect discourse", cat:"prose", alts:["free indirect style","FID","free indirect speech"],
    def:"Third-person narration that takes on a character's idiom and thought without quotation marks.",
    effect:"Lets a writer be inside and outside a character at once, so sympathy and judgement occupy the same sentence.",
    examples:["'But it was all right, everything was all right' — Winston's relief and the reader's horror, one clause."] },

  { id:"third-person-limited", name:"Third person limited", cat:"prose", alts:["limited third person","close third"],
    def:"Third-person narration confined to one character's knowledge.",
    effect:"The reader is misled exactly where the character is, which implicates them in the plot's credulity.",
    examples:["1984 — the reader trusts Charrington because Winston does."] },

  { id:"omniscient-narrator", name:"Omniscient narrator", cat:"prose", alts:["third person omniscient","all-knowing narrator"],
    def:"A narrator with access to every character's mind and to events beyond any of them.",
    effect:"Confers authority and distance. Its absence in a novel that could have used it is a decision.",
    examples:["Notably NOT used in 1984, where the limitation is the argument."] },

  { id:"unreliable-narrator", name:"Unreliable narrator", cat:"prose", alts:["unreliable narration"],
    def:"A narrator whose account the reader has reason to distrust.",
    effect:"Makes reading an act of reconstruction. The gap between narration and inferred truth is where the meaning is.",
    examples:["Felix in Hag-Seed, quoting a daughter he invented."] },

  { id:"stream-of-consciousness", name:"Stream of consciousness", cat:"prose", alts:["stream of conciousness","interior monologue"],
    def:"Narration imitating the unstructured flow of thought.",
    effect:"Trades clarity for immediacy. Its punctuation and syntax are the technique — describe those, not the 'flow'.",
    examples:["Woolf's Mrs Dalloway; glimpsed in Winston's diary entries."] },

  { id:"in-medias-res", name:"In medias res", cat:"prose", alts:["in media res","beginning in the middle"],
    def:"Beginning in the middle of the action.",
    effect:"Forces reconstruction, which is engagement, and saves the two hundred words most openings spend arriving.",
    examples:["'For God's sake hold your tongue' — no idea who is being told to shut up."] },

  { id:"foreshadowing", name:"Foreshadowing", cat:"prose", alts:["foreshadow","anticipation"],
    def:"An early hint of something that comes later.",
    effect:"On rereading it converts suspense into inevitability. Orwell's is deliberately blunt, so the plot reads as sentence being carried out.",
    examples:["'the dampness of a grave' on the page where the diary begins."] },

  { id:"prolepsis", name:"Prolepsis", cat:"prose", alts:["flashforward","flash-forward","anticipation of future","proleptic irony"],
    def:"A narrative jump forward, or treating a future thing as already done.",
    effect:"Removes suspense in order to redirect attention onto how rather than what.",
    examples:["'I think I die at the end' — W;t, Scene 1."] },

  { id:"analepsis", name:"Analepsis", cat:"prose", alts:["flashback","flash-back"],
    def:"A narrative jump backward.",
    effect:"Its trigger is the analysis: what in the present summoned this past, and what does the juxtaposition claim?",
    examples:["W;t's flashbacks are each triggered by a hospital humiliation."] },

  { id:"frame-narrative", name:"Frame narrative", cat:"prose", alts:["framing device","story within a story"],
    def:"A story enclosing another story.",
    effect:"Puts a layer of mediation between reader and events, and raises the question of who is telling and why.",
    examples:["Goldstein's book embedded in 1984 — the one document explaining the world is a forgery."] },

  { id:"cyclical-structure", name:"Cyclical structure", cat:"structure", alts:["circular structure","cyclical"],
    def:"A text ending where it began.",
    effect:"Suggests nothing has been carried forward, or that meaning has changed while the frame has not. The most reliable ending in short prose.",
    examples:["'And makes me end where I begun' — Donne's compass closes its own circle."] },

  { id:"tripartite-structure", name:"Tripartite structure", cat:"structure", alts:["three-part structure","triptych"],
    def:"A text in three parts.",
    effect:"Read what each part does to the others. Punitive symmetry — build then dismantle — is a common and powerful use.",
    examples:["1984: diagnose, build a private life, destroy both in the order acquired."] },

  { id:"epigraph", name:"Epigraph", cat:"prose", alts:["epigraphs","opening quotation"],
    def:"A quotation at the head of a text.",
    effect:"Frames everything after it and is not spoken by anyone in the story, so it carries authorial weight.",
    examples:["Common in Module A appropriations, where it declares the debt."] },

  { id:"paratext", name:"Paratext", cat:"prose", alts:["paratextual","appendix","preface"],
    def:"Material around the main text: appendices, prefaces, notes, dedications.",
    effect:"Can contradict the narrative. Where it does, it is doing structural work the plot cannot.",
    examples:["1984's Appendix is in the past tense, so the Party fell."] },

  { id:"concrete-detail", name:"Concrete detail", cat:"prose", alts:["specificity","specific detail","characterisation by detail"],
    def:"A precise, particular observation in place of a general one.",
    effect:"Specificity outperforms intensity. What a narrator notices is characterisation before anything is stated.",
    examples:["'She counted the exits. That was the kind of house it was.'",
              "'He that died o' Wednesday' — the weekday is what makes it deadly."] },

  { id:"tense-shift", name:"Tense shift", cat:"prose", alts:["change of tense","past-tense","future-tense","present-continuous"],
    def:"Moving between tenses within a text.",
    effect:"Changes the reader's distance from events. A past tense placed after a present-tense narrative can silently cancel it.",
    examples:["1984's Appendix narrates Newspeak historically, after a narrative of total defeat."] },

  /* ── film and visual ──────────────────────────────────────── */
  { id:"close-up", name:"Close-up", cat:"film", alts:["closeup","CU"],
    def:"A shot tightly framing a face or object.",
    effect:"Forces attention and grants interiority without dialogue. The film equivalent of a soliloquy.",
    examples:["Billy Elliot's face at the audition, holding what the dialogue won't say."] },

  { id:"long-shot", name:"Long shot", cat:"film", alts:["wide shot","establishing shot"],
    def:"A shot showing a figure small within a large setting.",
    effect:"Makes environment dominant, so a character reads as placed rather than as acting.",
    examples:["Terraced streets dwarfing a single figure in British social-realist cinema."] },

  { id:"low-angle", name:"Low angle", cat:"film", alts:["low angle shot","looking up"],
    def:"The camera below the subject, looking up.",
    effect:"Confers power or threat by geometry alone, before any performance choice.",
    examples:["Standard for authority figures; often ironised in political film."] },

  { id:"high-angle", name:"High angle", cat:"film", alts:["high angle shot","looking down"],
    def:"The camera above the subject, looking down.",
    effect:"Diminishes. It puts the viewer in a supervising position, which can implicate them.",
    examples:["Used on children and on the surveilled."] },

  { id:"montage", name:"Montage", cat:"film", alts:["montage sequence","editing sequence"],
    def:"A sequence of short shots compressing time or juxtaposing ideas.",
    effect:"Meaning is generated by the CUTS, not the images. Two shots make a third thing.",
    examples:["Training sequences; the Two Minutes Hate in adaptations."] },

  { id:"mise-en-scene", name:"Mise-en-scène", cat:"film", alts:["mise en scene","staging","set design"],
    def:"Everything arranged within the frame: set, costume, props, lighting, blocking.",
    effect:"The visual equivalent of diction. Nothing in a frame is accidental, so everything is available for analysis.",
    examples:["W;t's set converting hospital equipment into lecture furniture."] },

  { id:"diegetic-sound", name:"Diegetic sound", cat:"film", alts:["diagetic sound","sound within the scene"],
    def:"Sound with a source inside the world of the film.",
    effect:"Anchors the viewer in the space. Its sudden removal is one of the strongest available effects.",
    examples:["The telescreen's hum, which is never quite absent."] },

  { id:"non-diegetic-sound", name:"Non-diegetic sound", cat:"film", alts:["nondiegetic sound","score","soundtrack"],
    def:"Sound with no source in the world of the film — score, voiceover.",
    effect:"Instructs the audience how to feel. Where it contradicts the image it produces irony.",
    examples:["Score swelling under a scene the film wants you to distrust."] },

  { id:"chiaroscuro", name:"Chiaroscuro", cat:"film", alts:["high contrast lighting","low key lighting"],
    def:"Strong contrast between light and dark.",
    effect:"Splits a frame morally as well as visually, and can divide a single face.",
    examples:["Standard in film noir and in adaptations of surveillance states."] },

  { id:"voiceover", name:"Voiceover", cat:"film", alts:["voice over","VO","narration"],
    def:"Narration heard over the image.",
    effect:"Grants access to interiority and raises the question of when it is speaking from — and whether it is honest.",
    examples:["Used to import a novel's first person into film."] },

  /* ── diction and register ─────────────────────────────────── */
  { id:"register", name:"Register", cat:"register", alts:["tone register","level of formality"],
    def:"The level of formality and the vocabulary belonging to a context.",
    effect:"A mismatch between register and situation is one of the most reliable sources of irony in English.",
    examples:["'The illustrations are exemplary' — a father reviewing a picture book."] },

  { id:"colloquialism", name:"Colloquialism", cat:"register", alts:["colloquial language","informal language","slang"],
    def:"Informal, everyday language.",
    effect:"Creates intimacy or authenticity, and in a formal context it registers as a deliberate breach.",
    examples:["'They can't get inside you' — Julia's plainest possible words for the play's biggest claim."] },

  { id:"jargon", name:"Jargon", cat:"register", alts:["technical jargon","specialist language"],
    def:"Specialist vocabulary belonging to a profession or field.",
    effect:"Includes insiders and excludes everyone else. In institutional speech it is frequently how responsibility is mislaid.",
    examples:["'Hexamethophosphacil with Vinplatin. Full dose.'"] },

  { id:"technical-diction", name:"Technical diction", cat:"register", alts:["clinical diction","scientific diction","medical diction"],
    def:"Precise vocabulary drawn from a technical or clinical field.",
    effect:"Confers objectivity and removes feeling — which is chilling when the object is a person.",
    examples:["'The telescreen received and transmitted simultaneously.'"] },

  { id:"legal-diction", name:"Legal diction", cat:"register", alts:["forensic diction","juridical language"],
    def:"Vocabulary of law, contract and evidence.",
    effect:"Frames a relationship as an obligation with terms. Donne's prayers are frequently claims on a contract.",
    examples:["'But am betroth'd unto your enemy' — a problem of prior contract."] },

  { id:"commercial-diction", name:"Commercial diction", cat:"register", alts:["economic diction","financial language","accounting language"],
    def:"Vocabulary of trade, debt, profit and accounting.",
    effect:"Reduces a relationship to a transaction, and tells you exactly how the speaker values it.",
    examples:["'Percy is but my factor' — honour as an asset class.",
              "'thou owest God a death'."] },

  { id:"religious-diction", name:"Religious diction", cat:"register", alts:["devotional diction","sacred language","theological language"],
    def:"Vocabulary of faith, worship and scripture.",
    effect:"Imports a moral frame. In a secular setting the borrowing is usually the argument.",
    examples:["'A terrible ecstasy' — rapture at a political rally."] },

  { id:"academic-register", name:"Academic register", cat:"register", alts:["scholarly register","learned diction","expository register"],
    def:"Formal, abstract, nominalised prose of scholarship.",
    effect:"Signals authority and distance at once, which is why it is the perfect medium for a character avoiding a feeling.",
    examples:["Vivian's diagnosis speech in W;t Scene 2."] },

  { id:"military-diction", name:"Military diction", cat:"register", alts:["martial diction","war language"],
    def:"Vocabulary of war, siege and combat.",
    effect:"Frames a situation as a conflict with an enemy, which forecloses other ways of understanding it.",
    examples:["'My only defence is the acquisition of vocabulary.'"] },

  { id:"chivalric-diction", name:"Chivalric diction", cat:"register", alts:["courtly diction","heraldic diction"],
    def:"Vocabulary of knighthood, honour and the tournament.",
    effect:"Carries a whole value system with it, so a character who cannot leave it behind is characterised by the vocabulary alone.",
    examples:["'to tilt with lips' — Hotspur turns a kiss into a joust."] },

  { id:"formulaic-language", name:"Formulaic language", cat:"register", alts:["set phrase","cliche","stock phrase"],
    def:"A fixed phrase used automatically.",
    effect:"A question with a socially fixed answer is not a question. Repetition converts courtesy into indictment.",
    examples:["'Hi. How are you feeling today?'"] },

  { id:"dialect", name:"Dialect", cat:"register", alts:["vernacular","regional speech","idiolect"],
    def:"Language marked by region, class or community.",
    effect:"Places a speaker socially in a phrase. Where the text grants dialect authority, that is a political choice.",
    examples:["'He have his goodness now' — Elizabeth Proctor's plain grammar gets the last judgement."] },

  { id:"archaism", name:"Archaism", cat:"register", alts:["archaic language","antiquated diction"],
    def:"Deliberately old-fashioned language.",
    effect:"Borrows the authority of the past, or marks a speaker as belonging to it and therefore out of time.",
    examples:["Miller's Salem idiom, which distances and universalises at once."] },

  { id:"macaronic-diction", name:"Macaronic diction", cat:"register", alts:["macaronic","mixed language","code-switching"],
    def:"Mixing languages within one text.",
    effect:"Displays learning, and can put a second meaning where monolingual readers cannot follow.",
    examples:["'Per fretum febris' — Latin punning inside an English hymn."] },

  { id:"erotic-diction", name:"Erotic diction", cat:"register", alts:["sexual diction","amatory language","innuendo"],
    def:"Vocabulary of desire and the body.",
    effect:"In a devotional context the transfer is the claim: overwhelming force described in the only vocabulary available for it.",
    examples:["'Nor ever chaste, except you ravish me.'"] },

  { id:"colonial-imagery", name:"Colonial imagery", cat:"language", alts:["imperial imagery","cartographic imagery","exploration imagery"],
    def:"Imagery of discovery, mapping, possession and territory.",
    effect:"Makes discovery indistinguishable from ownership, which is exactly what the possessive pronouns expose.",
    examples:["'O my America! my new-found-land'."] },

  { id:"domestic-imagery", name:"Domestic imagery", cat:"language", alts:["household imagery","everyday imagery"],
    def:"Imagery of the home and its ordinary objects.",
    effect:"Grounds abstraction in something the reader can touch, and makes intrusion feel like violation.",
    examples:["'roping icicles / Upon our houses' thatch'.",
              "'The kettle clicked off and nobody moved to make the tea.'"] },

  { id:"cosmological-imagery", name:"Cosmological imagery", cat:"language", alts:["astronomical imagery","celestial imagery","cosmic imagery"],
    def:"Imagery of stars, spheres, planets and the heavens.",
    effect:"Applies the scale of the universe to a private matter, which is either grandiose or a genuine claim about proportion.",
    examples:["'This bed thy centre is, these walls, thy sphere.'",
              "'Two stars keep not their motion in one sphere.'"] },

  { id:"geometric-imagery", name:"Geometric imagery", cat:"language", alts:["mathematical imagery","compass imagery"],
    def:"Imagery of shape, line, circle and measurement.",
    effect:"Offers formal proof as emotional consolation — the shape of the argument stands in for evidence.",
    examples:["'Thy firmness makes my circle just'."] },

  { id:"architectural-imagery", name:"Architectural imagery", cat:"language", alts:["building imagery","structural imagery"],
    def:"Imagery of building, pillar, room and foundation.",
    effect:"Suggests permanence and construction, so it suits claims about what will outlast the speaker.",
    examples:["'solid as a Norman pillar' — nine centuries of unrewritten stone."] },

  { id:"medical-imagery", name:"Medical imagery", cat:"language", alts:["illness imagery","disease imagery","pathological imagery"],
    def:"Imagery of sickness, treatment and the body's failure.",
    effect:"Makes a moral or political disorder physical, and therefore not deniable.",
    examples:["'Something is rotten in the state of Denmark.'",
              "'a cold quicksilver sweat' — a syphilis treatment used as insult."] },

  { id:"hunting-imagery", name:"Hunting imagery", cat:"language", alts:["chase imagery","predatory imagery"],
    def:"Imagery of pursuit, quarry and the kill.",
    effect:"Recasts a relationship as predator and prey, and tells you which the speaker takes themselves to be.",
    examples:["'To rouse a lion than to start a hare' — rebellion as sport."] },

  { id:"physical-imagery", name:"Physical / bodily imagery", cat:"language", alts:["bodily imagery","corporeal imagery"],
    def:"Imagery of the body's processes — breath, ulcer, sweat, cough.",
    effect:"The body is what a regime or an institution has not managed to rename, so it is where resistance and reality persist.",
    examples:["Winston's varicose ulcer, cough and cold across 1984."] },

  { id:"marital-imagery", name:"Marital imagery", cat:"language", alts:["marriage imagery","nuptial imagery"],
    def:"Imagery of betrothal, marriage and divorce.",
    effect:"Frames a bond as a contract with terms that can be broken, which is a very different thing from love.",
    examples:["'Divorce me, untie or break that knot again'."] },

  { id:"liminal-imagery", name:"Liminal imagery", cat:"language", alts:["threshold imagery","doorway imagery"],
    def:"Imagery of thresholds, doors and in-between places.",
    effect:"Holds a subject between two states without resolving, which suits dying, waiting and change.",
    examples:["'I tune the instrument here at the door.'"] },

  { id:"aesthetic-diction", name:"Aesthetic diction", cat:"register", alts:["language of beauty","art diction"],
    def:"Vocabulary of beauty, craft and artistic judgement.",
    effect:"Where it is applied to something destructive, the mismatch is the horror. Not philistines but craftsmen.",
    examples:["'It's a beautiful thing, the destruction of words.'"] },

  { id:"prose-rhythm", name:"Prose rhythm", cat:"sound", alts:["cadence","rhythm of prose"],
    def:"The stress and pause patterns of non-metrical writing.",
    effect:"Prose has metre too. A cadenced sentence persuades before its content is examined, which is how aphorisms survive.",
    examples:["'No man is an island, entire of itself'."] },

  { id:"conditional", name:"Conditional construction", cat:"syntax", alts:["if clause","hypothetical","conditional mood"],
    def:"An 'if… then' structure, stated or implied.",
    effect:"Keeps a claim deniable, and lets a speaker prosecute a case they are not prepared to own.",
    examples:["'If poisonous minerals, and if that tree…' — a chain of ifs building an accusation against God."] },

  { id:"causal-conjunction", name:"Causal conjunction", cat:"syntax", alts:["because","causal link","therefore"],
    def:"'Because', 'so', 'therefore' — words asserting cause.",
    effect:"Claims a causal relation the reader is likely to accept without testing. Always worth testing.",
    examples:["'Any man's death diminishes me, because I am involved in mankind.'"] },

  { id:"comparative", name:"Comparative construction", cat:"syntax", alts:["comparative","than construction"],
    def:"A construction ranking one thing against another.",
    effect:"Establishes a hierarchy without having to defend the standard being used.",
    examples:["'The rarer action is / In virtue than in vengeance' — mercy justified by rarity."] },

  { id:"superlative", name:"Superlative", cat:"syntax", alts:["superlatives","most/least"],
    def:"'Most', 'least', 'best' — the top of a scale.",
    effect:"Overreaches by design. In a character's mouth it usually characterises their confidence rather than the fact.",
    examples:["'in greater depth than any other body of work in the English language'."] },

  { id:"possessive", name:"Possessive construction", cat:"syntax", alts:["possessive pronoun","ownership language"],
    def:"'My', 'mine', 'ours' — grammar of ownership.",
    effect:"Claims title. Repeated possessives over people or places are among the quietest signals of power in English.",
    examples:["'The Holy Sonnets are mine.'",
              "'This island's mine, by Sycorax my mother'."] },

  { id:"formal-address", name:"Formal address", cat:"register", alts:["honorific","titles","deferential address"],
    def:"Titles and honorifics used in place of names.",
    effect:"Sets distance precisely. Choosing formality with a parent is a refusal disguised as respect.",
    examples:["'my thrice-gracious lord' — Hal keeping his father exactly where he wants him."] },

  { id:"etymology", name:"Etymological appeal", cat:"register", alts:["etymological argument","root meaning"],
    def:"Arguing from a word's origin or root sense.",
    effect:"Claims a truer meaning than current usage allows. Frequently correct and frequently beside the point.",
    examples:["'Insidious means treacherous.' — right, and not what is being discussed."] },

  { id:"compound-epithet", name:"Compound epithet", cat:"register", alts:["hyphenated epithet","kenning","epithet"],
    def:"A hyphenated descriptive compound.",
    effect:"Compresses a whole judgement into a single modifier, which is why it is the engine of good insults.",
    examples:["'fat-witted', 'pale-faced', 'three-person'd'."] },
  /* ── added after the validator caught quote tags with no glossary entry ──
     A tag that resolves to nothing is worse than a missing tag: Technique Hunt can never
     ask about it, the Vault renders a bare slug where a name should be, and Layer B has
     no accepted spellings to match against. tests/suites/validate.js now fails the build
     rather than letting one through. */

  { id:"tone", name:"Tone", cat:"register", alts:["tonal","attitude","tone of voice"],
    def:"The composer's or speaker's attitude towards the subject and the audience, carried by word choice, rhythm and syntax rather than stated.",
    effect:"The thing students most often assert and least often prove. Tone is only an observation if you can point at the word doing it — 'condescending' means nothing until you quote the diminutive.",
    examples:["'Little think'st thou, poor flower' — the diminutives condescend before any argument arrives."] },

  { id:"persona", name:"Persona", cat:"register", alts:["speaker","mask","adopted voice","dramatic speaker"],
    def:"A constructed speaking voice distinct from the composer, adopted for the duration of a text.",
    effect:"Lets a composer argue a position they need not hold, which is why 'Donne thinks' is usually the wrong sentence and 'the speaker argues' is usually the right one.",
    examples:["The libertine of 'The Indifferent' is not the Dean of St Paul's, and is written by him."] },

  { id:"allegory", name:"Allegory", cat:"language", alts:["allegorical","allegorise","extended allegory"],
    def:"A sustained narrative or figure in which each element stands for something outside the text, usually moral, political or theological.",
    effect:"Demands to be read on two levels at once, so it can say the forbidden thing while denying it. Distinct from symbolism: an allegory is systematic, a symbol is local.",
    examples:["The Church as Christ's 'spouse' in Holy Sonnet 18, pushed to the edge of the obscene."] },

  { id:"pathetic-fallacy", name:"Pathetic fallacy", cat:"language", alts:["pathetic falacy","landscape mirrors mood","sympathetic nature"],
    def:"Attributing human emotion to nature or weather so the setting mirrors a character's state.",
    effect:"Makes an interior state visible without narrating it, and puts the reader in the position of agreeing with a mood before examining it.",
    examples:["The garden that cannot be a spring in 'Twicknam Garden' because the speaker arrives ruined."] },

  { id:"subjunctive", name:"Subjunctive mood", cat:"syntax", alts:["subjunctive","hypothetical mood","optative","were-clause"],
    def:"A verb form marking what is wished, feared, supposed or contrary to fact, rather than what is.",
    effect:"Lets a text argue about a world that does not exist, and the grammar carries the admission. 'O might those sighs return' concedes that they will not.",
    examples:["'O might those sighs and tears return again' — the wish is grammatically marked as impossible."] },

  { id:"oath-formula", name:"Oath formula", cat:"rhetoric", alts:["oath","adjuration","invocation formula","by-clause"],
    def:"A repeated swearing construction — 'by our first interview, by all desires' — that builds obligation before the request it precedes.",
    effect:"Borrows the force of a legal deposition. The pressure accumulates across the clauses so the demand arrives already half-conceded.",
    examples:["The stacked 'By…' clauses opening Donne's Elegy 16."] },

  { id:"hierarchy-inversion", name:"Hierarchy inversion", cat:"structure", alts:["inverted hierarchy","chain of being inverted","status reversal"],
    def:"Deliberately reversing an assumed order of value — natural, social or spiritual — so the lower term outranks the higher.",
    effect:"Turns an assumption into a claim that must be defended. Self-abasement argued from natural philosophy lands harder than self-abasement asserted.",
    examples:["'Why do the prodigal elements supply / Life and food to me, being more pure than I' — plants outrank the speaker."] },

  { id:"neoplatonism", name:"Neoplatonic idealism", cat:"language", alts:["neoplatonic","platonic love","soul-body dualism","platonism"],
    def:"The framework in which physical love is a ladder towards a higher spiritual union, and the body is the soul's instrument.",
    effect:"Supplies a vocabulary of transcendence that a poem can either honour or exploit. Donne habitually spends twelve stanzas of it to arrive at a request for sex.",
    examples:["'The Ecstasy': souls negotiate, and the conclusion is that they need bodies after all."] }
];
