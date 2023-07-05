import { AxiosError } from 'axios'
import { isString, set } from 'lodash'
import React from 'react'
import { CustomErrorCodes } from 'uiSrc/constants'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'

export const parseCloudOAuthCallbackError = (err: object | string = DEFAULT_ERROR_MESSAGE): AxiosError => {
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
    case CustomErrorCodes.CloudApiBadRequest:
      title = 'Bad request'
      message = (
        <>
          Your request resulted in an error.
          <br />
          Try again later.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiForbidden:
      title = 'Access denied'
      message = (
        <>
          You do not have permission to access Redis Cloud.
        </>
      )
      break

    case CustomErrorCodes.CloudApiInternalServerError:
      title = 'Server error'
      message = (
        <>
          Try restarting RedisInsight.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiNotFound:
      title = 'Resource was not found'
      message = (
        <>
          Resource requested could not be found.
          <br />
          Try again later.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
        </>
      )
      break

    case CustomErrorCodes.CloudApiUnauthorized:
      title = 'Unauthorized'
      message = (
        <>
          Your Redis Cloud authorization failed.
          <br />
          Try again later.
          <br />
          If the issue persists, <a href="https://github.com/RedisInsight/RedisInsight/issues" target="_blank" rel="noreferrer">report the issue.</a>
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
