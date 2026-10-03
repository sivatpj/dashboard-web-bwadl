const { resolveStyle, BLOCK_TAGS, colorHex, colorOpacity } = require('./styles');
const { splitByScript, familyFor, isRtl } = require('./fonts');
const { measureInner, measureNode } = require('./measure');

const INLINE_TAGS = new Set(['#text', 'span', 'a', 'b', 'strong', 'i', 'em', 'u', 's', 'del', 'mark', 'br', 'small']);
const LIST_TAGS = new Set(['ul', 'ol']);

function isInlineOnly(node) {
  return (node.children || []).every((c) => INLINE_TAGS.has(c.tag));
}

function applyTextTransform(text, transform) {
  switch (transform) {
    case 'uppercase': return text.toUpperCase();
    case 'lowercase': return text.toLowerCase();
    case 'capitalize': return text.replace(/\b\w/g, (c) => c.toUpperCase());
    default: return text;
  }
}

function collapseWhitespace(text, whiteSpace) {
  if (whiteSpace === 'pre' || whiteSpace === 'pre-wrap') return text;
  return text.replace(/\s+/g, ' ');
}

// Flattens an inline subtree into lines of styled text runs, splitting on <br>.
// `href` propagates down from an enclosing <a> so leaf text runs know to draw a link.
function collectInlineLines(node, parentStyle) {
  const lines = [[]];

  function visit(n, style, href) {
    if (n.tag === '#text') {
      const text = applyTextTransform(collapseWhitespace(n.text, style.whiteSpace), style.textTransform);
      if (text.trim() === '' && text !== ' ') return;
      lines[lines.length - 1].push({ text, style, href });
      return;
    }
    if (n.tag === 'br') {
      lines.push([]);
      return;
    }
    const childStyle = resolveStyle(n.tag, n.attrs, style);
    const childHref = n.tag === 'a' ? n.attrs && n.attrs.href : href;
    for (const child of n.children || []) visit(child, childStyle, childHref);
  }

  for (const child of node.children || []) visit(child, parentStyle, undefined);
  return lines.filter((line) => line.length > 0 || lines.length === 1);
}

// Splits a single styled run into per-script sub-runs so Tamil/Arabic/Emoji glyphs
// fall back to a font that actually has them, while Latin text keeps the requested
// bold/italic family.
function scriptRuns(doc, run) {
  const available = doc._availableFonts || new Set(['Body', 'Body-Bold', 'Body-Oblique', 'Body-BoldOblique']);
  return splitByScript(run.text).map((part) => ({
    text: part.text,
    style: run.style,
    href: run.href,
    font: familyFor(part.script, run.style, available),
    rtl: part.script === 'Arabic',
  }));
}

function drawRun(doc, text, opts, runStartX, runStartY) {
  doc.text(text, opts);
  if (opts.link) {
    const width = doc.widthOfString(text);
    doc.link(runStartX, runStartY, width, doc.currentLineHeight(), opts.link);
  }
}

// Splits ordered script sub-runs into word tokens (word text + style/font), keeping
// logical (reading) order and inter-word space tokens intact.
function tokenizeWords(subRuns) {
  const words = [];
  for (const run of subRuns) {
    const parts = run.text.split(/(\s+)/).filter((p) => p !== '');
    for (const part of parts) {
      words.push({ text: part, style: run.style, font: run.font, href: run.href, isSpace: /^\s+$/.test(part) });
    }
  }
  return words;
}

// Lays out RTL word tokens right-to-left within `width`, wrapping to further lines
// as needed, drawing each word at an explicitly measured x position. PDFKit/fontkit
// neither reorders RTL words nor preserves inter-word space width when several
// Arabic words are drawn through a single doc.text() call, so each word is drawn
// with its own positioned, non-continued call instead.
function renderRtlWords(doc, words, x, width, startY, align) {
  let cursorY = startY;
  let lineTokens = [];
  let lineWidth = 0;

  const flushLine = () => {
    while (lineTokens.length && lineTokens[0].isSpace) lineTokens.shift();
    while (lineTokens.length && lineTokens[lineTokens.length - 1].isSpace) lineWidth -= lineTokens.pop().width;
    if (lineTokens.length === 0) return;
    let rightX = align === 'left' ? x + lineWidth : x + width;
    let maxHeight = 0;
    for (const token of lineTokens) maxHeight = Math.max(maxHeight, token.style.fontSize * (token.style.lineHeight || 1.2));
    for (const token of lineTokens) {
      if (!token.isSpace) {
        doc.font(token.font).fontSize(token.style.fontSize).fillColor(colorHex(token.style.color), colorOpacity(token.style.color));
        const wordX = rightX - token.width;
        doc.text(token.text, wordX, cursorY, {
          lineBreak: false,
          underline: token.style.underline,
          strike: token.style.strikethrough,
          characterSpacing: token.style.letterSpacing || 0,
        });
        if (token.href) doc.link(wordX, cursorY, token.width, maxHeight, token.href);
      }
      rightX -= token.width;
    }
    cursorY += maxHeight;
    lineTokens = [];
    lineWidth = 0;
  };

  for (const token of words) {
    doc.font(token.font).fontSize(token.style.fontSize);
    token.width = doc.widthOfString(token.text);
    const noWrap = token.style.whiteSpace === 'nowrap';
    if (!noWrap && !token.isSpace && lineWidth + token.width > width && lineTokens.some((t) => !t.isSpace)) flushLine();
    lineTokens.push(token);
    lineWidth += token.width;
  }
  flushLine();
  doc.y = cursorY;
}

function renderInlineLines(doc, lines, blockStyle, x, width) {
  let align = blockStyle.textAlign || 'left';
  const rtlParagraph = blockStyle.direction === 'rtl';
  if (rtlParagraph && (blockStyle.textAlign == null || blockStyle.textAlign === 'left')) align = 'right';

  for (const line of lines) {
    if (line.length === 0) {
      doc.moveDown(0.6);
      continue;
    }
    const subRuns = line.flatMap((run) => scriptRuns(doc, run));
    const lineIsRtl = rtlParagraph || isRtl(line.map((r) => r.text).join(''));

    if (lineIsRtl) {
      renderRtlWords(doc, tokenizeWords(subRuns), x, width, doc.y, align);
      continue;
    }

    subRuns.forEach((run, i) => {
      doc.font(run.font).fontSize(run.style.fontSize).fillColor(colorHex(run.style.color), colorOpacity(run.style.color));
      const isLast = i === subRuns.length - 1;
      const textOpts = {
        continued: !isLast,
        underline: run.style.underline,
        strike: run.style.strikethrough,
        characterSpacing: run.style.letterSpacing || 0,
        lineGap: run.style.lineHeight ? (run.style.lineHeight - 1) * run.style.fontSize : undefined,
        link: run.href,
      };
      if (isLast) { textOpts.width = width; textOpts.align = align; }
      const runX = doc.x;
      const runY = doc.y;
      drawRun(doc, run.text, textOpts, runX, runY);
    });
  }
}

function renderParagraph(doc, node, style, x, width) {
  const lines = collectInlineLines(node, style);
  doc.x = x;
  renderInlineLines(doc, lines, style, x, width);
}

function renderList(doc, node, style, x, width, depth = 0) {
  const items = (node.children || []).filter((c) => c.tag === 'li');
  let index = 1;
  for (const li of items) {
    const liStyle = resolveStyle('li', li.attrs, style);
    const prefix = node.tag === 'ol' ? `${index}. ` : depth > 0 ? '◦ ' : '• ';
    const indent = (liStyle.paddingLeft != null ? liStyle.paddingLeft : style.paddingLeft || 18);
    doc.x = x + indent;
    doc.font(liStyle.bold ? 'Body-Bold' : 'Body').fontSize(liStyle.fontSize).fillColor(colorHex(liStyle.color));
    doc.text(prefix, { continued: true });

    const inlineChildren = (li.children || []).filter((c) => !LIST_TAGS.has(c.tag));
    const nestedLists = (li.children || []).filter((c) => LIST_TAGS.has(c.tag));
    const lines = collectInlineLines({ children: inlineChildren }, liStyle);
    renderInlineLines(doc, lines, liStyle, x + indent, width - indent);
    for (const nested of nestedLists) {
      const nestedStyle = resolveStyle(nested.tag, nested.attrs, liStyle);
      renderList(doc, nested, nestedStyle, x + indent, width - indent, depth + 1);
    }
    index += 1;
  }
}

function extractWidthPercent(styleAttr) {
  if (!styleAttr) return null;
  const m = styleAttr.match(/width\s*:\s*([\d.]+)%/);
  return m ? parseFloat(m[1]) / 100 : null;
}

function computeColumnWidths(firstRowCells, tableWidth) {
  const colCount = firstRowCells.reduce((sum, c) => sum + (parseInt(c.attrs && c.attrs.colspan, 10) || 1), 0);
  const raw = [];
  firstRowCells.forEach((cell) => {
    const span = parseInt(cell.attrs && cell.attrs.colspan, 10) || 1;
    const pct = extractWidthPercent(cell.attrs && cell.attrs.style);
    for (let i = 0; i < span; i += 1) raw.push(pct != null ? (tableWidth * pct) / span : null);
  });
  while (raw.length < colCount) raw.push(null);
  const definedTotal = raw.reduce((sum, w) => sum + (w || 0), 0);
  const undefinedCount = raw.filter((w) => w === null).length;
  const remaining = Math.max(tableWidth - definedTotal, 0);
  const fallback = undefinedCount > 0 ? remaining / undefinedCount : 0;
  return raw.map((w) => (w === null ? fallback : w));
}

function renderCellContent(doc, cell, cellStyle, cellX, cellWidth, top, padding) {
  doc.x = cellX + padding;
  doc.y = top + padding;
  const beforeY = doc.y;
  if ((cell.children || []).length > 0) {
    if (isInlineOnly(cell)) {
      renderParagraph(doc, cell, cellStyle, cellX + padding, cellWidth - padding * 2);
    } else {
      for (const child of cell.children) {
        renderNode(doc, child, cellStyle, cellX + padding, cellWidth - padding * 2);
      }
    }
  }
  return doc.y - beforeY;
}

// Tracks cells from earlier rows whose rowspan still occupies a column on the
// current row, so later rows skip those column slots instead of overlapping them.
function layoutRowCells(row, rowStyle, colWidths, colOffsets, x, activeSpans) {
  const cells = (row.children || []).filter((c) => c.tag === 'td' || c.tag === 'th');
  const info = [];
  let col = 0;
  for (const cell of cells) {
    while (activeSpans[col] && activeSpans[col] > 0) col += 1;
    const colspan = parseInt(cell.attrs && cell.attrs.colspan, 10) || 1;
    const rowspan = parseInt(cell.attrs && cell.attrs.rowspan, 10) || 1;
    const cellStyle = resolveStyle(cell.tag, cell.attrs, rowStyle);
    if (cell.tag === 'th') cellStyle.bold = true;
    const cellX = x + (colOffsets[col] || 0);
    const cellWidth = colWidths.slice(col, col + colspan).reduce((s, w) => s + (w || 0), 0) || colWidths[col] || 0;
    for (let i = 0; i < colspan; i += 1) activeSpans[col + i] = Math.max(activeSpans[col + i] || 0, rowspan);
    info.push({ cell, cellStyle, cellX, cellWidth, col, rowspan });
    col += colspan;
  }
  return info;
}

function renderTable(doc, node, style, x, width) {
  const sections = { thead: [], body: [] };
  (function gatherRows(n, into) {
    for (const child of n.children || []) {
      if (child.tag === 'tr') into.push(child);
      else if (child.tag === 'thead') gatherRows(child, sections.thead);
      else if (child.tag === 'tbody' || child.tag === 'tfoot') gatherRows(child, sections.body);
    }
  })(node, sections.body);

  const allRows = [...sections.thead, ...sections.body];
  if (allRows.length === 0) return;
  const firstRowCells = (allRows[0].children || []).filter((c) => c.tag === 'td' || c.tag === 'th');
  const colWidths = computeColumnWidths(firstRowCells, width);
  const colOffsets = [];
  colWidths.reduce((acc, w) => { colOffsets.push(acc); return acc + w; }, 0);
  const cellPadding = 6;
  const activeSpans = [];

  const pageBottom = doc.page.margins.top + (doc.page.height - doc.page.margins.top - doc.page.margins.bottom);

  function drawRow(row, rowStyle) {
    for (let i = 0; i < activeSpans.length; i += 1) if (activeSpans[i] > 0) activeSpans[i] -= 1;
    const cellInfo = layoutRowCells(row, rowStyle, colWidths, colOffsets, x, activeSpans);
    const rowStartY = doc.y;

    // The page-break decision for this row was already made before drawRow was
    // called. If a cell's text wraps right at the bottom edge, pdfkit's own
    // text-wrapper may otherwise "helpfully" insert a spurious extra page mid-row.
    const realAddPage = doc.addPage;
    doc.addPage = () => doc;

    let maxHeight = 0;
    cellInfo.forEach(({ cell, cellStyle, cellX, cellWidth }) => {
      const h = renderCellContent(doc, cell, cellStyle, cellX, cellWidth, rowStartY, cellPadding);
      maxHeight = Math.max(maxHeight, h);
    });
    const rowHeight = Math.max(maxHeight, 14) + cellPadding * 2;

    if (rowStyle.backgroundColor) {
      doc.rect(x, rowStartY, width, rowHeight).fill(colorHex(rowStyle.backgroundColor));
      cellInfo.forEach(({ cell, cellStyle, cellX, cellWidth }) => {
        renderCellContent(doc, cell, cellStyle, cellX, cellWidth, rowStartY, cellPadding);
      });
    }

    cellInfo.forEach(({ cellStyle, cellX, cellWidth }) => {
      if (cellStyle.borderWidth) {
        doc.lineWidth(cellStyle.borderWidth).strokeColor(colorHex(cellStyle.borderColor) || '#000000')
          .rect(cellX, rowStartY, cellWidth, rowHeight).stroke();
      }
    });

    doc.addPage = realAddPage;
    doc.y = rowStartY + rowHeight;
    return rowHeight;
  }

  function estimateRowHeight(row, rowStyle) {
    const cellsForEstimate = (row.children || []).filter((c) => c.tag === 'td' || c.tag === 'th');
    let col = 0;
    let maxHeight = 0;
    cellsForEstimate.forEach((cell) => {
      const colspan = parseInt(cell.attrs && cell.attrs.colspan, 10) || 1;
      const cellStyle = resolveStyle(cell.tag, cell.attrs, rowStyle);
      if (cell.tag === 'th') cellStyle.bold = true;
      const cellWidth = colWidths.slice(col, col + colspan).reduce((s, w) => s + (w || 0), 0) || colWidths[col] || 0;
      const h = measureNode(doc, cell, cellStyle, Math.max(cellWidth - cellPadding * 2, 1));
      maxHeight = Math.max(maxHeight, h);
      col += colspan;
    });
    return Math.max(maxHeight, 14) + cellPadding * 2;
  }

  for (const row of allRows) {
    const isHeaderRow = sections.thead.includes(row);
    const rowStyle = resolveStyle('tr', row.attrs, style);

    // Estimate row height before drawing (accounting for wrapped text) so we can break
    // to a new page instead of letting pdfkit split a row across two pages mid-draw.
    const estimatedHeight = estimateRowHeight(row, rowStyle);
    if (doc.y + estimatedHeight > pageBottom && doc.y > doc.page.margins.top) {
      doc.addPage();
      if (sections.thead.length > 0 && !isHeaderRow) {
        for (const headerRow of sections.thead) {
          drawRow(headerRow, resolveStyle('tr', headerRow.attrs, style));
        }
      }
    }
    drawRow(row, rowStyle);
  }
}

function decodeImageSource(src) {
  const m = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(src.trim());
  if (m) return Buffer.from(m[2], 'base64');
  return src;
}

function renderImage(doc, node, style, x, width) {
  const src = node.attrs && node.attrs.src;
  if (!src) return;
  try {
    const opts = {};
    if (style.width) opts.width = style.width;
    if (style.height) opts.height = style.height;
    doc.image(decodeImageSource(src), x, doc.y, opts);
    if (style.height) doc.y += style.height;
    else if (style.width) doc.y += style.width; // fallback if intrinsic size unknown
  } catch (err) {
    doc.fontSize(10).fillColor('#ff0000').text(`[image failed: ${src}]`, x, doc.y);
  }
}

function renderSvg(doc, node, style, x) {
  const attrs = node.attrs || {};
  const viewBox = attrs.viewbox || attrs.viewBox;
  const displayHeight = style.height || 40;
  const displayWidth = style.width;

  let scaleX = 1;
  let scaleY = 1;
  let vbWidth = null;
  let vbHeight = null;

  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      vbWidth = parts[2];
      vbHeight = parts[3];
      if (displayWidth && displayHeight) {
        scaleX = displayWidth / vbWidth;
        scaleY = displayHeight / vbHeight;
      } else if (displayHeight && vbHeight) {
        scaleY = displayHeight / vbHeight;
        scaleX = scaleY;
      } else if (displayWidth && vbWidth) {
        scaleX = displayWidth / vbWidth;
        scaleY = scaleX;
      }
    }
  }

  const startY = doc.y;
  const renderedHeight = vbHeight ? vbHeight * scaleY : displayHeight;

  doc.save();
  doc.translate(x, startY);
  doc.scale(scaleX, scaleY, { origin: [0, 0] });

  function drawPaths(n) {
    for (const child of n.children || []) {
      if (child.tag === 'path') {
        const d = child.attrs && child.attrs.d;
        const fill = child.attrs && child.attrs.fill;
        const fillRule = child.attrs && (child.attrs['fill-rule'] || child.attrs.fillrule);
        if (d) {
          try {
            if (fill && fill !== 'none') {
              doc.path(d).fill(fill);
            } else if (fill !== 'none') {
              doc.path(d).fill('#000000');
            }
          } catch (_) {}
        }
      } else {
        drawPaths(child);
      }
    }
  }

  drawPaths(node);
  doc.restore();
  doc.y = startY + renderedHeight + (style.marginBottom || 0);
}

// Fills each pre-parsed <path> (see lib/pdf-engine/svg-utils.ts) at the current
// transform. Used to draw a vector logo directly, without needing a rasterized
// image asset for it.
function fillVectorPaths(doc, paths) {
  for (const p of paths || []) {
    if (!p.d || p.fill === 'none') continue;
    try {
      doc.path(p.d).fill(p.fill && p.fill !== 'none' ? p.fill : '#000000');
    } catch (_) {
      // Malformed path data — skip it rather than failing the whole render.
    }
  }
}

// Draws a parsed SVG logo ({ viewBox, paths }) scaled to fit within a `boxSize`
// square at (x, y), preserving aspect ratio and centering within the box.
function drawVectorLogo(doc, logoSvg, x, y, boxSize) {
  const parts = (logoSvg.viewBox || '0 0 100 100').trim().split(/[\s,]+/).map(Number);
  const vbWidth = parts[2] || 100;
  const vbHeight = parts[3] || 100;
  const scale = Math.min(boxSize / vbWidth, boxSize / vbHeight);
  const offsetX = x + (boxSize - vbWidth * scale) / 2;
  const offsetY = y + (boxSize - vbHeight * scale) / 2;

  doc.save();
  doc.translate(offsetX, offsetY);
  doc.scale(scale, scale, { origin: [0, 0] });
  fillVectorPaths(doc, logoSvg.paths);
  doc.restore();
}

function renderHr(doc, x, width) {
  doc.moveDown(0.3);
  doc.lineWidth(1).strokeColor('#000000').moveTo(x, doc.y).lineTo(x + width, doc.y).stroke();
  doc.moveDown(0.3);
}

// Draws the background/border box for a block. Height is computed up front via
// measureInner (a non-drawing pass), so content is painted exactly once — pdfkit has
// no z-index, so painting it twice would duplicate output.
function renderBoxedContent(doc, node, style, x, width, renderContent) {
  const startY = doc.y;
  const height = measureInner(doc, node, style, width);
  const radius = style.borderRadius || 0;

  if (style.backgroundColor) {
    const fillColor = colorHex(style.backgroundColor);
    if (radius) doc.roundedRect(x, startY, width, height, radius).fill(fillColor, colorOpacity(style.backgroundColor));
    else doc.rect(x, startY, width, height).fill(fillColor, colorOpacity(style.backgroundColor));
    doc.y = startY;
  }

  renderContent();
  const endY = doc.y;

  if (style.borderWidth) {
    doc.lineWidth(style.borderWidth).strokeColor(colorHex(style.borderColor) || '#000000');
    if (radius) doc.roundedRect(x, startY, width, height, radius).stroke();
    else doc.rect(x, startY, width, height).stroke();
  }

  doc.y = Math.max(endY, startY + height);
}

// Page-level "keep together": if a block's full height fits on a fresh page but not
// in the space remaining on the current one, start a new page before drawing it
// rather than letting pdfkit split it mid-content.
function keepTogetherIfNeeded(doc, node, style, width) {
  const contentHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
  const height = measureInner(doc, node, style, width);
  const remaining = contentHeight - (doc.y - doc.page.margins.top);
  if (height <= contentHeight && height > remaining) doc.addPage();
}

function renderNode(doc, node, parentStyle, x, width) {
  if (node.tag === '#text') {
    if (node.text.trim() === '') return;
    renderParagraph(doc, { children: [node] }, parentStyle, x, width);
    return;
  }

  const style = resolveStyle(node.tag, node.attrs, parentStyle);
  if (style.hidden) return;

  if (style.keepTogether) keepTogetherIfNeeded(doc, node, style, width);

  if (style.marginTop) doc.y += style.marginTop;
  const blockX = x + (style.marginLeft || 0);
  let blockWidth = width - (style.marginLeft || 0) - (style.marginRight || 0);
  if (style.maxWidth != null) blockWidth = Math.min(blockWidth, style.maxWidth);
  if (style.minWidth != null) blockWidth = Math.max(blockWidth, style.minWidth);

  const padTop = style.paddingTop || 0;
  const padBottom = style.paddingBottom || 0;
  const padLeft = node.tag === 'ul' || node.tag === 'ol' ? 0 : style.paddingLeft || 0;
  const padRight = style.paddingRight || 0;
  const contentX = blockX + padLeft;
  const contentWidth = blockWidth - padLeft - padRight;

  const renderInner = () => {
    if (padTop) doc.y += padTop;
    switch (node.tag) {
      case 'hr':
        renderHr(doc, contentX, contentWidth);
        break;
      case 'img':
        renderImage(doc, node, style, contentX, contentWidth);
        break;
      case 'svg':
        renderSvg(doc, node, style, contentX);
        break;
      case 'ul':
      case 'ol':
        renderList(doc, node, style, blockX, blockWidth);
        break;
      case 'table':
        renderTable(doc, node, style, contentX, contentWidth);
        break;
      case 'br':
        doc.moveDown(0.6);
        break;
      default:
        if ((node.children || []).length === 0) {
          if (style.height) doc.y += style.height;
        } else if (isInlineOnly(node)) {
          renderParagraph(doc, node, style, contentX, contentWidth);
        } else {
          for (const child of node.children) {
            renderNode(doc, child, style, contentX, contentWidth);
          }
        }
        break;
    }
    if (padBottom) doc.y += padBottom;
  };

  if (style.backgroundColor || style.borderWidth) {
    renderBoxedContent(doc, node, style, blockX, blockWidth, renderInner);
  } else {
    renderInner();
  }

  if (style.marginBottom) doc.y += style.marginBottom;
}

// Draws the letterhead band on every page: a single light-blue panel — curving
// away in the bottom-right corner — holding the logo top-left, the address block
// top-right, and the tagline bottom-left. Wired via doc's 'pageAdded' event so it
// also fires for pages created mid-flow (table breaks, keep-together, overflow).
function setupPageDecorations(doc, { logo, logoSvg, logoLabelLines, addressLines, tagline, theme } = {}) {
  if (!logo && !logoSvg && !addressLines && !tagline) return;
  const panelColor = (theme && theme.tint) || '#EAF6FD';
  const taglineColor = (theme && theme.primaryDark) || '#083A9E';
  let drawing = false;

  function draw() {
    if (drawing) return; // guard: doc.text below must never itself trigger 'pageAdded'
    drawing = true;
    const savedX = doc.x;
    const savedY = doc.y;
    const realAddPage = doc.addPage;
    doc.addPage = () => doc;

    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const width = doc.page.width - marginLeft - marginRight;
    const bandTop = 0;
    const contentTop = bandTop + 14;
    const hasLabelLines = logoLabelLines && logoLabelLines.length;
    const boxSize = hasLabelLines ? 80 : 56;
    let contentBottom = contentTop + boxSize;

    if (addressLines && addressLines.length) {
      let y = contentTop;
      for (const line of addressLines) y += 13;
      contentBottom = Math.max(contentBottom, y);
    }

    const taglineTop = contentBottom + 12;
    const taglineHeight = tagline ? 24 : 0;
    const bandBottom = taglineTop + taglineHeight;

    // Panel shape, traced from the reference SVG (viewBox 0 0 595 141) and scaled
    // to the full page width (edge-to-edge, ignoring the side margins) and this
    // band's height:
    //   M0 0H595V111H441 C433 111 427 114 421 120 L407 133 C401 139 394 141 384 141 H0V0Z
    const sx = doc.page.width / 595;
    const sy = (bandBottom - bandTop) / 141;
    const X = x => x * sx;
    const Y = y => bandTop + y * sy;
    doc.path(
      `M${X(0)},${Y(0)} ` +
        `L${X(595)},${Y(0)} ` +
        `L${X(595)},${Y(111)} ` +
        `L${X(441)},${Y(111)} ` +
        `C${X(433)},${Y(111)} ${X(427)},${Y(114)} ${X(421)},${Y(120)} ` +
        `L${X(407)},${Y(133)} ` +
        `C${X(401)},${Y(139)} ${X(394)},${Y(141)} ${X(384)},${Y(141)} ` +
        `L${X(0)},${Y(141)} Z`,
    ).fill(panelColor);

    if (logo || logoSvg) {
      // White card behind the logo, matching the reference letterhead, with the
      // brand name lines (if given) set below the mark inside the same card.
      const boxX = marginLeft + 8;
      const boxY = contentTop;
      doc.rect(boxX, boxY, boxSize, boxSize).fill('#ffffff');
      // When there are no separate label lines to make room for below, the logo
      // itself (e.g. bwadl's, which already bakes its wordmark into the artwork)
      // can fill nearly the whole card instead of being squeezed into a small icon.
      const iconSize = hasLabelLines ? 40 : boxSize - 12;
      const iconX = boxX + (boxSize - iconSize) / 2;
      const iconY = boxY + 8;
      try {
        if (logo) {
          doc.image(logo, iconX, iconY, { fit: [iconSize, iconSize] });
        } else {
          drawVectorLogo(doc, logoSvg, iconX, iconY, iconSize);
        }
      } catch (err) {
        // Corrupt/unreadable logo — skip rather than failing the whole render.
      }
      if (logoLabelLines && logoLabelLines.length) {
        doc.font('Body-Bold').fontSize(9.5).fillColor('#1a2a3a');
        let labelY = boxY + 50;
        for (const line of logoLabelLines) {
          doc.text(line, boxX, labelY, { width: boxSize, align: 'center', lineBreak: false });
          labelY += 11;
        }
      }
    }

    if (addressLines && addressLines.length) {
      doc.font('Body').fontSize(9.5).fillColor('#1a2a3a');
      let y = contentTop + 6;
      for (const line of addressLines) {
        doc.text(line, marginLeft, y, { width: width - 8, align: 'right', lineBreak: false });
        y += 14;
      }
    }

    if (tagline) {
      doc.font('Body-Bold').fontSize(11).fillColor(taglineColor)
        .text(tagline, marginLeft + 8, taglineTop, { lineBreak: false });
    }

    doc.addPage = realAddPage;
    doc.x = savedX;
    doc.y = savedY;
    drawing = false;
  }

  doc.on('pageAdded', draw);
  draw(); // first page doesn't emit 'pageAdded'
}

// Draws the footer (divider rule, contact line, "Page X / Y") on a single already
// laid-out page. Called in a final pass once the total page count is known, since
// pdfkit only knows how many pages exist after all content has been rendered.
function drawFooter(doc, { footerContact, pageNumbers, theme } = {}, pageNum, totalPages) {
  if (!footerContact && !pageNumbers) return;
  const contactColor = (theme && theme.primaryDark) || '#0F3AA8';
  // The footer band sits below the bottom margin by design, which pdfkit's own
  // text-wrapper misreads as an overflow and "fixes" by silently inserting an
  // extra page (and drawing the rest of this footer onto it). Stub out addPage
  // for the duration of this draw so it can't.
  const realAddPage = doc.addPage;
  doc.addPage = () => doc;

  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const width = doc.page.width - marginLeft - marginRight;
  const lineY = doc.page.height - doc.page.margins.bottom + 12;

  doc.lineWidth(0.5).strokeColor('#000000').moveTo(marginLeft, lineY).lineTo(marginLeft + width, lineY).stroke();

  if (footerContact) {
    doc.font('Body').fontSize(8.5).fillColor(contactColor)
      .text(footerContact, marginLeft, lineY + 8, { width, align: 'center', lineBreak: false });
  }
  if (pageNumbers) {
    doc.font('Body').fontSize(7.5).fillColor('#8a9ab0')
      .text(`Page ${pageNum} / ${totalPages}`, marginLeft, lineY + 22, { width, align: 'right', lineBreak: false });
  }

  doc.addPage = realAddPage;
}

// Runs after all content has been laid out: walks every buffered page and draws
// its footer, now that the final total page count is known.
function finalizePageFooters(doc, footerOptions) {
  if (!footerOptions || (!footerOptions.footerContact && !footerOptions.pageNumbers)) return;
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    drawFooter(doc, footerOptions, i + 1, range.count);
  }
}

function renderDocument(doc, rootNode, pageOptions) {
  setupPageDecorations(doc, pageOptions);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const baseStyle = resolveStyle('body', {}, null);
  doc.x = x;
  for (const child of rootNode.children || []) {
    renderNode(doc, child, baseStyle, x, width);
  }
}

module.exports = { renderDocument, finalizePageFooters };