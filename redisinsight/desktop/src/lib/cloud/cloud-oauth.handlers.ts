import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { UrlWithParsedQuery } from 'url'
import { createConnection } from 'net'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getBackendApp, getWindows } from 'desktopSrc/lib'

import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'

import { CloudOauthUnexpectedErrorException } from 'apiSrc/modules/cloud/auth/exceptions'
import { CloudAuthService } from 'apiSrc/modules/cloud/auth/cloud-auth.service'
import { CloudAuthRequestOptions, CloudAuthResponse, CloudAuthStatus } from 'apiSrc/modules/cloud/auth/models'
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID } from 'apiSrc/common/constants'

const TCP_LOCAL_CLOUD_AUTH_PORT = process.env.TCP_LOCAL_CLOUD_AUTH_PORT
  ? parseInt(process.env.TCP_LOCAL_CLOUD_AUTH_PORT, 10)
  : 5542

const sendTcpRequest = (data: any): Promise<any> => new Promise((resolve, reject) => {
  const client = createConnection(TCP_LOCAL_CLOUD_AUTH_PORT, 'localhost', () => {
    client.write(JSON.stringify(data))
  })

  let responseData = ''
  client.on('data', (chunk) => {
    responseData += chunk
  })

  client.on('end', () => {
    try {
      const response = JSON.parse(responseData)
      if (response.success) {
        resolve(response)
      } else {
        reject(new Error(response.error))
      }
    } catch (err) {
      reject(err)
    }
  })

  client.on('error', (err) => {
    reject(err)
  })
})

export const getOauthIpcErrorResponse = (error: any): { status: CloudAuthStatus.Failed, error: {} } => {
  let errorResponse = new CloudOauthUnexpectedErrorException().getResponse()

  if (error?.getResponse) {
    errorResponse = error.getResponse()
  } else if (error instanceof Error) {
    errorResponse = new CloudOauthUnexpectedErrorException(error.message).getResponse()
  }

  return {
    status: CloudAuthStatus.Failed,
    error: errorResponse,
  }
}

export const getTokenCallbackFunction = (webContents: WebContents) => (response: CloudAuthResponse) => {
  webContents.send(IpcOnEvent.cloudOauthCallback, response)
  webContents.focus()
}

export const initCloudOauthHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.cloudOauth, async (event, options: CloudAuthRequestOptions) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const { url } = await sendTcpRequest({
          action: 'getAuthUrl',
          options: {
            sessionMetadata: {
              sessionId: DEFAULT_SESSION_ID,
              userId: DEFAULT_USER_ID,
            },
            authOptions: {
              ...options,
              callback: getTokenCallbackFunction(event.sender),
            }
          }
        })

        await open(url)

        return {
          status: CloudAuthStatus.Succeed,
        }
      }

      // Original implementation for non-development environments
      const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)

      if (!authService) {
        throw new Error('Api service doesn\'t support cloud authorization')
      }

      const url = await authService.getAuthorizationUrl({
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
      }, {
        ...options,
        callback: getTokenCallbackFunction(event.sender),
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

      return {
        status: CloudAuthStatus.Failed,
        error,
      }
    }
  })
}

export const cloudOauthCallback = async (url: UrlWithParsedQuery) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      const { result } = await sendTcpRequest({
        action: 'handleCallback',
        options: {
          query: url.query
        }
      })

      const [currentWindow] = getWindows().values()
      if (result.status === CloudAuthStatus.Failed) {
        currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result)
      }
      return
    }

    // Original implementation for non-development environments
    const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)

    // Ignore xdg-open when the same request is being processed.
    if (authService.isRequestInProgress(url.query)) {
      return
    }

    const result = await authService.handleCallback(url.query)

    if (result.status === CloudAuthStatus.Failed) {
      const [currentWindow] = getWindows().values()

      currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result)
    }

    // complete auth request processing
    authService.finishInProgressRequest(url.query)
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
