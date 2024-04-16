import { set, cloneDeep } from 'lodash'
import React from 'react'
import { EuiSpacer } from '@elastic/eui'
import { AxiosError } from 'axios'
import { parseCustomError } from 'uiSrc/utils'
import { CustomError } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

const responseData = { response: { data: { }, status: 500 } }

const parseCustomErrorTests = [
  [undefined, set(cloneDeep(responseData), 'response.data', { message: 'Something was wrong!' })],
  ['', set(cloneDeep(responseData), 'response.data', { message: '' })],
  ['test', set(cloneDeep(responseData), 'response.data', { message: 'test' })],
  [{ errorCode: 11_003 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Bad request',
      message: (
        <>
          Your request resulted in an error.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 11_002 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Access denied',
      message: (
        <>
          You do not have permission to access Redis Cloud.
        </>
      )
    })],
  [{ errorCode: 11_000 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Server error',
      message: (
        <>
          Try restarting Redis Insight.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 11_004 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Resource was not found',
      message: (
        <>
          Resource requested could not be found.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
    })],
  [{ errorCode: 11_001 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Unauthorized',
      message: (
        <>
          Your Redis Cloud authorization failed.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href={EXTERNAL_LINKS.githubIssues} target="_blank" rel="noreferrer">report the issue.</a>
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
      title: 'Database already exists',
      message: (
        <>
          You already have a free Redis Cloud database running.
          <EuiSpacer size="s" />
          Check out your <a href="https://app.redislabs.com/#/databases/?utm_source=redisinsight&utm_medium=main&utm_campaign=main" target="_blank" rel="noreferrer">Cloud console</a> for connection details.
        </>
      )
    })],
  [{ errorCode: 11_022 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Invalid API key',
      message: (
        <>
          Your Redis Cloud authorization failed.
          <EuiSpacer size="xs" />
          Remove the invalid API key from Redis Insight and try again.
          <EuiSpacer size="s" />
          Open the Settings page to manage Redis Cloud API keys.
        </>
      ),
      additionalInfo: {
        errorCode: 11022,
        resourceId: undefined
      }
    })],
  [{ errorCode: 11_301 },
    set(cloneDeep(responseData), 'response.data', {
      title: 'Pipeline not deployed',
      message: 'Unfortunately we’ve found some errors in your pipeline.',
      additionalInfo: {
        errorCode: 11301,
      }
    })],
]

describe('parseCustomError', () => {
  test.each(parseCustomErrorTests as [string | CustomError, AxiosError][])(
    '%j',
    (input, expected) => {
      const result = parseCustomError(input)
      expect(result).toEqual(expected)
    }
  )
})
