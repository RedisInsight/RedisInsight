import React from 'react'

import { EuiButton, EuiIcon, EuiLink, EuiText, EuiTitle } from '@elastic/eui'
import { useSelector } from 'react-redux'
import RedisDbBlueIcon from 'uiSrc/assets/img/icons/redis_db_blue.svg'

import {
  CloudSsoUtmCampaign,
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/slices/interfaces'
import {
  FeatureFlagComponent,
  OAuthConnectFreeDb,
  OAuthSsoHandlerDialog,
} from 'uiSrc/components'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { FeatureFlags } from 'uiSrc/constants'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from './styles.module.scss'

const utm = {
  medium: 'main',
  campaign: UTM_CAMPAINGS[CloudSsoUtmCampaign.BrowserFilter],
}

const FilterNotAvailable = ({ onClose }: { onClose?: () => void }) => {
  const freeInstances = useSelector(freeInstancesSelector) || []
  const onFreeDatabaseClick = () => {
    onClose?.()
  }
  return (
    <div className={styles.container}>
      <EuiIcon type={RedisDbBlueIcon} size="original" />
      <EuiTitle
        size="m"
        className={styles.title}
        data-testid="filter-not-available-title"
      >
        <h4>Upgrade your Redis database to version 6 or above</h4>
      </EuiTitle>
      <EuiText>
        Filtering by data type is supported in Redis 6 and above.
      </EuiText>
      <Spacer size="m" />
      {!!freeInstances.length && (
        <>
          <EuiText color="subdued">
            Use your free trial all-in-one Redis Cloud database to start
            exploring these capabilities.
          </EuiText>
          <Spacer />
          <OAuthConnectFreeDb
            id={freeInstances[0].id}
            source={OAuthSocialSource.BrowserFiltering}
            onSuccessClick={onClose}
          />
        </>
      )}
      {!freeInstances.length && (
        <FeatureFlagComponent name={FeatureFlags.cloudAds}>
          <EuiText color="subdued">
            Create a free trial Redis Stack database that supports filtering and
            extends the core capabilities of your Redis.
          </EuiText>
          <Spacer size="l" />
          <div className={styles.linksWrapper}>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <EuiButton
                  fill
                  color="secondary"
                  target="_blank"
                  href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, utm)}
                  onClick={(e) => {
                    ssoCloudHandlerClick(e, {
                      source: OAuthSocialSource.BrowserFiltering,
                      action: OAuthSocialAction.Create,
                    })
                    onFreeDatabaseClick()
                  }}
                  data-testid="get-started-link"
                  size="s"
                >
                  Get Started For Free
                </EuiButton>
              )}
            </OAuthSsoHandlerDialog>
            <Spacer size="m" />
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
        </FeatureFlagComponent>
      )}
    </div>
  )
}

export default FilterNotAvailable
