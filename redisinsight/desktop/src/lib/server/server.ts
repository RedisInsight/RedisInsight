import detectPort from 'detect-port'
import log from 'electron-log'

import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

import { AbstractWindowAuthStrategy } from 'apiSrc/modules/auth/window-auth/strategies/abstract.window.auth.strategy'
import { getWindows } from '../window'

import { WindowAuthModule } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.module'
import { WindowAuthService } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.service'
import server from '../../../../api/dist/src/main'

const port = config.defaultPort

export class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
  async isWindowExists(id: string): Promise<boolean> {
    return getWindows()?.has(id)
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

    const winAuthService = beApp?.select?.(WindowAuthModule).get?.(WindowAuthService)
    winAuthService.setStrategy(new ElectronWindowAuthStrategy())
  } catch (_err) {
    const error = _err as Error
    log.error('Catch server error:', wrapErrorMessageSensitiveData(error))
  }
}

export const getBackendGracefulShutdown = () => backendGracefulShutdown?.()
