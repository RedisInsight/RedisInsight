import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getBackendApp, getWindows } from 'desktopSrc/lib'
import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { CloudAuthIdpType, CloudAuthResponse, CloudAuthStatus } from 'apiSrc/modules/cloud/auth/models'
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID } from 'apiSrc/common/constants'
import { CloudOauthUnexpectedErrorException } from 'apiSrc/modules/cloud/auth/exceptions'
import { CloudAuthService } from '../../../../api/dist/src/modules/cloud/auth/cloud-auth.service'

export const getTokenCallbackFunction = (webContents: WebContents) => (response: CloudAuthResponse) => {
  webContents.send(IpcOnEvent.cloudOauthCallback, response)
  webContents.focus()
}
export const initCloudOauthHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.cloudOauth, async (event, options: {
    strategy: CloudAuthIdpType,
    action?: string,
  }) => {
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

      return {
        status: CloudAuthStatus.Failed,
        error: (new CloudOauthUnexpectedErrorException()).getResponse(),
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
