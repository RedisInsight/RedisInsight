import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

export const checkForUpdate = (url: string = '') => {
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

  autoUpdater.checkForUpdatesAndNotify()
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
}
