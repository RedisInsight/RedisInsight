import { getGeneralSuggestions, isIndexComplete } from 'uiSrc/pages/search/components/query/utils'
import { MOCKED_SUPPORTED_COMMANDS } from 'uiSrc/pages/search/mocks/mocks'
import { buildSuggestion } from 'uiSrc/pages/search/utils'
import { SearchCommand } from 'uiSrc/pages/search/types'

const ftAggregate = MOCKED_SUPPORTED_COMMANDS['FT.AGGREGATE']
const ftProfile = MOCKED_SUPPORTED_COMMANDS['FT.PROFILE']

const getCursorContext = () => ({
  currentOffsetArg: undefined,
  isCursorInQuotes: false,
  nextCursorChar: undefined,
  prevCursorChar: ' ',
  range: {}
})

const getGeneralSuggestionsTests = [
  {
    input: {
      commandContext: {
        allArgs: ['FT.AGGREGATE', '""', '""'],
        command: ftAggregate,
        commandName: 'FT.AGGREGATE',
        currentCommandArg: null,
        prevArgs: ['""', '""']
      },
      cursorContext: getCursorContext()
    },
    result: {
      helpWidgetData: expect.any(Object),
      suggestions: ftAggregate.arguments
        .slice(2)
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
      commandContext: {
        allArgs: ['FT.AGGREGATE', '""', '""', 'APPLY', 'expression'],
        command: ftAggregate,
        commandName: 'FT.AGGREGATE',
        currentCommandArg: null,
        prevArgs: ['""', '""', 'APPLY', 'expression']
      },
      cursorContext: getCursorContext()
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
      commandContext: {
        allArgs: ['FT.PROFILE', '""'],
        command: ftProfile,
        commandName: 'FT.PROFILE',
        currentCommandArg: null,
        prevArgs: ['""']
      },
      cursorContext: getCursorContext()
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
          detail: '',
        },
        {
          label: 'AGGREGATE',
          insertText: 'AGGREGATE ',
          insertTextRules: 4,
          range: expect.any(Object),
          kind: undefined,
          detail: '',
        }
      ]
    }
  }
]

describe('getGeneralSuggestions', () => {
  it.each(getGeneralSuggestionsTests)('should properly return suggestions', ({ input, result }) => {
    const testResult = getGeneralSuggestions(input.commandContext, input.cursorContext, [])

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
