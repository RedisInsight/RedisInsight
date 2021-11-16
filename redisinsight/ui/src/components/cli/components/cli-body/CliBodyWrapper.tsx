import { EuiTextColor } from '@elastic/eui'
import { isEmpty } from 'lodash'
import { decode } from 'html-entities'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHotkeys } from 'react-hotkeys-hook'
import { useParams } from 'react-router-dom'

import {
  cliSettingsSelector,
  createCliClientAction,
  updateCliClientAction,
  setCliEnteringCommand,
  clearSearchingCommand,
} from 'uiSrc/slices/cli/cli-settings'
import {
  concatToOutput,
  outputSelector,
  sendCliCommandAction,
  sendCliClusterCommandAction,
  processUnsupportedCommand,
} from 'uiSrc/slices/cli/cli-output'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BrowserStorageItem } from 'uiSrc/constants'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { sessionStorageService } from 'uiSrc/services'
import { ClusterNodeRole } from 'uiSrc/slices/interfaces/cli'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { checkUnsupportedCommand, clearOutput } from 'uiSrc/utils/cli'
import { InitOutputText, ConnectionSuccessOutputText } from 'uiSrc/constants/cliOutput'
import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'

import CliBody from './CliBody'
import styles from './CliBody/styles.module.scss'
import CliHelperWrapper from '../cli-helper'

const CliBodyWrapper = () => {
  const cliClientUuid = sessionStorageService.get(BrowserStorageItem.cliClientUuid) ?? ''

  const [command, setCommand] = useState('')

  const dispatch = useDispatch()
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { data = [] } = useSelector(outputSelector)
  const {
    errorClient: error,
    unsupportedCommands,
    isShowHelper,
    isEnteringCommand,
    isSearching,
    matchedCommand
  } = useSelector(cliSettingsSelector)
  const { host, port, connectionType } = useSelector(connectedInstanceSelector)

  useEffect(() => {
    if (isEmpty(data) || error) {
      dispatch(concatToOutput(InitOutputText(host, port)))
    }

    if (cliClientUuid) {
      dispatch(updateCliClientAction(cliClientUuid, onSuccess, onFail))
      return
    }

    dispatch(createCliClientAction(onSuccess, onFail))
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

  const onSuccess = () => {
    if (isEmpty(data) || error) {
      dispatch(concatToOutput(ConnectionSuccessOutputText))
    }
  }

  const onFail = (message: string) => {
    dispatch(
      concatToOutput([
        '\n',
        <EuiTextColor color="warning" key={Date.now()}>
          {message}
        </EuiTextColor>,
        '\n\n',
      ])
    )
  }

  const handleSubmit = () => {
    const commandLine = decode(command).trim()
    const unsupportedCommand = checkUnsupportedCommand(unsupportedCommands, commandLine)

    if (unsupportedCommand) {
      dispatch(processUnsupportedCommand(commandLine, unsupportedCommand, resetCommand))
      return
    }

    sendCommand(commandLine)
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
      {isShowHelper && <CliHelperWrapper />}
    </section>
  )
}

export default CliBodyWrapper
