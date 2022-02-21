import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

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

import { checkIsAnalyticsGranted, getTelemetryService } from 'uiSrc/telemetry'
import { setFavicon, isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchUnsupportedCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { fetchRedisCommandsInfo } from 'uiSrc/slices/app/redis-commands'
import favicon from 'uiSrc/assets/favicon.ico'
import { ConsentsSettingsPopup } from 'uiSrc/components'

const SETTINGS_PAGE_PATH = '/settings'
const Config = () => {
  const serverInfo = useSelector(appServerInfoSelector)
  const { config, spec } = useSelector(userSettingsSelector)
  const { segmentWriteKey } = useSelector(appAnalyticsInfoSelector)
  const { isShowConceptsPopup: isShowConsents } = useSelector(userSettingsSelector)

  const { pathname } = useLocation()

  const dispatch = useDispatch()
  useEffect(() => {
    setFavicon(favicon)

    dispatch(fetchServerInfo())
    dispatch(fetchUnsupportedCliCommandsAction())
    dispatch(fetchRedisCommandsInfo())

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
  }, [serverInfo, config])

  const checkSettingsToShowPopup = () => {
    const specConsents = spec?.agreements
    const appliedConsents = config?.agreements

    if (isDifferentConsentsExists(specConsents, appliedConsents)) {
      dispatch(setSettingsPopupState(true))
    }
  }

  return (
    <>
      {isShowConsents && <ConsentsSettingsPopup />}
    </>
  )
}

export default Config
