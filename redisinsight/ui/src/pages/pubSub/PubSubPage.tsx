import { EuiTitle } from '@elastic/eui'
import React from 'react'
import InstanceHeader from 'uiSrc/components/instance-header'
import { SubscriptionType } from 'uiSrc/constants/pubSub'

import { MessagesList, SubscriptionPanel } from './components'

import styles from './styles.module.scss'

export const PUB_SUB_DEFAULT_CHANNEL = { channel: '*', type: SubscriptionType.PSubscribe }

const PubSubPage = () => {
  //
  return (
    <>
      <InstanceHeader />
      <div className={styles.main} data-testid="pub-sub-page">
        <div className={styles.contentPanel}>
          <div className={styles.header}>
            <EuiTitle size="m" className={styles.title}>
              <h1>Pub/Sub</h1>
            </EuiTitle>
            <SubscriptionPanel />
          </div>
          <div className={styles.tableWrapper}>
            <MessagesList />
          </div>
        </div>
        <div className={styles.footerPanel}>
          footer
        </div>
      </div>
    </>
  )
}

export default PubSubPage
