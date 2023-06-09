import { contextBridge, ipcRenderer } from 'electron'
import { IpcEvent } from 'uiSrc/electron/constants'

const electronHandler = {
  ipcRenderer: {
    invoke: (channel: IpcEvent, data?: any) => {
      // whitelist channels
      if (Object.values(IpcEvent).includes(channel)) {
        return ipcRenderer.invoke(channel, data)
      }

      return new Error('channel is not allowed')
    }
  }
}

contextBridge.exposeInMainWorld('electron', electronHandler)

contextBridge.exposeInMainWorld('ENV_VARS', {
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: process.env.API_PORT
})

export type ElectronHandler = typeof electronHandler
