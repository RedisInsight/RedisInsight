import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'
import {
  CloudAuthRequestOptions,
  CloudAuthResponse,
  CloudAuthResponseStatusEnum as CloudAuthStatus,
} from 'uiSrc/api-client'

import { createAuthStrategy } from '../auth/auth.factory'
import { getWindows } from '../window/browserWindow'

const authStrategy = createAuthStrategy()
// ref: /api/src/common/constants/user.ts
const DEFAULT_USER_ID = '1'
const DEFAULT_SESSION_ID = '1'
// ref: /api/src/modules/cloud/auth/exceptions/cloud-oauth.unexpected-error.exception.ts
class CloudOauthUnexpectedErrorException {
  constructor(private message = 'Cloud OAuth unexpected error') {}

  getResponse() {
    return {
      message: this.message,
      statusCode: 500,
      error: 'CloudOauthUnexpectedError',
      errorCode: 11008, // CustomErrorCodes.CloudOauthUnexpectedError
    }
  }
}

export const getOauthIpcErrorResponse = (
  error: any,
): { status: CloudAuthStatus; error: {} } => {
  let errorResponse = new CloudOauthUnexpectedErrorException().getResponse()

  if (error?.getResponse) {
    errorResponse = error.getResponse()
  } else if (error instanceof Error) {
    errorResponse = new CloudOauthUnexpectedErrorException(
      error.message,
    ).getResponse()
  }

  return {
    status: CloudAuthStatus.Failed,
    error: errorResponse,
  }
}

export const getTokenCallbackFunction =
  (webContents: WebContents) => (response: CloudAuthResponse) => {
    webContents.send(IpcOnEvent.cloudOauthCallback, response)
    webContents.focus()
  }

export const initCloudOauthHandlers = () => {
  ipcMain.handle(
    IpcInvokeEvent.cloudOauth,
    async (event, options: CloudAuthRequestOptions) => {
      try {
        await authStrategy.initialize()
        const { url } = await authStrategy.getAuthUrl({
          sessionMetadata: {
            sessionId: DEFAULT_SESSION_ID,
            userId: DEFAULT_USER_ID,
          },
          authOptions: {
            ...options,
            callback: getTokenCallbackFunction(event?.sender as WebContents),
          },
        })

        await open(url)

        return {
          status: CloudAuthStatus.Succeed,
        }
      } catch (e) {
        log.error(wrapErrorMessageSensitiveData(e as Error))
        const error = getOauthIpcErrorResponse(e)
        const [currentWindow] = getWindows().values()
        currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, error)
        return error
      }
    },
  )
}

export const cloudOauthCallback = async (url: UrlWithParsedQuery) => {
  try {
    const result = await authStrategy.handleCallback(url.query)

    if (result.status === CloudAuthStatus.Failed) {
      const [currentWindow] = getWindows().values()
      currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result)
    }
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
