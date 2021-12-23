import { TelemetryEvent } from 'uiSrc/telemetry'

export enum HelpLink {
  CreateRedisCloud = 'createRedisCloud',
  BuildRedisFromSource = 'buildRedisFromSource',
  CreateOnDocker = 'createOnDocker',
  CreateOnMac = 'createOnMac',
}

export const HELP_LINKS = {
  [HelpLink.CreateRedisCloud]: {
    label: 'Limited offer: Up to 6 months free with $200 credits.',
    link: 'https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight',
    event: TelemetryEvent.CREATE_FREE_CLOUD_DATABASE_CLICKED,
    sources: {
      welcome: 'Welcome page',
      databaseList: 'My Redis databases',
      redisearch: 'RediSearch is not loaded'
    }
  },
  [HelpLink.BuildRedisFromSource]: {
    label: 'Build from source',
    link: 'https://developer.redis.com/create/from-source/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight',
    event: TelemetryEvent.BUILD_FROM_SOURCE_CLICKED,
  },
  [HelpLink.CreateOnDocker]: {
    label: 'Docker',
    link: 'https://developer.redis.com/create/docker/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight',
    event: TelemetryEvent.BUILD_USING_DOCKER_CLICKED,
  },
  [HelpLink.CreateOnMac]: {
    label: 'Homebrew',
    link: 'https://developer.redis.com/create/homebrew/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight',
    event: TelemetryEvent.BUILD_USING_HOMEBREW_CLICKED,
  },
}
