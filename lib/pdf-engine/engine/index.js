const PDFDocument = require('pdfkit/js/pdfkit.standalone');
const { parseHtml } = require('./parser');
const { renderDocument, finalizePageFooters } = require('./render');
const { registerFonts } = require('./fonts');

async function htmlToPdf(
  html,
  {
    stream,
    margin = 50,
    margins,
    size = 'A4',
    layout = 'portrait',
    logo,
    logoSvg,
    logoLabelLines,
    addressLines,
    tagline,
    footerContact,
    pageNumbers,
    theme,
  } = {},
) {
  const doc = new PDFDocument(margins ? { margins, size, layout, bufferPages: true } : { margin, size, layout, bufferPages: true });
  doc._availableFonts = await registerFonts(doc);
  if (stream) doc.pipe(stream);
  const tree = parseHtml(html);
  const logoBuffer = logo ? Buffer.from(logo) : null;
  renderDocument(doc, tree, { logo: logoBuffer, logoSvg, logoLabelLines, addressLines, tagline, theme });
  finalizePageFooters(doc, { footerContact, pageNumbers, theme });
  doc.end();
  return doc;
}

module.exports = { htmlToPdf };