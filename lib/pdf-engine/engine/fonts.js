// Browser port of the backend's fonts.js: Node's fs/path-based file lookup is
// replaced with fetching bundled .ttf files (served from /public/fonts) once,
// caching the resulting ArrayBuffers, then registering them with pdfkit.
const FONT_BASE_URL = '/fonts';

const FAMILIES = {
  Body: ['NotoSans-Regular.ttf'],
  'Body-Bold': ['NotoSans-Bold.ttf'],
  'Body-Oblique': ['NotoSans-Italic.ttf'],
  'Body-BoldOblique': ['NotoSans-BoldItalic.ttf'],
  Tamil: ['NotoSansTamil-Regular.ttf'],
  'Tamil-Bold': ['NotoSansTamil-Bold.ttf'],
  Arabic: ['NotoSansArabic-Regular.ttf'],
  'Arabic-Bold': ['NotoSansArabic-Bold.ttf'],
  // Windows' seguiemj.ttf equivalent is intentionally not used as a fallback here: it
  // stores glyphs as color bitmaps with no vector outlines, which pdfkit's subset
  // embedder cannot encode. Vector emoji fonts like Noto Emoji (outline-only,
  // monochrome) work fine.
  Emoji: ['NotoEmoji-Regular.ttf'],
};

let fontBuffersPromise = null;

// Fetches every font file once and caches the resulting ArrayBuffers, keyed by
// family name. Missing files (404) are skipped rather than failing the whole load.
function loadFontBuffers() {
  if (fontBuffersPromise) return fontBuffersPromise;

  fontBuffersPromise = Promise.all(
    Object.entries(FAMILIES).map(async ([name, [file]]) => {
      try {
        const res = await fetch(`${FONT_BASE_URL}/${file}`);
        if (!res.ok) return [name, null];
        const buffer = await res.arrayBuffer();
        return [name, buffer];
      } catch (err) {
        return [name, null];
      }
    }),
  ).then(entries => {
    const map = new Map();
    for (const [name, buffer] of entries) {
      if (buffer) map.set(name, buffer);
    }
    return map;
  });

  return fontBuffersPromise;
}

// Registers every family whose font buffer loaded successfully, and returns the
// set of family names that were actually registered (so the font picker can skip
// ones that aren't available rather than asking pdfkit for a font that doesn't exist).
async function registerFonts(doc) {
  const buffers = await loadFontBuffers();
  const available = new Set();
  for (const [name, buffer] of buffers.entries()) {
    try {
      doc.registerFont(name, Buffer.from(buffer));
      available.add(name);
    } catch (err) {
      // Corrupt/unsupported font file — skip rather than failing the whole render.
    }
  }
  return available;
}

// Unicode block ranges used to pick a fallback family for a run of text.
const RANGES = [
  { name: 'Tamil', test: (cp) => cp >= 0x0b80 && cp <= 0x0bff },
  { name: 'Arabic', test: (cp) => (cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff) },
  { name: 'Emoji', test: (cp) => (cp >= 0x1f300 && cp <= 0x1faff) || (cp >= 0x2600 && cp <= 0x27bf) || cp === 0x2764 },
  { name: 'Symbols', test: (cp) => (cp >= 0x2190 && cp <= 0x21ff) || (cp >= 0x2300 && cp <= 0x23ff) || (cp >= 0x2700 && cp <= 0x27bf) },
];

function scriptOf(char) {
  const cp = char.codePointAt(0);
  for (const range of RANGES) {
    if (range.test(cp)) return range.name;
  }
  return 'Latin';
}

// Splits text into runs that each need a single font family, based on script.
function splitByScript(text) {
  const runs = [];
  let current = '';
  let currentScript = null;
  for (const char of text) {
    const script = scriptOf(char);
    const effective = script === 'Latin' || /\s/.test(char) ? currentScript || 'Latin' : script;
    if (currentScript === null) currentScript = effective;
    if (effective !== currentScript && script !== 'Latin') {
      if (current) runs.push({ text: current, script: currentScript });
      current = char;
      currentScript = script;
    } else {
      current += char;
    }
  }
  if (current) runs.push({ text: current, script: currentScript || 'Latin' });
  return runs;
}

// Resolves the best registered family for a (script, bold, italic) combination,
// falling back to the closest available Body variant if the script-specific family
// (or font file) isn't registered.
function familyFor(script, { bold, italic } = {}, available) {
  let base;
  if (script === 'Tamil') base = bold ? 'Tamil-Bold' : 'Tamil';
  else if (script === 'Arabic') base = bold ? 'Arabic-Bold' : 'Arabic';
  else if (script === 'Emoji') base = 'Emoji';
  else if (script === 'Symbols') base = 'Symbols';

  if (base && available.has(base)) return base;

  if (bold && italic && available.has('Body-BoldOblique')) return 'Body-BoldOblique';
  if (bold && available.has('Body-Bold')) return 'Body-Bold';
  if (italic && available.has('Body-Oblique')) return 'Body-Oblique';
  return 'Body';
}

function isRtl(text) {
  for (const char of text) {
    const cp = char.codePointAt(0);
    if ((cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff)) return true;
  }
  return false;
}

module.exports = { registerFonts, scriptOf, splitByScript, familyFor, isRtl };
