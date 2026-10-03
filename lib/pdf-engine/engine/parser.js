const { Parser } = require('htmlparser2');

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);

function parseHtml(html) {
  const root = { tag: 'root', attrs: {}, children: [] };
  const stack = [root];

  const parser = new Parser(
    {
      onopentag(name, attrs) {
        const node = { tag: name, attrs, children: [], parent: stack[stack.length - 1] };
        stack[stack.length - 1].children.push(node);
        if (!VOID_TAGS.has(name)) stack.push(node);
      },
      ontext(text) {
        const parent = stack[stack.length - 1];
        parent.children.push({ tag: '#text', text, parent });
      },
      onclosetag(name) {
        if (VOID_TAGS.has(name)) return;
        if (stack.length > 1) stack.pop();
      },
    },
    { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true }
  );

  parser.write(html);
  parser.end();

  const body = findFirst(root, 'body') || root;
  return body;
}

function findFirst(node, tag) {
  if (node.tag === tag) return node;
  for (const child of node.children || []) {
    const found = findFirst(child, tag);
    if (found) return found;
  }
  return null;
}

module.exports = { parseHtml };
