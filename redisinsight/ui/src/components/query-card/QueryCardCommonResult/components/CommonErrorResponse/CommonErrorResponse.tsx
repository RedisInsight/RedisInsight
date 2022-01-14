import React from 'react'
import { useSelector } from 'react-redux'
import {
  checkBlockingCommand,
  checkUnsupportedCommand,
  checkUnsupportedModuleCommand,
  cliParseTextResponse,
  getCommandRepeat,
  isRepeatCountCorrect
} from 'uiSrc/utils'
import { cliTexts } from 'uiSrc/constants/cliOutput'
import { RootState } from 'uiSrc/slices/store'
import { CommandMonitor } from 'uiSrc/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { RSNotLoadedContent } from 'uiSrc/pages/workbench/constants'

import { cliSettingsSelector, cliUnsupportedCommandsSelector } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import ModuleNotLoaded from 'uiSrc/pages/workbench/components/module-not-loaded'

const CommonErrorResponse = (command = '') => {
  const { blockingCommands } = useSelector(cliSettingsSelector)
  // Due to requirements, the monitor command should not appear in the list of supported commands
  // That is why we exclude it here
  const unsupportedCommands = useSelector(
    (state) => cliUnsupportedCommandsSelector(state as RootState, [CommandMonitor.toLowerCase()])
  )
  const { modules } = useSelector(connectedInstanceSelector)
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
    || checkBlockingCommand(blockingCommands, commandLine)

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
