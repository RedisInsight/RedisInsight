/* eslint global-require: off, no-console: off */
import { app, nativeTheme } from 'electron'

import {
  initElectronHandlers,
  initLogging,
  WindowType,
  windowFactory,
  AboutPanelOptions,
  checkForUpdate,
  installExtensions,
  initTray,
  initAutoUpdaterHandlers,
  launchApiServer
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

if (!config.isProduction) {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const init = async () => {
  await launchApiServer()
  initLogging()
  initElectronHandlers()
  initAutoUpdaterHandlers()
  initTray()

  nativeTheme.themeSource = config.themeSource

  checkForUpdate(process.env.MANUAL_UPGRADES_LINK || process.env.UPGRADES_LINK)

  app.setName(config.name)
  app.setAppUserModelId(config.name)
  if (process.platform !== 'darwin') {
    app.setAboutPanelOptions(AboutPanelOptions)
  }

  await installExtensions()

  try {
    await app.whenReady()
    const splashWindow = await windowFactory(WindowType.Splash)
    await windowFactory(WindowType.Main, splashWindow)
  } catch (_err) {
    const error = _err as Error
    console.log(wrapErrorMessageSensitiveData(error))
  }
}

export default init
