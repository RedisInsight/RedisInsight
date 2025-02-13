// Common test cases
export const commonfindCurrentArgumentCases = [
  {
    input: 'FT.SEARCH index "" DIALECT 1',
    result: {
      stopArg: undefined,
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object)
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
      parent: expect.any(Object),
      token: expect.any(Object)
    },
    appendIncludes: ['REDUCE', 'APPLY', 'SORTBY', 'GROUPBY'],
    appendNotIncludes: ['AS'],
  },
  {
    input: 'FT.AGGREGATE \'idx1:vd\' "*" GROUPBY 1 @location REDUCE COUNT 0 AS item_count REDUCE SUM 1 @students ',
    result: {
      stopArg: {
        name: 'name',
        optional: true,
        token: 'AS',
        type: 'string'
      },
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object)
    },
    appendIncludes: ['AS', 'REDUCE', 'APPLY', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.SEARCH "idx:bicycle" "*" ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object)
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
    input: 'FT.PROFILE idx AGGREGATE LIMITED ',
    result: expect.any(Object),
    appendIncludes: ['QUERY'],
    appendNotIncludes: ['LIMITED', 'SEARCH'],
  },
  {
    input: 'FT.PROFILE \'idx:schools\' SEARCH QUERY \'q\' ',
    result: expect.any(Object),
    appendIncludes: [],
    appendNotIncludes: ['LIMITED'],
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
      parent: expect.any(Object),
      token: expect.any(Object)
    },
    appendIncludes: ['AS', 'GEO', 'TEXT', 'VECTOR'],
    appendNotIncludes: ['SCHEMA', 'SCORE', 'NOHL'],
  },
  // TODO: need to investigte the case when we have NOINDEX 'FT.CREATE "idx:schools" ON JSON SCHEMA address TEXT NOINDEX '
  // TODO: in this case we switch to field, but need to check?(or maybe not) all previous optional tokens
  {
    input: 'FT.CREATE "idx:schools" ON JSON SCHEMA address TEXT INDEXMISSING ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object)
    },
    appendIncludes: ['INDEXEMPTY', 'SORTABLE', 'WITHSUFFIXTRIE', 'NOINDEX'],
    appendNotIncludes: ['SCHEMA', 'SCORE', 'NOHL'],
  },
  {
    input: 'FT.CREATE "idx:schools" ON JSON SCHEMA address TEXT INDEXMISSING SORTABLE ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object)
    },
    appendIncludes: ['INDEXEMPTY', 'UNF', 'WITHSUFFIXTRIE'],
    appendNotIncludes: ['SCHEMA', 'SCORE', 'NOHL'],
  },
  {
    input: 'FT.ALTER "idx:schools" ',
    result: {
      stopArg: expect.any(Object),
      append: expect.any(Array),
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object)
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
      parent: expect.any(Object),
      token: expect.any(Object)
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
      token: expect.any(Object),
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
      },
      token: expect.any(Object)
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
  {
    input: 'FT.SEARCH index "*" SORTBY price ',
    result: expect.any(Object),
    appendIncludes: ['ASC', 'DESC', 'FILTER', 'LIMIT', 'DIALECT', 'WITHSCORES', 'INFIELDS'],
    appendNotIncludes: ['SORTBY'],
  },
  {
    input: 'FT.SEARCH textVehicles "(-@make:Toyota)" FILTER @year 2021 2022 ',
    result: expect.any(Object),
    appendIncludes: ['FILTER', 'GEOFILTER', 'TIMEOUT', 'WITHSORTKEYS'],
    appendNotIncludes: ['AS', 'ASC'],
  },
  {
    input: 'FT.SEARCH textVehicles "*" GEOFILTER geo_field lon lat radius ',
    result: expect.any(Object),
    appendIncludes: ['ft', 'km', 'm', 'mi'],
    appendNotIncludes: ['SORTBY', 'FILTER', 'LIMIT', 'DIALECT', 'AS', 'ASC'],
  },
  // skip
  // {
  //   input: 'FT.SEARCH textVehicles "*" RETURN 2 test ',
  //   result: expect.any(Object),
  //   appendIncludes: ['AS'],
  //   appendNotIncludes: ['SORTBY', 'FILTER', 'LIMIT', 'DIALECT', 'ASC'],
  // },
  {
    input: 'FT.CREATE textVehicles ON ',
    result: expect.any(Object),
    appendIncludes: ['HASH', 'JSON'],
    appendNotIncludes: ['SORTBY', 'FILTER', 'LIMIT', 'DIALECT', 'WITHSCORES', 'INFIELDS'],
  },
  {
    input: 'FT.CREATE textVehicles SCHEMA make ',
    result: expect.any(Object),
    appendIncludes: ['AS', 'GEO', 'NUMERIC', 'TAG', 'TEXT', 'VECTOR'],
    appendNotIncludes: ['FILTER', 'LIMIT', 'DIALECT', 'WITHSCORES', 'INFIELDS'],
  },
  {
    input: 'FT.AGGREGATE \'idx:articles\' \'@body:(term) \' APPLY \'test\' ',
    result: expect.any(Object),
    appendIncludes: ['AS'],
    appendNotIncludes: ['REDUCE', 'APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.AGGREGATE \'idx:articles\' \'@body:(term) \' APPLY \'test\' AS test1',
    result: expect.any(Object),
    appendIncludes: ['APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.AGGREGATE \'idx:articles\' \'@body:(term) \' LOAD * ',
    result: expect.any(Object),
    appendIncludes: ['APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.AGGREGATE \'idx:articles\' \'@body:(term) \' SORTBY 1 property ',
    result: expect.any(Object),
    appendIncludes: ['MAX', 'APPLY', 'GROUPBY'],
    appendNotIncludes: ['REDUCE', 'ASC', 'DESC'],
  },
  {
    input: 'FT.AGGREGATE \'idx:articles\' \'@body:(term) \' SORTBY 2 property ASC ',
    result: expect.any(Object),
    appendIncludes: ['MAX', 'APPLY', 'LOAD', 'GROUPBY'],
    appendNotIncludes: ['SORTBY'],
  },
  {
    input: 'FT.AGGREGATE \'idx:articles\' \'@body:(term) \' PARAMS 4 name1 value1 name2 value2 ',
    result: expect.any(Object),
    appendIncludes: ['APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
    appendNotIncludes: ['PARAMS', 'REDUCE'],
  },
  {
    input: 'FT.ALTER index SCHEMA ADD sdfsd fsdfsd ',
    result: expect.any(Object),
    appendIncludes: [],
    appendNotIncludes: ['SKIPINITIALSCAN', 'ADD', 'SCHEMA'],
  },
  {
    input: 'FT.DROPINDEX \'vd\' ',
    result: expect.any(Object),
    appendIncludes: ['DD'],
  },
  {
    input: 'FT.EXPLAIN index query ',
    result: expect.any(Object),
    appendIncludes: ['DIALECT'],
    appendNotIncludes: ['SKIPINITIALSCAN', 'ADD', 'SCHEMA', 'APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.EXPLAINCLI index query ',
    result: expect.any(Object),
    appendIncludes: ['DIALECT'],
    appendNotIncludes: ['SKIPINITIALSCAN', 'ADD', 'SCHEMA', 'APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.INFO index ',
    result: expect.any(Object),
    appendIncludes: [],
    appendNotIncludes: ['ADD', 'SCHEMA', 'APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.PROFILE \'idx:schools\' ',
    result: expect.any(Object),
    appendIncludes: ['AGGREGATE', 'SEARCH'],
    appendNotIncludes: ['LIMITED'],
  },
  {
    input: 'FT.SPELLCHECK \'idx:articles\' \'test\' DIALECT d DISTANCE d TERMS ',
    result: expect.any(Object),
    appendIncludes: ['EXCLUDE', 'INCLUDE'],
    appendNotIncludes: ['DIALECT', 'DISTANCE', 'TERMS'],
  },
  {
    input: 'FT.SYNUPDATE \'idx:products\' synonym_group_id ',
    result: expect.any(Object),
    appendIncludes: ['SKIPINITIALSCAN'],
    appendNotIncludes: ['DIALECT', 'DISTANCE', 'TERMS', 'INCLUDE', 'SCHEMA', 'APPLY', 'LOAD', 'SORTBY', 'GROUPBY'],
  },
  {
    input: 'FT.SEARCH \'idx\' \'query to search\' PARAMS 2 p1 p2 RETURN 3 p1 p2 p3 DIALECT ',
    result: {
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
      stopArg: {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3'
      }
    },
    appendIncludes: [],
  },
  // TODO: fix this case
  {
    input: 'FT.SEARCH \'idx\' \'query to search\' SORTBY a ASC PARAMS 3 a a2 a3 DIALECT ',
    result: {
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
      stopArg: {
        name: 'dialect',
        type: 'integer',
        optional: true,
        token: 'DIALECT',
        since: '2.4.3'
      }
    },
    appendIncludes: [],
  },
]
