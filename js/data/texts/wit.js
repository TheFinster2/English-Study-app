/* W;t — Margaret Edson. Module A, Textual Conversations, paired with Donne.
   ============================================================================
   In copyright, so: short extracts only, always attributed, never more than a line or
   two — enough to analyse, never enough to substitute for the play.

   The `resonances` field carries the pairing itself, which is what Module A actually
   examines. Students lose marks for writing two separate essays stapled together, so
   the app treats the relationship as content in its own right rather than as something
   to be inferred from two text banks sitting next to each other.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["wit"] = {
  id: "wit",
  title: "W;t",
  composer: "Margaret Edson",
  year: 1995,
  form: "drama",
  modules: ["moduleA"],
  pairedWith: "donne",
  blurb: "Vivian Bearing, PhD, world authority on Donne's Holy Sonnets, has stage-four " +
         "metastatic ovarian cancer and eight months of experimental chemotherapy. The " +
         "play asks whether the intelligence she built her life on is any use to her now.",

  context: [
    { fact: "Edson wrote the play after working as a clerk in the cancer and AIDS inpatient unit of a research hospital; she has taught primary school ever since.",
      why: "The clinical detail is observed, not researched, which is why the doctors are not villains — they are competent people whose competence is aimed somewhere other than the patient." },
    { fact: "First produced 1995; Pulitzer Prize for Drama 1999.",
      why: "It arrives at the height of the American culture wars over the value of the humanities, and it is markedly unsentimental about the side it is on." },
    { fact: "The title's semicolon is the play's central textual crux, drawn from an editorial dispute over Holy Sonnet 10.",
      why: "A semicolon makes 'Death, thou shalt die' a separate assertion; a comma makes it a continuation of a breath. The punctuation mark in the title is an argument about how much separates life from life everlasting." },
    { fact: "Vivian addresses the audience directly throughout and announces the play's structure and ending in her first scene.",
      why: "She controls the narration exactly as long as she controls anything. When the direct address falters in the final scenes, the loss of authority is formal as well as physical." },
    { fact: "The play is performed without an interval, on a set that converts hospital equipment into the props of a lecture.",
      why: "There is no break for the audience because there is none for Vivian, and the continuous staging refuses the comfort of an interval's conversation." },
    { fact: "'Hexamethophosphacil with Vinplatin' is an invented drug; the eight full doses are the record Kelekian and Posner want.",
      why: "Vivian's treatment is a research protocol first and a therapy second, and the play is precise that she consented to this without quite hearing it." },
    { fact: "E. M. Ashford is Vivian's doctoral supervisor; her lesson about the punctuation of Holy Sonnet 10 opens the play's flashbacks.",
      why: "Ashford tells the young Vivian to go out and enjoy herself with friends, and Vivian goes to the library. Every subsequent failure of connection is prefigured in that stage direction." },
    { fact: "Jason Posner took Bearing's notoriously difficult Donne seminar as an undergraduate to prove he could.",
      why: "He is her intellectual product. His inability to see the patient in front of him is the play's most damning verdict on the way she taught." },
    { fact: "The play ends with a stage direction in which Vivian rises from the bed and walks toward a light, naked.",
      why: "It is the one moment she is not performing for anyone. The stripping away of gown, cap and text is the play's answer to a life spent in the vocabulary of others." }
  ],

  characters: [
    { name: "Vivian Bearing, PhD", role: "protagonist",
      note: "Fifty, professor of seventeenth-century poetry, uncompromising and largely without friends. She narrates her own dying as a critical exercise until the exercise stops working.",
      concepts: ["wit","mortality","isolation","knowledge"] },
    { name: "Dr Harvey Kelekian", role: "chief of medical oncology",
      note: "Vivian's mirror: a distinguished scholar of his own field who lectures over the body of a patient. She recognises his teaching style because it is hers.",
      concepts: ["knowledge","power","detachment"] },
    { name: "Jason Posner, MD", role: "clinical fellow, former student",
      note: "Brilliant, curious, entirely uninterested in people. 'Cancer's the only thing I ever wanted' is not callousness but honest vocation, which is worse.",
      concepts: ["knowledge","detachment","research"] },
    { name: "Susie Monahan, RN, BSN", role: "primary nurse",
      note: "The least educated character and the only one who asks Vivian what she wants. Her plainness is the play's ethical centre and Edson refuses to make her wise.",
      concepts: ["kindness","care","mortality"] },
    { name: "E. M. Ashford, DPhil", role: "Vivian's supervisor",
      note: "Appears twice: once to teach the comma, once to read a children's book to a dying woman. The second visit undoes the first without cancelling it.",
      concepts: ["knowledge","kindness","simplicity"] },
    { name: "Mr Bearing", role: "Vivian's father (flashback)",
      note: "Teaches the five-year-old Vivian the word 'soporific' from a Beatrix Potter book. Love in this family is transmitted as vocabulary.",
      concepts: ["language","knowledge","isolation"] }
  ],

  structure: [
    { feature: "Direct address / metatheatre", detail: "Vivian speaks to the audience, times the play, and comments on her own scenes.",
      why: "She has cast herself as both lecturer and subject. The device grants her authority the illness is steadily removing, so its collapse is measurable." },
    { feature: "No interval, continuous action", detail: "Ninety-odd minutes of stage time standing for eight months.",
      why: "Vivian announces 'less than two hours' at the start, so the audience watches a clock she has set. Time is a thing done to her and she narrates it as structure." },
    { feature: "Non-linear flashback", detail: "Ashford's tutorial, the seminar room, Mr Bearing and the picture book cut into hospital scenes.",
      why: "Each flashback is triggered by a hospital humiliation and offers the intellectual life as compensation — then declines to supply it." },
    { feature: "Embedded lecture", detail: "Vivian delivers actual close readings of Donne to the audience, using her own case as material.",
      why: "The play's title is its method: wit is examined by being performed, so the audience must judge whether the analysis is helping her." },
    { feature: "Parallel professionals", detail: "Kelekian's grand rounds and Vivian's seminar are staged with the same blocking and vocabulary.",
      why: "The mirroring is the play's central argument, made structurally rather than stated. She is being treated as she taught." },
    { feature: "Recurring formula", detail: "'Hi. How are you feeling today?' is asked by almost every clinician, including over a vomiting patient.",
      why: "A question with a socially fixed answer is not a question. The repetition indicts the institution's language exactly as Donne's critics indict a conceit that has stopped meaning anything." },
    { feature: "The final stage direction", detail: "Vivian rises, removes cap and gown, and walks toward the light; the body remains on the bed.",
      why: "Wordless, after a play made entirely of words. Edson gives the last statement to an action, which is the strongest thing she could say about the limits of wit." }
  ],

  /* Module A is examined on the relationship, not on two texts in sequence. */
  resonances: [
    { axis: "Wit as a way of meeting death", donne: "Holy Sonnet 10 argues Death out of existence in fourteen lines.",
      wit: "Vivian narrates her diagnosis in the same voice and it does not work.",
      reading: "Edson does not refute Donne — she tests him under conditions he never specified. The dissonance is that a poem written from inside faith is being used by someone who has only the technique." },
    { axis: "The comma and the semicolon", donne: "'And death shall be no more, Death thou shalt die.'",
      wit: "Ashford: nothing but a breath separates life from life everlasting.",
      reading: "The resonance is exact and textual. Both texts stake everything on the size of a pause, which is why the play can take its title from a punctuation mark." },
    { axis: "Illness as subject, not interruption", donne: "'Hymn to God my God, in my Sickness' and the Devotions are written from the sickbed.",
      wit: "The whole play is a sickbed.",
      reading: "The strongest resonance in the pairing: Donne gives Edson a four-hundred-year-old precedent for thinking hard while dying, so the play's intelligence is inherited rather than imposed." },
    { axis: "Simplicity against complication", donne: "'Since I am coming to that holy room' is plain where Holy Sonnet 14 is violent.",
      wit: "Vivian: now is a time for simplicity, and for kindness.",
      reading: "Both texts arrive at plainness late and treat it as an achievement rather than a retreat, which is what saves the play's ending from sentimentality." },
    { axis: "Salvation versus care", donne: "The Holy Sonnets want to be overwhelmed by God.",
      wit: "Vivian is given a popsicle by a nurse.",
      reading: "The dissonance is theological. Donne has a destination; the play has a person in the room. Edson substitutes ethics for eschatology and does not pretend it is the same consolation." },
    { axis: "'No man is an island'", donne: "Devotions XVII: any man's death diminishes me.",
      wit: "Vivian has no visitors for eight months.",
      reading: "The play measures Donne's claim against a life organised to disprove it. The most cutting resonance is what Vivian has spent her career reading and never once applied." },
    { axis: "Learned language as armour", donne: "Latin puns, syllogisms, cartography, law — difficulty as pleasure.",
      wit: "'Insidious means treacherous' — Vivian corrects her oncologist's diction while being told she is dying.",
      reading: "Both texts love hard words; only one of them is interested in what the hard words are for. Vivian's correction is brilliant, accurate and completely beside the point." },
    { axis: "Performance and audience", donne: "'This is my play's last scene' — dying as theatre.",
      wit: "Vivian literally stages hers, and steps out of it at the end.",
      reading: "Donne's metaphor is Edson's set. The dissonance is that Donne's speaker keeps the metaphor to the end and Vivian abandons it — the last direction has no audience in it." }
  ],

  quotes: [
    { id:"wit-q01", text:"It is not my intention to give away the plot; but I think I die at the end.",
      locus:"Scene 1", speaker:"Vivian", mark:"I think I die at the end",
      techniques:["direct-address","metatheatre","dramatic-irony","understatement","semicolon","prolepsis"],
      effect:"Vivian removes suspense in her first speech, which reframes the play from 'what happens' to 'how she takes it'. 'I think' is the tell — a scholar hedging the one fact she is certain of.",
      concepts:["mortality","wit","performance"] },

    { id:"wit-q02", text:"I have been asked, \"How are you feeling today?\" while I was throwing up into a plastic washbasin.",
      locus:"Scene 1", speaker:"Vivian", mark:"How are you feeling today?",
      techniques:["irony","juxtaposition","direct-address","satire","bathos","motif"],
      effect:"The formula and the washbasin are placed in one sentence so the audience has to hold both. The joke is real and the indictment is real, and Edson never lets you have one without the other.",
      concepts:["care","language","dehumanisation"] },

    { id:"wit-q03", text:"Insidious means undetectable at an —",
      locus:"Scene 2", speaker:"Kelekian", mark:"undetectable",
      techniques:["aposiopesis","dash","technical-diction","dramatic-irony"],
      effect:"The dash is the stage direction. Two experts collide over one word and neither is discussing the tumour — the interruption stages the play's whole thesis about language used to avoid its subject.",
      concepts:["language","knowledge","detachment"] },

    { id:"wit-q04", text:"Insidious means treacherous.",
      locus:"Scene 2", speaker:"Vivian", mark:"treacherous",
      techniques:["short-sentence","irony","etymology","stichomythia"],
      effect:"She is right, and correcting him is the only move available to her. Vivian meets catastrophe with philology because philology is what she has, which is the most sympathetic and most damning thing the play says about her.",
      concepts:["language","wit","knowledge"] },

    { id:"wit-q05", text:"You must be very tough.",
      locus:"Scene 2", speaker:"Kelekian", mark:"very tough",
      techniques:["euphemism","understatement","dramatic-irony","colloquialism"],
      effect:"Consent obtained by flattery. Kelekian appeals to the trait Vivian is proudest of in order to get eight full doses, and she agrees before she has understood what she agreed to.",
      concepts:["power","research","knowledge"] },

    { id:"wit-q06", text:"Nothing but a breath — a comma — separates life from life everlasting.",
      locus:"Scene 3", speaker:"E. M. Ashford", mark:"a comma",
      techniques:["dash","parenthesis","metaphor","antithesis","aphorism","juxtaposition"],
      effect:"The play's title explained. Two dashes isolate 'a comma' so the smallest mark in the language sits alone in the middle of the line, holding apart the two largest things in it.",
      concepts:["mortality","language","salvation"] },

    { id:"wit-q07", text:"It is very simple really. With the original punctuation restored, death is no longer something to act out on a stage, with exclamation points.",
      locus:"Scene 3", speaker:"E. M. Ashford", mark:"It is very simple really",
      techniques:["antithesis","irony","metatheatre","understatement","aphorism"],
      effect:"Ashford dismisses theatricality from inside a theatre, in a play whose protagonist is performing her death. Vivian will spend the whole action acting it out with exclamation points before she can hear this.",
      concepts:["performance","simplicity","mortality"] },

    { id:"wit-q08", text:"Go out. Enjoy yourself with your friends.",
      locus:"Scene 3", speaker:"E. M. Ashford", mark:"Enjoy yourself with your friends",
      techniques:["imperative","short-sentence","dramatic-irony","foreshadowing","juxtaposition"],
      effect:"The instruction is refused in the following stage direction — Vivian goes to the library. Edson plants the choice that produces eight months of visitorless illness and never mentions it again.",
      concepts:["isolation","knowledge","kindness"] },

    { id:"wit-q09", text:"I've got less than two hours. Then: curtain.",
      locus:"Scene 1", speaker:"Vivian", mark:"Then: curtain",
      techniques:["metatheatre","colon","ellipsis","short-sentence","dramatic-irony"],
      effect:"Vivian measures her life in stage time. The colon does the work of the whole gesture — a beat, then the technical word, delivered as a professional's joke.",
      concepts:["performance","mortality","wit"] },

    { id:"wit-q10", text:"I thought being extremely smart would take care of it. But I see that I have been found out.",
      locus:"Scene 15", speaker:"Vivian", mark:"I have been found out",
      techniques:["antithesis","irony","passive-voice","understatement","anagnorisis"],
      effect:"The passive is the confession: something else has done the finding out. This is the play's anagnorisis, and it arrives in the vocabulary of academic exposure rather than of death.",
      concepts:["knowledge","wit","mortality"] },

    { id:"wit-q11", text:"Now is a time for simplicity. Now is a time for, dare I say it, kindness.",
      locus:"Scene 15", speaker:"Vivian", mark:"dare I say it",
      techniques:["anaphora","parenthesis","antithesis","irony","aposiopesis"],
      effect:"'Dare I say it' is the last flicker of the seminar room — she cannot say 'kindness' without a rhetorical apology for the word's plainness. The repeated 'Now is a time' has the cadence of a lecture she is giving to herself.",
      concepts:["kindness","simplicity","wit"] },

    { id:"wit-q12", text:"I am a scholar of Donne's Holy Sonnets, which explore mortality in greater depth than any other body of work in the English language.",
      locus:"Scene 2", speaker:"Vivian", mark:"in greater depth than any other body of work",
      techniques:["hyperbole","academic-register","dramatic-irony","nominalisation","superlative"],
      effect:"The claim is professionally defensible and personally useless, and the play sets it immediately before her first vomiting scene. Expertise about death is not experience of dying.",
      concepts:["knowledge","mortality","wit"] },

    { id:"wit-q13", text:"Cancer's the only thing I ever wanted.",
      locus:"Scene 9", speaker:"Jason", mark:"the only thing I ever wanted",
      techniques:["irony","colloquialism","short-sentence","juxtaposition"],
      effect:"Said in front of the patient. Jason is not cruel; he is describing a genuine vocation in which she does not figure, and Edson makes his enthusiasm likeable so the audience cannot dismiss him.",
      concepts:["research","detachment","knowledge"] },

    { id:"wit-q14", text:"Once I did the teaching, now I am taught.",
      locus:"Scene 9", speaker:"Vivian", mark:"now I am taught",
      techniques:["antithesis","chiasmus","passive-voice","aphorism","juxtaposition"],
      effect:"Active becomes passive across the comma, which is the grammar of her whole decline. The line is elegantly built, and its elegance is the last thing she has.",
      concepts:["knowledge","power","mortality"] },

    { id:"wit-q15", text:"They read to the machine. They read to the numbers.",
      locus:"Scene 9 (grand rounds)", speaker:"Vivian", mark:"They read to the numbers",
      techniques:["anaphora","metaphor","repetition","irony","satire"],
      effect:"Vivian identifies the clinicians' bad reading in exactly the terms she would use on a student's essay. She is right, and the audience has already watched her teach a seminar the same way.",
      concepts:["detachment","knowledge","care"] },

    { id:"wit-q16", text:"In grand rounds, they read me like a book.",
      locus:"Scene 9", speaker:"Vivian", mark:"read me like a book",
      techniques:["simile","metaphor","irony","metatheatre","juxtaposition"],
      effect:"A professional reader reduced to text. The simile is her own, which is the play's method throughout — Vivian supplies the critical apparatus for her own humiliation.",
      concepts:["dehumanisation","knowledge","performance"] },

    { id:"wit-q17", text:"I'm a scholar. Or I was when I had shoes, when I had eyebrows.",
      locus:"Scene 9", speaker:"Vivian", mark:"when I had eyebrows",
      techniques:["anaphora","bathos","self-deprecation","tricolon","juxtaposition","irony"],
      effect:"The tense correction and the descent from 'scholar' to 'eyebrows' happen in one breath. Bathos is Vivian's own instrument here — she is still the wittiest person in the room and is using it on herself.",
      concepts:["identity","illness","wit"] },

    { id:"wit-q18", text:"You cannot imagine how time can be… so still.",
      locus:"Scene 12", speaker:"Vivian", mark:"so still",
      techniques:["ellipsis","direct-address","paradox","short-sentence","understatement"],
      effect:"The pause before 'so still' is the only place in the play where Vivian's rhetoric stalls without a joke to cover it. The second person is no longer performance but appeal.",
      concepts:["time","illness","isolation"] },

    { id:"wit-q19", text:"It came so quickly, after taking so long.",
      locus:"Scene 12", speaker:"Vivian", mark:"after taking so long",
      techniques:["paradox","antithesis","short-sentence","chiasmus"],
      effect:"Eight months and one moment held in one clause each. The balanced construction is the last thing that still works for her, and she uses it on the failure of everything else.",
      concepts:["time","mortality","wit"] },

    { id:"wit-q20", text:"I want to tell you how I feel. I'm scared.",
      locus:"Scene 13", speaker:"Vivian", mark:"I'm scared",
      techniques:["short-sentence","first-person","monosyllables","antithesis","anagnorisis"],
      effect:"Two words after ninety minutes of subordinate clauses. The play's most important line is its plainest, and it is addressed to a nurse rather than to the audience she has been lecturing.",
      concepts:["kindness","mortality","isolation"] },

    { id:"wit-q21", text:"Oh, God. I can't believe it. Oh, God.",
      locus:"Scene 17", speaker:"Jason", mark:"I can't believe it",
      techniques:["repetition","exclamation","sentence-fragment","irony","climax"],
      effect:"His first genuinely human utterance, and it is about a spoiled research protocol. Edson gives him real distress and points it at the wrong object.",
      concepts:["research","detachment","mortality"] },

    { id:"wit-q22", text:"She's Research!",
      locus:"Scene 17", speaker:"Jason", mark:"Research",
      techniques:["capitalisation","exclamation","metonymy","dehumanisation","climax"],
      effect:"A person replaced by a category, capitalised. The play's institutional critique lands here: the code violation is defended in the vocabulary of the study rather than of the patient.",
      concepts:["dehumanisation","research","power"] },

    { id:"wit-q23", text:"She's DNR!",
      locus:"Scene 17", speaker:"Susie", mark:"DNR",
      techniques:["acronym","exclamation","short-sentence","antithesis","climax"],
      effect:"Susie wins the argument with three letters, using the institution's own instrument to enforce a wish. The play's ethical victory is procedural, which is more honest than a speech would be.",
      concepts:["care","kindness","power"] },

    { id:"wit-q24", text:"You can be \"full code,\" which means we would do everything possible… or you can be \"Do Not Resuscitate.\"",
      locus:"Scene 13", speaker:"Susie", mark:"do everything possible",
      techniques:["euphemism","antithesis","ellipsis","technical-diction","direct-address"],
      effect:"The least learned character conducts the play's only real conversation, in plain words with a real choice at the end. Edson's respect for Susie is measurable in how little she embellishes her.",
      concepts:["care","kindness","mortality"] },

    { id:"wit-q25", text:"Now is not the time for verbal swordplay.",
      locus:"Scene 15", speaker:"Vivian", mark:"verbal swordplay",
      techniques:["metaphor","antithesis","irony","aphorism","litotes"],
      effect:"She renounces wit in a metaphor, which means she has not quite renounced it. The play is precise about how gradual that surrender is.",
      concepts:["wit","simplicity","mortality"] },

    { id:"wit-q26", text:"Nothing would be worse than a detailed scholarly analysis. Erudition. Interpretation. Complication.",
      locus:"Scene 15", speaker:"Vivian", mark:"Erudition. Interpretation. Complication.",
      techniques:["tricolon","sentence-fragment","asyndeton","climax","irony","nominalisation"],
      effect:"Three abstract nouns punctuated as sentences, each shorter in effect than the last. She dismantles her own discipline using its rhythm, which is the only elegy available to her.",
      concepts:["knowledge","simplicity","wit"] },

    { id:"wit-q27", text:"Soporific.",
      locus:"Scene 14 (flashback)", speaker:"Vivian, aged five", mark:"Soporific",
      techniques:["motif","one-word-sentence","dramatic-irony","allusion","foreshadowing"],
      effect:"The first word she ever loved, learned from her father over a picture book. Vivian's earliest intimacy is a definition, and the play never suggests she was given another kind.",
      concepts:["language","isolation","knowledge"] },

    { id:"wit-q28", text:"The illustrations are exemplary.",
      locus:"Scene 14 (flashback)", speaker:"Mr Bearing", mark:"exemplary",
      techniques:["register","irony","understatement"],
      effect:"A father reviewing a children's book. The critical vocabulary is the household dialect, which explains everything about how his daughter learned to be close to people.",
      concepts:["language","isolation","knowledge"] },

    { id:"wit-q29", text:"A little allegory of the soul. No matter where it hides, God will find it.",
      locus:"Scene 18", speaker:"E. M. Ashford", mark:"No matter where it hides, God will find it",
      techniques:["allusion","metaphor","aphorism","juxtaposition","irony"],
      effect:"Ashford reads a picture book to a dying scholar and then close-reads it anyway. The joke is affectionate: even kindness in this play arrives with an interpretation attached, and it works.",
      concepts:["kindness","salvation","simplicity"] },

    { id:"wit-q30", text:"It's time to go. And flights of angels sing thee to thy rest.",
      locus:"Scene 18", speaker:"E. M. Ashford", mark:"flights of angels sing thee to thy rest",
      techniques:["allusion","intertextuality","juxtaposition","short-sentence","apostrophe"],
      effect:"Horatio's line over Hamlet, spoken by a supervisor to a student. Edson lets literature back in at the end — not as armour, but as the thing you say when there is nothing to say.",
      concepts:["mortality","kindness","salvation"] },

    { id:"wit-q31", text:"I trust this will have a soporific effect.",
      locus:"Scene 1", speaker:"Vivian", mark:"soporific",
      techniques:["motif","irony","register","dramatic-irony","allusion"],
      effect:"The childhood word deployed as a lecturer's joke about her own lecture. The motif's three appearances — father, seminar, deathbed — chart the whole distance the play travels.",
      concepts:["language","wit","performance"] },

    { id:"wit-q32", text:"I have always particularly liked that poem. In the abstract.",
      locus:"Scene 15", speaker:"Vivian", mark:"In the abstract",
      techniques:["understatement","sentence-fragment","irony","bathos","self-deprecation"],
      effect:"Two words, set apart as their own sentence, retract everything before them. This is the most efficient piece of self-criticism in the play and she performs it herself.",
      concepts:["knowledge","wit","mortality"] },

    { id:"wit-q33", text:"Death be not proud. Do not get glib.",
      locus:"Scene 4 (seminar, flashback)", speaker:"Vivian to her students", mark:"Do not get glib",
      techniques:["imperative","juxtaposition","allusion","short-sentence","irony"],
      effect:"Vivian's teaching style in one beat: the poem, then the correction. Jason Posner is in that room, and the way he later reads her chart is the way she taught him to read.",
      concepts:["knowledge","detachment","language"] },

    { id:"wit-q34", text:"Full dose. Excellent.",
      locus:"Scene 6", speaker:"Kelekian", mark:"Excellent",
      techniques:["sentence-fragment","irony","technical-diction","juxtaposition","understatement"],
      effect:"Two fragments celebrating a dose the patient can barely survive. 'Excellent' belongs to the study, not to her, and Edson leaves the mismatch unremarked.",
      concepts:["research","detachment","power"] },

    { id:"wit-q35", text:"I know all about life and death. I am, after all, a scholar of Donne's Holy Sonnets.",
      locus:"Scene 2", speaker:"Vivian", mark:"after all",
      techniques:["dramatic-irony","parenthesis","hyperbole","academic-register","juxtaposition"],
      effect:"'After all' assumes an agreement the audience has not made. The play spends eight months answering the claim, and the answer is that she knows all about the poems.",
      concepts:["knowledge","mortality","wit"] },

    { id:"wit-q36", text:"My only defence is the acquisition of vocabulary.",
      locus:"Scene 14", speaker:"Vivian", mark:"acquisition of vocabulary",
      techniques:["metaphor","nominalisation","military-diction","aphorism","irony"],
      effect:"'Defence' names it as armour and 'acquisition' names it as property. The most precise sentence Vivian says about herself, and it is built from the abstractions it is diagnosing.",
      concepts:["language","isolation","wit"] },

    { id:"wit-q37", text:"Hi. How are you feeling today?",
      locus:"passim", speaker:"clinicians", mark:"How are you feeling today?",
      techniques:["motif","repetition","irony","formulaic-language","satire"],
      effect:"Asked by almost everyone, answered honestly by no-one. Repetition converts a courtesy into an indictment without a word of commentary — the play simply lets it happen enough times.",
      concepts:["care","language","dehumanisation"] },

    { id:"wit-q38", text:"I am learning to suffer.",
      locus:"Scene 12", speaker:"Vivian", mark:"learning",
      techniques:["short-sentence","irony","paradox","tense-shift","juxtaposition"],
      effect:"The one verb she trusts, applied to the one thing that cannot be studied. Vivian tries to make suffering a curriculum because a curriculum is the only relationship she has ever had with anything.",
      concepts:["knowledge","illness","mortality"] },

    { id:"wit-q39", text:"The Holy Sonnets are mine.",
      locus:"Scene 4", speaker:"Vivian", mark:"mine",
      techniques:["short-sentence","possessive","irony","hubris"],
      effect:"Four words claiming ownership of a body of work about surrendering the self. The play does not need to comment; it just has to put her in a hospital gown.",
      concepts:["knowledge","power","identity"] },

    { id:"wit-q40", text:"Vivian steps out of the bed. She loosens the ties and the gown falls to the floor.",
      locus:"Scene 18 (stage direction)", speaker:"stage direction", mark:"the gown falls to the floor",
      techniques:["stage-direction","symbolism","silence","juxtaposition","climax"],
      effect:"The final statement of a play made of words is an action with no words in it. Cap, gown and text are all removed, and what is left is the only thing the play will call her.",
      concepts:["identity","mortality","simplicity"] },

    { id:"wit-q41", text:"She walks away from the scene, toward a little light.",
      locus:"Scene 18 (stage direction)", speaker:"stage direction", mark:"away from the scene",
      techniques:["stage-direction","symbolism","metatheatre","understatement","allusion"],
      effect:"'Away from the scene' is theatrical language doing theological work. Having narrated her own play for two hours, she exits it — the only stage direction in which she is not performing.",
      concepts:["performance","mortality","salvation"] },

    { id:"wit-q42", text:"You may remove your cap and gown.",
      locus:"Scene 18 (stage direction, paraphrased cue)", speaker:"stage direction", mark:"cap and gown",
      techniques:["symbolism","juxtaposition","irony","pun"],
      effect:"Academic regalia and hospital dress named by the same phrase. The pun is the pairing's argument in two words: the robes she earned and the gown she was issued are the same costume.",
      concepts:["identity","knowledge","dehumanisation"] },

    { id:"wit-q43", text:"Ah, that's better.",
      locus:"Scene 13", speaker:"Vivian", mark:"that's better",
      techniques:["colloquialism","understatement","short-sentence","bathos","juxtaposition"],
      effect:"A popsicle, shared on a hospital floor at three in the morning. The play's one scene of uncomplicated comfort contains no learning at all, and Edson stages it as the high point.",
      concepts:["kindness","care","simplicity"] },

    { id:"wit-q44", text:"My next line is supposed to be something like this.",
      locus:"Scene 5", speaker:"Vivian", mark:"supposed to be",
      techniques:["metatheatre","direct-address","irony"],
      effect:"She narrates her own dialogue as script. As long as she can describe the form she is inside, she is not entirely subject to it — which is why the device has to fail before the ending can work.",
      concepts:["performance","wit","identity"] },

    { id:"wit-q45", text:"I have been asked to be… to be… I don't know.",
      locus:"Scene 16", speaker:"Vivian", mark:"I don't know",
      techniques:["aposiopesis","ellipsis","repetition","short-sentence","anagnorisis"],
      effect:"The sentence cannot be finished, and the woman who has finished every sentence in the play says so. The broken syntax is the most reliable evidence of what has happened to her.",
      concepts:["language","illness","identity"] }
  ]
};
