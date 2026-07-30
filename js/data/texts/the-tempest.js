/* The Tempest — starter text, Module A (paired with Hag-Seed).
   Shallow by design; see the note at the top of the-crucible.js. */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["tempest"] = {
  id: "tempest",
  title: "The Tempest",
  composer: "William Shakespeare",
  year: 1611,
  form: "drama (romance)",
  modules: ["moduleA"],
  pairedWith: "hagseed",
  starter: true,
  blurb: "A deposed duke with a library and a grievance runs a twelve-year revenge plot " +
         "and then forgives everybody in the last ten minutes. Whether that is grace or " +
         "exhaustion is the play's open question.",

  context: [
    { fact: "Written c. 1611, drawing on accounts of the 1609 wreck of the Sea Venture off Bermuda.",
      why: "The island is a colonial site before it is a magical one, which is why Caliban's claim to it is a property argument rather than a monster's grumble." },
    { fact: "It observes the classical unities of time, place and action almost uniquely in Shakespeare.",
      why: "Four hours of stage time for four hours of story. The compression puts enormous pressure on Prospero's decision, since there is no room for him to change slowly." },
    { fact: "Prospero's epilogue asks the audience directly to set him free with their applause.",
      why: "The magician's power is transferred to the house. It is the clearest instance in Shakespeare of a play admitting that its authority was always on loan." }
  ],

  characters: [
    { name: "Prospero", role: "protagonist",
      note: "Wronged, controlling, and the author of nearly every event in the play. His forgiveness arrives in a subordinate clause.",
      concepts: ["power","forgiveness","art"] },
    { name: "Caliban", role: "the island's claimant",
      note: "Given the most beautiful verse in the play, which makes any reading of him as merely brutish untenable.",
      concepts: ["colonialism","language","power"] },
    { name: "Ariel", role: "spirit servant",
      note: "Performs the magic and asks about liberty. The play's labour question is his.",
      concepts: ["freedom","art","power"] },
    { name: "Miranda", role: "daughter",
      note: "Her wonder is real and entirely managed. Almost everything she sees, Prospero arranged.",
      concepts: ["innocence","power","desire"] }
  ],

  structure: [
    { feature: "Classical unities", detail: "One island, one afternoon, one action.",
      why: "The constraint makes the play feel engineered, which suits a protagonist who is engineering it." },
    { feature: "Exposition as narrative", detail: "Act 1 Scene 2 is Prospero telling Miranda the backstory at length.",
      why: "Control of the past is established as Prospero's first act. The audience receives the history from an interested party." },
    { feature: "The masque, interrupted", detail: "Prospero abandons the wedding masque on remembering Caliban's plot.",
      why: "Art breaks off for politics mid-performance, and the 'revels now are ended' speech is the fallout." },
    { feature: "The epilogue", detail: "Prospero, without magic, asks the audience for release.",
      why: "The play ends outside its own fiction. Structural humility after four acts of omnipotence." }
  ],

  quotes: [
    { id:"tem-q01", text:"This thing of darkness I / Acknowledge mine.",
      locus:"5.1.275–276", speaker:"Prospero", mark:"Acknowledge mine",
      techniques:["enjambment","euphemism","possessive","caesura","ambiguity"],
      effect:"The line break falls on 'I', so the pronoun hangs before the verb arrives. Whether 'mine' means my servant, my responsibility or my own darkness is left genuinely open.",
      concepts:["power","forgiveness","colonialism"] },
    { id:"tem-q02", text:"You taught me language, and my profit on't / Is, I know how to curse.",
      locus:"1.2.363–364", speaker:"Caliban", mark:"my profit on't",
      techniques:["antithesis","commercial-diction","enjambment","irony","paradox"],
      effect:"Education described as a bad trade. 'Profit' turns the coloniser's gift into a transaction with a loss on it, and the curse is delivered in the coloniser's own verse.",
      concepts:["colonialism","language","power"] },
    { id:"tem-q03", text:"The isle is full of noises, / Sounds and sweet airs, that give delight and hurt not.",
      locus:"3.2.135–136", speaker:"Caliban", mark:"give delight and hurt not",
      techniques:["auditory-imagery","sibilance","enjambment","litotes","juxtaposition"],
      effect:"The most lyrical speech in the play belongs to the character everyone calls a monster. Shakespeare hands Caliban the island's beauty and thereby hands him the argument.",
      concepts:["colonialism","art","language"] },
    { id:"tem-q04", text:"We are such stuff / As dreams are made on, and our little life / Is rounded with a sleep.",
      locus:"4.1.156–158", speaker:"Prospero", mark:"rounded with a sleep",
      techniques:["metaphor","enjambment","simile","euphemism","aphorism"],
      effect:"'Rounded' means both encircled and completed. Prospero abandons a masque to say it, so the speech is a man cancelling his own art and explaining why.",
      concepts:["art","mortality","power"] },
    { id:"tem-q05", text:"Our revels now are ended.",
      locus:"4.1.148", speaker:"Prospero", mark:"now are ended",
      techniques:["short-sentence","metatheatre","first-person-plural","caesura"],
      effect:"Spoken to characters and to the audience at once. 'Our' includes the house, which begins the transfer of authority the epilogue completes.",
      concepts:["art","power","mortality"] },
    { id:"tem-q06", text:"O brave new world / That has such people in't!",
      locus:"5.1.183–184", speaker:"Miranda", mark:"brave new world",
      techniques:["exclamation","apostrophe","dramatic-irony","enjambment"],
      effect:"Prospero's reply — ''Tis new to thee' — undercuts it in four words. Miranda's wonder is genuine and the play immediately prices it.",
      concepts:["innocence","power","colonialism"] },
    { id:"tem-q07", text:"Hell is empty, / And all the devils are here.",
      locus:"1.2.214–215", speaker:"Ariel (reporting Ferdinand)", mark:"all the devils are here",
      techniques:["hyperbole","antithesis","enjambment","allusion","juxtaposition"],
      effect:"Reported speech inside a storm Prospero staged. The terror is real to the sufferer and a special effect to the audience, which is the play's basic ethical problem.",
      concepts:["power","art","forgiveness"] },
    { id:"tem-q08", text:"Is there more toil? Since thou dost give me pains, / Let me remember thee what thou hast promised,",
      locus:"1.2.242–243", speaker:"Ariel", mark:"Let me remember thee what thou hast promised",
      techniques:["rhetorical-question","enjambment","legal-diction","direct-address"],
      effect:"Ariel's first move is to invoke a contract. The play's magic runs on terms and conditions, which is a strange and deliberate way to write a spirit.",
      concepts:["freedom","power","art"] },
    { id:"tem-q09", text:"The rarer action is / In virtue than in vengeance.",
      locus:"5.1.27–28", speaker:"Prospero", mark:"In virtue than in vengeance",
      techniques:["antithesis","comparative","enjambment","alliteration","aphorism"],
      effect:"Forgiveness justified on grounds of rarity rather than of goodness — the choice is framed as the more distinguished option. Prospero's mercy keeps his vanity intact.",
      concepts:["forgiveness","power","art"] },
    { id:"tem-q10", text:"I'll break my staff, / Bury it certain fathoms in the earth,",
      locus:"5.1.54–55", speaker:"Prospero", mark:"break my staff",
      techniques:["symbolism","enjambment","tense-shift","imagery","climax"],
      effect:"The renunciation is specific and physical — break, bury, drown — as if power will not go unless it is disposed of item by item.",
      concepts:["power","art","forgiveness"] },
    { id:"tem-q11", text:"This island's mine, by Sycorax my mother, / Which thou tak'st from me.",
      locus:"1.2.331–332", speaker:"Caliban", mark:"This island's mine",
      techniques:["possessive","enjambment","legal-diction","direct-address","antithesis"],
      effect:"An inheritance claim, made in the vocabulary of property law. Caliban does not ask for sympathy; he asserts title, which is much harder for the play to dismiss.",
      concepts:["colonialism","power","freedom"] },
    { id:"tem-q12", text:"My library / Was dukedom large enough.",
      locus:"1.2.109–110", speaker:"Prospero", mark:"dukedom large enough",
      techniques:["metaphor","enjambment","irony","understatement","juxtaposition"],
      effect:"He explains his deposition by admitting he preferred books to governing, and reports it as a virtue. The self-portrait is candid and does not notice its own indictment.",
      concepts:["art","power","knowledge"] }
  ]
};
