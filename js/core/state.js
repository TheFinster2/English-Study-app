/* Persistent player state: XP, levels, Marks, streaks, inventory, the Quote Vault's
   spaced repetition, per-module AND per-text stats, and the Layer C farm guards.
   Everything lives in one localStorage key, written on a short debounce with an
   explicit flush on backgrounding. */
window.EN = window.EN || {};

EN.State = (function () {
  const KEY = "closereading.save.v1";
  const U = EN.U;

  const DEFAULT = () => ({
    v: 1,
    createdAt: Date.now(),
    profile: { name: "Reader", avatar: "🖋️", theme: "marginalia" },
    xp: 0, level: 1, xpIntoLevel: 0, coins: 120, prestige: 0, lifetimeXp: 0,
    streak: { count: 0, lastDay: null, longest: 0 },
    stats: {
      answered: 0, correct: 0, bestStreak: 0, perfectRuns: 0,
      techniquesNamed: 0, quotesMatched: 0, clozeSolved: 0, clozePerfect: 0,
      paragraphsMarked: 0, bandsExact: 0, perfectMarkings: 0,
      essaysAssembled: 0, thesesForged: 0, sentencesMarked: 0, sentencesNailed: 0,
      rewritesNailed: 0, deconstructions: 0, gridsCleared: 0, perfectGrids: 0,
      bossWins: 0, flawlessBoss: 0, clutchWins: 0, mistakesFixed: 0,
      peakCoins: 120, nightOwl: false, earlyBird: false, timePlayed: 0,
      survivalBest: 0, hardWins: 0, nightmareWins: 0, quotesMastered: 0,
      draftWords: 0, questsDone: 0, textsStudied: 0
    },
    modules: {},          // { common: {seen, correct} … }
    texts: {},            // { "1984": {seen, correct} … } — a student can be strong on
                          // the Common Module and lost in Module B, so both are tracked
    modesPlayed: {},
    puzzlesSolved: {},
    bossesBeaten: {},
    inventory: { fifty: 1, skip: 1, freeze: 0, reread: 0, hint: 0, insight: 0, adrenaline: 0 },
    owned: { themes: ["marginalia"], avatars: ["🖋️", "📖"] },
    srs: {},              // the Quote Vault's Leitner state, keyed by quote id
    mistakes: [],
    achievements: {},
    history: {},
    scores: {},
    /* motion is deliberately three-valued: "auto" follows the device, "on" and "off" are
       the student overriding it. A boolean could not tell "I never touched this" from
       "I want animations", so the device preference silently won and the switch in
       Settings read ON while the app ran with every animation off.
       Strings rather than "auto"/true/false so the migration below stays idempotent —
       a deliberate `true` and a legacy default `true` are indistinguishable. */
    settings: { sound: true, motion: "auto", volume: 0.7, difficulty: "standard",
                layerC: false, onboarded: false },
    daily: { day: null, progress: 0, claimed: false, spec: null },
    weekly: { week: null, baseline: null, quests: [], claimed: [] },
    arcade: { tickets: {}, scores: {}, played: {} },
    /* Layer C's own ledger. A similarity threshold is not an equality check, so free
       text needs guards a multiple-choice question does not — see §9.8 and `freeText`
       below. */
    freeText: { day: null, scored: {}, hashes: {} },
    drafts: [],           // Draft Desk contents. Exported with the save; earns nothing.
    /* ── THIS STUDENT'S TEXTS ───────────────────────────────────────────────────
       `null` means "whatever js/data/texts.js says", so the file default keeps working
       and a fresh install is not empty. Once the student picks their own in Settings
       this holds the override, and the file is never edited again.

       `poems` is the same idea one level down. A Donne selection is not a text — no two
       courses cut the fifty-four poems the same way — so a text may carry a `poems`
       array and this records which of them the student is actually studying. An absent
       entry means "use each poem's `core` flag", so adding a poem to the data file later
       does not silently switch it on inside somebody's Vault. */
    manifest: null,       // { common, moduleA:[a,b], moduleB, moduleC } or null
    poems: {}             // { donne: ["hs10","hs14", …] } — enabled ids, per text
  });

  let data = DEFAULT();
  const listeners = new Set();
  let saveTimer = null;

  /* ── persistence ─────────────────────────────────────────── */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = deepMerge(DEFAULT(), JSON.parse(raw));
    } catch (e) {
      console.warn("Save file unreadable, starting fresh.", e);
      data = DEFAULT();
    }
    migrate();
    return data;
  }

  /** One-way fixes for saves written by an older shape. */
  function migrate() {
    /* motion used to be a boolean whose default was true. `true` therefore means "never
       chosen", not "wanted", so it becomes "auto" and behaviour is unchanged. Reading it
       as an explicit yes would switch animations on for a student who set Reduce Motion
       on their device on purpose, which is the opposite mistake. `false` was always a
       deliberate choice and becomes "off".
       The new values are strings, so this cannot fire on a save it already converted —
       the first version mapped `true` to "auto" on every load and quietly threw away the
       student's "Always on" every time they reopened the app. */
    const s = data.settings;
    if (s.motion === true) s.motion = "auto";
    else if (s.motion === false) s.motion = "off";
    else if (["auto", "on", "off"].indexOf(s.motion) < 0) s.motion = "auto";
  }

  /** Merge an imported/older save onto the current default shape, so a save from a
      previous version gains new fields instead of blanking them. */
  function deepMerge(base, override) {
    if (Array.isArray(base)) return Array.isArray(override) ? override : base;
    if (base && typeof base === "object" && override && typeof override === "object") {
      const out = Object.assign({}, base);
      for (const k of Object.keys(override)) {
        out[k] = k in base ? deepMerge(base[k], override[k]) : override[k];
      }
      return out;
    }
    return override === undefined ? base : override;
  }

  /* Set once a save has been imported: every later write is suppressed until the page
     reloads. The reload fires `pagehide`, which flushes the in-memory `data` — landing
     on top of the file just imported and silently discarding it. */
  let frozen = false;

  /* ── when the disk is full ────────────────────────────────────
     This used to be a console.warn and nothing else, which is the worst possible handling
     of the worst possible failure: once localStorage is full every subsequent write fails
     silently, so the student keeps playing, keeps earning, and loses all of it — and the
     one place the problem was reported is the one place they will never look.

     Storage fills for a real reason here rather than a hypothetical one: the Draft Desk
     holds essay-length text and nothing caps it. So a failed write now says so, once, in
     words that tell them what to do about it, and leaves a flag Settings can show.

     `saveFailed` is deliberately NOT in the save file. It describes the storage, not the
     student, and persisting it would mean writing to the thing that just refused a write. */
  let saveFailed = null;
  let toldAboutFailure = false;

  function write() {
    if (frozen) return true;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      if (saveFailed) { saveFailed = null; toldAboutFailure = false; }
      return true;
    } catch (e) {
      /* Every browser names the quota error differently; the code and the name both move,
         so treat any write failure as full rather than trying to match on the message. */
      saveFailed = e && e.name ? e.name : "unknown";
      console.warn("Could not save progress — storage is probably full.", e);
      if (!toldAboutFailure && EN.UI && EN.UI.toast) {
        toldAboutFailure = true;
        EN.UI.toast({
          icon: "⚠", kind: "bad", ms: 12000,
          text: "<b>Your progress is not being saved.</b> This device's storage for the app " +
                "is full. Export your save and your drafts from Settings, then delete a few drafts."
        });
      }
      return false;
    }
  }

  /** Did the last write fail? Settings surfaces this; nothing else should need it. */
  const storageFailing = () => saveFailed;

  /** Roughly how much room the save is taking, in bytes. */
  function saveSize() {
    try { return JSON.stringify(data).length; } catch (e) { return 0; }
  }

  /** Replace the whole save with an imported one. The caller reloads immediately. */
  function replaceSave(parsed) {
    const merged = deepMerge(DEFAULT(), parsed);
    try { localStorage.setItem(KEY, JSON.stringify(merged)); }
    catch (e) { console.warn("Could not write imported save.", e); return false; }
    data = merged;
    clearTimeout(saveTimer);
    saveTimer = null;
    frozen = true;
    return true;
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(write, 200);
  }

  /** Write immediately, cancelling any pending debounce. Called on visibilitychange
      and pagehide: mobile browsers reclaim backgrounded tabs without warning, and a
      student mid-paragraph in the Draft Desk must not lose it.
      Returns whether the write actually landed, so the Draft Desk can stop claiming
      "saved" over text that is only in memory. */
  function flush() {
    clearTimeout(saveTimer);
    saveTimer = null;
    return write();
  }

  function emit() { listeners.forEach(fn => fn(data)); save(); }
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  /* ── levelling ───────────────────────────────────────────── */
  /* A whole-HSC-year progression on purpose: level 20 is ~87,000 XP and level 60 about
     1.42 million. The reference app's student asked for it to be harder than the first
     tuning, so this is not to be softened. tests/economy.js prints the effort table if
     it ever does need retuning. */
  const xpNeeded = level => Math.round(130 * Math.pow(level, 1.5));
  const MAX_LEVEL = 60;

  function levelTitle(level) {
    const t = EN.DATA.levelTitles;
    return t[Math.min(level - 1, t.length - 1)];
  }

  function difficulty() {
    const id = data.settings.difficulty || "standard";
    return EN.DATA.difficulties.find(d => d.id === id) || EN.DATA.difficulties[0];
  }

  /** Difficulty bonus compounded with the permanent prestige bonus (+12% each). */
  function xpMultiplier() {
    return difficulty().xp * (1 + (data.prestige || 0) * 0.12);
  }

  const canPrestige = () => data.level >= MAX_LEVEL;

  /** Ascend: reset level and XP, keep every unlock, quote box and statistic. */
  function doPrestige() {
    if (!canPrestige()) return false;
    data.prestige = (data.prestige || 0) + 1;
    data.level = 1;
    data.xpIntoLevel = 0;
    data.xp = 0;
    addCoins(2500, true);
    grantPowerup("insight", 3);
    emit();
    return true;
  }

  function masteryTier(pct) {
    const tiers = EN.DATA.masteryTiers;
    let out = tiers[0];
    for (const t of tiers) if (pct >= t.at) out = t;
    return out;
  }

  /** Award XP (already multiplied by the caller). → { levelsGained, newLevel }. */
  function addXP(amount) {
    if (!amount || amount <= 0) return { levelsGained: 0, newLevel: data.level };
    data.xp += amount;
    data.lifetimeXp = (data.lifetimeXp || 0) + amount;
    data.xpIntoLevel += amount;
    data.history[U.dayKey()] = (data.history[U.dayKey()] || 0) + amount;

    let gained = 0;
    while (data.level < MAX_LEVEL && data.xpIntoLevel >= xpNeeded(data.level)) {
      data.xpIntoLevel -= xpNeeded(data.level);
      data.level++;
      gained++;
      addCoins(30 * data.level, true);
    }
    if (data.level >= MAX_LEVEL) data.xpIntoLevel = Math.min(data.xpIntoLevel, xpNeeded(MAX_LEVEL));
    emit();
    return { levelsGained: gained, newLevel: data.level };
  }

  function addCoins(n, quiet) {
    data.coins = Math.max(0, data.coins + n);
    if (data.coins > data.stats.peakCoins) data.stats.peakCoins = data.coins;
    if (!quiet) emit();
    return data.coins;
  }

  function spendCoins(n) {
    if (data.coins < n) return false;
    data.coins -= n;
    emit();
    return true;
  }

  /* ── daily streak ────────────────────────────────────────── */
  function touchStreak() {
    const today = U.dayKey();
    const last = data.streak.lastDay;
    if (last === today) return { changed: false, count: data.streak.count };

    if (!last) data.streak.count = 1;
    else data.streak.count = U.daysBetween(last, today) === 1 ? data.streak.count + 1 : 1;
    data.streak.lastDay = today;
    data.streak.longest = Math.max(data.streak.longest, data.streak.count);

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) data.stats.nightOwl = true;
    if (hour >= 5 && hour < 7) data.stats.earlyBird = true;

    emit();
    return { changed: true, count: data.streak.count };
  }

  const streakBonus = () => Math.min(5 + data.streak.count * 3, 60);

  /* ── answer recording ────────────────────────────────────── */
  /** Records against the module and the text, so the adaptive draw can weight both. */
  function recordAnswer(mod, isCorrect, questionId, text) {
    data.stats.answered++;
    if (isCorrect) data.stats.correct++;

    if (mod) {
      const m = data.modules[mod] || (data.modules[mod] = { seen: 0, correct: 0 });
      m.seen++;
      if (isCorrect) m.correct++;
    }
    if (text) {
      const t = data.texts[text] || (data.texts[text] = { seen: 0, correct: 0 });
      t.seen++;
      if (isCorrect) t.correct++;
    }

    if (questionId) {
      const idx = data.mistakes.findIndex(x => x.id === questionId);
      if (isCorrect) {
        if (idx >= 0) { data.mistakes.splice(idx, 1); data.stats.mistakesFixed++; }
      } else if (idx >= 0) {
        data.mistakes[idx].misses++;
        data.mistakes[idx].ts = Date.now();
      } else {
        data.mistakes.unshift({ id: questionId, mod, text, misses: 1, ts: Date.now() });
        if (data.mistakes.length > 140) data.mistakes.pop();
      }
    }
    save();
  }

  function noteStreak(n) {
    if (n > data.stats.bestStreak) { data.stats.bestStreak = n; save(); }
  }

  function bump(statKey, by) {
    data.stats[statKey] = (data.stats[statKey] || 0) + (by === undefined ? 1 : by);
    save();
  }

  function markMode(modeId) {
    data.modesPlayed[modeId] = (data.modesPlayed[modeId] || 0) + 1;
    save();
  }

  function recordScore(modeId, score) {
    const prev = data.scores[modeId];
    const isBest = prev === undefined || score > prev;
    if (isBest) { data.scores[modeId] = score; save(); }
    return isBest;
  }

  /* ── mastery ─────────────────────────────────────────────── */
  /* Confidence-weighted: a perfect three-question run should not read as mastered. */
  function weighted(rec) {
    if (!rec || !rec.seen) return 0;
    return Math.round((rec.correct / rec.seen) * Math.min(1, rec.seen / 25) * 100);
  }
  const mastery     = mod  => weighted(data.modules[mod]);
  const textMastery = text => weighted(data.texts[text]);
  const overallAccuracy = () => U.pct(data.stats.correct, data.stats.answered);

  /* ── inventory ───────────────────────────────────────────── */
  function usePowerup(id) {
    if ((data.inventory[id] || 0) <= 0) return false;
    data.inventory[id]--;
    emit();
    return true;
  }
  function grantPowerup(id, n) {
    data.inventory[id] = (data.inventory[id] || 0) + (n || 1);
    emit();
  }

  const ownsTheme  = id => data.owned.themes.includes(id);
  const ownsAvatar = em => data.owned.avatars.includes(em);

  /* ── the Quote Vault: Leitner, 5 boxes ───────────────────── */
  const BOX_DAYS = [0, 1, 2, 4, 8, 16];

  function cardState(id) {
    return data.srs[id] || (data.srs[id] = { box: 1, due: U.dayKey(), reps: 0, lapses: 0 });
  }

  /* A quote pays at most once per day, and only when it was genuinely due. Without
     this, self-reported recall is an infinite loop — which is why anything that pays
     in the Vault goes through Cloze Crunch, where the answer is typed and marked. */
  function cardXpEligible(id) {
    const c = data.srs[id];
    const today = U.dayKey();
    if (c && c.xpDay === today) return false;
    return !c || U.daysBetween(c.due, today) >= 0;
  }
  function markCardXp(id) {
    cardState(id).xpDay = U.dayKey();
    save();
  }

  function reviewCard(id, gotIt) {
    const c = cardState(id);
    c.reps++;
    if (gotIt) c.box = Math.min(5, c.box + 1);
    else { c.box = 1; c.lapses++; }
    const due = new Date();
    due.setDate(due.getDate() + BOX_DAYS[c.box]);
    c.due = U.dayKey(due);
    data.stats.quotesMastered = Object.values(data.srs).filter(x => x.box >= 5).length;
    save();
    return c;
  }

  function dueCards() {
    const today = U.dayKey();
    return EN.Bank.quotes().filter(q => {
      const c = data.srs[q.id];
      return !c || U.daysBetween(c.due, today) >= 0;
    });
  }

  /* ── Layer C farm guards (§9.8) ──────────────────────────────
     Three separate attacks, three fixes, all of them per-day:

     1. One good sentence, everywhere. A generically strong claim clears threshold on a
        surprising number of prompts, so the same normalised response is paid once per
        day across the WHOLE bank, not once per prompt.
     2. Resubmit until it passes. One SCORED attempt per prompt per day; later attempts
        still show feedback and exemplars, which is the better teaching behaviour anyway.
     3. Paste the prompt back. Handled in mark.js, which adds the prompt to nearMiss.  */

  function freeTextDay() {
    const today = U.dayKey();
    if (data.freeText.day !== today) {
      data.freeText = { day: today, scored: {}, hashes: {} };
      save();
    }
    return data.freeText;
  }

  /** Would a scored attempt at this prompt pay anything right now? */
  function freeTextEligible(promptId, response) {
    const ft = freeTextDay();
    if (ft.scored[promptId]) return { ok: false, why: "attempted" };
    const h = String(U.hash(U.normalise(response)));
    if (ft.hashes[h] && ft.hashes[h] !== promptId) return { ok: false, why: "repeat" };
    return { ok: true };
  }

  /** Record the one scored attempt. Called whatever the verdict was. */
  function markFreeText(promptId, response) {
    const ft = freeTextDay();
    ft.scored[promptId] = Date.now();
    ft.hashes[String(U.hash(U.normalise(response)))] = promptId;
    save();
  }

  /* ── achievements ────────────────────────────────────────── */
  function achievementStats() {
    return Object.assign({}, data.stats, {
      level: data.level,
      longestDayStreak: data.streak.longest,
      modules: data.modules,
      texts: data.texts,
      modesPlayed: data.modesPlayed,
      themesOwned: data.owned.themes.length,
      avatarsOwned: data.owned.avatars.length,
      puzzlesSolvedUnique: Object.keys(data.puzzlesSolved).length,
      bossesBeaten: Object.keys(data.bossesBeaten).length,
      quotesMastered: Object.values(data.srs).filter(x => x.box >= 5).length,
      quotesSeen: Object.keys(data.srs).length,
      prestige: data.prestige || 0,
      draftsKept: (data.drafts || []).length,
      // Exposed as functions so mastery achievements use the same weighting as the UI.
      masteryOf: mastery,
      textMasteryOf: textMastery
    });
  }

  function checkAchievements() {
    const s = achievementStats();
    const unlocked = [];
    for (const a of EN.DATA.achievements) {
      if (data.achievements[a.id]) continue;
      let ok = false;
      try { ok = !!a.check(s); } catch (e) { ok = false; }
      if (ok) {
        data.achievements[a.id] = Date.now();
        if (a.reward) addCoins(a.reward, true);
        unlocked.push(a);
      }
    }
    if (unlocked.length) emit();
    return unlocked;
  }

  /* ── daily challenge ─────────────────────────────────────── */
  /** Derived from the date, so everyone sees the same challenge all day. */
  function dailySpec() {
    const day = U.dayKey();
    const rng = U.seededRandom(U.hash("closereading-" + day));
    const modes = ["rapid", "technique", "cloze", "quotematch", "marking",
                   "essay", "bandgrid", "deconstruct"];
    const mode = modes[Math.floor(rng() * modes.length)];
    const targets = { rapid: 14, technique: 12, cloze: 8, quotematch: 1,
                      marking: 5, essay: 3, bandgrid: 1, deconstruct: 8 };
    return { day, mode, target: targets[mode] || 10, reward: 120, xp: 150 };
  }

  function daily() {
    const spec = dailySpec();
    if (data.daily.day !== spec.day) {
      data.daily = { day: spec.day, progress: 0, claimed: false, spec };
      save();
    } else data.daily.spec = spec;
    return data.daily;
  }

  function progressDaily(mode, by) {
    const d = daily();
    if (d.claimed || d.spec.mode !== mode) return false;
    d.progress = Math.min(d.spec.target, d.progress + (by === undefined ? 1 : by));
    save();
    return d.progress >= d.spec.target;
  }

  function claimDaily() {
    const d = daily();
    if (d.claimed || d.progress < d.spec.target) return false;
    d.claimed = true;
    addCoins(d.spec.reward, true);
    addXP(d.spec.xp);
    return true;
  }

  /* ── weekly quests ───────────────────────────────────────────
     Each quest names a cumulative stat; progress is that stat minus a snapshot taken
     at week rollover, so no per-event plumbing is needed anywhere. */
  const QUEST_POOL = [
    { id:"q_answer",  stat:"answered",         target:180, xp:1400, coins:700, icon:"📝",
      name:"Grind it out", desc:"Answer 180 questions" },
    { id:"q_correct", stat:"correct",          target:120, xp:1600, coins:800, icon:"🎯",
      name:"On target", desc:"Get 120 questions right" },
    { id:"q_tech",    stat:"techniquesNamed",  target:60,  xp:1300, coins:650, icon:"🔍",
      name:"Named and shamed", desc:"Identify 60 techniques" },
    { id:"q_cloze",   stat:"clozeSolved",      target:40,  xp:1500, coins:750, icon:"🕳️",
      name:"Word perfect", desc:"Complete 40 cloze quotes" },
    { id:"q_mark",    stat:"paragraphsMarked", target:25,  xp:1600, coins:800, icon:"📝",
      name:"Relief marker", desc:"Mark 25 paragraphs" },
    { id:"q_essay",   stat:"essaysAssembled",  target:12,  xp:1400, coins:700, icon:"🧱",
      name:"Structural work", desc:"Assemble 12 paragraphs or essays" },
    { id:"q_thesis",  stat:"thesesForged",     target:15,  xp:1400, coins:700, icon:"✍️",
      name:"Position taken", desc:"Forge 15 theses" },
    { id:"q_says",    stat:"sentencesNailed",  target:20,  xp:1500, coins:750, icon:"💬",
      name:"Say it in one", desc:"Nail 20 effect statements" },
    { id:"q_vault",   stat:"quotesMastered",   target:25,  xp:1500, coins:750, icon:"🗝️",
      name:"Vault keeper", desc:"Have 25 quotes mastered" },
    { id:"q_boss",    stat:"bossWins",         target:3,   xp:2200, coins:1100, icon:"⚔️",
      name:"Boss hunter", desc:"Defeat 3 Module Bosses" },
    { id:"q_perfect", stat:"perfectRuns",      target:5,   xp:2000, coins:1000, icon:"✨",
      name:"Flawless five", desc:"Finish 5 perfect runs" },
    { id:"q_survive", stat:"survivalBest",     target:25,  xp:1800, coins:900, icon:"💀",
      name:"Last stand", desc:"Reach a 25-question Survival run" }
  ];

  /** ISO-ish week key, e.g. "2026-W31". */
  function weekKey(d) {
    const t = d || new Date();
    const target = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
    const week = 1 + Math.round((target - firstThursday) / (7 * 86400000));
    return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  function statFor(key) {
    if (key === "quotesMastered") return Object.values(data.srs).filter(c => c.box >= 5).length;
    return data.stats[key] || 0;
  }

  function weekly() {
    const wk = weekKey();
    if (data.weekly.week !== wk) {
      const rng = U.seededRandom(U.hash("closereading-week-" + wk));
      const picked = U.seededShuffle(QUEST_POOL, rng).slice(0, 3).map(q => q.id);
      const baseline = {};
      QUEST_POOL.forEach(q => (baseline[q.stat] = statFor(q.stat)));
      data.weekly = { week: wk, baseline, quests: picked, claimed: [] };
      save();
    }
    return data.weekly;
  }

  function weeklyQuests() {
    const w = weekly();
    return w.quests.map(id => {
      const q = QUEST_POOL.find(x => x.id === id);
      const base = (w.baseline && w.baseline[q.stat]) || 0;
      const done = Math.max(0, Math.min(q.target, statFor(q.stat) - base));
      return { quest: q, done, target: q.target,
               complete: done >= q.target, claimed: w.claimed.includes(id) };
    });
  }

  function claimQuest(id) {
    const w = weekly();
    const entry = weeklyQuests().find(e => e.quest.id === id);
    if (!entry || !entry.complete || entry.claimed) return false;
    w.claimed.push(id);
    data.stats.questsDone = (data.stats.questsDone || 0) + 1;
    addCoins(entry.quest.coins, true);
    addXP(Math.round(entry.quest.xp * xpMultiplier()));
    return true;
  }

  /* ── Draft Desk (§0.5) ───────────────────────────────────────
     Stored in the save so it survives a reload and rides along in the export — losing
     drafts on a device change would be worse than losing XP. It earns nothing, and it
     earns nothing *structurally*: nothing here calls addXP or addCoins. */
  function saveDraft(draft) {
    const list = data.drafts || (data.drafts = []);
    const i = list.findIndex(d => d.id === draft.id);
    if (i >= 0) list[i] = draft; else list.unshift(draft);
    if (list.length > 60) list.length = 60;
    data.stats.draftWords = list.reduce((n, d) => n + U.words(d.body || ""), 0);
    save();
    return draft;
  }
  function deleteDraft(id) {
    data.drafts = (data.drafts || []).filter(d => d.id !== id);
    save();
  }

  function reset() {
    data = DEFAULT();
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    emit();
  }

  /* ── the text manifest ─────────────────────────────────────
     Read through here, never straight off EN.DATA.activeTexts, so a student can change
     their texts in Settings without editing a file. Bank.invalidate() must be called
     after any write — the quote pool is memoised and would otherwise still hold the old
     selection until a reload. */
  function activeTexts() {
    const m = data.manifest;
    if (!m) return EN.DATA.activeTexts;
    return {
      common:  m.common  || null,
      moduleA: (m.moduleA || []).slice(0, 2),
      moduleB: m.moduleB || null,
      moduleC: m.moduleC || null
    };
  }

  /** Set one module slot. `value` is an id, an array of two for Module A, or null. */
  function setSlot(mod, value) {
    const cur = activeTexts();
    const next = {
      common: cur.common, moduleA: [].concat(cur.moduleA || []).filter(Boolean),
      moduleB: cur.moduleB, moduleC: cur.moduleC
    };
    if (mod === "moduleA") next.moduleA = [].concat(value || []).filter(Boolean).slice(0, 2);
    else next[mod] = value || null;
    data.manifest = next;
    save();
    if (EN.Bank) EN.Bank.invalidate();
    emit();
    return next;
  }

  /* ── poem selection ───────────────────────────────────────── */

  /** The poem ids in play for a text. Null if the text has no poem breakdown. */
  function enabledPoems(textId) {
    const t = EN.DATA.texts[textId];
    if (!t || !t.poems || !t.poems.length) return null;
    const saved = (data.poems || {})[textId];
    if (Array.isArray(saved)) {
      /* Filter against the file, so a poem removed from the data file cannot linger in a
         save and leave the student with an id that resolves to nothing. */
      const known = new Set(t.poems.map(p => p.id));
      return saved.filter(id => known.has(id));
    }
    return t.poems.filter(p => p.core).map(p => p.id);
  }

  /** Is this quote's poem in play? Quotes with no `poem` tag always are. */
  function poemEnabled(textId, poemId) {
    if (!poemId) return true;
    const on = enabledPoems(textId);
    return on === null ? true : on.includes(poemId);
  }

  function setPoems(textId, ids) {
    (data.poems || (data.poems = {}))[textId] = [].concat(ids || []);
    save();
    if (EN.Bank) EN.Bank.invalidate();
    emit();
  }

  /** Reset a text's poem selection to the file's `core` flags. */
  function resetPoems(textId) {
    if (data.poems) delete data.poems[textId];
    save();
    if (EN.Bank) EN.Bank.invalidate();
    emit();
  }

  return {
    load, save, flush, replaceSave, onChange, emit,
    activeTexts, setSlot, enabledPoems, poemEnabled, setPoems, resetPoems,
    get data() { return data; },
    xpNeeded, levelTitle, addXP, addCoins, spendCoins, MAX_LEVEL,
    difficulty, xpMultiplier, canPrestige, doPrestige, masteryTier,
    weekly, weeklyQuests, claimQuest, weekKey, QUEST_POOL,
    touchStreak, streakBonus,
    recordAnswer, noteStreak, bump, markMode, recordScore,
    mastery, textMastery, overallAccuracy,
    usePowerup, grantPowerup, ownsTheme, ownsAvatar,
    cardState, reviewCard, dueCards, cardXpEligible, markCardXp,
    freeTextEligible, markFreeText, freeTextDay,
    checkAchievements, achievementStats,
    daily, dailySpec, progressDaily, claimDaily,
    saveDraft, deleteDraft, reset, storageFailing, saveSize
  };
})();
