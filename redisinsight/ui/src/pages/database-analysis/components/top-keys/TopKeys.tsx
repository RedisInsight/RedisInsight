import React, { useState } from 'react'
import cx from 'classnames'
import { TableView } from 'uiSrc/pages/database-analysis'
import { Nullable } from 'uiSrc/utils'
import { TableLoader } from 'uiSrc/pages/database-analysis/components'
import { TextBtn } from 'uiSrc/pages/database-analysis/components/base/TextBtn'
import { Title } from 'uiSrc/components/base/text/Title'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import Table from './Table'
import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  delimiter?: string
}

const MAX_TOP_KEYS = 15
const TopKeys = ({ data, loading }: Props) => {
  const { topKeysLength = [], topKeysMemory = [], delimiter } = data || {}
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)

  if (loading) {
    return <TableLoader />
  }

  if (!topKeysLength?.length && !topKeysMemory?.length) {
    return null
  }

  return (
    <div className={cx('section', styles.wrapper)}>
      <div className="section-title-wrapper">
        <Title size="M" className="section-title" data-testid="top-keys-title">
          {topKeysLength.length < MAX_TOP_KEYS &&
          topKeysMemory?.length < MAX_TOP_KEYS
            ? 'TOP KEYS'
            : `TOP ${MAX_TOP_KEYS} KEYS`}
        </Title>
        <TextBtn
          $active={tableView === TableView.MEMORY}
          size="small"
          onClick={() => setTableView(TableView.MEMORY)}
          disabled={tableView === TableView.MEMORY}
          data-testid="btn-change-table-memory"
        >
          by Memory
        </TextBtn>
        <TextBtn
          $active={tableView === TableView.KEYS}
          size="small"
          onClick={() => setTableView(TableView.KEYS)}
          disabled={tableView === TableView.KEYS}
          data-testid="btn-change-table-keys"
        >
          by Length
        </TextBtn>
      </div>
      <div className="section-content">
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
    </div>
  )
}

export default TopKeys
