export const MOCKED_SUPPORTED_COMMANDS = {
  'FT.SEARCH': {
    summary: 'Searches the index with a textual query, returning either documents or just ids',
    complexity: 'O(N)',
    history: [
      [
        '2.0.0',
        'Deprecated `WITHPAYLOADS` and `PAYLOAD` arguments'
      ]
    ],
    arguments: [
      {
        name: 'index',
        type: 'string'
      },
      {
        name: 'query',
        type: 'string'
      },
      {
        name: 'nocontent',
        type: 'pure-token',
        token: 'NOCONTENT',
        optional: true
      },
      {
        name: 'verbatim',
        type: 'pure-token',
        token: 'VERBATIM',
        optional: true
      },
      {
        name: 'nostopwords',
        type: 'pure-token',
        token: 'NOSTOPWORDS',
        optional: true
      },
      {
        name: 'withscores',
        type: 'pure-token',
        token: 'WITHSCORES',
        optional: true
      },
      {
        name: 'withpayloads',
        type: 'pure-token',
        token: 'WITHPAYLOADS',
        optional: true
      },
      {
        name: 'withsortkeys',
        type: 'pure-token',
        token: 'WITHSORTKEYS',
        optional: true
      },
      {
        name: 'filter',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'numeric_field',
            type: 'string',
            token: 'FILTER'
          },
          {
            name: 'min',
            type: 'double'
          },
          {
            name: 'max',
            type: 'double'
          }
        ]
      },
      {
        name: 'geo_filter',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'geo_field',
            type: 'string',
            token: 'GEOFILTER'
          },
          {
            name: 'lon',
            type: 'double'
          },
          {
            name: 'lat',
            type: 'double'
          },
          {
            name: 'radius',
            type: 'double'
          },
          {
            name: 'radius_type',
            type: 'oneof',
            arguments: [
              {
                name: 'm',
                type: 'pure-token',
                token: 'm'
              },
              {
                name: 'km',
                type: 'pure-token',
                token: 'km'
              },
              {
                name: 'mi',
                type: 'pure-token',
                token: 'mi'
              },
              {
                name: 'ft',
                type: 'pure-token',
                token: 'ft'
              }
            ]
          }
        ]
      },
      {
        name: 'in_keys',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'INKEYS'
          },
          {
            name: 'key',
            type: 'string',
            multiple: true
          }
        ]
      },
      {
        name: 'in_fields',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'INFIELDS'
          },
          {
            name: 'field',
            type: 'string',
            multiple: true
          }
        ]
      },
      {
        name: 'return',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'RETURN'
          },
          {
            name: 'identifiers',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'identifier',
                type: 'string'
              },
              {
                name: 'property',
                type: 'string',
                token: 'AS',
                optional: true
              }
            ]
          }
        ]
      },
      {
        name: 'summarize',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'summarize',
            type: 'pure-token',
            token: 'SUMMARIZE'
          },
          {
            name: 'fields',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'count',
                type: 'string',
                token: 'FIELDS'
              },
              {
                name: 'field',
                type: 'string',
                multiple: true
              }
            ]
          },
          {
            name: 'num',
            type: 'integer',
            token: 'FRAGS',
            optional: true
          },
          {
            name: 'fragsize',
            type: 'integer',
            token: 'LEN',
            optional: true
          },
          {
            name: 'separator',
            type: 'string',
            token: 'SEPARATOR',
            optional: true
          }
        ]
      },
      {
        name: 'highlight',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'highlight',
            type: 'pure-token',
            token: 'HIGHLIGHT'
          },
          {
            name: 'fields',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'count',
                type: 'string',
                token: 'FIELDS'
              },
              {
                name: 'field',
                type: 'string',
                multiple: true
              }
            ]
          },
          {
            name: 'tags',
            type: 'block',
            optional: true,
            arguments: [
              {
                name: 'tags',
                type: 'pure-token',
                token: 'TAGS'
              },
              {
                name: 'open',
                type: 'string'
              },
              {
                name: 'close',
                type: 'string'
              }
            ]
          }
        ]
      },
      {
        name: 'slop',
        type: 'integer',
        optional: true,
        token: 'SLOP'
      },
      {
        name: 'timeout',
        type: 'integer',
        optional: true,
        token: 'TIMEOUT'
      },
      {
        name: 'inorder',
        type: 'pure-token',
        token: 'INORDER',
        optional: true
      },
      {
        name: 'language',
        type: 'string',
        optional: true,
        token: 'LANGUAGE'
      },
      {
        name: 'expander',
        type: 'string',
        optional: true,
        token: 'EXPANDER'
      },
      {
        name: 'scorer',
        type: 'string',
        optional: true,
        token: 'SCORER'
      },
      {
        name: 'explainscore',
        type: 'pure-token',
        token: 'EXPLAINSCORE',
        optional: true
      },
      {
        name: 'payload',
        type: 'string',
        optional: true,
        token: 'PAYLOAD'
      },
      {
        name: 'sortby',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'sortby',
            type: 'string',
            token: 'SORTBY'
          },
          {
            name: 'order',
            type: 'oneof',
            optional: true,
            arguments: [
              {
                name: 'asc',
                type: 'pure-token',
                token: 'ASC'
              },
              {
                name: 'desc',
                type: 'pure-token',
                token: 'DESC'
              }
            ]
          }
        ]
      },
      {
        name: 'limit',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'limit',
            type: 'pure-token',
            token: 'LIMIT'
          },
          {
            name: 'offset',
            type: 'integer'
          },
          {
            name: 'num',
            type: 'integer'
          }
        ]
      },
      {
        name: 'params',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'params',
            type: 'pure-token',
            token: 'PARAMS'
          },
          {
            name: 'nargs',
            type: 'integer'
          },
          {
            name: 'values',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'name',
                type: 'string'
              },
              {
                name: 'value',
                type: 'string'
              }
            ]
          }
        ]
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3'
      }
    ],
    since: '1.0.0',
    group: 'search'
  },

  'FT.AGGREGATE': {
    summary: 'Run a search query on an index and perform aggregate transformations on the results',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'index',
        type: 'string'
      },
      {
        name: 'query',
        type: 'string'
      },
      {
        name: 'verbatim',
        type: 'pure-token',
        token: 'VERBATIM',
        optional: true
      },
      {
        name: 'load',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'LOAD'
          },
          {
            name: 'field',
            type: 'string',
            multiple: true
          }
        ]
      },
      {
        name: 'timeout',
        type: 'integer',
        optional: true,
        token: 'TIMEOUT'
      },
      {
        name: 'loadall',
        type: 'pure-token',
        token: 'LOAD *',
        optional: true
      },
      {
        name: 'groupby',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'nargs',
            type: 'integer',
            token: 'GROUPBY'
          },
          {
            name: 'property',
            type: 'string',
            multiple: true
          },
          {
            name: 'reduce',
            type: 'block',
            optional: true,
            multiple: true,
            arguments: [
              {
                name: 'function',
                type: 'string',
                token: 'REDUCE'
              },
              {
                name: 'nargs',
                type: 'integer'
              },
              {
                name: 'arg',
                type: 'string',
                multiple: true
              },
              {
                name: 'name',
                type: 'string',
                token: 'AS',
                optional: true
              }
            ]
          }
        ]
      },
      {
        name: 'sortby',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'nargs',
            type: 'integer',
            token: 'SORTBY'
          },
          {
            name: 'fields',
            type: 'block',
            optional: true,
            multiple: true,
            arguments: [
              {
                name: 'property',
                type: 'string'
              },
              {
                name: 'order',
                type: 'oneof',
                arguments: [
                  {
                    name: 'asc',
                    type: 'pure-token',
                    token: 'ASC'
                  },
                  {
                    name: 'desc',
                    type: 'pure-token',
                    token: 'DESC'
                  }
                ]
              }
            ]
          },
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true
          }
        ]
      },
      {
        name: 'apply',
        type: 'block',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'expression',
            type: 'string',
            token: 'APPLY'
          },
          {
            name: 'name',
            type: 'string',
            token: 'AS'
          }
        ]
      },
      {
        name: 'limit',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'limit',
            type: 'pure-token',
            token: 'LIMIT'
          },
          {
            name: 'offset',
            type: 'integer'
          },
          {
            name: 'num',
            type: 'integer'
          }
        ]
      },
      {
        name: 'filter',
        type: 'string',
        optional: true,
        token: 'FILTER'
      },
      {
        name: 'cursor',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'withcursor',
            type: 'pure-token',
            token: 'WITHCURSOR'
          },
          {
            name: 'read_size',
            type: 'integer',
            optional: true,
            token: 'COUNT'
          },
          {
            name: 'idle_time',
            type: 'integer',
            optional: true,
            token: 'MAXIDLE'
          }
        ]
      },
      {
        name: 'params',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'params',
            type: 'pure-token',
            token: 'PARAMS'
          },
          {
            name: 'nargs',
            type: 'integer'
          },
          {
            name: 'values',
            type: 'block',
            multiple: true,
            arguments: [
              {
                name: 'name',
                type: 'string'
              },
              {
                name: 'value',
                type: 'string'
              }
            ]
          }
        ]
      },
      {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3'
      }
    ],
    since: '1.1.0',
    group: 'search'
  }
}
