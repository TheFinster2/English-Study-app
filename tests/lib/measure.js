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
  const order = ["js/data/meta.js", "js/data/texts.js"];
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
