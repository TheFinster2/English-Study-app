/* Proves Layer C works at all: loads the vendored runtime + weights in a real browser,
   embeds sentences, and checks the numbers behave the way §0.1 and §6.5.4 claim.
   Run this before building any Layer C UI. */
const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const PORT = 8823;
const MIME = { ".js":"text/javascript", ".json":"application/json", ".wasm":"application/wasm",
               ".onnx":"application/octet-stream", ".html":"text/html", ".css":"text/css" };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, ""));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

const PAIRS = [
  // The brief's own worked example. Fuzzy scores ~0.09 on this; embeddings must not.
  ["Hotspur values martial honour above all else",
   "Hotspur prioritises chivalric duty over pragmatism", "paraphrase", 0.45],
  // The negation trap: near-identical vectors, opposite claims.
  ["Hotspur values honour above pragmatism",
   "Hotspur values pragmatism above honour", "reversal", 0.80],
  // Cosine is signed, so an unrelated pair should land near or below zero. This is a
  // CEILING, not a floor — and it is what makes a 0.62 threshold mean anything.
  ["Orwell presents language as an instrument of power",
   "The flea is a conceit for physical union", "unrelated", -1, 0.20]
];

(async () => {
  await new Promise(r => server.listen(PORT, "127.0.0.1", r));
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const page = await browser.newPage();
  const outbound = [];
  page.on("request", r => { const u = new URL(r.url()); if (u.host !== `127.0.0.1:${PORT}`) outbound.push(r.url()); });
  page.on("response", r => { if (r.status() === 404) console.log("  [404]", r.url()); });
  page.on("console", m => { if (m.type() === "error" && !/404/.test(m.text())) console.log("  [console error]", m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/tests/embed-fixture.html`);
  const t0 = Date.now();
  const result = await page.evaluate(async pairs => {
    const ok = await EN.Mark.load();
    if (!ok) return { ok: false, why: EN.Mark.downloadProgress() };
    const out = [];
    for (const [a, b, kind, floor, ceil] of pairs) {
      const va = await EN.Mark.embed(a), vb = await EN.Mark.embed(b);
      out.push({ a, b, kind, floor, ceil, dim: va.length, cos: EN.Mark.cosine(va, vb),
                 reversed: EN.Mark.reversed(a, b) });
    }
    return { ok: true, out };
  }, PAIRS);

  console.log(`\nmodel loaded in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  if (!result.ok) { console.error("FAIL: Layer C did not load:", result.why); process.exit(1); }

  let fail = 0;
  for (const r of result.out) {
    const pass = r.cos >= r.floor && (r.ceil === undefined || r.cos <= r.ceil);
    if (!pass) fail++;
    const bound = r.ceil !== undefined ? `≤ ${r.ceil}` : `≥ ${r.floor}`;
    console.log(`  ${pass ? "✓" : "✗"} ${r.kind.padEnd(11)} cos=${r.cos.toFixed(3)} (want ${bound})  dim=${r.dim}`);
    console.log(`      "${r.a}"\n      "${r.b}"`);
    if (r.kind === "reversal") {
      console.log(`      reversal backstop fires: ${r.reversed}`);
      if (!r.reversed) { console.log("      ✗ §6.5.4 backstop MISSED the reversal"); fail++; }
    }
  }
  if (result.out[0].dim !== 384) { console.log(`  ✗ expected 384 dims, got ${result.out[0].dim}`); fail++; }
  if (outbound.length) { console.log("  ✗ outbound requests:", outbound); fail++; }
  else console.log("\n  ✓ zero outbound requests");

  await browser.close(); server.close();
  console.log(fail ? `\nFAILED (${fail})` : "\nPASS");
  process.exit(fail ? 1 : 0);
})();
