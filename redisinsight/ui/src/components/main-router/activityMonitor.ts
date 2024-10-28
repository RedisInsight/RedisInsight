import throttle from 'lodash/throttle'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

const monitorOrigin = riConfig.app.activityMonitorOrigin
const windowEvents = ['click', 'keydown', 'scroll', 'touchstart']
const isMonitorEnabled = monitorOrigin && window.opener

const onActivity = throttle(() => {
  try {
    // post event to parent window
    window.opener.postMessage({ name: 'setLastActivity' }, monitorOrigin)
  } catch {
    // ignore errors
  }
}, 30000)

export const startActivityMonitor = () => {
  try {
    if (isMonitorEnabled) {
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
    if (isMonitorEnabled) {
      windowEvents.forEach((event) => {
        window.removeEventListener(event, onActivity, { capture: true })
      })
    }
  } catch {
    // ignore errors
  }
}
