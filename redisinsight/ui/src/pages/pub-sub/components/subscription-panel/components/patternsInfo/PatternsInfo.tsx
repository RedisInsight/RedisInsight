import { EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import React from 'react'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import styles from './styles.module.scss'

export interface PatternsInfoProps {
  channels?: string
}

const PatternsInfo = ({ channels }: PatternsInfoProps) => {
  const getChannelsCount = () => {
    if (!channels || channels?.trim() === DEFAULT_SEARCH_MATCH) return 'All'
    return channels.trim().split(' ').length
  }

  return (
    <div className={styles.patternsContainer}>
      <EuiText color="subdued" size="s" data-testid="patterns-count">Patterns:&nbsp;{getChannelsCount()} </EuiText>
      <EuiToolTip
        anchorClassName={styles.appendIcon}
        position="right"
        title={<>{channels?.trim().split(' ').map((ch) => <p key={`${ch}`}>{ch}</p>)}</>}
      >
        <EuiIcon
          type="iInCircle"
          style={{ cursor: 'pointer' }}
          data-testid="append-info-icon"
        />
      </EuiToolTip>
    </div>
  )
}

export default PatternsInfo
