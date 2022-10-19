import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiTitle } from '@elastic/eui'
import { Nullable } from 'uiSrc/utils'
import { TableView } from 'uiSrc/pages/databaseAnalysis'
import { TableLoader } from 'uiSrc/pages/databaseAnalysis/components'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import Table from './Table'
import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
}

const TopNamespace = (props: Props) => {
  const { data, loading } = props
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)

  if (loading) {
    return <TableLoader />
  }

  if (!data?.topMemoryNsp?.length && !data?.topKeysNsp?.length) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <EuiTitle className="section-title">
        <h4>TOP NAMESPACES</h4>
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
        by Number of Keys
      </EuiButton>
      {tableView === TableView.MEMORY && (
      <Table
        data={data?.topMemoryNsp ?? []}
        defaultSortField="memory"
        delimiter={data?.delimiter ?? ''}
        dataTestid="nsp-table-memory"
      />
      )}
      {tableView === TableView.KEYS && (
        <Table
          data={data?.topKeysNsp ?? []}
          defaultSortField="keys"
          delimiter={data?.delimiter ?? ''}
          dataTestid="nsp-table-keys"
        />
      )}
    </div>
  )
}

export default TopNamespace
