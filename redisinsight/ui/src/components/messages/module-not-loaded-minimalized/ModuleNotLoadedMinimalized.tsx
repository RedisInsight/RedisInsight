import React from 'react'
import { useSelector } from 'react-redux'
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg'
import { OAuthSocialAction, OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'

import { ExternalLink, FeatureFlagComponent, OAuthConnectFreeDb, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { getDbWithModuleLoaded, getSourceTutorialByCapability } from 'uiSrc/utils'
import { useCapability } from 'uiSrc/services'
import { FeatureFlags } from 'uiSrc/constants'
import { MODULE_CAPABILITY_TEXT_NOT_AVAILABLE } from './constants'
import styles from './styles.module.scss'

export interface Props {
  moduleName: RedisDefaultModules
  source: OAuthSocialSource
  onClose?: () => void
}

const ModuleNotLoadedMinimalized = (props: Props) => {
  const { moduleName, source, onClose } = props
  const freeInstances = useSelector(freeInstancesSelector) || []

  const sourceTutorial = getSourceTutorialByCapability(moduleName)
  const moduleText = MODULE_CAPABILITY_TEXT_NOT_AVAILABLE[moduleName]
  const freeDbWithModule = getDbWithModuleLoaded(freeInstances, moduleName)

  useCapability(sourceTutorial)

  return (
    <div className={styles.wrapper} data-testid="module-not-loaded-popover">
      <div>
        <EuiTitle size="xxs" className={styles.title}>
          <h5>{moduleText?.title}</h5>
        </EuiTitle>
        <EuiSpacer size="s" />
        {!freeDbWithModule && (
          <>
            <EuiText color="subdued" size="s">
              {moduleText?.text}
            </EuiText>
            <EuiSpacer size="s" />
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <ExternalLink
                  iconSize="s"
                  href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAINGS[source] ?? source })}
                  onClick={(e: React.MouseEvent) => {
                    ssoCloudHandlerClick(e, {
                      source,
                      action: OAuthSocialAction.Create
                    }, `${moduleName}_${source}`)
                    onClose?.()
                  }}
                  data-testid="tutorials-get-started-link"
                >
                  Start with Cloud for free
                </ExternalLink>
              )}
            </OAuthSsoHandlerDialog>
            <FeatureFlagComponent name={FeatureFlags.envDependent}>
              <>
                <EuiSpacer size="xs" />
                <ExternalLink
                  iconSize="s"
                  href={getUtmExternalLink(EXTERNAL_LINKS.docker, { campaign: UTM_CAMPAINGS[source] ?? source })}
                  data-testid="tutorials-docker-link"
                >
                  Start with Docker
                </ExternalLink>
              </>
            </FeatureFlagComponent>
          </>
        )}
        {!!freeDbWithModule && (
          <>
            <EuiText color="subdued" size="s">
              Use your free trial all-in-one Redis Cloud database to start exploring these capabilities.
            </EuiText>
            <EuiSpacer size="s" />
            <OAuthConnectFreeDb
              id={freeDbWithModule.id}
              source={sourceTutorial}
            />
          </>
        )}
      </div>
      <img
        src={TelescopeImg}
        className={styles.img}
        alt="telescope"
        loading="lazy"
      />
    </div>
  )
}

export default ModuleNotLoadedMinimalized
