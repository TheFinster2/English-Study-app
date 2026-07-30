/* Hamlet — starter text, Module B (Critical Study).
   Shallow by design; see the note at the top of the-crucible.js. */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["hamlet"] = {
  id: "hamlet",
  title: "Hamlet",
  composer: "William Shakespeare",
  year: 1601,
  form: "drama (tragedy)",
  modules: ["moduleB"],
  starter: true,
  blurb: "A revenge tragedy whose hero will not get on with the revenge, and which is " +
         "consequently about thinking rather than about killing. Its textual integrity " +
         "is a matter of delay made structural.",

  context: [
    { fact: "Three early texts survive: Q1 (1603), Q2 (1604) and F1 (1623), differing substantially.",
      why: "There is no single Hamlet. Q1 is half the length and moves 'To be or not to be' earlier — textual integrity has to be argued for, not assumed." },
    { fact: "The revenge-tragedy conventions Shakespeare inherited require a ghost, a delay, a play-within-a-play and a bloodbath.",
      why: "Hamlet supplies all four and makes the delay the subject. The genre's mandatory postponement becomes the character's interior life." },
    { fact: "Purgatory had been doctrinally abolished in England for decades when the play was written.",
      why: "A ghost claiming to come from purgatory is theologically suspect to the first audience, which makes Hamlet's demand for evidence pious rather than cowardly." }
  ],

  characters: [
    { name: "Hamlet", role: "protagonist",
      note: "Given seven soliloquies and no plan. His intelligence is the obstacle, which is a genuinely new thing in English drama.",
      concepts: ["delay","knowledge","mortality"] },
    { name: "Claudius", role: "antagonist",
      note: "A competent king and a real murderer. His prayer scene grants him an interior life the genre does not require.",
      concepts: ["power","guilt","performance"] },
    { name: "Ophelia", role: "victim",
      note: "Given songs instead of soliloquies. Her madness is public where Hamlet's is performed.",
      concepts: ["madness","obedience","desire"] },
    { name: "Horatio", role: "witness",
      note: "Survives to tell it, which is the play's only provision for its own transmission.",
      concepts: ["truth","memory"] }
  ],

  structure: [
    { feature: "Seven soliloquies", detail: "Hamlet's interiority is given more stage time than the plot.",
      why: "The distribution is the design: the audience knows Hamlet's mind better than his situation, which reverses the priorities of revenge tragedy." },
    { feature: "The Mousetrap", detail: "A play staged inside the play to test the Ghost's account.",
      why: "Metatheatre used as forensic instrument. It also gives the audience a mirror in which to notice they are watching a performance about performance." },
    { feature: "Doubling of avenging sons", detail: "Hamlet, Laertes and Fortinbras all have murdered fathers.",
      why: "Three responses to the same situation. The structure argues by comparison rather than by statement, and Hamlet is the slowest of the three." },
    { feature: "The graveyard", detail: "Act 5 opens with two clowns and a skull before the final catastrophe.",
      why: "The play's philosophical climax is comic and precedes the swordplay, so the deaths arrive after the thinking is finished." }
  ],

  quotes: [
    { id:"ham-q01", text:"To be, or not to be — that is the question:",
      locus:"3.1.56", speaker:"Hamlet", mark:"that is the question",
      techniques:["soliloquy","antithesis","dash","caesura"],
      effect:"Two infinitives with no subject, so the question is unattached to anyone in particular. The dash is a held breath before the line names itself as a question rather than answering one.",
      concepts:["mortality","delay","knowledge"] },
    { id:"ham-q02", text:"The rest is silence.",
      locus:"5.2.363", speaker:"Hamlet", mark:"silence",
      techniques:["short-sentence","euphemism","understatement","pun","climax"],
      effect:"'Rest' means remainder and repose at once, and 'silence' is the last word from the most articulate character in the language. Four words closing four hours.",
      concepts:["mortality","knowledge"] },
    { id:"ham-q03", text:"There is nothing either good or bad but thinking makes it so.",
      locus:"2.2.249–250", speaker:"Hamlet", mark:"thinking makes it so",
      techniques:["aphorism","antithesis","paradox"],
      effect:"Said to Rosencrantz and Guildenstern, whom he is manipulating. The relativism is a tactic in the scene and a genuine position in the play, and Shakespeare does not sort them out.",
      concepts:["knowledge","truth","delay"] },
    { id:"ham-q04", text:"The play's the thing / Wherein I'll catch the conscience of the king.",
      locus:"2.2.604–605", speaker:"Hamlet", mark:"catch the conscience of the king",
      techniques:["heroic-couplet","metatheatre","metaphor","hunting-imagery","rhyme"],
      effect:"The rhyming couplet ends the act like a curtain line, which is Hamlet writing his own dramaturgy. Theatre is proposed as evidence-gathering.",
      concepts:["performance","truth","delay"] },
    { id:"ham-q05", text:"O, what a rogue and peasant slave am I!",
      locus:"2.2.550", speaker:"Hamlet", mark:"rogue and peasant slave",
      techniques:["soliloquy","exclamation","invective","hendiadys","apostrophe"],
      effect:"The self-accusation is triggered by an actor's convincing grief. Hamlet measures himself against a performance and finds his real feeling inadequate.",
      concepts:["delay","performance","guilt"] },
    { id:"ham-q06", text:"Frailty, thy name is woman!",
      locus:"1.2.146", speaker:"Hamlet", mark:"thy name is woman",
      techniques:["apostrophe","personification","generalisation","exclamation"],
      effect:"A specific grievance against his mother expanded to a universal within four words. The generalising move is characteristic and the play does not endorse it.",
      concepts:["desire","guilt","obedience"] },
    { id:"ham-q07", text:"Something is rotten in the state of Denmark.",
      locus:"1.4.90", speaker:"Marcellus", mark:"rotten",
      techniques:["metaphor","understatement","foreshadowing","aphorism","motif"],
      effect:"Given to a minor character, which makes it a fact rather than an interpretation. Disease and decay recur so persistently afterwards that the line reads as a diagnosis.",
      concepts:["power","truth","guilt"] },
    { id:"ham-q08", text:"My words fly up, my thoughts remain below: / Words without thoughts never to heaven go.",
      locus:"3.3.97–98", speaker:"Claudius", mark:"Words without thoughts",
      techniques:["antithesis","heroic-couplet","chiasmus","rhyme","soliloquy"],
      effect:"The villain diagnoses his own failed prayer in a perfect couplet. Granting Claudius this much self-knowledge is what stops the play being a melodrama.",
      concepts:["guilt","performance","power"] },
    { id:"ham-q09", text:"Alas, poor Yorick! I knew him, Horatio.",
      locus:"5.1.184–185", speaker:"Hamlet", mark:"I knew him",
      techniques:["apostrophe","memento-mori","direct-address","bathos","tense-shift"],
      effect:"The past tense is the whole scene. Hamlet holds a specific person's skull, not a symbol, and the philosophy that follows is earned by the particularity.",
      concepts:["mortality","memory","knowledge"] },
    { id:"ham-q10", text:"There's a divinity that shapes our ends, / Rough-hew them how we will.",
      locus:"5.2.10–11", speaker:"Hamlet", mark:"Rough-hew them how we will",
      techniques:["metaphor","antithesis","enjambment","imagery","concession"],
      effect:"Carpentry as providence: we do the rough work and something else finishes it. Hamlet's late calm is a surrender of agency described as a discovery about it.",
      concepts:["delay","mortality","knowledge"] },
    { id:"ham-q11", text:"I must be cruel only to be kind.",
      locus:"3.4.178", speaker:"Hamlet", mark:"cruel only to be kind",
      techniques:["paradox","antithesis","aphorism","juxtaposition"],
      effect:"Said having just killed Polonius by mistake. The paradox is a justification arriving after the act, which is Hamlet's habitual sequence.",
      concepts:["guilt","delay","power"] },
    { id:"ham-q12", text:"The time is out of joint. O cursed spite, / That ever I was born to set it right!",
      locus:"1.5.188–189", speaker:"Hamlet", mark:"The time is out of joint",
      techniques:["metaphor","heroic-couplet","apostrophe","exclamation","medical-imagery"],
      effect:"A dislocated limb, and Hamlet cast as the one who must reset it. The couplet closes the act on a task he resents having been assigned, four acts before he performs it.",
      concepts:["delay","mortality","power"] }
  ]
};
