import log from 'electron-log'
import { UpdateDownloadedEvent, autoUpdater } from 'electron-updater'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getWindows } from 'desktopSrc/lib/window'
import { IpcOnEvent } from 'uiSrc/electron/constants'

export const updateDownloaded = (updateInfo: UpdateDownloadedEvent) => {
  setTimeout(() => {
    const [currentWindow] = getWindows().values()

    currentWindow?.webContents.send(IpcOnEvent.appUpdateAvailable, updateInfo)
  }, 60 * 1_000) // 1 min
}

export const checkForUpdate = async (url: string = '') => {
  if (!url || process.mas) {
    return
  }

  log.info('AppUpdater initialization')
  log.transports.file.level = 'info'

  try {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url
    })
  } catch (_err) {
    const error = _err as Error
    log.error(wrapErrorMessageSensitiveData(error))
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  await autoUpdater.checkForUpdates()
}

export const quitAndInstallUpdate = () => {
  autoUpdater.quitAndInstall()
}
