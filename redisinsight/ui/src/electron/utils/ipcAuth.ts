import { CloudAuthSocial, IpcInvokeEvent } from '../constants'

export const ipcAuthGoogle = async (action: string) => {
  await window.app?.ipc?.invoke(
    IpcInvokeEvent.cloudOauth,
    { strategy: CloudAuthSocial.Google, action }
  )
}
export const ipcAuthGithub = async (action: string) => {
  await window.app?.ipc?.invoke(
    IpcInvokeEvent.cloudOauth,
    { strategy: CloudAuthSocial.Github, action }
  )
}
