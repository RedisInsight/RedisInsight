import { app } from 'electron'
import log from 'electron-log'
import { getBackendGracefulShutdown, WindowType, getWindows, windowFactory, windows } from 'desktopSrc/lib'
import { cloudOauthCallback } from 'desktopSrc/lib/cloud/cloud-oauth.handlers'

export const initAppHandlers = () => {
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (getWindows()?.size === 0) windowFactory(WindowType.Main)
  })

  app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
    // Skip error due to self-signed certificate
    event.preventDefault()
    callback(true)
  })

  app.on('window-all-closed', () => {
    log.info('window-all-closed')
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('continue-activity-error', (event, type, error) => {
    log.info('event', event)
    log.info('type', type)
    log.info('error', error)
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('quit', () => {
    try {
      getBackendGracefulShutdown?.()
    } catch (e) {
      // ignore any error
    }
  })

  // deep link open (unix)
  app.on('open-url', async (event, url) => {
    event.preventDefault()
    // todo: implement url handler to map url to a proper function
    await cloudOauthCallback(url)
  })

  // deep link open (win)
  app.on('second-instance', async (_event, commandLine) => {
    await cloudOauthCallback(commandLine?.pop())
    // Someone tried to run a second instance, we should focus our window.
    if (windows.size) {
      const win = windows.values().next().value
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}
