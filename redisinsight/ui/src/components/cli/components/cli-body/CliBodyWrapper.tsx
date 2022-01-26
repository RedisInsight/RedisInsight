import { decode } from 'html-entities'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHotkeys } from 'react-hotkeys-hook'
import { useParams } from 'react-router-dom'

import {
  cliSettingsSelector,
  createCliClientAction,
  setCliEnteringCommand,
  clearSearchingCommand,
} from 'uiSrc/slices/cli/cli-settings'
import {
  concatToOutput,
  outputSelector,
  sendCliCommandAction,
  sendCliClusterCommandAction,
  processUnsupportedCommand,
  processUnrepeatableNumber,
  processMonitorCommand,
} from 'uiSrc/slices/cli/cli-output'
import { CommandMonitor } from 'uiSrc/constants'
import { getCommandRepeat, isRepeatCountCorrect } from 'uiSrc/utils'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { ClusterNodeRole } from 'uiSrc/slices/interfaces/cli'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { checkUnsupportedCommand, clearOutput, cliCommandOutput } from 'uiSrc/utils/cliHelper'
import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'

import CliBody from './CliBody'

import styles from './CliBody/styles.module.scss'

const CliBodyWrapper = () => {
  const [command, setCommand] = useState('')

  const dispatch = useDispatch()
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { data = [] } = useSelector(outputSelector)
  const {
    errorClient: error,
    unsupportedCommands,
    isEnteringCommand,
    isSearching,
    matchedCommand,
    cliClientUuid,
  } = useSelector(cliSettingsSelector)
  const { host, port, connectionType } = useSelector(connectedInstanceSelector)
  const { db: currentDbIndex } = useSelector(outputSelector)

  useEffect(() => {
    !cliClientUuid && dispatch(createCliClientAction())
  }, [])

  useEffect(() => {
    if (!isEnteringCommand) {
      dispatch(setCliEnteringCommand())
    }
    if (isSearching && matchedCommand) {
      dispatch(clearSearchingCommand())
    }
  }, [command])

  const handleClearOutput = () => {
    clearOutput(dispatch)
  }

  const refHotkeys = useHotkeys<HTMLDivElement>('command+k,ctrl+l', handleClearOutput)

  const handleSubmit = () => {
    const [commandLine, countRepeat] = getCommandRepeat(decode(command).trim())
    const unsupportedCommand = checkUnsupportedCommand(unsupportedCommands, commandLine)
    dispatch(concatToOutput(cliCommandOutput(command, currentDbIndex)))

    if (!isRepeatCountCorrect(countRepeat)) {
      dispatch(processUnrepeatableNumber(commandLine, resetCommand))
      return
    }

    // Flow if monitor command was executed
    if (checkUnsupportedCommand([CommandMonitor.toLowerCase()], commandLine)) {
      dispatch(processMonitorCommand(commandLine, resetCommand))
      return
    }

    if (unsupportedCommand) {
      dispatch(processUnsupportedCommand(commandLine, unsupportedCommand, resetCommand))
      return
    }

    for (let i = 0; i < countRepeat; i++) {
      sendCommand(commandLine)
    }
  }

  const sendCommand = (command: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_COMMAND_SUBMITTED,
      eventData: {
        databaseId: instanceId
      }
    })
    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendCliCommandAction(command, resetCommand))
      return
    }

    const options: SendClusterCommandDto = {
      command,
      nodeOptions: {
        host,
        port,
        enableRedirection: true,
      },
      role: ClusterNodeRole.All,
    }
    dispatch(sendCliClusterCommandAction(command, options, resetCommand))
  }

  const resetCommand = () => {
    setCommand('')
  }

  return (
    <section ref={refHotkeys} className={styles.section}>
      <CliBody
        data={data}
        command={command}
        error={error}
        setCommand={setCommand}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

export default CliBodyWrapper
