import React from 'react'
import { useSelector } from 'react-redux'
import { EuiLoadingContent } from '@elastic/eui'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import Query from './Query'

import styles from './Query/styles.module.scss'

export interface Props {
  query: string;
  loading: boolean;
  setQuery: (script: string) => void;
  setQueryEl: Function;
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void;
  onSubmit: () => void;
}
const QueryWrapper = (props: Props) => {
  const { query = '', loading, setQuery, setQueryEl, onKeyDown, onSubmit } = props
  const { loading: isCommandsLoading } = useSelector(appRedisCommandsSelector)

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
      loading={loading}
      setQuery={setQuery}
      setQueryEl={setQueryEl}
      onKeyDown={onKeyDown}
      onSubmit={onSubmit}
    />
  )
}

export default QueryWrapper
