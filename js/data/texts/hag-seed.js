/* Hag-Seed — starter text, Module A (paired with The Tempest).
   In copyright: short extracts only, always attributed.
   Shallow by design; see the note at the top of the-crucible.js. */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["hagseed"] = {
  id: "hagseed",
  title: "Hag-Seed",
  composer: "Margaret Atwood",
  year: 2016,
  form: "prose fiction",
  modules: ["moduleA"],
  pairedWith: "tempest",
  starter: true,
  blurb: "A sacked artistic director stages The Tempest in a prison to trap the men who " +
         "sacked him. Atwood's interest is what a revenge plot costs the person running it, " +
         "and what it does to the daughter he keeps alive by imagining her.",

  context: [
    { fact: "Written for the Hogarth Shakespeare series, which commissioned novelists to retell individual plays.",
      why: "The appropriation is declared rather than hidden, so the novel can be openly critical of its source instead of merely honouring it." },
    { fact: "The prison literacy programme is drawn from real Shakespeare-in-prisons projects.",
      why: "It grounds the transformation's central claim — that the play means something different when performed by people who are actually confined." },
    { fact: "Felix's daughter Miranda died at three; he continues to converse with her for twelve years.",
      why: "Atwood makes Prospero's control of Miranda literal by making her imaginary. The most uncomfortable resonance in the pairing is how little the relationship has to change." }
  ],

  characters: [
    { name: "Felix Phillips", role: "protagonist (Prospero)",
      note: "Grief and vanity are indistinguishable in him, which is Atwood's reading of Prospero.",
      concepts: ["grief","power","art"] },
    { name: "Miranda", role: "daughter (dead / imagined)",
      note: "Present throughout and never real. Her eventual release is the novel's version of breaking the staff.",
      concepts: ["grief","innocence","freedom"] },
    { name: "Anne-Marie Greenland", role: "actor playing Miranda",
      note: "A living young woman with a career and opinions, set against the imagined one.",
      concepts: ["freedom","art","innocence"] },
    { name: "Leggs, 8Handz and the company", role: "prisoners / the cast",
      note: "They rewrite Caliban's ending themselves, which is where the novel's authority quietly shifts.",
      concepts: ["imprisonment","art","freedom"] }
  ],

  structure: [
    { feature: "Play-within-novel", detail: "The Tempest is cast, rehearsed and staged inside the plot it is being used to execute.",
      why: "The appropriation is dramatised rather than merely performed: the reader watches the source text being interpreted by characters." },
    { feature: "The prisoners' epilogues", detail: "Each group presents what happened to their character after the play ends.",
      why: "Atwood outsources the interpretation to the inmates, so the novel's most generous readings come from its least powerful characters." },
    { feature: "Deferred release of Miranda", detail: "Felix lets his daughter go only in the final pages.",
      why: "It is the transformation's real climax, and it relocates the source's forgiveness from politics to grief." },
    { feature: "Curse-word substitution", detail: "The inmates may only swear using curses found in the play.",
      why: "A comic rule that carries the novel's thesis: given someone else's language, you find out what you can do with it." }
  ],

  quotes: [
    { id:"hag-q01", text:"To hell with grieving. It's revenge he wants.",
      locus:"Part 2", speaker:"narrator (free indirect, Felix)", mark:"It's revenge he wants",
      techniques:["free-indirect-discourse","short-sentence","antithesis","colloquialism"],
      effect:"Free indirect discourse lets Atwood state Felix's choice in his own idiom without endorsing it. Grief is dismissed in four words and the novel spends four hundred pages disagreeing.",
      concepts:["grief","power","revenge"] },
    { id:"hag-q02", text:"A prison is a theatre, and a theatre is a prison.",
      locus:"Part 3 (Felix's formulation)", speaker:"Felix", mark:"a theatre is a prison",
      techniques:["chiasmus","aphorism","metaphor","antithesis"],
      effect:"The mirrored clause is the novel's whole conceit compressed. Both institutions confine people and both make them perform, which is what lets the appropriation work at all.",
      concepts:["imprisonment","art","freedom"] },
    { id:"hag-q03", text:"He's been given his cue.",
      locus:"Part 2", speaker:"narrator", mark:"his cue",
      techniques:["metaphor","free-indirect-discourse","short-sentence","dramatic-irony"],
      effect:"Felix understands his own life as staged, which is Atwood's diagnosis of Prospero: a man who cannot experience an event that is not also a scene.",
      concepts:["art","power","grief"] },
    { id:"hag-q04", text:"Miranda would not have wanted this.",
      locus:"Part 4", speaker:"narrator (free indirect, Felix)", mark:"would not have wanted",
      techniques:["free-indirect-discourse","conditional","irony","short-sentence"],
      effect:"He is quoting a daughter he invented. The conditional exposes the whole arrangement — Felix has been supplying both sides of the conversation for twelve years.",
      concepts:["grief","power","innocence"] },
    { id:"hag-q05", text:"The Tempest is a play about prisons.",
      locus:"Part 3", speaker:"Felix (to the company)", mark:"about prisons",
      techniques:["aphorism","short-sentence","juxtaposition","metatheatre"],
      effect:"A reading offered to men in a prison, which makes it a piece of pedagogy and a piece of manipulation at once. Atwood is precise that Felix's best teaching serves his plot.",
      concepts:["imprisonment","art","power"] },
    { id:"hag-q06", text:"You can't win. Not against the flesh.",
      locus:"Part 4", speaker:"Felix", mark:"Not against the flesh",
      techniques:["sentence-fragment","antithesis","aphorism","juxtaposition"],
      effect:"The fragment is a concession he cannot make in a full sentence. Ageing does to Felix what the epilogue does to Prospero: removes the power before he decides to give it up.",
      concepts:["mortality","power","grief"] },
    { id:"hag-q07", text:"Caliban gets a band.",
      locus:"Part 5", speaker:"narrator (of the prisoners' epilogue)", mark:"gets a band",
      techniques:["short-sentence","bathos","intertextuality","irony"],
      effect:"The inmates give the play's dispossessed character a future the source denies him. The novel's most hopeful reading is not Felix's, and Atwood makes sure the reader notices whose it is.",
      concepts:["freedom","art","imprisonment"] },
    { id:"hag-q08", text:"Now I want you to set me free.",
      locus:"Part 5 (Felix, echoing the epilogue)", speaker:"Felix", mark:"set me free",
      techniques:["allusion","intertextuality","direct-address","imperative","metatheatre"],
      effect:"Prospero's epilogue relocated from a theatre audience to a dead child. Atwood keeps the source's grammar and changes who is being asked, which is the pairing's sharpest single move.",
      concepts:["grief","freedom","forgiveness"] },
    { id:"hag-q09", text:"Twelve years. It's the right number.",
      locus:"Part 2", speaker:"narrator (free indirect, Felix)", mark:"the right number",
      techniques:["free-indirect-discourse","short-sentence","allusion","irony"],
      effect:"Felix notices that his life has matched the play's timeline and finds it satisfying rather than alarming. The novel's humour is nearly always about his vanity.",
      concepts:["art","power","grief"] },
    { id:"hag-q10", text:"He's a hag-seed himself, if it comes to that.",
      locus:"Part 4", speaker:"narrator (free indirect, Felix)", mark:"a hag-seed himself",
      techniques:["allusion","free-indirect-discourse","irony","anagnorisis"],
      effect:"The title's insult turned back on the Prospero figure. 'If it comes to that' is a hedge, so the recognition is admitted grudgingly and only halfway.",
      concepts:["power","grief","forgiveness"] },
    { id:"hag-q11", text:"Curses only from the play. That's the rule.",
      locus:"Part 3", speaker:"Felix", mark:"Curses only from the play",
      techniques:["imperative","short-sentence","irony"],
      effect:"A restriction that turns out to be liberating, since the inmates become inventive inside it. Atwood's argument about appropriation, delivered as a classroom rule.",
      concepts:["art","language","freedom"] },
    { id:"hag-q12", text:"She is here. She is not here.",
      locus:"Part 5", speaker:"narrator (of Miranda)", mark:"She is not here",
      techniques:["antithesis","repetition","paradox","short-sentence","parallelism"],
      effect:"Two identical constructions, opposite content, no conjunction to reconcile them. The novel refuses to resolve whether letting go is a loss or a release.",
      concepts:["grief","freedom","innocence"] }
  ]
};
