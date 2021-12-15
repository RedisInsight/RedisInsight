import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { decode } from 'html-entities'
import { useParams } from 'react-router-dom'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import {
  Nullable,
  checkBlockingCommand,
  checkUnsupportedCommand,
  removeMonacoComments,
  checkUnsupportedModuleCommand,
  cliParseTextResponse,
  splitMonacoValuePerLines,
  getMultiCommands,
} from 'uiSrc/utils'
import {
  sendWBCommandAction,
  workbenchResultsSelector,
  sendWBCommandClusterAction,
} from 'uiSrc/slices/workbench/wb-results'
import { ConnectionType, Instance, IPluginVisualization, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { initialState as instanceInitState, connectedInstanceSelector } from 'uiSrc/slices/instances'
import HistoryContainer from 'uiSrc/services/queryHistory'
import { ClusterNodeRole, CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'

import { createWBClientAction, updateWBClientAction, workbenchSettingsSelector } from 'uiSrc/slices/workbench/wb-settings'
import { cliSettingsSelector, fetchBlockingCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { appContextWorkbench, setWorkbenchScript } from 'uiSrc/slices/app/context'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { cliTexts } from 'uiSrc/constants/cliOutput'
import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'

import WBView from './WBView'
import ModuleNotLoaded from '../module-not-loaded'
import {
  RSNotLoadedContent,
  WORKBENCH_HISTORY_MAX_LENGTH,
  WORKBENCH_HISTORY_WRAPPER_NAME,
} from '../../constants'
import { WBHistoryObject } from '../../interfaces'

let historyContainer: HistoryContainer<WBHistoryObject>
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

  const { loading } = useSelector(workbenchResultsSelector)
  const { unsupportedCommands, blockingCommands } = useSelector(cliSettingsSelector)
  const { script: scriptContext } = useSelector(appContextWorkbench)

  const [historyItems, setHistoryItems] = useState<Array<WBHistoryObject>>([])
  const [script, setScript] = useState(scriptContext)
  const [multiCommands, setMultiCommands] = useState('')
  const [scriptEl, setScriptEl] = useState<Nullable<monacoEditor.editor.IStandaloneCodeEditor>>(null)

  const instance = useSelector(connectedInstanceSelector)
  const { wbClientUuid = '' } = useSelector(workbenchSettingsSelector)
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
    historyContainer = new HistoryContainer<WBHistoryObject>(
      `${WORKBENCH_HISTORY_WRAPPER_NAME}_${instanceId}`
    )
    if (!instanceId) {
      return
    }
    setHistoryItems(historyContainer.getData())
    if (wbClientUuid) {
      dispatch(updateWBClientAction(instanceId, wbClientUuid))
    } else {
      dispatch(createWBClientAction(instanceId))
    }

    // componentWillUnmount
    return () => {
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
  }, [historyItems])

  const getUnsupportedCommandResponse = (commandLine = '') => {
    const { modules } = state.instance
    const { unsupportedCommands, blockingCommands } = state
    const unsupportedCommand = checkUnsupportedCommand(unsupportedCommands, commandLine)
      || checkBlockingCommand(blockingCommands, commandLine)

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

  const handleSubmit = (
    commandInit: string = script,
    historyId?: number,
  ) => {
    const { loading } = state
    const isNewCommand = () => !historyId
    const [command, ...rest] = splitMonacoValuePerLines(commandInit)

    const multiCommands = getMultiCommands(rest)
    setMultiCommands(multiCommands)

    let commandLine = decode(command).trim()

    // remove comments
    commandLine = removeMonacoComments(commandLine)

    if (!commandLine || loading) {
      multiCommands && setHistoryItems((history) => [...history])
      return
    }

    isNewCommand() && scrollResults('start')

    const unsupportedCommand = getUnsupportedCommandResponse(commandLine)

    if (unsupportedCommand) {
      onSuccess({
        id: historyId || Date.now(),
        query: commandLine,
        data: unsupportedCommand,
        time: Date.now()
      })
      return
    }

    checkClient(commandLine, historyId || Date.now())
  }

  const checkClient = (
    command: string,
    historyId = Date.now()
  ) => {
    if (!wbClientUuid) {
      dispatch(createWBClientAction(instanceId, () => sendCommand(command, historyId || Date.now())))
    } else {
      sendCommand(command, historyId || Date.now())
    }
  }

  const sendCommand = (
    command: string,
    historyId = Date.now(),
  ) => {
    const { connectionType, host, port } = state.instance
    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendWBCommandAction({
        command, historyId, onSuccessAction: onSuccess
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
        historyId,
        options,
        onSuccessAction: onSuccess,
      })
    )
  }

  const onSuccess = (historyResponse: WBHistoryObject) => {
    if (historyContainer.hasId(historyResponse?.id)) {
      historyContainer.replaceHistoryItem(historyResponse?.id, historyResponse)
    } else {
      if (historyContainer.getLength() >= WORKBENCH_HISTORY_MAX_LENGTH) {
        historyContainer.deleteHistoryLastItem()
      }

      historyContainer.pushData(historyResponse)
      resetCommand()
    }

    setHistoryItems(historyContainer.getData())
  }

  const scrollResults = (inline: ScrollLogicalPosition = 'start') => {
    scrollDivRef?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline,
    })
  }

  const onQueryDelete = (historyId: number) => {
    if (historyContainer.hasId(historyId)) {
      historyContainer.deleteHistoryItem(historyId)
      setHistoryItems(historyContainer.getData())
    }
  }

  const resetCommand = () => {
    state?.scriptEl?.getAction('editor.action.insertLineAfter')?.run() // HACK: to reset completion snippets
    setScript('')
  }

  return (
    <WBView
      historyItems={historyItems}
      script={script}
      loading={loading}
      setScript={setScript}
      setScriptEl={setScriptEl}
      scriptEl={scriptEl}
      scrollDivRef={scrollDivRef}
      onSubmit={handleSubmit}
      onQueryDelete={onQueryDelete}
    />
  )
}

export default WBViewWrapper
