import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { decode } from 'html-entities'
import { useParams } from 'react-router-dom'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { chunk, without } from 'lodash'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

import {
  getExecuteParams,
  getMonacoLines,
  getMultiCommands,
  getParsedParamsInQuery,
  isGroupMode,
  isGroupResults,
  Maybe,
  Nullable,
  removeMonacoComments,
  scrollIntoView,
  splitMonacoValuePerLines,
} from 'uiSrc/utils'
import { localStorageService } from 'uiSrc/services'
import {
  clearWbResultsAction,
  deleteWBCommandAction,
  fetchWBCommandAction,
  fetchWBHistoryAction,
  resetWBHistoryItems,
  sendWBCommandAction,
  sendWBCommandClusterAction,
  workbenchResultsSelector,
} from 'uiSrc/slices/workbench/wb-results'
import { ConnectionType, ExecuteQueryParams, Instance, IPluginVisualization } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector, initialState as instanceInitState } from 'uiSrc/slices/instances/instances'
import { ClusterNodeRole } from 'uiSrc/slices/interfaces/cli'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces/workbench'
import { cliSettingsSelector, fetchBlockingCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { appContextWorkbench, setWorkbenchScript } from 'uiSrc/slices/app/context'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { userSettingsConfigSelector, userSettingsWBSelector } from 'uiSrc/slices/user/user-settings'
import { BrowserStorageItem } from 'uiSrc/constants'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { incrementOnboardStepAction } from 'uiSrc/slices/app/features'

import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { CreateCommandExecutionsDto } from 'apiSrc/modules/workbench/dto/create-command-executions.dto'

import WBView from './WBView'

interface IState extends ExecuteQueryParams {
  loading: boolean
  instance: Instance
  unsupportedCommands: string[]
  blockingCommands: string[]
  visualizations: IPluginVisualization[]
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
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

  const { loading, items, clearing, processing } = useSelector(workbenchResultsSelector)
  const { unsupportedCommands, blockingCommands } = useSelector(cliSettingsSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}
  const { cleanup: cleanupWB } = useSelector(userSettingsWBSelector)
  const { script: scriptContext } = useSelector(appContextWorkbench)

  const [script, setScript] = useState(scriptContext)
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
    setResultsMode(isGroupMode(resultsMode) ? ResultsMode.Default : ResultsMode.GroupMode)
  }

  const updateOnboardingOnSubmit = () => dispatch(incrementOnboardStepAction(
    OnboardingSteps.WorkbenchPage,
    undefined,
    () => sendEventTelemetry({
      event: TelemetryEvent.ONBOARDING_TOUR_ACTION_MADE,
      eventData: {
        databaseId: instanceId,
        step: OnboardingStepName.WorkbenchIntro,
      }
    })
  ))

  const handleSubmit = (
    commandInit: string = script,
    commandId?: Nullable<string>,
    executeParams: CodeButtonParams = {}
  ) => {
    if (!commandInit?.length) return

    const { batchSize, activeRunQueryMode, resultsMode } = getExecuteParams(executeParams, state)
    const isNewCommand = !commandId

    const commandsForExecuting = without(
      splitMonacoValuePerLines(commandInit)
        .map((command) => removeMonacoComments(decode(command).trim())),
      ''
    )

    const chunkSize = isGroupResults(resultsMode) ? commandsForExecuting.length : (batchSize > 1 ? batchSize : 1)

    const [commands, ...rest] = chunk(commandsForExecuting, chunkSize)
    const multiCommands = rest.map((command) => getMultiCommands(command))

    if (!commands?.length) {
      handleSubmit(multiCommands.join('\n'), commandId, executeParams)
      return
    }

    isNewCommand && scrollResults('start')
    sendCommand(
      commands,
      multiCommands,
      { activeRunQueryMode, resultsMode },
      () => {
        updateOnboardingOnSubmit()
        handleSubmit(multiCommands.join('\n'), commandId, executeParams)
      }
    )
  }

  const sendCommand = (
    commands: string[],
    multiCommands: string[] = [],
    executeParams: any = state,
    onSuccess: () => void
  ) => {
    const { activeRunQueryMode, resultsMode } = executeParams
    const { connectionType, host, port } = state.instance
    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendWBCommandAction({
        resultsMode,
        commands,
        multiCommands,
        mode: activeRunQueryMode,
        onSuccessAction: onSuccess,
      }))
      return
    }

    const options: CreateCommandExecutionsDto = {
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
        mode: activeRunQueryMode,
        resultsMode,
        multiCommands,
        onSuccessAction: onSuccess,
      })
    )
  }

  const scrollResults = (inline: ScrollLogicalPosition = 'start') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline,
      })
    })
  }

  const handleQueryDelete = (commandId: string) => {
    dispatch(deleteWBCommandAction(commandId))
  }

  const handleAllQueriesDelete = () => {
    dispatch(clearWbResultsAction())
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_CLEAR_ALL_RESULTS_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const handleQueryOpen = (commandId: string = '') => {
    dispatch(fetchWBCommandAction(commandId))
  }

  const resetCommand = () => {
    state?.scriptEl?.getAction('editor.action.insertLineAfter')?.run() // HACK: to reset completion snippets
    setScript('')
  }

  const sourceValueSubmit = (
    value: string = script,
    commandId?: Nullable<string>,
    executeParams: CodeButtonParams = { clearEditor: true }
  ) => {
    if (state.loading || (!value && !script)) return

    const lines = getMonacoLines(value)
    const parsedParams: Maybe<CodeButtonParams> = getParsedParamsInQuery(value)

    const { clearEditor } = executeParams
    handleSubmit(value, commandId, { ...executeParams, ...parsedParams })

    if (cleanupWB && clearEditor && lines.length) {
      resetCommand()
    }
  }

  return (
    <WBView
      items={items}
      clearing={clearing}
      processing={processing}
      script={script}
      setScript={setScript}
      setScriptEl={setScriptEl}
      scriptEl={scriptEl}
      scrollDivRef={scrollDivRef}
      activeMode={activeRunQueryMode}
      onSubmit={sourceValueSubmit}
      onQueryOpen={handleQueryOpen}
      onQueryDelete={handleQueryDelete}
      onAllQueriesDelete={handleAllQueriesDelete}
      onQueryChangeMode={handleChangeQueryRunMode}
      resultsMode={resultsMode}
      onChangeGroupMode={handleChangeGroupMode}
    />
  )
}

export default WBViewWrapper
