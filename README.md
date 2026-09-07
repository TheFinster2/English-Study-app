# Close Reading

A study app for **HSC English Advanced**. Techniques, quotes, band descriptors, essay
structure, and marking for the sentences you type — all of it running on the phone in your
hand, offline, with no account and no server.

> This app trains the moves and marks your sentences. Your teacher marks the essay.

That sentence is the whole design brief. What an app can do honestly is drill technique
recognition, hold quotes in your head, teach you what a Band 6 paragraph looks like from
the inside, and tell you whether one typed sentence means roughly what a good answer
means. What it cannot do is read 1,000 words and give you a mark, so it doesn't pretend to.

## Getting it running

```
git clone https://github.com/TheFinster2/English-Study-app.git
cd English-Study-app
python3 -m http.server 8000
```

Then open <http://localhost:8000>. There is **no build step** — no npm install, no
bundler, no transpiler. `index.html` loads plain `<script>` tags in dependency order and
that is the entire toolchain.

The clone is about **35 MB**, most of it the language model in `models/minilm/`. That is
checked in deliberately (see below) and not stored in Git LFS.

### On a phone

Open the site in Safari or Chrome and use **Add to Home Screen**. It installs as a PWA:
full screen, its own icon, and it works with no signal once the shell has cached. Designed
at 390px and checked at 360px with zero horizontal scrolling.

### Publishing it

**Before you push a change to the app itself**, move the version and re-stamp:

```
# bump EN.BUILD in js/app.js and CACHE in sw.js to the same number, then
node tests/stamp.js
```

The service worker is cache-first on a fixed version string, so a device holding the old
cache serves the **entire** old app forever — not a stale file here and there, all of it.
Seven deploys went out without that bump and none of them could reach an installed phone,
while every test passed against the new source. The `offline` suite now hashes the shell and
stores the hash beside the version, so changing the app without moving the version is a test
failure with instructions rather than a silent non-delivery.

Push to `main`, then in the repository **Settings → Pages**, set Source to *Deploy from a
branch*, branch `main`, folder `/ (root)`. That toggle is a manual step — it cannot be
done from the command line or by an agent, so it is on you. Every path in the app is
relative and resolved against `document.baseURI`, so the `/English-Study-app/` subpath
works without configuration.

## Choosing your texts

**In the app**: Settings → Your texts, or the Change button on the home screen. Pick one
text per module (two for Module A, which is a pair). Everything downstream keys off this —
which questions are drawn, which quotes enter the Vault, which paragraphs the Marking Desk
shows, which texts get their own mastery bar.

Donne gets a second level, because he is not one text but a selection of **54 poems** and no
two courses cut them the same way. Every poem can be switched on and off individually
(Settings → Your texts → Poems), with group and preset shortcuts. A fresh install enables
the twelve commonly-set ones rather than all 54, so the Vault does not open onto quotes from
poems you have never been given.

`js/data/texts.js` still holds the **default** for a fresh install if you would rather edit
a file; `State.activeTexts()` merges your in-app choice over it, and that is what the app
reads. The repo ships:

| Module | Texts included |
| --- | --- |
| Common — Texts and Human Experiences | *Nineteen Eighty-Four* |
| Module A — Textual Conversations | Donne's poetry · *W;t* (Edson) |
| Module B — Critical Study | *King Henry IV, Part 1* |
| Module C — The Craft of Writing | skills-only, text-agnostic |
| Starters | *The Crucible* · *Hamlet* · *The Tempest* · *Hag-Seed* |

About a third of the app — techniques, rubric verbs, band descriptors, module concepts,
essay architecture, question deconstruction — is text-agnostic and works for any student.

Extracts are quoted for study and attributed to their composers: a line, a sentence, a
short passage. Never a whole poem, never a chapter. Buy the texts.

**Every quote on screen carries its source** — the work, the composer, the locus, and the
speaker where there is one. For the Donne selection the work is the *poem*, because "The Sun
Rising, ll. 1–3" is what a student cites and "The Metaphysical Poetry of John Donne" is only
the volume it ships in. A Vault card will copy the quote with its citation attached, so a
line reaches an essay without its line reference being retyped from a phone screen. Module C's
samples are labelled *written for this app*, because they are model sentences rather than
extracts and nothing should let them be mistaken for one.

## How marking works

Three layers, in order, and only the first two touch your XP.

**Layer A — structural.** Exact and normalised comparison. Multiple choice, ordering,
band selection, grid cells. Deterministic and instant.

**Layer B — fuzzy.** Normalised Levenshtein at 0.85, for **single words and short names
only**. Typing "Newspeek" for "Newspeak" is a spelling slip, not a wrong answer. It is
never handed a sentence — `mark.js` enforces a six-word ceiling and warns if something
tries.

**Layer C — meaning.** A 23 MB MiniLM sentence-embedding model, bundled in the repo and
run in your browser through WebAssembly. It compares your sentence to three to five model
answers and to two or three deliberate near-misses.

The result is a **mark out of four**, from named criteria — and three of the four marks are
deterministic, so when you lose one the app can say which criterion and why:

| | | |
| --- | --- | --- |
| **Point** | 0–2 | does it answer the question? *(the embedding — the only fuzzy part)* |
| **Detail** | 0–1 | is the text actually in it? *(technique named, or three words quoted)* |
| **Effect** | 0–1 | does it say what that **does**? *(an analytical verb, not a plot verb)* |

Point gates the total: a fluent, well-anchored answer to a *different* question caps at one
mark, because naming a technique is worth nothing if the claim is wrong. And the **fourth**
mark needs more than a score over the line — it needs the right reading to be clearly nearer
than the nearest wrong one, because on 49 hand-labelled responses good answers span 0.396 to
0.906 cosine and wrong ones span 0.113 to 0.979. Those distributions *overlap*: no threshold
exists that scraps no good answer and passes no wrong one, so the threshold sits below the
weakest good answer and the last mark is gated on the contrast instead.

You will never see the underlying similarity number. A cosine is not a mark, and dressing
one up as a band would be the single most dishonest thing this app could do — the mark above
is a rubric, not a rescaled cosine.

Layer C is **opt-in**. It is not downloaded on first load; Settings offers it behind a
button with the size stated. Skip it and the three sentence modes still run — they show
model answers instead of marking yours, and they pay nothing. Because Layer C is a
similarity threshold rather than an equality check, what it pays is capped, rate-limited
to once per prompt per day, and blocked for a resubmitted answer.

**Nothing leaves your device, ever.** No API key, no account, no backend, and no network
request of any kind once the app has loaded. The model is checked into `models/minilm/`
and the runtime into `vendor/transformers/` precisely so that promise does not depend on
anyone's CDN staying up. `transformers.js` defaults to fetching weights from HuggingFace,
which is disabled explicitly (`env.allowRemoteModels = false`) — the one configuration
line in this app that matters most.

## What's in it

- **15 study modes** — Rapid Fire, Module Drill, Survival, Mistake Rehab, Technique Hunt,
  Cloze Crunch, the Marking Desk, the Essay Architect, Quote Match, Band Grid, Question
  Deconstruction, Say It In One, Thesis Forge, Rewrite Rescue, and **Section I**
- **Section I** — four short answers, **one clock for all of them**, and nothing marked
  until you submit. Say It In One marks each sentence as it arrives, which is right for
  learning a move and wrong for sitting an exam: in an exam you budget one block of time
  across several questions and nobody tells you anything until it is over. Marked by the
  same Layer C rubric, out of sixteen, with the criteria behind every mark
- **5 module bosses** plus **The Final Paper**, each with a gimmick that attacks a
  different habit — an editor who rewrites your answer, a critic who hides the labels
- **The Quote Vault** — 324 quotes on a five-box Leitner schedule, with the ones that keep
  beating you named rather than left to cycle: four misses and the app shows the line in
  full before asking for it again
- **Reference screens** — 229 techniques, 12 rubric verbs, the band descriptors, module
  concepts, essay architecture, per-text quote sheets
- **The Draft Desk** — somewhere to write, with a word count, an exam clock and export to
  a file. No XP, no Marks, no marking, no one reading over your shoulder
- **The Arcade** — three games rented with Marks that pay **nothing but a high score**.
  Letter Crush is a match-3 with gravity, cascades and three specials that combine, and it
  always has a word to fill — SATIRE, ARTIST, STRAIT — from the six letters its tiles use.
  Margin Runner is a nib running down a ruled page: variable jump height, coyote time, a
  jump buffer and a dive, with ink laid along the trajectory that solves each obstacle, so
  the safe line and the scoring line are different lines. Pattern internals are measured in
  frames rather than pixels, and every one is checked to be clearable for the whole crossing
  at both ends of the speed range

403 multiple-choice questions, each with a worked explanation. 60 band-tagged paragraphs.
62 free-text prompts with model answers and near-misses. 14 essay puzzles, 42 topic
sentence pairs, 79 achievements, 10 themes, 60 levels. The counts are asserted by
`tests/suites/validate.js`, so this list cannot quietly drift from what ships.

Two things in this app earn nothing at all, and that is enforced structurally rather than
promised in a comment: neither `js/core/arcade.js`, `js/games/arcade-*.js` nor
`js/screens/draft.js` contains a call to `UI.award()`. An endless runner paying even 1 XP
a second beats studying, and a "free" mode that pays is just the optimal strategy wearing
a disguise.

## Architecture

```
index.html            script tags in dependency order — this IS the build system
sw.js                 precache the shell; never touches the model's cache bucket
js/core/              util · mark · state · audio · fx · ui · bank · arcade
js/data/              pure literals on EN.DATA; no behaviour, no dependencies
js/data/texts/        one file per prescribed text
js/games/             one file per mode
js/screens/           one function per route
js/app.js             routes, boot, service worker
models/ vendor/       Layer C, vendored — never fetched
tools/icons.js        run by hand to rasterise the icon; the app never touches it
```

One global (`window.EN`), hash routing, vanilla DOM through a single `el()` helper, and
localStorage on a debounce with an explicit flush when the tab is backgrounded. Every
reward in the app flows through one function, `UI.award()`, and every game gets its chrome
from `UI.gameShell()` and registers its teardown with `UI.onLeave()`.

### Playing without a mouse

Number keys and A–D pick an option, Enter advances, Escape closes a dialog. Every mode's
advance and submit button carries `js-next` or `js-submit`, which is what the global binding
in `app.js` looks for — `tests/suites/a11y.js` asserts every mode has one, because three of
them were quietly mouse-only until it did.

Dialogs are real dialogs: `role="dialog"`, focus moved in on open, Tab trapped inside, focus
restored on close. Feedback panels and verdicts are `aria-live="polite"`, so the answer to
"was I right" is spoken. Timers are `aria-live="off"` — a chip changing once a second is read
aloud once a second otherwise, which makes a timed mode unusable rather than just unlabelled.
Boss health bars are real `progressbar`s because they have no text equivalent; mastery bars
are `aria-hidden` because their percentage is already printed beside them.

If something looks stale after an update, **Settings → Force refresh** unregisters every
service worker, deletes the shell caches and reloads clean. It keeps your save, and it
keeps the downloaded model — re-charging somebody 23 MB of mobile data for a new
stylesheet would be a punishment, not a fix.

## Tests

```
node tests/run.js            # everything
node tests/run.js validate   # one suite
node tests/run.js --list     # what there is
```

No test framework — adding one would be the first dependency in a project whose premise is
not having any. A suite is a file in `tests/suites/` exporting `{ name, run(t) }`.

| suite | needs | what it holds |
| --- | --- | --- |
| `validate` | — | content shape, the volume targets, every cross-reference |
| `bias` | — | can the bank be beaten without reading the question? |
| `offline` | — | `sw.js` precaches everything `index.html` loads; the model bucket is never swept |
| `smoke` | browser | every route at 390px **and** 360px, no overflow, no action under the nav bar |
| `play` | browser | play every mode and a boss; nothing throws, nothing ejects you |
| `economy` | browser | the anti-rush floor is both real **and** reachable; the arcade pays nothing |
| `marking` | browser | the marking stack ranks answers the way a marker would |
| `a11y` | browser | keyboard play, dialog semantics, and what gets announced |
| `calibrate` | browser | run the 49 hand-labelled responses; report where the app and a marker disagree |
| `arcade` | browser | the arcade plays, and pays nothing |
| `storage` | browser | a full disk is detected, announced, and recovered from |
| `search` | browser | the reference is searchable, and the right thing comes first |
| `nextup` | browser | the home screen's recommendation ladder is ordered, and its routes go somewhere |
| `glossary` | browser | the terms an explanation uses are explained where it uses them |
| `motion` | browser | a device asking for less motion is honoured, and can be overridden |
| `runner` | browser | Margin Runner's jump, its obstacles and its rewards agree with each other |
| `cite` | browser | every quote on screen says which work, composer and locus it came from |
| `skills` | browser | answers are tracked by skill, and every skill leads somewhere that trains it |
| `paper` | browser | a section runs on one clock, marks nothing until submitted, and pays what it shows |
| `leech` | browser | a quote missed four times is named, and drilled differently |

The browser suites need Playwright (`npm i -D playwright`) and are **skipped**, not failed,
without it — the data suites are the ones that must run anywhere.

Every assertion in here exists because something was actually wrong:

- `bias` — the Common-Module bank first measured **69.7%** longest-option-is-the-key against
  a 25% chance baseline. Fixing that overshot to 1.6% longest and 79% at rank two, so the
  strategy simply became "pick the second longest". The metric is the whole rank
  distribution, and it is checked per file, because an overall figure inside the limit hides
  one badly skewed module.
- `economy` — the rush floor grew until it exceeded the clock. **99%** of Rapid Fire
  questions had a floor above their time share, so the mode paid zero to everybody. It now
  asserts a floor exists *and* that at least ten seconds of every boss round can score.
- `smoke` — one long unbreakable locus pushed the document 74px past a 360px viewport,
  because grid items refuse to shrink below their max-content width. And four separate
  modes put their submit button under the floating nav bar: enabled, on screen, untappable.
- `play` — a clock that ran through the feedback panel could end a run while the student was
  reading, which reads as being thrown out of the app.
- `marking` — the near-miss veto was rejecting good answers for being about the right
  subject. The suite asserts the *ordering* of a hand-labelled set, not absolute scores, so
  it survives a model swap.
- `calibrate` — the 62 prompt thresholds shipped at a single copied value that had never
  been measured. Three retunings later (0.62 → 0.50 → 0.38, each one measured) the labelled
  set separates cleanly: mean mark 3.21 good, 2.54 decent, 1.78 thin, 1.23 wrong. The suite
  prints its disagreements, because the point of a calibration run is to tell you which
  number to move.
- `arcade` — plays 45 real moves of Letter Crush from the DOM (not from the game's own
  model, so a board that *drew* wrong would still fail), then checks the ledger: tens of
  thousands of points and no XP, level, Marks, achievement or statistic has moved. It also
  guards the mechanics — 64 tiles after every cascade, no two tiles sharing a square, and
  never a dead board.
- `leech` — a Leitner box resets to 1 on every miss, so a quote you keep failing comes back
  tomorrow and forever, indistinguishable from the forty that are working. `lapses` had been
  counted since the Vault was written and nothing read it. The fix is not suspension —
  hiding a quote a student needs is the wrong answer — so they are named, and the
  *intervention* changes: Cloze Crunch shows a leech in full before asking for it and asks
  for fewer words. That second half is the load-bearing one, and the suite asserts it,
  because the box reset means a leech would otherwise arrive at exactly the difficulty that
  has already failed four times running.
- `paper` — holds the three constraints that *are* the mode (one clock, free navigation with
  answers preserved, no marking until submit) plus the two things that were wrong when it was
  written. `UI.results` **displays** a payout and `UI.award` **grants** one; the first version
  called only the former, so the report showed XP that never reached the save — the suite
  reads the ledger, not the screen, and was verified by reverting the fix. And `let area` was
  declared beside `render()` while `render()` ran during setup, so the textarea never
  appeared: a paper with no way to answer it. Function declarations hoist and `let` does not.
- `skills` — mastery per module and per text are both true and neither is instruction:
  "Module B 61%" tells you which book to reread and nothing you can do tonight. Answers now
  carry their topic, and the suite holds the two things that make the axis honest — a skill
  with no MCQ pool (Bands, Essay structure, Question analysis) must not open a "drill" that
  filters to nothing, falls back to the whole bank and runs under a title claiming to be
  about bands; and ten answers is the floor before a skill is called weak, because a
  diagnosis built on four is a horoscope the student will follow.
- `cite` — quotes used to be captioned "speaker · locus" and nothing else, so a line could
  appear in a game reading "Part 2, Ch. 7 — Winston" with no indication of which book. Every
  quote already had a locus, a speaker and a composer; the gap was entirely in the rendering.
  Three things were wrong on the first pass and the suite holds all three: the **work** is
  the poem, not the volume it ships in ("The Sun Rising", not "The Metaphysical Poetry of
  John Donne") and the poem title has to be stripped from the locus or the citation reads
  "The Sun Rising — The Sun Rising, ll. 1–3"; a **bare voice note is not an attribution**,
  since all 93 Donne quotes carry the literal speaker "speaker"; and attribution **must not
  become a giveaway** — adding the citation to Quote Match printed the speaker on the card in
  the round whose question is "who says this".
- `runner` — Margin Runner is a canvas, so it exposes a read-only `state()` and its
  `geometry` constants for the suite. Testing it through the pixels was tried first, on the
  principle that what is DRAWN is what matters, and it measured the word "Foolscap" — the
  chapter label, the ink drops and the floating scores all pass through the runner's column.
  Its most valuable check is **solvability**: for every pattern, at the slowest speed and the
  fastest, the jump the pattern demands has to keep the runner clear for the *whole* crossing
  and not merely at first contact — and obstacles are clustered into the jumps that actually
  take them, because treating a pattern as one jump reported `gauntlet` as needing a 60-frame
  jump it was never meant to need. That check caught four separately unavoidable
  configurations after "impossible to avoid" was reported: a 34px `staples` pair took 20
  frames to cross against a 15-frame tap window, so it did not fit in a tap jump at *any*
  spacing; `gauntlet` used fixed pixel offsets, fair at 5px/frame and lethal at 8.4; the
  `strike` cleared the top of its bob by one pixel; and a plain `footnote` — the simplest
  obstacle in the game — had **1.7 frames** of tolerance at opening speed.
  The rest of what the suite holds is the design, because it is a set of numbers that
  contradict each other the moment one moves: a tap apex of **59px** clears a 40px footnote and cannot clear
  the 78px stack, a held apex of **110px** can, a hanging bar catches a standing runner and
  misses a ducking one inside a 24px window, and the near-miss threshold sits under the
  duck's clearance so a duck cannot pay it for free. It also holds one input regression: a
  document-level `pointerup` that released both controls turned a held jump into a tap the
  moment you let go of Duck.
- `motion` — reported twice as "I can only see the Letter Crush animations for about a
  frame", and it was not a duration. `prefers-reduced-motion: reduce` on the device was an
  absolute veto no in-app setting could lift, and the Motion row was a boolean switch
  rendering a field that defaulted to true — so it read ON while a whole cascade resolved
  in **41ms** against 1206ms. The suite holds the full six-cell matrix of setting × device,
  the legacy migration in both directions, and that Settings states the *effective* state.
- `glossary` — asserts coverage *and* restraint. The obvious implementation matches
  technique aliases as well as names, and the aliases include "so" and "because": that
  version matched 218 of 403 questions with "causal conjunction" hit 74 times, which is a
  wall of chips under every answer. Canonical names of five characters or more give 162 of
  403 at 1.38 chips each. The suite also holds that opening a definition never changes the
  route — leaving a run to look something up is the failure the feature replaces.
- `nextup` — asserts the *order* of the ladder, by building the save each rung needs on top
  of the previous one: the mistakes rung is only meaningful because the due-cards rung ran
  first and its setup silenced the Vault. Each route is followed in the save that produced
  it, because Mistake Rehab renders an empty state once the backlog is gone and checking
  the routes afterwards tested the wrong screen. It also holds the evidence floor: a module
  with nine answers must not be called weak.
- `search` — asserts ranking, not existence. Groups printed in a fixed running order, so
  "power" led with Techniques and buried the concept actually named Power; and a matched
  poem printed its quotes and then the Quotes group printed the same three lines again
  underneath. The dedupe check counts the quotes it found first, because a dedupe test that
  matched nothing at all would pass.
- `storage` — a refused write used to be a `console.warn` and nothing else, so a student
  with a full disk kept playing and kept earning and lost all of it. Writing the test taught
  two things guesswork had wrong: a full disk does not break every write, because replacing
  the save key with a same-sized value frees the old one first — the failure is the save
  *growing*, which is what a draft does. And filling with 256 KB chunks proves nothing about
  whether a 2 KB save still fits, so the fill shrinks until even 128 bytes are refused. The
  first version of this test got both wrong and passed a completely broken app.
- `a11y` — three modes had no `js-next`/`js-submit` class, so the global Enter binding
  could not reach them and they were quietly mouse-only. Modals had no dialog semantics and
  no focus trap. And every timer needed `aria-live="off"`: a chip that changes once a second
  is read aloud once a second, which makes a timed mode unusable rather than just unlabelled.

## Your save

Everything lives in one localStorage key on your device. There is no account and nothing
to sign into, which also means clearing site data deletes it — **export before switching
phones** (Settings → Export save, which includes your drafts).

## Licence

The code is yours to use. The literary extracts are not — they are quoted for study under
fair dealing and attributed to their composers.
