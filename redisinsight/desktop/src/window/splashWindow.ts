import { BrowserWindow } from 'electron'
import { resolveHtmlPath } from 'desktopSrc/utils'
import config from 'desktopSrc/config'

export const createSplashScreen = async () => {
  const splash = new BrowserWindow({
    ...config.splashWindow,
    webPreferences: {
      ...config.splashWindow.webPreferences,
      preload: config.preloadPath,
    }
  })

  splash.loadURL(resolveHtmlPath('splash.html'))

  return splash
}
