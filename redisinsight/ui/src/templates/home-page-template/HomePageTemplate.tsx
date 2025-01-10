import React from 'react'
import { useSelector } from 'react-redux'
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import { ExplorePanelTemplate } from 'uiSrc/templates'
import HomeTabs from 'uiSrc/components/home-tabs'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const HomePageTemplate = (props: Props) => {
  const { children } = props

  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([databaseChatFeature, documentationChatFeature])

  return (
    <>
      <div className={styles.pageDefaultHeader}>
        <HomeTabs />
        <EuiFlexGroup style={{ flexGrow: 0 }} gutterSize="none" alignItems="center">
          {isAnyChatAvailable && (
            <EuiFlexItem grow={false} style={{ marginRight: 12 }}>
              <CopilotTrigger />
            </EuiFlexItem>
          )}
          <EuiFlexItem><InsightsTrigger source="home page" /></EuiFlexItem>
          <FeatureFlagComponent name={FeatureFlags.cloudSso}>
            <EuiFlexItem style={{ marginLeft: 16 }} data-testid="home-page-sso-profile">
              <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
            </EuiFlexItem>
          </FeatureFlagComponent>
        </EuiFlexGroup>
      </div>
      <div className={styles.pageWrapper}>
        <ExplorePanelTemplate panelClassName={styles.explorePanel}>
          {children}
        </ExplorePanelTemplate>
      </div>
    </>
  )
}

export default React.memo(HomePageTemplate)
