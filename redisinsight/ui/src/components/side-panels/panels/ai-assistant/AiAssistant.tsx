import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  clearAiChatHistory,
} from 'uiSrc/slices/panels/aiAssistant'
import {
  WelcomeAiAssistant,
} from './components'
import AiChat from './components/ai-chat'
import styles from './styles.module.scss'

const AiAssistant = () => {
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const {
    [FeatureFlags.cloudSso]: cloudSsoFeature,
    [FeatureFlags.databaseChat]: databaseChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const currentAccountIdRef = useRef(userOAuthProfile?.id)

  const isShowAuth = cloudSsoFeature?.flag && !userOAuthProfile

  const dispatch = useDispatch()

  useEffect(() => {
    // user logout
    if (currentAccountIdRef.current && !userOAuthProfile?.id) {
      dispatch(clearAiChatHistory())
    }

    currentAccountIdRef.current = userOAuthProfile?.id
  }, [userOAuthProfile])

  if (!databaseChatFeature) return <></>

  return (
    <div className={styles.wrapper} data-testid="redis-copilot">
      {isShowAuth ? (<WelcomeAiAssistant />) : (<AiChat />)}
    </div>
  )
}

export default AiAssistant
