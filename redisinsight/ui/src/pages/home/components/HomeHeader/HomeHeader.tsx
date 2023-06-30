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
import { FeatureFlagComponent, ImportDatabasesDialog } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import HelpLinksMenu from 'uiSrc/pages/home/components/HelpLinksMenu'
import PromoLink from 'uiSrc/components/promo-link/PromoLink'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { HELP_LINKS, IHelpGuide } from 'uiSrc/pages/home/constants/help-links'
import { getPathToResource } from 'uiSrc/services/resourcesService'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { handleFreeDatabaseClick } from 'uiSrc/utils/oauth/handleFreeDatabaseClick'
import { FeatureFlags } from 'uiSrc/constants'
import { ReactComponent as TadaIcon } from 'uiSrc/assets/img/oauth/tada.svg'
import SearchDatabasesList from '../SearchDatabasesList'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
  direction: 'column' | 'row'
  welcomePage?: boolean
}

const CREATE_DATABASE = 'CREATE DATABASE'
const THE_GUIDES = 'THE GUIDES'

const HomeHeader = ({ onAddInstance, direction, welcomePage = false }: Props) => {
  const { theme } = useContext(ThemeContext)
  const { data: instances } = useSelector(instancesSelector)
  const { loading, data } = useSelector(contentSelector)
  const [promoData, setPromoData] = useState<ContentCreateRedis>()
  const [guides, setGuides] = useState<IHelpGuide[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (loading || !data || isEmpty(data)) {
      return
    }
    if (data?.cloud && !isEmpty(data.cloud)) {
      setPromoData(data.cloud)
    }
    const items = Object.entries(data).map(([key, { title, links, description }]) => ({
      id: key,
      title,
      description,
      event: HELP_LINKS[key as keyof typeof HELP_LINKS]?.event,
      url: links?.main?.url,
      primary: key.toLowerCase() === 'cloud',
    }))
    setGuides(items)
  }, [loading, data])

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
    e: React.MouseEvent<HTMLAnchorElement>,
    event: TelemetryEvent,
    eventData: any = {},
  ) => {
    handleFreeDatabaseClick(e, SignInDialogSource.WelcomeScreen)
    handleClickLink(event, eventData)
  }

  const AddInstanceBtn = () => (
    <>
      <EuiButton
        fill
        color="secondary"
        onClick={handleOnAddDatabase}
        className={cx(styles.addInstanceBtn, 'eui-showFor--s', 'eui-showFor--xs')}
        data-testid="add-redis-database-short"
      >
        + ADD DATABASE
      </EuiButton>
      <EuiButton
        fill
        color="secondary"
        onClick={handleOnAddDatabase}
        className={cx(styles.addInstanceBtn, 'eui-hideFor--s', 'eui-hideFor--xs')}
        data-testid="add-redis-database"
      >
        + ADD REDIS DATABASE
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
        data-testid="import-dbs-btn"
      >
        <EuiIcon type="importAction" />
      </EuiButton>
    </EuiToolTip>
  )

  const Guides = () => (
    <div className={styles.links}>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} className={styles.clearMarginFlexItem}>
          <EuiText className={styles.followText}>
            {promoData ? 'Or follow the guides:' : 'Follow the guides:'}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup className={styles.otherGuides}>
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
    const promoLink = (
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
        onClick={(e) => handleCreateDatabaseClick(
          e,
          HELP_LINKS.cloud.event,
          { source: welcomePage ? 'Welcome page' : 'My Redis databases' }
        )}
      />
    )
    return (
      <FeatureFlagComponent name={FeatureFlags.cloudSso} otherwise={promoLink}>
        <EuiToolTip
          position="bottom"
          anchorClassName={styles.cloudSsoPromoBtnAnchor}
          content={(
            <div className={styles.cloudSsoPromoTooltip}>
              <EuiIcon type={TadaIcon} className={styles.cloudSsoPromoTooltipIcon} />
              <div>
                New!
                <br />
                Now you can easily connect and create new database on Redis Cloud
              </div>
            </div>
          )}
        >
          {promoLink}
        </EuiToolTip>
      </FeatureFlagComponent>
    )
  }

  return (
    <>
      {isImportDialogOpen && <ImportDatabasesDialog onClose={handleCloseImportDb} />}
      {direction === 'column' ? (
        <div className={styles.containerWelc}>
          <EuiFlexGroup alignItems="center" justifyContent="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <AddInstanceBtn />
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ marginLeft: 0, marginRight: 0 }}>
              <ImportDatabasesBtn />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              <div className={styles.separator} />
            </EuiFlexItem>
          </EuiFlexGroup>
          {!loading && !isEmpty(data) && (
            <>
              {promoData && (
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <CreateBtn content={promoData} />
                  </EuiFlexItem>
                </EuiFlexGroup>
              )}
              <Guides />
            </>
          )}
          <EuiSpacer />
        </div>
      ) : (
        <div className={styles.containerDl}>
          <EuiFlexGroup className={styles.contentDL} alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <AddInstanceBtn />
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ marginLeft: 0, marginRight: 0 }}>
              <ImportDatabasesBtn />
            </EuiFlexItem>
            <EuiFlexItem className={cx(styles.separatorContainer)} grow={false}>
              <div className={styles.separator} />
            </EuiFlexItem>
            {!loading && !isEmpty(data) && (
              <>
                <EuiFlexItem grow className={cx(styles.promo)}>
                  <EuiFlexGroup alignItems="center">
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
      )}
    </>
  )
}

export default HomeHeader
