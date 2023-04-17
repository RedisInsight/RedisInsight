import React, { useEffect, useState } from 'react'
import { EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { isUndefined } from 'lodash'

import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { keysDataSelector } from 'uiSrc/slices/browser/keys'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import { bulkActionsDeleteOverviewSelector, bulkActionsDeleteSummarySelector } from 'uiSrc/slices/browser/bulkActions'
import BulkActionSummary from 'uiSrc/pages/browser/components/bulk-actions/BulkActionSummary'

import styles from './styles.module.scss'

const BulkDeleteSummary = () => {
  const [title, setTitle] = useState<string>('')
  const { scanned = 0, total = 0, keys } = useSelector(keysDataSelector)
  const { processed, succeed, failed } = useSelector(bulkActionsDeleteSummarySelector) ?? {}
  const { duration = 0, status } = useSelector(bulkActionsDeleteOverviewSelector) ?? {}

  useEffect(() => {
    if (scanned < total && !keys.length) {
      setTitle('Expected amount: N/A')
      return
    }

    const approximateCount = scanned < total ? (keys.length * total) / scanned : keys.length
    setTitle(`Expected amount: ${scanned < total ? '~' : ''}${nullableNumberWithSpaces(Math.round(approximateCount))} keys`)
  }, [scanned, total, keys])

  return (
    <div className={styles.container}>
      {isUndefined(status) && (
        <>
          <EuiText className={styles.title}>
            <span>{title}</span>
            <EuiToolTip
              position="right"
              anchorClassName={styles.tooltipAnchor}
              content="Expected amount is estimated based on
              the number of keys scanned and the scan percentage.
              The final number may be different."
            >
              <EuiIcon color="subdued" type="iInCircle" data-testid="bulk-delete-tooltip" />
            </EuiToolTip>
          </EuiText>
          <EuiText color="subdued" className={styles.summaryApproximate} data-testid="bulk-delete-summary">
            {`Scanned ${getApproximatePercentage(total, scanned)} `}
            {`(${numberWithSpaces(scanned)}/${nullableNumberWithSpaces(total)}) `}
            {`and found ${numberWithSpaces(keys.length)} keys`}
          </EuiText>
        </>
      )}
      {!isUndefined(status) && (
        <BulkActionSummary
          succeed={succeed}
          processed={processed}
          failed={failed}
          duration={duration}
          data-testid="bulk-delete-competed-summary"
        />
      )}
    </div>
  )
}

export default BulkDeleteSummary
