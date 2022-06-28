import React from 'react'
import { MonitorConfig, PubSubConfig } from 'uiSrc/components'
import CommonAppSubscription from './CommonAppSubscription'

const GlobalSubscriptions = () => (
  <>
    <CommonAppSubscription />
    <MonitorConfig />
    <PubSubConfig />
  </>
)

export default GlobalSubscriptions
