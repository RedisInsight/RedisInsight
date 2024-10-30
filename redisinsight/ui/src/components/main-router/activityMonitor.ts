import throttle from 'lodash/throttle'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const throttleTimeout = riConfig.app.activityMonitorThrottleTimeout
const windowEvents = ['click', 'keydown', 'scroll', 'touchstart']

const getIsMonitorEnabled = () => riConfig.app.activityMonitorOrigin && window.opener

const onActivity = throttle(() => {
  try {
    // post event to parent window
    window.opener.postMessage({ name: 'setLastActivity' }, riConfig.app.activityMonitorOrigin)
  } catch {
    // ignore errors
  }
}, throttleTimeout)

export const startActivityMonitor = () => {
  try {
    if (getIsMonitorEnabled()) {
      windowEvents.forEach((event) => {
        window.addEventListener(event, onActivity, { passive: true, capture: true })
      })
    }
  } catch {
    // ignore errors
  }
}

export const stopActivityMonitor = () => {
  try {
    if (getIsMonitorEnabled()) {
      windowEvents.forEach((event) => {
        window.removeEventListener(event, onActivity, { capture: true })
      })
    }
  } catch {
    // ignore errors
  }
}
