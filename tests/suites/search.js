/* SEARCH — can a student find the thing they are looking up?
   ============================================================================
   The reference is the app's second half: 229 techniques, the band descriptors, the rubric
   verbs, every quote in every shipped text. It shipped with no way to search any of it, so
   "what does zeugma do" meant scrolling a 70 KB page on a phone.

   What this asserts is not that a search box exists but that it RANKS. Two things were
   wrong on the first pass and both are the kind that make a search feel broken rather than
   absent: groups printed in a fixed running order, so "power" led with Techniques and
   buried the concept actually named Power; and a matched poem printed its quotes and then
   the Quotes group printed the same three lines again underneath.
   ============================================================================ */
"use strict";
const { harness } = require("../lib/browser");

/* Each case: the query, the group that must come FIRST, and a string the first card must
   contain. Chosen as things a student types, not as things the index happens to hold. */
const CASES = [
  ["zeugma",            "Techniques",          "Zeugma"],
  ["modality",          "Techniques",          "Modality"],
  ["evaluate",          "Rubric verbs",        "Evaluate"],
  ["band 5",            "Bands",               "5"],
  ["topic sentence",    "Essay architecture",  "Topic sentence"],
  ["the sun rising",    "Poems",               "The Sun Rising"],
  ["death be not proud", "Poems",              "Holy Sonnet 10"],
  ["power",             "Module concepts",     "Power"]
];

module.exports = {
  name: "search",
  needsBrowser: true,
  about: "the reference is searchable, and the right thing comes first",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/reference");
      await page.waitForTimeout(400);

      const size = await page.evaluate(() => EN.Screens.reference.search("e").total);
      t.atLeast(size, 400, "the index covers the reference rather than a corner of it");
      t.note("  " + size + " entries indexed");

      for (const [q, group, first] of CASES) {
        await page.fill("#view .ref-search", q);
        await page.waitForTimeout(280);
        const r = await page.evaluate(() => ({
          groups: Array.from(document.querySelectorAll("#view .ref-results h2")).map(n => n.textContent),
          first: (document.querySelector("#view .ref-results .grid > *") || {}).textContent || "",
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        }));
        t.eq(r.groups[0], group, "“" + q + "” leads with " + group);
        t.ok(r.first.indexOf(first) >= 0,
             "  and its first card is " + first + (r.first.indexOf(first) >= 0 ? "" :
             " (got: " + r.first.replace(/\s+/g, " ").slice(0, 50) + ")"));
        t.eq(r.overflow, 0, "  with no horizontal overflow");
      }

      /* A poem prints its own quotes; the Quotes group must not print them again. */
      await page.fill("#view .ref-search", "the sun rising");
      await page.waitForTimeout(280);
      const quoted = await page.evaluate(() => {
        const seen = {}, dupes = [];
        const all = Array.from(document.querySelectorAll("#view .ref-results blockquote"));
        all.forEach(n => {
          const k = n.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
          if (seen[k]) dupes.push(k); else seen[k] = 1;
        });
        return { n: all.length, dupes };
      });
      /* Checked, not assumed: a dedupe test that matched no quotes at all would pass. */
      t.atLeast(quoted.n, 3, "the poem card prints the poem's quotes");
      t.eq(quoted.dupes, [], "and the Quotes group does not list them a second time");

      /* Nonsense must say so rather than showing an empty page. */
      await page.fill("#view .ref-search", "qqzzxx");
      await page.waitForTimeout(280);
      const none = await page.evaluate(() => ({
        empty: !!document.querySelector("#view .ref-results .empty"),
        live: (document.querySelector("#view .ref-results [aria-live]") || {}).getAttribute
          ? document.querySelector("#view .ref-results [aria-live]").getAttribute("aria-live") : null
      }));
      t.ok(none.empty, "a query that matches nothing says so");
      t.eq(none.live, "polite", "and the result count is a live region, so it is announced");

      /* Clearing restores the tab — a search box you cannot get out of is a trap. */
      await page.fill("#view .ref-search", "");
      await page.waitForTimeout(300);
      const back = await page.evaluate(() => ({
        hidden: document.querySelector("#view .ref-results").hidden,
        tab: !!document.querySelector("#view .tech-item"),
        nav: !document.querySelector("#view .ref-nav").hidden
      }));
      t.ok(back.hidden && back.tab && back.nav, "clearing the box puts the tab and its nav back");

      /* Typing must not re-render the input out from under the caret. */
      await page.click("#view .ref-search");
      await page.type("#view .ref-search", "irony", { delay: 50 });
      await page.waitForTimeout(300);
      t.ok(await page.evaluate(() => document.activeElement.classList.contains("ref-search")),
           "the box keeps focus while the results change under it");

      /* Every tab must still render, at both widths, with the box on it. */
      for (const w of [390, 360]) {
        await page.setViewportSize({ width: w, height: 844 });
        for (const tab of ["techniques", "rubric", "concepts", "essay", "texts"]) {
          await h.goto(page, "/reference/" + tab, 420);
          const st = await page.evaluate(() => ({
            chars: document.querySelector("#view").textContent.trim().length,
            box: !!document.querySelector("#view .ref-search"),
            ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
          }));
          t.atLeast(st.chars, 1500, w + "px " + tab + " still renders");
          t.ok(st.box, "  with the search box on it");
          t.eq(st.ov, 0, "  and no overflow");
        }
      }

      /* ── the Vault ──
         Three hundred quotes behind three chips and a 200-row cap. Same idea, narrower
         pool: the student's own quotes, matched on the line, the speaker, the locus, the
         techniques and the concepts. */
      await page.setViewportSize({ width: 390, height: 844 });
      await h.goto(page, "/vault", 700);
      const vrows = () => page.evaluate(() => ({
        n: document.querySelectorAll("#view .vault-row").length,
        first: (document.querySelector("#view .vault-row .vault-row-q") || {}).textContent || "",
        ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
      }));
      const all = await vrows();
      t.atLeast(all.n, 50, "the Vault lists the student's quotes");

      await page.fill("#view .vault-search", "compass");
      await page.waitForTimeout(260);
      const compass = await vrows();
      t.ok(compass.n > 0 && compass.n < all.n, "searching a word in a quote narrows the list");
      t.ok(/stiff twin/i.test(compass.first), "  and finds the compasses conceit by its subject");
      t.eq(compass.ov, 0, "  with no overflow at 390px");

      /* Word prefix, not bare substring — "act" lives inside "practice", and matching it
         there turned a search for "act 2" into a third of the Vault. */
      const loose = await page.evaluate(() => {
        const q = EN.Bank.quotes();
        return q.filter(x => /practice|exact|impact/i.test(
          [x.text, x.effect, x.locus].join(" "))).length;
      });
      await page.fill("#view .vault-search", "act 2");
      await page.waitForTimeout(260);
      const act = await vrows();
      t.ok(act.n < all.n / 4, "“act 2” is a narrow search, not a third of the Vault (" +
                              act.n + " of " + all.n + "; " + loose + " decoys in the pool)");

      await page.fill("#view .vault-search", "qqzzxx");
      await page.waitForTimeout(260);
      t.ok(await page.evaluate(() => !!document.querySelector("#view .vault-list .empty")),
           "a Vault search that matches nothing says so");

      await page.fill("#view .vault-search", "");
      await page.waitForTimeout(260);
      t.eq((await vrows()).n, all.n, "clearing the box restores the full list");
      t.ok(await page.evaluate(() => document.activeElement.classList.contains("vault-search")),
           "and the Vault box keeps focus while the list repaints under it");

      /* The concept filter was a field on the filter object that nothing ever rendered. */
      const applied = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("#view .vault-filters"));
        const chip = rows.length > 1 && Array.from(rows[1].querySelectorAll(".chip-btn"))[1];
        if (!chip) return null;
        const label = chip.textContent;
        chip.click();
        return label;
      });
      t.ok(!!applied, "the Vault offers concept filters");
      await page.waitForTimeout(600);
      const narrowed = await vrows();
      t.ok(narrowed.n > 0 && narrowed.n < all.n,
           "  and “" + applied + "” actually narrows the list (" + narrowed.n + " of " + all.n + ")");

      t.eq(page.errors.slice(0, 3), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
