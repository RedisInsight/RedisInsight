import { contextBridge, ipcRenderer } from 'electron'
import { configRenderer as config } from 'desktopSrc/config/configRenderer'
import { IpcEvent } from 'uiSrc/electron/constants'
import { WindowApp } from 'uiSrc/types'

const ipcHandler = {
  invoke: (channel: IpcEvent, data?: any) => {
    // whitelist channels
    if (Object.values(IpcEvent).includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }

    return new Error('channel is not allowed')
  }
}

contextBridge.exposeInMainWorld('app', {
  ipc: ipcHandler,
  config: {
    apiPort: config.apiPort
  }
} as WindowApp)

export type IPCHandler = typeof ipcHandler
