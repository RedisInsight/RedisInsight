import React, { useEffect, useState } from 'react'

import { EuiTab, EuiTabs } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import cx from 'classnames'
import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { isRdiPipelineConfigPage } from 'uiSrc/utils'
import AssistanceChat from '../assistance-chat'
import ExpertChat from '../expert-chat'
import RdiHelperChat from '../rdi-helper-chat'
import DataGeneratorChat from '../data-generator-chat'
import styles from './styles.module.scss'


const ChatsWrapper = () => {
  const { activeTab } = useSelector(aiChatSelector)

  const documentationChatFeature = {
    name: 'documentationChatFeature',
    flag: true,
  }

  const databaseChatFeature = {
    name: 'databaseChatFeature',
    flag: true,
  }

  const location = useLocation()
  const [initialRDIRedirect, setInitialRDIRedirect] = useState(false)

  // Check if we're on the RDI pipeline config page
  const isOnRdiPipelineConfig = isRdiPipelineConfigPage(location.pathname)

  const chats = [
    ...(isOnRdiPipelineConfig
      ? [
          {
            tab: AiChatType.RdiHelper,
          },
        ]
      : []),
    {
      tab: AiChatType.DataGenerator,
    },
    {
      feature: documentationChatFeature,
      tab: AiChatType.Assistance,
    },
    {
      feature: databaseChatFeature,
      tab: AiChatType.Query,
    },
  ]

  const dispatch = useDispatch()

  useEffect(() => {
    if (!chats.length) return

    if (
      isOnRdiPipelineConfig &&
      activeTab !== AiChatType.RdiHelper &&
      !initialRDIRedirect
    ) {
      setInitialRDIRedirect(true)
      dispatch(setSelectedTab(AiChatType.RdiHelper))
    }

    if (
      !isOnRdiPipelineConfig &&
      activeTab !== AiChatType.DataGenerator
    ) {
      dispatch(setSelectedTab(AiChatType.DataGenerator))
    }
  }, [databaseChatFeature, databaseChatFeature, activeTab, initialRDIRedirect])

  const selectTab = (tab: AiChatType) => {
    dispatch(setSelectedTab(tab))
  }

  return (
    <div className={styles.wrapper} data-testid="chat-wrapper">
      {chats.length > 1 && (
        <div className={styles.tabsWrapper}>
          <EuiTabs className={cx('tabs-active-borders', styles.tabs)}>           
            {isOnRdiPipelineConfig ? (
              <EuiTab
                isSelected={activeTab === AiChatType.RdiHelper}
                onClick={() => selectTab(AiChatType.RdiHelper)}
                data-testid="ai-rdi-helper-chat_tab"
              >
                RDI Helper
              </EuiTab>
            ) : (
              <EuiTab
                  isSelected={activeTab === AiChatType.DataGenerator}
                  onClick={() => selectTab(AiChatType.DataGenerator)}
                  data-testid="ai-data-generator-chat_tab"
                >
                  Data Generator
              </EuiTab>
            )}
            {/* {documentationChatFeature?.flag && ( */}
            {/*  <EuiTab */}
            {/*    isSelected={activeTab === AiChatType.Assistance} */}
            {/*    onClick={() => selectTab(AiChatType.Assistance)} */}
            {/*    data-testid="ai-general-chat_tab" */}
            {/*  > */}
            {/*    General */}
            {/*  </EuiTab> */}
            {/* )} */}
            {/* {databaseChatFeature?.flag && ( */}
            {/*  <EuiTab */}
            {/*    isSelected={activeTab === AiChatType.Query} */}
            {/*    onClick={() => selectTab(AiChatType.Query)} */}
            {/*    data-testid="ai-database-chat_tab" */}
            {/*  > */}
            {/*    My Data */}
            {/*  </EuiTab> */}
            {/* )} */}
          </EuiTabs>
        </div>
      )}
      {chats.length > 0 && (
        <div className={styles.chat}>
          {activeTab === AiChatType.Assistance && <AssistanceChat />}
          {activeTab === AiChatType.Query && <ExpertChat />}
          {activeTab === AiChatType.RdiHelper && <RdiHelperChat />}
          {activeTab === AiChatType.DataGenerator && <DataGeneratorChat />}
        </div>
      )}
    </div>
  )
}

export default ChatsWrapper
