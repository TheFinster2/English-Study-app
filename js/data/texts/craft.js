/* The Craft of Writing — Module C. A skills focus, not a prescribed text.
   ============================================================================
   Module C is examined on what you can DO and on whether you can account for it, so
   this file is built differently from the others: the `context` array holds craft
   principles rather than historical facts, and the `quotes` array holds short model
   sentences written for this app — each one a single technique doing a single job,
   labelled as a model rather than passed off as literature.

   Where a real author is quoted, it is a short public-domain extract and it is
   attributed. Nothing here pretends a demonstration sentence is a published one.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};
EN.DATA.texts = EN.DATA.texts || {};

EN.DATA.texts["craft"] = {
  id: "craft",
  title: "The Craft of Writing",
  composer: "skills focus",
  year: null,
  form: "craft",
  modules: ["moduleC"],
  skillsOnly: true,
  blurb: "No prescribed text. Three forms, one reflection statement, and a small number " +
         "of moves you can actually practise: how a sentence starts, where it puts its " +
         "weight, and what it declines to say.",

  context: [
    { fact: "Module C asks for imaginative, discursive or persuasive writing, plus a reflection statement accounting for your choices.",
      why: "The reflection is not an add-on. Marks come from being able to name what you did and why, so a beautiful piece with a vague reflection scores below a competent piece with a precise one." },
    { fact: "Discursive writing explores an idea from several angles without committing to a single thesis.",
      why: "It is the form most often written badly, because students turn it into a persuasive essay with hedging. A discursive piece is allowed to change its mind on the page — that movement is the form." },
    { fact: "Persuasive writing has a position and pursues it; imaginative writing creates a world.",
      why: "The three forms are distinguished by intent, not by decoration. An imaginative piece with a moral tacked on the end has usually become a bad persuasive one." },
    { fact: "The reflection statement should quote your own writing.",
      why: "Naming a technique without pointing at the words is the same weakness as an essay asserting a technique without quoting the text. Markers want the evidence in both directions." },
    { fact: "A stimulus in the exam must be used, not merely mentioned.",
      why: "The commonest Module C failure is a piece that gestures at the stimulus in its first line and then ignores it. The stimulus should be load-bearing." },
    { fact: "Sentence length is a technique, not an accident.",
      why: "A short sentence after three long ones lands because of the contrast. Rhythm is the most controllable variable in prose and the least often deliberately used." },
    { fact: "Specificity outperforms intensity.",
      why: "'A dog barked somewhere' is weaker than 'the neighbour's kelpie started up again'. Concrete nouns do the work that adjectives are usually recruited for." },
    { fact: "Voice is created by what a narrator notices, not by how ornate the prose is.",
      why: "Selection is characterisation. Two narrators in the same room describing different objects have told you everything about themselves before either has spoken." },
    { fact: "The most common structural fault in student imaginative writing is a twist ending.",
      why: "A twist retroactively cancels the reader's investment. Endings that pay off something planted early are almost always stronger and are far easier to reflect on." },
    { fact: "Deliberate imitation of a studied writer is a legitimate Module C strategy.",
      why: "Borrowing Woolf's sentence rhythm or Orwell's plainness is craft, provided the reflection names the debt. Unacknowledged imitation reads as pastiche." }
  ],

  characters: [
    { name: "The persona", role: "constructed voice",
      note: "Not you. Deciding how much the narrator knows, and how much they will admit, is the first craft decision in any piece.",
      concepts: ["voice","persona","craft"] },
    { name: "The implied reader", role: "audience",
      note: "Every piece assumes someone. A discursive essay that assumes a hostile reader argues differently from one that assumes a curious one.",
      concepts: ["audience","persuasion","craft"] }
  ],

  structure: [
    { feature: "Discursive movement", detail: "An idea approached from several positions, often via anecdote, digression and qualification.",
      why: "The structure is exploratory rather than cumulative. Signposting like 'firstly' actively damages it — the joins should feel like thinking, not like an outline." },
    { feature: "Persuasive architecture", detail: "Position, strongest ground, concession, refutation, return.",
      why: "The concession is what separates persuasion from assertion. Naming the best version of the other side and answering it is the move that buys credibility." },
    { feature: "Imaginative shape", detail: "A situation, a pressure, a change, and something planted early that pays off late.",
      why: "It is not the same as plot. A short piece rarely has room for events, so the change is usually in what the narrator can now see." },
    { feature: "The reflection statement", detail: "What you chose, why, what it was modelled on, and what you cut.",
      why: "'What I cut' is the most under-used sentence in reflections and the most convincing: it proves the choices were choices." },
    { feature: "In medias res opening", detail: "Begin after the beginning.",
      why: "It forces the reader to reconstruct, which is engagement. It also saves the two hundred words of setup that most student pieces spend on arriving somewhere." },
    { feature: "Circular closure", detail: "Return to the opening image with the meaning changed.",
      why: "The most reliable ending available in 800 words, because the reader supplies the significance themselves and it feels earned rather than announced." },
    { feature: "Withheld information", detail: "Let the reader know something before the narrator does, or after.",
      why: "Both gaps generate meaning. Dramatic irony and delayed revelation are the same technique aimed in opposite directions." }
  ],

  /* Model sentences: one move each, written for this app. `speaker` names them as
     models so nothing here can be mistaken for a published quotation. */
  quotes: [
    { id:"craft-q01", text:"The kettle clicked off and nobody moved to make the tea.",
      locus:"model sentence — imaginative opening", speaker:"model sentence", mark:"nobody moved",
      techniques:["in-medias-res","understatement","domestic-imagery","short-sentence"],
      effect:"The tension is entirely in the negative. Nothing is described except an absence of action, which makes the reader supply the argument that has just finished.",
      concepts:["voice","craft","tension"] },

    { id:"craft-q02", text:"He was, and I want to be precise about this, a coward.",
      locus:"model sentence — persuasive", speaker:"model sentence", mark:"and I want to be precise about this",
      techniques:["parenthesis","delayed-predicate","direct-address","understatement"],
      effect:"The interruption postpones the noun and makes the reader wait for it. Claiming precision immediately before a blunt word is what stops the word reading as abuse.",
      concepts:["persuasion","voice","craft"] },

    { id:"craft-q03", text:"I have three arguments and I no longer believe the first one.",
      locus:"model sentence — discursive opening", speaker:"model sentence", mark:"I no longer believe the first one",
      techniques:["antithesis","first-person","paradox","epanorthosis"],
      effect:"A discursive opening that announces movement rather than a thesis. Admitting a position has already shifted invites the reader to watch the thinking instead of auditing the conclusion.",
      concepts:["craft","voice","persuasion"] },

    { id:"craft-q04", text:"The bus was late. The bus was always late. The bus was, in a sense, the only thing I could rely on.",
      locus:"model sentence — rhythm", speaker:"model sentence", mark:"the only thing I could rely on",
      techniques:["anaphora","tricolon","paradox","sentence-length-variation","irony"],
      effect:"Three sentences of increasing length on one subject. The repetition sets a rhythm precisely so the third can break it, and the joke lands on the extra clause.",
      concepts:["craft","rhythm","voice"] },

    { id:"craft-q05", text:"She counted the exits. That was the kind of house it was.",
      locus:"model sentence — voice by selection", speaker:"model sentence", mark:"counted the exits",
      techniques:["concrete-detail","short-sentence","juxtaposition"],
      effect:"Nothing is stated about her history and everything is available. What a narrator notices is characterisation, and the second sentence trusts the reader to have already understood.",
      concepts:["voice","craft","tension"] },

    { id:"craft-q06", text:"It is not that the town was quiet; it is that the quiet had a direction.",
      locus:"model sentence — correction structure", speaker:"model sentence", mark:"the quiet had a direction",
      techniques:["antithesis","semicolon","epanorthosis","personification","paradox"],
      effect:"The 'not that… but that' frame refuses the obvious description in order to earn a stranger one. Correction is the cheapest way to make an odd image feel chosen.",
      concepts:["craft","voice","tension"] },

    { id:"craft-q07", text:"I could describe the funeral. I would rather describe the car park.",
      locus:"model sentence — displacement", speaker:"model sentence", mark:"I would rather describe the car park",
      techniques:["praeteritio","antithesis","short-sentence","understatement","first-person"],
      effect:"Naming what you are declining to write is a real figure with a Latin name. The refusal does the emotional work that the description would have overplayed.",
      concepts:["craft","voice","persuasion"] },

    { id:"craft-q08", text:"Every generation is told it reads less than the last, and every generation is told this by someone holding a book.",
      locus:"model sentence — persuasive concession", speaker:"model sentence", mark:"by someone holding a book",
      techniques:["antithesis","parallelism","irony","concession","repetition"],
      effect:"The parallel structure sets up an expectation of agreement and then reverses on the final phrase. Persuasion that concedes its opponent's form is harder to dismiss.",
      concepts:["persuasion","craft","irony"] },

    { id:"craft-q09", text:"The photograph is undated, which is the only thing about it I am sure of.",
      locus:"model sentence — imaginative", speaker:"model sentence", mark:"the only thing about it I am sure of",
      techniques:["paradox","understatement","first-person","irony"],
      effect:"Certainty attached to an absence. The sentence establishes an unreliable memory without once using the word 'remember'.",
      concepts:["voice","craft","memory"] },

    { id:"craft-q10", text:"Then, nothing. Then the noise of somebody deciding not to knock.",
      locus:"model sentence — tension", speaker:"model sentence", mark:"deciding not to knock",
      techniques:["sentence-fragment","ellipsis","auditory-imagery","concrete-detail","anaphora"],
      effect:"A sound is given a motive, which is impossible and immediately convincing. Fragments are usable when the missing verb is the point.",
      concepts:["tension","craft","voice"] },

    { id:"craft-q11", text:"My grandfather kept every receipt. I have come to think of this as a form of argument.",
      locus:"model sentence — discursive turn", speaker:"model sentence", mark:"a form of argument",
      techniques:["anecdote","juxtaposition","nominalisation"],
      effect:"A concrete detail is promoted to an idea in the second sentence. This anecdote-to-abstraction hinge is the discursive form's main engine.",
      concepts:["craft","persuasion","voice"] },

    { id:"craft-q12", text:"Good writing is not honest. It is specific, and we mistake the one for the other.",
      locus:"model sentence — reflection register", speaker:"model sentence", mark:"we mistake the one for the other",
      techniques:["antithesis","aphorism","short-sentence","inclusive-language"],
      effect:"A reflection statement can carry a claim as long as it earns it. The plural 'we' includes the marker in the error, which is more persuasive than accusing them of it.",
      concepts:["craft","persuasion","voice"] },

    { id:"craft-q13", text:"Never use a long word where a short one will do.",
      locus:"George Orwell, 'Politics and the English Language' (1946)", speaker:"George Orwell", mark:"where a short one will do",
      techniques:["imperative","aphorism","monosyllables","parallelism"],
      effect:"The rule is written in the register it recommends: fourteen words, one of them over five letters. Orwell's rules are demonstrations, which is why they are quotable.",
      concepts:["craft","persuasion","language"] },

    { id:"craft-q14", text:"If it is possible to cut a word out, always cut it out.",
      locus:"George Orwell, 'Politics and the English Language' (1946)", speaker:"George Orwell", mark:"always cut it out",
      techniques:["conditional","imperative","aphorism","repetition"],
      effect:"Worth setting against his own sentence, which contains 'it is possible to' — a phrase the rule would cut. Rules about prose are more useful as pressure than as law, and reflections that say so read as thinking.",
      concepts:["craft","language","persuasion"] },

    { id:"craft-q15", text:"A scrupulous writer, in every sentence that he writes, will ask himself at least four questions.",
      locus:"George Orwell, 'Politics and the English Language' (1946)", speaker:"George Orwell", mark:"at least four questions",
      techniques:["periodic-sentence","parenthesis","concrete-detail","modality"],
      effect:"The parenthesis delays the verb so the sentence enacts the scruple it describes. Specific numbers make a general claim feel audited.",
      concepts:["craft","language","persuasion"] },

    { id:"craft-q16", text:"The unexamined life is not worth living.",
      locus:"Plato, Apology (trans., c. 399 BC)", speaker:"Socrates (Plato)", mark:"unexamined",
      techniques:["aphorism","litotes","negation","allusion"],
      effect:"The double negative is what makes it survive translation: 'not worth living' is a weaker claim than 'worthless' and therefore harder to argue with. Useful as a discursive stimulus precisely because it overreaches.",
      concepts:["craft","persuasion","knowledge"] }
  ]
};
