import { BrowserWindow } from 'electron'
import { getAssetPath, resolveHtmlPath } from 'desktopSrc/utils'
import config from 'desktopSrc/config'

export const TITLE_SPLASH = 'RedisInsight'
export const createSplashScreen = async () => {
  const splash = new BrowserWindow({
    ...config.splashWindow,
    title: TITLE_SPLASH,
    icon: getAssetPath('icon.png')
  })

  splash.loadURL(resolveHtmlPath('splash.html'))

  return splash
}
