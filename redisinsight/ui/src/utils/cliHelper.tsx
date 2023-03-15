import React, { Fragment } from 'react'
import { Dispatch, PayloadAction } from '@reduxjs/toolkit'
import parse from 'html-react-parser'

import { localStorageService } from 'uiSrc/services'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { resetOutput, updateCliCommandHistory } from 'uiSrc/slices/cli/cli-output'
import { BrowserStorageItem, ICommands } from 'uiSrc/constants'
import { ModuleCommandPrefix } from 'uiSrc/pages/workbench/constants'
import { SelectCommand } from 'uiSrc/constants/cliOutput'
import { ClusterNode, RedisDefaultModules, REDISEARCH_MODULES } from 'uiSrc/slices/interfaces'

import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { Nullable } from './types'
import formatToText from './transformers/cliTextFormatter'
import { getDbIndex } from './longNames'

export enum CliPrefix {
  Cli = 'cli',
  QueryCard = 'query-card',
}

interface IGroupModeCommand {
  command: string
  response: string
  status: CommandExecutionStatus
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
  text: string | JSX.Element = '',
  command: string = '',
  status: CommandExecutionStatus = CommandExecutionStatus.Success,
  prefix: CliPrefix = CliPrefix.Cli,
  isParse: boolean = false
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
    {isParse ? parse(formatToText(text, command)) : formatToText(text, command)}
  </span>
)

const cliCommandOutput = (command: string, dbIndex = 0) => ['\n', bashTextValue(dbIndex), cliCommandWrapper(command), '\n']

const bashTextValue = (dbIndex = 0) => `${getDbIndex(dbIndex)} > `.trimStart()

const cliCommandWrapper = (command: string) => (
  <span className="cli-command-wrapper" data-testid="cli-command-wrapper" key={Math.random()}>
    {command}
  </span>
)

const wbSummaryCommand = (command: string, db?: number) => (
  <span
    className="cli-command-wrapper"
    data-testid="wb-command"
  >
    {`${getDbIndex(db)} > ${command} \n`}
  </span>
)

const clearOutput = (dispatch: any) => {
  dispatch(resetOutput())
}

const cliParseCommandsGroupResult = (
  result: IGroupModeCommand,
  db?: number,
) => {
  const executionCommand = wbSummaryCommand(result.command, db)

  let executionResult = []
  if (result.status === CommandExecutionStatus.Success) {
    executionResult = formatToText(result.response || '(nil)', result.command).split('\n')
  } else {
    executionResult = [cliParseTextResponse(result.response || '(nil)', result.command, result.status)]
  }

  return [executionCommand, ...executionResult]
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
    commandLine?.trim().toLowerCase().startsWith(command?.toLowerCase()))

const checkBlockingCommand = (blockingCommands: string[], commandLine: string) =>
  blockingCommands?.find((command) => commandLine?.trim().toLowerCase().startsWith(command))

const checkUnsupportedModuleCommand = (loadedModules: AdditionalRedisModule[], commandLine: string) => {
  const command = commandLine?.trim().toUpperCase()
  let commandModule: Nullable<RedisDefaultModules> = null

  if (command.startsWith(ModuleCommandPrefix.RediSearch)) {
    commandModule = RedisDefaultModules.Search
  }

  const isModuleLoaded = loadedModules?.some(({ name }) => name === commandModule)
    // Redisearch has 4 names, need check all
    || loadedModules?.some(({ name }) =>
      REDISEARCH_MODULES.some((search) => name === search))

  if (isModuleLoaded) {
    return null
  }

  return commandModule
}

const getDbIndexFromSelectQuery = (query: string): number => {
  const [command, ...args] = query.trim().split(' ')
  if (command.toLowerCase() !== SelectCommand.toLowerCase()) {
    throw new Error('Invalid command')
  }
  try {
    return parseInt(args[0].replace(/['"]/g, '').trim())
  } catch (e) {
    throw Error('Parsing error')
  }
}

const getCommandNameFromQuery = (
  query: string,
  commandsSpec: ICommands = {},
  queryLimit: number = 50
): string | undefined => {
  try {
    const [command, firstArg] = query.slice(0, queryLimit).trim().split(/\s+/)
    if (commandsSpec[`${command} ${firstArg}`.toUpperCase()]) return `${command} ${firstArg}`
    return command
  } catch (error) {
    return undefined
  }
}

export {
  cliParseTextResponse,
  cliParseTextResponseWithOffset,
  cliParseTextResponseWithRedirect,
  cliParseCommandsGroupResult,
  cliCommandOutput,
  bashTextValue,
  cliCommandWrapper,
  clearOutput,
  updateCliHistoryStorage,
  checkUnsupportedCommand,
  checkBlockingCommand,
  checkUnsupportedModuleCommand,
  getDbIndexFromSelectQuery,
  getCommandNameFromQuery,
  wbSummaryCommand,
}
