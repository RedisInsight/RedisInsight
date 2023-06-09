/* eslint global-require: off, no-console: off */
import { app, nativeTheme } from 'electron'

import { initHandlers } from 'desktopSrc/handlers'
import { initLogging } from 'desktopSrc/lib/logging'
import { launchApiServer } from 'desktopSrc/services'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { createSplashScreen, createWindow } from 'desktopSrc/window'
import { AboutPanelOptions, checkForUpdate, installExtensions, initTray } from 'desktopSrc/lib'
import config from 'desktopSrc/config'

if (process.env.NODE_ENV !== 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const init = async () => {
  await launchApiServer()
  initLogging()
  initHandlers()
  initTray()

  nativeTheme.themeSource = config.themeSource

  const upgradeUrl = process.env.MANUAL_UPGRADES_LINK || process.env.UPGRADES_LINK

  if (upgradeUrl && !process.mas) {
    checkForUpdate(upgradeUrl)
  }

  app.setName(config.name)
  app.setAppUserModelId(config.name)
  if (process.platform !== 'darwin') {
    app.setAboutPanelOptions(AboutPanelOptions)
  }

  if (process.env.NODE_ENV !== 'production') {
    await installExtensions()
  }

  app
    .whenReady()
    .then(createSplashScreen)
    .then(createWindow)
    .catch((e) => console.log(wrapErrorMessageSensitiveData(e)))
}

export default init
