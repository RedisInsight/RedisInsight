import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiTitle } from '@elastic/eui'
import { TableView } from 'uiSrc/pages/databaseAnalysis'
import { Nullable } from 'uiSrc/utils'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import Table from './Table'
import Loader from '../table-loader'
import styles from '../styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  delimiter?: string
}

const TopKeys = ({ data, loading }: Props) => {
  const { topKeysLength = [], topKeysMemory = [], delimiter } = data || {}
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)

  if (loading) {
    return <Loader />
  }

  if ((!topKeysLength?.length) && (!topKeysMemory?.length)) {
    return null
  }

  return (
    <div className={styles.topNamespaceView}>
      <EuiTitle className="section-title">
        <h4 data-testid="top-keys-title">
          {topKeysLength.length < 15 && topKeysMemory?.length < 15
            ? 'TOP KEYS'
            : 'TOP 15 KEYS'}
        </h4>
      </EuiTitle>
      <EuiButton
        fill
        size="s"
        color="secondary"
        onClick={() => setTableView(TableView.MEMORY)}
        disabled={tableView === TableView.MEMORY}
        className={cx(styles.textBtn, { [styles.activeBtn]: tableView === TableView.MEMORY })}
        data-testid="btn-change-table-memory"
      >
        by Memory
      </EuiButton>
      <EuiButton
        fill
        size="s"
        color="secondary"
        onClick={() => setTableView(TableView.KEYS)}
        disabled={tableView === TableView.KEYS}
        className={cx(styles.textBtn, { [styles.activeBtn]: tableView === TableView.KEYS })}
        data-testid="btn-change-table-keys"
      >
        by Length
      </EuiButton>
      {tableView === TableView.MEMORY && (
        <Table
          data={topKeysMemory}
          defaultSortField="memory"
          delimiter={delimiter}
          dataTestid="top-keys-table-memory"
        />
      )}
      {tableView === TableView.KEYS && (
        <Table
          data={topKeysLength}
          defaultSortField="length"
          delimiter={delimiter}
          dataTestid="top-keys-table-length"
        />
      )}
    </div>
  )
}

export default TopKeys
