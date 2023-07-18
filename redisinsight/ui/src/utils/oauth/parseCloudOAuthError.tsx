import { AxiosError } from 'axios'
import { isString, set } from 'lodash'
import React from 'react'
import { EuiSpacer } from '@elastic/eui'
import { CustomErrorCodes } from 'uiSrc/constants'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'

export const parseCloudOAuthError = (err: object | string = DEFAULT_ERROR_MESSAGE): AxiosError => {
  const error = {
    response: {
      status: 500,
      data: { },
    },
  }

  if (isString(err)) {
    return set(error, 'response.data.message', err) as AxiosError
  }

  let title: string = 'Error'
  let message: React.ReactElement | string = ''

  switch (err?.errorCode) {
    case CustomErrorCodes.CloudOauthGithubEmailPermission:
      title = 'Github Email Permission'
      message = (
        <>
          Unable to get an email from the GitHub account. Make sure that it is available.
          <br />
        </>
      )
      break
    case CustomErrorCodes.CloudOauthMisconfiguration:
      title = 'Misconfiguration'
      message = (
        <>
          Authorization server encountered a misconfiguration error and was unable to complete your request.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnknownAuthorizationRequest:
      title = 'Error'
      message = (
        <>
          Unknown authorization request.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudOauthUnexpectedError:
      title = 'Error'
      message = (
        <>
          An unexpected error occurred.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break
    case CustomErrorCodes.CloudApiBadRequest:
      title = 'Bad request'
      message = (
        <>
          Your request resulted in an error.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiForbidden:
      title = 'Access denied'
      message = (
        <>
          You do not have permission to access Redis Enterprise Cloud.
        </>
      )
      break

    case CustomErrorCodes.CloudApiInternalServerError:
      title = 'Server error'
      message = (
        <>
          Try restarting RedisInsight.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiNotFound:
      title = 'Resource was not found'
      message = (
        <>
          Resource requested could not be found.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiUnauthorized:
      title = 'Unauthorized'
      message = (
        <>
          Your Redis Enterprise Cloud authorization failed.
          <EuiSpacer size="xs" />
          Try again later.
          <EuiSpacer size="s" />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
      title = 'Database already exists'
      message = (
        <>
          You already have a free Redis Enterprise Cloud database running.
          <EuiSpacer size="s" />
          Check out your <a href="https://app.redislabs.com/#/databases/?utm_source=redisinsight&utm_medium=main&utm_campaign=main" target="_blank" rel="noreferrer">Cloud console</a> for connection details.
        </>
      )
      break

    default:
      title = 'Error'
      message = error?.message || DEFAULT_ERROR_MESSAGE
      break
  }

  return set(error, 'response.data', { title, message }) as AxiosError
}
