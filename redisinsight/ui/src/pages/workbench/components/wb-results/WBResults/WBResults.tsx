import React from 'react'
import cx from 'classnames'

import QueryCard from 'uiSrc/components/query-card'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import styles from './styles.module.scss'

export interface Props {
  historyItems: Array<WBHistoryObject>;
  scrollDivRef: React.Ref<HTMLDivElement>;
  onQueryRun: (query: string, historyId?: number, type?: WBQueryType) => void;
  onQueryDelete: (historyId: number) => void
}
const WBResults = ({ historyItems = [], onQueryRun, onQueryDelete, scrollDivRef }: Props) => (
  <div className={cx(styles.container)}>
    <div ref={scrollDivRef} />
    {historyItems.map(({ query, data, id, time, fromPersistentStore, matched, loading, status }) => (
      <QueryCard
        id={id}
        key={id}
        data={data}
        status={status}
        loading={loading}
        query={query}
        matched={matched}
        time={time}
        fromStore={!!fromPersistentStore}
        onQueryRun={(queryType: WBQueryType) => onQueryRun(query, id, queryType)}
        onQueryReRun={() => onQueryRun(query)}
        onQueryDelete={() => onQueryDelete(id)}
      />
    ))}
  </div>
)

export default React.memo(WBResults)
