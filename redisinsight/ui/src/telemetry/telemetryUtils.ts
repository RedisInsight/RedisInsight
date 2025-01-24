/**
 * Telemetry and analytics module.
 * This module abstracts the exact service/framework used for tracking usage.
 */
import isGlob from 'is-glob'
import { cloneDeep, get } from 'lodash'
import jsonpath from 'jsonpath'
import { Maybe, isRedisearchAvailable } from 'uiSrc/utils'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { IModuleSummary, ITelemetrySendEvent, ITelemetrySendPageView, RedisModulesKeyType } from 'uiSrc/telemetry/interfaces'
import { apiService } from 'uiSrc/services'
import { store } from 'uiSrc/slices/store'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import {
  IRedisModulesSummary,
  MatchType,
  RedisModules,
} from './interfaces'
import { TelemetryEvent } from './events'
import { checkIsAnalyticsGranted } from './checkAnalytics'

export const getProviderData = (dbId: string): {
  provider: Maybe<string>,
  serverName: Maybe<string>
} => {
  let provider
  let serverName
  const instance = get(store.getState(), 'connections.instances.connectedInstance')
  if (instance.id === dbId) {
    provider = instance?.provider
    const instanceOverview = get(store.getState(), 'connections.instances.instanceOverview')
    serverName = instanceOverview?.serverName || undefined
  }
  return { provider, serverName }
}

const FREE_DB_IDENTIFIER_TELEMETRY_EVENTS = [
  TelemetryEvent.INSIGHTS_PANEL_OPENED,
  TelemetryEvent.INSIGHTS_PANEL_CLOSED,
  TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
  TelemetryEvent.EXPLORE_PANEL_COMMAND_COPIED,
  TelemetryEvent.EXPLORE_PANEL_COMMAND_RUN_CLICKED,
  TelemetryEvent.EXPLORE_PANEL_LINK_CLICKED,
]

const getFreeDbFlag = (
  event: TelemetryEvent,
  freeDbEvents: TelemetryEvent[] = FREE_DB_IDENTIFIER_TELEMETRY_EVENTS
): { isFree?: boolean } => {
  if (freeDbEvents.includes(event)) {
    const state = get(store.getState(), 'connections.instances.connectedInstance')
    return state ? { isFree: state.isFreeDb } : {}
  }

  return {}
}

const TELEMETRY_EMPTY_VALUE = 'none'

const sendEventTelemetry = async ({ event, eventData = {}, traits = {} }: ITelemetrySendEvent) => {
  let providerData
  try {
    const isAnalyticsGranted = checkIsAnalyticsGranted()
    if (!isAnalyticsGranted) {
      return
    }

    if (eventData.databaseId) {
      providerData = getProviderData(eventData.databaseId)
    }

    const freeDbIdentifier = getFreeDbFlag(event)

    await apiService.post(`${ApiEndpoints.ANALYTICS_SEND_EVENT}`,
      { event, eventData: { ...providerData, ...eventData, ...freeDbIdentifier }, traits })
  } catch (e) {
    // continue regardless of error
  }
}

const sendPageViewTelemetry = async ({ name, eventData = {} }: ITelemetrySendPageView) => {
  try {
    let providerData
    const isAnalyticsGranted = checkIsAnalyticsGranted()
    if (!isAnalyticsGranted) {
      return
    }
    if (eventData.databaseId) {
      providerData = getProviderData(eventData.databaseId)
    }
    await apiService.post(`${ApiEndpoints.ANALYTICS_SEND_PAGE}`,
      { event: name, eventData: { ...providerData, ...eventData } })
  } catch (e) {
    // continue regardless of error
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
    if (path === '$') {
      return 'root'
    }
    const levelsLength = jsonpath.parse(
      `$${path.startsWith('$') ? '.' : '..'}${path}`,
    ).length

    return levelsLength === 2 ? 'root' : `${levelsLength - 2}`
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
        length: data.elements?.length,
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

const getModuleSummaryToSent = (module: AdditionalRedisModule): IModuleSummary => ({
  loaded: true,
  version: module.version,
  semanticVersion: module.semanticVersion,
})

const getRedisModulesSummary = (modules: AdditionalRedisModule[] = []): IRedisModulesSummary => {
  const summary = cloneDeep(DEFAULT_SUMMARY)
  try {
    modules.forEach(((module) => {
      if (SUPPORTED_REDIS_MODULES[module.name]) {
        const moduleName = getEnumKeyBValue(RedisModules, module.name)
        summary[moduleName as RedisModulesKeyType] = getModuleSummaryToSent(module)
        return
      }

      if (isRedisearchAvailable([module])) {
        const redisearchName = getEnumKeyBValue(RedisModules, RedisModules.RediSearch)
        summary[redisearchName as RedisModulesKeyType] = getModuleSummaryToSent(module)
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
  TELEMETRY_EMPTY_VALUE,
  sendEventTelemetry,
  sendPageViewTelemetry,
  getBasedOnViewTypeEvent,
  getJsonPathLevel,
  getAdditionalAddedEventData,
  getMatchType,
  getRedisModulesSummary,
  getFreeDbFlag,
}
