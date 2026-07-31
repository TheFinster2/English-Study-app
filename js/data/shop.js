/* The Shop: power-ups, supply crates, and the arcade's ticket prices.
   Marks (✒️) are deliberately scarce — award() pays coins at 60% — so everything here
   costs something. tests/economy.js prints the effort-per-purchase table if it ever
   needs retuning. */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

EN.DATA.shop = {

  /* Seven power-ups. `level` gates the strong ones as well as pricing them, so a new
     player cannot buy their way past difficulty on day one. */
  powerups: [
    { id:"fifty", name:"50/50", icon:"✂️", price:110, level:1,
      desc:"Removes two wrong options. Locked out on Nightmare." },
    { id:"skip", name:"Skip", icon:"⏭️", price:130, level:1,
      desc:"Skip a question without breaking your streak. Locked out on Nightmare." },
    { id:"freeze", name:"Time Freeze", icon:"🧊", price:180, level:3,
      desc:"+20 seconds in any timed mode." },
    { id:"reread", name:"Second Read", icon:"👁️", price:210, level:6,
      desc:"Shows the quote again with the technique's span highlighted." },
    { id:"hint", name:"Hint", icon:"💡", price:240, level:9,
      desc:"Names the category the answer belongs to — sound, syntax, form." },
    { id:"insight", name:"Insight", icon:"🔍", price:320, level:14,
      desc:"Gives you the technique's definition without naming which option it is." },
    { id:"adrenaline", name:"Adrenaline", icon:"⚡", price:520, level:20,
      desc:"Double XP for the rest of the run. One use, no refunds." }
  ],

  /* Three tiers of random supply crate. Weighted so the cheap one is honestly cheap
     rather than a trap, and the dear one is worth saving for. */
  crates: [
    { id:"satchel", name:"Pencil Case", icon:"🎒", price:400, level:1,
      desc:"Three power-ups, weighted toward the common ones.",
      rolls:3, table:[["fifty",34],["skip",30],["freeze",20],["reread",10],["hint",6]] },
    { id:"folio", name:"Folio Box", icon:"📦", price:950, level:8,
      desc:"Four power-ups, with a real chance at Insight.",
      rolls:4, table:[["fifty",22],["skip",20],["freeze",22],["reread",18],["hint",12],["insight",6]] },
    { id:"archive", name:"The Archive", icon:"🗄️", price:2100, level:18,
      desc:"Five power-ups, and Adrenaline is on the table.",
      rolls:5, table:[["freeze",22],["reread",22],["hint",22],["insight",22],["adrenaline",12]] }
  ],

  /* Arcade playtime, rented in minutes. Priced against a run that nominally pays 1000
     so the effort-per-ticket ratio is a number tests/economy.js can print. */
  tickets: [
    { id:"t5",  minutes:5,  price:250,  label:"5 minutes" },
    { id:"t15", minutes:15, price:660,  label:"15 minutes" },
    { id:"t30", minutes:30, price:1180, label:"30 minutes" }
  ]
};

/* The three arcade games. They award NOTHING but a high score — no XP, no Marks, no
   achievements — and that is enforced structurally: nothing in js/games/arcade-*.js
   calls UI.award(). An endless runner paying even 1 XP per second beats studying, and
   the reference app nearly shipped exactly that. */
EN.DATA.arcade = [
  { id:"lettercrush", name:"Letter Crush", icon:"🔤", colour:"#e0574a",
    desc:"Match letter tiles and spell the word you are given.",
    blurb:"8×8 with gravity, cascades and three specials that combine. There is always a " +
          "word to fill — SATIRE, ARTIST, STRAIT — and clearing a letter it wants fills a " +
          "slot. No XP, no Marks, no achievements: just a number and a word count." },
  { id:"marginrunner", name:"Margin Runner", icon:"🏃", colour:"#4a90c2",
    desc:"Endless runner down the margin of a page. Jump the footnotes.",
    blurb:"Canvas, one button, increasing speed. Earns you nothing at all." },
  { id:"wordtower", name:"Word Tower 2048", icon:"🧱", colour:"#c9a227",
    desc:"Merge tiles up a ladder from LETTER to CANON.",
    blurb:"4×4 merge. The ladder is a joke about literary hierarchy." }
];
