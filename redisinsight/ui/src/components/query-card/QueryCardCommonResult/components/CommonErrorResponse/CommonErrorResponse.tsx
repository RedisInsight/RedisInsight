import React from 'react'
import { useSelector } from 'react-redux'
import {
  checkUnsupportedCommand,
  checkUnsupportedModuleCommand,
  cliParseTextResponse,
  getCommandRepeat,
  isRepeatCountCorrect
} from 'uiSrc/utils'
import { cliTexts, SelectCommand } from 'uiSrc/constants/cliOutput'
import { RootState } from 'uiSrc/slices/store'
import { CommandMonitor } from 'uiSrc/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { RSNotLoadedContent } from 'uiSrc/pages/workbench/constants'

import { cliSettingsSelector, cliUnsupportedCommandsSelector } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import ModuleNotLoaded from 'uiSrc/pages/workbench/components/module-not-loaded'

const CommonErrorResponse = (command = '') => {
  const { unsupportedCommands: cliUnsupportedCommands, blockingCommands } = useSelector(cliSettingsSelector)
  const { modules } = useSelector(connectedInstanceSelector)
  const unsupportedCommands = [SelectCommand.toLowerCase(), ...cliUnsupportedCommands, ...blockingCommands]
  const [commandLine, countRepeat] = getCommandRepeat(command)

  // Flow if monitor command was executed
  if (checkUnsupportedCommand([CommandMonitor.toLowerCase()], commandLine)) {
    return cliParseTextResponse(
      cliTexts.MONITOR_COMMAND,
      commandLine,
      CommandExecutionStatus.Fail,
    )
  }

  const unsupportedCommand = checkUnsupportedCommand(unsupportedCommands, commandLine)

  if (!isRepeatCountCorrect(countRepeat)) {
    return cliParseTextResponse(
      cliTexts.REPEAT_COUNT_INVALID,
      commandLine,
      CommandExecutionStatus.Fail,
    )
  }

  if (unsupportedCommand) {
    return cliParseTextResponse(
      cliTexts.WORKBENCH_UNSUPPORTED_COMMANDS(
        commandLine.slice(0, unsupportedCommand.length),
        [...blockingCommands, ...unsupportedCommands].join(', '),
      ),
      commandLine,
      CommandExecutionStatus.Fail,
    )
  }
  const unsupportedModule = checkUnsupportedModuleCommand(modules, commandLine)

  if (unsupportedModule === RedisDefaultModules.Search) {
    return <ModuleNotLoaded content={RSNotLoadedContent} />
  }

  return null
}

export default CommonErrorResponse
