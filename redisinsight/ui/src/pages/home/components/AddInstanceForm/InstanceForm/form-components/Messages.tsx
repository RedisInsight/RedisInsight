import React from 'react'
import { EuiLink, EuiText } from '@elastic/eui'
import { APPLICATION_NAME } from 'uiSrc/constants'

import styles from '../styles.module.scss'

const MessageStandalone = () => (
  <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
    You can manually add your Redis databases. Enter Host and Port of your
    Redis database to add it to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <EuiLink
      color="text"
      href="https://docs.redis.com/latest/ri/using-redisinsight/add-instance/"
      className={styles.link}
      external={false}
      target="_blank"
    >
      Learn more here.
    </EuiLink>
  </EuiText>
)

const MessageSentinel = () => (
  <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
    You can automatically discover and add primary groups from your Redis
    Sentinel. Enter Host and Port of your Redis Sentinel to automatically
    discover your primary groups and add them to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <EuiLink
      color="text"
      href="https://redis.io/topics/sentinel"
      className={styles.link}
      external={false}
      target="_blank"
    >
      Learn more here.
    </EuiLink>
  </EuiText>
)

export {
  MessageStandalone,
  MessageSentinel,
}
