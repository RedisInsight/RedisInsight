import React, { useContext, useEffect, useState } from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { ImportDatabasesDialog, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import HelpLinksMenu from 'uiSrc/pages/home/components/help-links-menu'
import PromoLink from 'uiSrc/components/promo-link/PromoLink'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { HELP_LINKS, IHelpGuide } from 'uiSrc/pages/home/constants/help-links'
import { getPathToResource } from 'uiSrc/services/resourcesService'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { getContentByFeature } from 'uiSrc/utils/content'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import CapabilityPromotion from 'uiSrc/pages/home/components/capability-promotion'
import SearchDatabasesList from '../search-databases-list'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
  direction: 'column' | 'row'
}

const CREATE_DATABASE = 'CREATE DATABASE'
const THE_GUIDES = 'THE GUIDES'

const HomeHeader = ({ onAddInstance, direction }: Props) => {
  const { theme } = useContext(ThemeContext)
  const { data: instances } = useSelector(instancesSelector)
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
  const { loading, data } = useSelector(contentSelector)

  const [promoData, setPromoData] = useState<ContentCreateRedis>()
  const [guides, setGuides] = useState<IHelpGuide[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (loading || !data || isEmpty(data)) {
      return
    }

    if (data?.cloud && !isEmpty(data.cloud)) {
      setPromoData(getContentByFeature(data.cloud, featureFlags))
    }

    const items = Object.entries(data)
      .map(([key, item]) => {
        const { title, links, description } = getContentByFeature(item, featureFlags)
        return ({
          id: key,
          title,
          description,
          event: HELP_LINKS[key as keyof typeof HELP_LINKS]?.event,
          url: links?.main?.url,
          primary: key.toLowerCase() === 'cloud',
        })
      })

    setGuides(items)
  }, [loading, data, featureFlags])

  const handleOnAddDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
    })
    onAddInstance()
  }

  const handleClickLink = (event: TelemetryEvent, eventData: any = {}) => {
    if (event) {
      sendEventTelemetry({
        event,
        eventData: {
          ...eventData
        }
      })
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

  const handleCreateDatabaseClick = (
    event: TelemetryEvent,
    eventData: any = {},
  ) => {
    handleClickLink(event, eventData)
  }

  const AddInstanceBtn = () => (
    <>
      <EuiButton
        fill
        color="secondary"
        onClick={handleOnAddDatabase}
        className={styles.addInstanceBtn}
        data-testid="add-redis-database-short"
      >
        <span className={cx('eui-showFor--s', 'eui-showFor--xs')}>+ ADD DATABASE</span>
        <span className={cx('eui-hideFor--s', 'eui-hideFor--xs')}>+ ADD REDIS DATABASE</span>
      </EuiButton>
    </>
  )

  const ImportDatabasesBtn = () => (
    <EuiToolTip
      content="Import Database Connections"
    >
      <EuiButton
        fill
        color="secondary"
        onClick={handleClickImportDbBtn}
        className={styles.importDatabasesBtn}
        size="m"
        data-testid="import-from-file-btn"
      >
        <EuiIcon type="importAction" />
      </EuiButton>
    </EuiToolTip>
  )

  const Guides = () => (
    <div className={styles.links}>
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem grow={false} className={styles.clearMarginFlexItem}>
          <EuiText className={styles.followText}>
            {promoData ? 'Or follow the guides:' : 'Follow the guides:'}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup className={styles.otherGuides} gutterSize="s">
        {guides
          .filter(({ id }) => id?.toLowerCase() !== 'cloud')
          .map(({ id, url, title, event }) => (
            <EuiFlexItem key={id} grow={direction === 'column'}>
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
  )

  const CreateBtn = ({ content }: { content: ContentCreateRedis }) => {
    const { title, description, styles: stylesCss, links } = content
    // @ts-ignore
    const linkStyles = stylesCss ? stylesCss[theme] : {}
    return (
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick, isSSOEnabled) => (
          <PromoLink
            title={title}
            description={description}
            url={links?.main?.url}
            testId="promo-btn"
            icon="arrowRight"
            styles={{
              ...linkStyles,
              backgroundImage: linkStyles?.backgroundImage
                ? `url(${getPathToResource(linkStyles.backgroundImage)})`
                : undefined
            }}
            onClick={(e) => {
              !isSSOEnabled && handleCreateDatabaseClick(
                HELP_LINKS.cloud.event,
                { source: HELP_LINKS.cloud.sources.databaseList },
              )
              ssoCloudHandlerClick(e, OAuthSocialSource.ListOfDatabases)
            }}
          />
        )}
      </OAuthSsoHandlerDialog>
    )
  }

  return (
    <>
      <CapabilityPromotion />
      <EuiSpacer size="m" />
      {isImportDialogOpen && <ImportDatabasesDialog onClose={handleCloseImportDb} />}
      <div className={styles.containerDl}>
        <EuiFlexGroup className={styles.contentDL} alignItems="center" responsive={false} gutterSize="s">
          <EuiFlexItem grow={false}>
            <AddInstanceBtn />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ImportDatabasesBtn />
          </EuiFlexItem>
          {!loading && !isEmpty(data) && (
            <>
              <EuiFlexItem grow={false} className={cx(styles.promo)}>
                <EuiFlexGroup alignItems="center" gutterSize="s">
                  {promoData && (
                    <EuiFlexItem grow={false}>
                      <CreateBtn content={promoData} />
                    </EuiFlexItem>
                  )}
                  <EuiFlexItem className={styles.linkGuides}>
                    <Guides />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false} className={styles.fullGuides}>
                <HelpLinksMenu
                  items={guides}
                  buttonText={CREATE_DATABASE}
                  onLinkClick={(link) => handleClickLink(HELP_LINKS[link as keyof typeof HELP_LINKS]?.event)}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false} className={styles.smallGuides}>
                <HelpLinksMenu
                  emptyAnchor
                  items={guides.slice(1)}
                  buttonText={THE_GUIDES}
                  onLinkClick={(link) => handleClickLink(HELP_LINKS[link as keyof typeof HELP_LINKS]?.event)}
                />
              </EuiFlexItem>
            </>
          )}
          {instances.length > 0 && (
            <EuiFlexItem className={styles.searchContainer}>
              <SearchDatabasesList />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiSpacer className={styles.spacerDl} />
      </div>
    </>
  )
}

export default HomeHeader
