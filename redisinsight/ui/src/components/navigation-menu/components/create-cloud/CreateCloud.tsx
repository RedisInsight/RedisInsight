import React from 'react'
import cx from 'classnames'
import { EuiIcon, EuiLink, EuiToolTip } from '@elastic/eui'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import styles from '../../styles.module.scss'

const CreateCloud = () => {
  const onCLickLink = (isSSOEnabled: boolean) => {
    if (isSSOEnabled) return

    sendEventTelemetry({
      event: HELP_LINKS.cloud.event,
      eventData: {
        source: OAuthSocialSource.NavigationMenu
      }
    })
  }

  return (
    <EuiToolTip
      content="Create FREE trial Redis Cloud database"
      position="right"
    >
      <span className={cx(styles.iconNavItem)}>
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick, isSSOEnabled) => (
            <EuiLink
              external={false}
              onClick={(e) => {
                onCLickLink(isSSOEnabled)
                ssoCloudHandlerClick(e,
                  { source: OAuthSocialSource.NavigationMenu, action: OAuthSocialAction.Create })
              }}
              className={styles.cloudLink}
              href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: 'navigation_menu' })}
              target="_blank"
              data-test-subj="create-cloud-nav-link"
            >
              <EuiIcon
                className={styles.cloudIcon}
                type={CloudIcon}
                data-testid="cloud-db-icon"
              />
            </EuiLink>
          )}
        </OAuthSsoHandlerDialog>
      </span>
    </EuiToolTip>
  )
}

export default CreateCloud
