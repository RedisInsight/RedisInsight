import { addOwnTokenToArgs, findCurrentArgument, generateDetail, splitQueryByArgs } from 'uiSrc/pages/search/utils'
import { SearchCommand } from 'uiSrc/pages/search/types'
import { Maybe } from 'uiSrc/utils'
import { MOCKED_SUPPORTED_COMMANDS } from './mocks'

const ftSearchCommand = MOCKED_SUPPORTED_COMMANDS['FT.SEARCH']
const ftAggregateCommand = MOCKED_SUPPORTED_COMMANDS['FT.AGGREGATE']

const ftAggreageTests = [
  { args: [''], result: null },
  { args: ['', ''], result: null },
  {
    args: ['index', '"query"', 'APPLY'],
    result: {
      stopArg: { name: 'expression', token: 'APPLY', type: 'string' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'APPLY', 'expression'],
    result: {
      stopArg: { name: 'name', token: 'AS', type: 'string' },
      append: expect.any(Array),
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'APPLY', 'expression', 'AS'],
    result: {
      stopArg: { name: 'name', token: 'AS', type: 'string' },
      append: expect.any(Array),
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'APPLY', 'expression', 'AS', 'name'],
    result: {
      stopArg: undefined,
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['""', '""', 'GROUPBY', '2', 'p1', 'p2', 'REDUCE', 'f'],
    result: {
      stopArg: { name: 'nargs', type: 'integer' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['""', '""', 'GROUPBY', '2', 'p1', 'p2', 'REDUCE', 'f', '0'],
    result: {
      stopArg: {
        name: 'name',
        type: 'string',
        token: 'AS',
        optional: true
      },
      append: [
        {
          name: 'name',
          type: 'string',
          token: 'AS',
          optional: true
        },
        {
          name: 'function',
          type: 'string',
          token: 'REDUCE'
        }
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY'],
    result: {
      stopArg: { name: 'nargs', token: 'SORTBY', type: 'integer' },
      append: expect.any(Array),
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY', '1', 'p1'],
    result: {
      stopArg: {
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
      },
      append: [
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
      ],
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY', '1', 'p1', 'ASC'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true
      },
      append: [
        {
          name: 'num',
          type: 'integer',
          token: 'MAX',
          optional: true
        }
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY', '0'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true
      },
      append: [
        {
          name: 'num',
          type: 'integer',
          token: 'MAX',
          optional: true
        }
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY', '1', 'p1', 'ASC', 'MAX'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'LOAD', '4'],
    result: {
      stopArg: { multiple: true, name: 'field', type: 'string' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'LOAD', '4', '1', '2', '3'],
    result: {
      stopArg: { multiple: true, name: 'field', type: 'string' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'LOAD', '4', '1', '2', '3', '4'],
    result: {
      stopArg: undefined,
      append: [],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
]

const ftSearchTests = [
  { args: [''], result: null },
  { args: ['', ''], result: null },
  {
    args: ['', '', 'SUMMARIZE'],
    result: {
      stopArg: {
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
      append: [
        {
          name: 'count',
          type: 'string',
          token: 'FIELDS'
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
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'SUMMARIZE', 'FIELDS'],
    result: {
      stopArg: {
        name: 'count',
        type: 'string',
        token: 'FIELDS'
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'SUMMARIZE', 'FIELDS', '1'],
    result: {
      stopArg: {
        name: 'field',
        type: 'string',
        multiple: true
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'SUMMARIZE', 'FIELDS', '1', 'f', 'FRAGS'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'FRAGS',
        optional: true
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'SUMMARIZE', 'FIELDS', '1', 'f', 'FRAGS', '10'],
    result: {
      stopArg: {
        name: 'fragsize',
        type: 'integer',
        token: 'LEN',
        optional: true
      },
      append: [
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
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '2', 'iden'],
    result: {
      stopArg: {
        name: 'property',
        type: 'string',
        token: 'AS',
        optional: true
      },
      append: [
        {
          name: 'property',
          type: 'string',
          token: 'AS',
          optional: true
        }
      ],
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '2', 'iden', 'iden'],
    result: {
      stopArg: {
        name: 'property',
        type: 'string',
        token: 'AS',
        optional: true
      },
      append: [
        {
          name: 'property',
          type: 'string',
          token: 'AS',
          optional: true
        }
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '2', 'iden', 'iden', 'AS'],
    result: {
      stopArg: {
        name: 'property',
        type: 'string',
        token: 'AS',
        optional: true
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'SORTBY', 'f'],
    result: {
      stopArg: {
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
      },
      append: [
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
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'SORTBY', 'f', 'DESC'],
    result: {
      stopArg: undefined,
      append: [],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
]

describe('findCurrentArgument', () => {
  describe('FT.AGGREGATE', () => {
    ftAggreageTests.forEach(({ args, result: testResult }) => {
      it(`should return proper suggestions for ${args.join(' ')}`, () => {
        const result = findCurrentArgument(
          ftAggregateCommand.arguments as SearchCommand[],
          args
        )
        expect(testResult).toEqual(result)
      })
    })
  })

  describe('FT.SEARCH', () => {
    ftSearchTests.forEach(({ args, result: testResult }) => {
      it(`should return proper suggestions for ${args.join(' ')}`, () => {
        const result = findCurrentArgument(
          ftSearchCommand.arguments as SearchCommand[],
          args
        )
        expect(testResult).toEqual(result)
      })
    })
  })
})

const splitQueryByArgsTests: Array<{
  input: [string, number?]
  result: any
}> = [
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS'],
    result: {
      args: [[], ['FT.SEARCH', '"idx:bicycle"', '""', 'WITHSORTKEYS']],
      isCursorInQuotes: false,
      nextCursorChar: 'F',
      prevCursorChar: undefined
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS', 17],
    result: {
      args: [['FT.SEARCH'], ['"idx:bicycle"', '""', 'WITHSORTKEYS']],
      isCursorInQuotes: true,
      nextCursorChar: 'c',
      prevCursorChar: 'i'
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS', 39],
    result: {
      args: [['FT.SEARCH', '"idx:bicycle"', '""'], ['WITHSORTKEYS']],
      isCursorInQuotes: false,
      nextCursorChar: undefined,
      prevCursorChar: 'S'
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS ', 40],
    result: {
      args: [['FT.SEARCH', '"idx:bicycle"', '""', 'WITHSORTKEYS'], []],
      isCursorInQuotes: false,
      nextCursorChar: undefined,
      prevCursorChar: ' '
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle \\" \\"" "" WITHSORTKEYS ', 46],
    result: {
      args: [['FT.SEARCH', '"idx:bicycle " ""', '""', 'WITHSORTKEYS'], []],
      isCursorInQuotes: false,
      nextCursorChar: undefined,
      prevCursorChar: ' '
    }
  }
]

describe('splitQueryByArgs', () => {
  it.each(splitQueryByArgsTests)('should return for %input proper result', ({ input, result }) => {
    const testResult = splitQueryByArgs(...input)
    expect(testResult).toEqual(result)
  })
})

const generateDetailTests: Array<{ input: Maybe<SearchCommand>, result: any }> = [
  {
    input: ftSearchCommand.arguments.find(({ name }) => name === 'nocontent') as SearchCommand,
    result: 'NOCONTENT'
  },
  {
    input: ftSearchCommand.arguments.find(({ name }) => name === 'filter') as SearchCommand,
    result: 'FILTER numeric_field min max'
  },
  {
    input: ftSearchCommand.arguments.find(({ name }) => name === 'geo_filter') as SearchCommand,
    result: 'GEOFILTER geo_field lon lat radius m | km | mi | ft'
  },
  {
    input: ftAggregateCommand.arguments.find(({ name }) => name === 'groupby') as SearchCommand,
    result: 'GROUPBY nargs property [property ...] [REDUCE function nargs arg [arg ...] [AS name] [REDUCE function nargs arg [arg ...] [AS name] ...]]'
  },
]

describe('generateDetail', () => {
  it.each(generateDetailTests)('should return for %input proper result', ({ input, result }) => {
    const testResult = generateDetail(input)
    expect(testResult).toEqual(result)
  })
})

describe('addOwnTokenToArgs', () => {
  it('should add FT.SEARCH to args', () => {
    const result = addOwnTokenToArgs('FT.SEARCH', { arguments: [] })

    expect({ arguments: [{ token: 'FT.SEARCH', type: 'pure-token' }] }).toEqual(result)
  })
})
