/* THE MARKING DESK'S SAMPLE PARAGRAPHS.
   ============================================================================
   Authored by CONTROLLED DEGRADATION (§6.2), which is the English form of the
   reference app's most important content rule: produce the answer first, then derive
   the question from it. In chemistry that meant picking the titre before the
   concentrations. Here it means writing the Band 6 carefully and then breaking it in
   exactly one specified way per lower sample.

     Band 6 exemplar (written first)
       → Band 5: keep the analysis, drop the conceptual link
       → Band 4: keep the technique, replace analysis with plot description
       → Band 3: keep the quote, drop technique naming entirely
       → Band 2: retell the narrative, no textual evidence

   Three things this buys. Five samples from one authoring effort. Band differences
   that are pedagogically legible rather than vibes. And the `why` writes itself,
   because you know exactly what you removed.

   `broke` lists the descriptor ids that flip to false at this step. validate.js
   asserts that each sample's `descriptors` map differs from its parent's in EXACTLY
   those ways — which catches the sample that quietly drifted two bands while nobody
   was looking.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

/* Wrapped in an IIFE because a top-level `const` in a classic script lives in the
   shared global lexical scope — a second data file declaring `D` would be a
   redeclaration SyntaxError, and it would fail at parse time in every browser. */
(function () {
const D = (thesis, evidence, technique, analysis, concept) =>
  ({ thesis, evidence, technique, analysis, concept });

EN.DATA.paragraphs = [

  /* ═══ family 1 — 1984, the Party slogans ═══════════════════ */
  { id:"p-cm1-b6", module:"common", text:"1984", band:6,
    descriptors: D(true, true, true, true, true),
    para:"Orwell's Party slogans do not persuade; they foreclose. 'FREEDOM IS SLAVERY' asserts an identity through the bare copula 'is', a construction that admits no degree and therefore leaves the reader nothing to negotiate with — a comparative or a conditional would concede that the claim could be weighed. The slogan is unanswerable rather than convincing, and this distinction matters to the Common Module's interest in collective experience: Orwell is not describing a population that has been argued into belief but one that has been supplied with sentences it cannot think against. The grammar, not the ideology, is what does the work, which is why doublethink can be a capacity rather than a delusion.",
    why:"Takes a position ('do not persuade; they foreclose'), quotes minimally and integrates it, names the grammatical feature precisely, explains the mechanism by contrast with what a comparative would do, and returns to collective experience with a claim the paragraph has actually earned." },

  { id:"p-cm1-b5", module:"common", text:"1984", band:5, derivedFrom:"p-cm1-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"Orwell's Party slogans do not persuade; they foreclose. 'FREEDOM IS SLAVERY' asserts an identity through the bare copula 'is', a construction that admits no degree and therefore leaves the reader nothing to negotiate with — a comparative or a conditional would concede that the claim could be weighed. The slogan is unanswerable rather than convincing. The grammar, not the ideology, is what does the work, and this is characteristic of the way the Party's language operates throughout the novel.",
    why:"The analysis is intact and genuinely good — the point about the copula survives in full. What has gone is the conceptual return: the paragraph never says why any of this matters to human experience, so the last sentence generalises about the novel instead of answering the question." },

  { id:"p-cm1-b4", module:"common", text:"1984", band:4, derivedFrom:"p-cm1-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"Orwell's Party slogans do not persuade; they foreclose. 'FREEDOM IS SLAVERY' uses a paradox, placing two opposite ideas together. The slogans appear on the side of the Ministry of Truth, and Winston sees them every day on his way to work, where he spends his time rewriting old newspaper articles. Later in the novel he is arrested and taken to the Ministry of Love. The paradox shows how controlling the Party is.",
    why:"The technique is correctly named and the quotation is accurate, but the sentence after the quote retells what happens rather than explaining how the paradox works on a reader. 'Shows how controlling the Party is' asserts an effect without demonstrating one. This is the commonest paragraph in the state." },

  { id:"p-cm1-b3", module:"common", text:"1984", band:3, derivedFrom:"p-cm1-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"Orwell's Party slogans are an important part of the novel. One of them says 'FREEDOM IS SLAVERY', which does not really make sense because freedom and slavery are opposites. The slogans appear on the Ministry of Truth building, and Winston sees them every day on his way to work rewriting old newspaper articles. Later he is arrested. This shows the Party is in control of everything.",
    why:"The quotation is still accurate and the reading is not wrong, but nothing is named. Without a technique there is nothing for an analytical sentence to be about, so 'does not really make sense' is as far as the paragraph can get — paraphrase with quotation marks in it." },

  { id:"p-cm1-b2", module:"common", text:"1984", band:2, derivedFrom:"p-cm1-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"In Nineteen Eighty-Four the Party has slogans that they put up everywhere so people will believe them. Winston works at the Ministry of Truth changing old newspapers so the Party is always right. He starts a diary and meets Julia and they rent a room from Mr Charrington. Then they get arrested and taken to Room 101 where Winston betrays Julia and ends up loving Big Brother.",
    why:"A plot summary. No quotation, nothing named, and no claim that could be argued with — the marker has read the novel, which is the thing this kind of paragraph never accounts for." },

  /* ═══ family 2 — 1984, chiasmus and the past ═══════════════ */
  { id:"p-cm2-b6", module:"common", text:"1984", band:6,
    descriptors: D(true, true, true, true, true),
    para:"The novel locates the Party's power not in force but in the impossibility of standing outside its account of the past. 'Who controls the past controls the future: who controls the present controls the past' is chiastic — the terms invert across the colon so that each occupies both positions — and the effect is a sentence with no exterior. There is no vantage point from which its claim could be checked, because every position the reader might occupy has already been named inside it. That formal closure is Orwell's argument about individual experience under totalitarianism: Winston's rebellion fails not for want of courage but because the epistemological ground a rebel would need to stand on has been enclosed.",
    why:"An arguable position, a short integrated quotation, the technique named exactly, a mechanism explained (the inversion produces closure), and a conceptual return that reinterprets Winston's failure rather than merely mentioning the module." },

  { id:"p-cm2-b5", module:"common", text:"1984", band:5, derivedFrom:"p-cm2-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"The novel locates the Party's power not in force but in the impossibility of standing outside its account of the past. 'Who controls the past controls the future: who controls the present controls the past' is chiastic — the terms invert across the colon so that each occupies both positions — and the effect is a sentence with no exterior. There is no vantage point from which its claim could be checked, because every position the reader might occupy has already been named inside it. Orwell uses this technique to great effect in the novel.",
    why:"Everything local is working: the chiasmus is correctly identified and the closure argument is genuinely explained. The paragraph then stops instead of turning, and 'to great effect' is the sound of a link sentence that was never written." },

  { id:"p-cm2-b4", module:"common", text:"1984", band:4, derivedFrom:"p-cm2-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"The novel locates the Party's power in its control of the past. 'Who controls the past controls the future: who controls the present controls the past' is an example of chiasmus, where the words are reversed. This is a Party slogan that Winston thinks about while he is at work in the Records Department, where his job is to correct old newspapers so that the Party's predictions always turn out to be true. He does this every day and is good at it. The chiasmus emphasises the Party's control.",
    why:"Chiasmus is named and the definition is right. Then the paragraph describes Winston's job instead of the sentence's structure, and closes on 'emphasises', which names no effect at all — the single commonest empty verb in HSC English." },

  { id:"p-cm2-b3", module:"common", text:"1984", band:3, derivedFrom:"p-cm2-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"The novel shows that the Party controls the past. One of their slogans is 'Who controls the past controls the future: who controls the present controls the past', which means that whoever is in charge now can decide what happened before. Winston works in the Records Department correcting old newspapers so the Party is always right. He is good at his job even though he does not agree with it. This shows how much power the Party has.",
    why:"Accurate quotation, correct paraphrase, no technique. The sentence beginning 'which means' is a gloss rather than an analysis, and there is nothing named for the paragraph to build an argument on." },

  { id:"p-cm2-b2", module:"common", text:"1984", band:2, derivedFrom:"p-cm2-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"Winston Smith works for the Ministry of Truth in Airstrip One. His job is to change records of the past so that the Party is never wrong about anything. The Party has slogans about controlling the past and the future. Winston does not believe in the Party and writes about it in a secret diary, which is against the law because of the thought police and the telescreens in every room.",
    why:"Narrative recount with no quotation and no claim. The slogans are mentioned rather than quoted, which means there is no evidence on the page for anything to be argued from." },

  /* ═══ family 3 — 1984, free indirect discourse ═════════════ */
  { id:"p-cm3-b6", module:"common", text:"1984", band:6,
    descriptors: D(true, true, true, true, true),
    para:"Orwell's most disquieting technique is his refusal to separate Winston's relief from the reader's horror. 'But it was all right, everything was all right' is free indirect discourse: the sentence carries Winston's idiom without quotation marks and without a narrator to adjudicate, so consolation and catastrophe occupy the same clause. Direct speech would have let the reader dismiss the words as his; a narratorial verdict would have told them what to think. Neither is available, and the reader is left holding both readings at once. This is the novel's fullest account of what the Party does to an individual experience: not the removal of a self but the substitution of one, delivered in a grammar that gives the reader nowhere to object from.",
    why:"Position, integrated quotation, technique named precisely, and a mechanism argued by elimination — the paragraph explains what free indirect discourse does by naming what the two alternatives would have done. The conceptual return reinterprets the module concept rather than restating it." },

  { id:"p-cm3-b5", module:"common", text:"1984", band:5, derivedFrom:"p-cm3-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"Orwell's most disquieting technique is his refusal to separate Winston's relief from the reader's horror. 'But it was all right, everything was all right' is free indirect discourse: the sentence carries Winston's idiom without quotation marks and without a narrator to adjudicate, so consolation and catastrophe occupy the same clause. Direct speech would have let the reader dismiss the words as his; a narratorial verdict would have told them what to think. Neither is available, and the reader is left holding both readings at once. This is a very effective use of narrative voice.",
    why:"The analysis by elimination is intact and is genuinely Band 6 work. The paragraph then evaluates its own example instead of connecting it to human experience, and 'very effective' is the vacancy where the conceptual sentence should be." },

  { id:"p-cm3-b4", module:"common", text:"1984", band:4, derivedFrom:"p-cm3-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"Orwell does not separate Winston's feelings from the reader's. 'But it was all right, everything was all right' is free indirect discourse, where the narrator uses the character's own words. At this point Winston is sitting in the Chestnut Tree Café drinking Victory Gin after being released from the Ministry of Love. He has already met Julia again and they have both admitted betraying each other. Soon after this he sees the news from the front and is shot. The free indirect discourse makes the reader feel close to Winston.",
    why:"Free indirect discourse is correctly named and defined. What follows is the plot of Part 3 Chapter 6, and 'makes the reader feel close' would be true of any first-person narration — so the technique is identified and never analysed." },

  { id:"p-cm3-b3", module:"common", text:"1984", band:3, derivedFrom:"p-cm3-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"Orwell shows how Winston has changed by the end of the novel. He thinks 'But it was all right, everything was all right', even though nothing is all right and he has been tortured and has betrayed Julia. At this point he is in the Chestnut Tree Café drinking gin after being released. Soon after this he sees the news from the front and imagines being shot. This shows the Party has won.",
    why:"The irony is noticed and the quotation is accurate, but nothing is named, so the paragraph cannot get past 'even though nothing is all right' — a correct observation with no analytical apparatus underneath it." },

  { id:"p-cm3-b2", module:"common", text:"1984", band:2, derivedFrom:"p-cm3-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"At the end of Nineteen Eighty-Four Winston has been broken by O'Brien in the Ministry of Love. He was taken to Room 101 where there were rats in a cage, and he told them to do it to Julia instead of him. After he is released he meets Julia in the park and they both say they betrayed each other. At the end he sits in the café and loves Big Brother.",
    why:"Retells Part 3 with no quotation and no argument. Everything asserted is accurate, which is exactly the problem — accuracy about plot is not what the module assesses." },

  /* ═══ family 4 — 1984, the Appendix ═══════════════════════ */
  { id:"p-cm4-b6", module:"common", text:"1984", band:6,
    descriptors: D(true, true, true, true, true),
    para:"The novel's structure contradicts its ending. 'The Principles of Newspeak' is a paratext — placed after the narrative, written in expository prose, and crucially in the past tense: Newspeak 'was designed not to extend but to diminish the range of thought'. A past tense requires a speaker for whom the project is finished and a regime that can be studied at leisure, neither of which can exist if the world of Part 3 persists. Orwell therefore stages a formal disagreement between his last two components, and the hope is carried entirely by a verb. That the novel's bleakest page and its only optimistic one are the same page is its most sophisticated statement about collective human experience: regimes that claim permanence are describing an ambition, not a fact.",
    why:"An arguable structural thesis, a precisely named paratext, a short integrated quotation, and a mechanism that turns on one grammatical feature. The conceptual return arrives at a general claim the paragraph has proved rather than asserted." },

  { id:"p-cm4-b5", module:"common", text:"1984", band:5, derivedFrom:"p-cm4-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"The novel's structure contradicts its ending. 'The Principles of Newspeak' is a paratext — placed after the narrative, written in expository prose, and crucially in the past tense: Newspeak 'was designed not to extend but to diminish the range of thought'. A past tense requires a speaker for whom the project is finished and a regime that can be studied at leisure, neither of which can exist if the world of Part 3 persists. Orwell therefore stages a formal disagreement between his last two components, and the hope is carried entirely by a verb. It is a clever piece of structural writing.",
    why:"The whole tense argument survives and it is the hardest part to get right. The paragraph then compliments Orwell instead of returning to the module, and a Band 6 insight ends up serving nothing." },

  { id:"p-cm4-b4", module:"common", text:"1984", band:4, derivedFrom:"p-cm4-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"The novel's structure is important to its meaning. 'The Principles of Newspeak' is a paratext, which means writing that sits outside the main story. It explains how Newspeak works, including the A, B and C vocabularies and how words like 'ungood' replace 'bad'. It says Newspeak 'was designed not to extend but to diminish the range of thought'. Winston's friend Syme works on the Eleventh Edition of the Newspeak Dictionary before he is vaporised. The Appendix gives the reader more information about the Party.",
    why:"'Paratext' is correctly named and defined and the quotation is accurate. Then the paragraph summarises the Appendix's contents and Syme's fate instead of noticing the tense — so the one feature that carries the meaning is quoted and walked past." },

  { id:"p-cm4-b3", module:"common", text:"1984", band:3, derivedFrom:"p-cm4-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"The end of the novel is important to its meaning. There is a section at the back called 'The Principles of Newspeak' which explains the Party's language. It says Newspeak 'was designed not to extend but to diminish the range of thought', which means the Party wanted people to think less. It talks about the A, B and C vocabularies and words like 'ungood'. Winston's friend Syme works on the dictionary before he is vaporised. This gives the reader more information about the Party.",
    why:"Accurate quotation, correct gloss, nothing named — 'a section at the back' is a description of a page number rather than of a formal feature, so the argument has no purchase." },

  { id:"p-cm4-b2", module:"common", text:"1984", band:2, derivedFrom:"p-cm4-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"Newspeak is the language the Party invents in Nineteen Eighty-Four. It gets rid of words so people cannot express certain ideas, so instead of 'bad' you say 'ungood'. Syme works on the dictionary and tells Winston about it in the canteen, and then Syme disappears because he was too clever. At the end of the book there is a section explaining all the rules of Newspeak in detail.",
    why:"Recount of the Newspeak material with no quotation. The Appendix is mentioned as an object rather than analysed as a structural decision, and there is no claim to disagree with." },

  /* ═══ family 5 — Donne, the compass conceit ═══════════════ */
  { id:"p-ma1-b6", module:"moduleA", text:"donne", band:6,
    descriptors: D(true, true, true, true, true),
    para:"Donne's conceits are proofs rather than pictures, and 'A Valediction' is the clearest case. The compass arrives as a concession — 'If they be two, they are two so / As stiff twin compasses are two' — so the figure is not illustrating union but defending it against the fact of separation. What follows is geometrical argument: the fixed foot 'makes no show / To move, but doth', and the poem closes on 'makes me end where I begun', a line whose own circularity completes the shape it describes. The consolation offered is therefore formal rather than evidential, and this is precisely what W;t tests. Vivian Bearing inherits the technique and not the belief, and a proof whose warrant is its own elegance is exactly what collapses in a hospital.",
    why:"A position about the whole class of technique, three short integrated quotations, the conceit named and correctly distinguished from a simile, a mechanism that reads the concession and the closure, and a Module A turn that puts both texts in one paragraph on a shared axis." },

  { id:"p-ma1-b5", module:"moduleA", text:"donne", band:5, derivedFrom:"p-ma1-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"Donne's conceits are proofs rather than pictures, and 'A Valediction' is the clearest case. The compass arrives as a concession — 'If they be two, they are two so / As stiff twin compasses are two' — so the figure is not illustrating union but defending it against the fact of separation. What follows is geometrical argument: the fixed foot 'makes no show / To move, but doth', and the poem closes on 'makes me end where I begun', a line whose own circularity completes the shape it describes. The consolation offered is therefore formal rather than evidential. This is typical of Donne's metaphysical style.",
    why:"The conceit-as-proof analysis is sustained and accurate. But this is Module A, and a paragraph that never mentions W;t cannot be comparing — the paragraph has become a very good Module B answer to a Module A question." },

  { id:"p-ma1-b4", module:"moduleA", text:"donne", band:4, derivedFrom:"p-ma1-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"Donne uses conceits in his poetry. In 'A Valediction: Forbidding Mourning' he uses the conceit of a compass: 'If they be two, they are two so / As stiff twin compasses are two'. A compass has one foot that stays still and one that moves around it to draw a circle. The speaker is about to go on a journey and is telling his lover not to be sad about it, and he compares their souls to the two feet. The conceit shows how connected they are.",
    why:"The conceit is correctly named and the quotation is accurate. Then the paragraph explains how a compass works and what the poem's situation is, and 'shows how connected they are' is a restatement of the image rather than an account of why an argument was needed." },

  { id:"p-ma1-b3", module:"moduleA", text:"donne", band:3, derivedFrom:"p-ma1-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"Donne writes about love in an unusual way. In 'A Valediction: Forbidding Mourning' he compares two lovers to a compass: 'If they be two, they are two so / As stiff twin compasses are two'. A compass has one foot that stays still and one that moves around it. The speaker is going on a journey and is telling his lover not to be sad, and he says their souls are like the two feet of the compass. This shows how connected they are.",
    why:"The quotation is accurate and the comparison is correctly described, but 'compares' is not a technique — without the word conceit and what a conceit is for, the paragraph can only paraphrase the image." },

  { id:"p-ma1-b2", module:"moduleA", text:"donne", band:2, derivedFrom:"p-ma1-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"'A Valediction: Forbidding Mourning' is a poem by John Donne about a man who is going away and does not want his lover to cry about it. He says that ordinary lovers cannot cope with being apart but they are different because their love is spiritual. He also compares them to a compass and to gold being beaten thin. Donne was a metaphysical poet who later became the Dean of St Paul's Cathedral in London.",
    why:"Paraphrase of the poem plus a biographical fact, with no quotation. The final sentence is the tell: context supplied instead of analysis is a reliable Band 2 signature." },

  /* ═══ family 6 — Donne / W;t, the punctuation crux ════════ */
  { id:"p-ma2-b6", module:"moduleA", text:"wit", band:6,
    descriptors: D(true, true, true, true, true),
    para:"Edson's title is an act of textual criticism, and it is where the pairing is most exact. Ashford's lesson turns on a caesura: 'Nothing but a breath — a comma — separates life from life everlasting', and the two dashes isolate the smallest mark in the language so that it sits alone holding apart the two largest things in the sentence. The claim is not sentimental but editorial — a semicolon walls 'Death, thou shalt die' off as a separate assertion, where a comma keeps it continuous with the breath before it — so Donne's couplet and Edson's play stake the same thing on the same mark. The resonance is therefore textual rather than thematic, which is what makes it worth more than the observation that both works concern mortality.",
    why:"A thesis about the pairing rather than either text, two integrated quotations from both, the caesura named and its typography analysed, a mechanism that explains the semicolon-versus-comma difference, and a conceptual close that distinguishes this resonance from a weak one." },

  { id:"p-ma2-b5", module:"moduleA", text:"wit", band:5, derivedFrom:"p-ma2-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"Edson's title is an act of textual criticism. Ashford's lesson turns on a caesura: 'Nothing but a breath — a comma — separates life from life everlasting', and the two dashes isolate the smallest mark in the language so that it sits alone holding apart the two largest things in the sentence. The claim is not sentimental but editorial — a semicolon walls 'Death, thou shalt die' off as a separate assertion, where a comma keeps it continuous with the breath before it. Edson clearly knows Donne's poetry very well.",
    why:"Both texts are present and the punctuation analysis is precise, which is the hard part. The paragraph then praises Edson's scholarship instead of saying what the resonance reveals — so it compares without arriving anywhere." },

  { id:"p-ma2-b4", module:"moduleA", text:"wit", band:4, derivedFrom:"p-ma2-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"The title of W;t comes from Donne's poetry. In Scene 3 Ashford says 'Nothing but a breath — a comma — separates life from life everlasting', which uses a caesura. Ashford is Vivian's supervisor and she is marking Vivian's essay on Holy Sonnet Six. She tells Vivian the punctuation in her edition is wrong and then tells her to go out with her friends, but Vivian goes to the library instead. The caesura is very significant in the play.",
    why:"The caesura is named and the quotation is accurate. What follows is the scene's events, and 'very significant' does no analytical work — the paragraph identifies the feature and then narrates around it." },

  { id:"p-ma2-b3", module:"moduleA", text:"wit", band:3, derivedFrom:"p-ma2-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"The title of W;t comes from Donne's poetry. In Scene 3 Ashford says 'Nothing but a breath — a comma — separates life from life everlasting', which means that death is not a big barrier. Ashford is Vivian's supervisor and she is marking Vivian's essay. She says the punctuation in Vivian's edition is wrong and tells her to go out with her friends, but Vivian goes to the library instead. This is why the play has a semicolon in the title.",
    why:"Accurate quotation and a reasonable gloss, but nothing named. 'Which means' introduces a paraphrase, and the connection to the title is asserted in the last sentence without any analysis to support it." },

  { id:"p-ma2-b2", module:"moduleA", text:"wit", band:2, derivedFrom:"p-ma2-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"W;t is a play by Margaret Edson about a professor called Vivian Bearing who studies John Donne's poems and gets ovarian cancer. Her supervisor Ashford appears in a flashback and tells her that her essay is not good enough because she used the wrong edition. At the end of the play Ashford visits her in hospital and reads her a children's book about a rabbit before she dies.",
    why:"Recount of two scenes with no quotation from either text. The title's semicolon, which is the whole reason this pairing exists, is not mentioned at all." },

  /* ═══ family 7 — W;t, the final stage direction ═══════════ */
  { id:"p-ma3-b6", module:"moduleA", text:"wit", band:6,
    descriptors: D(true, true, true, true, true),
    para:"Edson gives her last word to something that is not a word. The closing stage direction — 'She loosens the ties and the gown falls to the floor' — is the only voice in the play that belongs to no character, and it is silent: after two hours in which Vivian has narrated, lectured and timed her own dying, the play ends in an action she does not comment on. The direction removes cap, gown and text in sequence, and the pun that the same phrase covers academic regalia and hospital dress is the pairing's argument in two words. Set against Donne's speaker, who keeps his theatrical conceit to the final line of Holy Sonnet 6, Vivian's exit from her own scene is the dissonance: the metaphor she inherited turns out to be something you can step out of.",
    why:"A thesis about form, a quoted stage direction treated as evidence, the technique named and correctly identified as authorial rather than characterial, a mechanism built on the sequence of removals, and a Module A close that puts the two texts on one axis and names the dissonance." },

  { id:"p-ma3-b5", module:"moduleA", text:"wit", band:5, derivedFrom:"p-ma3-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"Edson gives her last word to something that is not a word. The closing stage direction — 'She loosens the ties and the gown falls to the floor' — is the only voice in the play that belongs to no character, and it is silent: after two hours in which Vivian has narrated, lectured and timed her own dying, the play ends in an action she does not comment on. The direction removes cap, gown and text in sequence, and the pun that the same phrase covers academic regalia and hospital dress is very effective. It is a powerful ending to the play.",
    why:"The formal analysis of the stage direction is genuinely strong. Donne has vanished entirely, and in Module A a paragraph on one text is not comparing — the paragraph would score well in Module B and cannot score at the top here." },

  { id:"p-ma3-b4", module:"moduleA", text:"wit", band:4, derivedFrom:"p-ma3-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"The ending of W;t is important. The final stage direction says 'She loosens the ties and the gown falls to the floor'. Before this Jason has tried to resuscitate Vivian even though she is DNR, and Susie has stopped him by shouting at him and calling the code team off. Vivian has already had eight cycles of chemotherapy and her kidneys have failed. The stage direction shows that she has died.",
    why:"The stage direction is correctly identified as a technique and quoted accurately. Everything after that is the plot of Scene 17, and 'shows that she has died' explains nothing about why Edson chose an action rather than a line." },

  { id:"p-ma3-b3", module:"moduleA", text:"wit", band:3, derivedFrom:"p-ma3-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"The ending of W;t is important. At the end it says 'She loosens the ties and the gown falls to the floor', which is when Vivian dies and leaves her body behind. Before this Jason tries to resuscitate her even though she is DNR, and Susie stops him and calls off the code team. Vivian has had eight cycles of chemotherapy and her kidneys have failed. This is a sad ending to the play.",
    why:"The quotation is accurate and its meaning is correctly understood, but it is treated as narration rather than as a stage direction — so the one thing that makes it analysable, that it is the author speaking and not a character, is invisible." },

  { id:"p-ma3-b2", module:"moduleA", text:"wit", band:2, derivedFrom:"p-ma3-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"At the end of W;t Vivian Bearing dies in the hospital. Jason comes in and finds she has no pulse so he calls a code even though she has said she wants to be DNR, and Susie runs in and shouts at him and gets the code team to stop. Then Vivian gets out of the bed and walks towards a light. She has had eight cycles of chemotherapy and it has not worked.",
    why:"Retells the final scene without quoting a word of it. The closing action is described in the student's own words, which removes the only evidence a paragraph about a stage direction could use." },

  /* ═══ family 8 — Henry IV, Hal's soliloquy ════════════════ */
  { id:"p-mb1-b6", module:"moduleB", text:"henry4", band:6,
    descriptors: D(true, true, true, true, true),
    para:"The play's design is visible in the moment Hal changes register. 'I know you all, and will awhile uphold / The unyoked humour of your idleness' is spoken in verse, immediately after a scene conducted entirely in Eastcheap prose, and the shift is the betrayal rather than a comment on it: Hal moves into a language Falstaff has no access to in order to announce that he has been watching him. Four monosyllables reclassify two hundred lines of banter as surveillance, and they do it in a form the man being surveilled cannot follow. This is textual integrity of an unusually demonstrable kind — the prose/verse boundary is audible in performance, so the play encodes its central political fact in something an audience hears before it understands.",
    why:"A structural thesis, a short integrated quotation, the technique named exactly (prose/verse shift, not simply 'soliloquy'), a mechanism that connects form to meaning, and a Module B close that argues from construction to integrity rather than asserting cohesion." },

  { id:"p-mb1-b5", module:"moduleB", text:"henry4", band:5, derivedFrom:"p-mb1-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"The play's design is visible in the moment Hal changes register. 'I know you all, and will awhile uphold / The unyoked humour of your idleness' is spoken in verse, immediately after a scene conducted entirely in Eastcheap prose, and the shift is the betrayal rather than a comment on it: Hal moves into a language Falstaff has no access to in order to announce that he has been watching him. Four monosyllables reclassify two hundred lines of banter as surveillance, and they do it in a form the man being surveilled cannot follow. Shakespeare uses prose and verse throughout the play.",
    why:"The prose/verse argument is sustained and the mechanism is properly explained. The paragraph then makes a general observation instead of returning to textual integrity — the analysis is Band 6 and it has not been pointed at the module." },

  { id:"p-mb1-b4", module:"moduleB", text:"henry4", band:4, derivedFrom:"p-mb1-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"Hal's soliloquy is important to the play. He says 'I know you all, and will awhile uphold / The unyoked humour of your idleness', which is written in verse rather than prose. This happens in Act 1 Scene 2, after Falstaff and Poins have planned the robbery at Gadshill and Hal has agreed to take part in the trick on Falstaff. Later in the play Hal fights Hotspur at Shrewsbury and kills him. The verse shows that Hal is a prince.",
    why:"The prose/verse distinction is correctly identified and the quotation is accurate. Then the paragraph summarises the Gadshill plot and Shrewsbury, and 'shows that Hal is a prince' is something the audience already knew from the cast list." },

  { id:"p-mb1-b3", module:"moduleB", text:"henry4", band:3, derivedFrom:"p-mb1-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"Hal's speech at the end of Act 1 Scene 2 is important to the play. He says 'I know you all, and will awhile uphold / The unyoked humour of your idleness', which means he is only pretending to be friends with Falstaff and the others. This happens after Falstaff and Poins have planned the robbery at Gadshill. Later Hal fights Hotspur at Shrewsbury and kills him. This shows Hal was always going to change.",
    why:"Accurate quotation and a correct reading of its content, with nothing named — not soliloquy, not the verse shift. 'Which means' is a paraphrase, and the paragraph has no technical purchase on a moment that is entirely about form." },

  { id:"p-mb1-b2", module:"moduleB", text:"henry4", band:2, derivedFrom:"p-mb1-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"In King Henry IV Part 1, Prince Hal spends his time in a tavern in Eastcheap with Falstaff and Poins instead of at court with his father. They plan a robbery at Gadshill and Hal and Poins play a trick on Falstaff by robbing him afterwards in disguise. Hal knows he will have to change eventually and become a proper prince, which he does at the battle of Shrewsbury when he kills Hotspur.",
    why:"Plot summary of the first two acts. The soliloquy is paraphrased into 'Hal knows he will have to change', which removes the only evidence and turns the play's most important formal moment into a piece of character motivation." },

  /* ═══ family 9 — Henry IV, Falstaff's catechism ═══════════ */
  { id:"p-mb2-b6", module:"moduleB", text:"henry4", band:6,
    descriptors: D(true, true, true, true, true),
    para:"Shakespeare lets the cynical case win the argument and lose the battle. Falstaff's catechism is hypophora — 'What is honour? A word' — so question and answer occupy one mouth, in the form used to teach children doctrine they cannot dispute. The instrument matters: examining an aristocratic value as catechism finds nothing behind the word, and the proof is a corpse with a date on it, 'he that died o' Wednesday', which no abstraction can answer. Nobody in the play replies. What Shakespeare does instead is stage Hotspur's death two scenes later and let both stand, and this refusal to arbitrate is the strongest available account of the play's endurance: four centuries of readers have found it endorsing military honour, mocking it, and being agnostic, which is only possible because nothing in the text settles it.",
    why:"An arguable thesis, two short integrated quotations, hypophora named and its rhetorical provenance explained, a mechanism built on the specificity of the weekday, and a Module B conclusion that accounts for enduring value structurally rather than praising the play." },

  { id:"p-mb2-b5", module:"moduleB", text:"henry4", band:5, derivedFrom:"p-mb2-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"Shakespeare lets the cynical case win the argument and lose the battle. Falstaff's catechism is hypophora — 'What is honour? A word' — so question and answer occupy one mouth, in the form used to teach children doctrine they cannot dispute. The instrument matters: examining an aristocratic value as catechism finds nothing behind the word, and the proof is a corpse with a date on it, 'he that died o' Wednesday', which no abstraction can answer. Nobody in the play replies. Falstaff is one of Shakespeare's greatest comic creations.",
    why:"The rhetorical analysis is precise and the point about the weekday is genuinely sharp. The paragraph then compliments the character rather than accounting for the play's value, so a Band 6 reading is spent on a Band 5 conclusion." },

  { id:"p-mb2-b4", module:"moduleB", text:"henry4", band:4, derivedFrom:"p-mb2-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"Falstaff does not believe in honour. In Act 5 Scene 1 he uses hypophora, asking and answering his own questions: 'What is honour? A word.' He is talking to himself on the battlefield at Shrewsbury just before the fighting starts, after Hal has told him he owes God a death. Later in the battle he pretends to be dead so he does not get killed, and then claims he killed Hotspur. The hypophora shows Falstaff is clever.",
    why:"Hypophora is correctly named and defined and the quotation is accurate. What follows is a summary of Falstaff's movements at Shrewsbury, and 'shows Falstaff is clever' asserts a quality rather than analysing an argument." },

  { id:"p-mb2-b3", module:"moduleB", text:"henry4", band:3, derivedFrom:"p-mb2-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"Falstaff does not believe in honour. In Act 5 Scene 1 he asks 'What is honour? A word' and answers his own question, saying honour is just air and does not do anybody any good. He is on the battlefield at Shrewsbury before the fighting starts, after Hal has told him he owes God a death. Later he pretends to be dead and then claims he killed Hotspur. This shows he has different values from the other characters.",
    why:"The quotation is accurate and the content is understood, but 'answers his own question' describes the technique without naming it, so the paragraph cannot say what a catechism form does that a plain assertion would not." },

  { id:"p-mb2-b2", module:"moduleB", text:"henry4", band:2, derivedFrom:"p-mb2-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"Sir John Falstaff is a knight in King Henry IV Part 1 but he is not a very good one. He is fat and old and he lies about everything, including how many men attacked him at Gadshill. He does not think honour is worth anything because you cannot use it once you are dead. At Shrewsbury he pretends to be dead so nobody kills him and afterwards he says he was the one who killed Hotspur.",
    why:"Character description with no quotation. The catechism's argument is paraphrased into 'you cannot use it once you are dead', which is accurate and leaves nothing on the page to analyse." },

  /* ═══ family 10 — Henry IV, the play extempore ════════════ */
  { id:"p-mb3-b6", module:"moduleB", text:"henry4", band:6,
    descriptors: D(true, true, true, true, true),
    para:"The play's unity is provable rather than assertable, and the play extempore is where. In 2.4 Falstaff, wearing a cushion for a crown, pleads 'Banish plump Jack, and banish all the world', and Hal answers 'I do, I will'. The metatheatre does the work: 'I do' belongs to the King inside the game and 'I will' steps outside it into the future tense, so a four-word reply changes speaker mid-sentence. A comic rehearsal therefore contains the actual ending of the friendship, two plays early, and the audience laughs at it. This is textual integrity in the only form that can be checked — not a claim that the parts cohere, but a scene an audience can be shown, in which a tavern game already holds the sequel's catastrophe.",
    why:"A thesis about integrity, two quotations from the same exchange, metatheatre named, a mechanism that turns on the tense change between two two-word clauses, and a conclusion that distinguishes demonstrating integrity from asserting it." },

  { id:"p-mb3-b5", module:"moduleB", text:"henry4", band:5, derivedFrom:"p-mb3-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"The play extempore is a very important scene. In 2.4 Falstaff, wearing a cushion for a crown, pleads 'Banish plump Jack, and banish all the world', and Hal answers 'I do, I will'. The metatheatre does the work: 'I do' belongs to the King inside the game and 'I will' steps outside it into the future tense, so a four-word reply changes speaker mid-sentence. A comic rehearsal therefore contains the actual ending of the friendship, two plays early. It is one of the most memorable scenes in Shakespeare.",
    why:"The tense analysis of 'I do, I will' is exactly right and is the hardest observation in the paragraph. The close is a compliment rather than a return to textual integrity, so nothing has been argued about the play's value." },

  { id:"p-mb3-b4", module:"moduleB", text:"henry4", band:4, derivedFrom:"p-mb3-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"The play extempore is an important scene. Falstaff and Hal act out an interview with the King, which is metatheatre because it is a play inside a play. Falstaff says 'Banish plump Jack, and banish all the world' and Hal says 'I do, I will'. They are in the Boar's Head Tavern and Mistress Quickly is watching, and then the sheriff arrives looking for Falstaff and Hal hides him behind the arras. The metatheatre is very effective here.",
    why:"Metatheatre is correctly named and defined and both quotations are accurate. Then the paragraph describes who was in the room and what happened next, and 'very effective' does none of the work of explaining why 'I will' is in the future tense." },

  { id:"p-mb3-b3", module:"moduleB", text:"henry4", band:3, derivedFrom:"p-mb3-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"There is an important scene where Falstaff and Hal pretend to be the King. Falstaff says 'Banish plump Jack, and banish all the world' and Hal replies 'I do, I will', which means he really will banish him one day. They are in the Boar's Head Tavern and Mistress Quickly is watching. Then the sheriff arrives looking for Falstaff and Hal hides him behind the arras. This is a sad moment as well as a funny one.",
    why:"Both quotations are accurate and the reading of 'I will' is correct, but nothing is named — 'pretend to be the King' is a description of the action rather than of the device, so the paragraph has no way to analyse the scene as a rehearsal." },

  { id:"p-mb3-b2", module:"moduleB", text:"henry4", band:2, derivedFrom:"p-mb3-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"In the Boar's Head Tavern Falstaff and Hal decide to act out what will happen when Hal has to see his father. Falstaff plays the King first and then they swap over and Hal plays the King while Falstaff plays Hal. Falstaff asks not to be banished and Hal says he will banish him. Then the sheriff comes to the door looking for the men who did the robbery at Gadshill and Falstaff hides behind a curtain and falls asleep.",
    why:"Recounts the scene without quoting a word. 'Hal says he will banish him' is accurate and destroys the evidence — the four words the whole scene turns on are paraphrased away." },

  /* ═══ family 11 — Module C reflection statement ═══════════ */
  { id:"p-mc1-b6", module:"moduleC", band:6,
    descriptors: D(true, true, true, true, true),
    para:"My opening sentence withholds the event so the reader has to reconstruct it: 'The kettle clicked off and nobody moved to make the tea.' The tension is carried entirely by a negative, which I chose after cutting two earlier drafts that named the argument outright — describing the row made the reader a spectator, and describing its aftermath made them an investigator. I borrowed the plainness from Orwell's 'Politics and the English Language', though I broke his rule about cutting every unnecessary word in the phrase 'moved to make', where the redundancy carries the hesitation. The choice serves the piece's purpose: a discursive reflection on family silence should not explain the silence, because the reader's own inference is the argument I wanted them to arrive at.",
    why:"Quotes its own writing, names the technique, explains the mechanism, states what was cut and why, names its model, and identifies where it deliberately broke the model's rule. That last move is what separates a reflection that demonstrates judgement from one that demonstrates compliance." },

  { id:"p-mc1-b5", module:"moduleC", band:5, derivedFrom:"p-mc1-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"My opening sentence withholds the event so the reader has to reconstruct it: 'The kettle clicked off and nobody moved to make the tea.' The tension is carried entirely by a negative, which I chose after cutting two earlier drafts that named the argument outright — describing the row made the reader a spectator, and describing its aftermath made them an investigator. I borrowed the plainness from Orwell's 'Politics and the English Language'. I think this is an effective opening for the piece.",
    why:"The craft analysis and the account of the cuts are both strong. What is missing is the connection to purpose — the reflection never says what the piece was for, so a set of good choices ends up unattached to anything." },

  { id:"p-mc1-b4", module:"moduleC", band:4, derivedFrom:"p-mc1-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"My opening sentence withholds the event so the reader has to reconstruct it: 'The kettle clicked off and nobody moved to make the tea.' This is an example of understatement. In my piece a family has just had an argument about their mother's house and they are all sitting in the kitchen not talking to each other. The narrator is the youngest sibling and she remembers a similar afternoon from her childhood. I used understatement to create tension.",
    why:"The technique is named and the writing is quoted, then the reflection summarises the piece's content instead of explaining how understatement produces the tension. 'I used X to create Y' with no mechanism between them is the reflection-statement equivalent of describing the plot." },

  { id:"p-mc1-b3", module:"moduleC", band:3, derivedFrom:"p-mc1-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"I started my piece with 'The kettle clicked off and nobody moved to make the tea' because I wanted the reader to work out what had happened. In my piece a family has just argued about their mother's house and they are sitting in the kitchen not talking. The narrator is the youngest sibling and she remembers a similar afternoon from her childhood. I wanted the beginning to be quiet so the reader would keep reading.",
    why:"The writing is quoted and the intention is stated, but no technique is named — so there is nothing for the reflection to analyse, and 'I wanted' is the only account of the choice on offer." },

  { id:"p-mc1-b2", module:"moduleC", band:2, derivedFrom:"p-mc1-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"My piece is about a family who have just had an argument about what to do with their mother's house now that she has gone into care. They are all sitting in the kitchen and none of them wants to be the first to speak. The narrator is the youngest sister and she keeps thinking about an afternoon when they were children. I tried to make it realistic and I hope the reader finds it moving.",
    why:"Describes the piece instead of accounting for it, and quotes nothing. A reflection that could have been written by someone who had only read a synopsis has not demonstrated the outcome the module assesses." },

  /* ═══ family 12 — 1984, synecdoche and the boot ═══════════ */
  { id:"p-cm5-b6", module:"common", text:"1984", band:6,
    descriptors: D(true, true, true, true, true),
    para:"O'Brien's picture of the future is frightening because it contains no people. 'A boot stamping on a human face — for ever' is doubly synecdochic: a boot for a soldier, a face for a prisoner, and the substitution removes agency from both parties. What is left is not an encounter but a process, and a process cannot be reasoned with, bargained with or shamed. The dash before 'for ever' then converts the image into a sentence of unlimited duration. This is Orwell's most economical statement about individual human experience under a regime whose only content is power: the individual has not been defeated in the image, because there is no individual in it — the mechanism has already replaced the participants it would otherwise have needed.",
    why:"A position, a short integrated quotation, the technique named and its double application identified, a mechanism explaining what the substitution removes and what the dash adds, and a conceptual return that argues something specific about the module rather than gesturing at it." },

  { id:"p-cm5-b5", module:"common", text:"1984", band:5, derivedFrom:"p-cm5-b6", broke:["concept"],
    descriptors: D(true, true, true, true, false),
    para:"O'Brien's picture of the future is frightening because it contains no people. 'A boot stamping on a human face — for ever' is doubly synecdochic: a boot for a soldier, a face for a prisoner, and the substitution removes agency from both parties. What is left is not an encounter but a process, and a process cannot be reasoned with, bargained with or shamed. The dash before 'for ever' then converts the image into a sentence of unlimited duration. This is one of the most famous lines in the novel.",
    why:"The synecdoche analysis is precise and the observation about the dash is exactly right. The paragraph then notes the line's fame, which is a fact about its reception rather than a return to human experience." },

  { id:"p-cm5-b4", module:"common", text:"1984", band:4, derivedFrom:"p-cm5-b5", broke:["analysis"],
    descriptors: D(true, true, true, false, false),
    para:"O'Brien describes the future to Winston in a frightening way. He says 'a boot stamping on a human face — for ever', which is synecdoche because a part is used to stand for the whole. This happens in the Ministry of Love while Winston is being interrogated after being arrested in the room above Mr Charrington's shop. O'Brien has already explained that the Party wants power for its own sake. The synecdoche makes the image more powerful.",
    why:"Synecdoche is named and correctly defined and the quotation is accurate. Then the paragraph places the scene in the plot, and 'makes the image more powerful' is an assertion about intensity rather than an account of what the substitution does." },

  { id:"p-cm5-b3", module:"common", text:"1984", band:3, derivedFrom:"p-cm5-b4", broke:["technique"],
    descriptors: D(true, true, false, false, false),
    para:"O'Brien describes the future to Winston in a frightening way. He says 'a boot stamping on a human face — for ever', which means that people will be crushed by the Party permanently. This happens in the Ministry of Love while Winston is being interrogated after his arrest. O'Brien has already explained that the Party wants power for its own sake and is not interested in the good of others. This is a very disturbing image.",
    why:"Accurate quotation and a fair gloss, with nothing named. 'Very disturbing image' is a reaction rather than an analysis, and without synecdoche there is no way to explain why an image with no people in it disturbs more than one with people would." },

  { id:"p-cm5-b2", module:"common", text:"1984", band:2, derivedFrom:"p-cm5-b3", broke:["evidence","thesis"],
    descriptors: D(false, false, false, false, false),
    para:"In the third part of the novel Winston is taken to the Ministry of Love and tortured by O'Brien, who turns out to have been working for the Thought Police all along. O'Brien tells him about the Party and how it will rule for ever and describes what the future will be like. He also makes Winston say that two and two make five, and eventually sends him to Room 101 where his worst fear is rats.",
    why:"Retells Part 3 without a single quotation. O'Brien's description is referred to rather than quoted, so the paragraph's central subject is the one thing not on the page." }
];
})();
