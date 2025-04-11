import { UTM_MEDIUMS } from 'uiSrc/constants/links'
import { Instance, RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { Nullable } from '.'

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

export interface Bdb {
  id: number
  name: string
  access_control?: {
    redis_password?: string
    has_ssl_auth?: boolean
    enforce_client_authentication?: boolean
  }
}
export interface Plan {
  plan_type: string
  size: number
}
export interface BuildRedisInsightUrlParams {
  endpoint: string
  bdb: Instance
  plan: CloudSubscriptionPlan
  subscription: Nullable<RedisCloudSubscription>
}
const RI_PROTOCOL_SCHEMA = 'redisinsight://'
export const buildRedisInsightUrl = ({
  endpoint,
  bdb,
  subscription,
  plan,
}: BuildRedisInsightUrlParams) => {
  if (!bdb) {
    return ''
  }
  const defaultPassword = bdb.password

  const dbUrl = defaultPassword
    ? `redis://default:${defaultPassword}@${endpoint}`
    : `redis://@${endpoint}`

  const params: Record<string, string> = {
    redisUrl: dbUrl,
    cloudBdbId: bdb.id.toString(),
    databaseAlias: bdb.nameFromProvider || '',
  }

  if (bdb.tls) {
    // requiredTls is for backwards compatibility, in the future we may remove it
    params.requiredTls = 'true'
    params.requiredCaCert = 'true'
  }

  if (bdb.tlsClientAuthRequired) {
    params.requiredClientCert = 'true'
  }

  if (plan) {
    if (subscription.type === 'fixed') {
      params.planMemoryLimit = planMemoryLimit;
      params.memoryLimitMeasurementUnit = memoryLimitMeasurementUnit
      if (subscription.free === true) {
        params.free = 'true'
      }
    }
  }

  return `${RI_PROTOCOL_SCHEMA}databases/connect${appendParams(params)}`
}

const appendParams = (params: Record<string, string>) =>
  Object.entries(params).reduce(
    (acc, [key, value], index) =>
      acc.concat(`${index === 0 ? '?' : '&'}${key}=${encodeURIComponent(value)}`),
    ''
  )
