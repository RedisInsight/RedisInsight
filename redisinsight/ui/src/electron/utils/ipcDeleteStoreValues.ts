import { ElectronStorageItem, IpcEvent } from 'uiSrc/electron/constants'

export const ipcDeleteDownloadedVersion = async () => {
  await window.app.ipc.invoke(IpcEvent.deleteStoreValue, ElectronStorageItem.updateDownloadedVersion)
}
