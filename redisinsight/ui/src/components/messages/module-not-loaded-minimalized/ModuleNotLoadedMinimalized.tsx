import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { EuiIcon, EuiLink, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

import TelescopeDarkImg from 'uiSrc/assets/img/telescope-dark.svg'
import TelescopeLightImg from 'uiSrc/assets/img/telescope-light.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { freeInstanceSelector } from 'uiSrc/slices/instances/instances'

import { Theme } from 'uiSrc/constants'
import { OAuthConnectFreeDb, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { MODULE_CAPABILITY_TEXT_NOT_AVAILABLE } from './constants'
import styles from './styles.module.scss'

export interface Props {
  moduleName: RedisDefaultModules
  source: OAuthSocialSource
  telemetrySource?: string
  onClose?: () => void
}

const ModuleNotLoadedMinimalized = (props: Props) => {
  const { moduleName, source, telemetrySource, onClose } = props
  const freeInstance = useSelector(freeInstanceSelector)

  const { theme } = useContext(ThemeContext)
  const moduleText = MODULE_CAPABILITY_TEXT_NOT_AVAILABLE[moduleName]

  return (
    <div className={styles.wrapper}>
      <div>
        <EuiTitle size="xxs" className={styles.title}>
          <h5>{moduleText?.title}</h5>
        </EuiTitle>
        <EuiSpacer size="s" />
        {!freeInstance && (
          <>
            <EuiText color="subdued" size="s">
              {moduleText?.text}
            </EuiText>
            <EuiSpacer size="s" />
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <EuiLink
                  external={false}
                  target="_blank"
                  href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAINGS[source] ?? source })}
                  onClick={(e) => {
                    ssoCloudHandlerClick(e, source, telemetrySource)
                    onClose?.()
                  }}
                  data-testid="tutorials-get-started-link"
                >
                  Start with Cloud for free
                  <EuiIcon type="sortUp" size="s" className={styles.externalLinkIcon} />
                </EuiLink>
              )}
            </OAuthSsoHandlerDialog>
            <EuiSpacer size="xs" />
            <EuiLink
              external={false}
              target="_blank"
              href={getUtmExternalLink(EXTERNAL_LINKS.docker, { campaign: UTM_CAMPAINGS[source] ?? source })}
              data-testid="tutorials-docker-link"
            >
              Start with Docker
              <EuiIcon type="sortUp" size="s" className={styles.externalLinkIcon} />
            </EuiLink>
          </>
        )}
        {!!freeInstance && (
          <>
            <EuiText color="subdued" size="s">
              Use your free all-in-one Redis Enterprise Cloud database to start exploring these capabilities.
            </EuiText>
            <EuiSpacer size="s" />
            <OAuthConnectFreeDb
              source={`${moduleName}_tutorial`}
            />
          </>
        )}
      </div>
      <img
        src={theme === Theme.Dark ? TelescopeDarkImg : TelescopeLightImg}
        className={styles.img}
        alt="telescope"
        loading="lazy"
      />
    </div>
  )
}

export default ModuleNotLoadedMinimalized
