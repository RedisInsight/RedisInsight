import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiTitle } from '@elastic/eui'
import { Nullable } from 'uiSrc/utils'
import { TableView } from 'uiSrc/pages/databaseAnalysis'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import Table from './Table'
import Loader from '../table-loader'
import styles from '../../styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
}

const TopNamespaceView = (props: Props) => {
  const { data, loading } = props
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)

  if (loading) {
    return <Loader />
  }

  if (!data?.topMemoryNsp?.length && !data?.topKeysNsp?.length) {
    return null
  }

  return (
    <div className={styles.topNamespaceView}>
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
        delimiter={data?.delimiter ?? ''}
        dataTestid="nsp-table-memory"
      />
      )}
      {tableView === TableView.KEYS && (
        <Table
          data={data?.topKeysNsp ?? []}
          delimiter={data?.delimiter ?? ''}
          dataTestid="nsp-table-keys"
        />
      )}
    </div>
  )
}

export default TopNamespaceView
