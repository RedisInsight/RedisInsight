import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

export const EXTERNAL_LINKS = {
  githubRepo: 'https://github.com/Redis-Insight/Redis-Insight',
  githubIssues: 'https://github.com/Redis-Insight/Redis-Insight/issues',
  releaseNotes: 'https://github.com/Redis-Insight/Redis-Insight/releases',
  userSurvey: 'https://www.surveymonkey.com/r/redisinsight',
  recommendationFeedback: 'https://github.com/Redis-Insight/Redis-Insight/issues/new/choose',
  guidesRepo: 'https://github.com/Redis-Insight/Tutorials',
  redisStack: 'hhttps://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/',
  cloudConsole: 'https://app.redislabs.com/#/databases',
  tryFree: 'https://redis.com/try-free',
  docker: 'https://redis.io/docs/getting-started/install-stack/docker',
}

export const UTM_CAMPAINGS: Record<any, string> = {
  [OAuthSocialSource.Tutorials]: 'redisinsight_tutorials',
  [OAuthSocialSource.BrowserSearch]: 'redisinsight_browser_search',
  [OAuthSocialSource.Workbench]: 'redisinsight_workbench',
  [CloudSsoUtmCampaign.BrowserFilter]: 'browser_filter',
}
