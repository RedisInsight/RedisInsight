import React, { useContext } from 'react'
import cx from 'classnames'
import { EuiIcon, EuiText } from '@elastic/eui'

import { Theme } from 'uiSrc/constants'
import QueryCard from 'uiSrc/components/query-card'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import MultiPlayIconDark from 'uiSrc/assets/img/multi_play_icon_dark.svg'
import MultiPlayIconLight from 'uiSrc/assets/img/multi_play_icon_light.svg'
import styles from './styles.module.scss'

export interface Props {
  historyItems: Array<WBHistoryObject>;
  scrollDivRef: React.Ref<HTMLDivElement>;
  onQueryRun: (query: string, historyId?: number, type?: WBQueryType) => void;
  onQueryDelete: (historyId: number) => void
}
const WBResults = ({ historyItems = [], onQueryRun, onQueryDelete, scrollDivRef }: Props) => {
  const { theme } = useContext(ThemeContext)

  const NoResults = (
    <div className={styles.noResults} data-testid="wb_no-results">
      <EuiIcon
        type={theme === Theme.Dark ? MultiPlayIconDark : MultiPlayIconLight}
        className={styles.playIcon}
      />
      <EuiText className={styles.noResultsTitle} color="subdued">No results to display.</EuiText>
      <EuiText className={styles.noResultsText} color="subdued">
        Run Redis commands to get results or see the left menu to learn more.
      </EuiText>
    </div>
  )

  return (
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
      {!historyItems.length && NoResults}
    </div>
  )
}

export default React.memo(WBResults)
