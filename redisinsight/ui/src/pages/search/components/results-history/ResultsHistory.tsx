import React, { useEffect } from 'react'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { Nullable } from 'uiSrc/utils'
import { QueryCard } from 'uiSrc/components/query'
import { fetchWBCommandAction, fetchWBHistoryAction, workbenchResultsSelector } from 'uiSrc/slices/workbench/wb-results'
import { searchAndQuerySelector } from 'uiSrc/slices/search/searchAndQuery'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (
    commandInit: string,
    commandId?: Nullable<string>,
  ) => void
}

const ResultsHistory = (props: Props) => {
  const { onSubmit } = props
  const {
    items,
    clearing,
  } = useSelector(workbenchResultsSelector)
  const { activeRunQueryMode } = useSelector(searchAndQuerySelector)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    dispatch(fetchWBHistoryAction(instanceId))
  }, [])

  const handleQueryOpen = (commandId: string = '') => {
    dispatch(fetchWBCommandAction(commandId))
  }

  return (
    <div className={styles.wrapper}>
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
            db={db}
            onQueryProfile={() => {}}
            onQueryOpen={() => handleQueryOpen(id)}
            onQueryReRun={() => onSubmit(command, id)}
            onQueryDelete={() => {}}
          />
        )) : null}
      </div>
    </div>
  )
}

export default ResultsHistory
