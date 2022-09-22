import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { decode } from 'html-entities'
import { useParams } from 'react-router-dom'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { chunk, without } from 'lodash'

import {
  Nullable,
  removeMonacoComments,
  splitMonacoValuePerLines,
  getMultiCommands,
  scrollIntoView,
} from 'uiSrc/utils'
import { localStorageService } from 'uiSrc/services'
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
import { initialState as instanceInitState, connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ClusterNodeRole } from 'uiSrc/slices/interfaces/cli'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { cliSettingsSelector, fetchBlockingCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { appContextWorkbench, setWorkbenchScript } from 'uiSrc/slices/app/context'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { userSettingsConfigSelector, userSettingsWBSelector } from 'uiSrc/slices/user/user-settings'
import { BrowserStorageItem } from 'uiSrc/constants'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'
import WBView from './WBView'

interface IState {
  loading: boolean
  instance: Instance
  batchSize: number
  activeRunQueryMode: RunQueryMode
  unsupportedCommands: string[]
  blockingCommands: string[]
  visualizations: IPluginVisualization[]
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
  resultsMode: ResultsMode
}

let state: IState = {
  loading: false,
  batchSize: PIPELINE_COUNT_DEFAULT,
  activeRunQueryMode: RunQueryMode.ASCII,
  instance: instanceInitState.connectedInstance,
  unsupportedCommands: [],
  blockingCommands: [],
  visualizations: [],
  scriptEl: null,
  resultsMode: ResultsMode.Default,
}

const WBViewWrapper = () => {
  const { instanceId } = useParams<{ instanceId: string }>()

  const { loading, items } = useSelector(workbenchResultsSelector)
  const { unsupportedCommands, blockingCommands } = useSelector(cliSettingsSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}
  const { cleanup: cleanupWB } = useSelector(userSettingsWBSelector)
  const { script: scriptContext } = useSelector(appContextWorkbench)

  const [script, setScript] = useState(scriptContext)
  const [multiCommands, setMultiCommands] = useState<string[]>([])
  const [scriptEl, setScriptEl] = useState<Nullable<monacoEditor.editor.IStandaloneCodeEditor>>(null)
  const [activeRunQueryMode, setActiveRunQueryMode] = useState<RunQueryMode>(
    (localStorageService?.get(BrowserStorageItem.RunQueryMode) ?? RunQueryMode.ASCII)
  )
  const [resultsMode, setResultsMode] = useState<ResultsMode>(
    (localStorageService?.get(BrowserStorageItem.wbGroupMode) ?? ResultsMode.Default)
  )

  const instance = useSelector(connectedInstanceSelector)
  const { visualizations = [] } = useSelector(appPluginsSelector)
  state = {
    scriptEl,
    loading,
    instance,
    blockingCommands,
    unsupportedCommands,
    visualizations,
    batchSize,
    activeRunQueryMode,
    resultsMode,
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
    if (multiCommands?.length) {
      handleSubmit(multiCommands.join('\n'))
    }
  }, [multiCommands])

  useEffect(() => {
    localStorageService.set(BrowserStorageItem.RunQueryMode, activeRunQueryMode)
  }, [activeRunQueryMode])

  useEffect(() => {
    localStorageService.set(BrowserStorageItem.wbGroupMode, resultsMode)
  }, [resultsMode])

  const handleChangeQueryRunMode = () => {
    setActiveRunQueryMode(
      activeRunQueryMode === RunQueryMode.ASCII
        ? RunQueryMode.Raw
        : RunQueryMode.ASCII
    )
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_MODE_CHANGED,
      eventData: {
        databaseId: instanceId,
        changedFromMode: activeRunQueryMode,
        changedToMode: activeRunQueryMode === RunQueryMode.ASCII
          ? RunQueryMode.Raw
          : RunQueryMode.ASCII
      }
    })
  }

  const handleChangeGroupMode = () => {
    setResultsMode(
      resultsMode === ResultsMode.Default
        ? ResultsMode.GroupMode
        : ResultsMode.Default
    )
  }

  const handleSubmit = (
    commandInit: string = script,
    commandId?: Nullable<string>,
  ) => {
    const { loading, batchSize } = state
    const isNewCommand = () => !commandId
    const getChunkSize = () => {
      if (state.resultsMode === ResultsMode.GroupMode) {
        return splitMonacoValuePerLines(commandInit).length
      }
      return batchSize > 1 ? batchSize : 1
    }

    const commandsForExecuting = without(
      splitMonacoValuePerLines(commandInit)
        .map((command) => removeMonacoComments(decode(command).trim())),
      ''
    )

    const [commands, ...rest] = chunk(commandsForExecuting, getChunkSize())
    const multiCommands = rest.map((command) => getMultiCommands(command))

    if (!commands?.length || loading) {
      setMultiCommands(multiCommands)
      return
    }

    isNewCommand() && scrollResults('start')

    sendCommand(commands, multiCommands)
  }

  const sendCommand = (
    commands: string[],
    multiCommands: string[] = [],
  ) => {
    const { activeRunQueryMode, resultsMode } = state
    const { connectionType, host, port } = state.instance
    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendWBCommandAction({
        resultsMode,
        commands,
        multiCommands,
        mode: activeRunQueryMode,
        onSuccessAction: (multiCommands) => onSuccess(multiCommands),
      }))
      return
    }

    const options: SendClusterCommandDto = {
      commands,
      nodeOptions: {
        host,
        port,
        enableRedirection: true,
      },
      role: ClusterNodeRole.All,
    }
    dispatch(
      sendWBCommandClusterAction({
        commands,
        options,
        mode: state.activeRunQueryMode,
        resultsMode,
        multiCommands,
        onSuccessAction: (multiCommands) => onSuccess(multiCommands),
      })
    )
  }

  const onSuccess = (multiCommands: string[] = []) => {
    setMultiCommands(multiCommands)
  }

  const scrollResults = (inline: ScrollLogicalPosition = 'start') => {
    scrollIntoView(scrollDivRef?.current, {
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

  const sourceValueSubmit = (value?: string, commandId?: Nullable<string>, clearEditor = true) => {
    if (state.loading || (!value && !script)) return

    handleSubmit(value, commandId)
    setTimeout(() => {
      (cleanupWB && clearEditor) && resetCommand()
    }, 0)
  }

  return (
    <WBView
      items={items}
      script={script}
      setScript={setScript}
      setScriptEl={setScriptEl}
      scriptEl={scriptEl}
      scrollDivRef={scrollDivRef}
      activeMode={activeRunQueryMode}
      onSubmit={sourceValueSubmit}
      onQueryOpen={handleQueryOpen}
      onQueryDelete={handleQueryDelete}
      onQueryChangeMode={handleChangeQueryRunMode}
      resultsMode={resultsMode}
      onChangeGroupMode={handleChangeGroupMode}
    />
  )
}

export default WBViewWrapper
