// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { IpcEvent } from 'uiSrc/electron/constants';

const electronHandler = {
  ipcRenderer: {
    invoke: (channel: IpcEvent, data?: any) => {
      // whitelist channels
      if (Object.values(IpcEvent).includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }

      return new Error('channel is not allowed');
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

contextBridge.exposeInMainWorld('envVariables', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_ENV: process.env.APP_ENV,
  API_PREFIX: process.env.API_PREFIX,
  API_PORT: process.env.API_PORT,
  BASE_API_URL: process.env.BASE_API_URL,
  RESOURCES_BASE_URL: process.env.RESOURCES_BASE_URL,
  PIPELINE_COUNT_DEFAULT: process.env.PIPELINE_COUNT_DEFAULT,
  SCAN_COUNT_DEFAULT: process.env.SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT: process.env.SCAN_TREE_COUNT_DEFAULT,
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  CONNECTIONS_TIMEOUT_DEFAULT: process.env.CONNECTIONS_TIMEOUT_DEFAULT,
});

export type ElectronHandler = typeof electronHandler;
