import { contextBridge, ipcRenderer } from 'electron'
import { configRenderer as config } from 'desktopSrc/config/configRenderer'
import { IpcInvokeEvent, IpcOnEvent } from 'uiSrc/electron/constants'
import { WindowApp } from 'uiSrc/types'

const ipcHandler = {
  invoke: (channel: IpcInvokeEvent, data?: any) => {
    // whitelist channels
    if (Object.values(IpcInvokeEvent).includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }

    return new Error('channel is not allowed')
  }
}

contextBridge.exposeInMainWorld('app', {
  // Send data from main to render
  sendWindowId: ((callback: any) => {
    console.log('[Preload] Setting up window ID listener');
    return ipcRenderer.on(IpcOnEvent.sendWindowId, (event, windowId) => {
      console.log('[Preload] Received window ID:', windowId);
      callback(event, windowId);
    });
  }),
  cloudOauthCallback: ((connected: any) => {
    return ipcRenderer.on(IpcOnEvent.cloudOauthCallback, connected);
  }),
  deepLinkAction: ((parsedDeepLink: any) => {
    return ipcRenderer.on(IpcOnEvent.deepLinkAction, parsedDeepLink)
  }),
  updateAvailable: ((updateInfo: any) => {
    return ipcRenderer.on(IpcOnEvent.appUpdateAvailable, updateInfo)
  }),
  ipc: ipcHandler,
  config: {
    apiPort: config.apiPort
  }
} as WindowApp)

contextBridge.exposeInMainWorld('electron', {
  // Expose any APIs you need here
})

export type IPCHandler = typeof ipcHandler
