import { ipcRenderer } from 'electron'
import { ElectronStorageItem, IpcEvent } from 'uiSrc/electron/constants'

export const ipcDeleteDownloadedVersion = async () => {
  await ipcRenderer.invoke(IpcEvent.deleteStoreValue, ElectronStorageItem.updateDownloadedVersion)
}
