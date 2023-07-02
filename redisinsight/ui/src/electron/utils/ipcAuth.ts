import { IpcInvokeEvent } from '../constants'

export const ipcAuthGoogle = async () => {
  const appVersion = await window.app?.ipc?.invoke(IpcInvokeEvent.cloudOauth, 'google')
  console.log('google', { appVersion })
}
export const ipcAuthGithub = async () => {
  const appVersion = await window.app?.ipc?.invoke(IpcInvokeEvent.cloudOauth, 'github')
  console.log('github', { appVersion })
}
