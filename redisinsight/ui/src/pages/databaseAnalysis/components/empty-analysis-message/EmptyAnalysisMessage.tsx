import React from 'react'
import { EuiText, EuiLink } from '@elastic/eui'
import { useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'

import styles from './styles.module.scss'

export interface Props {
  name: string
}

const getTitleContent = (name: string) => {
  if (name === 'reports') {
    return 'No Reports found'
  }

  if (name === 'keys') {
    return 'No keys to display'
  }

  return ''
}

const getTextContent = (name: string, path: string) => {
  if (name === 'reports') {
    return 'Run "New Analysis" to generate first report'
  }

  if (name === 'keys') {
    return (
      <>
        <EuiLink
          {...getRouterLinkProps(path)}
          className={styles.summary}
          data-test-subj="workbench-page-btn"
        >
          Use Workbench Guides and Tutorials
        </EuiLink>
        {' to quickly load the data.'}
      </>
    )
  }

  return ''
}

const EmptyAnalysisMessage = (props: Props) => {
  const { name } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  return (
    <div className={styles.container} data-testid={`empty-analysis-no-${name}`}>
      <div className={styles.content}>
        <EuiText className={styles.title}>{getTitleContent(name)}</EuiText>
        <EuiText className={styles.summary}>{getTextContent(name, Pages.workbench(instanceId))}</EuiText>
      </div>
    </div>
  )
}

export default EmptyAnalysisMessage
