/* THE TEXT MANIFEST.
   ============================================================================
   English is not chemistry: two Advanced students at the same school may share only
   the Common Module text. So the core of this app is text-agnostic and everything
   text-specific filters through `EN.DATA.activeTexts` below.

   Swapping a text is done IN THE APP — Settings → Your texts. The four slots below are
   only the default for a fresh install; State.activeTexts() is what the app reads, and
   it prefers the student's own selection. tests/validate.js asserts that every question
   in the bank references a text that ships, which is the check that stops the app
   breaking when the swap happens.

   A text may also declare a `poems` array (see donne.js). Donne is not one work but a
   selection of fifty-four poems and no two courses cut them the same way, so poems are
   individually switchable and each carries a `core` flag marking the commonly-set ones.

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

/* ── THE DEFAULT TEXTS ───────────────────────────────────────────────────────
   The starting point, not the mandate. A student picks their own in the app
   (Settings → Your texts, or the Change button on the home screen), which writes an
   override into the save file and leaves this alone. State.activeTexts() merges the two
   and everything reads through there — nothing in the app touches this object directly.

   Editing these four lines still works and changes the default for a fresh install. */
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
