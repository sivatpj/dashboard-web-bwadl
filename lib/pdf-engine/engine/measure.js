const { resolveStyle } = require('./styles');

const INLINE_TAGS = new Set(['#text', 'span', 'a', 'b', 'strong', 'i', 'em', 'u', 's', 'del', 'mark', 'br', 'small']);
const LIST_TAGS = new Set(['ul', 'ol']);

function isInlineOnly(node) {
  return (node.children || []).every((c) => INLINE_TAGS.has(c.tag));
}

function collectInlineLines(node, parentStyle) {
  const lines = [[]];
  function visit(n, style) {
    if (n.tag === '#text') {
      const text = n.text.replace(/\s+/g, ' ');
      if (text.trim() === '' && text !== ' ') return;
      lines[lines.length - 1].push({ text, style });
      return;
    }
    if (n.tag === 'br') {
      lines.push([]);
      return;
    }
    const childStyle = resolveStyle(n.tag, n.attrs, style);
    for (const child of n.children || []) visit(child, childStyle);
  }
  for (const child of node.children || []) visit(child, parentStyle);
  return lines.filter((line) => line.length > 0 || lines.length === 1);
}

// Approximates wrapped-text height using the Latin body font only — script-specific
// fallback fonts (Tamil/Arabic/Emoji) used at render time may have slightly different
// metrics, which is an accepted approximation for layout purposes.
function measureInlineLines(doc, lines, width) {
  let height = 0;
  for (const line of lines) {
    if (line.length === 0) {
      height += doc.currentLineHeight() * 0.6;
      continue;
    }
    let lineWidthUsed = 0;
    let lineMaxHeight = 0;
    let rowHeight = 0;
    line.forEach((run) => {
      doc.font(run.style.bold ? 'Body-Bold' : 'Body').fontSize(run.style.fontSize);
      const runWidth = doc.widthOfString(run.text);
      const runHeight = doc.currentLineHeight() * (run.style.lineHeight || 1);
      lineMaxHeight = Math.max(lineMaxHeight, runHeight);
      if (lineWidthUsed + runWidth > width && lineWidthUsed > 0) {
        height += rowHeight || lineMaxHeight;
        lineWidthUsed = 0;
        rowHeight = 0;
      }
      lineWidthUsed += runWidth;
      rowHeight = Math.max(rowHeight, runHeight);
    });
    height += rowHeight || lineMaxHeight;
  }
  return height;
}

function measureParagraph(doc, node, style, width) {
  return measureInlineLines(doc, collectInlineLines(node, style), width);
}

function measureList(doc, node, style, width) {
  const items = (node.children || []).filter((c) => c.tag === 'li');
  let height = 0;
  for (const li of items) {
    const liStyle = resolveStyle('li', li.attrs, style);
    const indent = liStyle.paddingLeft != null ? liStyle.paddingLeft : style.paddingLeft || 18;
    const inlineChildren = (li.children || []).filter((c) => !LIST_TAGS.has(c.tag));
    const nestedLists = (li.children || []).filter((c) => LIST_TAGS.has(c.tag));
    height += measureInlineLines(doc, collectInlineLines({ children: inlineChildren }, liStyle), width - indent);
    height += liStyle.marginBottom || 0;
    for (const nested of nestedLists) {
      const nestedStyle = resolveStyle(nested.tag, nested.attrs, liStyle);
      height += measureList(doc, nested, nestedStyle, width - indent);
    }
  }
  return height;
}

function extractWidthPercent(styleAttr) {
  if (!styleAttr) return null;
  const m = styleAttr.match(/width\s*:\s*([\d.]+)%/);
  return m ? parseFloat(m[1]) / 100 : null;
}

function computeColumnWidths(firstRowCells, tableWidth) {
  const raw = firstRowCells.map((cell) => {
    const span = parseInt(cell.attrs && cell.attrs.colspan, 10) || 1;
    const pct = extractWidthPercent(cell.attrs && cell.attrs.style);
    return pct != null ? (tableWidth * pct) / span : null;
  });
  const definedTotal = raw.reduce((sum, w) => sum + (w || 0), 0);
  const undefinedCount = raw.filter((w) => w === null).length;
  const remaining = Math.max(tableWidth - definedTotal, 0);
  const fallback = undefinedCount > 0 ? remaining / undefinedCount : 0;
  return raw.map((w) => (w === null ? fallback : w));
}

function measureTable(doc, node, style, width) {
  const rows = [];
  (function gatherRows(n) {
    for (const child of n.children || []) {
      if (child.tag === 'tr') rows.push(child);
      else if (['thead', 'tbody', 'tfoot'].includes(child.tag)) gatherRows(child);
    }
  })(node);
  if (rows.length === 0) return 0;
  const firstRowCells = (rows[0].children || []).filter((c) => c.tag === 'td' || c.tag === 'th');
  const colWidths = computeColumnWidths(firstRowCells, width);
  const cellPadding = 6;

  let total = 0;
  for (const row of rows) {
    const rowStyle = resolveStyle('tr', row.attrs, style);
    const cells = (row.children || []).filter((c) => c.tag === 'td' || c.tag === 'th');
    let maxHeight = 0;
    cells.forEach((cell, i) => {
      const cellStyle = resolveStyle(cell.tag, cell.attrs, rowStyle);
      if (cell.tag === 'th') cellStyle.bold = true;
      const cellWidth = colWidths[i] || width / cells.length;
      const h = measureNode(doc, cell, cellStyle, cellWidth - cellPadding * 2);
      maxHeight = Math.max(maxHeight, h);
    });
    total += Math.max(maxHeight, 14) + cellPadding * 2;
  }
  return total;
}

// Computes the height of a node's box (padding + content, no margin) without drawing
// anything, so background/border boxes can be sized up front and painted once.
function measureInner(doc, node, style, width) {
  const padTop = style.paddingTop || 0;
  const padBottom = style.paddingBottom || 0;
  const padLeft = node.tag === 'ul' || node.tag === 'ol' ? 0 : style.paddingLeft || 0;
  const padRight = style.paddingRight || 0;
  const contentWidth = width - padLeft - padRight;

  let height = padTop + padBottom;

  switch (node.tag) {
    case 'hr':
      height += doc.currentLineHeight() * 1.2;
      break;
    case 'img':
      height += style.height || style.width || 0;
      break;
    case 'ul':
    case 'ol':
      height += measureList(doc, node, style, width);
      break;
    case 'table':
      height += measureTable(doc, node, style, contentWidth);
      break;
    case 'br':
      height += doc.currentLineHeight() * 0.6;
      break;
    default:
      if ((node.children || []).length === 0) {
        height += style.height || 0;
      } else if (isInlineOnly(node)) {
        height += measureParagraph(doc, node, style, contentWidth);
      } else {
        for (const child of node.children) {
          height += measureNode(doc, child, style, contentWidth);
        }
      }
      break;
  }

  return height;
}

function measureNode(doc, node, parentStyle, width) {
  if (node.tag === '#text') {
    if (node.text.trim() === '') return 0;
    return measureParagraph(doc, { children: [node] }, parentStyle, width);
  }
  const style = resolveStyle(node.tag, node.attrs, parentStyle);
  if (style.hidden) return 0;
  return (style.marginTop || 0) + measureInner(doc, node, style, width) + (style.marginBottom || 0);
}

module.exports = { measureNode, measureInner };
