import { EuiButton, EuiSwitch, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { DEFAULT_EXTRAPOLATION, SectionName, TableView } from 'uiSrc/pages/databaseAnalysis'
import { TableLoader } from 'uiSrc/pages/databaseAnalysis/components'
import { Nullable } from 'uiSrc/utils'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import Table from './Table'
import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  extrapolation: number
  onSwitchExtrapolation?: (value: boolean, section: SectionName) => void
}

const TopNamespace = (props: Props) => {
  const { data, loading, extrapolation, onSwitchExtrapolation } = props
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)
  const [isExtrapolated, setIsExtrapolated] = useState<boolean>(true)

  useEffect(() => {
    setIsExtrapolated(extrapolation !== DEFAULT_EXTRAPOLATION)
  }, [data, extrapolation])

  if (loading) {
    return <TableLoader />
  }

  if (!data?.topMemoryNsp?.length && !data?.topKeysNsp?.length) {
    return null
  }

  return (
    <div className={cx('section', styles.wrapper)} data-testid="top-namespaces">
      <div className="section-title-wrapper">
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
        {extrapolation !== DEFAULT_EXTRAPOLATION && (
          <EuiSwitch
            compressed
            color="subdued"
            className="switch-extrapolate-results"
            label="Extrapolate results"
            checked={isExtrapolated}
            onChange={(e) => {
              setIsExtrapolated(e.target.checked)
              onSwitchExtrapolation?.(e.target.checked, SectionName.TOP_NAMESPACES)
            }}
            data-testid="extrapolate-results"
          />
        )}
      </div>
      {tableView === TableView.MEMORY && (
      <Table
        data={data?.topMemoryNsp ?? []}
        defaultSortField="memory"
        delimiter={data?.delimiter ?? ''}
        isExtrapolated={isExtrapolated}
        extrapolation={extrapolation}
        dataTestid="nsp-table-memory"
      />
      )}
      {tableView === TableView.KEYS && (
        <Table
          data={data?.topKeysNsp ?? []}
          defaultSortField="keys"
          delimiter={data?.delimiter ?? ''}
          isExtrapolated={isExtrapolated}
          extrapolation={extrapolation}
          dataTestid="nsp-table-keys"
        />
      )}
    </div>
  )
}

export default TopNamespace
