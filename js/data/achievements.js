/* Achievements. Each `check(s)` receives State.achievementStats().
   ============================================================================
   Two rules the validator enforces:
     1. NONE may unlock on a fresh save. An achievement that fires before the student
        has done anything is a bug that teaches them the rewards are meaningless.
     2. `check` must not throw on a partial stats object — State wraps every call in a
        try/catch, but a check that throws silently never fires, which is worse.
   ============================================================================ */
window.EN = window.EN || {};
EN.DATA = EN.DATA || {};

EN.DATA.achievements = [

  /* ── first steps ──────────────────────────────────────────── */
  { id:"a_first", name:"First Steps", icon:"👣", reward:40,
    desc:"Answer your first question", check:s => s.answered >= 1 },
  { id:"a_ten", name:"Warming Up", icon:"🔥", reward:60,
    desc:"Answer 10 questions", check:s => s.answered >= 10 },
  { id:"a_fifty", name:"Getting Somewhere", icon:"📈", reward:110,
    desc:"Answer 50 questions", check:s => s.answered >= 50 },
  { id:"a_twofifty", name:"Two Hundred and Fifty", icon:"📚", reward:280,
    desc:"Answer 250 questions", check:s => s.answered >= 250 },
  { id:"a_thousand", name:"Four Figures", icon:"🏔️", reward:700,
    desc:"Answer 1,000 questions", check:s => s.answered >= 1000 },
  { id:"a_twok", name:"Marathon Reader", icon:"🎽", reward:1200,
    desc:"Answer 2,500 questions", check:s => s.answered >= 2500 },
  { id:"a_fivek", name:"Five Thousand", icon:"🗿", reward:3000,
    desc:"Answer 5,000 questions", check:s => s.answered >= 5000 },

  /* ── accuracy and streaks ─────────────────────────────────── */
  { id:"a_streak5", name:"On a Roll", icon:"⚡", reward:70,
    desc:"Hit a 5-answer streak", check:s => s.bestStreak >= 5 },
  { id:"a_streak15", name:"Fifteen Straight", icon:"🌟", reward:180,
    desc:"Hit a 15-answer streak", check:s => s.bestStreak >= 15 },
  { id:"a_streak30", name:"Unbroken", icon:"💫", reward:420,
    desc:"Hit a 30-answer streak", check:s => s.bestStreak >= 30 },
  { id:"a_streak50", name:"Fifty Without a Slip", icon:"🎯", reward:900,
    desc:"Hit a 50-answer streak", check:s => s.bestStreak >= 50 },
  { id:"a_perfect1", name:"Clean Sheet", icon:"✨", reward:90,
    desc:"Finish a run with no mistakes", check:s => s.perfectRuns >= 1 },
  { id:"a_perfect10", name:"Ten Clean Sheets", icon:"🏅", reward:400,
    desc:"Finish 10 perfect runs", check:s => s.perfectRuns >= 10 },
  { id:"a_perfect40", name:"Habitually Flawless", icon:"👑", reward:1400,
    desc:"Finish 40 perfect runs", check:s => s.perfectRuns >= 40 },

  /* ── daily habit ──────────────────────────────────────────── */
  { id:"a_day3", name:"Three Days Running", icon:"📅", reward:80,
    desc:"A 3-day streak", check:s => s.longestDayStreak >= 3 },
  { id:"a_day7", name:"A Whole Week", icon:"🗓️", reward:200,
    desc:"A 7-day streak", check:s => s.longestDayStreak >= 7 },
  { id:"a_day30", name:"A Month of Mornings", icon:"🌅", reward:800,
    desc:"A 30-day streak", check:s => s.longestDayStreak >= 30 },
  { id:"a_day100", name:"One Hundred Days", icon:"💯", reward:2500,
    desc:"A 100-day streak", check:s => s.longestDayStreak >= 100 },
  { id:"a_owl", name:"Night Owl", icon:"🦉", reward:120,
    desc:"Study between midnight and 4am", check:s => !!s.nightOwl },
  { id:"a_lark", name:"Before the Kettle", icon:"🐦", reward:120,
    desc:"Study between 5am and 7am", check:s => !!s.earlyBird },

  /* ── technique identification ─────────────────────────────── */
  { id:"a_tech25", name:"Technique Spotter", icon:"🔍", reward:100,
    desc:"Identify 25 techniques", check:s => s.techniquesNamed >= 25 },
  { id:"a_tech150", name:"Named and Shamed", icon:"🏷️", reward:340,
    desc:"Identify 150 techniques", check:s => s.techniquesNamed >= 150 },
  { id:"a_tech500", name:"Glossary Incarnate", icon:"📖", reward:1100,
    desc:"Identify 500 techniques", check:s => s.techniquesNamed >= 500 },

  /* ── the Quote Vault ─────────────────────────────────────── */
  { id:"a_vault1", name:"First Quote", icon:"🗝️", reward:50,
    desc:"Review a quote in the Vault", check:s => s.quotesSeen >= 1 },
  { id:"a_vault25", name:"Twenty-Five Held", icon:"🔐", reward:200,
    desc:"Have 25 quotes in the Vault", check:s => s.quotesSeen >= 25 },
  { id:"a_master10", name:"Ten Mastered", icon:"💎", reward:260,
    desc:"Get 10 quotes to box 5", check:s => s.quotesMastered >= 10 },
  { id:"a_master50", name:"Fifty Mastered", icon:"👛", reward:700,
    desc:"Get 50 quotes to box 5", check:s => s.quotesMastered >= 50 },
  { id:"a_master150", name:"Keeper of the Vault", icon:"🏦", reward:2000,
    desc:"Get 150 quotes to box 5", check:s => s.quotesMastered >= 150 },
  { id:"a_cloze20", name:"Word Perfect", icon:"🕳️", reward:150,
    desc:"Complete 20 cloze quotes", check:s => s.clozeSolved >= 20 },
  { id:"a_cloze150", name:"Nothing Missing", icon:"🧩", reward:600,
    desc:"Complete 150 cloze quotes", check:s => s.clozeSolved >= 150 },
  { id:"a_clozeperfect", name:"Not a Gap", icon:"🎼", reward:320,
    desc:"Complete 15 cloze quotes with every blank right first time",
    check:s => s.clozePerfect >= 15 },

  /* ── the Marking Desk ────────────────────────────────────── */
  { id:"a_mark1", name:"Relief Marker", icon:"📝", reward:70,
    desc:"Mark your first paragraph", check:s => s.paragraphsMarked >= 1 },
  { id:"a_mark30", name:"Second Marker", icon:"🖊️", reward:300,
    desc:"Mark 30 paragraphs", check:s => s.paragraphsMarked >= 30 },
  { id:"a_mark120", name:"Senior Marker", icon:"🗂️", reward:900,
    desc:"Mark 120 paragraphs", check:s => s.paragraphsMarked >= 120 },
  { id:"a_band20", name:"Good Eye", icon:"👁️", reward:250,
    desc:"Get the band exactly right 20 times", check:s => s.bandsExact >= 20 },
  { id:"a_band80", name:"Supervisor of Marking", icon:"⚖️", reward:1000,
    desc:"Get the band exactly right 80 times", check:s => s.bandsExact >= 80 },
  { id:"a_markperfect", name:"Band and Descriptors", icon:"🎖️", reward:500,
    desc:"Mark 10 paragraphs with the band and every descriptor right",
    check:s => s.perfectMarkings >= 10 },

  /* ── essay architecture ──────────────────────────────────── */
  { id:"a_essay1", name:"First Assembly", icon:"🧱", reward:70,
    desc:"Assemble your first paragraph", check:s => s.essaysAssembled >= 1 },
  { id:"a_essay25", name:"Structural Work", icon:"🏗️", reward:300,
    desc:"Assemble 25 paragraphs or essays", check:s => s.essaysAssembled >= 25 },
  { id:"a_essay100", name:"Essay Architect", icon:"🏛️", reward:1000,
    desc:"Assemble 100 paragraphs or essays", check:s => s.essaysAssembled >= 100 },
  { id:"a_puzzleall", name:"Every Blueprint", icon:"📐", reward:800,
    desc:"Solve every Essay Architect puzzle at least once",
    check:s => s.puzzlesSolvedUnique >= 14 },

  /* ── Layer C ─────────────────────────────────────────────── */
  { id:"a_say1", name:"In Your Own Words", icon:"💬", reward:80,
    desc:"Have a sentence marked by the embedding model", check:s => s.sentencesMarked >= 1 },
  { id:"a_say25", name:"Twenty-Five Nailed", icon:"🗣️", reward:340,
    desc:"Nail 25 effect statements", check:s => s.sentencesNailed >= 25 },
  { id:"a_say100", name:"Say It In One", icon:"🎙️", reward:1100,
    desc:"Nail 100 effect statements", check:s => s.sentencesNailed >= 100 },
  { id:"a_thesis1", name:"Position Taken", icon:"✍️", reward:80,
    desc:"Forge your first thesis", check:s => s.thesesForged >= 1 },
  { id:"a_thesis40", name:"Forge Master", icon:"⚒️", reward:600,
    desc:"Forge 40 theses", check:s => s.thesesForged >= 40 },
  { id:"a_rewrite20", name:"Rescue Service", icon:"🔧", reward:400,
    desc:"Nail 20 rewrites", check:s => s.rewritesNailed >= 20 },

  /* ── other modes ─────────────────────────────────────────── */
  { id:"a_match1", name:"Concentration", icon:"🃏", reward:60,
    desc:"Clear a Quote Match board", check:s => s.quotesMatched >= 1 },
  { id:"a_match25", name:"Pattern Recogniser", icon:"🎴", reward:280,
    desc:"Clear 25 Quote Match boards", check:s => s.quotesMatched >= 25 },
  { id:"a_grid1", name:"Against the Clock", icon:"⏱️", reward:70,
    desc:"Clear a Band Grid", check:s => s.gridsCleared >= 1 },
  { id:"a_gridperfect", name:"No Wrong Cells", icon:"🟩", reward:380,
    desc:"Clear 5 Band Grids with no errors", check:s => s.perfectGrids >= 5 },
  { id:"a_decon30", name:"Reading the Question", icon:"🎯", reward:240,
    desc:"Deconstruct 30 essay questions", check:s => s.deconstructions >= 30 },
  { id:"a_survive15", name:"Fifteen and Standing", icon:"💀", reward:220,
    desc:"Reach 15 in Survival", check:s => s.survivalBest >= 15 },
  { id:"a_survive40", name:"Last Stand", icon:"⚰️", reward:900,
    desc:"Reach 40 in Survival", check:s => s.survivalBest >= 40 },
  { id:"a_rehab20", name:"Second Time Lucky", icon:"🩹", reward:260,
    desc:"Fix 20 questions you previously missed", check:s => s.mistakesFixed >= 20 },
  { id:"a_rehab100", name:"Nothing Left Broken", icon:"🩺", reward:800,
    desc:"Fix 100 questions you previously missed", check:s => s.mistakesFixed >= 100 },

  /* ── bosses ──────────────────────────────────────────────── */
  { id:"a_boss1", name:"First Blood", icon:"⚔️", reward:200,
    desc:"Defeat a Module Boss", check:s => s.bossWins >= 1 },
  { id:"a_boss5", name:"All Five", icon:"🛡️", reward:1200,
    desc:"Defeat all five Module Bosses", check:s => s.bossesBeaten >= 5 },
  { id:"a_bossflawless", name:"Untouched", icon:"🕊️", reward:900,
    desc:"Defeat a boss without losing any HP", check:s => s.flawlessBoss >= 1 },
  { id:"a_bossclutch", name:"One Left", icon:"🫀", reward:700,
    desc:"Win a boss fight on your last point of HP", check:s => s.clutchWins >= 1 },
  { id:"a_finalpaper", name:"The Final Paper", icon:"📜", reward:2200,
    desc:"Beat the Final Paper gauntlet", check:s => (s.modesPlayed || {}).finalpaper >= 1 &&
                                                     s.bossesBeaten >= 5 },

  /* ── difficulty ──────────────────────────────────────────── */
  { id:"a_hard5", name:"Uphill", icon:"📕", reward:300,
    desc:"Win 5 runs on Hard", check:s => s.hardWins >= 5 },
  { id:"a_nightmare1", name:"By Candlelight", icon:"🕯️", reward:500,
    desc:"Win a run on Nightmare", check:s => s.nightmareWins >= 1 },
  { id:"a_nightmare10", name:"Marker's Nightmare", icon:"👹", reward:1600,
    desc:"Win 10 runs on Nightmare", check:s => s.nightmareWins >= 10 },

  /* ── levels, mastery and collection ─────────────────────── */
  { id:"a_lv5", name:"Level 5", icon:"5️⃣", reward:100,
    desc:"Reach level 5", check:s => s.level >= 5 },
  { id:"a_lv15", name:"Level 15", icon:"🔟", reward:300,
    desc:"Reach level 15", check:s => s.level >= 15 },
  { id:"a_lv30", name:"Level 30", icon:"🎓", reward:900,
    desc:"Reach level 30", check:s => s.level >= 30 },
  { id:"a_lv60", name:"The Examiner", icon:"🏆", reward:3000,
    desc:"Reach level 60", check:s => s.level >= 60 },
  { id:"a_prestige1", name:"Ascended", icon:"📜", reward:2000,
    desc:"Ascend once", check:s => s.prestige >= 1 },
  { id:"a_prestige3", name:"Thrice Round", icon:"🔱", reward:5000,
    desc:"Ascend three times", check:s => s.prestige >= 3 },
  { id:"a_mastery1", name:"One Module Fluent", icon:"◕", reward:400,
    desc:"Reach 82% mastery in any module",
    check:s => ["common","moduleA","moduleB","moduleC"].some(m => s.masteryOf(m) >= 82) },
  { id:"a_masteryall", name:"All Four Fluent", icon:"★", reward:2400,
    desc:"Reach 82% mastery in all four modules",
    check:s => ["common","moduleA","moduleB","moduleC"].every(m => s.masteryOf(m) >= 82) },
  { id:"a_textmastery", name:"Text Owned", icon:"📗", reward:600,
    desc:"Reach 93% mastery on one of your texts",
    check:s => Object.keys(s.texts || {}).some(t => s.textMasteryOf(t) >= 93) },
  { id:"a_themes3", name:"Redecorated", icon:"🎨", reward:200,
    desc:"Own 3 themes", check:s => s.themesOwned >= 3 },
  { id:"a_themesall", name:"Every Binding", icon:"🖼️", reward:1500,
    desc:"Own all 10 themes", check:s => s.themesOwned >= 10 },
  { id:"a_avatars8", name:"Eight Faces", icon:"🎭", reward:400,
    desc:"Own 8 avatars", check:s => s.avatarsOwned >= 8 },
  { id:"a_avatarsall", name:"The Whole Cast", icon:"🎪", reward:2200,
    desc:"Own all 22 avatars", check:s => s.avatarsOwned >= 22 },
  { id:"a_rich", name:"Well Provisioned", icon:"✒️", reward:0,
    desc:"Hold 5,000 Marks at once", check:s => s.peakCoins >= 5000 },
  { id:"a_quests5", name:"Quest Runner", icon:"📋", reward:400,
    desc:"Claim 5 weekly quests", check:s => s.questsDone >= 5 },
  { id:"a_quests25", name:"Every Week", icon:"🗒️", reward:1400,
    desc:"Claim 25 weekly quests", check:s => s.questsDone >= 25 },
  { id:"a_modes8", name:"Tried Everything", icon:"🎮", reward:500,
    desc:"Play 8 different modes", check:s => Object.keys(s.modesPlayed || {}).length >= 8 },
  { id:"a_modes14", name:"Every Mode", icon:"🕹️", reward:1200,
    desc:"Play 14 different modes", check:s => Object.keys(s.modesPlayed || {}).length >= 14 },

  /* ── the Draft Desk ──────────────────────────────────────────
     Pays a reward for keeping drafts, which is a collection achievement rather than an
     XP source — the Draft Desk itself never calls award(), and 'type 500 words of
     nonsense' must not become the fastest way to level. Note this checks DRAFTS KEPT,
     not words written, so padding a single draft achieves nothing. */
  { id:"a_draft1", name:"Somewhere to Write", icon:"📄", reward:60,
    desc:"Keep a draft in the Draft Desk", check:s => s.draftsKept >= 1 },
  { id:"a_draft10", name:"Ten Drafts", icon:"🗃️", reward:300,
    desc:"Keep 10 drafts", check:s => s.draftsKept >= 10 }
];
