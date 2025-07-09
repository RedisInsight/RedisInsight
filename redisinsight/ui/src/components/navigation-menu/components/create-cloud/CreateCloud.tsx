import React from 'react'
import cx from 'classnames'
import { EuiIcon } from '@elastic/eui'

import {
  FeatureFlagComponent,
  OAuthSsoHandlerDialog,
  RiTooltip,
} from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import { FeatureFlags } from 'uiSrc/constants'
import { Link } from 'uiSrc/components/base/link/Link'
import styles from '../../styles.module.scss'

const CreateCloud = () => {
  const onCLickLink = (isSSOEnabled: boolean) => {
    if (isSSOEnabled) return

    sendEventTelemetry({
      event: HELP_LINKS.cloud.event,
      eventData: {
        source: OAuthSocialSource.NavigationMenu,
      },
    })
  }

  return (
    <FeatureFlagComponent name={FeatureFlags.cloudAds}>
      <RiTooltip
        content="Create FREE trial Redis Cloud database"
        position="right"
      >
        <span className={cx(styles.iconNavItem)}>
          <OAuthSsoHandlerDialog>
            {(ssoCloudHandlerClick, isSSOEnabled) => (
              <Link
                onClick={(e) => {
                  onCLickLink(isSSOEnabled)
                  ssoCloudHandlerClick(e, {
                    source: OAuthSocialSource.NavigationMenu,
                    action: OAuthSocialAction.Create,
                  })
                }}
                className={styles.cloudLink}
                href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                  campaign: 'navigation_menu',
                })}
                target="_blank"
                data-test-subj="create-cloud-nav-link"
              >
                <EuiIcon
                  className={styles.cloudIcon}
                  type={CloudIcon}
                  data-testid="cloud-db-icon"
                />
              </Link>
            )}
          </OAuthSsoHandlerDialog>
        </span>
      </RiTooltip>
    </FeatureFlagComponent>
  )
}

export default CreateCloud
