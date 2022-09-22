import React from 'react'
import { EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  title: string
  text: string
}

const EmptyAnalysisMessage = (props: Props) => {
  const { title, text } = props
  return (
    <div className={styles.container} data-testid="empty-analysis">
      <div className={styles.content}>
        <EuiText className={styles.title}>{title}</EuiText>
        <EuiText className={styles.summary}>{text}</EuiText>
      </div>
    </div>
  )
}

export default EmptyAnalysisMessage
