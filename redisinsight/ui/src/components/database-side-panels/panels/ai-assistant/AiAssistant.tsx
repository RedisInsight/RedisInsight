import React from 'react'
import { useSelector } from 'react-redux'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { WelcomeAiAssistant, ChatsWrapper } from './components'
import styles from './styles.module.scss'

const AiAssistant = () => {
  const { data } = useSelector(oauthCloudUserSelector)
  const { [FeatureFlags.cloudSso]: cloudSsoFeature } = useSelector(appFeatureFlagsFeaturesSelector)

  const isShowAuth = cloudSsoFeature?.flag && !data

  return (
    <div className={styles.wrapper} data-testid="redis-copilot">
      {isShowAuth ? (<WelcomeAiAssistant />) : (<ChatsWrapper />)}
    </div>
  )
}

export default AiAssistant
