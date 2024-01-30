import { Maybe, Nullable } from 'uiSrc/utils/types'

/*
  redis[s]://               - Protocol (redis or rediss)
  [username][:password]@    - Optional username and password
  host                      - Hostname or IP address
  [:port]                   - Optional port
  [/db-number]              - Optional database number
*/

interface ParsedRedisUrl {
  protocol: string
  username: string
  password: string
  host: string
  port: Maybe<number>
  dbNumber: Maybe<number>
}

const parseRedisUrl = (urlString: string): Nullable<ParsedRedisUrl> => {
  // eslint-disable-next-line no-useless-escape
  const redisUrlPattern = /^(redis[s]?):\/\/(?:([^:@]+)?(?::([^@]+))?@)?([^:\/]+)(?::(\d+))?(?:\/(\d+))?$/
  const match = urlString.match(redisUrlPattern)

  if (!match) {
    return null
  }

  const [, protocol, username, password, host, port, dbNumber] = match

  return {
    protocol,
    username: username || '',
    password: password || '',
    host,
    port: port ? parseInt(port, 10) : undefined,
    dbNumber: dbNumber ? parseInt(dbNumber, 10) : undefined
  }
}

export {
  parseRedisUrl
}
