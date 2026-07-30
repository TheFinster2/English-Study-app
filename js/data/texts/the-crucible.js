/* The Crucible — starter text, Common Module.
   Shallower than the four texts in the active manifest by design: this ships so a fresh
   install isn't empty and so the swap-my-text path is exercised by more than one file.
   To make it the active Common Module text, change `common` in js/data/texts.js. */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["crucible"] = {
  id: "crucible",
  title: "The Crucible",
  composer: "Arthur Miller",
  year: 1953,
  form: "drama",
  modules: ["common"],
  starter: true,
  blurb: "Salem, 1692, standing in for Washington, 1953. A community discovers that " +
         "accusation is cheaper than evidence and that reputation is the only currency " +
         "anyone actually holds.",

  context: [
    { fact: "Written during the House Un-American Activities Committee hearings; Miller was himself subpoenaed in 1956.",
      why: "The allegory is not decorative. Miller's interest is the mechanism by which naming others becomes the price of your own safety, which is what both Salem and HUAC ran on." },
    { fact: "Miller compressed the historical timeline and aged Abigail Williams up from eleven to seventeen.",
      why: "The invented affair with Proctor gives the accusations a private motive, which converts a documentary about hysteria into a tragedy with an agent." },
    { fact: "The play's prose includes long expository authorial interpolations, printed but unperformable.",
      why: "Miller wants the reader positioned as a historian and the audience as a witness. The form does two different jobs depending on which you are." }
  ],

  characters: [
    { name: "John Proctor", role: "protagonist",
      note: "A man whose one private sin makes him unable to speak publicly until speaking costs him everything.",
      concepts: ["reputation","guilt","integrity"] },
    { name: "Abigail Williams", role: "antagonist",
      note: "Discovers that in a theocracy an accusation is a form of power available even to a servant girl.",
      concepts: ["power","desire","reputation"] },
    { name: "Reverend Hale", role: "investigator",
      note: "The only character who changes his mind, and the play's measure of how late that can be done.",
      concepts: ["knowledge","guilt","integrity"] },
    { name: "Elizabeth Proctor", role: "wife",
      note: "Her final refusal to plead with her husband is the play's most generous act.",
      concepts: ["integrity","forgiveness"] }
  ],

  structure: [
    { feature: "Four acts, four rooms", detail: "Bedroom, kitchen, courtroom, cell — each more public, then finally private again.",
      why: "The spatial narrowing tracks the loss of any distinction between private conscience and public record." },
    { feature: "Authorial interpolation", detail: "Essayistic passages on Salem inserted into Act One.",
      why: "The play refuses to let the audience treat 1692 as an exotic setting; the commentary keeps dragging it back to the present." },
    { feature: "Withheld confession", detail: "Proctor's affair is known to the audience long before it is public.",
      why: "Dramatic irony makes every scene of Proctor's silence excruciating, which is how Miller makes reputation feel like a physical weight." }
  ],

  quotes: [
    { id:"cru-q01", text:"Because it is my name! Because I cannot have another in my life!",
      locus:"Act 4", speaker:"John Proctor", mark:"it is my name",
      techniques:["exclamation","repetition","anaphora","climax","short-sentence"],
      effect:"Proctor's reason for refusing to sign is not innocence but ownership. The repeated 'Because' answers a question nobody asked, which is what a man arguing with himself sounds like.",
      concepts:["reputation","integrity","individual"] },
    { id:"cru-q02", text:"I have given you my soul; leave me my name!",
      locus:"Act 4", speaker:"John Proctor", mark:"leave me my name",
      techniques:["antithesis","semicolon","imperative","exclamation","juxtaposition"],
      effect:"The semicolon does the trade: soul on one side, name on the other, and he ranks them. In a theocracy that is heresy, and Miller lets it be heroic anyway.",
      concepts:["reputation","integrity","guilt"] },
    { id:"cru-q03", text:"We cannot look to superstition in this. The Devil is precise.",
      locus:"Act 1", speaker:"Reverend Hale", mark:"The Devil is precise",
      techniques:["antithesis","short-sentence","irony","paradox","juxtaposition"],
      effect:"Hale distinguishes his method from superstition and then supplies a sentence indistinguishable from it. The play's diagnosis of expertise is that it launders the same beliefs in better vocabulary.",
      concepts:["knowledge","power","truth"] },
    { id:"cru-q04", text:"A person is either with this court or he must be counted against it, there be no road between.",
      locus:"Act 3", speaker:"Deputy Governor Danforth", mark:"there be no road between",
      techniques:["false-dichotomy","antithesis","high-modality","aphorism"],
      effect:"The rhetorical structure is the tyranny: an argument with only two positions in it cannot be answered from anywhere else. Miller gives the villain the play's cleanest logic.",
      concepts:["power","truth","collective"] },
    { id:"cru-q05", text:"I saw Goody Osburn with the Devil! I saw Bridget Bishop with the Devil!",
      locus:"Act 1", speaker:"Abigail", mark:"I saw",
      techniques:["anaphora","repetition","climax","accumulation","exclamation"],
      effect:"Naming becomes contagious mid-speech. The anaphora is the machinery — once the sentence pattern is established, the names are almost interchangeable.",
      concepts:["collective","power","reputation"] },
    { id:"cru-q06", text:"I want the light of God, I want the sweet love of Jesus!",
      locus:"Act 1", speaker:"Abigail", mark:"I want",
      techniques:["repetition","religious-diction","irony","exclamation","anaphora"],
      effect:"Conversion performed in the vocabulary of desire she uses everywhere else. Miller is precise that Abigail's religious language and her erotic language are the same language.",
      concepts:["desire","power","reputation"] },
    { id:"cru-q07", text:"It is a whore's vengeance.",
      locus:"Act 3", speaker:"John Proctor", mark:"a whore's vengeance",
      techniques:["metaphor","invective","short-sentence","climax"],
      effect:"To discredit Abigail he must first name himself. The brevity is the cost — five words that end his reputation to save his wife.",
      concepts:["reputation","guilt","truth"] },
    { id:"cru-q08", text:"I speak my own sins; I cannot judge another.",
      locus:"Act 4", speaker:"John Proctor", mark:"I cannot judge another",
      techniques:["antithesis","semicolon","aphorism","first-person","litotes"],
      effect:"Confessing is possible and naming others is not, which draws the exact line the play is about. Miller's target was never witchcraft but the demand for a list.",
      concepts:["integrity","guilt","collective"] },
    { id:"cru-q09", text:"He have his goodness now. God forbid I take it from him.",
      locus:"Act 4", speaker:"Elizabeth Proctor", mark:"God forbid I take it from him",
      techniques:["short-sentence","dialect","understatement","dramatic-irony","pathos"],
      effect:"The play's last words about Proctor decline to save him. Elizabeth's grammar is plain and her judgement is theological, and she gets the final authority Danforth wanted.",
      concepts:["integrity","forgiveness","reputation"] },
    { id:"cru-q10", text:"Life, woman, life is God's most precious gift; no principle, however glorious, may justify the taking of it.",
      locus:"Act 4", speaker:"Reverend Hale", mark:"no principle, however glorious",
      techniques:["direct-address","parenthesis","antithesis","aphorism","high-modality"],
      effect:"Hale's reversal is complete and arrives too late to matter. The concessive 'however glorious' is the sentence of a man who has just watched a principle kill people.",
      concepts:["guilt","knowledge","integrity"] },
    { id:"cru-q11", text:"I look for John Proctor that took me from my sleep and put knowledge in my heart!",
      locus:"Act 1", speaker:"Abigail", mark:"put knowledge in my heart",
      techniques:["biblical-allusion","euphemism","exclamation","metaphor"],
      effect:"The Eden allusion casts her as tempted rather than tempting and Proctor as the serpent. Abigail's rhetoric is always already a defence.",
      concepts:["desire","guilt","power"] },
    { id:"cru-q12", text:"Until an hour before the Devil fell, God thought him beautiful in Heaven.",
      locus:"Act 2", speaker:"John Proctor", mark:"God thought him beautiful",
      techniques:["allusion","antithesis","aphorism","juxtaposition","irony"],
      effect:"Reputation is shown to be revocable at the highest possible level. Proctor's best argument against Salem is drawn from Salem's own scripture.",
      concepts:["reputation","truth","power"] }
  ]
};
