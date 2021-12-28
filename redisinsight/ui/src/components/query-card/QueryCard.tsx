import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiLoadingContent, keys } from '@elastic/eui'
import { useParams } from 'react-router-dom'

import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { getWBQueryType, Nullable, getVisualizationsByCommand, Maybe } from 'uiSrc/utils'
import { appPluginsSelector } from 'uiSrc/slices/app/plugins'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import QueryCardHeader from './QueryCardHeader'
import QueryCardCliResult from './QueryCardCliResult'
import QueryCardCliPlugin from './QueryCardCliPlugin'
import QueryCardCommonResult from './QueryCardCommonResult'

import styles from './styles.module.scss'

export interface Props {
  id: number;
  query: string;
  data: any;
  status: Maybe<CommandExecutionStatus>;
  fromStore: boolean;
  time?: number;
  loading?: boolean;
  onQueryRun: (queryType: WBQueryType) => void;
  onQueryDelete: () => void;
  onQueryReRun: () => void;
}

const getDefaultPlugin = (views: IPluginVisualization[], query: string) =>
  getVisualizationsByCommand(query, views).find((view) => view.default)?.uniqId || ''

const QueryCard = (props: Props) => {
  const {
    id,
    query = '',
    data,
    status,
    fromStore,
    time,
    onQueryRun,
    onQueryDelete,
    onQueryReRun,
    loading
  } = props

  const { visualizations = [] } = useSelector(appPluginsSelector)

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const [isOpen, setIsOpen] = useState(!fromStore)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [result, setResult] = useState<Nullable<any>>(data)
  const [queryType, setQueryType] = useState<WBQueryType>(getWBQueryType(query, visualizations))
  const [viewTypeSelected, setViewTypeSelected] = useState<WBQueryType>(queryType)
  const [summaryText, setSummaryText] = useState<string>('')
  const [selectedViewValue, setSelectedViewValue] = useState<string>(
    getDefaultPlugin(visualizations, query) || queryType
  )

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
    setQueryType(getWBQueryType(query, visualizations))
  }, [query])

  useEffect(() => {
    if (visualizations.length) {
      const type = getWBQueryType(query, visualizations)
      setQueryType(type)
      setViewTypeSelected(type)
      setSelectedViewValue(getDefaultPlugin(visualizations, query) || queryType)
    }
  }, [visualizations])

  useEffect(() => {
    if (data !== undefined) {
      setResult(data)
    }
  }, [data, time])

  const toggleOpen = () => {
    if (isFullScreen) return

    setIsOpen(!isOpen)

    if (!isOpen && !data) {
      onQueryRun(queryType)
    }
  }

  const changeViewTypeSelected = (type: WBQueryType, value: string) => {
    setViewTypeSelected(type)
    setSelectedViewValue(value)
  }

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
          query={query}
          time={time}
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
            {React.isValidElement(result)
              ? <QueryCardCommonResult loading={loading} result={result} />
              : (
                <>
                  {viewTypeSelected === WBQueryType.Plugin && (
                    <>
                      {!loading && result !== undefined ? (
                        <QueryCardCliPlugin
                          id={selectedViewValue}
                          result={result}
                          status={status}
                          query={query}
                          setSummaryText={setSummaryText}
                        />
                      ) : (
                        <div className={styles.loading}>
                          <EuiLoadingContent lines={5} />
                        </div>
                      )}
                    </>
                  )}
                  {viewTypeSelected === WBQueryType.Text && (
                    <QueryCardCliResult loading={loading} query={query} status={status} result={result} />
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
