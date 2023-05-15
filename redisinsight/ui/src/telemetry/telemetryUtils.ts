/**
 * Telemetry and analytics module.
 * This module abstracts the exact service/framework used for tracking usage.
 */
import isGlob from 'is-glob'
import { cloneDeep } from 'lodash'
import * as jsonpath from 'jsonpath'
import { isRedisearchAvailable, Nullable } from 'uiSrc/utils'
import { localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem, KeyTypes, StreamViews } from 'uiSrc/constants'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { checkIsAnalyticsGranted, getInfoServer } from 'uiSrc/telemetry/checkAnalytics'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import {
  ITelemetrySendEvent,
  ITelemetrySendPageView,
  ITelemetryService,
  IRedisModulesSummary,
  MatchType,
  RedisModules,
} from './interfaces'
import { TelemetryEvent } from './events'
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

  const { appType: buildType, controlNumber, controlGroup } = getInfoServer() as Record<string, any>

  if (isAnalyticsGranted || nonTracking) {
    return telemetryService?.event({
      event,
      properties: {
        buildType,
        controlNumber,
        controlGroup,
        ...eventData,
      },
    })
  }
  return null
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

  const { appType: buildType, controlNumber, controlGroup } = getInfoServer() as Record<string, any>

  if (isAnalyticsGranted || nonTracking) {
    telemetryService?.pageView(
      name,
      {
        buildType,
        controlNumber,
        controlGroup,
        databaseId
      }
    )
  }
}

const getBasedOnViewTypeEvent = (
  viewType: KeyViewType,
  browserEvent: TelemetryEvent,
  treeViewEvent: TelemetryEvent
): TelemetryEvent => {
  switch (viewType) {
    case KeyViewType.Browser:
      return browserEvent
    case KeyViewType.Tree:
      return treeViewEvent
    default:
      return browserEvent
  }
}

const getJsonPathLevel = (path: string): string => {
  try {
    if (path === '.') {
      return 'root'
    }
    const levelsLength = jsonpath.parse(
      `$${path.startsWith('.') ? '' : '..'}${path}`,
    ).length
    if (levelsLength === 1) {
      return 'root'
    }
    return `${levelsLength - 2}`
  } catch (e) {
    return 'root'
  }
}

const getAdditionalAddedEventData = (endpoint: ApiEndpoints, data: any) => {
  switch (endpoint) {
    case ApiEndpoints.HASH:
      return {
        keyType: KeyTypes.Hash,
        length: data.fields?.length,
        TTL: data.expire || -1
      }
    case ApiEndpoints.SET:
      return {
        keyType: KeyTypes.Set,
        length: data.members?.length,
        TTL: data.expire || -1
      }
    case ApiEndpoints.ZSET:
      return {
        keyType: KeyTypes.ZSet,
        length: data.members?.length,
        TTL: data.expire || -1
      }
    case ApiEndpoints.STRING:
      return {
        keyType: KeyTypes.String,
        length: data.value?.length,
        TTL: data.expire || -1
      }
    case ApiEndpoints.LIST:
      return {
        keyType: KeyTypes.List,
        length: 1,
        TTL: data.expire || -1
      }
    case ApiEndpoints.REJSON:
      return {
        keyType: KeyTypes.ReJSON,
        TTL: -1
      }
    case ApiEndpoints.STREAMS:
      return {
        keyType: KeyTypes.Stream,
        length: 1,
        TTL: data.expire || -1
      }
    default:
      return {}
  }
}

const getMatchType = (match: string): MatchType => (
  !isGlob(match, { strict: false })
    ? MatchType.EXACT_VALUE_NAME
    : MatchType.PATTERN
)

export const getRefreshEventData = (eventData: any, type: string, streamViewType?: StreamViewType) => {
  if (type === KeyTypes.Stream) {
    return {
      ...eventData,
      streamView: StreamViews[streamViewType!]
    }
  }
  return eventData
}

const SUPPORTED_REDIS_MODULES = Object.freeze({
  ai: RedisModules.RedisAI,
  graph: RedisModules.RedisGraph,
  rg: RedisModules.RedisGears,
  bf: RedisModules.RedisBloom,
  ReJSON: RedisModules.RedisJSON,
  search: RedisModules.RediSearch,
  timeseries: RedisModules.RedisTimeSeries,
})

const DEFAULT_SUMMARY: IRedisModulesSummary = Object.freeze(
  {
    RediSearch: { loaded: false },
    RedisAI: { loaded: false },
    RedisGraph: { loaded: false },
    RedisGears: { loaded: false },
    RedisBloom: { loaded: false },
    RedisJSON: { loaded: false },
    RedisTimeSeries: { loaded: false },
    customModules: [],
  },
)

const getEnumKeyBValue = (myEnum: any, enumValue: number | string): string => {
  const keys = Object.keys(myEnum)
  const index = keys.findIndex((x) => myEnum[x] === enumValue)
  return index > -1 ? keys[index] : ''
}

const getRedisModulesSummary = (modules: AdditionalRedisModule[] = []): IRedisModulesSummary => {
  const summary = cloneDeep(DEFAULT_SUMMARY)
  try {
    modules.forEach(((module) => {
      if (SUPPORTED_REDIS_MODULES[module.name]) {
        const moduleName = getEnumKeyBValue(RedisModules, module.name)
        summary[moduleName] = {
          loaded: true,
          version: module.version,
          semanticVersion: module.semanticVersion,
        }
        return
      }

      if (isRedisearchAvailable([module])) {
        const redisearchName = getEnumKeyBValue(RedisModules, RedisModules.RediSearch)
        summary[redisearchName] = {
          loaded: true,
          version: module.version,
          semanticVersion: module.semanticVersion,
        }
        return
      }

      summary.customModules.push(module)
    }))
  } catch (e) {
    // continue regardless of error
  }
  return summary
}

export {
  getTelemetryService,
  sendEventTelemetry,
  sendPageViewTelemetry,
  checkIsAnalyticsGranted,
  getBasedOnViewTypeEvent,
  getJsonPathLevel,
  getAdditionalAddedEventData,
  getMatchType,
  getRedisModulesSummary
}
