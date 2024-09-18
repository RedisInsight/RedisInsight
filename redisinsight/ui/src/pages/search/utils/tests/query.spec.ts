import { addOwnTokenToArgs, findCurrentArgument, generateDetail, splitQueryByArgs } from 'uiSrc/pages/search/utils'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'
import { Maybe } from 'uiSrc/utils'
import { MOCKED_SUPPORTED_COMMANDS } from '../../mocks/mocks'

const ftSearchCommand = MOCKED_SUPPORTED_COMMANDS['FT.SEARCH']
const ftAggregateCommand = MOCKED_SUPPORTED_COMMANDS['FT.AGGREGATE']
const COMMANDS = [
  {
    name: 'FT.SEARCH',
    ...ftSearchCommand
  },
  {
    name: 'FT.AGGREGATE',
    ...ftAggregateCommand
  }
]

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
        [
          {
            name: 'name',
            type: 'string',
            token: 'AS',
            optional: true,
            parent: {
              name: 'reduce',
              type: 'block',
              optional: true,
              multiple: true,
              arguments: [
                {
                  name: 'function',
                  token: 'REDUCE',
                  type: 'string'
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
              ],
              parent: expect.any(Object)
            }
          }
        ],
        [
          {
            name: 'function',
            token: 'REDUCE',
            type: 'string',
            multiple: true,
            optional: true,
            parent: {
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
                  arguments: expect.any(Array)
                }
              ]
            }
          }
        ]
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['""', '""', 'GROUPBY', '2', 'p1', 'p2', 'REDUCE', 'f', '1', 'AS', 'name'],
    result: {
      stopArg: undefined,
      append: [
        [],
        [
          {
            name: 'function',
            token: 'REDUCE',
            type: 'string',
            multiple: true,
            optional: true,
            parent: expect.any(Object)
          }
        ]
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
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true
      },
      append: [
        [
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true,
            parent: expect.any(Object)
          }
        ]
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY', '2', 'p1', 'ASC'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true
      },
      append: [
        [
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true,
            parent: expect.any(Object)
          }
        ]
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
        [{
          name: 'num',
          type: 'integer',
          token: 'MAX',
          optional: true,
          parent: expect.any(Object)
        }]
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['index', '"query"', 'SORTBY', '2', 'p1', 'ASC', 'MAX'],
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
      append: [[]],
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
      append: [[
        {
          name: 'count',
          type: 'string',
          token: 'FIELDS',
          parent: expect.any(Object),
          optional: true
        },
        {
          name: 'num',
          type: 'integer',
          token: 'FRAGS',
          optional: true,
          parent: expect.any(Object)
        },
        {
          name: 'fragsize',
          type: 'integer',
          token: 'LEN',
          optional: true,
          parent: expect.any(Object)
        },
        {
          name: 'separator',
          type: 'string',
          token: 'SEPARATOR',
          optional: true,
          parent: expect.any(Object)
        }
      ]],
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
      append: [[
        {
          name: 'fragsize',
          type: 'integer',
          token: 'LEN',
          optional: true,
          parent: expect.any(Object)
        },
        {
          name: 'separator',
          type: 'string',
          token: 'SEPARATOR',
          optional: true,
          parent: expect.any(Object)
        }
      ]],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '1', 'iden'],
    result: {
      stopArg: undefined,
      // TODO: append may have AS token, since it is optional - we skip for now
      append: [
        []
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
      append: [[]],
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '2', 'iden', 'iden'],
    result: {
      stopArg: undefined,
      append: [
        []
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '3', 'iden', 'iden'],
    result: {
      stopArg: {
        name: 'property',
        type: 'string',
        token: 'AS',
        optional: true
      },
      append: [[]],
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object)
    }
  },
  {
    args: ['', '', 'RETURN', '3', 'iden', 'iden', 'AS', 'iden2'],
    result: {
      stopArg: undefined,
      append: [
        []
      ],
      isBlocked: false,
      isComplete: true,
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
        [
          {
            name: 'asc',
            type: 'pure-token',
            token: 'ASC',
            parent: expect.any(Object)
          },
          {
            name: 'desc',
            type: 'pure-token',
            token: 'DESC',
            parent: expect.any(Object)
          }
        ]
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
  {
    args: ['', '', 'DIALECT', '1'],
    result: {
      stopArg: undefined,
      append: [
        []
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object)
    }
  },
]

// Common test cases - provides list of suggestions
const commonfindCurrentArgumentCases = [
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
]

describe('findCurrentArgument', () => {
  describe('with list of commands', () => {
    commonfindCurrentArgumentCases.forEach(({ input, result, appendIncludes, appendNotIncludes }) => {
      it(`should return proper suggestions for ${input}`, () => {
        const { args } = splitQueryByArgs(input)
        const COMMANDS_LIST = COMMANDS.map((command) => ({
          ...addOwnTokenToArgs(command.name!, command),
          token: command.name!,
          type: TokenType.Block
        }))

        const testResult = findCurrentArgument(
          COMMANDS_LIST,
          args.flat()
        )
        expect(testResult).toEqual(result)
        expect(
          testResult?.append?.flat()?.map((arg) => arg.token)
        ).toEqual(
          expect.arrayContaining(appendIncludes)
        )
        expect(
          testResult?.append?.flat()?.map((arg) => arg.token)
        ).toEqual(
          expect.not.arrayContaining(appendNotIncludes)
        )
      })
    })
  })

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
      cursor: {
        argLeftOffset: 10,
        argRightOffset: 23,
        isCursorInQuotes: false,
        nextCursorChar: 'F',
        prevCursorChar: undefined
      }
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS', 17],
    result: {
      args: [['FT.SEARCH'], ['"idx:bicycle"', '""', 'WITHSORTKEYS']],
      cursor: {
        argLeftOffset: 10,
        argRightOffset: 23,
        isCursorInQuotes: true,
        nextCursorChar: 'c',
        prevCursorChar: 'i'
      }
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS', 39],
    result: {
      args: [['FT.SEARCH', '"idx:bicycle"', '""'], ['WITHSORTKEYS']],
      cursor: {
        argLeftOffset: 27,
        argRightOffset: 39,
        isCursorInQuotes: false,
        nextCursorChar: undefined,
        prevCursorChar: 'S'
      }
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle" "" WITHSORTKEYS ', 40],
    result: {
      args: [['FT.SEARCH', '"idx:bicycle"', '""', 'WITHSORTKEYS'], []],
      cursor: {
        argLeftOffset: 0,
        argRightOffset: 0,
        isCursorInQuotes: false,
        nextCursorChar: undefined,
        prevCursorChar: ' '
      }
    }
  },
  {
    input: ['FT.SEARCH "idx:bicycle \\" \\"" "" WITHSORTKEYS ', 46],
    result: {
      args: [['FT.SEARCH', '"idx:bicycle " ""', '""', 'WITHSORTKEYS'], []],
      cursor: {
        argLeftOffset: 0,
        argRightOffset: 0,
        isCursorInQuotes: false,
        nextCursorChar: undefined,
        prevCursorChar: ' '
      }
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
