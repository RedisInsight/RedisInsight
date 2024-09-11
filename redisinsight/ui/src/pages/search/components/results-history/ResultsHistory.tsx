import React, { useEffect } from 'react'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { EuiButtonEmpty, EuiProgress } from '@elastic/eui'
import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import { QueryCard } from 'uiSrc/components/query'
import {
  clearWbResultsAction,
  deleteWBCommandAction,
  fetchWBCommandAction,
  fetchWBHistoryAction,
  resetWBHistoryItems,
  workbenchResultsSelector
} from 'uiSrc/slices/workbench/wb-results'
import { searchAndQuerySelector } from 'uiSrc/slices/search/searchAndQuery'

import { CommandExecutionType, RunQueryMode } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { generateProfileQueryForCommand } from 'uiSrc/pages/workbench/utils'
import { CodeButtonParams } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  commandsArray?: string[]
  onSubmit: (
    commandInit: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams
  ) => void
}

const ResultsHistory = (props: Props) => {
  const { commandsArray = [], onSubmit } = props
  const {
    items,
    clearing,
    isLoaded
  } = useSelector(workbenchResultsSelector)
  const { activeRunQueryMode } = useSelector(searchAndQuerySelector)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    dispatch(fetchWBHistoryAction(instanceId, CommandExecutionType.Search))

    return () => {
      dispatch(resetWBHistoryItems())
    }
  }, [])

  const handleQueryOpen = (commandId: string = '') => {
    dispatch(fetchWBCommandAction(commandId))
  }

  const handleQueryDelete = (commandId: string) => {
    dispatch(deleteWBCommandAction(commandId))
  }

  const handleAllQueriesDelete = () => {
    dispatch(clearWbResultsAction(CommandExecutionType.Search))
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const handleQueryReRun = (
    query: string,
    commandId?: Nullable<string>,
    mode?: RunQueryMode
  ) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
      eventData: {
        databaseId: instanceId,
        command: getCommandsFromQuery(query, commandsArray) || '',
        mode
      }
    })
    onSubmit(query, commandId, { mode })
  }

  const handleQueryProfile = (
    profileType: ProfileQueryType,
    commandExecution: { command: string, mode?: RunQueryMode }
  ) => {
    const { command, mode } = commandExecution
    const profileQuery = generateProfileQueryForCommand(command, profileType)
    if (profileQuery) {
      onSubmit(command, null, { mode })
    }
  }

  return (
    <div className={styles.wrapper}>
      {!isLoaded && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-wb-history"
        />
      )}
      {!!items?.length && (
        <div className={styles.header}>
          <EuiButtonEmpty
            size="s"
            iconType="trash"
            className={styles.clearAllBtn}
            onClick={handleAllQueriesDelete}
            disabled={clearing}
            data-testid="clear-history-btn"
          >
            Clear Results
          </EuiButtonEmpty>
        </div>
      )}
      <div className={cx(styles.container)}>
        <div />
        {items?.length ? items.map((
          {
            command = '',
            isOpen = false,
            result = undefined,
            summary = undefined,
            id = '',
            loading,
            createdAt,
            mode,
            emptyCommand,
            isNotStored,
            executionTime,
            db,
          }
        ) => (
          <QueryCard
            id={id}
            key={id}
            isOpen={isOpen}
            result={result}
            summary={summary}
            clearing={clearing}
            loading={loading}
            command={command}
            createdAt={createdAt}
            emptyCommand={emptyCommand}
            isNotStored={isNotStored}
            executionTime={executionTime}
            mode={mode}
            activeMode={activeRunQueryMode}
            executionType={CommandExecutionType.Search}
            db={db}
            onQueryProfile={(profileType) =>
              handleQueryProfile(profileType, { command, mode })}
            onQueryOpen={() => handleQueryOpen(id)}
            onQueryReRun={() => handleQueryReRun(command, id, mode)}
            onQueryDelete={() => handleQueryDelete(id)}
          />
        )) : null}
      </div>
    </div>
  )
}

export default ResultsHistory
