import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

export const EXTERNAL_LINKS = {
  githubRepo: 'https://github.com/RedisInsight/RedisInsight',
  githubIssues: 'https://github.com/RedisInsight/RedisInsight/issues',
  releaseNotes: 'https://github.com/RedisInsight/RedisInsight/releases',
  userSurvey: 'https://www.surveymonkey.com/r/redisinsight',
  recommendationFeedback: 'https://github.com/RedisInsight/RedisInsight/issues/new/choose',
  guidesRepo: 'https://github.com/RedisInsight/Tutorials',
  redisStack: 'https://redis.io/docs/about/about-stack/',
  cloudConsole: 'https://app.redislabs.com/#/databases',
  tryFree: 'https://redis.com/try-free',
  docker: 'https://redis.io/docs/getting-started/install-stack/docker',
  rdiQuickStart: 'https://docs.redis.com/latest/rdi/quickstart/',
}

export const UTM_CAMPAINGS: Record<any, string> = {
  [OAuthSocialSource.Tutorials]: 'redisinsight_tutorials',
  [OAuthSocialSource.BrowserSearch]: 'redisinsight_browser_search',
  [OAuthSocialSource.Workbench]: 'redisinsight_workbench',
  [CloudSsoUtmCampaign.BrowserFilter]: 'browser_filter',
}
