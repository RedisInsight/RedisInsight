import { IpcInvokeEvent } from '../constants'

export const ipcAuthGoogle = async () => {
  const appVersion = await window.app?.ipc?.invoke(IpcInvokeEvent.getAppVersion)
  console.log('google', { appVersion })
}
export const ipcAuthGithub = async () => {
  const appVersion = await window.app?.ipc?.invoke(IpcInvokeEvent.getAppVersion)
  console.log('github', { appVersion })
}
