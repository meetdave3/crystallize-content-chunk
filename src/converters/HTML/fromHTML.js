const parse5 = require('parse5');

const helpers = require('./helpers');

function getChunkDefinition({ tagName }) {
  const definition = helpers.HTMLElementToTypeMap[tagName];
  if (definition) {
    return definition;
  }

  return {
    kind: 'inline',
    type: null
  };
}

function getTextContent(node) {
  function parseText(text = '') {
    // If line breaks are present, remove all line breaks and whitespace
    if (text.match(/\r?\n|\r/g)) {
      return text.replace(/\r?\n|\r|\s/g, '');
    }

    // Replace double white space with a single
    return text.replace(/\s{2,}/g, ' ');
  }

  if (node.nodeName === '#text') {
    return parseText(node.value);
  }

  return (
    node.childNodes &&
    node.childNodes.length === 1 &&
    node.childNodes[0].nodeName === '#text' &&
    parseText(node.childNodes[0].value)
  );
}

function getMetadataFromNode(node) {
  const metadata = {};

  if (node.attrs && node.attrs.length > 0) {
    const validAttrs = helpers.getValidAttributes(node);
    if (validAttrs) {
      validAttrs.forEach(attr => {
        const attrOnNode = node.attrs.find(a => a.name === attr);
        if (attrOnNode) {
          metadata[attr] = attrOnNode.value;
        }
      });
    }
  }

  if (Object.keys(metadata).length > 0) {
    return metadata;
  }

  return null;
}

const nodeTypesThatCannotHaveDirectTextChildren = 'ul ol table thead tbody tfoot tr th td img'.split(
  ' '
);

function nodeHasContent(node) {
  if (node.nodeName === '#text') {
    if (
      nodeTypesThatCannotHaveDirectTextChildren.includes(
        node.parentNode.nodeName
      )
    ) {
      return false;
    }
  }
  return true;
}

function chunkHasContent(chunk) {
  // Empty, inline chunks
  if (
    chunk &&
    chunk.kind === 'inline' &&
    chunk.type === null &&
    !chunk.textContent
  ) {
    return false;
  }

  if (chunk) {
    return true;
  }

  return false;
}

function parseChunk(node) {
  const chunkDefinition = getChunkDefinition(node);

  const chunk = {};
  Object.assign(chunk, chunkDefinition);

  const metadata = getMetadataFromNode(node);
  if (metadata) {
    if (!chunk.metadata) {
      chunk.metadata = {};
    }
    Object.assign(chunk.metadata, metadata);
  }

  const textContent = getTextContent(node);
  if (textContent) {
    chunk.textContent = textContent;
  } else if (node.childNodes && node.childNodes.length > 0) {
    chunk.children = Array.from(node.childNodes)
      .filter(nodeHasContent)
      .map(parseChunk)
      .filter(chunkHasContent);
  }

  return chunk;
}

function fromHTML(html) {
  if (!html) {
    return null;
  }

  const fragment = parse5.parseFragment(html);

  if (fragment.childNodes.length === 1) {
    return parseChunk(fragment.childNodes[0]);
  }

  return fragment.childNodes.map(parseChunk).filter(chunkHasContent);
}

module.exports = fromHTML;
