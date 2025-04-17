import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiButton, EuiLink } from '@elastic/eui'
import { useHistory } from 'react-router-dom'
import {
  FeatureFlags,
  MODULE_NOT_LOADED_CONTENT as CONTENT,
  Pages,
} from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import styles from 'uiSrc/components/messages/module-not-loaded/styles.module.scss'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'

export interface IProps {
  moduleName: RedisDefaultModules
  module?: String
  onClose?: () => void
  type?: 'workbench' | 'browser'
}

const ModuleNotLoadedButton = ({
  moduleName,
  type,
  onClose,
  module,
}: IProps) => {
  const history = useHistory()
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const utmCampaign =
    type === 'browser'
      ? UTM_CAMPAINGS[OAuthSocialSource.BrowserSearch]
      : UTM_CAMPAINGS[OAuthSocialSource.Workbench]

  if (!envDependentFeature?.flag) {
    return null
  }

  return (
    <>
      <EuiLink
        className={cx(styles.text, styles.link)}
        external={false}
        target="_blank"
        href={getUtmExternalLink(CONTENT[moduleName]?.link, {
          campaign: utmCampaign,
        })}
        data-testid="learn-more-link"
      >
        Learn More
      </EuiLink>
      <FeatureFlagComponent
        name={FeatureFlags.cloudAds}
        otherwise={
          <EuiLink
            className={styles.link}
            external={false}
            target="_blank"
            href=""
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              history.push(Pages.home)
            }}
            data-testid="get-started-link"
          >
            <EuiButton
              fill
              size="s"
              color="secondary"
              className={styles.btnLink}
            >
              Redis Databases page
            </EuiButton>
          </EuiLink>
        }
      >
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <EuiLink
              className={styles.link}
              external={false}
              target="_blank"
              href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                campaign: utmCampaign,
              })}
              onClick={(e) => {
                ssoCloudHandlerClick(e, {
                  source:
                    type === 'browser'
                      ? OAuthSocialSource.BrowserSearch
                      : OAuthSocialSource[
                          module as keyof typeof OAuthSocialSource
                        ],
                  action: OAuthSocialAction.Create,
                })
                onClose?.()
              }}
              data-testid="get-started-link"
            >
              <EuiButton
                fill
                size="s"
                color="secondary"
                className={styles.btnLink}
              >
                Get Started For Free
              </EuiButton>
            </EuiLink>
          )}
        </OAuthSsoHandlerDialog>
      </FeatureFlagComponent>
    </>
  )
}

export default ModuleNotLoadedButton
