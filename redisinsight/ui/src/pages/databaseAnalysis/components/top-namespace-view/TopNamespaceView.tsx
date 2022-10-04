import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiTitle, EuiLoadingContent } from '@elastic/eui'
import { Nullable } from 'uiSrc/utils'
import { NSPTable } from 'uiSrc/constants'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import NameSpacesTable from '../name-spaces-table'
import styles from '../../styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
}

const TopNamespaceView = (props: Props) => {
  const { data, loading } = props
  const [nspTable, setNspTable] = useState<NSPTable>(NSPTable.MEMORY)

  if (!data?.topMemoryNsp?.length && !data?.topKeysNsp?.length && !loading) {
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
        onClick={() => setNspTable(NSPTable.MEMORY)}
        disabled={nspTable === NSPTable.MEMORY}
        className={cx(styles.textBtn, { [styles.activeBtn]: nspTable === NSPTable.MEMORY })}
        data-testid="btn-change-table-memory"
      >
        by Memory
      </EuiButton>
      <EuiButton
        fill
        size="s"
        color="secondary"
        onClick={() => setNspTable(NSPTable.KEYS)}
        disabled={nspTable === NSPTable.KEYS}
        className={cx(styles.textBtn, { [styles.activeBtn]: nspTable === NSPTable.KEYS })}
        data-testid="btn-change-table-keys"
      >
        by Number of Keys
      </EuiButton>
      {loading ? (
        <div style={{ height: '380px', marginTop: '18px' }} data-testid="nsp-table-loader">
          <EuiLoadingContent lines={4} />
        </div>
      ) : (
        <>
          {nspTable === NSPTable.MEMORY && (
          <NameSpacesTable
            data={data?.topMemoryNsp ?? []}
            delimiter={data?.delimiter ?? ''}
            dataTestid="nsp-table-memory"
          />
          )}
          {nspTable === NSPTable.KEYS && (
            <NameSpacesTable
              data={data?.topKeysNsp ?? []}
              delimiter={data?.delimiter ?? ''}
              dataTestid="nsp-table-keys"
            />
          )}
        </>
      )}
    </div>
  )
}

export default TopNamespaceView
