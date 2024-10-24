import log from 'electron-log'
import getPort, { portNumbers } from 'get-port'

import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

import { getWindows } from '../window'

import { importApiModule } from '../../api-imports';

let gracefulShutdown: Function
let beApp: any

export function createApiServer() {
  return {
    async launch() {
      try {
        // Only import API modules when launching the server
        const { WindowAuthModule } = importApiModule('modules/auth/window-auth/window-auth.module');
        const { WindowAuthService } = importApiModule('modules/auth/window-auth/window-auth.service');
        const server = importApiModule('main');
        const { AbstractWindowAuthStrategy } = importApiModule('modules/auth/window-auth/strategies/abstract.window.auth.strategy');

        class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
          async isAuthorized(id: string): Promise<boolean> {
            return getWindows()?.has(id);
          }
        }

        const detectPortConst = await getPort({ port: portNumbers(config.appPort, config.appPort + 1_000) })
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
    },
    shutdown() {
      if (gracefulShutdown) {
        gracefulShutdown();
      }
    }
  }
}

export const getBackendGracefulShutdown = () => gracefulShutdown?.()
export const getBackendApp = () => beApp
