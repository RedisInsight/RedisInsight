import detectPort from 'detect-port'
import log from 'electron-log'

import { configMain as config } from 'desktopSrc/config'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

import { AbstractWindowAuthStrategy } from 'apiSrc/modules/auth/window-auth/strategies/abstract.window.auth.strategy'
import { IWindowAuthStrategyData } from 'apiSrc/modules/auth/window-auth/window.auth.strategy.interface'
import { getWindows } from '../window'

import { WindowAuthModule } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.module'
import { WindowAuthManager } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.manager'
import server from '../../../../api/dist/src/main'

const port = config.defaultPort

export class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
  async isWindowExists(id: string): Promise<IWindowAuthStrategyData> {
    return { isExists: getWindows()?.has(id) }
  }
}

let backendGracefulShutdown: Function
export const launchApiServer = async () => {
  try {
    const detectPortConst = await detectPort(port)
    process.env.API_PORT = detectPortConst?.toString()
    log.info('Available port:', detectPortConst)
    const { gracefulShutdown: beGracefulShutdown, app: beApp } = await server()
    backendGracefulShutdown = beGracefulShutdown

    const winAuthService = beApp?.select?.(WindowAuthModule).get?.(WindowAuthManager)
    winAuthService.setStrategy(new ElectronWindowAuthStrategy())
  } catch (_err) {
    const error = _err as Error
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error))
  }
}

export const getBackendGracefulShutdown = () => backendGracefulShutdown?.()
