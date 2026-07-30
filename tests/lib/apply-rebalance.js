/* Apply the length-rank rebalancer to one or more question-bank files in place.
   Usage: node tests/lib/apply-rebalance.js qModuleC:js/data/questions-modulec.js … */
const fs = require("fs");
const path = require("path");
const { loadData, dataFiles } = require("./measure.js");
const { rebalanceOne, targets } = require("./rebalance.js");

const ROOT = path.join(__dirname, "..", "..");
const { EN } = loadData(ROOT, dataFiles(ROOT));

for (const arg of process.argv.slice(2)) {
  const [key, rel] = arg.split(":");
  const FILE = path.join(ROOT, rel);
  const bank = EN.DATA[key];
  if (!bank) { console.error("no such bank:", key); process.exit(1); }
  const T = targets(bank);
  let src = fs.readFileSync(FILE, "utf8"), edits = 0, touched = 0;

  for (const q of bank) {
    const { choices, changed } = rebalanceOne(q, T[q.id]);
    if (!changed) continue;
    edits += changed; touched++;
    const at = src.indexOf(`id:"${q.id}"`);
    const cStart = src.indexOf("choices:[", at), cEnd = src.indexOf("],", cStart);
    const block = src.slice(cStart, cEnd + 1);
    const items = []; const re = /"((?:[^"\\]|\\.)*)"/g; let m;
    while ((m = re.exec(block)) !== null) items.push({ start: m.index, end: m.index + m[0].length });
    // Replace from the end so earlier offsets stay valid.
    for (let i = items.length - 1; i >= 0; i--) {
      if (choices[i] === q.choices[i]) continue;
      src = src.slice(0, cStart + items[i].start) + JSON.stringify(choices[i]) + src.slice(cStart + items[i].end);
    }
  }
  fs.writeFileSync(FILE, src);
  console.log(`${key}: ${edits} clauses trimmed across ${touched} questions`);
}
