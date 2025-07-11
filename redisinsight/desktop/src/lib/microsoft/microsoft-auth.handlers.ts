import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { AuthProviderType } from 'apiSrc/modules/auth/microsoft-auth/models/auth-types'
import { createAuthStrategy } from '../auth/auth.factory'
import { getWindows } from '../window/browserWindow'

const authStrategy = createAuthStrategy()

export const getMicrosoftTokenCallbackFunction = (webContents: WebContents) => (response: any) => {
  webContents.send(IpcOnEvent.microsoftAuthCallback, response)
  webContents.focus()
}

export const getMicrosoftTokenEditCallbackFunction = (webContents: WebContents) => (response: any) => {
  webContents.send(IpcOnEvent.microsoftAuthEditCallback, response)
  webContents.focus()
}

export const initMicrosoftAuthHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.microsoftAuth, async (event, options) => {
    try {
      await authStrategy.initialize()
      const { url } = await authStrategy.getAuthUrl({
        authOptions: {
          ...options,
          strategy: AuthProviderType.Microsoft,
          callback: getMicrosoftTokenCallbackFunction(event?.sender as WebContents),
          databaseId: options.data?.databaseId
        }
      })

      await open(url)

      return {
        status: 'success'
      }
    } catch (e) {
      log.error(wrapErrorMessageSensitiveData(e as Error))
      const [currentWindow] = getWindows().values()
      currentWindow?.webContents.send(IpcOnEvent.microsoftAuthCallback, {
        status: 'failed',
        error: e
      })
      return {
        status: 'failed',
        error: e
      }
    }
  })

  ipcMain.handle(IpcInvokeEvent.microsoftAuthEdit, async (event, options) => {
    try {
      await authStrategy.initialize()
      const { url } = await authStrategy.getAuthUrl({
        authOptions: {
          ...options,
          strategy: AuthProviderType.Microsoft,
          callback: getMicrosoftTokenEditCallbackFunction(event?.sender as WebContents),
          databaseId: options.data?.databaseId
        }
      })

      await open(url)

      return {
        status: 'success'
      }
    } catch (e) {
      log.error(wrapErrorMessageSensitiveData(e as Error))
      const [currentWindow] = getWindows().values()
      currentWindow?.webContents.send(IpcOnEvent.microsoftAuthEditCallback, {
        status: 'failed',
        error: e
      })
      return {
        status: 'failed',
        error: e
      }
    }
  })
}
