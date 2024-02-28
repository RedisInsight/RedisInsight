import React from 'react'

import { EuiImage, EuiTab, EuiTabs } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  aiChatSelector,
  setSelectedTab
} from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import AiChatImg from 'uiSrc/assets/img/ai/ai-chat.svg'

import AssistanceChat from '../assistance-chat'
import ExpertChat from '../expert-chat'

import styles from './styles.module.scss'

const ChatsWrapper = () => {
  const { activeTab } = useSelector(aiChatSelector)

  const dispatch = useDispatch()

  const selectTab = (tab: AiChatType) => {
    dispatch(setSelectedTab(tab))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabsWrapper}>
        <EuiImage className={styles.chatImg} src={AiChatImg} alt="chat" />
        <EuiTabs className={cx('tabs-active-borders', styles.tabs)}>
          <EuiTab
            isSelected={activeTab === AiChatType.Assistance}
            onClick={() => selectTab(AiChatType.Assistance)}
          >
            General
          </EuiTab>
          <EuiTab
            isSelected={activeTab === AiChatType.Query}
            onClick={() => selectTab(AiChatType.Query)}
          >
            Database
          </EuiTab>
        </EuiTabs>
      </div>
      <div className={styles.chat}>
        {activeTab === AiChatType.Assistance && (<AssistanceChat />)}
        {activeTab === AiChatType.Query && (<ExpertChat />)}
      </div>
    </div>
  )
}

export default ChatsWrapper
