/* Rasterise assets/icon.svg into the PNG sizes the manifest and iOS need.
   ============================================================================
   Run by hand, never by the app:

     node tools/icons.js

   This is not a build step. The app ships the PNGs it produces as checked-in files and
   never runs this — index.html loads plain scripts and nothing else. It exists because
   headless Chromium refuses a window smaller than about 500px, so the only reliable way
   to get a 192px icon is to render once at 512 and box-filter it down here. Pure Node,
   zlib only, no dependencies.
   ============================================================================ */
"use strict";
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SVG = path.join(ROOT, "assets", "icon.svg");
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SIZES = [
  { file: "icon-512.png", size: 512 },
  { file: "icon-192.png", size: 192 },
  { file: "apple-touch-icon.png", size: 180 }
];

/* ── PNG decode ───────────────────────────────────────────────
   Only what Chromium emits: 8-bit truecolour, non-interlaced, with real scanline
   filters — an unfiltered read gives plausible-looking garbage, which is a fun hour. */
function decode(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let off = 8, w = 0, h = 0, colour = 0, depth = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    if (type === "IHDR") {
      w = buf.readUInt32BE(off + 8);
      h = buf.readUInt32BE(off + 12);
      depth = buf[off + 16];
      colour = buf[off + 17];
      if (buf[off + 20] !== 0) throw new Error("interlaced PNGs not supported");
    } else if (type === "IDAT") {
      idat.push(buf.slice(off + 8, off + 8 + len));
    }
    off += 12 + len;
  }
  if (depth !== 8 || (colour !== 2 && colour !== 6)) {
    throw new Error("expected 8-bit RGB or RGBA, got colour " + colour + " depth " + depth);
  }
  const src = zlib.inflateSync(Buffer.concat(idat));
  const inCh = colour === 6 ? 4 : 3;
  const stride = w * inCh;
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  let p = 0;

  for (let y = 0; y < h; y++) {
    const filter = src[p++];
    const row = Buffer.from(src.slice(p, p + stride));
    p += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= inCh ? row[i - inCh] : 0;
      const b = prev[i];
      const c = i >= inCh ? prev[i - inCh] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) add = paeth(a, b, c);
      else if (filter !== 0) throw new Error("bad filter " + filter);
      row[i] = (row[i] + add) & 0xff;
    }
    for (let x = 0; x < w; x++) {
      const s = x * inCh, d = (y * w + x) * 4;
      out[d] = row[s]; out[d + 1] = row[s + 1]; out[d + 2] = row[s + 2];
      out[d + 3] = inCh === 4 ? row[s + 3] : 255;
    }
    prev = row;
  }
  return { width: w, height: h, data: out };
}

function paeth(a, b, c) {
  const pp = a + b - c;
  const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/* ── PNG encode ───────────────────────────────────────────── */
function encode(img) {
  const { width: w, height: h, data } = img;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                       // filter: none, zlib does the work
    data.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length, 0);
  const head = Buffer.concat([Buffer.from(type, "ascii"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(head) >>> 0, 0);
  return Buffer.concat([len, head, crc]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

/* ── box-filter downscale ─────────────────────────────────────
   Averaging every source pixel that lands in a destination pixel. Nearest-neighbour
   would alias the 8px rule lines in the icon into a moiré mess at 192px. */
function resize(img, size) {
  const { width: sw, height: sh, data: src } = img;
  const out = Buffer.alloc(size * size * 4);
  const sx = sw / size, sy = sh / size;
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * sy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * sx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y0; yy < y1 && yy < sh; yy++) {
        for (let xx = x0; xx < x1 && xx < sw; xx++) {
          const o = (yy * sw + xx) * 4;
          r += src[o]; g += src[o + 1]; b += src[o + 2]; a += src[o + 3];
          n++;
        }
      }
      const d = (y * size + x) * 4;
      out[d] = Math.round(r / n); out[d + 1] = Math.round(g / n);
      out[d + 2] = Math.round(b / n); out[d + 3] = Math.round(a / n);
    }
  }
  return { width: size, height: size, data: out };
}

/** Take the top-left size×size square. */
function crop(img, size) {
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    img.data.copy(out, y * size * 4, (y * img.width) * 4, (y * img.width + size) * 4);
  }
  return { width: size, height: size, data: out };
}

/* ── run ──────────────────────────────────────────────────── */
if (!fs.existsSync(CHROME)) {
  console.error("No Chromium at " + CHROME + " — set CHROME_PATH.");
  process.exit(1);
}

/* Two Chromium behaviours to work around, both measured rather than assumed:
     • --window-size includes about 88px of notional browser chrome, so the page gets a
       512×424 viewport and the bottom of the icon is cut off. Ask for the extra height
       and crop the top-left square back out.
     • the minimum window is around 500px, so 192 and 180 cannot be rendered directly —
       hence the box filter above. */
const CHROME_H = 88;
const wrapper = path.join(ROOT, "assets", ".icon-wrap.html");
fs.writeFileSync(wrapper,
  '<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}' +
  "html,body{width:512px;height:512px;overflow:hidden}" +
  "svg{display:block;width:512px;height:512px}</style>" +
  fs.readFileSync(SVG, "utf8"));

const tmp = path.join(ROOT, "assets", ".icon-512.png");
execFileSync(CHROME, [
  "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  "--screenshot=" + tmp, "--window-size=512," + (512 + CHROME_H), "file://" + wrapper
], { stdio: ["ignore", "ignore", "ignore"] });

const shot = decode(fs.readFileSync(tmp));
fs.unlinkSync(tmp);
fs.unlinkSync(wrapper);
if (shot.width !== 512) throw new Error("expected a 512px-wide render, got " + shot.width);
const master = crop(shot, 512);

/* If the icon is not flush to all four edges the render went wrong — a maskable icon
   with a white border around it looks broken on every Android launcher. */
const edge = (x, y) => master.data[(y * 512 + x) * 4 + 3];
if (!edge(256, 0) || !edge(256, 511) || !edge(0, 256) || !edge(511, 256)) {
  throw new Error("render is not full-bleed — check the wrapper sizing");
}

SIZES.forEach(({ file, size }) => {
  const img = size === master.width ? master : resize(master, size);
  const target = path.join(ROOT, "assets", file);
  fs.writeFileSync(target, encode(img));
  console.log("wrote assets/" + file + "  " + size + "×" + size +
              "  " + fs.statSync(target).size + " bytes");
});
