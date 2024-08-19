import { getRediSearchSignutureProvider } from 'uiSrc/pages/search/utils'
import { MOCKED_SUPPORTED_COMMANDS } from 'uiSrc/pages/search/utils/tests/mocks'
import { SearchCommand } from 'uiSrc/pages/search/types'

const ftAggregateCommand = MOCKED_SUPPORTED_COMMANDS['FT.AGGREGATE']

const getRediSearchSignutureProviderTests = [
  {
    input: {
      isOpen: false,
      currentArg: {},
      parent: {}
    },
    result: null
  },
  {
    input: {
      isOpen: true,
      currentArg: ftAggregateCommand.arguments.find(({ name }) => name === 'groupby') as SearchCommand,
      parent: null
    },
    result: {
      dispose: expect.any(Function),
      value: {
        activeParameter: 0,
        activeSignature: 0,
        signatures: [{
          label: '',
          parameters: [{ label: 'nargs' }]
        }]
      }
    }
  },
  {
    input: {
      isOpen: true,
      currentArg: { name: 'expression' },
      parent: ftAggregateCommand.arguments.find(({ name }) => name === 'apply') as SearchCommand
    },
    result: {
      dispose: expect.any(Function),
      value: {
        activeParameter: 0,
        activeSignature: 0,
        signatures: [{
          label: 'APPLY expression AS name',
          parameters: [{ label: 'expression' }]
        }]
      }
    }
  }
]

describe('getRediSearchSignutureProvider', () => {
  it.each(getRediSearchSignutureProviderTests)('should properly return result', ({ input, result }) => {
    const testResult = getRediSearchSignutureProvider(input)

    expect(result).toEqual(testResult)
  })
})
