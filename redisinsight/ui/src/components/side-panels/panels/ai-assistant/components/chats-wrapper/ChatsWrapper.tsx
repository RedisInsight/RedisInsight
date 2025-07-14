import React, { useEffect, useState } from 'react'

import { EuiTab, EuiTabs } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import cx from 'classnames'
import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { isRdiPipelineConfigPage } from 'uiSrc/utils/rdi'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import AssistanceChat from '../assistance-chat'
import ExpertChat from '../expert-chat'
import RdiHelperChat from '../rdi-helper-chat'

import styles from './styles.module.scss'

const ChatsWrapper = () => {
  const { activeTab } = useSelector(aiChatSelector)
  const location = useLocation()
  const [initialRDIRedirect, setInitialRDIRedirect] = useState(false)
  
  // Check if we're on the RDI pipeline config page
  const isOnRdiPipelineConfig = isRdiPipelineConfigPage(location.pathname)

  const chats = [
    {
      tab: AiChatType.Assistance,
    },
    {
      tab: AiChatType.Query,
    },
    ...(isOnRdiPipelineConfig ? [{
      tab: AiChatType.RdiHelper,
    }] : [])
  ]

  const dispatch = useDispatch()

  useEffect(() => {
    if (!chats.length) return

    // Default to first chat if no active tab is set
    if (!activeTab) {
      dispatch(setSelectedTab(chats[0].tab))
    }

    // If we're on RDI page and no RDI tab is active, switch to RDI Helper
    if (isOnRdiPipelineConfig && activeTab !== AiChatType.RdiHelper && !initialRDIRedirect) {
      setInitialRDIRedirect(true)
      dispatch(setSelectedTab(AiChatType.RdiHelper))
    }

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        chat: activeTab || chats[0].tab,
      },
    })
  }, [activeTab, isOnRdiPipelineConfig, initialRDIRedirect])

  const selectTab = (tab: AiChatType) => {
    dispatch(setSelectedTab(tab))
  }

  return (
    <div className={styles.wrapper} data-testid="chat-wrapper">
      {chats.length > 1 && (
        <div className={styles.tabsWrapper}>
          <EuiTabs className={cx('tabs-active-borders', styles.tabs)}>
            <EuiTab
              isSelected={activeTab === AiChatType.Assistance}
              onClick={() => selectTab(AiChatType.Assistance)}
              data-testid="ai-general-chat_tab"
            >
              General
            </EuiTab>
            <EuiTab
              isSelected={activeTab === AiChatType.Query}
              onClick={() => selectTab(AiChatType.Query)}
              data-testid="ai-database-chat_tab"
            >
              My Data
            </EuiTab>
            {isOnRdiPipelineConfig && (
              <EuiTab
                isSelected={activeTab === AiChatType.RdiHelper}
                onClick={() => selectTab(AiChatType.RdiHelper)}
                data-testid="ai-rdi-helper-chat_tab"
              >
                RDI Helper
              </EuiTab>
            )}
          </EuiTabs>
        </div>
      )}
      {chats.length > 0 && (
        <div className={styles.chat}>
          {activeTab === AiChatType.Assistance && <AssistanceChat />}
          {activeTab === AiChatType.Query && <ExpertChat />}
          {activeTab === AiChatType.RdiHelper && <RdiHelperChat />}
        </div>
      )}
    </div>
  )
}

export default ChatsWrapper
