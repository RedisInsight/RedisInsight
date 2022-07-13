import React, { useEffect, useState } from 'react'
import { EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { keysDataSelector } from 'uiSrc/slices/browser/keys'
import styles from './styles.module.scss'

const getApproximateNumber = (number: number) => (number < 1 ? '<1' : Math.round(number))

const BulkDeleteSummary = () => {
  const [title, setTitle] = useState<string>('')
  const { scanned = 0, total = 0, keys } = useSelector(keysDataSelector)

  useEffect(() => {
    const approximateCount = scanned >= total ? scanned : (keys.length * total) / scanned
    setTitle(`Expected amount: ${scanned < total ? '~' : ''}${Math.round(approximateCount)} keys`)
  }, [scanned, total])

  const onClickTitle = () => {

  }

  return (
    <div className={styles.container}>
      <EuiText className={styles.title} onClick={onClickTitle}>
        <span>{title}</span>
        <EuiToolTip
          position="right"
          anchorClassName={styles.tooltipAnchor}
          content="Expected amount is estimated based on
              the number of keys scanned and the scan percentage.
              The final number may be different."
        >
          <EuiIcon color="subdued" type="iInCircle" />
        </EuiToolTip>
      </EuiText>
      <EuiText color="subdued" className={styles.summary} data-testid="bulk-delete-summary">
        {`Scanned ${getApproximateNumber((total ? scanned / total : 1) * 100)}% `}
        {`(${scanned}/${total}) `}
        {`and found ${keys.length} keys`}
      </EuiText>
    </div>
  )
}

export default BulkDeleteSummary
