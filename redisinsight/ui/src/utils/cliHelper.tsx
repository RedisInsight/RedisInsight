import React from 'react'
import { Dispatch, PayloadAction } from '@reduxjs/toolkit'

import { localStorageService } from 'uiSrc/services'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { resetOutput, updateCliCommandHistory } from 'uiSrc/slices/cli/cli-output'
import { BrowserStorageItem } from 'uiSrc/constants'
import { ModuleCommandPrefix } from 'uiSrc/pages/workbench/constants'
import { ClusterNode, RedisDefaultModules } from 'uiSrc/slices/interfaces'

import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import { Nullable } from './types'
import formatToText from './cliTextFormatter'

export enum CliPrefix {
  Cli = 'cli',
  QueryCard = 'query-card',
}

const cliParseTextResponseWithRedirect = (
  text: string = '',
  command: string = '',
  status: CommandExecutionStatus = CommandExecutionStatus.Success,
  redirectTo: ClusterNode | undefined,
) => {
  let redirectMessage = ''
  if (redirectTo) {
    const { host, port, slot } = redirectTo
    redirectMessage = `-> Redirected to slot [${slot}] located at ${host}:${port}`
  }
  return [redirectMessage, '\n', cliParseTextResponse(text, command, status), '\n']
}

const cliParseTextResponseWithOffset = (
  text: string = '',
  command: string = '',
  status: CommandExecutionStatus = CommandExecutionStatus.Success,
) => [cliParseTextResponse(text, command, status), '\n']

const cliParseTextResponse = (
  text: string = '',
  command: string = '',
  status: CommandExecutionStatus = CommandExecutionStatus.Success,
  prefix: CliPrefix = CliPrefix.Cli
) => (
  <span
    key={Math.random()}
    className={
      status === CommandExecutionStatus.Success
        ? `${prefix}-output-response-success`
        : `${prefix}-output-response-fail`
    }
    data-testid={
      status === CommandExecutionStatus.Success
        ? `${prefix}-output-response-success`
        : `${prefix}-output-response-fail`
    }
  >
    {formatToText(text, command)}
  </span>
)

const cliCommandOutput = (command: string) => ['\n', bashTextValue(), cliCommandWrapper(command), '\n']

const bashTextValue = () => '> '

const cliCommandWrapper = (command: string) => (
  <span className="cli-command-wrapper" data-testid="cli-command-wrapper" key={Math.random()}>
    {command}
  </span>
)

const clearOutput = (dispatch: any) => {
  dispatch(resetOutput())
}

const updateCliHistoryStorage = (
  command: string = '',
  dispatch: Dispatch<PayloadAction<string[]>>
) => {
  if (!command) {
    return
  }
  const maxCountCommandHistory = 20

  const commandHistoryPrev = localStorageService.get(BrowserStorageItem.cliInputHistory) ?? []

  const commandHistory = [command?.trim()]
    .concat(commandHistoryPrev)
    .slice(0, maxCountCommandHistory)

  localStorageService.set(
    BrowserStorageItem.cliInputHistory,
    commandHistory.slice(0, maxCountCommandHistory)
  )

  dispatch?.(updateCliCommandHistory?.(commandHistory))
}

const checkUnsupportedCommand = (unsupportedCommands: string[], commandLine: string) =>
  unsupportedCommands?.find((command) =>
    commandLine?.trim().toLowerCase().startsWith(command))

const checkBlockingCommand = (blockingCommands: string[], commandLine: string) =>
  blockingCommands?.find((command) => commandLine?.trim().toLowerCase().startsWith(command))

const checkUnsupportedModuleCommand = (loadedModules: RedisModuleDto[], commandLine: string) => {
  const command = commandLine?.trim().toUpperCase()
  let commandModule: Nullable<RedisDefaultModules> = null

  if (command.startsWith(ModuleCommandPrefix.RediSearch)) {
    commandModule = RedisDefaultModules.Search
  }

  const isModuleLoaded = loadedModules?.some(({ name }) => name === commandModule)

  if (isModuleLoaded) {
    return null
  }

  return commandModule
}

const getDbIndexFromSelectQuery = (query: string): number => {
  const [command, ...args] = query.trim().split(' ')
  if (command.toLowerCase() !== 'select') {
    throw new Error('Invalid command')
  }
  try {
    return parseInt(args[0].replace(/['"]/g, '').trim())
  } catch (e) {
    throw Error('Parsing error')
  }
}

export {
  cliParseTextResponse,
  cliParseTextResponseWithOffset,
  cliParseTextResponseWithRedirect,
  cliCommandOutput,
  bashTextValue,
  cliCommandWrapper,
  clearOutput,
  updateCliHistoryStorage,
  checkUnsupportedCommand,
  checkBlockingCommand,
  checkUnsupportedModuleCommand,
  getDbIndexFromSelectQuery,
}
