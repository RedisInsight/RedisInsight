import React from 'react'
import { EuiLink } from '@elastic/eui'
import { useHistory, useParams } from 'react-router-dom'
import { getRedirectionPage } from 'uiSrc/utils/routing'

import styles from './styles.module.scss'

export interface Props {
  url: string
  text: string
}

const RedisInsightLink = (props: Props) => {
  const { url, text } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()

    const href = getRedirectionPage(url, instanceId)
    if (href) {
      history.push(href)
      return
    }

    history.push('/')
  }

  return (
    <EuiLink
      color="text"
      external={false}
      href="/"
      onClick={handleLinkClick}
      className={styles.link}
      data-testid="redisinsight-link"
    >
      {text}
    </EuiLink>
  )
}

export default RedisInsightLink
