import {
  getUtmExternalLink,
  buildRedisInsightUrl,
  UTMParams,
} from 'uiSrc/utils/links'
import { Instance } from 'uiSrc/slices/interfaces'

const addUtmToLinkTests: Array<{
  input: [string, UTMParams]
  expected: string
}> = [
  {
    input: ['http://www.google.com', { campaign: 'name' }],
    expected:
      'http://www.google.com/?utm_source=redisinsight&utm_medium=app&utm_campaign=name',
  },
  {
    input: ['http://www.google.com', { campaign: 'name', medium: 'main' }],
    expected:
      'http://www.google.com/?utm_source=redisinsight&utm_medium=main&utm_campaign=name',
  },
  {
    input: [
      'http://www.google.com',
      { campaign: 'name', medium: 'main', source: 'source' },
    ],
    expected:
      'http://www.google.com/?utm_source=source&utm_medium=main&utm_campaign=name',
  },
]

describe('getUtmExternalLink', () => {
  test.each(addUtmToLinkTests)('%j', ({ input, expected }) => {
    const result = getUtmExternalLink(...input)
    expect(result).toEqual(expected)
  })
})

const buildRedisInsightUrlTests: Array<{
  input: Instance
  expected: string
}> = [
  {
    input: {
      id: '0',
      host: 'localhost',
      port: 6379,
      name: 'TestInstance',
      tls: false,
      tlsClientAuthRequired: false,
      cloudDetails: {
        subscriptionId: 0,
        cloudId: 123,
        subscriptionType: 'fixed',
        planMemoryLimit: 1024,
        memoryLimitMeasurementUnit: 'MB',
        free: true,
      },
      modules: [],
      version: '1.0.0',
    },
    expected:
      'redisinsight://databases/connect?redisUrl=redis%3A%2F%2F%40localhost%3A6379&cloudBdbId=123&databaseAlias=TestInstance&subscriptionType=fixed&planMemoryLimit=1024&memoryLimitMeasurementUnit=MB&free=true',
  },
  {
    input: {
      id: '1',
      host: '127.0.0.1',
      port: 6380,
      name: '',
      tls: true,
      tlsClientAuthRequired: true,
      modules: [],
      version: '1.0.0',
    },
    expected:
      'redisinsight://databases/connect?redisUrl=redis%3A%2F%2F%40127.0.0.1%3A6380&cloudBdbId=&databaseAlias=&requiredTls=true&requiredCaCert=true&requiredClientCert=true',
  },
  {
    input: {
      id: '2',
      host: 'example.com',
      port: 6379,
      name: 'ExampleInstance',
      tls: true,
      tlsClientAuthRequired: false,
      modules: [],
      version: '1.0.0',
    },
    expected:
      'redisinsight://databases/connect?redisUrl=redis%3A%2F%2F%40example.com%3A6379&cloudBdbId=&databaseAlias=ExampleInstance&requiredTls=true&requiredCaCert=true',
  },
]

describe('buildRedisInsightUrl', () => {
  test.each(buildRedisInsightUrlTests)('%j', ({ input, expected }) => {
    const result = buildRedisInsightUrl(input)
    expect(result).toEqual(expected)
  })
})
