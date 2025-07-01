import { EuiIcon } from '@elastic/eui'
import React from 'react'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'

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
      <Text color="subdued" size="s" data-testid="patterns-count">
        Patterns:&nbsp;{getChannelsCount()}{' '}
      </Text>
      <RiTooltip
        position="right"
        title={
          <span className={styles.appendIcon}>
            {channels
              ?.trim()
              .split(' ')
              .map((ch) => <p key={`${ch}`}>{ch}</p>)}
          </span>
        }
      >
        <EuiIcon
          type="iInCircle"
          style={{ cursor: 'pointer' }}
          data-testid="append-info-icon"
        />
      </RiTooltip>
    </div>
  )
}

export default PatternsInfo
