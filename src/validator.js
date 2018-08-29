const validator = require('is-my-json-valid');

const schema = {
  title: 'Crystallize Content Chunk',
  version: '1.0.0',

  definitions: {
    chunk: {
      type: ['object', 'null'],
      additionalProperties: false,
      properties: {
        kind: {
          required: true,
          enum: ['block', 'inline'],
          description: 'The chunk kind'
        },
        type: {
          required: true,
          type: ['string', 'null'],
          description: 'The content type',
          enum: [
            null,
            'abbrevition',
            'abbrevition',
            'address',
            'article',
            'aside',
            'code',
            'container',
            'deleted',
            'details',
            'emphasized',
            'figcaption',
            'figure',
            'heading1',
            'heading2',
            'heading3',
            'heading4',
            'heading5',
            'heading6',
            'highlight',
            'horizontal-line',
            'image',
            'line-break',
            'link',
            'unordered-list',
            'ordered-list',
            'list-item',
            'paragraph',
            'picture',
            'preformatted',
            'quote',
            'section',
            'strong',
            'subscripted',
            'superscripted',
            'table',
            'table-body',
            'table-caption',
            'table-cell',
            'table-footer',
            'table-head',
            'table-head-cell',
            'table-row',
            'time',
            'title-of-a-work',
            'underlined'
          ]
        },
        textContent: {
          type: 'string',
          required: false,
          description: 'If set, this is the raw text content'
        },
        children: {
          type: 'array',
          required: false,
          items: {
            $ref: '#/definitions/chunk'
          }
        },
        metadata: {
          type: 'object',
          required: false
        }
      }
    }
  },

  oneOf: [
    {
      $ref: '#/definitions/chunk'
    },
    {
      type: 'array',
      items: {
        $ref: '#/definitions/chunk'
      }
    }
  ]
};

const isModelValid = validator(schema);
const isModelValidVerbose = validator(schema, {
  verbose: true
});

module.exports = { schema, isModelValid, isModelValidVerbose };
