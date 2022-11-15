import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import { TelemetryEvent } from './events'

export interface ITelemetryIdentify {
  installationId: string;
  sessionId: number;
}

export interface ITelemetryService {
  initialize(): Promise<void>;
  pageView(name: string, appType: string, databaseId?: string): Promise<void>;
  identify(opts: ITelemetryIdentify): Promise<void>;
  event(opts: ITelemetryEvent): Promise<void>;
  anonymousId: string;
}

export interface ITelemetrySendEvent {
  event: TelemetryEvent;
  eventData?: Object;
  nonTracking?: boolean;
}

export interface ITelemetrySendPageView {
  name: string;
  databaseId?: string;
  nonTracking?: boolean;
}

export interface ITelemetryEvent {
  event: TelemetryEvent;
  properties?: object;
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
  loaded: boolean;
  version?: number;
  semanticVersion?: number;
}
export interface IRedisModulesSummary extends Record<keyof typeof RedisModules, IModuleSummary> {
  customModules: RedisModuleDto[]
}
