import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { BrowserStorageItem } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { localStorageService } from 'uiSrc/services'
import { setFeaturesToHighlight } from 'uiSrc/slices/app/features-highlighting'
import { fetchNotificationsAction } from 'uiSrc/slices/app/notifications'

import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
  setSettingsPopupState,
} from 'uiSrc/slices/user/user-settings'
import {
  fetchServerInfo,
  appAnalyticsInfoSelector,
  appServerInfoSelector,
  setAnalyticsIdentified,
} from 'uiSrc/slices/app/info'

import { getTelemetryService } from 'uiSrc/telemetry'
import { checkIsAnalyticsGranted } from 'uiSrc/telemetry/checkAnalytics'
import { setFavicon, isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchUnsupportedCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { fetchRedisCommandsInfo } from 'uiSrc/slices/app/redis-commands'
import favicon from 'uiSrc/assets/favicon.ico'

const SETTINGS_PAGE_PATH = '/settings'
const Config = () => {
  const serverInfo = useSelector(appServerInfoSelector)
  const { config, spec } = useSelector(userSettingsSelector)
  const { segmentWriteKey } = useSelector(appAnalyticsInfoSelector)

  const { pathname } = useLocation()

  const dispatch = useDispatch()
  useEffect(() => {
    setFavicon(favicon)

    dispatch(fetchServerInfo())
    dispatch(fetchUnsupportedCliCommandsAction())
    dispatch(fetchRedisCommandsInfo())
    dispatch(fetchNotificationsAction())

    // fetch config settings, after that take spec
    if (pathname !== SETTINGS_PAGE_PATH) {
      dispatch(fetchUserConfigSettings(() => dispatch(fetchUserSettingsSpec())))
    }
  }, [])

  useEffect(() => {
    if (config && spec) {
      checkSettingsToShowPopup()
    }
  }, [spec])

  useEffect(() => {
    if (serverInfo && checkIsAnalyticsGranted()) {
      (async () => {
        const telemetryService = getTelemetryService(segmentWriteKey)
        await telemetryService.identify({ installationId: serverInfo.id, sessionId: serverInfo.sessionId })

        dispatch(setAnalyticsIdentified(true))
      })()
    }

    featuresHighlight()
  }, [serverInfo, config])

  const featuresHighlight = () => {
    if (serverInfo?.buildType === BuildType.Electron && config) {
      // new user, set all features as viewed
      if (!config.agreements) {
        updateHighlightingFeatures({ version: serverInfo.appVersion, features: [] })
        return
      }

      const userFeatures = localStorageService.get(BrowserStorageItem.featuresHighlighting)

      // existing user with the same version of app, get not viewed features from LS
      if (userFeatures && userFeatures.version === serverInfo.appVersion) {
        dispatch(setFeaturesToHighlight(userFeatures))
        return
      }

      // existing user, no any new features viewed (after application update e.g.)
      updateHighlightingFeatures({ version: serverInfo.appVersion, features: Object.keys(BUILD_FEATURES) })
    }
  }

  const updateHighlightingFeatures = (data: { version: string, features: string[] }) => {
    dispatch(setFeaturesToHighlight(data))
    localStorageService.set(BrowserStorageItem.featuresHighlighting, data)
  }

  const checkSettingsToShowPopup = () => {
    const specConsents = spec?.agreements
    const appliedConsents = config?.agreements

    if (isDifferentConsentsExists(specConsents, appliedConsents)) {
      dispatch(setSettingsPopupState(true))
    }
  }

  return null
}

export default Config
