import { CloudAuthSocial, IpcInvokeEvent } from '../constants'

export const ipcAuthGoogle = async () => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.cloudOauth, CloudAuthSocial.Google)
}
export const ipcAuthGithub = async () => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.cloudOauth, CloudAuthSocial.Github)
}
