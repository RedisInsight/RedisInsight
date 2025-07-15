import React, { useEffect, useState } from 'react'

import { EuiTab, EuiTabs } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { filter } from 'lodash'
import { useLocation } from 'react-router-dom'
import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'

import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isRdiPipelineConfigPage, Maybe } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import AssistanceChat from '../assistance-chat'
import ExpertChat from '../expert-chat'

import RdiHelperChat from '../rdi-helper-chat'
import styles from './styles.module.scss'

interface ChatWithTabs {
  feature: Maybe<FeatureFlagComponent>
  tab: AiChatType
}

const ChatsWrapper = () => {
  const { activeTab } = useSelector(aiChatSelector)
  const {
    [FeatureFlags.documentationChat]: documentationChatFeature,
    [FeatureFlags.databaseChat]: databaseChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const location = useLocation()

  const [initialRDIRedirect, setInitialRDIRedirect] = useState(false)
  
  // Check if we're on the RDI pipeline config page
  const isOnRdiPipelineConfig = isRdiPipelineConfigPage(location.pathname)

  const chats = filter<ChatWithTabs>(
    [
      {
        feature: documentationChatFeature,
        tab: AiChatType.Assistance,
      },
      {
        feature: databaseChatFeature,
        tab: AiChatType.Query,
      },
      ...(isOnRdiPipelineConfig ? [{
        tab: AiChatType.RdiHelper,
      }] : [])
    ],
    ({ feature }) => !!feature?.flag,
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (!chats.length) return

    if (
      (activeTab === AiChatType.Assistance &&
        !documentationChatFeature?.flag) ||
      (activeTab === AiChatType.Query && !databaseChatFeature?.flag)
    ) {
      dispatch(setSelectedTab(chats[0].tab))
    }

    if (isOnRdiPipelineConfig && activeTab !== AiChatType.RdiHelper && !initialRDIRedirect) {
      setInitialRDIRedirect(true)
      dispatch(setSelectedTab(AiChatType.RdiHelper))
    }


    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        chat: activeTab,
      },
    })
  }, [databaseChatFeature, databaseChatFeature, activeTab, initialRDIRedirect])

  const selectTab = (tab: AiChatType) => {
    dispatch(setSelectedTab(tab))
  }

  return (
    <div className={styles.wrapper} data-testid="chat-wrapper">
      {chats.length > 1 && (
        <div className={styles.tabsWrapper}>
          <EuiTabs className={cx('tabs-active-borders', styles.tabs)}>
            {documentationChatFeature?.flag && (
              <EuiTab
                isSelected={activeTab === AiChatType.Assistance}
                onClick={() => selectTab(AiChatType.Assistance)}
                data-testid="ai-general-chat_tab"
              >
                General
              </EuiTab>
            )}
            {databaseChatFeature?.flag && (
              <EuiTab
                isSelected={activeTab === AiChatType.Query}
                onClick={() => selectTab(AiChatType.Query)}
                data-testid="ai-database-chat_tab"
              >
                My Data
              </EuiTab>
            )}
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
          {activeTab === AiChatType.Assistance &&
            documentationChatFeature?.flag && <AssistanceChat />}
          {activeTab === AiChatType.Query && databaseChatFeature?.flag && (
            <ExpertChat />
          )}
          {activeTab === AiChatType.RdiHelper && <RdiHelperChat />}
        </div>
      )}
    </div>
  )
}

export default ChatsWrapper
