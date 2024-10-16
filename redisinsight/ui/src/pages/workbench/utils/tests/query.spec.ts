import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'
import { Maybe, splitQueryByArgs } from 'uiSrc/utils'
import { MOCKED_REDIS_COMMANDS } from 'uiSrc/mocks/data/mocked_redis_commands'
import { IRedisCommand } from 'uiSrc/constants'
import {
  commonfindCurrentArgumentCases,
  findArgumentftAggreageTests,
  findArgumentftSearchTests
} from './test-cases'
import { addOwnTokenToArgs, findCurrentArgument, generateDetail } from '../query'

const ftSearchCommand = MOCKED_REDIS_COMMANDS['FT.SEARCH']
const ftAggregateCommand = MOCKED_REDIS_COMMANDS['FT.AGGREGATE']
const COMMANDS = Object.keys(MOCKED_REDIS_COMMANDS).map((name) => ({
  name,
  ...MOCKED_REDIS_COMMANDS[name]
}))
const COMPOSITE_ARGS = COMMANDS
  .filter((command) => command.name && command.name.includes(' '))
  .map(({ name }) => name)

describe('findCurrentArgument', () => {
  describe('with list of commands', () => {
    commonfindCurrentArgumentCases.forEach(({ input, result, appendIncludes, appendNotIncludes }) => {
      it(`should return proper suggestions for ${input}`, () => {
        const { args } = splitQueryByArgs(input, 0, COMPOSITE_ARGS)
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
          ftAggregateCommand.arguments as IRedisCommand[],
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
          ftSearchCommand.arguments as IRedisCommand[],
          args
        )
        expect(testResult).toEqual(result)
      })
    })
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
