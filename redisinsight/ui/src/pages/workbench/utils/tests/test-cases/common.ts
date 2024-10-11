// Common test cases
export const commonfindCurrentArgumentCases = [
  {
    input: 'FT.SEARCH index "" DIALECT 1',
    result: {
      stopArg: undefined,
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    },
    appendIncludes: ['WITHSCORES', 'VERBATIM', 'FILTER', 'SORTBY', 'RETURN'],
    appendNotIncludes: ['DIALECT']
  },
  {
    input: 'FT.AGGREGATE "idx:schools" "" GROUPBY 1 p REDUCE AVG 1 a1 AS name ',
    result: {
      stopArg: undefined,
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    },
    appendIncludes: ['REDUCE', 'APPLY', 'SORTBY', 'GROUPBY'],
    appendNotIncludes: ['AS'],
  },
  {
    input: 'FT.SEARCH "idx:bicycle" "*" ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    },
    appendIncludes: ['DIALECT', 'EXPANDER', 'INKEYS', 'LIMIT'],
    appendNotIncludes: ['ASC'],
  },
  {
    input: 'FT.SEARCH "idx:bicycle" "*" DIALECT 2',
    result: expect.any(Object),
    appendIncludes: ['EXPANDER', 'INKEYS', 'LIMIT'],
    appendNotIncludes: ['DIALECT'],
  },
  {
    input: 'FT.PROFILE \'idx:schools\' SEARCH ',
    result: expect.any(Object),
    appendIncludes: ['LIMITED', 'QUERY'],
    appendNotIncludes: ['AGGREGATE', 'SEARCH'],
  },
  {
    input: 'FT.CREATE "idx:schools" ',
    result: expect.any(Object),
    appendIncludes: ['FILTER', 'ON', 'SCHEMA', 'SCORE', 'NOHL', 'STOPWORDS'],
    appendNotIncludes: ['HASH', 'JSON'],
  },
  {
    input: 'FT.CREATE "idx:schools" ON',
    result: expect.any(Object),
    appendIncludes: ['HASH', 'JSON'],
    appendNotIncludes: ['SCHEMA', 'SCORE', 'NOHL'],
  },
  {
    input: 'FT.CREATE "idx:schools" ON JSON NOFREQS',
    result: expect.any(Object),
    appendIncludes: ['TEMPORARY', 'NOFIELDS', 'PAYLOAD_FIELD', 'MAXTEXTFIELDS', 'PREFIX', 'SKIPINITIALSCAN'],
    appendNotIncludes: ['ON', 'JSON', 'NOFREQS'],
  },
  {
    input: 'FT.CREATE "idx:schools" ON JSON NOFREQS SKIPINITIALSCAN',
    result: expect.any(Object),
    appendIncludes: ['TEMPORARY', 'NOFIELDS', 'PAYLOAD_FIELD', 'MAXTEXTFIELDS', 'PREFIX'],
    appendNotIncludes: ['ON', 'JSON', 'NOFREQS', 'SKIPINITIALSCAN'],
  },
  {
    input: 'FT.CREATE "idx:schools" ON JSON SCHEMA address ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    },
    appendIncludes: ['AS', 'GEO', 'TEXT', 'VECTOR'],
    appendNotIncludes: ['SCHEMA', 'SCORE', 'NOHL'],
  },
  {
    input: 'FT.CREATE "idx:schools" ON JSON SCHEMA address TEXT NOINDEX INDEXMISSING ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    },
    appendIncludes: ['INDEXEMPTY', 'SORTABLE', 'WITHSUFFIXTRIE'],
    appendNotIncludes: ['SCHEMA', 'SCORE', 'NOHL'],
  },
  {
    input: 'FT.ALTER "idx:schools" ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    },
    appendIncludes: ['SCHEMA', 'SKIPINITIALSCAN'],
    appendNotIncludes: ['ADD'],
  },
  {
    input: 'FT.ALTER "idx:schools" SCHEMA',
    result: expect.any(Object),
    appendIncludes: ['ADD'],
    appendNotIncludes: ['SKIPINITIALSCAN'],
  },
  {
    input: 'FT.CONFIG SET ',
    result: {
      stopArg: {
        name: 'option',
        type: 'string'
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    },
    appendIncludes: [],
    appendNotIncludes: [expect.any(String)],
  },
  {
    input: 'FT.CURSOR READ "idx:schools" 1 ',
    result: expect.any(Object),
    appendIncludes: ['COUNT'],
  },
  {
    input: 'FT.DICTADD dict term1 ',
    result: {
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      stopArg: {
        multiple: true,
        name: 'term',
        type: 'string'
      }
    },
    appendIncludes: [],
  },
  {
    input: 'FT.SUGADD key string ',
    result: {
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      stopArg: {
        name: 'score',
        type: 'double'
      }
    },
    appendIncludes: [],
  },
  {
    input: 'FT.SUGADD key string 1.0 ',
    result: expect.any(Object),
    appendIncludes: ['INCR', 'PAYLOAD'],
  },
  {
    input: 'FT.SUGADD key string 1.0 PAYLOAD 1 ',
    result: expect.any(Object),
    appendIncludes: ['INCR'],
    appendNotIncludes: ['PAYLOAD'],
  },
  {
    input: 'FT.SUGGET k p FUZZY MAX 2 ',
    result: expect.any(Object),
    appendIncludes: ['WITHPAYLOADS', 'WITHSCORES'],
    appendNotIncludes: ['FUZZY', 'MAX'],
  },
  {
    input: 'FT.ALTER index SKIPINITIALSCAN ',
    result: expect.any(Object),
    appendIncludes: ['SCHEMA'],
    appendNotIncludes: ['ADD'],
  },
  {
    input: 'FT.SPELLCHECK idx "" ',
    result: expect.any(Object),
    appendIncludes: ['DIALECT', 'DISTANCE', 'TERMS'],
    appendNotIncludes: ['EXCLUDE', 'INCLUDE'],
  },
  {
    input: 'FT.SEARCH index "" HIGHLIGHT FIELDS 1 f1 ',
    result: expect.any(Object),
    appendIncludes: ['TAGS', 'SUMMARIZE', 'DIALECT', 'FILTER', 'WITHSCORES', 'INKEYS'],
    appendNotIncludes: ['FIELDS'],
  },
]
