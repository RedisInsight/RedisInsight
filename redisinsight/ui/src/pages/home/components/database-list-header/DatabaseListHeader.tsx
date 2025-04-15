import React, { useContext, useEffect, useState } from 'react'
import { EuiButton } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import cx from 'classnames'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import PromoLink from 'uiSrc/components/promo-link/PromoLink'

import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getPathToResource } from 'uiSrc/services/resourcesService'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getContentByFeature } from 'uiSrc/utils/content'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { FeatureFlags } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/Spacer'
import SearchDatabasesList from '../search-databases-list'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
}

const DatabaseListHeader = ({ onAddInstance }: Props) => {
  const { data: instances } = useSelector(instancesSelector)
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
  const { loading, data } = useSelector(contentSelector)

  const [promoData, setPromoData] = useState<ContentCreateRedis>()

  const { theme } = useContext(ThemeContext)
  const { [FeatureFlags.enhancedCloudUI]: enhancedCloudUIFeature } =
    featureFlags
  const isShowPromoBtn = !enhancedCloudUIFeature?.flag

  useEffect(() => {
    if (loading || !data || isEmpty(data)) {
      return
    }

    if (data?.cloud && !isEmpty(data.cloud)) {
      setPromoData(getContentByFeature(data.cloud, featureFlags))
    }
  }, [loading, data, featureFlags])

  const handleOnAddDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
      eventData: {
        source: OAuthSocialSource.DatabasesList,
      },
    })
    onAddInstance()
  }

  const handleClickLink = (event: TelemetryEvent, eventData: any = {}) => {
    if (event) {
      sendEventTelemetry({
        event,
        eventData: {
          ...eventData,
        },
      })
    }
  }

  const handleCreateDatabaseClick = (
    event: TelemetryEvent,
    eventData: any = {},
  ) => {
    handleClickLink(event, eventData)
  }

  const AddInstanceBtn = () => (
    <EuiButton
      fill
      color="secondary"
      onClick={handleOnAddDatabase}
      className={styles.addInstanceBtn}
      data-testid="add-redis-database-short"
    >
      <span>+ Add Redis database</span>
    </EuiButton>
  )

  const CreateBtn = ({ content }: { content: ContentCreateRedis }) => {
    if (!isShowPromoBtn) return null

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
                : undefined,
            }}
            onClick={(e) => {
              !isSSOEnabled &&
                handleCreateDatabaseClick(HELP_LINKS.cloud.event, {
                  source: HELP_LINKS.cloud.sources.databaseList,
                })
              ssoCloudHandlerClick(e, {
                source: OAuthSocialSource.ListOfDatabases,
                action: OAuthSocialAction.Create,
              })
            }}
          />
        )}
      </OAuthSsoHandlerDialog>
    )
  }

  return (
    <div className={styles.containerDl}>
      <Row
        className={styles.contentDL}
        align="center"
        responsive={false}
        gap="s"
      >
        <FlexItem>
          <FeatureFlagComponent name={FeatureFlags.databaseManagement}>
            <AddInstanceBtn />
          </FeatureFlagComponent>
        </FlexItem>
        {!loading && !isEmpty(data) && (
          <FlexItem className={cx(styles.promo)}>
            <Row align="center" gap="s">
              {promoData && (
                <FeatureFlagComponent name={FeatureFlags.cloudAds}>
                  <FlexItem>
                    <CreateBtn content={promoData} />
                  </FlexItem>
                </FeatureFlagComponent>
              )}
            </Row>
          </FlexItem>
        )}
        {instances.length > 0 && (
          <FlexItem className={styles.searchContainer}>
            <SearchDatabasesList />
          </FlexItem>
        )}
      </Row>
      <Spacer className={styles.spacerDl} />
    </div>
  )
}

export default DatabaseListHeader
