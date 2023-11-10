export interface UTMParams {
  source?: string
  medium?: string
  campaign: string
}

export const getUtmExternalLink = (baseUrl: string, params: UTMParams) => {
  const { source = 'redisinsight', medium = 'app', campaign } = params
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
