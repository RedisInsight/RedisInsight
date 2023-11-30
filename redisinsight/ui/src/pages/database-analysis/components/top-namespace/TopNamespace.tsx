import { EuiButton, EuiLink, EuiSwitch, EuiTitle } from '@elastic/eui'
import { isNull } from 'lodash'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'
import { DEFAULT_EXTRAPOLATION, SectionName, TableView } from 'uiSrc/pages/database-analysis'
import { TableLoader } from 'uiSrc/pages/database-analysis/components'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { changeKeyViewType } from 'uiSrc/slices/browser/keys'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
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

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    setIsExtrapolated(extrapolation !== DEFAULT_EXTRAPOLATION)
  }, [data, extrapolation])

  if (loading) {
    return <TableLoader />
  }

  if (isNull(data)) {
    return null
  }

  const handleTreeViewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    dispatch(resetBrowserTree())
    dispatch(changeKeyViewType(KeyViewType.Tree))
    history.push(Pages.browser(instanceId))
  }

  if (!data?.topMemoryNsp || data?.totalKeys?.total === 0) {
    return null
  }

  if (!data?.topMemoryNsp?.length && !data?.topKeysNsp?.length) {
    return (
      <div className={cx('section', styles.wrapper)} data-testid="top-namespaces-empty">
        <div className="section-title-wrapper">
          <EuiTitle className="section-title">
            <h4>TOP NAMESPACES</h4>
          </EuiTitle>
        </div>
        <div className="section-content" data-testid="top-namespaces-message">
          <div className={styles.noNamespaceMsg}>
            <EuiTitle size="xs">
              <span>No namespaces to display</span>
            </EuiTitle>
            <p>
              {'Configure the delimiter in '}
              <EuiLink
                color="text"
                onClick={handleTreeViewClick}
                data-testid="tree-view-page-link"
              >
                Tree View
              </EuiLink>
              {' to customize the namespaces displayed.'}
            </p>
          </div>
        </div>
      </div>
    )
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
      <div className="section-content">
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
    </div>
  )
}

export default TopNamespace
