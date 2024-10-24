import log from 'electron-log'
import getPort, { portNumbers } from 'get-port'

import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

import { getWindows } from '../window'

import { importApiModule } from 'desktopSrc/api-imports'

const { default: server } = importApiModule('dist/src/main')
const { AbstractWindowAuthStrategy } = importApiModule('dist/src/modules/auth/window-auth/strategies/abstract.window.auth.strategy')

const port = config.defaultPort

export class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
  async isAuthorized(id: string): Promise<boolean> {
    return getWindows()?.has(id)
  }
}

let gracefulShutdown: Function
let beApp: any
export const launchApiServer = async () => {
  try {
    const detectPortConst = await getPort({ port: portNumbers(port, port + 1_000) })
    process.env.RI_APP_PORT = detectPortConst?.toString()

    if (process.env.APPIMAGE) {
      process.env.BUILD_PACKAGE = 'appimage'
    }

    log.info('Available port:', detectPortConst)

    const { gracefulShutdown: gracefulShutdownFn, app: apiApp } = await server(detectPortConst)
    gracefulShutdown = gracefulShutdownFn
    beApp = apiApp

    const winAuthService = beApp?.select?.(WindowAuthModule).get?.(WindowAuthService)
    winAuthService.setStrategy(new ElectronWindowAuthStrategy())
  } catch (_err) {
    const error = _err as Error
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error))
  }
}

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp
