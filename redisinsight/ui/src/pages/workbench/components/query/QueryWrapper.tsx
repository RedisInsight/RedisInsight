import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiLoadingContent } from '@elastic/eui'

import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { fetchRedisearchListAction, redisearchListSelector } from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import Query from './Query'
import styles from './Query/styles.module.scss'

export interface Props {
  query: string
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  setQuery: (script: string) => void
  setQueryEl: Function
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onSubmit: (value?: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
}

const QueryWrapper = (props: Props) => {
  const {
    query = '',
    activeMode,
    resultsMode,
    setQuery,
    setQueryEl,
    onKeyDown,
    onSubmit,
    onQueryChangeMode,
    onChangeGroupMode
  } = props
  const { loading: isCommandsLoading, } = useSelector(appRedisCommandsSelector)
  const { id: connectedIndstanceId } = useSelector(connectedInstanceSelector)
  const { data: indexes = [] } = useSelector(redisearchListSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!connectedIndstanceId) return

    // fetch indexes
    dispatch(fetchRedisearchListAction())
  }, [connectedIndstanceId])

  const Placeholder = (
    <div className={styles.containerPlaceholder}>
      <div>
        <EuiLoadingContent lines={2} className="fluid" />
      </div>
    </div>
  )
  return isCommandsLoading ? (
    Placeholder
  ) : (
    <Query
      query={query}
      indexes={indexes}
      activeMode={activeMode}
      resultsMode={resultsMode}
      setQuery={setQuery}
      setQueryEl={setQueryEl}
      onKeyDown={onKeyDown}
      onSubmit={onSubmit}
      onQueryChangeMode={onQueryChangeMode}
      onChangeGroupMode={onChangeGroupMode}
    />
  )
}

export default React.memo(QueryWrapper)
