/* Chromium plumbing shared by every browser suite: a static server, a launched browser,
   and a page that has already dismissed the first-run modal.

   The server is Node's http module rather than a dependency, and it is deliberately
   dumb — the app is a directory of plain files, which is the whole point of the project,
   so serving it needs no more than this. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".svg": "image/svg+xml", ".onnx": "application/octet-stream",
  ".wasm": "application/wasm", ".txt": "text/plain"
};

const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function serve(root) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
      const file = path.join(root, rel);
      /* Do not serve outside the project, even from a test. */
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404).end("not found"); return; }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
        res.end(buf);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

/**
 * Everything a browser suite needs, torn down by the returned `close`.
 * `open(route, opts)` gives a page already past the onboarding modal.
 */
async function harness(root) {
  const { chromium } = require("playwright");
  const { server, port } = await serve(root);
  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROME) ? CHROME : undefined,
    args: ["--no-sandbox"]
  });
  const base = "http://127.0.0.1:" + port;

  async function open(route, opts) {
    const o = Object.assign({ width: 390, height: 844 }, opts);
    const page = await browser.newPage({ viewport: { width: o.width, height: o.height } });
    const errors = [];
    page.on("pageerror", e => errors.push("threw: " + e.message));
    page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 160)); });
    page.errors = errors;
    await page.goto(base + "/index.html#" + (route || "/home"), { waitUntil: "load" });
    await page.waitForFunction(() => window.EN && EN.State && EN.Bank, null, { timeout: 8000 });
    /* The first-run modal is STICKY and appears on a 400ms delay, so querying for it
       immediately finds nothing and it then opens over everything — which silently made
       every click in every suite land on the modal instead of the app. Wait for it, then
       dismiss it. `onboarded` is asserted separately in tests/suites/state.js. */
    if (!o.keepOnboarding) {
      try {
        await page.waitForSelector("#modal-root:not([hidden]) .btn-primary", { timeout: 2500 });
        await page.click("#modal-root .btn-primary");
      } catch (e) {
        /* Already onboarded, or the modal did not appear — either is fine here. */
      }
      await page.waitForFunction(() => document.getElementById("modal-root").hidden, null, { timeout: 3000 })
        .catch(() => {});
    }
    await page.waitForTimeout(120);
    return page;
  }

  /** Navigate within the app, forcing a re-render even if the hash matches. */
  async function goto(page, route, settle) {
    await page.evaluate(r => { location.hash = "#/blank"; location.hash = r; }, route);
    await page.waitForTimeout(settle || 420);
  }

  async function close() {
    await browser.close();
    await new Promise(r => server.close(r));
  }

  return { base, browser, open, goto, close };
}

/** Every route the app registers, plus the arguments worth exercising. */
const ROUTES = [
  "/home", "/play", "/vault", "/vault/card", "/reference", "/reference/rubric",
  "/reference/bands", "/reference/concepts", "/reference/essay", "/progress", "/shop",
  "/draft", "/draft/new", "/texts", "/texts/common", "/texts/moduleA",
  "/texts/poems/donne", "/settings", "/achievements", "/arcade", "/boss",
  "/game/rapid", "/game/technique", "/game/cloze", "/game/marking", "/game/essay",
  "/game/quotematch", "/game/bandgrid", "/game/deconstruct", "/game/sayit",
  "/game/thesis", "/game/rewrite", "/game/drill", "/game/drill/all", "/game/survival",
  "/game/rehab"
];

module.exports = { harness, serve, ROUTES, CHROME };
