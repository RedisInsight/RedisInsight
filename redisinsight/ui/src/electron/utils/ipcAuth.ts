import { IpcEvent } from '../constants'

export const ipcAuthGoogle = async () => {
  const appVersion = await window.app?.ipc?.invoke(IpcEvent.getAppVersion)
  console.log('google', { appVersion })
}
export const ipcAuthGithub = async () => {
  const appVersion = await window.app?.ipc?.invoke(IpcEvent.getAppVersion)
  console.log('github', { appVersion })
}
