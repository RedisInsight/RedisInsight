import { EuiTextColor } from '@elastic/eui'
import React from 'react'

export const ClearCommand = 'clear'
export const SelectCommand = 'select'

export enum CliOutputFormatterType {
  Text = 'TEXT',
  Raw = 'RAW',
}

export const InitOutputText = (host: string = '', port: number = 0, dbIndex: number = 0) => [
  'Connecting...',
  '\n\n',
  'Pinging Redis server on ',
  <EuiTextColor color="default" key={Math.random()}>
    {`${host}:${port}`}
    {dbIndex > 0 && `[${dbIndex}]`}
  </EuiTextColor>,
]

export const ConnectionSuccessOutputText = [
  '\n',
  'Connected.',
  '\n',
  'Ready to execute commands.',
  '\n\n',
]

const unsupportedCommandTextCli = ' is not supported by the RedisInsight CLI. The list of all unsupported commands: '
const unsupportedCommandTextWorkbench = ' is not supported by the Workbench. The list of all unsupported commands: '
export const cliTexts = {
  CLI_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextCli + commands,
  WORKBENCH_UNSUPPORTED_COMMANDS: (commandLine: string, commands: string) =>
    commandLine + unsupportedCommandTextWorkbench + commands,
  REPEAT_COUNT_INVALID: 'Invalid repeat command option value',
  CONNECTION_CLOSED: 'Client connection previously closed. Run the command after the connection is re-created.',
  UNABLE_TO_DECRYPT: 'Unable to decrypt. Check the system keychain or re-run the command.',
  CLI_ERROR_MESSAGE: (message: string) => (
    [
      '\n',
      <EuiTextColor color="warning" key={Date.now()}>
        {message}
      </EuiTextColor>,
      '\n\n',
    ]
  )
}
