import React from 'react'
import { MonitorConfig, PubSubConfig, BulkActionsConfig } from 'uiSrc/components'
import CommonAppSubscription from './CommonAppSubscription'

const GlobalSubscriptions = () => (
  <>
    <CommonAppSubscription />
    <MonitorConfig />
    <PubSubConfig />
    <BulkActionsConfig />
  </>
)

export default GlobalSubscriptions
