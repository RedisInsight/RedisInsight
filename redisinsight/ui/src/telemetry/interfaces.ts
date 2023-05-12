import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { TelemetryEvent } from './events'

export interface ITelemetryIdentify {
  installationId: string
  sessionId: number
}

export interface ITelemetryService {
  initialize(): Promise<void>
  pageView(
    name: string,
    params: {
      buildType?: string
      controlBucket?: string
      controlGroup?: number
      databaseId?: string
    }
  ): Promise<void>
  identify(opts: ITelemetryIdentify): Promise<void>
  event(opts: ITelemetryEvent): Promise<void>
  anonymousId: string
}

export interface ITelemetrySendEvent {
  event: TelemetryEvent
  eventData?: Object
  nonTracking?: boolean
}

export interface ITelemetrySendPageView {
  name: string
  databaseId?: string
  nonTracking?: boolean
}

export interface ITelemetryEvent {
  event: TelemetryEvent
  properties?: object
}

export enum MatchType {
  EXACT_VALUE_NAME = 'EXACT_VALUE_NAME',
  PATTERN = 'PATTERN'
}

export enum RedisModules {
  RedisAI = 'ai',
  RedisGraph = 'graph',
  RedisGears = 'rg',
  RedisBloom = 'bf',
  RedisJSON = 'ReJSON',
  RediSearch = 'search',
  RedisTimeSeries = 'timeseries',
}

interface IModuleSummary {
  loaded: boolean
  version?: number
  semanticVersion?: number
}
export interface IRedisModulesSummary extends Record<keyof typeof RedisModules, IModuleSummary> {
  customModules: AdditionalRedisModule[]
}
