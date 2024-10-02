import { addOwnTokenToArgs, findCurrentArgument, generateDetail, splitQueryByArgs } from 'uiSrc/pages/search/utils'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'
import { Maybe } from 'uiSrc/utils'
import {
  commonfindCurrentArgumentCases,
  findArgumentftAggreageTests,
  findArgumentftSearchTests
} from './test-cases'
import { MOCKED_SUPPORTED_COMMANDS } from '../../mocks/mocks'

const ftSearchCommand = MOCKED_SUPPORTED_COMMANDS['FT.SEARCH']
const ftAggregateCommand = MOCKED_SUPPORTED_COMMANDS['FT.AGGREGATE']
const COMMANDS = Object.keys(MOCKED_SUPPORTED_COMMANDS).map((name) => ({
  name,
  ...MOCKED_SUPPORTED_COMMANDS[name]
}))

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

        if (appendNotIncludes) {
          appendNotIncludes.forEach((token) => {
            expect(
              testResult?.append?.flat()?.map((arg) => arg.token)
            ).not.toEqual(
              expect.arrayContaining([token])
            )
          })
        }
      })
    })
  })

  describe('FT.AGGREGATE', () => {
    findArgumentftAggreageTests.forEach(({ args, result: testResult }) => {
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
    findArgumentftSearchTests.forEach(({ args, result: testResult }) => {
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
        prevCursorChar: ''
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
        nextCursorChar: '',
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
        nextCursorChar: '',
        prevCursorChar: ''
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
        nextCursorChar: '',
        prevCursorChar: ''
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
