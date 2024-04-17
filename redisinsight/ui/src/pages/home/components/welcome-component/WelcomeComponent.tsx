import { EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiSpacer, EuiTitle } from '@elastic/eui'
import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import { isEmpty } from 'lodash'
import { FeatureFlags, Theme } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import { sendEventTelemetry, sendPageViewTelemetry, TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'
import Logo from 'uiSrc/assets/img/logo.svg'
import { ReactComponent as CloudStars } from 'uiSrc/assets/img/oauth/stars.svg'
import { ReactComponent as CloudIcon } from 'uiSrc/assets/img/oauth/cloud.svg'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { getContentByFeature } from 'uiSrc/utils/content'
import { AddDbType, HELP_LINKS, IHelpGuide } from 'uiSrc/pages/home/constants'
import { CapabilityPromotion } from 'uiSrc/pages/home/components/capability-promotion'

import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'
import { FeatureFlagComponent, ImportDatabasesDialog, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { getPathToResource } from 'uiSrc/services/resourcesService'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: (addDbType?: AddDbType) => void
}

const WelcomeComponent = ({ onAddInstance }: Props) => {
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
  const { loading, data } = useSelector(contentSelector)

  const [promoData, setPromoData] = useState<ContentCreateRedis>()
  const [guides, setGuides] = useState<IHelpGuide[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false)

  const { theme } = useContext(ThemeContext)

  setTitle('Welcome to Redis Insight')

  const CONNECT_BUTTONS = [
    {
      title: 'Connect Your Databases',
      buttons: [
        {
          title: 'Add connection details manually',
          description: (<>Enter host and port to connect to your Redis database</>),
          iconType: 'plus',
          onClick: () => onAddInstance(AddDbType.manual),
          testId: 'add-db-manually-btn'
        },
        {
          title: 'Auto-discover your Redis databases',
          description: 'Use discovery tools to add Redis Sentinel or Redis Enterprise databases',
          iconType: 'search',
          onClick: () => onAddInstance(AddDbType.auto),
          testId: 'add-db-auto-btn'
        },
      ]
    },
    {
      title: 'Import database connections',
      buttons: [
        {
          title: 'Import Redis Cloud database connections',
          description: 'Sign in to your Redis Cloud account to discover and add databases',
          iconType: CloudIcon,
          iconClassName: styles.cloudIcon,
          feature: FeatureFlags.cloudSso,
          testId: 'import-cloud-db-btn'
        },
        {
          title: 'Import database connections from a file',
          description: (<>Migrate your database connections to <br />Redis Insight</>),
          iconType: 'download',
          onClick: () => handleClickImportDbBtn(),
          testId: 'import-from-file-btn'
        },
      ]
    }
  ]

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.WELCOME_PAGE
    })
  }, [])

  useEffect(() => {
    if (loading || !data || isEmpty(data)) {
      return
    }

    if (data?.cloud && !isEmpty(data.cloud)) {
      setPromoData(getContentByFeature(data.cloud, featureFlags))
    }

    const items = Object.entries(data)
      .filter(([key]) => key.toLowerCase() !== 'cloud')
      .map(([key, item]) => {
        const { title, links, description } = getContentByFeature(item, featureFlags)
        return ({
          id: key,
          title,
          description,
          event: HELP_LINKS[key as keyof typeof HELP_LINKS]?.event,
          url: links?.main?.url,
        })
      })

    setGuides(items)
  }, [loading, data, featureFlags])

  const handleClickLink = (event: TelemetryEvent, eventData: any = {}) => {
    if (event) {
      sendEventTelemetry({ event, eventData })
    }
  }

  const handleClickImportDbBtn = () => {
    setIsImportDialogOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CLICKED,
    })
  }

  const handleCloseImportDb = (isCancelled: boolean) => {
    setIsImportDialogOpen(false)
    isCancelled && sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CANCELLED,
    })
  }

  const PromoButton = ({ content }: { content: ContentCreateRedis }) => {
    const { title, description, links, styles: stylesCss } = content
    // @ts-ignore
    const linkStyles = stylesCss ? stylesCss[theme] : {}

    return (
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (
          <a
            role="button"
            tabIndex={0}
            href={links?.main?.url || '#'}
            className={cx(styles.section, styles.btn, styles.promoButton)}
            onClick={(e) => {
              handleClickLink(HELP_LINKS.cloud.event, { source: OAuthSocialSource.WelcomeScreen })
              ssoCloudHandlerClick(e, { source: OAuthSocialSource.WelcomeScreen, action: OAuthSocialAction.Create })
            }}
            target="_blank"
            style={{
              ...linkStyles,
              backgroundImage: linkStyles?.backgroundImage
                ? `url(${getPathToResource(linkStyles.backgroundImage)})`
                : undefined
            }}
            data-testid="promo-btn"
            rel="noreferrer"
          >
            <EuiIcon className={styles.btnIcon} type={CloudStars} />
            <div className={styles.btnContent}>
              <div className={styles.btnTitle}>{title}</div>
              <div className={styles.btnText}>{description}</div>
            </div>
            <EuiIcon className={styles.arrowIcon} type="arrowRight" />
          </a>
        )}
      </OAuthSsoHandlerDialog>
    )
  }

  const renderButton = (
    { title, description, onClick, iconType, iconClassName, testId }: any,
    optionalOnClick?: (e: React.MouseEvent) => void
  ) => (
    <EuiFlexItem key={testId}>
      <div
        key={`btn-${testId}`}
        role="button"
        tabIndex={0}
        className={cx(styles.section, styles.btn)}
        onKeyDown={() => {}}
        onClick={(e) => {
          optionalOnClick?.(e)
          onClick?.()
        }}
        data-testid={testId}
      >
        <EuiIcon className={cx(styles.btnIcon, iconClassName)} type={iconType} />
        <div>
          <div className={styles.btnTitle}>{title}</div>
          <div className={styles.btnText}>{description}</div>
        </div>
        <EuiIcon className={styles.arrowIcon} type="arrowRight" />
      </div>
    </EuiFlexItem>
  )

  return (
    <ExplorePanelTemplate panelClassName={styles.explorePanel}>
      {isImportDialogOpen && <ImportDatabasesDialog onClose={handleCloseImportDb} />}
      <div className={cx(styles.welcome, theme === Theme.Dark ? styles.welcome_dark : styles.welcome_light)}>
        <div className={styles.content}>
          <EuiTitle size="m" className={styles.title} data-testid="welcome-page-title">
            <h4>Welcome to</h4>
          </EuiTitle>
          <img
            alt="logo"
            className={styles.logo}
            src={Logo}
          />

          <div className={styles.controls}>
            <div className={styles.controlsGroup}>
              <EuiTitle className={styles.controlsGroupTitle} size="s">
                <h5>Click & Learn</h5>
              </EuiTitle>
              <CapabilityPromotion
                mode="reduced"
                capabilityIds={['sq-intro', 'ds-json-intro', 'tf-intro', 'ds-prob-intro']}
                wrapperClassName={cx(styles.section, styles.capabilityPromotion)}
              />
            </div>
            <EuiTitle className={styles.addDbTitle} size="s"><span>Add Redis databases</span></EuiTitle>
            <div className={styles.controlsGroup}>
              <EuiTitle className={styles.controlsGroupTitle} size="s">
                <h5>Redis Cloud Database</h5>
              </EuiTitle>
              {promoData && (<PromoButton content={promoData} />)}
            </div>

            {CONNECT_BUTTONS.map(({ title, buttons }) => (
              <div className={styles.controlsGroup} key={`container-${title}`}>
                <EuiTitle className={styles.controlsGroupTitle} size="s">
                  <h5>{title}</h5>
                </EuiTitle>
                <EuiFlexGrid columns={2}>
                  {buttons.map((button: any) => {
                    if (button?.feature === FeatureFlags.cloudSso) {
                      return (
                        <FeatureFlagComponent key="cloudSsoComponent" name={FeatureFlags.cloudSso}>
                          <OAuthSsoHandlerDialog>
                            {(socialCloudHandlerClick) => (
                              <>
                                {renderButton(button, (e: React.MouseEvent) => {
                                  socialCloudHandlerClick(e, {
                                    source: OAuthSocialSource.WelcomeScreen,
                                    action: OAuthSocialAction.Create
                                  })
                                })}
                              </>
                            )}
                          </OAuthSsoHandlerDialog>
                        </FeatureFlagComponent>
                      )
                    }

                    return renderButton(button)
                  })}
                </EuiFlexGrid>
              </div>
            ))}
          </div>

          {!!guides.length && (
            <div className={styles.links} data-testid="guide-links">
              Follow the guides
              <EuiSpacer size="m" />
              <EuiFlexGroup key="guides" className={styles.otherGuides}>
                {guides
                  .map(({ id, url, title, event }) => (
                    <EuiFlexItem key={id} grow={false}>
                      <a
                        href={url}
                        onClick={() => handleClickLink(event as TelemetryEvent)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {title}
                      </a>
                    </EuiFlexItem>
                  ))}
              </EuiFlexGroup>
            </div>
          )}
        </div>
      </div>
    </ExplorePanelTemplate>
  )
}

export default WelcomeComponent
