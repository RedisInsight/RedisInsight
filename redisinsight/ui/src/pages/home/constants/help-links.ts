import { TelemetryEvent } from 'uiSrc/telemetry'

export enum HelpLink {
  CreateRedisCloud = 'createRedisCloud',
  BuildRedisFromSource = 'buildRedisFromSource',
  CreateOnDocker = 'createOnDocker',
  CreateOnMac = 'createOnMac',
}

export const HELP_LINKS = {
  [HelpLink.CreateRedisCloud]: {
    label: 'Create a FREE on Redis Cloud',
    link: 'https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight',
    event: TelemetryEvent.CONFIG_DATABASES_GET_REDIS_CLOUD_ACCOUNT_CLICKED
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
