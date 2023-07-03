import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getBackendApp } from 'desktopSrc/lib'
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
  ipcMain.handle(IpcInvokeEvent.cloudOauth, async (event, idp: CloudAuthIdpType) => {
    try {
      const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)

      if (!authService) {
        throw new Error('Api service doesn\'t support cloud authorization')
      }

      const url = await authService.getAuthorizationUrl({
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
      }, idp, getTokenCallbackFunction(event.sender))

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

export const cloudOauthCallback = async (from?: string) => {
  if (!from) return
  try {
    const url = new URL(from)
    if (url?.pathname === '/cloud/oauth/callback') {
      const authService: CloudAuthService = getBackendApp()?.get?.(CloudAuthService)
      await authService.handleCallback(Object.fromEntries(url.searchParams as any))
    }
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
