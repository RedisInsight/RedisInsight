import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

// Map oauth social source to utm campaign parameter
export const getCloudSsoUtmCampaign = (source?: string | null): CloudSsoUtmCampaign => {
  switch (source) {
    case OAuthSocialSource.ListOfDatabases:
      return CloudSsoUtmCampaign.ListOfDatabases
    case OAuthSocialSource.BrowserSearch:
      return CloudSsoUtmCampaign.BrowserSearch
    case OAuthSocialSource.RediSearch:
    case OAuthSocialSource.RedisJSON:
    case OAuthSocialSource.RedisTimeSeries:
    case OAuthSocialSource.RedisGraph:
    case OAuthSocialSource.RedisBloom:
    case OAuthSocialSource['triggers and functions']:
      return CloudSsoUtmCampaign.Workbench
    case OAuthSocialSource.BrowserContentMenu:
      return CloudSsoUtmCampaign.BrowserOverview
    case OAuthSocialSource.BrowserFiltering:
      return CloudSsoUtmCampaign.BrowserFilter
    case OAuthSocialSource.WelcomeScreen:
      return CloudSsoUtmCampaign.WelcomeScreen
    case OAuthSocialSource.TriggersAndFunctions:
      return CloudSsoUtmCampaign.TriggersAndFunctions
    case OAuthSocialSource.Tutorials:
      return CloudSsoUtmCampaign.Tutorial
    case OAuthSocialSource.Autodiscovery:
      return CloudSsoUtmCampaign.AutoDiscovery
    default:
      return CloudSsoUtmCampaign.Unknown
  }
}

// Create search query utm parameters
export const getCloudSsoUtmParams = (source?: string | null): URLSearchParams => new URLSearchParams([
  ['source', 'redisinsight'],
  ['medium', 'sso'], // todo: distinguish between electron and web?
  ['campaign', getCloudSsoUtmCampaign(source)],
])
