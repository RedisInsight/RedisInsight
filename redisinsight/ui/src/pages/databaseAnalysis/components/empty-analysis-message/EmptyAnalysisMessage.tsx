import React from 'react'
import { EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  title: string
  text: string
  name?: string
}

const EmptyAnalysisMessage = (props: Props) => {
  const { title, text, name = '' } = props
  return (
    <div className={styles.container} data-testid={`empty-analysis-no-${name}`}>
      <div className={styles.content}>
        <EuiText className={styles.title}>{title}</EuiText>
        <EuiText className={styles.summary}>{text}</EuiText>
      </div>
    </div>
  )
}

export default EmptyAnalysisMessage
