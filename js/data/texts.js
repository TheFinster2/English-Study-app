/* THE TEXT MANIFEST.
   ============================================================================
   English is not chemistry: two Advanced students at the same school may share only
   the Common Module text. So the core of this app is text-agnostic and everything
   text-specific filters through `EN.DATA.activeTexts` below.

   Swapping a text is a ONE-FILE EDIT — change an id here, and every game mode, the
   Quote Vault, the adaptive draw and the progress screen follow. tests/validate.js
   asserts that every question in the bank references a text present in this manifest,
   which is the check that stops the app breaking when the swap happens.

   Add your own text by dropping a file into js/data/texts/ (copy the shape of
   nineteen-eighty-four.js), adding it to index.html + sw.js, and naming it here.
   That is a supported path, not an afterthought.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

/* Individual text files register themselves into this map. */
EN.DATA.texts = EN.DATA.texts || {};

/* The four module slots, in NESA's order. */
EN.DATA.modules = [
  { id: "common",  code: "Common Module", name: "Texts and Human Experiences",
    short: "Human Experiences", icon: "👥", pair: false,
    concept: "human experiences — individual and collective, and the anomalies and paradoxes in them" },
  { id: "moduleA", code: "Module A", name: "Textual Conversations",
    short: "Textual Conversations", icon: "🔁", pair: true,
    concept: "resonances and dissonances between a pair of texts across time" },
  { id: "moduleB", code: "Module B", name: "Critical Study of Literature",
    short: "Critical Study", icon: "🔬", pair: false,
    concept: "textual integrity — how a text holds together, and why it has lasted" },
  { id: "moduleC", code: "Module C", name: "The Craft of Writing",
    short: "Craft of Writing", icon: "✒️", pair: false,
    concept: "deliberate craft — the choices a writer makes and can account for" }
];

/* ── THIS STUDENT'S TEXTS ────────────────────────────────────────────────────
   Edit these four lines to change what the whole app drills. */
EN.DATA.activeTexts = {
  common:  "1984",
  moduleA: ["donne", "wit"],        // Module A is always a pair
  moduleB: "henry4",
  moduleC: "craft"                  // Module C is a skills focus, not a single text
};

/* Everything else that ships. Present so a fresh install isn't empty and so the
   swap-my-text path is genuinely exercised by more than one file, but shallower than
   the four above — the student's own texts get the deep banks. */
EN.DATA.starterTexts = ["crucible", "hamlet", "tempest", "hagseed"];
