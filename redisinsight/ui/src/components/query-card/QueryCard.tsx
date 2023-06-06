import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiLoadingContent, keys } from '@elastic/eui'
import { useParams } from 'react-router-dom'
import { isNull } from 'lodash'

import { WBQueryType, ProfileQueryType, DEFAULT_TEXT_VIEW_TYPE } from 'uiSrc/pages/workbench/constants'
import { RunQueryMode, ResultsMode, ResultsSummary } from 'uiSrc/slices/interfaces/workbench'
import {
  getWBQueryType,
  getVisualizationsByCommand,
  Maybe,
  isGroupResults,
  isSilentModeWithoutError,
} from 'uiSrc/utils'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { CommandExecutionResult, IPluginVisualization } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'

import QueryCardHeader from './QueryCardHeader'
import QueryCardCliResultWrapper from './QueryCardCliResultWrapper'
import QueryCardCliPlugin from './QueryCardCliPlugin'
import QueryCardCommonResult, { CommonErrorResponse } from './QueryCardCommonResult'

import styles from './styles.module.scss'

export interface Props {
  id: string
  command: string
  isOpen: boolean
  result: Maybe<CommandExecutionResult[]>
  activeMode: RunQueryMode
  mode?: RunQueryMode
  activeResultsMode?: ResultsMode
  resultsMode?: ResultsMode
  emptyCommand?: boolean
  summary?: ResultsSummary
  createdAt?: Date
  loading?: boolean
  isNotStored?: boolean
  executionTime?: number
  db?: number
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryOpen: () => void
  onQueryProfile: (type: ProfileQueryType) => void
}

const getDefaultPlugin = (views: IPluginVisualization[], query: string) =>
  getVisualizationsByCommand(query, views).find((view) => view.default)?.uniqId || DEFAULT_TEXT_VIEW_TYPE.id

export const getSummaryText = (summary?: ResultsSummary, mode?: ResultsMode) => {
  if (summary) {
    const { total, success, fail } = summary
    const summaryText = `${total} Command(s) - ${success} success`
    if (!isSilentModeWithoutError(mode, summary?.fail)) {
      return `${summaryText}, ${fail} error(s)`
    }
    return summaryText
  }
  return summary
}

const QueryCard = (props: Props) => {
  const {
    id,
    command = '',
    result,
    activeMode,
    mode,
    activeResultsMode,
    resultsMode,
    summary,
    isOpen,
    createdAt,
    onQueryOpen,
    onQueryDelete,
    onQueryProfile,
    onQueryReRun,
    loading,
    emptyCommand,
    isNotStored,
    executionTime,
    db,
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [queryType, setQueryType] = useState<WBQueryType>(getWBQueryType(command, visualizations))
  const [viewTypeSelected, setViewTypeSelected] = useState<WBQueryType>(queryType)
  const [message, setMessage] = useState<string>('')
  const [selectedViewValue, setSelectedViewValue] = useState<string>(
    getDefaultPlugin(visualizations, command || '') || queryType
  )

  const dispatch = useDispatch()

  useEffect(() => {
    window.addEventListener('keydown', handleEscFullScreen)
    return () => {
      window.removeEventListener('keydown', handleEscFullScreen)
    }
  }, [isFullScreen])

  const handleEscFullScreen = (event: KeyboardEvent) => {
    if (event.key === keys.ESCAPE && isFullScreen) {
      toggleFullScreen()
    }
  }

  const toggleFullScreen = () => {
    setIsFullScreen((isFull) => {
      sendEventTelemetry({
        event: TelemetryEvent.WORKBENCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: instanceId,
          state: isFull ? 'Close' : 'Open'
        }
      })

      return !isFull
    })
  }

  useEffect(() => {
    setQueryType(getWBQueryType(command, visualizations))
  }, [command])

  useEffect(() => {
    if (visualizations.length) {
      const type = getWBQueryType(command, visualizations)
      setQueryType(type)
      setViewTypeSelected(type)
      setSelectedViewValue(getDefaultPlugin(visualizations, command) || queryType)
    }
  }, [visualizations])

  const toggleOpen = () => {
    if (isFullScreen || isSilentModeWithoutError(resultsMode, summary?.fail)) return

    dispatch(toggleOpenWBResult(id))

    if (!isOpen && !result) {
      onQueryOpen()
    }
  }

  const changeViewTypeSelected = (type: WBQueryType, value: string) => {
    setViewTypeSelected(type)
    setSelectedViewValue(value)
  }

  const commonError = CommonErrorResponse(id, command, result)

  return (
    <div
      className={cx(styles.containerWrapper, {
        fullscreen: isFullScreen,
        [styles.isOpen]: isOpen
      })}
      id={id}
    >
      <div
        className={cx(styles.container)}
        data-testid={`query-card-container-${id}`}
      >
        <QueryCardHeader
          isOpen={isOpen}
          isFullScreen={isFullScreen}
          query={command}
          loading={loading}
          createdAt={createdAt}
          message={message}
          queryType={queryType}
          selectedValue={selectedViewValue}
          activeMode={activeMode}
          mode={mode}
          resultsMode={resultsMode}
          activeResultsMode={activeResultsMode}
          emptyCommand={emptyCommand}
          summary={summary}
          summaryText={getSummaryText(summary, resultsMode)}
          executionTime={executionTime}
          db={db}
          toggleOpen={toggleOpen}
          toggleFullScreen={toggleFullScreen}
          setSelectedValue={changeViewTypeSelected}
          onQueryDelete={onQueryDelete}
          onQueryReRun={onQueryReRun}
          onQueryProfile={onQueryProfile}
        />
        {isOpen && (
          <>
            {React.isValidElement(commonError) && (!isGroupResults(resultsMode) || isNull(command))
              ? <QueryCardCommonResult loading={loading} result={commonError} />
              : (
                <>
                  {isGroupResults(resultsMode) && (
                    <QueryCardCliResultWrapper
                      loading={loading}
                      query={command}
                      db={db}
                      resultsMode={resultsMode}
                      result={result}
                      isNotStored={isNotStored}
                      isFullScreen={isFullScreen}
                      data-testid="group-mode-card"
                    />
                  )}
                  {(resultsMode === ResultsMode.Default || !resultsMode) && (
                    <>
                      {viewTypeSelected === WBQueryType.Plugin && (
                        <>
                          {!loading && result !== undefined ? (
                            <QueryCardCliPlugin
                              id={selectedViewValue}
                              result={result}
                              query={command}
                              mode={mode}
                              setMessage={setMessage}
                              commandId={id}
                            />
                          ) : (
                            <div className={styles.loading}>
                              <EuiLoadingContent lines={5} data-testid="loading-content" />
                            </div>
                          )}
                        </>
                      )}
                      {(viewTypeSelected === WBQueryType.Text) && (
                        <QueryCardCliResultWrapper
                          loading={loading}
                          query={command}
                          resultsMode={resultsMode}
                          result={result}
                          isNotStored={isNotStored}
                          isFullScreen={isFullScreen}
                        />
                      )}
                    </>
                  )}
                </>
              )}
          </>
        )}
      </div>
    </div>
  )
}

export default React.memo(QueryCard)
