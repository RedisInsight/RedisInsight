import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { keys } from '@elastic/eui'
import { useParams } from 'react-router-dom'

import { DEFAULT_TEXT_VIEW_TYPE, WBQueryType } from 'uiSrc/pages/workbench/constants'
import { ResultsMode, ResultsSummary } from 'uiSrc/slices/interfaces/workbench'
import { getVisualizationsByCommand, getWBQueryType, isSilentModeWithoutError } from 'uiSrc/utils'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'

import QueryCardHeader from './QueryCardHeader'
import { Props } from './query-card.types'

import { QueryCardBody } from './QueryCardBody'
import styles from './styles.module.scss'

const getDefaultPlugin = (views: IPluginVisualization[], query: string | null) =>
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
    clearing,
    emptyCommand,
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
          clearing={clearing}
          createdAt={createdAt}
          message={message}
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
        <QueryCardBody
          {...props}
          isFullScreen={isFullScreen}
          setMessage={setMessage}
          selectedViewValue={selectedViewValue}
          viewTypeSelected={viewTypeSelected}
        />
      </div>
    </div>
  )
}

export default React.memo(QueryCard)
