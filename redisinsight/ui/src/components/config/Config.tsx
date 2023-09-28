import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { isNumber } from 'lodash'
import { BrowserStorageItem } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { localStorageService } from 'uiSrc/services'
import { fetchFeatureFlags, setFeaturesToHighlight, setOnboarding } from 'uiSrc/slices/app/features'
import { fetchNotificationsAction } from 'uiSrc/slices/app/notifications'

import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
  setSettingsPopupState,
} from 'uiSrc/slices/user/user-settings'
import {
  fetchServerInfo,
  appServerInfoSelector,
} from 'uiSrc/slices/app/info'

import { setFavicon, isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchUnsupportedCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { fetchRedisCommandsInfo } from 'uiSrc/slices/app/redis-commands'
import { fetchGuides } from 'uiSrc/slices/workbench/wb-guides'
import { fetchTutorials } from 'uiSrc/slices/workbench/wb-tutorials'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { fetchContentRecommendations } from 'uiSrc/slices/recommendations/recommendations'
import { fetchGuideLinksAction } from 'uiSrc/slices/content/guide-links'

import favicon from 'uiSrc/assets/favicon.ico'

const SETTINGS_PAGE_PATH = '/settings'
const Config = () => {
  const serverInfo = useSelector(appServerInfoSelector)
  const { config, spec } = useSelector(userSettingsSelector)
  const { pathname } = useLocation()

  const dispatch = useDispatch()
  useEffect(() => {
    setFavicon(favicon)

    dispatch(fetchServerInfo())
    dispatch(fetchUnsupportedCliCommandsAction())
    dispatch(fetchRedisCommandsInfo())
    dispatch(fetchNotificationsAction())
    dispatch(fetchContentRecommendations())
    dispatch(fetchGuideLinksAction())

    // get guides & tutorials
    dispatch(fetchGuides())
    dispatch(fetchTutorials())

    dispatch(fetchFeatureFlags())

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
    featuresHighlight()
    onboardUsers()
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
      if (userFeatures?.version === serverInfo.appVersion) {
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

  const onboardUsers = () => {
    if (config) {
      const totalSteps = Object.keys(ONBOARDING_FEATURES).length
      const userCurrentStep = localStorageService.get(BrowserStorageItem.onboardingStep)

      // start onboarding for new electron users
      if (serverInfo?.buildType === BuildType.Electron && !config.agreements) {
        dispatch(setOnboarding({
          currentStep: 0,
          totalSteps
        }))

        return
      }

      // continue onboarding for all users
      if (isNumber(userCurrentStep)) {
        dispatch(setOnboarding({
          currentStep: userCurrentStep,
          totalSteps
        }))
      }
    }
  }

  const checkSettingsToShowPopup = () => {
    const specConsents = spec?.agreements
    const appliedConsents = config?.agreements

    dispatch(setSettingsPopupState(isDifferentConsentsExists(specConsents, appliedConsents)))
  }

  return null
}

export default Config
