import { getGeneralSuggestions } from 'uiSrc/pages/search/components/query/utils'
import { MOCKED_SUPPORTED_COMMANDS } from 'uiSrc/pages/search/mocks/mocks'

const ftAggregate = MOCKED_SUPPORTED_COMMANDS['FT.SEARCH']

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
      suggestions: expect.any(Array)
    }
  }
]

describe('getGeneralSuggestions', () => {
  it.each(getGeneralSuggestionsTests)('dawd', ({ input, result }) => {
    const testResult = getGeneralSuggestions(input.commandContext, input.cursorContext, [])

    expect(testResult).toEqual(result)
  })
})
