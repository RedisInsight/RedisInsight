import { get } from 'lodash'
import store from 'uiSrc/slices/store'

// Check is user give access to collect his events
export const checkIsAnalyticsGranted = () =>
  !!get(store.getState(), 'user.settings.config.agreements.analytics', false)

export const getAppType = () => get(store.getState(), 'app.info.server.appType')
export const getControlGroup = () => get(store.getState(), 'app.info.server.controlGroup')
