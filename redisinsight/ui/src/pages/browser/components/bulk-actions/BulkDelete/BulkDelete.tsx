import React, { useEffect, useState } from 'react'
import { EuiText } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { isUndefined } from 'lodash'
import {
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { keysSelector } from 'uiSrc/slices/browser/keys'

import BulkDeleteFooter from './BulkDeleteFooter'
import BulkDeleteSummary from './BulkDeleteSummary'
import BulkActionsInfo from '../BulkActionsInfo'

import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const BulkDelete = (props: Props) => {
  const { onCancel } = props
  const { filter, search, isSearched, isFiltered } = useSelector(keysSelector)
  const { loading } = useSelector(bulkActionsDeleteSelector)
  const {
    status,
    filter: { match, type: filterType },
    progress
  } = useSelector(bulkActionsDeleteOverviewSelector) ?? { filter: {} }
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(!isSearched && !isFiltered)

  useEffect(() => {
    setShowPlaceholder(!status && !isSearched && !isFiltered)
  }, [status, isSearched, isFiltered])

  return (
    <>
      {!showPlaceholder && (
        <>
          <BulkActionsInfo
            search={match || search || '*'}
            loading={loading}
            filter={isUndefined(filterType) ? filter : filterType}
            status={status}
            progress={progress}
          >
            <BulkDeleteSummary />
          </BulkActionsInfo>
          <BulkDeleteFooter onCancel={onCancel} />
        </>
      )}
      {showPlaceholder && (
        <div className={styles.placeholder} data-testid="bulk-actions-placeholder">
          <EuiText color="subdued" className={styles.placeholderTitle}>No pattern or key type set</EuiText>
          <EuiText color="subdued" className={styles.placeholderSummary}>
            To perform a bulk action, set the pattern or select the key type
          </EuiText>
        </div>
      )}
    </>
  )
}

export default BulkDelete
