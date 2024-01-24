import React, { useContext } from 'react'
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { ExternalLink, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { Theme } from 'uiSrc/constants'
import TelescopeDarkImg from 'uiSrc/assets/img/telescope-dark.svg'
import TelescopeLightImg from 'uiSrc/assets/img/telescope-light.svg'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  source?: OAuthSocialSource
  onClose?: () => void
}

const DatabaseNotOpened = (props: Props) => {
  const { source = OAuthSocialSource.Tutorials, onClose } = props

  const { theme } = useContext(ThemeContext)

  return (
    <div className={styles.wrapper} data-testid="database-not-opened-popover">
      <div>
        <EuiTitle size="xxs" className={styles.title}>
          <h5>Open a database</h5>
        </EuiTitle>
        <EuiSpacer size="s" />
        <>
          <EuiText color="subdued" size="s">
            Open your Redis database, or create a new database to get started.
          </EuiText>
          <EuiSpacer size="s" />
          <OAuthSsoHandlerDialog>
            {(ssoCloudHandlerClick) => (
              <ExternalLink
                iconSize="s"
                href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAINGS[source] ?? source })}
                onClick={(e: React.MouseEvent) => {
                  ssoCloudHandlerClick(e, source)
                  onClose?.()
                }}
                data-testid="tutorials-get-started-link"
              >
                Create a free Redis Cloud database
              </ExternalLink>
            )}
          </OAuthSsoHandlerDialog>
          <EuiSpacer size="xs" />
          <ExternalLink
            iconSize="s"
            href={getUtmExternalLink(EXTERNAL_LINKS.docker, { campaign: UTM_CAMPAINGS[source] ?? source })}
            data-testid="tutorials-docker-link"
          >
            Install using Docker
          </ExternalLink>
        </>
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

export default DatabaseNotOpened
