import React, { useCallback } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { BulkActionsType } from 'uiSrc/constants'
import { selectedBulkActionsSelector } from 'uiSrc/slices/browser/bulkActions'

import { getMatchType, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { keysSelector } from 'uiSrc/slices/browser/keys'

import { bulkActionsTypeTabs } from '../constants/bulk-type-options'
import styles from './styles.module.scss'

export interface Props {
  onChangeType: (id: BulkActionsType)=> void
}

const BulkActionsTabs = (props: Props) => {
  const { onChangeType } = props
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { filter, search } = useSelector(keysSelector)
  const { type } = useSelector(selectedBulkActionsSelector)

  const onSelectedTabChanged = (id: BulkActionsType) => {
    const eventData: Record<string, any> = {
      databaseId: instanceId,
      action: id
    }

    if (id === BulkActionsType.Delete) {
      eventData.filter = {
        match: (search && search !== DEFAULT_SEARCH_MATCH) ? getMatchType(search) : DEFAULT_SEARCH_MATCH,
        type: filter,
      }
    }

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData
    })
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
