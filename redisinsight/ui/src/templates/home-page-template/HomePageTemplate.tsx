import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { some } from 'lodash'

import { ExplorePanelTemplate } from 'uiSrc/templates'
import HomeTabs from 'uiSrc/components/home-tabs'
import { CapabilityPromotion } from 'uiSrc/pages/home/components/capability-promotion'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import InsightsTrigger from 'uiSrc/components/insights-trigger'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import AiChatbotMessage from 'uiSrc/components/hightlighted-feature/components/ai-chatbot-message'
import { appFeatureFlagsFeaturesSelector, appFeatureHighlightingSelector } from 'uiSrc/slices/app/features'
import { getHighlightingFeatures } from 'uiSrc/utils/highlighting'
import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const HomePageTemplate = (props: Props) => {
  const { children } = props

  const { features } = useSelector(appFeatureHighlightingSelector)
  const { aiChatbot: aiChatbotHighlighting } = getHighlightingFeatures(features)
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = some([databaseChatFeature, documentationChatFeature], (feature) => feature?.flag)

  return (
    <>
      <div className={styles.pageDefaultHeader}>
        <HomeTabs />
        <HighlightedFeature
          isHighlight={isAnyChatAvailable && aiChatbotHighlighting}
          {...(BUILD_FEATURES.aiChatbot || {})}
        >
          <AiChatbotMessage />
        </HighlightedFeature>
        <CapabilityPromotion wrapperClassName={cx(styles.section, styles.capabilityPromotion)} />
        <InsightsTrigger source="home page" />
        <FeatureFlagComponent name={FeatureFlags.cloudSso}>
          <div grow={false} style={{ marginLeft: 16 }}>
            <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
          </div>
        </FeatureFlagComponent>
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
