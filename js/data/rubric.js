/* Band descriptors and rubric verbs — the text-agnostic core, part two.
   ============================================================================
   Two things students lose marks for that have nothing to do with their texts:

     1. Not answering the VERB. A question that says "evaluate" and gets an answer
        that explains is off-task no matter how good the explanation is.
     2. Not knowing what separates one band from the next, so "write better" is the
        only feedback available.

   Both are drillable, and both are text-agnostic — which is why this file is worth
   building before the question banks.

   Band descriptors are paraphrased in plain language, with the official emphasis
   noted. They are a teaching tool, not a substitute for the marking guidelines your
   teacher works from.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

/* ── the five rubric descriptors the Marking Desk ticks against ──
   Deliberately five, deliberately independent, and each one either present or not.
   That is what makes the Marking Desk exactly markable: the band is a judgement with
   a tolerance, but the ticks are a set comparison. */
EN.DATA.descriptors = [
  { id:"thesis",    name:"Thesis / position", icon:"🎯",
    short:"Takes a position and sustains it",
    test:"Is there a claim that could be disagreed with, and does the paragraph keep serving it?",
    absent:"Describes the text without arguing anything about it." },
  { id:"evidence",  name:"Evidence", icon:"❝",
    short:"Integrates quotation accurately",
    test:"Are the quotations short, accurate, and grammatically part of the sentence?",
    absent:"No quotation, or a quotation dropped in as its own sentence with no frame." },
  { id:"technique", name:"Technique", icon:"🔍",
    short:"Names the technique doing the work",
    test:"Is the named technique actually the one producing the effect discussed?",
    absent:"No technique named, or a technique named that isn't in the quote." },
  { id:"analysis",  name:"Analysis", icon:"⚙️",
    short:"Explains HOW the technique produces the effect",
    test:"Does a sentence explain the mechanism, rather than restating what happens?",
    absent:"Retells the plot, or asserts an effect without showing how the language causes it." },
  { id:"concept",   name:"Conceptual link", icon:"🔗",
    short:"Connects back to the module concept",
    test:"Does the paragraph return to what the module actually asks about?",
    absent:"Analyses the language and never says why it matters to the question." }
];

/* ── band descriptors, per module ────────────────────────────────
   `mine` is the plain-language version — the one a student can actually use while
   marking. `nesa` gestures at the official emphasis. */
EN.DATA.bands = [
  { band:6, name:"Band 6", cls:"b6", cut:"Sustained, insightful, and it argues something",
    mine:"Has a real idea about the text and proves it. The technique analysis serves the argument rather than sitting beside it, and the conceptual line runs through every sentence.",
    nesa:"Demonstrates a sophisticated, sustained and insightful understanding, with skilful and effective use of textual evidence and highly developed expression.",
    tells:["An argument you could disagree with","Analysis that explains a mechanism","Concept threaded, not appended","Quotations short and integrated"] },
  { band:5, name:"Band 5", cls:"b5", cut:"Strong analysis, thinner throughline",
    mine:"Everything works locally — the technique is right, the analysis is real — but the conceptual line goes slack, usually because the link sentence is missing or generic.",
    nesa:"Demonstrates a thorough understanding, with effective use of textual evidence and well-developed expression.",
    tells:["Real analysis of language","Concept stated but not developed","Link sentence missing or formulaic"] },
  { band:4, name:"Band 4", cls:"b4", cut:"Identifies, then describes instead of analysing",
    mine:"Names the technique and quotes accurately, then the sentence after the quote retells what happens rather than explaining how it works. The commonest paragraph in the state.",
    nesa:"Demonstrates a sound understanding, with appropriate use of textual evidence and clear expression.",
    tells:["Technique correctly named","Quotation accurate","Effect described as plot, not mechanism"] },
  { band:3, name:"Band 3", cls:"b3", cut:"Quotes, but no technical vocabulary",
    mine:"The evidence is there and the reading is not wrong, but nothing is named, so there is no analysis to build on — only paraphrase with quotation marks in it.",
    nesa:"Demonstrates some understanding, with some use of textual evidence and generally clear expression.",
    tells:["Quotation present","No technique named","Reading essentially paraphrase"] },
  { band:2, name:"Band 2", cls:"b2", cut:"Retells the story",
    mine:"Narrates what happens. No textual evidence, or evidence used as illustration of events rather than as something to analyse.",
    nesa:"Demonstrates a limited understanding, with limited use of textual evidence.",
    tells:["Narrative recount","No or decorative evidence","No technique, no concept"] }
];

/* ── rubric verbs ────────────────────────────────────────────────
   The thing strong students most often lose marks to: answering a different question
   from the one asked, very well. `offTask` is what a good response to the WRONG verb
   looks like, which is the shape of the actual mistake. */
EN.DATA.rubricVerbs = [
  { id:"analyse", verb:"Analyse", alts:["analyze"],
    demands:"Identify components and show how they relate and function.",
    needs:["mechanism","parts and their relationship"],
    doing:"Break the thing open and show how the pieces make the effect.",
    offTask:"A summary of what the text is about, or a judgement of whether it succeeds.",
    tell:"If you haven't used a 'because' or a 'so that', you probably haven't analysed." },
  { id:"evaluate", verb:"Evaluate", alts:["assess"],
    demands:"Make a judgement of value, quality or extent, against criteria.",
    needs:["judgement","criteria","evidence for both sides"],
    doing:"Decide how well or how far, and say what you decided against.",
    offTask:"Thorough analysis with no judgement at the end. Very common and very costly.",
    tell:"The word 'effective' or 'successful' should appear, and be justified." },
  { id:"explore", verb:"Explore", alts:["investigate"],
    demands:"Examine a range of possibilities without necessarily resolving.",
    needs:["more than one reading","genuine consideration of each"],
    doing:"Hold two or three readings open and test them against the text.",
    offTask:"A single thesis defended hard — that answers 'argue', not 'explore'.",
    tell:"If you never write 'alternatively' or 'read another way', you're not exploring." },
  { id:"discuss", verb:"Discuss", alts:[],
    demands:"Identify issues and provide points for and against.",
    needs:["at least two positions","a resolution or a stated tension"],
    doing:"Put both sides on the table, then say where you land.",
    offTask:"An essay that only argues one side and never acknowledges the other.",
    tell:"The counter-position needs its best version, not a straw man." },
  { id:"to-what-extent", verb:"To what extent", alts:["how far","in what ways"],
    demands:"Judge the degree to which a proposition holds.",
    needs:["a degree, not a yes/no","the part that does NOT hold"],
    doing:"Answer with a quantity: largely, only partly, only in the first half.",
    offTask:"Agreeing completely with the statement in the question.",
    tell:"If your answer would be identical to 'Discuss', you have ignored 'extent'." },
  { id:"assess", verb:"Assess", alts:["appraise"],
    demands:"Make a judgement of value or significance.",
    needs:["judgement","significance stated"],
    doing:"Weigh it and say what it amounts to.",
    offTask:"Description of the feature without saying whether it matters.",
    tell:"Near-identical to Evaluate; both need a verdict." },
  { id:"explain", verb:"Explain", alts:["account for"],
    demands:"Relate cause and effect; make the relationships evident.",
    needs:["causal link","the how or the why"],
    doing:"Say why this produces that.",
    offTask:"Listing features without connecting them to anything.",
    tell:"Lower-order than analyse. If a question says explain, you need not evaluate." },
  { id:"compare", verb:"Compare", alts:["contrast","compare and contrast"],
    demands:"Show how things are similar and different.",
    needs:["both texts in the same paragraph","a shared point of comparison"],
    doing:"Put them against each other on one axis at a time.",
    offTask:"Two separate essays stapled together — the standard Module A failure.",
    tell:"If a paragraph mentions only one text, it isn't comparing." },
  { id:"justify", verb:"Justify", alts:["support"],
    demands:"Support an argument or conclusion with evidence.",
    needs:["a position already taken","evidence chosen for it"],
    doing:"Show your working for a claim you have already made.",
    offTask:"Making a new claim instead of defending the one asked about.",
    tell:"Usually appears after a statement you are asked to agree or disagree with." },
  { id:"evaluate-how", verb:"Evaluate how", alts:["assess how"],
    demands:"Judge the effectiveness of a method, not just identify it.",
    needs:["the method","its effectiveness","a criterion"],
    doing:"Say what the writer did, then how well it worked and by what standard.",
    offTask:"Explaining how it works and stopping — which answers 'analyse how'.",
    tell:"The most-missed compound verb in HSC English. Two jobs, both required." },
  { id:"how-does", verb:"How does…", alts:["in what ways does"],
    demands:"Identify the means and demonstrate their operation.",
    needs:["specific techniques","their operation on a reader"],
    doing:"Name the means and show it working.",
    offTask:"Answering 'what' — telling the marker the theme instead of the method.",
    tell:"Every paragraph should name a technique and follow it with an effect." },
  { id:"why-has", verb:"Why has this text been valued", alts:["why does this text endure","textual integrity"],
    demands:"Account for a text's continued significance, usually via its construction.",
    needs:["textual integrity","the reader's position","a reason grounded in the text"],
    doing:"Argue from how it is built to why it lasts.",
    offTask:"Praise. 'It is a timeless classic' says nothing about the text.",
    tell:"Module B's signature question. The answer has to be structural." }
];

/* The Band Grid mode pairs descriptors against bands; these are the cells it uses.
   Authored as statements that belong to exactly ONE band, so the grid has a
   determinate answer (§9.6). */
EN.DATA.bandStatements = [
  { text:"Retells the events of the scene with no quotation.", band:2 },
  { text:"Uses a quotation as its own free-standing sentence.", band:3 },
  { text:"Names a technique and then describes what happens next in the plot.", band:4 },
  { text:"Explains how the syntax positions the reader, then links to the module concept.", band:6 },
  { text:"Analyses language convincingly but never returns to the question.", band:5 },
  { text:"Summarises the composer's life instead of the text.", band:2 },
  { text:"Quotes accurately but describes the quotation rather than analysing it.", band:3 },
  { text:"Identifies a paradox and explains what it does to the reader's sense of agency.", band:6 },
  { text:"Correct technique, accurate quote, effect asserted but not demonstrated.", band:4 },
  { text:"Sustains one conceptual argument across every sentence of the paragraph.", band:6 },
  { text:"Mentions the module concept once, in the last sentence, without developing it.", band:5 },
  { text:"Lists three techniques in one sentence with no analysis of any.", band:4 },
  { text:"Uses no textual evidence at all.", band:2 },
  { text:"Paraphrases the quotation immediately after quoting it.", band:3 },
  { text:"Integrates a three-word quotation grammatically into its own sentence.", band:6 },
  { text:"Strong technique analysis; the conceptual link sentence has been dropped.", band:5 },
  { text:"Writes about the film without referring to any filmic technique.", band:3 },
  { text:"Judges the effectiveness of the technique against a stated criterion.", band:6 },
  { text:"Answers the question that was expected rather than the one asked.", band:4 },
  { text:"Narrates the composer's plot as though the marker has not read it.", band:2 }
];
