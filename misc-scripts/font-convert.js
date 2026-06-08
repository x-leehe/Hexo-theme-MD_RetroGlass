'use strict';

/**
 * Font Subset + WOFF2 Converter
 *
 * 1. Scans public/ HTML for all unique characters
 * 2. Subsets each TTF font to only those characters (via harfbuzz WASM)
 * 3. Outputs WOFF2 to public/fonts/
 * 4. Cleans up stale .ttf / .woff from public/fonts/
 *
 * Dual-mode:
 *   Hexo mode — hooks after_generate (post-HTML, pre-deploy)
 *   Standalone — `node scripts/font-convert.js` or `npm run subset-fonts`
 */
const fs = require('fs');
const path = require('path');
const subsetFont = require('subset-font');

// ---- Paths ----
const ROOT = path.join(__dirname, '..');
const FONTS_SRC = path.join(ROOT, 'themes', 'md-retroglass', 'fonts-src');
const PUBLIC_FONTS = path.join(ROOT, 'public', 'fonts');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE_DIR = path.join(ROOT, 'source');

// ---- Fonts to process (TTF source → WOFF2 output) ----
const FONT_MAP = [
  { src: 'HarmonyOS_Sans_SC_Regular.ttf',  dest: 'HarmonyOS_Sans_SC_Regular.woff2' },
  { src: 'HarmonyOS_Sans_SC_Medium.ttf',   dest: 'HarmonyOS_Sans_SC_Medium.woff2' },
  { src: 'HarmonyOS_Sans_SC_Bold.ttf',     dest: 'HarmonyOS_Sans_SC_Bold.woff2' },
  { src: 'JetBrainsMapleMono-Regular.ttf',  dest: 'JetBrainsMapleMono-Regular.woff2' },
  { src: 'AaCute-full.ttf',                 dest: 'AaCute-full.woff2' },
];

// ---- Safety character set (always included) ----
const SAFETY_CHARS = (() => {
  const ranges = [
    [0x20, 0x7E],    // ASCII printable
    [0xA0, 0xFF],     // Latin-1 Supplement
    [0x2000, 0x206F], // General Punctuation
    [0x3000, 0x303F], // CJK Symbols & Punctuation
    [0xFF00, 0xFFEF], // Halfwidth & Fullwidth Forms
  ];
  let chars = '';
  for (const [lo, hi] of ranges) {
    for (let c = lo; c <= hi; c++) chars += String.fromCodePoint(c);
  }
  return chars;
})();

// ---- HTML text extraction ----
function extractText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
    .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[#\w]+;/g, '')
    .replace(/\s+/g, '');
}

// ---- Walk directory recursively ----
function walkDir(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, ext));
    } else if (full.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

// ---- Collect unique characters from all HTML & Markdown files ----
function collectChars(htmlDir, logger) {
  const log = logger || console;
  const charSet = new Set(SAFETY_CHARS);

  // 1. Source Markdown (always available, even before hexo generate)
  const mdFiles = walkDir(SOURCE_DIR, '.md');
  for (const file of mdFiles) {
    try {
      const text = fs.readFileSync(file, 'utf-8');
      for (const ch of text) charSet.add(ch);
    } catch (_) { /* skip */ }
  }
  log.info(`[font-subset] Source Markdown: ${mdFiles.length} files.`);

  // 2. Generated HTML (available only after hexo generate)
  const htmlFiles = walkDir(htmlDir, '.html');
  if (htmlFiles.length > 0) {
    for (const file of htmlFiles) {
      try {
        const html = fs.readFileSync(file, 'utf-8');
        const text = extractText(html);
        for (const ch of text) charSet.add(ch);
      } catch (_) { /* skip */ }
    }
    log.info(`[font-subset] Generated HTML: ${htmlFiles.length} files.`);
  }

  const chars = [...charSet].join('');
  log.info(`[font-subset] Total unique characters: ${chars.length}.`);
  return chars;
}

// ---- Subset a single font ----
async function subsetOne(srcPath, destPath, chars, logger) {
  const log = logger || console;
  const ttfBuf = fs.readFileSync(srcPath);

  const start = Date.now();
  const woff2 = await subsetFont(ttfBuf, chars, { targetFormat: 'woff2' });
  const elapsed = Date.now() - start;

  fs.writeFileSync(destPath, Buffer.from(woff2));

  const ttfKB = (ttfBuf.length / 1024).toFixed(0);
  const woffKB = (woff2.length / 1024).toFixed(0);
  const pct = (100 - woffKB / ttfKB * 100).toFixed(0);
  log.info(`[font-subset] ${path.basename(srcPath)} → ${path.basename(destPath)}  (${ttfKB} KB → ${woffKB} KB, ↓${pct}%, ${elapsed}ms)`);

  return { ttfSize: ttfBuf.length, woff2Size: woff2.length };
}

// ---- Clean up stale font files from public/fonts/ ----
function cleanPublicFonts(log) {
  if (!fs.existsSync(PUBLIC_FONTS)) return;
  const files = fs.readdirSync(PUBLIC_FONTS);
  let removed = 0;
  for (const f of files) {
    if (f.endsWith('.ttf') || f.endsWith('.woff')) {
      fs.unlinkSync(path.join(PUBLIC_FONTS, f));
      removed++;
    }
  }
  if (removed > 0) {
    (log || console).info(`[font-subset] Cleaned ${removed} stale font files from public/fonts/.`);
  }
}

// ---- Main: subset all fonts ----
async function subsetAll(logger) {
  const log = logger || { info: console.log, warn: console.warn, debug: () => {} };

  if (!fs.existsSync(FONTS_SRC)) {
    log.warn('[font-subset] Font source directory not found:', FONTS_SRC);
    return;
  }

  if (!fs.existsSync(PUBLIC_FONTS)) {
    fs.mkdirSync(PUBLIC_FONTS, { recursive: true });
  }

  const chars = collectChars(PUBLIC_DIR, log);

  log.info('[font-subset] Subsetting', FONT_MAP.length, 'fonts with', chars.length, 'characters...');

  let totalTTF = 0;
  let totalWOFF2 = 0;

  for (const { src, dest } of FONT_MAP) {
    const srcPath = path.join(FONTS_SRC, src);
    const destPath = path.join(PUBLIC_FONTS, dest);

    if (!fs.existsSync(srcPath)) {
      log.warn('[font-subset] Source TTF not found:', srcPath);
      continue;
    }

    const result = await subsetOne(srcPath, destPath, chars, log);
    totalTTF += result.ttfSize;
    totalWOFF2 += result.woff2Size;
  }

  const ttfMB = (totalTTF / 1024 / 1024).toFixed(1);
  const woffMB = (totalWOFF2 / 1024 / 1024).toFixed(1);
  const totalPct = (100 - woffMB / ttfMB * 100).toFixed(0);
  log.info(`[font-subset] Total: ${ttfMB} MB → ${woffMB} MB (↓${totalPct}%)`);
}

// ---- Hexo mode: run after ALL generation is complete ----
if (typeof hexo !== 'undefined') {
  hexo.on('generateAfter', async function () {
    await subsetAll(hexo.log);
  });
}

// ---- Standalone mode ----
if (require.main === module) {
  (async () => {
    console.log('Font Subset + WOFF2 Converter\n');
    await subsetAll(console);
    console.log('\nDone.');
  })().catch(e => { console.error(e); process.exit(1); });
}
