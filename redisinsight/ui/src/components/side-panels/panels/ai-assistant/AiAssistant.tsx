import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { clearExpertChatHistory } from 'uiSrc/slices/panels/aiAssistant'
import { ChatsWrapper } from './components'
import styles from './styles.module.scss'

const AiAssistant = () => {
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)

  const currentAccountIdRef = useRef(userOAuthProfile?.id)

  const dispatch = useDispatch()

  useEffect(() => {
    // user logout
    if (currentAccountIdRef.current && !userOAuthProfile?.id) {
      dispatch(clearExpertChatHistory())
    }

    currentAccountIdRef.current = userOAuthProfile?.id
  }, [userOAuthProfile])

  return (
    <div className={styles.wrapper} data-testid="redis-copilot">
      <ChatsWrapper />
    </div>
  )
}

export default AiAssistant
