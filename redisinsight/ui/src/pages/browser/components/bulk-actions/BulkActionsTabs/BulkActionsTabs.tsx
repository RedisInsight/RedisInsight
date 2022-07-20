import React, { useCallback } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { BulkActionsType } from 'uiSrc/constants'
import { selectedBulkActionsSelector } from 'uiSrc/slices/browser/bulkActions'

import { bulkActionsTypeTabs } from '../constants/bulk-type-options'
import styles from './styles.module.scss'

export interface Props {
  onChangeType: (id: BulkActionsType)=> void
}

const BulkActionsTabs = (props: Props) => {
  const { onChangeType } = props
  const { type } = useSelector(selectedBulkActionsSelector)

  const onSelectedTabChanged = (id: BulkActionsType) => {
    onChangeType(id)
  }

  const renderTabs = useCallback(() => [...bulkActionsTypeTabs].map(({ id, label, separator = '' }) => (
    <div key={id}>
      {separator}
      <EuiTab
        isSelected={type === id}
        onClick={() => onSelectedTabChanged(id)}
        key={id}
        data-testid={`bulk-action-tab-${id}`}
        className={styles.tab}
      >
        {label}
      </EuiTab>
    </div>
  )), [type])

  return (
    <div className={styles.container}>
      <EuiTabs className={styles.tabs} data-test-subj="bulk-actions-tabs">{renderTabs()}</EuiTabs>
    </div>

  )
}

export default BulkActionsTabs
