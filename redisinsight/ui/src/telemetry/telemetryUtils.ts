/**
 * Telemetry and analytics module.
 * This module abstracts the exact service/framework used for tracking usage.
 */
import { get } from 'lodash'
import { Nullable } from 'uiSrc/utils'
import store from 'uiSrc/slices/store'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { ITelemetrySendEvent, ITelemetrySendPageView, ITelemetryService } from './interfaces'
import { NON_TRACKING_ANONYMOUS_ID, SegmentTelemetryService } from './segment'

let telemetryService: Nullable<ITelemetryService> = null

/**
 * Returns the initialized telemetry service singleton.
 * @param apiKey The API key for the analytics backend. E.g. Google Analytics tracking ID, Segment write key.
 */
const getTelemetryService = (apiKey: string): ITelemetryService => {
  if (!telemetryService) {
    telemetryService = new SegmentTelemetryService(apiKey)

    telemetryService.initialize()
  }
  return telemetryService
}

// Check is user give access to collect his events
const checkIsAnalyticsGranted = () =>
  !!get(store.getState(), 'user.settings.config.agreements.analytics', false)

// Telemetry doesn't watch on sending anonymousId like arg of function. Only look at localStorage
const setAnonymousId = (isAnalyticsGranted: boolean) => {
  const anonymousId = isAnalyticsGranted
    ? telemetryService?.anonymousId
    : NON_TRACKING_ANONYMOUS_ID

  localStorageService.set(BrowserStorageItem.segmentAnonymousId, JSON.stringify(anonymousId))
}

const sendEventTelemetry = (payload: ITelemetrySendEvent) => {
  // The event is reported only if the user's permission is granted.
  // The anonymousId is also sent along with the event.
  //
  // The `nonTracking` argument can be set to True to mark an event that doesn't track the specific
  // user in any way. When `nonTracking` is True, the event is sent regardless of whether the user's permission
  // for analytics is granted or not.
  // If permissions not granted anonymousId includes "UNSET" value without any user identifiers.
  const { event, eventData = {}, nonTracking = false } = payload

  const isAnalyticsGranted = checkIsAnalyticsGranted()
  setAnonymousId(isAnalyticsGranted)

  if (isAnalyticsGranted || nonTracking) {
    telemetryService?.event({
      event,
      properties: {
        ...eventData,
      },
    })
  }
}

const sendPageViewTelemetry = (payload: ITelemetrySendPageView) => {
  // The event is reported only if the user's permission is granted.
  // The anonymousId is also sent along with the event.
  //
  // The `nonTracking` argument can be set to True to mark an event that doesn't track the specific
  // user in any way. When `nonTracking` is True, the event is sent regardless of whether the user's permission
  // for analytics is granted or not.
  // If permissions not granted anonymousId includes "UNSET" value without any user identifiers.
  const { name, databaseId, nonTracking = false } = payload

  const isAnalyticsGranted = checkIsAnalyticsGranted()
  setAnonymousId(isAnalyticsGranted)

  if (isAnalyticsGranted || nonTracking) {
    telemetryService?.pageView(name, databaseId)
  }
}

export { getTelemetryService, sendEventTelemetry, sendPageViewTelemetry, checkIsAnalyticsGranted }
