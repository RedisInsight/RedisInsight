import React from 'react'

import { EuiIcon, EuiText, EuiTitle, EuiSpacer, EuiLink, EuiButton } from '@elastic/eui'
import RedisDbBlueIcon from 'uiSrc/assets/img/icons/redis_db_blue.svg'

import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import styles from './styles.module.scss'

const GET_STARTED_LINK = 'https://redis.com/try-free/?utm_source=redisinsight&utm_medium=main&utm_campaign=browser_filter'
const LEARN_MORE_LINK = 'https://redis.io/docs/stack/about/?utm_source=redisinsight&utm_medium=main&utm_campaign=browser_filter'

const FilterNotAvailable = ({ onClose } : { onClose?: () => void }) => {
  const onFreeDatabaseClick = () => {
    onClose?.()
  }
  return (
    <div className={styles.container}>
      <EuiIcon type={RedisDbBlueIcon} size="original" />
      <EuiTitle size="m" className={styles.title} data-testid="filter-not-available-title">
        <h4>Upgrade your Redis database to version 6 or above</h4>
      </EuiTitle>
      <EuiText>Filtering by data type is supported in Redis 6 and above.</EuiText>
      <EuiSpacer size="m" />
      <EuiText color="subdued">Create a free Redis Stack database that supports filtering and extends the core capabilities of open-source Redis.</EuiText>
      <EuiSpacer size="l" />
      <div className={styles.linksWrapper}>
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <EuiButton
              fill
              color="secondary"
              target="_blank"
              href={GET_STARTED_LINK}
              onClick={(e) => {
                ssoCloudHandlerClick(e, OAuthSocialSource.BrowserFiltering)
                onFreeDatabaseClick()
              }}
              data-testid="get-started-link"
              size="s"
            >
              Get Started For Free
            </EuiButton>
          )}
        </OAuthSsoHandlerDialog>
        <EuiSpacer size="m" />
        <EuiLink
          className={styles.link}
          external={false}
          target="_blank"
          color="text"
          href={LEARN_MORE_LINK}
          data-testid="learn-more-link"
        >
          Learn More
        </EuiLink>
      </div>
    </div>
  )
}

export default FilterNotAvailable
