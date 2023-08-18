import { app, ipcMain } from 'electron'
import { electronStore } from 'desktopSrc/lib'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'

export const initIPCHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.getAppVersion, () => app?.getVersion())

  ipcMain.handle(IpcInvokeEvent.getStoreValue, (_event, key) => electronStore?.get(key))

  ipcMain.handle(IpcInvokeEvent.deleteStoreValue, (_event, key) => electronStore?.delete(key))
}
