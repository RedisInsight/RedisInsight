import {
  getDbIndexFromSelectQuery,
  getCommandNameFromQuery,
  cliParseCommandsGroupResult,
  CliPrefix,
  wbSummaryCommand
} from 'uiSrc/utils'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { render, screen } from 'uiSrc/utils/test-utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'

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

describe('cliParseCommandsGroupResult success status', () => {
  const mockResult = {
    command: 'command',
    response: 'response',
    status: CommandExecutionStatus.Success
  }
  const parsedResult = cliParseCommandsGroupResult(mockResult)
  render(parsedResult)

  expect(screen.queryByTestId('wb-command')).toBeInTheDocument()
  expect(screen.getByText('> command')).toBeInTheDocument()
  expect(screen.queryByTestId(`${CliPrefix.Cli}-output-response-fail`)).not.toBeInTheDocument()
  expect(parsedResult[1]).toEqual('"response"')
})

describe('cliParseCommandsGroupResult error status', () => {
  const mockResult = {
    command: 'command',
    response: 'response',
    status: CommandExecutionStatus.Fail
  }
  render(cliParseCommandsGroupResult(mockResult))

  expect(screen.queryByTestId(`${CliPrefix.Cli}-output-response-fail`)).toBeInTheDocument()
})

const wbSummaryCommandTests: any[] = [
  ['SET', 0, '> SET'],
  ['iueigc h pb32 ueo', 0, '> iueigc h pb32 ueo'],
  ['SET', 1, '[db1] > SET'],
  ['INFO', 10, '[db10] > INFO'],
  ['aoeuaoeu', 10, '[db10] > aoeuaoeu'],
]

describe('wbSummaryCommand', () => {
  it.each(wbSummaryCommandTests)('for input: %s (command), should be output: %s',
    (command, db, expected) => {
      const { container } = render(wbSummaryCommand(command, db))
      expect(container).toHaveTextContent(expected)
    })
})
