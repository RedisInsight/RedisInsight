import {
  getDbIndexFromSelectQuery,
  getCommandNameFromQuery,
  cliParseCommandsGroupResult,
} from 'uiSrc/utils'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { render } from 'uiSrc/utils/test-utils'

const getDbIndexFromSelectQueryTests = [
  { input: 'select 0', expected: 0 },
  { input: 'select 1', expected: 1 },
  { input: 'SELECT 10', expected: 10 },
  { input: 'SeLeCt 10', expected: 10 },
  { input: 'select "1"', expected: 1 },
  { input: '   select "1"   ', expected: 1 },
  { input: 'select \'1\'', expected: 1 },
  { input: 'select \'1\'', expected: 1 },
  { input: 'info', expected: new Error('Invalid command') },
  { input: 'select "1 1231"', expected: new Error('Parsing error') },
  { input: 'select abc', expected: new Error('Parsing error') },
]

describe('getDbIndexFromSelectQuery', () => {
  test.each(getDbIndexFromSelectQueryTests)('%j', ({ input, expected }) => {
    if (expected instanceof Error) {
      try {
        getDbIndexFromSelectQuery(input)
      } catch (e) {
        expect(e.message).toEqual(expected.message)
      }
    } else {
      expect(getDbIndexFromSelectQuery(input)).toEqual(expected)
    }
  })
})

const getCommandNameFromQueryTests = [
  { input: ['set foo bar', MOCK_COMMANDS_SPEC], expected: 'set' },
  { input: ['  SET       foo bar', MOCK_COMMANDS_SPEC], expected: 'SET' },
  { input: ['client kill 1', MOCK_COMMANDS_SPEC], expected: 'client kill' },
  { input: ['client kill 1', {}], expected: 'client' },
  { input: ['custom.command foo bar', MOCK_COMMANDS_SPEC], expected: 'custom.command' },
  { input: ['FT._LIST', MOCK_COMMANDS_SPEC], expected: 'FT._LIST' },
  { input: [`${' '.repeat(20)} CLIENT ${' '.repeat(100)} KILL`, MOCK_COMMANDS_SPEC], expected: 'CLIENT' },
  {
    input: [`${' '.repeat(20)} CLIENT ${' '.repeat(100)} KILL`, MOCK_COMMANDS_SPEC, 500],
    expected: 'CLIENT KILL'
  },
]

describe('getCommandNameFromQuery', () => {
  test.each(getCommandNameFromQueryTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    expect(getCommandNameFromQuery(...input)).toEqual(expected)
  })
})

describe('cliParseCommandsGroupResult', () => {
  const mockResult = {
    command: 'command',
    response: 'response',
    status: 'success'
  }
  const mockIndex = 0
  const { queryByTestId, getByText } = render(cliParseCommandsGroupResult(mockResult, mockIndex))
  const cliCommandEl = queryByTestId('wb-command')
  const cliCommandResultEl = queryByTestId('wb-command-result')
  const cliCommandTextEl = getByText('> command')
  const cliCommandResultTextEl = getByText('response')

  expect(cliCommandEl).toBeInTheDocument()
  expect(cliCommandResultEl).toBeInTheDocument()
  expect(cliCommandTextEl).toBeInTheDocument()
  expect(cliCommandResultTextEl).toBeInTheDocument()
})

// describe('wbSummaryCommand', () => {
//   const mockResult = {
//     command: 'command',
//     response: 'response',
//     status: 'success'
//   }
//   const mockIndex = 0
//   const { queryByTestId } = render(cliParseCommandsGroupResult(mockResult, mockIndex))
//   const cliCommandEl = queryByTestId('wb-command')

//   expect(cliCommandEl).toBeInTheDocument()
// })

// describe('wbSummaryCommandResult', () => {
//   const mockResult = 'result'
//   const { queryByTestId } = render(cliParseCommandsGroupResult(mockResult, mockIndex))
//   const cliCommandEl = queryByTestId('wb-command')

//   expect(cliCommandEl).toBeInTheDocument()
// })
