import pdfMake from 'pdfmake/build/pdfmake';

/** Supports Hindi / Marathi / other Devanagari plus Latin. */
export const PDF_UNICODE_FONT = 'NotoSansDevanagari';

/** OpenType features that help Devanagari conjuncts and matras. */
export const PDF_UNICODE_FONT_FEATURES = [
  'liga',
  'kern',
  'calt',
  'nukt',
  'akhn',
  'rphf',
  'rkrf',
  'pref',
  'blwf',
  'half',
  'vatu',
  'cjct',
  'pres',
  'abvs',
  'blws',
  'psts',
  'haln',
];

const FONT_FILES = {
  regular: 'NotoSansDevanagari-Regular.ttf',
  bold: 'NotoSansDevanagari-Bold.ttf',
};

const DEVANAGARI_CHAR = /[\u0900-\u097F\uA8E0-\uA8FF]/;
const DEVANAGARI_RUN = /([\u0900-\u097F\uA8E0-\uA8FF]+)|([^\u0900-\u097F\uA8E0-\uA8FF]+)/g;

const TEXT_STYLE_KEYS = [
  'alignment',
  'background',
  'bold',
  'characterSpacing',
  'color',
  'decoration',
  'fillColor',
  'fontSize',
  'italics',
  'lineHeight',
  'style',
];

const pickTextStyles = (node) => {
  const out = {};
  TEXT_STYLE_KEYS.forEach((key) => {
    if (node?.[key] != null) out[key] = node[key];
  });
  return out;
};

const hindiRun = (value) => ({
  text: value,
  font: PDF_UNICODE_FONT,
  fontFeatures: PDF_UNICODE_FONT_FEATURES,
});

/** Split one string so Hindi uses Devanagari and English stays on Roboto. */
export const splitPdfMixedScriptText = (value) => {
  if (typeof value !== 'string' || !DEVANAGARI_CHAR.test(value)) return null;
  const parts = [];
  DEVANAGARI_RUN.lastIndex = 0;
  let match = DEVANAGARI_RUN.exec(value);
  while (match) {
    if (match[1]) parts.push(hindiRun(match[1]));
    else if (match[2]) parts.push({ text: match[2] });
    match = DEVANAGARI_RUN.exec(value);
  }
  if (!parts.length) return null;
  if (parts.length === 1) return parts[0];
  return { text: parts };
};

/**
 * Walk a pdfMake node and assign fonts per script so Hindi + English
 * in the same field both print.
 */
export const applyPdfMixedScriptFonts = (node, inherited = {}) => {
  if (node == null || typeof node === 'number' || typeof node === 'boolean') {
    return node;
  }
  if (typeof node === 'string') {
    const split = splitPdfMixedScriptText(node);
    if (!split) return node;
    if (Array.isArray(split.text)) {
      return { text: split.text.map((part) => ({ ...inherited, ...part })) };
    }
    return { ...inherited, ...split };
  }
  if (Array.isArray(node)) {
    return node.map((item) => applyPdfMixedScriptFonts(item, inherited));
  }
  if (typeof node !== 'object' || node.image || node.canvas || node.qr) {
    return node;
  }

  const styles = { ...inherited, ...pickTextStyles(node) };
  let next = node;

  if (typeof next.text === 'string') {
    const split = splitPdfMixedScriptText(next.text);
    if (split) {
      next = Array.isArray(split.text)
        ? { ...next, text: split.text.map((part) => ({ ...styles, ...part })) }
        : { ...next, font: split.font, fontFeatures: split.fontFeatures };
    }
  } else if (Array.isArray(next.text)) {
    next = {
      ...next,
      text: next.text.map((item) => applyPdfMixedScriptFonts(item, styles)),
    };
  } else if (next.text && typeof next.text === 'object') {
    next = { ...next, text: applyPdfMixedScriptFonts(next.text, styles) };
  }
  if (Array.isArray(next.stack)) {
    next = { ...next, stack: next.stack.map((item) => applyPdfMixedScriptFonts(item, styles)) };
  }
  if (Array.isArray(next.columns)) {
    next = {
      ...next,
      columns: next.columns.map((item) => applyPdfMixedScriptFonts(item, styles)),
    };
  }
  if (Array.isArray(next.ul)) {
    next = { ...next, ul: next.ul.map((item) => applyPdfMixedScriptFonts(item, styles)) };
  }
  if (Array.isArray(next.ol)) {
    next = { ...next, ol: next.ol.map((item) => applyPdfMixedScriptFonts(item, styles)) };
  }
  if (next.table?.body) {
    next = {
      ...next,
      table: {
        ...next.table,
        body: next.table.body.map((row) =>
          Array.isArray(row) ? row.map((cell) => applyPdfMixedScriptFonts(cell, styles)) : row
        ),
      },
    };
  }
  return next;
};

let fontsPromise = null;

const fontUrl = (fileName) => {
  const base = String(import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}/fonts/${fileName}`;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const parts = [];
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + step)));
  }
  return btoa(parts.join(''));
};

const loadFontFile = async (fileName) => {
  const response = await fetch(fontUrl(fileName));
  if (!response.ok) {
    throw new Error(`Could not load PDF font ${fileName}`);
  }
  return arrayBufferToBase64(await response.arrayBuffer());
};

/**
 * Register a Devanagari-capable font so Hindi text is not dropped by Roboto.
 * Safe to call more than once. English still renders with the same face.
 */
export const ensurePdfUnicodeFonts = () => {
  if (fontsPromise) return fontsPromise;

  fontsPromise = (async () => {
    const [regular, bold] = await Promise.all([
      loadFontFile(FONT_FILES.regular),
      loadFontFile(FONT_FILES.bold),
    ]);

    if (typeof pdfMake.addVirtualFileSystem === 'function') {
      pdfMake.addVirtualFileSystem({
        [FONT_FILES.regular]: regular,
        [FONT_FILES.bold]: bold,
      });
    } else {
      pdfMake.vfs = {
        ...(pdfMake.vfs || {}),
        [FONT_FILES.regular]: regular,
        [FONT_FILES.bold]: bold,
      };
    }

    const faces = {
      [PDF_UNICODE_FONT]: {
        normal: FONT_FILES.regular,
        bold: FONT_FILES.bold,
        italics: FONT_FILES.regular,
        bolditalics: FONT_FILES.bold,
      },
    };

    if (typeof pdfMake.addFonts === 'function') {
      pdfMake.addFonts(faces);
    } else {
      pdfMake.fonts = { ...(pdfMake.fonts || {}), ...faces };
    }
  })().catch((err) => {
    fontsPromise = null;
    throw err;
  });

  return fontsPromise;
};
