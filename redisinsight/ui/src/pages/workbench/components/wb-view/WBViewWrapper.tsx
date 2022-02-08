import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { decode } from 'html-entities'
import { useParams } from 'react-router-dom'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import {
  Nullable,
  removeMonacoComments,
  splitMonacoValuePerLines,
  getMultiCommands,
} from 'uiSrc/utils'
import {
  sendWBCommandAction,
  workbenchResultsSelector,
  fetchWBHistoryAction,
  deleteWBCommandAction,
  sendWBCommandClusterAction,
  resetWBHistoryItems,
  fetchWBCommandAction,
} from 'uiSrc/slices/workbench/wb-results'
import { ConnectionType, Instance, IPluginVisualization } from 'uiSrc/slices/interfaces'
import { initialState as instanceInitState, connectedInstanceSelector } from 'uiSrc/slices/instances'
import { ClusterNodeRole } from 'uiSrc/slices/interfaces/cli'

import { cliSettingsSelector, fetchBlockingCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { appContextWorkbench, setWorkbenchScript } from 'uiSrc/slices/app/context'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'

import WBView from './WBView'

interface IState {
  loading: boolean,
  instance: Instance,
  unsupportedCommands: string[],
  blockingCommands: string[],
  visualizations: IPluginVisualization[],
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>,
}

let state: IState = {
  loading: false,
  instance: instanceInitState.connectedInstance,
  unsupportedCommands: [],
  blockingCommands: [],
  visualizations: [],
  scriptEl: null,
}

const WBViewWrapper = () => {
  const { instanceId } = useParams<{ instanceId: string }>()

  const { loading, items } = useSelector(workbenchResultsSelector)
  const { unsupportedCommands, blockingCommands } = useSelector(cliSettingsSelector)
  const { script: scriptContext } = useSelector(appContextWorkbench)

  const [script, setScript] = useState(scriptContext)
  const [multiCommands, setMultiCommands] = useState('')
  const [scriptEl, setScriptEl] = useState<Nullable<monacoEditor.editor.IStandaloneCodeEditor>>(null)

  const instance = useSelector(connectedInstanceSelector)
  const { visualizations = [] } = useSelector(appPluginsSelector)
  state = {
    scriptEl,
    loading,
    instance,
    blockingCommands,
    unsupportedCommands,
    visualizations,
  }
  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const scriptRef = useRef(script)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchWBHistoryAction(instanceId))

    return () => {
      dispatch(resetWBHistoryItems())
      dispatch(setWorkbenchScript(scriptRef.current))
    }
  }, [])

  useEffect(() => {
    scriptRef.current = script
  }, [script])

  useEffect(() => {
    if (!blockingCommands.length) {
      dispatch(fetchBlockingCliCommandsAction())
    }
  }, [blockingCommands])

  useEffect(() => {
    if (multiCommands) {
      handleSubmit(multiCommands)
    }
  }, [multiCommands])

  const handleSubmit = (
    commandInit: string = script,
    commandId?: string,
  ) => {
    const { loading } = state
    const isNewCommand = () => !commandId
    const [command, ...rest] = splitMonacoValuePerLines(commandInit)

    const multiCommands = getMultiCommands(rest)

    let commandLine = decode(command).trim()

    // remove comments
    commandLine = removeMonacoComments(commandLine)

    if (!commandLine || loading) {
      setMultiCommands(multiCommands)
      return
    }

    isNewCommand() && scrollResults('start')

    sendCommand(commandLine, multiCommands)
  }

  const sendCommand = (
    command: string,
    multiCommands = ''
  ) => {
    const { connectionType, host, port } = state.instance
    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendWBCommandAction({
        command,
        multiCommands,
        onSuccessAction: onSuccess,
      }))
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
    dispatch(
      sendWBCommandClusterAction({
        command,
        options,
        multiCommands,
        onSuccessAction: onSuccess,
      })
    )
  }

  const onSuccess = (multiCommands = '') => {
    resetCommand()
    setMultiCommands(multiCommands)
  }

  const scrollResults = (inline: ScrollLogicalPosition = 'start') => {
    scrollDivRef?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline,
    })
  }

  const handleQueryDelete = (commandId: string) => {
    dispatch(deleteWBCommandAction(commandId, onSuccess))
  }

  const handleQueryOpen = (commandId: string = '') => {
    dispatch(fetchWBCommandAction(commandId))
  }

  const resetCommand = () => {
    state?.scriptEl?.getAction('editor.action.insertLineAfter')?.run() // HACK: to reset completion snippets
    setScript('')
  }

  return (
    <WBView
      items={items}
      script={script}
      loading={loading}
      setScript={setScript}
      setScriptEl={setScriptEl}
      scriptEl={scriptEl}
      scrollDivRef={scrollDivRef}
      onSubmit={handleSubmit}
      onQueryOpen={handleQueryOpen}
      onQueryDelete={handleQueryDelete}
    />
  )
}

export default WBViewWrapper
