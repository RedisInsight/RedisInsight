import React from 'react'

import { EuiIcon, EuiText, EuiTitle, EuiSpacer, EuiLink, EuiButton } from '@elastic/eui'
import { useSelector } from 'react-redux'
import RedisDbBlueIcon from 'uiSrc/assets/img/icons/redis_db_blue.svg'

import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthConnectFreeDb, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'

import styles from './styles.module.scss'

const utm = {
  medium: 'main',
  campaign: UTM_CAMPAINGS[CloudSsoUtmCampaign.BrowserFilter],
}

const FilterNotAvailable = ({ onClose } : { onClose?: () => void }) => {
  const { freeInstance } = useSelector(instancesSelector)
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
      {!!freeInstance && (
        <>
          <EuiText color="subdued">
            Use your free all-in-one Redis Cloud database to start exploring these capabilities.
          </EuiText>
          <EuiSpacer size="l" />
          <OAuthConnectFreeDb source={OAuthSocialSource.BrowserFiltering} onSuccessClick={onClose} />
        </>
      )}
      {!freeInstance && (
        <>
          <EuiText color="subdued">
            Create a free Redis Stack database that supports filtering and extends
            the core capabilities of open-source Redis.
          </EuiText>
          <EuiSpacer size="l" />
          <div className={styles.linksWrapper}>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <EuiButton
                  fill
                  color="secondary"
                  target="_blank"
                  href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, utm)}
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
              href={getUtmExternalLink(EXTERNAL_LINKS.redisStack, utm)}
              data-testid="learn-more-link"
            >
              Learn More
            </EuiLink>
          </div>
        </>
      )}
    </div>
  )
}

export default FilterNotAvailable
