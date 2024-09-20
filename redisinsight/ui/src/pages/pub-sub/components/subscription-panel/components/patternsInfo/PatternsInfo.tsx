import { EuiText } from '@elastic/eui'
import React from 'react'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import AppendInfo from '../append-info'

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
      <EuiText color="subdued" size="s" data-testid="messages-count">Patterns:&nbsp;{getChannelsCount()} </EuiText>
      <AppendInfo title={<>{channels?.trim().split(' ').map((ch) => <p>{ch}</p>)}</>} />
    </div>
  )
}

export default PatternsInfo
