import { parseRedisUrl } from 'uiSrc/utils/parseRedisUrl'

const defaultRedisParams = {
  username: '',
  password: '',
  port: undefined,
  dbNumber: undefined
}

const parseRedisUrlTests: Array<[string, any]> = [
  [
    'http://user:pass@localhost:6380',
    null
  ],
  [
    'redis://:@localhost:6380',
    null
  ],
  [
    'redis://us@er:pass@localhost:6380',
    null
  ],
  [
    'redis://localhost',
    { ...defaultRedisParams, protocol: 'redis', host: 'localhost' }
  ],
  [
    'redis://localhost:6380',
    { ...defaultRedisParams, protocol: 'redis', host: 'localhost', port: 6380 }
  ],
  [
    'redis://@localhost:6380',
    { ...defaultRedisParams, protocol: 'redis', host: 'localhost', port: 6380 }
  ],
  [
    'redis://user@localhost:6380',
    { ...defaultRedisParams, username: 'user', protocol: 'redis', host: 'localhost', port: 6380 }
  ],
  [
    'redis://:pass@localhost:6380',
    { ...defaultRedisParams, protocol: 'redis', password: 'pass', host: 'localhost', port: 6380 }
  ],
  [
    'redis://user:pass@localhost:6380',
    { ...defaultRedisParams, protocol: 'redis', username: 'user', password: 'pass', host: 'localhost', port: 6380 }
  ],
  [
    'rediss://user:pa%712ss@localhost:6380',
    { ...defaultRedisParams, protocol: 'rediss', username: 'user', password: 'pa%712ss', host: 'localhost', port: 6380 }
  ],
  [
    'rediss://d&&21^$:pa%712ss@local-host-123.net.com:6380',
    { ...defaultRedisParams, protocol: 'rediss', username: 'd&&21^$', password: 'pa%712ss', host: 'local-host-123.net.com', port: 6380 }
  ],
  [
    'rediss://user:pa%712ss@localhost:6380/2',
    { protocol: 'rediss', username: 'user', password: 'pa%712ss', host: 'localhost', port: 6380, dbNumber: 2 }
  ],
]

describe('parseRedisUrl', () => {
  it.each(parseRedisUrlTests)('for input: %s (index), %s (shift), should be output: %s',
    (url, expected) => {
      const result = parseRedisUrl(url)
      expect(result).toEqual(expected)
    })
})
