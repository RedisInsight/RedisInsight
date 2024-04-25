import React, { useEffect } from 'react'

import { EuiImage, EuiTab, EuiTabs } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { filter } from 'lodash'
import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import AiChatImg from 'uiSrc/assets/img/ai/ai-chat-small.svg'

import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { Maybe } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import AssistanceChat from '../assistance-chat'
import ExpertChat from '../expert-chat'

import styles from './styles.module.scss'

interface ChatWithTabs {
  feature: Maybe<FeatureFlagComponent>,
  tab: AiChatType
}

const ChatsWrapper = () => {
  const { activeTab } = useSelector(aiChatSelector)
  const {
    [FeatureFlags.documentationChat]: documentationChatFeature,
    [FeatureFlags.databaseChat]: databaseChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const chats = filter<ChatWithTabs>([
    {
      feature: documentationChatFeature,
      tab: AiChatType.Assistance
    },
    {
      feature: databaseChatFeature,
      tab: AiChatType.Query
    },
  ], ({ feature }) => !!feature?.flag)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!chats.length) return

    if ((activeTab === AiChatType.Assistance && !documentationChatFeature?.flag)
      || (activeTab === AiChatType.Query && !databaseChatFeature?.flag)
    ) {
      dispatch(setSelectedTab(chats[0].tab))
    }

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        chat: activeTab
      }
    })
  }, [databaseChatFeature, databaseChatFeature, activeTab])

  const selectTab = (tab: AiChatType) => {
    dispatch(setSelectedTab(tab))
  }

  return (
    <div className={styles.wrapper} data-testid="chat-wrapper">
      {chats.length > 1 && (
        <div className={styles.tabsWrapper}>
          <EuiImage className={styles.chatImg} src={AiChatImg} alt="chat" />
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
                Database
              </EuiTab>
            )}
          </EuiTabs>
        </div>
      )}
      {chats.length > 0 && (
        <div className={styles.chat}>
          {activeTab === AiChatType.Assistance && documentationChatFeature?.flag && (<AssistanceChat />)}
          {activeTab === AiChatType.Query && databaseChatFeature?.flag && (<ExpertChat />)}
        </div>
      )}
    </div>
  )
}

export default ChatsWrapper
