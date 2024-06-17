import { UTM_MEDIUMS } from 'uiSrc/constants/links'

export interface UTMParams {
  source?: string
  medium?: string
  campaign: string
}

export const getUtmExternalLink = (baseUrl: string, params: UTMParams) => {
  const { source = 'redisinsight', medium = UTM_MEDIUMS.App, campaign } = params
  try {
    const url = new URL(baseUrl)
    url.searchParams.append('utm_source', source)
    url.searchParams.append('utm_medium', medium)
    url.searchParams.append('utm_campaign', campaign)
    return url.toString()
  } catch (e) {
    return baseUrl
  }
}
