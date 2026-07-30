/* Progression furniture: level titles, difficulty modes, mastery tiers, rank blurbs.
   Pure data, no logic. */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

/* Sixty titles for sixty levels. The voice is a sharp friend who has read the text,
   not a Head Teacher — see §12. */
EN.DATA.levelTitles = [
  "Margin Scribbler", "Highlighter Enthusiast", "Plot Summariser", "Quote Hoarder",
  "Topic Sentence Apprentice", "Technique Spotter", "TEEL Practitioner", "Paragraph Wrangler",
  "Evidence Gatherer", "Close Reader", "Annotator", "Thesis Drafter",
  "Motif Tracker", "Structural Analyst", "Conceptual Thinker", "Rubric Literate",
  "Essay Architect", "Comparative Reader", "Integrity Scholar", "Marginalia Adept",
  "Sonnet Whisperer", "Iambic Timekeeper", "Conceit Untangler", "Soliloquy Interpreter",
  "Dramatic Ironist", "Voice Modulator", "Discursive Stylist", "Reflective Writer",
  "Craftsperson of Prose", "Syntax Sculptor", "Cadence Keeper", "Ambiguity Connoisseur",
  "Palimpsest Reader", "Intertextual Navigator", "Resonance Cartographer", "Dissonance Detector",
  "Paradox Handler", "Metaphysical Wit", "Chiasmus Architect", "Volta Turner",
  "Enjambment Engineer", "Caesura Surgeon", "Modernist Interlocutor", "Dystopian Diagnostician",
  "Sceptical Humanist", "Critical Theorist", "Marker's Nightmare", "Exemplar Author",
  "Band Six Regular", "Second Marker", "Senior Marker", "Supervisor of Marking",
  "Judge of Prose", "Anthologist", "Editor at Large", "Keeper of the Folio",
  "Laureate of the Margin", "Master of Close Reading", "The Last Word", "The Examiner"
];

/* Set once in Settings, applies everywhere. The time reduction is applied by
   UI.timeBudget to the SLACK over reading time, never to the reading time itself —
   a flat −45% clock on a paragraph-length stem is not hard, it's unreadable (§9.5). */
EN.DATA.difficulties = [
  { id: "standard",  name: "Standard",  xp: 1.0,  timeScale: 1.0,
    desc: "Full clock. Every power-up available.", icon: "📘" },
  { id: "hard",      name: "Hard",      xp: 1.45, timeScale: 0.75,
    desc: "Thinking time cut by a quarter. Reading time untouched.", icon: "📕" },
  { id: "nightmare", name: "Nightmare", xp: 2.1,  timeScale: 0.55,
    desc: "Thinking time nearly halved. 50/50 and Skip locked out.", icon: "🕯️",
    ban: ["fifty", "skip"] }
];

EN.DATA.masteryTiers = [
  { at: 0,  name: "Untouched",  cls: "t0", icon: "○" },
  { at: 25, name: "Sketched",   cls: "t1", icon: "◔" },
  { at: 45, name: "Working",    cls: "t2", icon: "◑" },
  { at: 65, name: "Confident",  cls: "t3", icon: "◕" },
  { at: 82, name: "Fluent",     cls: "t4", icon: "●" },
  { at: 93, name: "Owned",      cls: "t5", icon: "★" }
];

/* Ten themes, unlockable in the Shop. Every one has to stay legible for body text,
   because this is the app in the set where the student reads paragraphs. */
EN.DATA.themes = [
  { id: "marginalia", name: "Marginalia", desc: "Ink on dark paper. The default.",
    price: 0,    level: 1,  dots: ["#c8b48a", "#e0574a", "#141210"] },
  { id: "foolscap",   name: "Foolscap",   desc: "Cream paper, blue rule, pencil grey.",
    price: 900,  level: 4,  dots: ["#f6f1e2", "#4a6fa5", "#2b2b28"] },
  { id: "redpen",     name: "Red Pen",    desc: "What the marker sees.",
    price: 1200, level: 7,  dots: ["#1a0d0d", "#ff4d4d", "#ffd9d9"] },
  { id: "iambic",     name: "Iambic",     desc: "Five feet, deep green, gold rule.",
    price: 1600, level: 11, dots: ["#0c1a12", "#4fd18b", "#e8c96a"] },
  { id: "palimpsest", name: "Palimpsest", desc: "Something written over something older.",
    price: 2100, level: 16, dots: ["#241c14", "#b98d54", "#8a6f9e"] },
  { id: "folio",      name: "Folio",      desc: "First edition. Slightly foxed.",
    price: 2600, level: 21, dots: ["#efe5d0", "#7a5c3a", "#3a2f22"] },
  { id: "newspeak",   name: "Newspeak",   desc: "Airstrip One issue. Doubleplusgood.",
    price: 3200, level: 27, dots: ["#101418", "#4a90c2", "#d64545"] },
  { id: "vellum",     name: "Vellum",     desc: "Metaphysical. A compass and a flea.",
    price: 3900, level: 34, dots: ["#f2e8d5", "#8b3a3a", "#2f3b4a"] },
  { id: "quarto",     name: "Bad Quarto",  desc: "Misprinted, mis-set, immortal.",
    price: 4700, level: 42, dots: ["#1c1a17", "#c9a227", "#a8b5c4"] },
  { id: "blankpage",  name: "The Blank Page", desc: "Nothing but you and the measure.",
    price: 6000, level: 52, dots: ["#ffffff", "#111111", "#8c8c8c"] }
];

/* Twenty-two avatars. The cheap ones read as stationery, the dear ones as the texts. */
EN.DATA.avatars = [
  { em: "🖋️", price: 0,    level: 1 },  { em: "📖", price: 0,    level: 1 },
  { em: "✏️", price: 200,  level: 2 },  { em: "📚", price: 250,  level: 3 },
  { em: "🗒️", price: 300,  level: 4 },  { em: "🔖", price: 350,  level: 5 },
  { em: "🕯️", price: 500,  level: 7 },  { em: "🪶", price: 650,  level: 9 },
  { em: "📜", price: 800,  level: 11 }, { em: "🎭", price: 950,  level: 13 },
  { em: "👁️", price: 1100, level: 15 }, { em: "🧠", price: 1300, level: 18 },
  { em: "⚗️", price: 1500, level: 21 }, { em: "🧭", price: 1700, level: 24 },
  { em: "🐀", price: 1900, level: 27 }, { em: "👑", price: 2200, level: 31 },
  { em: "💀", price: 2500, level: 35 }, { em: "🩻", price: 2900, level: 39 },
  { em: "🗝️", price: 3400, level: 44 }, { em: "🪞", price: 4000, level: 48 },
  { em: "🦉", price: 4800, level: 54 }, { em: "🏛️", price: 6500, level: 60 }
];
