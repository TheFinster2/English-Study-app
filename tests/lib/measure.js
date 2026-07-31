/* Load the data files in a Node vm sandbox where the context global IS `window`,
   the way the browser sees them. Shared by validate.js and the authoring loop. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadData(root, files) {
  const ctx = { console };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.location = { protocol: "http:", href: "http://x/", hash: "" };
  ctx.document = { baseURI: "http://x/", createElement: () => ({ style: {} }), head: { appendChild(){} } };
  vm.createContext(ctx);
  const loaded = [];
  for (const f of files) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) throw new Error("missing data file: " + f);
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
    loaded.push(f);
  }
  return { ctx, EN: ctx.EN, loaded };
}

/** Every js/data file, in script order (which is also sw.js's PRECACHE order). */
function dataFiles(root) {
  const dir = path.join(root, "js/data");
  const texts = fs.readdirSync(path.join(dir, "texts")).filter(f => f.endsWith(".js")).sort()
    .map(f => "js/data/texts/" + f);
  const top = fs.readdirSync(dir).filter(f => f.endsWith(".js")).sort().map(f => "js/data/" + f);
  // meta/texts manifest first so the text files have somewhere to register.
  /* util.js first — it is not data, but the suites need U.words and U.normalise to check
     the data, and loading it here keeps every suite from having to know that. */
  const order = ["js/core/util.js", "js/data/meta.js", "js/data/texts.js"];
  return order
    .concat(texts)
    .concat(top.filter(f => !order.includes(f)));
}

/** Every question in the bank, discovered by the same rule bank.js uses. */
function allQuestions(EN) {
  const D = EN.DATA;
  return Object.keys(D)
    .filter(k => /^q[A-Z0-9]/.test(k) && Array.isArray(D[k]) && D[k].length && Array.isArray(D[k][0].choices))
    .sort()
    .reduce((acc, k) => acc.concat(D[k]), []);
}

module.exports = { loadData, dataFiles, allQuestions };

/**
 * State.achievementStats() on a brand-new save.
 *
 * Loading state.js needs a localStorage that does nothing, which is exactly what we want:
 * a fresh save with no history. Derived from the app rather than hand-written, so the
 * reachability check in validate.js cannot quietly stop covering new statistics.
 */
function freshStats(root) {
  const store = new Map();
  const ctx = { console };
  ctx.window = ctx; ctx.self = ctx;
  ctx.location = { protocol: "http:", href: "http://x/", hash: "" };
  ctx.document = { baseURI: "http://x/", addEventListener() {} };
  ctx.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  };
  ctx.setTimeout = setTimeout; ctx.clearTimeout = clearTimeout;
  vm.createContext(ctx);
  for (const f of ["js/core/util.js", "js/data/meta.js", "js/core/mark.js", "js/core/state.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
  }
  ctx.EN.State.load();
  return ctx.EN.State.achievementStats();
}

module.exports.freshStats = freshStats;
