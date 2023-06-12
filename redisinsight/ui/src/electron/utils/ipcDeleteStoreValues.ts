import { ElectronStorageItem, IpcEvent } from 'uiSrc/electron/constants'

export const ipcDeleteDownloadedVersion = async () => {
  await window.electron.ipcRenderer.invoke(IpcEvent.deleteStoreValue, ElectronStorageItem.updateDownloadedVersion)
}
