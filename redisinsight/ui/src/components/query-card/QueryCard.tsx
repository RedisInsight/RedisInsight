import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiLoadingContent, keys } from '@elastic/eui'
import { useParams } from 'react-router-dom'

import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import {
  getWBQueryType,
  getVisualizationsByCommand,
  Maybe
} from 'uiSrc/utils'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { CommandExecutionResult, IPluginVisualization } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'

import QueryCardHeader from './QueryCardHeader'
import QueryCardCliResult from './QueryCardCliResult'
import QueryCardCliPlugin from './QueryCardCliPlugin'
import QueryCardCommonResult, { CommonErrorResponse } from './QueryCardCommonResult'

import styles from './styles.module.scss'

export interface Props {
  id: string
  command: string
  isOpen: boolean
  result: Maybe<CommandExecutionResult[]>
  createdAt?: Date
  loading?: boolean
  onQueryDelete: () => void
  onQueryReRun: () => void
  onQueryOpen: () => void
}

const getDefaultPlugin = (views: IPluginVisualization[], query: string) =>
  getVisualizationsByCommand(query, views).find((view) => view.default)?.uniqId || ''

const QueryCard = (props: Props) => {
  const {
    id,
    command = '',
    result,
    isOpen,
    createdAt,
    onQueryOpen,
    onQueryDelete,
    onQueryReRun,
    loading
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [queryType, setQueryType] = useState<WBQueryType>(getWBQueryType(command, visualizations))
  const [viewTypeSelected, setViewTypeSelected] = useState<WBQueryType>(queryType)
  const [summaryText, setSummaryText] = useState<string>('')
  const [selectedViewValue, setSelectedViewValue] = useState<string>(
    getDefaultPlugin(visualizations, command) || queryType
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
    if (isFullScreen) return

    dispatch(toggleOpenWBResult(id))

    if (!isOpen && !result) {
      onQueryOpen()
    }
  }

  const changeViewTypeSelected = (type: WBQueryType, value: string) => {
    setViewTypeSelected(type)
    setSelectedViewValue(value)
  }

  const commonError = CommonErrorResponse(command, result)

  return (
    <div className={cx(styles.containerWrapper, {
      fullscreen: isFullScreen,
      [styles.isOpen]: isOpen
    })}
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
          summaryText={summaryText}
          queryType={queryType}
          selectedValue={selectedViewValue}
          toggleOpen={toggleOpen}
          toggleFullScreen={toggleFullScreen}
          setSelectedValue={changeViewTypeSelected}
          onQueryDelete={onQueryDelete}
          onQueryReRun={onQueryReRun}
        />
        {isOpen && (
          <>
            {React.isValidElement(commonError)
              ? <QueryCardCommonResult loading={loading} result={commonError} />
              : (
                <>
                  {viewTypeSelected === WBQueryType.Plugin && (
                    <>
                      {!loading && result !== undefined ? (
                        <QueryCardCliPlugin
                          id={selectedViewValue}
                          result={result}
                          query={command}
                          setSummaryText={setSummaryText}
                          commandId={id}
                        />
                      ) : (
                        <div className={styles.loading}>
                          <EuiLoadingContent lines={5} data-testid="loading-content" />
                        </div>
                      )}
                    </>
                  )}
                  {viewTypeSelected === WBQueryType.Text && (
                    <QueryCardCliResult
                      loading={loading}
                      query={command}
                      result={result}
                    />
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
