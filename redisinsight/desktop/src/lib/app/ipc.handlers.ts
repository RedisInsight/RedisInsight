import { app, ipcMain } from 'electron'
import { electronStore } from 'desktopSrc/lib'
import { IpcEvent } from 'uiSrc/electron/constants'

export const initIPCHandlers = () => {
  ipcMain.handle(IpcEvent.getAppVersion, () => app?.getVersion())

  ipcMain.handle(IpcEvent.getStoreValue, (_event, key) => electronStore?.get(key))

  ipcMain.handle(IpcEvent.deleteStoreValue, (_event, key) => electronStore?.delete(key))
}
