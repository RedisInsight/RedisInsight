import { ipcRenderer } from 'electron'
import { ElectronStorageItem, ipcEvent } from 'uiSrc/electron/constants'

export const ipcDeleteDownloadedVersion = async () => {
  await ipcRenderer.invoke(ipcEvent.deleteStoreValue, ElectronStorageItem.updateDownloadedVersion)
}
