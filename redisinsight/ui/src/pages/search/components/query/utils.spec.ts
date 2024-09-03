import { getGeneralSuggestions, isIndexComplete } from 'uiSrc/pages/search/components/query/utils'
import { MOCKED_SUPPORTED_COMMANDS } from 'uiSrc/pages/search/mocks/mocks'
import { addOwnTokenToArgs, buildSuggestion, findCurrentArgument } from 'uiSrc/pages/search/utils'
import { SearchCommand, TokenType } from 'uiSrc/pages/search/types'

const ftAggregate = MOCKED_SUPPORTED_COMMANDS['FT.AGGREGATE']

const commands = Object.keys(MOCKED_SUPPORTED_COMMANDS)
  .map((key) => ({
    ...addOwnTokenToArgs(key, MOCKED_SUPPORTED_COMMANDS[key]),
    token: key,
    type: TokenType.Block
  }))

const ftAggregateAppend = ftAggregate.arguments.slice(2)
  .map((arg) => ({ ...arg, parent: ftAggregate }))

const getGeneralSuggestionsTests = [
  {
    input: {
      foundArg: findCurrentArgument(
        commands,
        ['FT.AGGREGATE', '""', '""']
      ),
      allArgs: ['FT.AGGREGATE', '""', '""']
    },
    result: {
      helpWidgetData: expect.any(Object),
      suggestions: ftAggregateAppend
        .map((arg) => ({
          ...buildSuggestion(arg as SearchCommand, {} as any),
          sortText: expect.any(String),
          kind: undefined,
          detail: expect.any(String)
        }))
    }
  },
  {
    input: {
      foundArg: findCurrentArgument(
        commands,
        ['FT.AGGREGATE', '""', '""', 'APPLY', 'expression']
      ),
      allArgs: ['FT.AGGREGATE', '""', '""', 'APPLY', 'expression']
    },
    result: {
      helpWidgetData: expect.any(Object),
      suggestions: [
        {
          label: 'AS',
          insertText: 'AS ',
          insertTextRules: 4,
          range: expect.any(Object),
          kind: undefined,
          detail: 'APPLY expression AS name',
        }
      ]
    }
  },
  {
    input: {
      foundArg: findCurrentArgument(
        commands,
        ['FT.PROFILE', '""']
      ),
      allArgs: ['FT.PROFILE', '""']
    },
    result: {
      helpWidgetData: expect.any(Object),
      suggestions: [
        {
          label: 'SEARCH',
          insertText: 'SEARCH ',
          insertTextRules: 4,
          range: expect.any(Object),
          kind: undefined,
          detail: expect.any(String),
        },
        {
          label: 'AGGREGATE',
          insertText: 'AGGREGATE ',
          insertTextRules: 4,
          range: expect.any(Object),
          kind: undefined,
          detail: expect.any(String),
        }
      ]
    }
  },
]

describe('getGeneralSuggestions', () => {
  it.each(getGeneralSuggestionsTests)('should properly return suggestions', ({ input, result }) => {
    const testResult = getGeneralSuggestions(
      input.foundArg as any,
      input.allArgs,
      {} as any,
      []
    )

    console.log(findCurrentArgument(
      commands,
      ['FT.AGGREGATE', '""', '""']
    ))

    expect(testResult).toEqual(result)
  })
})

const isIndexCompleteTests: Array<[string, boolean]> = [
  ['', false],
  ['"', false],
  ['\"\\"', false],
  ['""', true],
  ["'", false],
  ["''", true],
  ["'index\\'", false],
  ["'index'", true],
  ['"index \\\\"', true],
  ['index', true],
]

describe('isIndexComplete', () => {
  it.each(isIndexCompleteTests)('should properly return value for %s', (index, result) => {
    const testResult = isIndexComplete(index)

    expect(testResult).toEqual(result)
  })
})
