import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { EuiResizableContainer } from '@elastic/eui'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import {
  Maybe,
  Nullable,
  getMultiCommands,
  getParsedParamsInQuery,
  getCommandsForExecution
} from 'uiSrc/utils'
import QueryWrapper from 'uiSrc/components/query'
import {
  setWorkbenchVerticalPanelSizes,
  appContextWorkbench,
} from 'uiSrc/slices/app/context'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { CodeButtonParams } from 'uiSrc/constants'
import WBResultsWrapper from '../../wb-results'
import styles from './styles.module.scss'

const verticalPanelIds = {
  firstPanelId: 'scriptingArea',
  secondPanelId: 'resultsArea'
}

export interface Props {
  script: string
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  setScript: (script: string) => void
  setScriptEl: Function
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
  scrollDivRef: Ref<HTMLDivElement>
  activeMode: RunQueryMode
  resultsMode: ResultsMode
  onSubmit: (query?: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
  onQueryOpen: (commandId?: string) => void
  onQueryDelete: (commandId: string) => void
  onAllQueriesDelete: () => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
}

interface IState {
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
}

let state: IState = {
  activeMode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.Default
}

const WBView = (props: Props) => {
  const {
    script = '',
    items,
    clearing,
    processing,
    setScript,
    setScriptEl,
    scriptEl,
    activeMode,
    resultsMode,
    onSubmit,
    onQueryOpen,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryChangeMode,
    onChangeGroupMode,
    scrollDivRef,
  } = props

  state = {
    activeMode,
    resultsMode
  }

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { panelSizes: { vertical } } = useSelector(appContextWorkbench)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}

  const [isCodeBtnDisabled, setIsCodeBtnDisabled] = useState<boolean>(false)

  const verticalSizesRef = useRef(vertical)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setWorkbenchVerticalPanelSizes(verticalSizesRef.current))
  }, [])

  const onVerticalPanelWidthChange = useCallback((newSizes: any) => {
    verticalSizesRef.current = newSizes
  }, [])

  const handleSubmit = (value?: string) => {
    sendEventSubmitTelemetry(TelemetryEvent.WORKBENCH_COMMAND_SUBMITTED, value)
    onSubmit(value)
  }

  const handleReRun = (query?: string, commandId?: Nullable<string>, executeParams: CodeButtonParams = {}) => {
    sendEventSubmitTelemetry(TelemetryEvent.WORKBENCH_COMMAND_RUN_AGAIN, query, executeParams)
    onSubmit(query, commandId, executeParams)
  }

  const handleProfile = (query?: string, commandId?: Nullable<string>, executeParams: CodeButtonParams = {}) => {
    sendEventSubmitTelemetry(TelemetryEvent.WORKBENCH_COMMAND_PROFILE, query, executeParams)
    onSubmit(query, commandId, executeParams)
  }

  const sendEventSubmitTelemetry = (
    event: TelemetryEvent,
    commandInit = script,
    executeParams?: CodeButtonParams,
  ) => {
    const eventData = (() => {
      const parsedParams: Maybe<CodeButtonParams> = isEmpty(executeParams)
        ? getParsedParamsInQuery(commandInit)
        : executeParams
      const commands = getCommandsForExecution(commandInit)
      const [commandLine, ...rest] = commands.map((command = '') => {
        const matchedCommand = REDIS_COMMANDS_ARRAY.find((commandName) =>
          command.toUpperCase().startsWith(commandName))
        return matchedCommand ?? command.split(' ')?.[0]
      })

      const multiCommands = getMultiCommands(rest).replaceAll('\n', ';')
      const command = [commandLine, multiCommands].join('') ? [commandLine, multiCommands].join(';') : null

      const pipeline = TelemetryEvent.WORKBENCH_COMMAND_RUN_AGAIN !== event
        ? (parsedParams?.pipeline || batchSize) > 1
        : undefined

      return {
        command: command?.toUpperCase(),
        pipeline,
        databaseId: instanceId,
        multiple: multiCommands ? 'Multiple' : 'Single',
        rawMode: (parsedParams?.mode?.toUpperCase() || state.activeMode) === RunQueryMode.Raw,
        results:
          ResultsMode.GroupMode.startsWith?.(
            parsedParams?.results?.toUpperCase()
            || state.resultsMode
            || 'GROUP'
          )
            ? 'group'
            : (parsedParams?.results?.toLowerCase() === 'silent' ? 'silent' : 'single'),
      }
    })()

    if (eventData.command) {
      sendEventTelemetry({
        event,
        eventData
      })
    }
  }

  return (
    <div className={cx('workbenchPage', styles.container)}>
      <div className={styles.main}>
        <div className={styles.content}>
          <EuiResizableContainer onPanelWidthChange={onVerticalPanelWidthChange} direction="vertical" style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel
                  id={verticalPanelIds.firstPanelId}
                  minSize="140px"
                  paddingSize="none"
                  scrollable={false}
                  className={styles.queryPanel}
                  initialSize={vertical[verticalPanelIds.firstPanelId] ?? 20}
                  style={{ minHeight: '140px', zIndex: '8' }}
                >
                  <QueryWrapper
                    query={script}
                    activeMode={activeMode}
                    resultsMode={resultsMode}
                    setQuery={setScript}
                    setQueryEl={setScriptEl}
                    setIsCodeBtnDisabled={setIsCodeBtnDisabled}
                    onSubmit={handleSubmit}
                    onQueryChangeMode={onQueryChangeMode}
                    onChangeGroupMode={onChangeGroupMode}
                  />
                </EuiResizablePanel>

                <EuiResizableButton
                  className={styles.resizeButton}
                  data-test-subj="resize-btn-scripting-area-and-results"
                />

                <EuiResizablePanel
                  id={verticalPanelIds.secondPanelId}
                  minSize="60px"
                  paddingSize="none"
                  scrollable={false}
                  initialSize={vertical[verticalPanelIds.secondPanelId] ?? 80}
                  className={cx(styles.queryResults, styles.queryResultsPanel)}
                    // Fix scroll on low height - 140px (queryPanel)
                  style={{ maxHeight: 'calc(100% - 140px)' }}
                >
                  <WBResultsWrapper
                    items={items}
                    clearing={clearing}
                    processing={processing}
                    activeMode={activeMode}
                    activeResultsMode={resultsMode}
                    scrollDivRef={scrollDivRef}
                    onQueryReRun={handleReRun}
                    onQueryProfile={handleProfile}
                    onQueryOpen={onQueryOpen}
                    onQueryDelete={onQueryDelete}
                    onAllQueriesDelete={onAllQueriesDelete}
                  />
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>
        </div>
      </div>
    </div>
  )
}

export default WBView
