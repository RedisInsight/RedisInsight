/* eslint global-require: off, no-console: off */
import { app, nativeTheme } from 'electron'
import path from 'path'
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
  launchApiServer,
  initCloudHandlers,
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'
import { deepLinkHandler } from 'desktopSrc/lib/app/deep-link.handlers'

if (!config.isProduction) {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const gotTheLock = app.requestSingleInstanceLock()

// deep link open (win)
if (!gotTheLock) {
  app.quit()
}

const init = async () => {
  await launchApiServer()
  initLogging()
  initElectronHandlers()
  initAutoUpdaterHandlers()
  initTray()
  initCloudHandlers()

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

    const deepLink = process.argv?.[1]

    // deep linking
    // register our application to handle custom protocol
    if (process.defaultApp) {
      if (deepLink) {
        app.setAsDefaultProtocolClient(config.schema, process.execPath, [path.resolve(deepLink)])
      }
    } else {
      app.setAsDefaultProtocolClient(config.schema)
    }

    const splashWindow = await windowFactory(WindowType.Splash)

    let parsedDeepLink

    if (deepLink) {
      parsedDeepLink = await deepLinkHandler(deepLink)
    }

    await windowFactory(WindowType.Main, splashWindow, { parsedDeepLink })
  } catch (_err) {
    const error = _err as Error
    console.log(wrapErrorMessageSensitiveData(error))
  }
}

export default init
