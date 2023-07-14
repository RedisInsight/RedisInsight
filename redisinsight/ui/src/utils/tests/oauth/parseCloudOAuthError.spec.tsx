import { set, cloneDeep } from 'lodash'
import React from 'react'
import { parseCloudOAuthError } from 'uiSrc/utils'

const responseData = { response: { data: { }, status: 500 } }

const parseCloudOAuthErrorTests = [
  [undefined, set(cloneDeep(responseData), 'response.data', { message: 'Something was wrong!' })],
  ['', set(cloneDeep(responseData), 'response.data', { message: '' })],
  ['test', set(cloneDeep(responseData), 'response.data', { message: 'test' })],
  [{ errorCode: 11_003 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Bad request',
      message: (
        <>
          Your request resulted in an error.
          <br />
          Try again later.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 11_002 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Access denied',
      message: (
        <>
          You do not have permission to access Redis Enterprise Cloud.
        </>
      )
    })],
  [{ errorCode: 11_000 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Server error',
      message: (
        <>
          Try restarting RedisInsight.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 11_004 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Resource was not found',
      message: (
        <>
          Resource requested could not be found.
          <br />
          Try again later.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 11_001 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Unauthorized',
      message: (
        <>
          Your Redis Enterprise Cloud authorization failed.
          <br />
          Try again later.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 111_001 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Error',
      message: 'Something was wrong!',
    })],
  [{ errorCode: 11_108 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Error',
      message: (
        <>
          You already have a free Redis Enterprise Cloud database running.
          <br />
          Check out your <a href="https://app.redislabs.com/#/databases/?utm_source=redisinsight&utm_medium=main&utm_campaign=main" target="_blank" rel="noreferrer">Cloud console</a> for connection details.
        </>
      )
    })],
]

describe('parseCloudOAuthError', () => {
  test.each(parseCloudOAuthErrorTests)(
    '%j',
    (input, expected) => {
      const result = parseCloudOAuthError(input)
      expect(result).toEqual(expected)
    }
  )
})
