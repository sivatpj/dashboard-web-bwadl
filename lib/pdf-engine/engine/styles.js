const BLOCK_TAGS = new Set([
  'html', 'body', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'table', 'tr', 'thead', 'tbody', 'tfoot', 'hr',
]);

const DEFAULT_TAG_STYLE = {
  body: { fontSize: 12, marginTop: 0, marginBottom: 0 },
  p: { marginTop: 6, marginBottom: 6 },
  h1: { fontSize: 28, bold: true, marginTop: 14, marginBottom: 10 },
  h2: { fontSize: 22, bold: true, marginTop: 12, marginBottom: 8 },
  h3: { fontSize: 18, bold: true, marginTop: 10, marginBottom: 6 },
  h4: { fontSize: 15, bold: true, marginTop: 8, marginBottom: 6 },
  h5: { fontSize: 13, bold: true, marginTop: 6, marginBottom: 4 },
  h6: { fontSize: 11, bold: true, marginTop: 6, marginBottom: 4 },
  b: { bold: true },
  strong: { bold: true },
  i: { italic: true },
  em: { italic: true },
  ul: { marginTop: 6, marginBottom: 6, paddingLeft: 18 },
  ol: { marginTop: 6, marginBottom: 6, paddingLeft: 18 },
  li: { marginBottom: 4 },
  hr: { marginTop: 8, marginBottom: 8 },
  table: { marginTop: 6, marginBottom: 6 },
};

const COLOR_KEYWORDS = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', gray: '#808080', grey: '#808080', yellow: '#ffff00',
  orange: '#ffa500', purple: '#800080', silver: '#c0c0c0', navy: '#000080',
  transparent: 'transparent',
};

// Resolves px/pt/em/rem/% lengths to absolute points. `basePx` is the font size
// (for em) or the root font size (for rem) the percentage/relative unit is against;
// `relativeTo` is the dimension (e.g. container width) "%" resolves against.
function parseLength(value, { basePx = 12, relativeTo } = {}) {
  if (value == null) return undefined;
  const str = String(value).trim();
  const m = str.match(/^(-?[\d.]+)(px|pt|em|rem|%)?$/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  const unit = m[2] || 'px';
  switch (unit) {
    case 'em':
    case 'rem':
      return n * basePx;
    case '%':
      return relativeTo != null ? (n / 100) * relativeTo : undefined;
    default:
      return n;
  }
}

function parseColor(value) {
  if (!value) return undefined;
  const v = String(value).trim().toLowerCase();
  if (v === 'transparent') return undefined;
  if (v in COLOR_KEYWORDS) return COLOR_KEYWORDS[v];

  let m = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((c) => Math.max(0, Math.min(255, parseFloat(c))));
    const hex = (n) => Math.round(n).toString(16).padStart(2, '0');
    const alpha = m[4] !== undefined ? parseFloat(m[4]) : undefined;
    return { hex: `#${hex(r)}${hex(g)}${hex(b)}`, opacity: alpha };
  }

  return v;
}

// Normalizes a parsed color (string hex or {hex, opacity}) to the plain hex string
// pdfkit's fillColor/strokeColor expect.
function colorHex(color) {
  if (color == null) return undefined;
  return typeof color === 'object' ? color.hex : color;
}

// Normalizes a parsed color to an opacity in [0,1], defaulting to fully opaque.
function colorOpacity(color) {
  if (color && typeof color === 'object' && color.opacity != null) return color.opacity;
  return 1;
}

// `basePx` is the current element's inherited font size, used to resolve em/rem in
// its own declarations (e.g. `padding: 1em` is relative to that element's font-size).
function parseInlineStyle(styleAttr, basePx = 12) {
  const result = {};
  if (!styleAttr) return result;
  const len = (val) => parseLength(val, { basePx });
  styleAttr.split(';').forEach((decl) => {
    const idx = decl.indexOf(':');
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) return;
    switch (prop) {
      case 'color':
        result.color = parseColor(val);
        break;
      case 'background-color':
        result.backgroundColor = parseColor(val);
        break;
      case 'background':
        result.backgroundColor = parseColor(val.split(/\s+/)[0]);
        break;
      case 'font-family':
        result.fontFamily = val.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
        break;
      case 'font-size':
        result.fontSize = len(val);
        break;
      case 'font-weight':
        result.bold = val === 'bold' || val === 'bolder' || parseInt(val, 10) >= 600;
        break;
      case 'font-style':
        result.italic = val === 'italic' || val === 'oblique';
        break;
      case 'line-height':
        result.lineHeight = /^[\d.]+$/.test(val) ? parseFloat(val) : len(val);
        break;
      case 'letter-spacing':
        result.letterSpacing = val === 'normal' ? 0 : len(val);
        break;
      case 'word-spacing':
        result.wordSpacing = val === 'normal' ? 0 : len(val);
        break;
      case 'white-space':
        if (['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'].includes(val)) result.whiteSpace = val;
        break;
      case 'direction':
        if (val === 'rtl' || val === 'ltr') result.direction = val;
        break;
      case 'text-align':
        if (['left', 'right', 'center', 'justify'].includes(val)) result.textAlign = val;
        break;
      case 'text-transform':
        if (['uppercase', 'lowercase', 'capitalize', 'none'].includes(val)) result.textTransform = val;
        break;
      case 'text-decoration':
        result.underline = val.includes('underline');
        result.strikethrough = val.includes('line-through');
        break;
      case 'display':
        if (['block', 'inline', 'inline-block', 'none'].includes(val)) {
          result.display = val;
          if (val === 'none') result.hidden = true;
        }
        break;
      case 'margin-top':
        result.marginTop = len(val);
        break;
      case 'margin-bottom':
        result.marginBottom = len(val);
        break;
      case 'margin-left':
        result.marginLeft = len(val);
        break;
      case 'margin-right':
        result.marginRight = len(val);
        break;
      case 'margin': {
        const parts = val.split(/\s+/).map(len).filter((n) => n !== undefined);
        if (parts.length === 1) {
          result.marginTop = result.marginBottom = result.marginLeft = result.marginRight = parts[0];
        } else if (parts.length === 2) {
          result.marginTop = result.marginBottom = parts[0];
          result.marginLeft = result.marginRight = parts[1];
        } else if (parts.length === 4) {
          [result.marginTop, result.marginRight, result.marginBottom, result.marginLeft] = parts;
        }
        break;
      }
      case 'padding-top':
        result.paddingTop = len(val);
        break;
      case 'padding-bottom':
        result.paddingBottom = len(val);
        break;
      case 'padding-left':
        result.paddingLeft = len(val);
        break;
      case 'padding-right':
        result.paddingRight = len(val);
        break;
      case 'padding': {
        const parts = val.split(/\s+/).map(len).filter((n) => n !== undefined);
        if (parts.length === 1) {
          result.paddingTop = result.paddingBottom = result.paddingLeft = result.paddingRight = parts[0];
        } else if (parts.length === 2) {
          result.paddingTop = result.paddingBottom = parts[0];
          result.paddingLeft = result.paddingRight = parts[1];
        } else if (parts.length === 4) {
          [result.paddingTop, result.paddingRight, result.paddingBottom, result.paddingLeft] = parts;
        }
        break;
      }
      case 'width':
        result.width = len(val);
        break;
      case 'height':
        result.height = len(val);
        break;
      case 'min-width':
        result.minWidth = len(val);
        break;
      case 'max-width':
        result.maxWidth = len(val);
        break;
      case 'border':
      case 'border-width': {
        const m = val.match(/([\d.]+)\s*(px|pt)?/);
        if (m) result.borderWidth = parseFloat(m[1]);
        break;
      }
      case 'border-color':
        result.borderColor = parseColor(val);
        break;
      case 'border-radius':
        result.borderRadius = len(val.split(/\s+/)[0]);
        break;
      case 'break-inside':
      case 'page-break-inside':
        result.keepTogether = val === 'avoid';
        break;
      default:
        break;
    }
  });
  return result;
}

const TAG_LEVEL_DEFAULTS = {
  a: { color: '#1d4ed8', underline: true },
  small: { fontSize: 10 },
  del: { strikethrough: true },
  s: { strikethrough: true },
  mark: { backgroundColor: '#fff3a0' },
};

function resolveStyle(tag, attrs, parentStyle) {
  const inherited = {
    fontSize: parentStyle?.fontSize ?? 12,
    color: parentStyle?.color ?? '#000000',
    bold: parentStyle?.bold ?? false,
    italic: parentStyle?.italic ?? false,
    underline: parentStyle?.underline ?? false,
    strikethrough: parentStyle?.strikethrough ?? false,
    textAlign: parentStyle?.textAlign ?? 'left',
    textTransform: parentStyle?.textTransform,
    direction: parentStyle?.direction ?? 'ltr',
    whiteSpace: parentStyle?.whiteSpace ?? 'normal',
    lineHeight: parentStyle?.lineHeight,
    letterSpacing: parentStyle?.letterSpacing,
    wordSpacing: parentStyle?.wordSpacing,
    fontFamily: parentStyle?.fontFamily,
  };
  const tagDefaults = { ...(TAG_LEVEL_DEFAULTS[tag] || {}), ...(DEFAULT_TAG_STYLE[tag] || {}) };
  const inline = parseInlineStyle(attrs?.style, inherited.fontSize);
  return { ...inherited, ...tagDefaults, ...inline };
}

module.exports = {
  resolveStyle, parseInlineStyle, parseColor, parseLength, colorHex, colorOpacity, BLOCK_TAGS,
};
