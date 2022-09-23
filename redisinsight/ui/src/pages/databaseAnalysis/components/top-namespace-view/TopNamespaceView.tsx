import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiTitle, EuiLoadingContent } from '@elastic/eui'

import NameSpacesTable from '../name-spaces-table'
import { NSPTable } from '../../constants'
import styles from '../../styles.module.scss'

export interface Props {
  data: any
  loading: boolean
}

const TopNamespaceView = (props: Props) => {
  const { data, loading } = props
  const [nspTable, setNspTable] = useState<NSPTable>(NSPTable.MEMORY)

  if (!data?.topMemoryNsp?.length || !data?.topKeysNsp?.length) {
    return null
  }

  return (
    <div>
      <EuiTitle className={styles.sectionTitle}>
        <h4>TOP NAMESPACES</h4>
      </EuiTitle>
      <EuiButton
        fill
        size="s"
        color="secondary"
        onClick={() => setNspTable(NSPTable.MEMORY)}
        disabled={nspTable === NSPTable.MEMORY}
        className={cx(styles.textBtn, { [styles.activeBtn]: nspTable === NSPTable.MEMORY })}
        data-testid="btn-change-mode-memory"
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
        data-testid="btn-change-mode-keys"
      >
        by Number of Keys
      </EuiButton>
      {loading
        ? (
          <div style={{ height: '380px' }} data-testid="nsp-table-loading">
            <EuiLoadingContent lines={4} />
          </div>
        ) : (
          <>
            {nspTable === NSPTable.MEMORY && (
            <NameSpacesTable
              data={data?.topMemoryNsp}
              delimiter={data?.delimiter}
              data-testid="nsp-table-memory"
            />
            )}
            {nspTable === NSPTable.KEYS && (
              <NameSpacesTable
                data={data?.topKeysNsp}
                delimiter={data?.delimiter}
                data-testid="nsp-table-keys"
              />
            )}
          </>
        )}
    </div>
  )
}

export default TopNamespaceView
