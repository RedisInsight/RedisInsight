import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getBackendApp, getWindows } from 'desktopSrc/lib'
import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { 
  CloudAuthRequestOptions, 
  CloudAuthResponse, 
  CloudAuthStatus 
} from 'desktopSrc/types/cloud-auth'
const { DEFAULT_SESSION_ID, DEFAULT_USER_ID } = importApiModule('dist/src/common/constants')
const { CloudOauthUnexpectedErrorException } = importApiModule('dist/src/modules/cloud/auth/exceptions')
const { CloudAuthService } = importApiModule('dist/src/modules/cloud/auth/cloud-auth.service')
import { importApiModule } from 'desktopSrc/api-imports'

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
    const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)
    const result = await authService.handleCallback(url.query)

    if (result.status === CloudAuthStatus.Failed) {
      const [currentWindow] = getWindows().values()

      currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result)
    }
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
