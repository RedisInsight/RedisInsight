import { EuiTextColor } from '@elastic/eui'
import React from 'react'

export const ClearCommand = 'clear'

export enum CliOutputFormatterType {
  Text = 'TEXT',
  Raw = 'RAW',
}

export const InitOutputText = (host: string = '', port: number = 0) => [
  'Connecting...',
  '\n\n',
  'Pinging Redis server on ',
  <EuiTextColor color="default" key={Math.random()}>
    {`${host}:${port}`}
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
  REPEAT_COUNT_INVALID: 'Invalid repeat command option value'
}
